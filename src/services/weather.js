const OW_KEY = import.meta.env.VITE_OPENWEATHER_KEY;

function hasWeatherKey() {
  return Boolean(OW_KEY) && !OW_KEY.startsWith('get_free_key');
}

function formatForecastDay(timestamp) {
  return new Date(timestamp * 1000).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

function pickRepresentativeSlot(dayBucket, slot) {
  const slotHour = new Date(slot.dt * 1000).getHours();
  const distanceFromNoon = Math.abs(slotHour - 12);

  if (dayBucket.bestHourDistance === null || distanceFromNoon < dayBucket.bestHourDistance) {
    dayBucket.bestHourDistance = distanceFromNoon;
    dayBucket.condition = slot.weather?.[0]?.main ?? 'Clouds';
    dayBucket.icon = slot.weather?.[0]?.icon ?? '04d';
  }
}

function groupForecastByDay(list = []) {
  const days = {};

  list.forEach((slot) => {
    const dayKey = new Date(slot.dt * 1000).toISOString().slice(0, 10);

    if (!days[dayKey]) {
      days[dayKey] = {
        day: formatForecastDay(slot.dt),
        dateKey: dayKey,
        rainMM: 0,
        maxTemp: -Infinity,
        minTemp: Infinity,
        condition: 'Clouds',
        icon: '04d',
        bestHourDistance: null,
      };
    }

    days[dayKey].rainMM += slot.rain?.['3h'] || 0;
    days[dayKey].maxTemp = Math.max(days[dayKey].maxTemp, slot.main?.temp_max ?? slot.main?.temp ?? 0);
    days[dayKey].minTemp = Math.min(days[dayKey].minTemp, slot.main?.temp_min ?? slot.main?.temp ?? 0);
    pickRepresentativeSlot(days[dayKey], slot);
  });

  return Object.values(days)
    .slice(0, 7)
    .map((day) => ({
      day: day.day,
      dateKey: day.dateKey,
      rainMM: Number(day.rainMM.toFixed(1)),
      maxTemp: Math.round(day.maxTemp),
      minTemp: Math.round(day.minTemp),
      condition: day.condition,
      icon: day.icon,
    }));
}

function getMockForecastDay(offset, config) {
  const date = new Date();
  date.setDate(date.getDate() + offset);

  return {
    day: date.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }),
    dateKey: date.toISOString().slice(0, 10),
    rainMM: config.rainMM,
    maxTemp: config.maxTemp,
    minTemp: config.minTemp,
    condition: config.condition,
    icon: config.icon,
  };
}

function getMockWeather() {
  const mockForecast = [
    getMockForecastDay(0, { rainMM: 0, maxTemp: 31, minTemp: 24, condition: 'Clouds', icon: '04d' }),
    getMockForecastDay(1, { rainMM: 3.2, maxTemp: 30, minTemp: 23, condition: 'Rain', icon: '10d' }),
    getMockForecastDay(2, { rainMM: 8.1, maxTemp: 29, minTemp: 22, condition: 'Rain', icon: '10d' }),
    getMockForecastDay(3, { rainMM: 1.4, maxTemp: 32, minTemp: 24, condition: 'Clouds', icon: '03d' }),
    getMockForecastDay(4, { rainMM: 0, maxTemp: 33, minTemp: 24, condition: 'Clear', icon: '01d' }),
  ];

  return {
    current: {
      temp: 28,
      feelsLike: 31,
      humidity: 65,
      windSpeed: 3.2,
      cloudCover: 68,
      condition: 'Clouds',
      conditionCode: 803,
      description: 'broken clouds',
      icon: '04d',
      pressure: 1012,
      visibility: 6000,
    },
    rainfall: {
      todayMM: mockForecast[0]?.rainMM ?? 0,
      next7DaysMM: mockForecast.reduce((sum, day) => sum + day.rainMM, 0),
      rainForecast: mockForecast.map((day) => ({
        day: day.day,
        rainMM: day.rainMM,
        willRain: day.rainMM > 1,
      })),
    },
    forecast: mockForecast,
    raw: null,
    isMock: true,
  };
}

export async function fetchWeatherAndRain(lat, lon) {
  if (!hasWeatherKey()) {
    console.info('[Weather] Missing OpenWeatherMap key — using mock weather');
    return getMockWeather();
  }

  try {
    const [currentRes, forecastRes] = await Promise.all([
      fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OW_KEY}&units=metric`,
      ),
      fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OW_KEY}&units=metric`,
      ),
    ]);

    if (!currentRes.ok || !forecastRes.ok) {
      throw new Error(`Weather API error: ${currentRes.status}/${forecastRes.status}`);
    }

    const current = await currentRes.json();
    const forecast = await forecastRes.json();

    if (!Array.isArray(forecast.list)) {
      throw new Error('Forecast response missing time-series data');
    }

    const rainfallNext7Days = forecast.list
      .slice(0, 56)
      .reduce((sum, slot) => sum + (slot.rain?.['3h'] || 0), 0);

    const dailyForecast = groupForecastByDay(forecast.list);

    return {
      current: {
        temp: current.main?.temp ?? null,
        feelsLike: current.main?.feels_like ?? null,
        humidity: current.main?.humidity ?? null,
        windSpeed: current.wind?.speed ?? null,
        cloudCover: current.clouds?.all ?? null,
        condition: current.weather?.[0]?.main ?? 'Unknown',
        conditionCode: current.weather?.[0]?.id ?? null,
        description: current.weather?.[0]?.description ?? 'Unavailable',
        icon: current.weather?.[0]?.icon ?? '04d',
        pressure: current.main?.pressure ?? null,
        visibility: current.visibility ?? null,
      },
      rainfall: {
        todayMM: dailyForecast[0]?.rainMM ?? 0,
        next7DaysMM: Number(rainfallNext7Days.toFixed(1)),
        rainForecast: dailyForecast.map((day) => ({
          day: day.day,
          rainMM: day.rainMM,
          willRain: day.rainMM > 1,
        })),
      },
      forecast: dailyForecast,
      raw: forecast,
      isMock: false,
    };
  } catch (err) {
    console.error('[Weather] Error:', err);
    return getMockWeather();
  }
}

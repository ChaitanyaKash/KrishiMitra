function getCurrentHourlyIndex(times = []) {
  if (!Array.isArray(times) || times.length === 0) {
    return 0;
  }

  const now = Date.now();

  return times.reduce(
    (bestIndex, time, index) => {
      const diff = Math.abs(new Date(time).getTime() - now);
      if (diff < bestIndex.diff) {
        return { index, diff };
      }
      return bestIndex;
    },
    { index: 0, diff: Infinity },
  ).index;
}

function interpretSoilMoisture(value) {
  if (value === null || value === undefined) {
    return { status: 'Unknown', advice: 'Could not read soil moisture.' };
  }

  if (value < 0.15) {
    return {
      status: 'Critically Dry',
      advice: 'Irrigate immediately — soil is severely dry. Risk of crop wilting.',
    };
  }

  if (value < 0.25) {
    return {
      status: 'Dry',
      advice: 'Schedule irrigation within 24 hours. Crops may show stress soon.',
    };
  }

  if (value <= 0.4) {
    return {
      status: 'Adequate',
      advice: 'Soil moisture is in the healthy range. Monitor over next 2 days.',
    };
  }

  return {
    status: 'Waterlogged',
    advice: 'Excess moisture detected. Pause irrigation. Check drainage channels.',
  };
}

export async function fetchSoilData(lat, lon) {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
        '&hourly=soil_moisture_0_1cm,soil_temperature_0cm,evapotranspiration' +
        '&daily=precipitation_sum,et0_fao_evapotranspiration' +
        '&timezone=Asia%2FKolkata&forecast_days=7',
    );

    if (!res.ok) {
      throw new Error(`Soil API error: ${res.status}`);
    }

    const data = await res.json();
    const currentIndex = getCurrentHourlyIndex(data.hourly?.time);
    const soilMoisture = data.hourly?.soil_moisture_0_1cm?.[currentIndex];
    const soilTemp = data.hourly?.soil_temperature_0cm?.[currentIndex];
    const evapotranspiration = data.hourly?.evapotranspiration?.[currentIndex];

    const rainfallForecast = (data.daily?.precipitation_sum ?? []).map((val, index) => ({
      day: new Date(data.daily?.time?.[index] ?? Date.now() + index * 86400000).toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
      }),
      mm: Number((val || 0).toFixed(1)),
    }));

    return {
      soilMoisture: soilMoisture !== undefined && soilMoisture !== null ? Number(soilMoisture.toFixed(3)) : null,
      soilMoisturePercent:
        soilMoisture !== undefined && soilMoisture !== null ? Math.round(soilMoisture * 100) : null,
      soilTemp: soilTemp !== undefined && soilTemp !== null ? Number(soilTemp.toFixed(1)) : null,
      evapotranspiration:
        evapotranspiration !== undefined && evapotranspiration !== null
          ? Number(evapotranspiration.toFixed(2))
          : null,
      rainfallForecast,
      totalRainfall7Days: Number(
        rainfallForecast.reduce((sum, day) => sum + day.mm, 0).toFixed(1),
      ),
      interpretation: interpretSoilMoisture(soilMoisture),
      raw: data,
      isMock: false,
    };
  } catch (err) {
    console.error('[Soil] Error:', err);
    return {
      soilMoisture: 0.28,
      soilMoisturePercent: 28,
      soilTemp: 24,
      evapotranspiration: 3.2,
      rainfallForecast: [],
      totalRainfall7Days: 8.4,
      interpretation: { status: 'Adequate', advice: 'Soil moisture levels are normal.' },
      raw: null,
      isMock: true,
    };
  }
}

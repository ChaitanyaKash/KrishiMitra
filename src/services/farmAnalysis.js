import { analyzeNDVI } from './vedas';
import { fetchWeatherAndRain } from './weather';
import { fetchAQI } from './aqi';
import { fetchSoilData } from './soil';

function scoreNDVI(ndvi) {
  if (!ndvi) return 50;
  if (ndvi >= 0.7) return 100;
  if (ndvi >= 0.5) return 80;
  if (ndvi >= 0.3) return 50;
  return 20;
}

function scoreSoilMoisture(moisture) {
  if (!moisture) return 50;
  if (moisture >= 0.25 && moisture <= 0.4) return 100;
  if (moisture >= 0.15 && moisture < 0.25) return 60;
  if (moisture > 0.4) return 65;
  return 20;
}

function scoreRainfall(rainfall) {
  if (!rainfall) return 50;
  const mm = rainfall.next7DaysMM;
  if (mm >= 5 && mm <= 40) return 100;
  if (mm > 40) return 60;
  if (mm >= 1) return 75;
  return 40;
}

function scoreWeather(current) {
  if (!current) return 50;

  let score = 100;

  if (current.temp > 42 || current.temp < 10) score -= 40;
  else if (current.temp > 38 || current.temp < 15) score -= 20;

  if (current.humidity > 90) score -= 15;
  if (current.windSpeed > 10) score -= 10;

  return Math.max(0, score);
}

function scoreAQI(aqi) {
  if (!aqi) return 80;
  if (aqi <= 50) return 100;
  if (aqi <= 100) return 80;
  if (aqi <= 150) return 60;
  if (aqi <= 200) return 35;
  return 15;
}

function detectRisks(ndvi, weather, aqi, soil) {
  const risks = [];

  if (ndvi?.latestNDVI < 0.3) {
    risks.push({
      id: 'ndvi_critical',
      severity: 'critical',
      icon: '🌿',
      title: 'Severe Crop Stress',
      detail: 'NDVI below 0.3 — crops need immediate inspection',
    });
  }

  if (soil?.soilMoisture < 0.15) {
    risks.push({
      id: 'drought',
      severity: 'critical',
      icon: '💧',
      title: 'Drought Risk',
      detail: 'Soil moisture critically low — irrigate within 6 hours',
    });
  }

  if (soil?.soilMoisture > 0.45) {
    risks.push({
      id: 'waterlog',
      severity: 'warning',
      icon: '🌊',
      title: 'Waterlogging Risk',
      detail: 'Excess soil moisture can cause root rot',
    });
  }

  if (weather?.current?.humidity > 85 && weather?.current?.temp > 25) {
    risks.push({
      id: 'fungal',
      severity: 'warning',
      icon: '🍄',
      title: 'High Fungal Disease Risk',
      detail: `Humidity ${weather.current.humidity}% + temp ${weather.current.temp}°C — ideal for fungal spread`,
    });
  }

  if (weather?.current?.temp > 40) {
    risks.push({
      id: 'heat',
      severity: 'warning',
      icon: '🌡️',
      title: 'Heat Stress Alert',
      detail: `Temperature ${weather.current.temp}°C — consider shade nets or extra irrigation`,
    });
  }

  const rainNext3Days =
    weather?.rainfall?.rainForecast?.slice(0, 3).reduce((sum, day) => sum + day.rainMM, 0) || 0;

  if (rainNext3Days > 30) {
    risks.push({
      id: 'heavy_rain',
      severity: 'warning',
      icon: '⛈️',
      title: 'Heavy Rain Forecast',
      detail: `${rainNext3Days.toFixed(1)}mm expected in 3 days — check drainage`,
    });
  }

  if (aqi?.aqi > 150) {
    risks.push({
      id: 'aqi',
      severity: 'info',
      icon: '💨',
      title: 'Poor Air Quality',
      detail: `AQI ${aqi.aqi} — dust/pollutants may reduce photosynthesis`,
    });
  }

  const severityOrder = { critical: 0, warning: 1, info: 2 };
  return risks.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}

function generateRecommendations(risks, scores, ndvi, weather, soil) {
  const recommendations = [];

  if (scores.soil < 60) {
    const rainComing = weather?.rainfall?.rainForecast?.[0]?.willRain || false;

    recommendations.push({
      priority: 1,
      icon: '💧',
      title: rainComing ? 'Hold irrigation — rain forecast tomorrow' : 'Irrigate today',
      detail: rainComing
        ? "Rain expected tomorrow. Save water and skip today's irrigation."
        : `Soil moisture at ${soil?.soilMoisturePercent || '?'}%. Run drip system for 45 minutes.`,
    });
  }

  if (weather?.current?.windSpeed < 5 && weather?.current?.humidity < 80 && weather?.current?.temp < 35) {
    recommendations.push({
      priority: 2,
      icon: '🌿',
      title: 'Good conditions to spray today',
      detail: `Wind ${weather.current.windSpeed}m/s, humidity ${weather.current.humidity}% — ideal spray window. Best time: 6–9 AM.`,
    });
  } else if (
    weather?.current?.windSpeed > 8 ||
    weather?.current?.humidity > 80 ||
    weather?.current?.temp > 35
  ) {
    recommendations.push({
      priority: 2,
      icon: '🚫',
      title: 'Avoid spraying today',
      detail: `Wind ${weather.current.windSpeed}m/s, humidity ${weather.current.humidity}%, temp ${weather.current.temp}°C — wait for a cooler, calmer spray window.`,
    });
  }

  if (weather?.current?.humidity > 80) {
    recommendations.push({
      priority: 3,
      icon: '🍄',
      title: 'Apply preventive fungicide',
      detail: 'High humidity increases fungal risk. Apply Mancozeb or Copper Oxychloride as a preventive measure.',
    });
  }

  if (weather?.current?.temp > 38) {
    recommendations.push({
      priority: 3,
      icon: '☀️',
      title: 'Protect crops from heat',
      detail: 'Use mulching to retain soil moisture. Irrigate in early morning or evening only.',
    });
  }

  if (ndvi?.latestNDVI && ndvi.latestNDVI < 0.5) {
    recommendations.push({
      priority: 2,
      icon: '🛰️',
      title: 'Inspect the weakest patch in your field',
      detail: 'NDVI is below the healthy range. Walk the field and check for nutrient or pest stress in low-vigor patches.',
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      priority: 3,
      icon: '✅',
      title: 'Farm looks stable today',
      detail: 'No urgent action is needed right now. Continue routine scouting and re-check tomorrow morning.',
    });
  }

  return recommendations.sort((a, b) => a.priority - b.priority);
}

function getIrrigationAdvice(soil, weather) {
  const rainTomorrow = weather?.rainfall?.rainForecast?.[1]?.willRain || false;
  const mm = weather?.rainfall?.rainForecast?.[1]?.rainMM || 0;

  if (rainTomorrow && mm > 5) {
    return {
      action: 'skip',
      message: `Skip irrigation — ${mm.toFixed(1)}mm rain expected tomorrow`,
      color: 'blue',
      icon: '🌧️',
    };
  }

  if (soil?.soilMoisture < 0.2) {
    return {
      action: 'irrigate_now',
      message: 'Irrigate today — soil moisture critically low',
      color: 'red',
      icon: '🚨',
    };
  }

  if (soil?.soilMoisture < 0.28) {
    return {
      action: 'irrigate_soon',
      message: 'Irrigate within 24 hours — moisture dropping',
      color: 'amber',
      icon: '⚠️',
    };
  }

  if (soil?.soilMoisture == null) {
    return {
      action: 'unknown',
      message: 'Soil moisture unavailable — inspect field before irrigating',
      color: 'gray',
      icon: 'ℹ️',
    };
  }

  return {
    action: 'hold',
    message: 'No irrigation needed today — soil moisture adequate',
    color: 'green',
    icon: '✅',
  };
}

function getSprayWindow(weather) {
  if (!weather?.current) {
    return {
      isGood: false,
      bestTime: '6:00 AM – 9:00 AM',
      conditions: 'Live weather unavailable',
      advice: 'Unable to verify spray conditions. Check local weather before spraying.',
    };
  }

  const { windSpeed, humidity, temp } = weather.current;
  const isGood = windSpeed < 5 && humidity < 80 && temp < 35;

  return {
    isGood,
    bestTime: '6:00 AM – 9:00 AM',
    conditions: `Wind: ${windSpeed}m/s | Humidity: ${humidity}% | Temp: ${temp}°C`,
    advice: isGood
      ? '✅ Good spray window today — low wind, acceptable humidity'
      : '⚠️ Poor spray conditions — high wind or humidity. Wait for better window.',
  };
}

function getOverallStatus(score) {
  if (score >= 80) return { label: 'Excellent', color: 'green', emoji: '🌟' };
  if (score >= 65) return { label: 'Good', color: 'green', emoji: '✅' };
  if (score >= 45) return { label: 'Fair', color: 'amber', emoji: '⚠️' };
  if (score >= 25) return { label: 'Poor', color: 'red', emoji: '🚨' };
  return { label: 'Critical', color: 'red', emoji: '🆘' };
}

function getSourceMode(value, mockFlag) {
  if (!value) return 'unavailable';
  return value[mockFlag] ? 'mock' : 'live';
}

export async function generateFarmReport(lat, lon) {
  const [ndvi, weather, aqi, soil] = await Promise.allSettled([
    analyzeNDVI(lat, lon),
    fetchWeatherAndRain(lat, lon),
    fetchAQI(lat, lon),
    fetchSoilData(lat, lon),
  ]);

  const ndviData = ndvi.status === 'fulfilled' ? ndvi.value : null;
  const weatherData = weather.status === 'fulfilled' ? weather.value : null;
  const aqiData = aqi.status === 'fulfilled' ? aqi.value : null;
  const soilData = soil.status === 'fulfilled' ? soil.value : null;

  const scores = {
    ndvi: scoreNDVI(ndviData?.latestNDVI),
    soil: scoreSoilMoisture(soilData?.soilMoisture),
    rain: scoreRainfall(weatherData?.rainfall),
    weather: scoreWeather(weatherData?.current),
    aqi: scoreAQI(aqiData?.aqi),
  };

  const overallScore = Math.round(
    scores.ndvi * 0.35 +
      scores.soil * 0.25 +
      scores.rain * 0.2 +
      scores.weather * 0.12 +
      scores.aqi * 0.08,
  );

  const risks = detectRisks(ndviData, weatherData, aqiData, soilData);
  const recommendations = generateRecommendations(risks, scores, ndviData, weatherData, soilData);
  const irrigationAdvice = getIrrigationAdvice(soilData, weatherData);
  const sprayWindow = getSprayWindow(weatherData);

  return {
    overallScore,
    overallStatus: getOverallStatus(overallScore),
    scores,
    risks,
    recommendations,
    irrigationAdvice,
    sprayWindow,
    sourceModes: {
      ndvi: getSourceMode(ndviData, 'isMockData'),
      weather: getSourceMode(weatherData, 'isMock'),
      aqi: getSourceMode(aqiData, 'isMock'),
      soil: getSourceMode(soilData, 'isMock'),
    },
    data: {
      ndvi: ndviData,
      weather: weatherData,
      aqi: aqiData,
      soil: soilData,
    },
    generatedAt: new Date().toISOString(),
    coordinates: { lat, lon },
  };
}

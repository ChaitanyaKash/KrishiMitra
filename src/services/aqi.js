const WAQI_KEY = import.meta.env.VITE_WAQI_KEY;

function hasAQIKey() {
  return Boolean(WAQI_KEY) && !WAQI_KEY.startsWith('get_free_key');
}

function getAQILevel(aqi) {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

function getAQICropImpact(aqi) {
  if (aqi <= 50) return 'minimal';
  if (aqi <= 100) return 'low';
  if (aqi <= 150) return 'moderate — check leaf surfaces for dust deposits';
  if (aqi <= 200) return 'high — dust/pollutants reducing photosynthesis';
  return 'severe — crop protection measures recommended';
}

export async function fetchAQI(lat, lon) {
  if (!hasAQIKey()) {
    console.info('[AQI] Missing WAQI key — using mock AQI');
    return {
      aqi: 45,
      level: 'Good',
      dominantPollutant: 'pm25',
      pm25: 18,
      pm10: 32,
      station: 'Nearby station',
      cropImpact: 'minimal',
      isMock: true,
    };
  }

  try {
    const res = await fetch(`https://api.waqi.info/feed/geo:${lat};${lon}/?token=${WAQI_KEY}`);

    if (!res.ok) {
      throw new Error(`AQI API error: ${res.status}`);
    }

    const data = await res.json();

    if (data.status !== 'ok') {
      throw new Error('AQI fetch failed');
    }

    const aqi = data.data?.aqi ?? null;

    return {
      aqi,
      level: getAQILevel(aqi ?? 80),
      dominantPollutant: data.data?.dominentpol ?? data.data?.dominantp ?? 'pm25',
      pm25: data.data?.iaqi?.pm25?.v ?? null,
      pm10: data.data?.iaqi?.pm10?.v ?? null,
      station: data.data?.city?.name || 'Nearby station',
      cropImpact: getAQICropImpact(aqi ?? 80),
      isMock: false,
    };
  } catch (err) {
    console.error('[AQI] Error:', err);
    return {
      aqi: 45,
      level: 'Good',
      dominantPollutant: 'pm25',
      pm25: 18,
      pm10: 32,
      station: 'Nearby station',
      cropImpact: 'minimal',
      isMock: true,
    };
  }
}

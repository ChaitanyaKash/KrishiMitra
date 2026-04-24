const API_KEY = import.meta.env.VITE_VEDAS_API_KEY;

/**
 * Fetch raw NDVI data from VEDAS SAC (ISRO) for a given coordinate.
 * @param {number} lon - Longitude
 * @param {number} lat - Latitude
 * @param {string} fromTime - YYYYMMDD
 * @param {string} toTime - YYYYMMDD
 * @returns {Promise<Array>} Raw VEDAS result array
 */
export async function fetchNDVIRaw(lon, lat, fromTime, toTime) {
  const isDev = import.meta.env.DEV;
  const url = isDev
    ? `/vedas-api/info/?X-API-KEY=${API_KEY}`
    : `https://vedas.sac.gov.in/vapi/ridam_server3/info/?X-API-KEY=${API_KEY}`;

  const payload = {
    layer: 'T5S1I1',
    args: {
      dataset_id: 'T3S1P1',
      from_time: fromTime,
      to_time: toTime,
      param: 'NDVI',
      lon,
      lat,
      filter_nodata: 'no',
      composite: false,
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      Referer: 'https://vedas.sac.gov.in',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`VEDAS API error: ${response.status}`);
  }

  const result = await response.json();
  console.info('[VEDAS] Raw API response:', result.result || []);
  return result.result || [];
}

/**
 * Get date strings for last N days.
 */
function getDateRange(daysBack = 30) {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - daysBack);
  const fmt = (date) => date.toISOString().slice(0, 10).replace(/-/g, '');
  return { fromStr: fmt(from), toStr: fmt(to) };
}

/**
 * Parse raw VEDAS response into clean chart-ready data.
 * Filters out null values, returns array of { date, ndvi } objects.
 */
function parseNDVIData(rawData) {
  return rawData
    .filter(
      (entry) =>
        Array.isArray(entry) &&
        entry.length > 1 &&
        Array.isArray(entry[1]) &&
        entry[1][0] !== null &&
        entry[1][0] !== undefined,
    )
    .map((entry) => {
      const dateObj = new Date(entry[0]);
      const label = dateObj.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
      });
      return {
        date: label,
        ndvi: parseFloat(entry[1][0].toFixed(3)),
        rawDate: dateObj,
      };
    })
    .sort((a, b) => a.rawDate - b.rawDate);
}

/**
 * Translate NDVI value into farmer-friendly insight object.
 */
function interpretNDVI(ndviValue) {
  if (ndviValue === null || ndviValue === undefined) {
    return {
      status: 'Unknown',
      statusColor: 'gray',
      healthPercent: 0,
      explanation: 'We could not retrieve recent satellite data for this location.',
      action: 'Please check your farm manually or try again later.',
      emoji: '❓',
    };
  }

  const healthPercent = Math.min(100, Math.round(ndviValue * 100 * 1.3));

  if (ndviValue >= 0.5) {
    return {
      status: 'Healthy',
      statusColor: 'green',
      healthPercent,
      explanation: 'Your crops appear to be healthy and growing well. Vegetation is dense and active.',
      action: 'Continue your regular farming practices. Next scan in 7 days.',
      emoji: '✅',
    };
  }

  if (ndviValue >= 0.3) {
    return {
      status: 'Moderate Stress',
      statusColor: 'amber',
      healthPercent,
      explanation: 'Crops are showing slight stress, possibly due to low moisture or early pest activity.',
      action: 'Increase irrigation over the next 2–3 days and inspect leaves for pests or yellowing.',
      emoji: '⚠️',
    };
  }

  return {
    status: 'Critical',
    statusColor: 'red',
    healthPercent,
    explanation: 'Your crops are under severe stress and need immediate attention.',
    action: 'Check soil moisture immediately, apply required fertilizers, and consult a local agri expert.',
    emoji: '🚨',
  };
}

/**
 * Main function: fetch + parse + analyze NDVI for a given GPS coordinate.
 * Falls back to mock data if API fails.
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<Object>} Full NDVI analysis result
 */
export async function analyzeNDVI(lat, lon) {
  try {
    const { fromStr, toStr } = getDateRange(30);
    const rawData = await fetchNDVIRaw(lon, lat, fromStr, toStr);
    const chartData = parseNDVIData(rawData);

    if (chartData.length === 0) {
      throw new Error('No valid NDVI data returned');
    }

    const latestNDVI = chartData[chartData.length - 1].ndvi;
    const insight = interpretNDVI(latestNDVI);

    const result = {
      success: true,
      latestNDVI,
      chartData,
      insight,
      dataPoints: chartData.length,
      fromDate: fromStr,
      toDate: toStr,
      coordinates: { lat, lon },
      isMockData: false,
    };

    console.info('[VEDAS] Parsed NDVI analysis:', result);
    return result;
  } catch (err) {
    console.error('[VEDAS] Error:', err.message);
    return {
      success: false,
      latestNDVI: 0.72,
      chartData: [
        { date: '1 Apr', ndvi: 0.65 },
        { date: '8 Apr', ndvi: 0.68 },
        { date: '15 Apr', ndvi: 0.71 },
        { date: '18 Apr', ndvi: 0.72 },
      ],
      insight: interpretNDVI(0.72),
      dataPoints: 4,
      isMockData: true,
      error: err.message,
      fromDate: '20250401',
      toDate: '20250418',
      coordinates: { lat, lon },
    };
  }
}

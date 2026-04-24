// EOSDA Crop Monitoring API integration
// Docs: https://crop-monitoring.eos.com/api/docs/
import { satelliteMockData } from '../data/satelliteMock';

const EOSDA_API_KEY = import.meta.env.VITE_EOSDA_API_KEY || null;
const EOSDA_BASE = "https://api.eos.com/api/gdw/api";

export async function fetchSatelliteData(polygon) {
  if (!EOSDA_API_KEY) {
    console.info("[EOSDA] No API key — using mock data");
    // Simulate network delay
    return new Promise(resolve => {
      setTimeout(() => resolve(satelliteMockData), 500);
    });
  }
  try {
    // Step 1: Create field
    const fieldRes = await fetch(`${EOSDA_BASE}/field/`, {
      method: "POST",
      headers: { "Authorization": `ApiKey ${EOSDA_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ name: "KM Demo Farm", polygon: { type: "Polygon", coordinates: [polygon] } })
    });
    const field = await fieldRes.json();

    // Step 2: Request NDVI stats for last 30 days
    const statsRes = await fetch(`${EOSDA_BASE}/stat/?fields=${field.id}&date_start=${thirtyDaysAgo()}&date_end=${today()}&type=NDVI`, {
      headers: { "Authorization": `ApiKey ${EOSDA_API_KEY}` }
    });
    const stats = await statsRes.json();
    return parseEOSDAResponse(stats) || satelliteMockData;
  } catch (err) {
    console.error("[EOSDA] API error:", err);
    return satelliteMockData;
  }
}

function today() { return new Date().toISOString().split("T")[0]; }
function thirtyDaysAgo() {
  const d = new Date(); d.setDate(d.getDate() - 30);
  return d.toISOString().split("T")[0];
}

function parseEOSDAResponse(stats) {
  // Extract latest NDVI mean from response
  // Return in our internal format
  const latest = stats?.results?.[stats.results.length - 1];
  if (!latest) return null;
  return {
    ndvi: latest.mean,
    healthPercent: Math.round(latest.mean * 100 * 1.15),
    status: latest.mean > 0.6 ? "healthy" : latest.mean > 0.4 ? "stressed" : "critical",
    lastScanDate: latest.date,
  };
}

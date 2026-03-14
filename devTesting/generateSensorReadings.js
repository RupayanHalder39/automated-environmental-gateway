/*
  Dev data generator for Automated Environmental Gateway.
  - Requires backend DEV_MODE=true
  - Sends readings to /api/v1/dev/ingest on an interval

  Usage:
    node devTesting/generateSensorReadings.js

  Env vars:
    DEV_API_BASE_URL=http://localhost:3000/api/v1
    DEV_INTERVAL_MS=5000
    DEV_SENSOR_CODES=SEN-001,SEN-002,SEN-003
*/

const API_BASE_URL = process.env.DEV_API_BASE_URL || "http://localhost:3000/api/v1";
const INTERVAL_MS = Number(process.env.DEV_INTERVAL_MS || 5000);
const SENSOR_CODES = (process.env.DEV_SENSOR_CODES || "SEN-001,SEN-002,SEN-003,SEN-004,SEN-005")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

if (typeof fetch !== "function") {
  console.error("Global fetch is not available. Use Node 18+ or add a fetch polyfill.");
  process.exit(1);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function jitter(base, spread) {
  return base + (Math.random() * 2 - 1) * spread;
}

function buildReading(sensorCode, index) {
  const timeFactor = Date.now() / 1000 / 60;
  const baseAqi = 90 + Math.sin(timeFactor / 10 + index) * 30;
  const baseTemp = 28 + Math.sin(timeFactor / 15 + index) * 4;
  const baseHumidity = 65 + Math.sin(timeFactor / 18 + index) * 10;
  const baseWater = 180 + Math.sin(timeFactor / 12 + index) * 40;

  return {
    sensorCode,
    recordedAt: new Date().toISOString(),
    aqi: Math.round(clamp(jitter(baseAqi, 15), 20, 220)),
    temperature: Number(clamp(jitter(baseTemp, 2.5), 12, 42).toFixed(1)),
    humidity: Math.round(clamp(jitter(baseHumidity, 8), 25, 95)),
    waterLevelCm: Math.round(clamp(jitter(baseWater, 30), 40, 500)),
  };
}

async function sendBatch() {
  const readings = SENSOR_CODES.map((code, index) => buildReading(code, index));
  try {
    const res = await fetch(`${API_BASE_URL}/dev/ingest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ readings }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Ingest failed: ${res.status} ${text}`);
    }

    const payload = await res.json();
    console.log(
      `[devTesting] Ingested ${payload?.data?.inserted ?? 0}/${readings.length} readings @ ${new Date().toLocaleTimeString()}`
    );
  } catch (err) {
    console.error("[devTesting] Ingest error:", err.message || err);
  }
}

console.log(`[devTesting] Sending readings to ${API_BASE_URL}/dev/ingest every ${INTERVAL_MS}ms`);
void sendBatch();
setInterval(sendBatch, INTERVAL_MS);

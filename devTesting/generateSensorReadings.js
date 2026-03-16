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
const BACKFILL_DAYS = Number(process.env.DEV_BACKFILL_DAYS || 30);
const SENSOR_CODES = (process.env.DEV_SENSOR_CODES || "SEN-001,SEN-002,SEN-003,SEN-004,SEN-005")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const SENSOR_TYPES = ["AQI", "Temperature", "Humidity", "Water Level", "AQI"];

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

function typeForIndex(index) {
  return SENSOR_TYPES[index % SENSOR_TYPES.length];
}

function buildMetadata(sensorCode, sensorType) {
  const versionSeed = Number(sensorCode.replace(/\D/g, "")) % 10;
  const firmware = `v${1 + (versionSeed % 3)}.${1 + (versionSeed % 5)}.${versionSeed}`;
  const lastCalibration = new Date(Date.now() - (versionSeed + 3) * 86400000).toISOString();
  const hardwareMetadata = {
    model: `EG-${sensorType.replace(" ", "-")}-${100 + versionSeed}`,
    batch: `B-${2026 - (versionSeed % 2)}-${String(versionSeed).padStart(2, "0")}`,
  };

  if (sensorType === "AQI") {
    return {
      firmware,
      lastCalibration,
      hardwareMetadata,
      typeDetails: {
        aqi: {
          fan_rpm: 1500 + versionSeed * 90,
          laser_health_percent: 85 + (versionSeed % 10),
        },
      },
    };
  }
  if (sensorType === "Temperature") {
    return {
      firmware,
      lastCalibration,
      hardwareMetadata,
      typeDetails: {
        temperature: {
          thermal_drift_rate: Number((0.05 + (versionSeed % 5) * 0.03).toFixed(2)),
          probe_type: versionSeed % 2 === 0 ? "Internal" : "External",
        },
      },
    };
  }
  if (sensorType === "Humidity") {
    return {
      firmware,
      lastCalibration,
      hardwareMetadata,
      typeDetails: {
        humidity: {
          heater_status: versionSeed % 2 === 0,
          saturation_risk_level: versionSeed % 3 === 0 ? "high" : versionSeed % 3 === 1 ? "medium" : "low",
        },
      },
    };
  }
  return {
    firmware,
    lastCalibration,
    hardwareMetadata,
    typeDetails: {
      waterLevel: {
        echo_quality_db: 28 + versionSeed * 2,
        mounting_offset_mm: 12 + versionSeed * 4,
      },
    },
  };
}

function buildReading(sensorCode, index) {
  const timeFactor = Date.now() / 1000 / 60;
  const baseAqi = 90 + Math.sin(timeFactor / 10 + index) * 30;
  const baseTemp = 28 + Math.sin(timeFactor / 15 + index) * 4;
  const baseHumidity = 65 + Math.sin(timeFactor / 18 + index) * 10;
  const baseWater = 180 + Math.sin(timeFactor / 12 + index) * 40;
  const sensorType = typeForIndex(index);

  return {
    sensorCode,
    recordedAt: new Date().toISOString(),
    aqi: Math.round(clamp(jitter(baseAqi, 15), 20, 220)),
    temperature: Number(clamp(jitter(baseTemp, 2.5), 12, 42).toFixed(1)),
    humidity: Math.round(clamp(jitter(baseHumidity, 8), 25, 95)),
    waterLevelCm: Math.round(clamp(jitter(baseWater, 30), 40, 500)),
    metadata: buildMetadata(sensorCode, sensorType),
  };
}

function buildBackfillReadings() {
  const readings = [];
  const now = new Date();
  for (let dayOffset = BACKFILL_DAYS; dayOffset >= 1; dayOffset -= 1) {
    const day = new Date(now);
    day.setDate(now.getDate() - dayOffset);
    day.setHours(12, 0, 0, 0);
    SENSOR_CODES.forEach((code, index) => {
      const sensorType = typeForIndex(index);
      const timeFactor = day.getTime() / 1000 / 60;
      const baseAqi = 90 + Math.sin(timeFactor / 10 + index) * 30;
      const baseTemp = 28 + Math.sin(timeFactor / 15 + index) * 4;
      const baseHumidity = 65 + Math.sin(timeFactor / 18 + index) * 10;
      const baseWater = 180 + Math.sin(timeFactor / 12 + index) * 40;
      readings.push({
        sensorCode: code,
        recordedAt: day.toISOString(),
        aqi: Math.round(clamp(jitter(baseAqi, 15), 20, 220)),
        temperature: Number(clamp(jitter(baseTemp, 2.5), 12, 42).toFixed(1)),
        humidity: Math.round(clamp(jitter(baseHumidity, 8), 25, 95)),
        waterLevelCm: Math.round(clamp(jitter(baseWater, 30), 40, 500)),
        metadata: buildMetadata(code, sensorType),
      });
    });
  }
  return readings;
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
void (async () => {
  if (BACKFILL_DAYS > 0) {
    const backfill = buildBackfillReadings();
    console.log(`[devTesting] Backfilling ${backfill.length} readings (${BACKFILL_DAYS} days) ...`);
    try {
      const res = await fetch(`${API_BASE_URL}/dev/ingest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ readings: backfill }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Backfill failed: ${res.status} ${text}`);
      }
      console.log("[devTesting] Backfill complete.");
    } catch (err) {
      console.error("[devTesting] Backfill error:", err.message || err);
    }
  }
  await sendBatch();
})();
setInterval(sendBatch, INTERVAL_MS);

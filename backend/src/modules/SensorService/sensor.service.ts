// SensorService: business logic for dashboard sensor data
// This file exists to keep controllers thin and focused on HTTP concerns.

import { db } from "../../utils/db";
import type { SensorDTO, SensorSummaryDTO } from "../../types/sensor";

// Helper: convert cm -> meters for UI consistency.
function cmToMeters(value: number | null) {
  if (value === null || value === undefined) return null;
  return Number((value / 100).toFixed(2));
}

export async function listSensors(): Promise<SensorDTO[]> {
  // Returns SensorDTO[] with latest readings for each sensor.
  // Tables: sensors, devices, sensor_readings (latest per sensor).
  const result = await db.query(
    `SELECT DISTINCT ON (s.id)
      s.sensor_code,
      d.location_name,
      d.latitude,
      d.longitude,
      d.status AS device_status,
      sr.recorded_at,
      sr.aqi,
      sr.temperature_c,
      sr.humidity_pct,
      sr.water_level_cm
     FROM sensors s
     JOIN devices d ON d.id = s.device_id
     LEFT JOIN sensor_readings sr ON sr.sensor_id = s.id
     ORDER BY s.id, sr.recorded_at DESC`
  );

  return result.rows.map((row) => ({
    id: row.sensor_code,
    location: row.location_name,
    lat: Number(row.latitude ?? 0),
    lng: Number(row.longitude ?? 0),
    aqi: row.aqi ?? 0,
    temperature: row.temperature_c ?? 0,
    humidity: row.humidity_pct ?? 0,
    waterLevel: cmToMeters(row.water_level_cm) ?? 0,
    lastUpdate: row.recorded_at ? new Date(row.recorded_at).toISOString() : "",
    status: row.device_status === "ACTIVE" ? "online" : "offline",
  }));
}

export async function getSensorById(id: string): Promise<SensorDTO | null> {
  // Returns SensorDTO for a single sensor.
  // Tables: sensors, devices, sensor_readings (latest per sensor).
  const result = await db.query(
    `SELECT DISTINCT ON (s.id)
      s.sensor_code,
      d.location_name,
      d.latitude,
      d.longitude,
      d.status AS device_status,
      sr.recorded_at,
      sr.aqi,
      sr.temperature_c,
      sr.humidity_pct,
      sr.water_level_cm
     FROM sensors s
     JOIN devices d ON d.id = s.device_id
     LEFT JOIN sensor_readings sr ON sr.sensor_id = s.id
     WHERE s.sensor_code = $1
     ORDER BY s.id, sr.recorded_at DESC`,
    [id]
  );

  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return {
    id: row.sensor_code,
    location: row.location_name,
    lat: Number(row.latitude ?? 0),
    lng: Number(row.longitude ?? 0),
    aqi: row.aqi ?? 0,
    temperature: row.temperature_c ?? 0,
    humidity: row.humidity_pct ?? 0,
    waterLevel: cmToMeters(row.water_level_cm) ?? 0,
    lastUpdate: row.recorded_at ? new Date(row.recorded_at).toISOString() : "",
    status: row.device_status === "ACTIVE" ? "online" : "offline",
  };
}

export async function getSensorLatest(id: string) {
  // Returns latest metric values for a sensor.
  // Table: sensor_readings.
  const result = await db.query(
    `SELECT recorded_at, aqi, temperature_c, humidity_pct, water_level_cm
     FROM sensor_readings
     WHERE sensor_id = (SELECT id FROM sensors WHERE sensor_code = $1)
     ORDER BY recorded_at DESC
     LIMIT 1`,
    [id]
  );
  return result.rows[0] ?? null;
}

export async function getLatestByType(type?: string) {
  // Returns latest value for a given metric type across all sensors.
  // Table: sensor_readings.
  const metric = type || "aqi";
  const column =
    metric === "temperature"
      ? "temperature_c"
      : metric === "humidity"
        ? "humidity_pct"
        : metric === "waterLevel"
          ? "water_level_cm"
          : "aqi";

  const result = await db.query(
    `SELECT ${column} AS value, recorded_at
     FROM sensor_readings
     WHERE ${column} IS NOT NULL
     ORDER BY recorded_at DESC
     LIMIT 1`
  );
  return result.rows[0] ?? null;
}

export async function getSensorSummary(range?: string): Promise<SensorSummaryDTO> {
  // Returns summary stats for dashboard cards.
  // Table: sensor_readings, sensors.
  const window = range || "15m";
  const interval =
    window.endsWith("h") || window.endsWith("m") ? window : "15m";

  const result = await db.query(
    `SELECT
       COUNT(DISTINCT s.id) AS total_sensors,
       AVG(sr.aqi) AS avg_aqi
     FROM sensors s
     LEFT JOIN sensor_readings sr
       ON sr.sensor_id = s.id
      AND sr.recorded_at > NOW() - $1::interval`,
    [interval]
  );

  const counts = await db.query(
    `SELECT
       SUM(CASE WHEN d.status = 'ACTIVE' THEN 1 ELSE 0 END) AS online,
       SUM(CASE WHEN d.status <> 'ACTIVE' THEN 1 ELSE 0 END) AS offline
     FROM sensors s
     JOIN devices d ON d.id = s.device_id`
  );

  return {
    totalSensors: Number(result.rows[0]?.total_sensors || 0),
    onlineSensors: Number(counts.rows[0]?.online || 0),
    offlineSensors: Number(counts.rows[0]?.offline || 0),
    averageAqi: Number(result.rows[0]?.avg_aqi || 0),
    lastRefreshed: new Date().toISOString(),
  };
}

export async function getSensorHealth() {
  // Returns health counts for sensors.
  // Tables: sensors, devices.
  const result = await db.query(
    `SELECT
       SUM(CASE WHEN d.status = 'ACTIVE' THEN 1 ELSE 0 END) AS online,
       SUM(CASE WHEN d.status <> 'ACTIVE' THEN 1 ELSE 0 END) AS offline
     FROM sensors s
     JOIN devices d ON d.id = s.device_id`
  );
  return {
    online: Number(result.rows[0]?.online || 0),
    offline: Number(result.rows[0]?.offline || 0),
  };
}


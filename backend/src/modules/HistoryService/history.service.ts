// HistoryService: historical and aggregate data access

import { db } from "../../utils/db";

function metricColumn(metric?: string) {
  switch (metric) {
    case "temperature":
      return "temperature_c";
    case "humidity":
      return "humidity_pct";
    case "waterLevel":
      return "water_level_cm";
    default:
      return "aqi";
  }
}

function intervalBucket(interval?: string) {
  // Maps UI interval to SQL date_trunc bucket.
  if (!interval) return "hour";
  if (interval.includes("day")) return "day";
  if (interval.includes("hour") || interval.includes("h")) return "hour";
  return "hour";
}

export async function getHistoryReadings(query: any) {
  // Returns raw readings filtered by time range and sensor.
  // Table: sensor_readings.
  const { sensor_id, from, to, page = "1", pageSize = "50" } = query;

  const limit = Math.min(Number(pageSize) || 50, 500);
  const offset = (Number(page) - 1) * limit;

  const totalResult = await db.query(
    `SELECT COUNT(*) AS total
     FROM sensor_readings
     WHERE sensor_id = (SELECT id FROM sensors WHERE sensor_code = $1)
       AND recorded_at BETWEEN $2 AND $3`,
    [sensor_id, from, to]
  );

  const result = await db.query(
    `SELECT recorded_at, aqi, temperature_c, humidity_pct, water_level_cm
     FROM sensor_readings
     WHERE sensor_id = (SELECT id FROM sensors WHERE sensor_code = $1)
       AND recorded_at BETWEEN $2 AND $3
     ORDER BY recorded_at DESC
     LIMIT $4 OFFSET $5`,
    [sensor_id, from, to, limit, offset]
  );

  return {
    rows: result.rows,
    total: Number(totalResult.rows[0]?.total || 0),
    page: Number(page),
    pageSize: limit,
  };
}

export async function getHistoryAggregate(query: any) {
  // Returns aggregated chart data for Historical Data UI.
  // Tables: sensor_readings, sensors, devices.
  const { metric, from, to, interval, location } = query;
  const column = metricColumn(metric);
  const bucket = intervalBucket(interval);

  const result = await db.query(
    `SELECT
       date_trunc('${bucket}', sr.recorded_at) AS bucket,
       d.location_name,
       AVG(sr.${column}) AS value
     FROM sensor_readings sr
     JOIN sensors s ON s.id = sr.sensor_id
     JOIN devices d ON d.id = s.device_id
     WHERE sr.recorded_at BETWEEN $1 AND $2
       AND ($3::text IS NULL OR d.location_name = $3)
       AND sr.${column} IS NOT NULL
     GROUP BY 1, 2
     ORDER BY 1 ASC`,
    [from, to, location || null]
  );

  // Shape results into chart-friendly records.
  const map: Record<string, any> = {};
  for (const row of result.rows) {
    const dateKey = new Date(row.bucket).toISOString();
    if (!map[dateKey]) map[dateKey] = { date: dateKey };
    map[dateKey][row.location_name] = Number(row.value);
  }
  return Object.values(map);
}

export async function getDeviceAggregate(id: string, query: any) {
  // Returns device-specific aggregate series.
  const { from, to, interval } = query;
  const bucket = intervalBucket(interval);

  const result = await db.query(
    `SELECT
       date_trunc('${bucket}', sr.recorded_at) AS bucket,
       AVG(sr.aqi) AS avg_aqi
     FROM sensor_readings sr
     WHERE sr.device_id = (SELECT id FROM devices WHERE device_code = $1)
       AND sr.recorded_at BETWEEN $2 AND $3
     GROUP BY 1
     ORDER BY 1 ASC`,
    [id, from, to]
  );

  return (result.rows as any[]).map((r: any) => ({ date: new Date(r.bucket).toISOString(), value: Number(r.avg_aqi) }));
}

export async function exportHistory(query: any) {
  // For now, reuse raw readings export in JSON form.
  return getHistoryReadings(query);
}

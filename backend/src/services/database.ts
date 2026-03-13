import { db } from "../utils/db";

// This file provides example queries to show how modules will access the database.
// In production, each service module can either call these helpers or use its own queries.
// The shared pool keeps DB connections efficient and reusable.

// --- Sensor Readings ---
// Table: sensor_readings
// Used by: SensorService, HistoryService
export async function getLatestSensorReading(sensorId: number) {
  // Purpose: fetch the latest reading for a specific sensor.
  // Modules call this to show live dashboard values.
  const result = await db.query(
    `SELECT *
     FROM sensor_readings
     WHERE sensor_id = $1
     ORDER BY recorded_at DESC
     LIMIT 1`,
    [sensorId]
  );
  return result.rows[0];
}

// --- Devices + Heartbeats ---
// Tables: devices, device_heartbeats
// Used by: DeviceService
export async function getDeviceInfo(deviceId: number) {
  // Purpose: join device metadata with latest heartbeat.
  // Modules call this for device health panels.
  const result = await db.query(
    `SELECT d.*, h.heartbeat_at, h.signal_strength, h.battery_pct
     FROM devices d
     LEFT JOIN LATERAL (
       SELECT * FROM device_heartbeats
       WHERE device_id = d.id
       ORDER BY heartbeat_at DESC
       LIMIT 1
     ) h ON true
     WHERE d.id = $1`,
    [deviceId]
  );
  return result.rows[0];
}

// --- Alerts ---
// Table: alerts
// Used by: AlertService
export async function getAlertsForDevice(deviceId: number) {
  // Purpose: list alerts for a given device.
  // Modules call this to populate alert inbox or device-specific alerts.
  const result = await db.query(
    `SELECT *
     FROM alerts
     WHERE device_id = $1
     ORDER BY triggered_at DESC`,
    [deviceId]
  );
  return result.rows;
}


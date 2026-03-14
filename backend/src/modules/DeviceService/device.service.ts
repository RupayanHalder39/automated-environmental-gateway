// DeviceService: business logic for device health monitoring

import { db } from "../../utils/db";
import type { DeviceDTO, DeviceHealthSummaryDTO } from "../../types/device";
import { DEV_MODE } from "../../config";
import {
  getDevDeviceById,
  getDevDeviceHeartbeats,
  getDevDeviceHealthSummary,
  listDevDevices,
  updateDevDeviceStatus,
} from "../../services/devData";

export async function listDevices(): Promise<DeviceDTO[]> {
  // DEV_MODE: return generated device list without DB access.
  if (DEV_MODE) return listDevDevices();

  // Returns device list with latest heartbeat.
  // Tables: devices, device_heartbeats.
  const result = await db.query(
    `SELECT d.device_code, d.location_name, d.status, d.last_seen_at,
            h.heartbeat_at, h.signal_strength, h.battery_pct
     FROM devices d
     LEFT JOIN LATERAL (
       SELECT * FROM device_heartbeats
       WHERE device_id = d.id
       ORDER BY heartbeat_at DESC
       LIMIT 1
     ) h ON true
     ORDER BY d.device_code ASC`
  );

  return (result.rows as any[]).map((row: any) => {
    const offline = row.last_seen_at
      ? new Date(row.last_seen_at).getTime() < Date.now() - 5 * 60 * 1000
      : true;

    const status = row.status === "MAINTENANCE" ? "maintenance" : offline ? "offline" : "online";

    return {
      id: row.device_code,
      location: row.location_name,
      status,
      lastHeartbeat: row.heartbeat_at ? new Date(row.heartbeat_at).toISOString() : "",
      signalStrength: row.signal_strength ?? 0,
      batteryLevel: row.battery_pct ?? 0,
      maintenance: row.status === "MAINTENANCE",
    } as DeviceDTO;
  });
}

export async function getDeviceById(id: string): Promise<DeviceDTO | null> {
  // DEV_MODE: return generated device by id.
  if (DEV_MODE) return getDevDeviceById(id);

  // Returns a single device with latest heartbeat.
  const result = await db.query(
    `SELECT d.device_code, d.location_name, d.status, d.last_seen_at,
            h.heartbeat_at, h.signal_strength, h.battery_pct
     FROM devices d
     LEFT JOIN LATERAL (
       SELECT * FROM device_heartbeats
       WHERE device_id = d.id
       ORDER BY heartbeat_at DESC
       LIMIT 1
     ) h ON true
     WHERE d.device_code = $1`,
    [id]
  );

  if (result.rows.length === 0) return null;

  const row = result.rows[0] as any;
  const offline = row.last_seen_at
    ? new Date(row.last_seen_at).getTime() < Date.now() - 5 * 60 * 1000
    : true;
  const status = row.status === "MAINTENANCE" ? "maintenance" : offline ? "offline" : "online";

  return {
    id: row.device_code,
    location: row.location_name,
    status,
    lastHeartbeat: row.heartbeat_at ? new Date(row.heartbeat_at).toISOString() : "",
    signalStrength: row.signal_strength ?? 0,
    batteryLevel: row.battery_pct ?? 0,
    maintenance: row.status === "MAINTENANCE",
  } as DeviceDTO;
}

export async function getDeviceHeartbeats(id: string, range?: string) {
  // DEV_MODE: return generated heartbeat history.
  if (DEV_MODE) return getDevDeviceHeartbeats(id);

  // Returns recent heartbeat history for a device.
  const window = range || "24h";
  const interval = window.endsWith("h") || window.endsWith("m") ? window : "24h";

  const result = await db.query(
    `SELECT heartbeat_at, status, signal_strength, battery_pct
     FROM device_heartbeats
     WHERE device_id = (SELECT id FROM devices WHERE device_code = $1)
       AND heartbeat_at > NOW() - $2::interval
     ORDER BY heartbeat_at DESC`,
    [id, interval]
  );

  return result.rows;
}

export async function getDeviceHealthSummary(): Promise<DeviceHealthSummaryDTO> {
  // DEV_MODE: return generated device health summary.
  if (DEV_MODE) return getDevDeviceHealthSummary();

  // Returns counts for Device Health summary cards.
  const result = await db.query(
    `SELECT
       COUNT(*) AS total,
       SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) AS active_count,
       SUM(CASE WHEN status = 'MAINTENANCE' THEN 1 ELSE 0 END) AS maintenance_count
     FROM devices`
  );

  const total = Number(result.rows[0]?.total || 0);
  const active = Number(result.rows[0]?.active_count || 0);
  const maintenance = Number(result.rows[0]?.maintenance_count || 0);
  const offline = total - active - maintenance;

  return {
    totalDevices: total,
    onlineCount: active,
    offlineCount: offline,
    maintenanceCount: maintenance,
  };
}

export async function updateDeviceStatus(id: string, payload: { status?: string }) {
  // DEV_MODE: update in-memory device status only.
  if (DEV_MODE) return updateDevDeviceStatus(id, payload?.status);

  // Updates device operational status (ACTIVE/MAINTENANCE/DECOMMISSIONED).
  const status = payload?.status || "ACTIVE";
  const result = await db.query(
    `UPDATE devices SET status = $2, updated_at = NOW()
     WHERE device_code = $1
     RETURNING *`,
    [id, status]
  );
  return result.rows[0] ?? null;
}

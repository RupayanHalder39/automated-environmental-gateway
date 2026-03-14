// AlertService: alert lifecycle and querying

import { db } from "../../utils/db";
import type { AlertDTO, AlertSummaryDTO } from "../../types/alert";
import { DEV_MODE } from "../../config";
import {
  acknowledgeDevAlert,
  getDevAlertById,
  getDevAlertSummary,
  listDevAlerts,
  resolveDevAlert,
  triggerDevAlert,
} from "../../services/devData";

function severityToType(severity: string): "critical" | "warning" | "info" {
  if (severity === "CRITICAL") return "critical";
  if (severity === "HIGH" || severity === "MEDIUM") return "warning";
  return "info";
}

export async function listAlerts(query: any): Promise<AlertDTO[]> {
  // DEV_MODE: return generated alerts without DB access.
  if (DEV_MODE) return listDevAlerts(query?.status);

  const status = query.status === "active" ? "OPEN" : query.status === "resolved" ? "RESOLVED" : undefined;
  const result = await db.query(
    `SELECT a.id, a.severity, a.message, a.triggered_at, a.status,
            d.location_name,
            a.context_json
     FROM alerts a
     LEFT JOIN devices d ON d.id = a.device_id
     WHERE ($1::text IS NULL OR a.status = $1)
     ORDER BY a.triggered_at DESC`,
    [status || null]
  );

  return (result.rows as any[]).map((row: any) => ({
    id: row.id,
    type: severityToType(row.severity),
    message: row.message,
    location: row.location_name || row.context_json?.location || "",
    timestamp: new Date(row.triggered_at).toISOString(),
    status: row.status === "OPEN" ? "active" : row.status === "RESOLVED" ? "resolved" : "dismissed",
    value: row.context_json?.value || "",
  }));
}

export async function getAlertById(id: string): Promise<AlertDTO | null> {
  // DEV_MODE: return generated alert by id.
  if (DEV_MODE) return getDevAlertById(id);

  const result = await db.query(
    `SELECT a.id, a.severity, a.message, a.triggered_at, a.status,
            d.location_name,
            a.context_json
     FROM alerts a
     LEFT JOIN devices d ON d.id = a.device_id
     WHERE a.id = $1`,
    [id]
  );

  if (!result.rows.length) return null;
  const row = result.rows[0] as any;
  return {
    id: row.id,
    type: severityToType(row.severity),
    message: row.message,
    location: row.location_name || row.context_json?.location || "",
    timestamp: new Date(row.triggered_at).toISOString(),
    status: row.status === "OPEN" ? "active" : row.status === "RESOLVED" ? "resolved" : "dismissed",
    value: row.context_json?.value || "",
  };
}

export async function acknowledgeAlert(id: string) {
  // DEV_MODE: update in-memory alert status.
  if (DEV_MODE) return acknowledgeDevAlert(id);

  const result = await db.query(
    `UPDATE alerts SET status = 'ACKNOWLEDGED' WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0] ?? null;
}

export async function resolveAlert(id: string) {
  // DEV_MODE: update in-memory alert status.
  if (DEV_MODE) return resolveDevAlert(id);

  const result = await db.query(
    `UPDATE alerts SET status = 'RESOLVED', resolved_at = NOW() WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0] ?? null;
}

export async function getAlertSummary(): Promise<AlertSummaryDTO> {
  // DEV_MODE: return generated alert summary.
  if (DEV_MODE) return getDevAlertSummary();

  const result = await db.query(
    `SELECT
       SUM(CASE WHEN status = 'OPEN' THEN 1 ELSE 0 END) AS active,
       SUM(CASE WHEN severity = 'CRITICAL' THEN 1 ELSE 0 END) AS critical,
       SUM(CASE WHEN status = 'RESOLVED' AND triggered_at::date = CURRENT_DATE THEN 1 ELSE 0 END) AS resolved_today
     FROM alerts`
  );

  return {
    active: Number(result.rows[0]?.active || 0),
    critical: Number(result.rows[0]?.critical || 0),
    resolvedToday: Number(result.rows[0]?.resolved_today || 0),
  };
}

// Trigger alerts when a reading crosses rule thresholds.
// This is used by ingest pipelines (SyncService) or real-time ingestion.
export async function triggerAlertsForReading(payload: {
  sensorCode: string;
  deviceCode: string;
  metric: string;
  value: number;
}) {
  // DEV_MODE: create in-memory alert only.
  if (DEV_MODE) return [triggerDevAlert(payload)];

  // Fetch rules for metric
  const metric = payload.metric.toUpperCase();
  const sensorType = metric === "WATERLEVEL" || metric === "WATER_LEVEL" ? "WATER_LEVEL" : metric;

  const rules = await db.query(
    `SELECT * FROM alert_rules WHERE sensor_type = $1 AND is_active = true`,
    [sensorType]
  );

  const device = await db.query(
    `SELECT id, location_name FROM devices WHERE device_code = $1`,
    [payload.deviceCode]
  );
  const deviceRow = device.rows[0];

  const sensor = await db.query(
    `SELECT id FROM sensors WHERE sensor_code = $1`,
    [payload.sensorCode]
  );
  const sensorRow = sensor.rows[0];

  const created: any[] = [];
  for (const rule of rules.rows) {
    const { op, value, location } = rule.condition_json || {};
    if (location && location !== "All Locations" && location !== deviceRow?.location_name) {
      continue;
    }
    let match = false;
    if (op === ">" && payload.value > value) match = true;
    if (op === ">=" && payload.value >= value) match = true;
    if (op === "<" && payload.value < value) match = true;
    if (op === "<=" && payload.value <= value) match = true;

    if (match) {
      const insert = await db.query(
        `INSERT INTO alerts (rule_id, sensor_id, device_id, triggered_at, status, severity, message, context_json)
         VALUES ($1, $2, $3, NOW(), 'OPEN', $4, $5, $6)
         RETURNING *`,
        [
          rule.id,
          sensorRow?.id || null,
          deviceRow?.id || null,
          rule.severity || "MEDIUM",
          `${rule.name}`,
          { value: `${metric}: ${payload.value}`, location: deviceRow?.location_name },
        ]
      );
      created.push(insert.rows[0]);
    }
  }

  return created;
}

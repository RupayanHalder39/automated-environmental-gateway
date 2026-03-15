// backend/src/modules/AlertService/alert.repository.ts
import { db } from "../../utils/db";
import type { AlertDTO, AlertSummaryDTO } from "../../types/alert";
import {
  acknowledgeDevAlert,
  getDevAlertById,
  getDevAlertSummary,
  listDevAlerts,
  resolveDevAlert,
  triggerDevAlert,
} from "../../services/devData";
import { DEV_MODE } from "../../config";

// --- Types ---

type AlertStatus = "OPEN" | "ACKNOWLEDGED" | "RESOLVED";

// --- Mapper ---

/**
 * Maps a database row to an AlertDTO.
 * @param row - The database row.
 * @returns An AlertDTO.
 */
function rowToAlertDTO(row: any): AlertDTO {
  const severityMap: Record<string, AlertDTO['type']> = {
    CRITICAL: "critical",
    HIGH: "warning",
    MEDIUM: "warning",
    LOW: "info",
  };

  const statusMap: Record<string, AlertDTO['status']> = {
    OPEN: "active",
    RESOLVED: "resolved",
  };

  const type: AlertDTO['type'] = severityMap[row.severity] || "info";
  const status: AlertDTO['status'] = statusMap[row.status] || "dismissed";

  return {
    id: row.id,
    type,
    message: row.message,
    location: row.location_name || row.context_json?.location || "Unknown",
    timestamp: new Date(row.triggered_at).toISOString(),
    status,
    value: row.context_json?.value || "",
  };
}


// --- Repository ---

export async function findAlerts(status?: AlertStatus): Promise<AlertDTO[]> {
  if (DEV_MODE) {
    const devStatus = status === "OPEN" ? "active" : status === "RESOLVED" ? "resolved" : undefined;
    return listDevAlerts(devStatus);
  }

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

  return result.rows.map(rowToAlertDTO);
}

export async function findAlertById(id: string): Promise<AlertDTO | null> {
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

  if (result.rows.length === 0) {
    return null;
  }

  return rowToAlertDTO(result.rows[0]);
}

export async function updateAlertStatus(id: string, status: AlertStatus): Promise<boolean> {
  if (DEV_MODE) {
    if (status === "ACKNOWLEDGED") return !!acknowledgeDevAlert(id);
    if (status === "RESOLVED") return !!resolveDevAlert(id);
    return false;
  }

  let query = `UPDATE alerts SET status = $1 WHERE id = $2`;
  const params: any[] = [status, id];

  if (status === "RESOLVED") {
    query = `UPDATE alerts SET status = $1, resolved_at = NOW() WHERE id = $2`;
  }

  const result = await db.query(query, params);
  return (result.rowCount ?? 0) > 0;
}

export async function getSummary(): Promise<AlertSummaryDTO> {
    if (DEV_MODE) return getDevAlertSummary();

    const result = await db.query(
        `SELECT
            COUNT(*) FILTER (WHERE status = 'OPEN') AS active,
            COUNT(*) FILTER (WHERE status = 'OPEN' AND severity = 'CRITICAL') AS critical,
            COUNT(*) FILTER (WHERE status = 'RESOLVED' AND resolved_at >= CURRENT_DATE) AS resolved_today
        FROM alerts`
    );

    return {
        active: Number(result.rows[0]?.active || 0),
        critical: Number(result.rows[0]?.critical || 0),
        resolvedToday: Number(result.rows[0]?.resolved_today || 0),
    };
}

export async function createAlertsForReading(payload: {
  sensorCode: string;
  deviceCode: string;
  metric: string;
  value: number;
}): Promise<any[]> {
    if (DEV_MODE) return [triggerDevAlert(payload)];

    const { metric, value, deviceCode, sensorCode } = payload;
    const sensorType = metric.toUpperCase() === "WATERLEVEL" ? "WATER_LEVEL" : metric.toUpperCase();

    const [rulesResult, deviceResult, sensorResult] = await Promise.all([
        db.query(`SELECT * FROM alert_rules WHERE sensor_type = $1 AND is_active = true`, [sensorType]),
        db.query(`SELECT id, location_name FROM devices WHERE device_code = $1`, [deviceCode]),
        db.query(`SELECT id FROM sensors WHERE sensor_code = $1`, [sensorCode]),
    ]);

    const device = deviceResult.rows[0];
    const sensor = sensorResult.rows[0];
    const rules = rulesResult.rows;

    const createdAlerts = [];

    for (const rule of rules) {
        const { op, value: threshold, location } = rule.condition_json || {};

        if (location && location !== "All Locations" && location !== device?.location_name) {
            continue;
        }

        let match = false;
        switch (op) {
            case ">": if (value > threshold) match = true; break;
            case ">=": if (value >= threshold) match = true; break;
            case "<": if (value < threshold) match = true; break;
            case "<=": if (value <= threshold) match = true; break;
        }

        if (match) {
            const insertResult = await db.query(
                `INSERT INTO alerts (rule_id, sensor_id, device_id, triggered_at, status, severity, message, context_json)
                 VALUES ($1, $2, $3, NOW(), 'OPEN', $4, $5, $6)
                 RETURNING *`,
                [
                    rule.id,
                    sensor?.id || null,
                    device?.id || null,
                    rule.severity || "MEDIUM",
                    rule.name,
                    { value: `${metric}: ${value}`, location: device?.location_name },
                ]
            );
            createdAlerts.push(insertResult.rows[0]);
        }
    }

    return createdAlerts;
}

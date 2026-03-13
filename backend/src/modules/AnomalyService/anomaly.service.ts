// AnomalyService: data sanity and anomaly listing

import { db } from "../../utils/db";
import type { AnomalyDTO, AnomalySummaryDTO } from "../../types/anomaly";

export async function listAnomalies(query: any): Promise<AnomalyDTO[]> {
  const result = await db.query(
    `SELECT al.id, s.sensor_code, al.detected_at, al.severity, al.details_json
     FROM anomaly_logs al
     JOIN sensors s ON s.id = al.sensor_id
     ORDER BY al.detected_at DESC
     LIMIT 200`
  );

  return result.rows.map((row) => ({
    id: row.id,
    sensorId: row.sensor_code,
    invalidValue: row.details_json?.invalidValue || "",
    expectedRange: row.details_json?.expectedRange || "",
    timestamp: new Date(row.detected_at).toISOString(),
    reason: row.details_json?.reason || "",
    severity: row.severity?.toLowerCase() || "low",
  }));
}

export async function getAnomalyById(id: string): Promise<AnomalyDTO | null> {
  const result = await db.query(
    `SELECT al.id, s.sensor_code, al.detected_at, al.severity, al.details_json
     FROM anomaly_logs al
     JOIN sensors s ON s.id = al.sensor_id
     WHERE al.id = $1`,
    [id]
  );

  if (!result.rows.length) return null;
  const row = result.rows[0];
  return {
    id: row.id,
    sensorId: row.sensor_code,
    invalidValue: row.details_json?.invalidValue || "",
    expectedRange: row.details_json?.expectedRange || "",
    timestamp: new Date(row.detected_at).toISOString(),
    reason: row.details_json?.reason || "",
    severity: row.severity?.toLowerCase() || "low",
  };
}

export async function getAnomalySummary(): Promise<AnomalySummaryDTO> {
  const result = await db.query(
    `SELECT
       COUNT(*) AS total,
       SUM(CASE WHEN severity = 'HIGH' THEN 1 ELSE 0 END) AS high,
       SUM(CASE WHEN severity = 'MEDIUM' THEN 1 ELSE 0 END) AS medium
     FROM anomaly_logs`
  );

  return {
    totalRejected: Number(result.rows[0]?.total || 0),
    highSeverity: Number(result.rows[0]?.high || 0),
    mediumSeverity: Number(result.rows[0]?.medium || 0),
  };
}

export async function getAnomaliesBySensor(sensorId: string): Promise<AnomalyDTO[]> {
  const result = await db.query(
    `SELECT al.id, s.sensor_code, al.detected_at, al.severity, al.details_json
     FROM anomaly_logs al
     JOIN sensors s ON s.id = al.sensor_id
     WHERE s.sensor_code = $1
     ORDER BY al.detected_at DESC`,
    [sensorId]
  );

  return result.rows.map((row) => ({
    id: row.id,
    sensorId: row.sensor_code,
    invalidValue: row.details_json?.invalidValue || "",
    expectedRange: row.details_json?.expectedRange || "",
    timestamp: new Date(row.detected_at).toISOString(),
    reason: row.details_json?.reason || "",
    severity: row.severity?.toLowerCase() || "low",
  }));
}

export async function updateAnomalySettings(payload: any) {
  // Placeholder: would persist settings in a settings table.
  return { ...payload };
}

export async function createAnomaly(payload: any): Promise<AnomalyDTO> {
  // Validate anomaly payload; in a real system this would be stricter.
  if (!payload.sensorId || !payload.reason) {
    throw new Error("sensorId and reason are required");
  }

  const sensor = await db.query(`SELECT id FROM sensors WHERE sensor_code = $1`, [payload.sensorId]);
  const sensorId = sensor.rows[0]?.id;

  if (!sensorId) throw new Error("Sensor not found");

  const result = await db.query(
    `INSERT INTO anomaly_logs (sensor_id, device_id, detected_at, anomaly_type, severity, details_json)
     VALUES ($1, (SELECT device_id FROM sensors WHERE id = $1), NOW(), $2, $3, $4)
     RETURNING *`,
    [
      sensorId,
      payload.anomalyType || "SPIKE",
      (payload.severity || "LOW").toUpperCase(),
      {
        invalidValue: payload.invalidValue || "",
        expectedRange: payload.expectedRange || "",
        reason: payload.reason,
      },
    ]
  );

  const row = result.rows[0];
  return {
    id: row.id,
    sensorId: payload.sensorId,
    invalidValue: row.details_json?.invalidValue || "",
    expectedRange: row.details_json?.expectedRange || "",
    timestamp: new Date(row.detected_at).toISOString(),
    reason: row.details_json?.reason || "",
    severity: row.severity?.toLowerCase() || "low",
  };
}


// RuleService: CRUD for alert rules

import { db } from "../../utils/db";
import { ruleValidator } from "../../utils/ruleValidator";
import type { RuleDTO } from "../../types/rule";

function toSensorType(metric: string) {
  const m = metric.toUpperCase();
  if (m === "WATERLEVEL" || m === "WATER_LEVEL" || m === "WATER LEVEL") return "WATER_LEVEL";
  if (m === "TEMPERATURE") return "TEMPERATURE";
  if (m === "HUMIDITY") return "HUMIDITY";
  return "AQI";
}

export async function listRules(): Promise<RuleDTO[]> {
  // Tables: alert_rules, alerts (for lastTriggered)
  const result = await db.query(
    `SELECT ar.id, ar.name, ar.sensor_type, ar.condition_json, ar.is_active,
            MAX(a.triggered_at) AS last_triggered
     FROM alert_rules ar
     LEFT JOIN alerts a ON a.rule_id = ar.id
     GROUP BY ar.id
     ORDER BY ar.created_at DESC`
  );

  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    metric: row.sensor_type,
    operator: row.condition_json?.op || ">",
    threshold: Number(row.condition_json?.value || 0),
    location: row.condition_json?.location || "All Locations",
    action: row.condition_json?.action || "Trigger Warning",
    status: row.is_active ? "active" : "disabled",
    lastTriggered: row.last_triggered ? new Date(row.last_triggered).toISOString() : "Never",
  }));
}

export async function getRuleById(id: string): Promise<RuleDTO | null> {
  const result = await db.query(
    `SELECT ar.id, ar.name, ar.sensor_type, ar.condition_json, ar.is_active,
            MAX(a.triggered_at) AS last_triggered
     FROM alert_rules ar
     LEFT JOIN alerts a ON a.rule_id = ar.id
     WHERE ar.id = $1
     GROUP BY ar.id`,
    [id]
  );
  if (!result.rows.length) return null;
  const row = result.rows[0];
  return {
    id: row.id,
    name: row.name,
    metric: row.sensor_type,
    operator: row.condition_json?.op || ">",
    threshold: Number(row.condition_json?.value || 0),
    location: row.condition_json?.location || "All Locations",
    action: row.condition_json?.action || "Trigger Warning",
    status: row.is_active ? "active" : "disabled",
    lastTriggered: row.last_triggered ? new Date(row.last_triggered).toISOString() : "Never",
  };
}

export async function createRule(payload: any): Promise<RuleDTO> {
  // Validate payload against DTO expectations.
  const validation = ruleValidator(payload);
  if (!validation.valid) throw new Error(validation.message);

  const sensorType = toSensorType(payload.metric);
  const condition = {
    op: payload.operator,
    value: payload.threshold,
    location: payload.location || "All Locations",
    action: payload.action || "Trigger Warning",
  };

  const result = await db.query(
    `INSERT INTO alert_rules (name, sensor_type, condition_json, severity, is_active, created_at, updated_at)
     VALUES ($1, $2, $3, $4, true, NOW(), NOW())
     RETURNING *`,
    [payload.name, sensorType, condition, payload.severity || "MEDIUM"]
  );

  const row = result.rows[0];
  return {
    id: row.id,
    name: row.name,
    metric: row.sensor_type,
    operator: row.condition_json?.op,
    threshold: Number(row.condition_json?.value || 0),
    location: row.condition_json?.location || "All Locations",
    action: row.condition_json?.action || "Trigger Warning",
    status: row.is_active ? "active" : "disabled",
    lastTriggered: "Never",
  };
}

export async function updateRule(id: string, payload: any): Promise<RuleDTO | null> {
  const sensorType = payload.metric ? toSensorType(payload.metric) : undefined;
  const condition = payload.operator || payload.threshold || payload.location || payload.action
    ? {
        op: payload.operator,
        value: payload.threshold,
        location: payload.location || "All Locations",
        action: payload.action || "Trigger Warning",
      }
    : undefined;

  const result = await db.query(
    `UPDATE alert_rules
     SET name = COALESCE($2, name),
         sensor_type = COALESCE($3, sensor_type),
         condition_json = COALESCE($4, condition_json),
         is_active = COALESCE($5, is_active),
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, payload.name, sensorType, condition, payload.is_active]
  );

  if (!result.rows.length) return null;
  const row = result.rows[0];
  return {
    id: row.id,
    name: row.name,
    metric: row.sensor_type,
    operator: row.condition_json?.op,
    threshold: Number(row.condition_json?.value || 0),
    location: row.condition_json?.location || "All Locations",
    action: row.condition_json?.action || "Trigger Warning",
    status: row.is_active ? "active" : "disabled",
    lastTriggered: "Never",
  };
}

export async function deleteRule(id: string) {
  // Soft delete by marking inactive.
  const result = await db.query(
    `UPDATE alert_rules SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0] ?? null;
}


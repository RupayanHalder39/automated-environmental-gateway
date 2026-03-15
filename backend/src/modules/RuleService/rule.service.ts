// RuleService: CRUD for alert rules

import { db } from "../../utils/db";
import { ruleValidator } from "../../utils/ruleValidator";
import type { RuleDTO } from "../../types/rule";
import { DEV_MODE } from "../../config";
import {
  createDevRule,
  deleteDevRule,
  getDevRuleById,
  listDevRules,
  updateDevRule,
} from "../../services/devData";
import { normalizeMetric } from "../../utils/ruleMatcher";

function normalizeLocations(locationIds: string[] | undefined, legacyLocation?: string) {
  if (locationIds && locationIds.length > 0) return locationIds;
  if (!legacyLocation || legacyLocation === "All" || legacyLocation === "All Locations") return ["all"];
  return [legacyLocation.toLowerCase().replace(/[^a-z0-9]+/g, "-")];
}

function normalizeActions(actionIds: string[] | undefined, legacyAction?: string) {
  if (actionIds && actionIds.length > 0) return actionIds;
  if (!legacyAction) return ["notification"];
  if (legacyAction.toLowerCase().includes("warning")) return ["warning"];
  if (legacyAction.toLowerCase().includes("log")) return ["log"];
  return ["notification"];
}

function normalizeConditions(
  conditions: { metric: string; operator: string; threshold: number }[] | undefined,
  legacy?: { metric?: string; operator?: string; threshold?: number }
) {
  if (conditions && conditions.length > 0) {
    return conditions.map((condition) => ({
      metric: normalizeMetric(condition.metric),
      operator: condition.operator,
      threshold: Number(condition.threshold),
    }));
  }
  if (!legacy?.metric || !legacy?.operator || typeof legacy?.threshold !== "number") return [];
  return [
    {
      metric: normalizeMetric(legacy.metric),
      operator: legacy.operator,
      threshold: Number(legacy.threshold),
    },
  ];
}

export async function listRules(): Promise<RuleDTO[]> {
  // DEV_MODE: return generated rules without DB access.
  if (DEV_MODE) return listDevRules();

  // Tables: alert_rules, alerts (for lastTriggered)
  const result = await db.query(
    `SELECT ar.id, ar.name, ar.sensor_type, ar.condition_json, ar.conditions_json, ar.location_ids, ar.action_ids, ar.is_active,
            MAX(a.triggered_at) AS last_triggered
     FROM alert_rules ar
     LEFT JOIN alerts a ON a.rule_id = ar.id
     GROUP BY ar.id
     ORDER BY ar.created_at DESC`
  );

  return (result.rows as any[]).map((row: any) => ({
    id: row.id,
    name: row.name,
    conditions: normalizeConditions(row.conditions_json || row.condition_json?.conditions, {
      metric: row.sensor_type,
      operator: row.condition_json?.op || ">",
      threshold: Number(row.condition_json?.value || 0),
    }),
    locationIds: normalizeLocations(row.location_ids || row.condition_json?.location_ids, row.condition_json?.location),
    actionIds: normalizeActions(row.action_ids || row.condition_json?.action_ids, row.condition_json?.action),
    status: row.is_active ? "active" : "disabled",
    lastTriggered: row.last_triggered ? new Date(row.last_triggered).toISOString() : "Never",
  }));
}

export async function getRuleById(id: string): Promise<RuleDTO | null> {
  // DEV_MODE: return generated rule by id.
  if (DEV_MODE) return getDevRuleById(id);

  const result = await db.query(
    `SELECT ar.id, ar.name, ar.sensor_type, ar.condition_json, ar.conditions_json, ar.location_ids, ar.action_ids, ar.is_active,
            MAX(a.triggered_at) AS last_triggered
     FROM alert_rules ar
     LEFT JOIN alerts a ON a.rule_id = ar.id
     WHERE ar.id = $1
     GROUP BY ar.id`,
    [id]
  );
  if (!result.rows.length) return null;
  const row = result.rows[0] as any;
  return {
    id: row.id,
    name: row.name,
    conditions: normalizeConditions(row.conditions_json || row.condition_json?.conditions, {
      metric: row.sensor_type,
      operator: row.condition_json?.op || ">",
      threshold: Number(row.condition_json?.value || 0),
    }),
    locationIds: normalizeLocations(row.location_ids || row.condition_json?.location_ids, row.condition_json?.location),
    actionIds: normalizeActions(row.action_ids || row.condition_json?.action_ids, row.condition_json?.action),
    status: row.is_active ? "active" : "disabled",
    lastTriggered: row.last_triggered ? new Date(row.last_triggered).toISOString() : "Never",
  };
}

export async function createRule(payload: any): Promise<RuleDTO> {
  // DEV_MODE: create in-memory rule only.
  if (DEV_MODE) return createDevRule(payload);

  // Validate payload against DTO expectations.
  const validation = ruleValidator(payload);
  if (!validation.valid) throw new Error(validation.message);

  const conditions = normalizeConditions(payload.conditions);
  const locationIds = normalizeLocations(payload.locationIds);
  const actionIds = normalizeActions(payload.actionIds);
  const condition = {
    conditions,
    location_ids: locationIds,
    action_ids: actionIds,
  };

  const result = await db.query(
    `INSERT INTO alert_rules (name, sensor_type, condition_json, conditions_json, location_ids, action_ids, severity, is_active, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, true, NOW(), NOW())
     RETURNING *`,
    [payload.name, "MULTI", condition, conditions, locationIds, actionIds, payload.severity || "MEDIUM"]
  );

  const row = result.rows[0];
  return {
    id: row.id,
    name: row.name,
    conditions,
    locationIds,
    actionIds,
    status: row.is_active ? "active" : "disabled",
    lastTriggered: "Never",
  };
}

export async function updateRule(id: string, payload: any): Promise<RuleDTO | null> {
  // DEV_MODE: update in-memory rule only.
  if (DEV_MODE) return updateDevRule(id, payload);

  const conditions = payload.conditions ? normalizeConditions(payload.conditions) : undefined;
  const locationIds = payload.locationIds ? normalizeLocations(payload.locationIds) : undefined;
  const actionIds = payload.actionIds ? normalizeActions(payload.actionIds) : undefined;
  const condition = payload.conditions || payload.locationIds || payload.actionIds
    ? {
        conditions: conditions || [],
        location_ids: locationIds || ["all"],
        action_ids: actionIds || ["notification"],
      }
    : undefined;

  const result = await db.query(
    `UPDATE alert_rules
     SET name = COALESCE($2, name),
         sensor_type = COALESCE($3, sensor_type),
         condition_json = COALESCE($4, condition_json),
         conditions_json = COALESCE($5, conditions_json),
         location_ids = COALESCE($6, location_ids),
         action_ids = COALESCE($7, action_ids),
         is_active = COALESCE($8, is_active),
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, payload.name, payload.sensor_type, condition, conditions, locationIds, actionIds, payload.is_active]
  );

  if (!result.rows.length) return null;
  const row = result.rows[0];
  return {
    id: row.id,
    name: row.name,
    conditions: normalizeConditions(row.conditions_json || row.condition_json?.conditions, {
      metric: row.sensor_type,
      operator: row.condition_json?.op || ">",
      threshold: Number(row.condition_json?.value || 0),
    }),
    locationIds: normalizeLocations(row.location_ids || row.condition_json?.location_ids, row.condition_json?.location),
    actionIds: normalizeActions(row.action_ids || row.condition_json?.action_ids, row.condition_json?.action),
    status: row.is_active ? "active" : "disabled",
    lastTriggered: "Never",
  };
}

export async function deleteRule(id: string) {
  // DEV_MODE: soft delete in-memory rule only.
  if (DEV_MODE) return deleteDevRule(id);

  // Soft delete by marking inactive.
  const result = await db.query(
    `UPDATE alert_rules SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0] ?? null;
}

export async function toggleRule(id: string): Promise<RuleDTO | null> {
  if (DEV_MODE) {
    const rule = getDevRuleById(id);
    if (!rule) return null;
    const nextStatus = rule.status === "active" ? "disabled" : "active";
    return updateDevRule(id, { status: nextStatus });
  }

  const result = await db.query(
    `UPDATE alert_rules
     SET is_active = NOT is_active,
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id]
  );

  if (!result.rows.length) return null;
  const row = result.rows[0] as any;
  return {
    id: row.id,
    name: row.name,
    conditions: normalizeConditions(row.conditions_json || row.condition_json?.conditions, {
      metric: row.sensor_type,
      operator: row.condition_json?.op || ">",
      threshold: Number(row.condition_json?.value || 0),
    }),
    locationIds: normalizeLocations(row.location_ids || row.condition_json?.location_ids, row.condition_json?.location),
    actionIds: normalizeActions(row.action_ids || row.condition_json?.action_ids, row.condition_json?.action),
    status: row.is_active ? "active" : "disabled",
    lastTriggered: "Never",
  };
}

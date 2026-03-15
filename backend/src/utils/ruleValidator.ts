// Validates alert rule condition_json against allowed operators and metrics.
// Keeping validation centralized prevents inconsistent rule formats across modules.

const ALLOWED_METRICS = ["AQI", "TEMPERATURE", "HUMIDITY", "WATER_LEVEL"];
const ALLOWED_OPERATORS = [">", "<", ">=", "<=", "=="];

type ConditionPayload = {
  metric?: string;
  operator?: string;
  threshold?: number;
};

export function ruleValidator(payload: {
  name?: string;
  conditions?: ConditionPayload[];
  locationIds?: string[];
  actionIds?: string[];
}) {
  if (!payload.name) return { valid: false, message: "Rule name is required" };
  if (!Array.isArray(payload.conditions) || payload.conditions.length === 0) {
    return { valid: false, message: "At least one condition is required" };
  }
  for (const condition of payload.conditions) {
    if (!condition.metric || !ALLOWED_METRICS.includes(condition.metric.toUpperCase())) {
      return { valid: false, message: "Invalid metric in conditions" };
    }
    if (!condition.operator || !ALLOWED_OPERATORS.includes(condition.operator)) {
      return { valid: false, message: "Invalid operator in conditions" };
    }
    if (typeof condition.threshold !== "number") {
      return { valid: false, message: "Threshold must be a number" };
    }
  }
  if (!Array.isArray(payload.locationIds) || payload.locationIds.length === 0) {
    return { valid: false, message: "Select at least one location" };
  }
  if (!Array.isArray(payload.actionIds) || payload.actionIds.length === 0) {
    return { valid: false, message: "Select at least one action" };
  }
  return { valid: true };
}

// Validates alert rule condition_json against allowed operators and metrics.
// Keeping validation centralized prevents inconsistent rule formats across modules.

const ALLOWED_METRICS = ["AQI", "TEMPERATURE", "HUMIDITY", "WATER_LEVEL"];
const ALLOWED_OPERATORS = [">", "<", ">=", "<="];

export function ruleValidator(payload: {
  name?: string;
  metric?: string;
  operator?: string;
  threshold?: number;
}) {
  if (!payload.name) return { valid: false, message: "Rule name is required" };
  if (!payload.metric || !ALLOWED_METRICS.includes(payload.metric.toUpperCase())) {
    return { valid: false, message: "Invalid metric" };
  }
  if (!payload.operator || !ALLOWED_OPERATORS.includes(payload.operator)) {
    return { valid: false, message: "Invalid operator" };
  }
  if (typeof payload.threshold !== "number") {
    return { valid: false, message: "Threshold must be a number" };
  }
  return { valid: true };
}


type Condition = {
  metric: string;
  operator: string;
  threshold: number;
};

const ALLOWED_OPERATORS = [">", "<", ">=", "<=", "=="];

export function normalizeMetric(metric: string): string {
  const m = metric.toUpperCase();
  if (m === "WATERLEVEL" || m === "WATER_LEVEL" || m === "WATER LEVEL") return "WATER_LEVEL";
  if (m === "TEMPERATURE") return "TEMPERATURE";
  if (m === "HUMIDITY") return "HUMIDITY";
  return "AQI";
}

export function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function matchesLocation(
  locationIds: string[] | undefined,
  deviceLocationId?: string | null,
  deviceLocationSlug?: string | null
) {
  if (!locationIds || locationIds.length === 0) return true;
  if (locationIds.includes("all")) return true;
  if (deviceLocationId && locationIds.includes(deviceLocationId)) return true;
  if (deviceLocationSlug && locationIds.includes(deviceLocationSlug)) return true;
  return false;
}

export function matchesAnyCondition(
  conditions: Condition[] | undefined,
  readingMetric: string,
  readingValue: number
) {
  if (!conditions || conditions.length === 0) return false;
  const metric = normalizeMetric(readingMetric);

  return conditions.some((condition) => {
    if (!ALLOWED_OPERATORS.includes(condition.operator)) return false;
    if (normalizeMetric(condition.metric) !== metric) return false;
    const threshold = Number(condition.threshold);
    switch (condition.operator) {
      case ">":
        return readingValue > threshold;
      case ">=":
        return readingValue >= threshold;
      case "<":
        return readingValue < threshold;
      case "<=":
        return readingValue <= threshold;
      case "==":
        return readingValue === threshold;
      default:
        return false;
    }
  });
}

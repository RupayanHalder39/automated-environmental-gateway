export interface AnomalyDTO {
  id: string;
  sensorId: string;
  invalidValue: string;
  expectedRange: string;
  timestamp: string;
  reason: string;
  severity: "high" | "medium" | "low";
}

export interface AnomalySummaryDTO {
  totalRejected: number;
  highSeverity: number;
  mediumSeverity: number;
}


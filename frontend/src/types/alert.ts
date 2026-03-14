export interface AlertDTO {
  id: string;
  type: "critical" | "warning" | "info";
  message: string;
  location: string;
  timestamp: string;
  status: "active" | "resolved" | "dismissed";
  value: string;
}

export interface AlertSummaryDTO {
  active: number;
  critical: number;
  resolvedToday: number;
}


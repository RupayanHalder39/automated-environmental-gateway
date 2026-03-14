export interface HistoryPointDTO {
  date: string;
  [location: string]: string | number;
}

export interface HistorySummaryDTO {
  average: number;
  highest: number;
  lowest: number;
  alertsTriggered: number;
  metric: "aqi" | "temperature" | "humidity" | "waterLevel";
  unit: string;
}


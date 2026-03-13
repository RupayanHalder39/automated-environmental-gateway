// DTOs for HistoryService (Historical Data)
// Maps to Figma HistoricalData chart and summary cards.

export interface HistoryPointDTO {
  date: string; // formatted date label
  [location: string]: string | number; // dynamic locations (Salt Lake, New Town, Sector V)
}

export interface HistorySummaryDTO {
  average: number;
  highest: number;
  lowest: number;
  alertsTriggered: number;
  metric: "aqi" | "temperature" | "humidity" | "waterLevel";
  unit: string;
}


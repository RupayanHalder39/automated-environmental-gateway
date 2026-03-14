export interface ReportDTO {
  id: string;
  name: string;
  type: string;
  zone: string;
  dateRange: string;
  generated: string;
  avgAqi: number;
  highestPollution: string;
  waterAlerts: number;
}


// DTOs for ReportService (Reports)
// Maps to Figma Reports generatedReports list.

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


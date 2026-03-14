import { apiGet, apiPost } from "../utils/apiClient";
import type { ApiResponse } from "../types/response";
import type { ReportDTO } from "../types/report";

// ReportService API client for Reports page
export function fetchReports() {
  return apiGet<ApiResponse<ReportDTO[]>>("/reports");
}

export function fetchReportById(id: string) {
  return apiGet<ApiResponse<ReportDTO | null>>(`/reports/${id}`);
}

export function createReport(payload: Partial<ReportDTO>) {
  return apiPost<ApiResponse<ReportDTO>>("/reports", payload);
}


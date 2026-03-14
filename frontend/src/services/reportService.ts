import { apiDelete, apiGet, apiGetBlob, apiPost } from "../utils/apiClient";
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

export function deleteReport(id: string) {
  return apiDelete<ApiResponse<ReportDTO | null>>(`/reports/${id}`);
}

export function downloadReport(id: string) {
  return apiGetBlob(`/reports/${id}/download`);
}

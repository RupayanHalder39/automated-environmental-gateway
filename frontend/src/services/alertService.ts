import { apiGet, apiPost, apiPatch } from "../utils/apiClient";
import type { ApiResponse } from "../types/response";
import type { AlertDTO, AlertSummaryDTO } from "../types/alert";

// AlertService API client for Alerts page
export function fetchAlerts(status?: string) {
  const qs = status ? `?status=${status}` : "";
  return apiGet<ApiResponse<AlertDTO[]>>(`/alerts${qs}`);
}

export function fetchAlertById(id: string) {
  return apiGet<ApiResponse<AlertDTO | null>>(`/alerts/${id}`);
}

export function acknowledgeAlert(id: string) {
  return apiPatch<ApiResponse<any>>(`/alerts/${id}/acknowledge`, {});
}

export function resolveAlert(id: string) {
  return apiPatch<ApiResponse<any>>(`/alerts/${id}/resolve`, {});
}

export function fetchAlertSummary() {
  return apiGet<ApiResponse<AlertSummaryDTO>>("/alerts/summary");
}

export function triggerAlerts(payload: { sensorCode: string; deviceCode: string; metric: string; value: number }) {
  return apiPost<ApiResponse<any>>("/alerts/trigger", payload);
}


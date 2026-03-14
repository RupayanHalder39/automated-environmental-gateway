import { apiGet, apiPost, apiPatch } from "../utils/apiClient";
import type { ApiResponse } from "../types/response";
import type { AnomalyDTO, AnomalySummaryDTO } from "../types/anomaly";

// AnomalyService API client for Data Sanity page
export function fetchAnomalies() {
  return apiGet<ApiResponse<AnomalyDTO[]>>("/anomalies");
}

export function fetchAnomalyById(id: string) {
  return apiGet<ApiResponse<AnomalyDTO | null>>(`/anomalies/${id}`);
}

export function fetchAnomalySummary() {
  return apiGet<ApiResponse<AnomalySummaryDTO>>("/anomalies/summary");
}

export function fetchAnomaliesBySensor(sensorId: string) {
  return apiGet<ApiResponse<AnomalyDTO[]>>(`/anomalies/by-sensor/${sensorId}`);
}

export function createAnomaly(payload: Partial<AnomalyDTO>) {
  return apiPost<ApiResponse<AnomalyDTO>>("/anomalies", payload);
}

export function updateAnomalySettings(payload: any) {
  return apiPatch<ApiResponse<any>>("/anomalies/settings", payload);
}


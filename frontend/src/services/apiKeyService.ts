import { apiGet, apiPost, apiPatch } from "../utils/apiClient";
import type { ApiResponse } from "../types/response";
import type { ApiKeyDTO } from "../types/apiKey";

// ApiKeyService API client for Public API page
export function fetchApiKeys() {
  return apiGet<ApiResponse<ApiKeyDTO[]>>("/api-keys");
}

export function createApiKey(name: string, scopes?: string[]) {
  return apiPost<ApiResponse<ApiKeyDTO>>("/api-keys", { name, scopes });
}

export function disableApiKey(id: string) {
  return apiPatch<ApiResponse<any>>(`/api-keys/${id}/disable`, {});
}

export function rotateApiKey(id: string) {
  return apiPatch<ApiResponse<ApiKeyDTO | null>>(`/api-keys/${id}/rotate`, {});
}

export function fetchPublicAqi(location: string) {
  return apiGet<ApiResponse<any>>(`/public/aqi?location=${location}`);
}

export function fetchPublicSensors() {
  return apiGet<ApiResponse<any>>("/public/sensors");
}

export function fetchPublicHistorical(metric: string, days = 7) {
  return apiGet<ApiResponse<any>>(`/public/historical?metric=${metric}&days=${days}`);
}


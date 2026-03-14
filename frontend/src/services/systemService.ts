import { apiGet } from "../utils/apiClient";
import type { ApiResponse } from "../types/response";
import type { SystemStatusDTO } from "../types/system";

// SystemService API client for System Status page
export function fetchSystemStatus() {
  return apiGet<ApiResponse<SystemStatusDTO>>("/system/status");
}

export function fetchSystemMetrics() {
  return apiGet<ApiResponse<any>>("/system/metrics");
}

export function fetchIngestionStatus() {
  return apiGet<ApiResponse<any>>("/system/ingestion");
}


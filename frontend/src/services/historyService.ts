import { apiGet } from "../utils/apiClient";
import type { ApiResponse, PaginatedResponse } from "../types/response";
import type { HistoryPointDTO } from "../types/history";

// HistoryService API client for Historical Data page
export function fetchHistoryReadings(sensorId: string, from: string, to: string, page = 1, pageSize = 50) {
  const qs = new URLSearchParams({ sensor_id: sensorId, from, to, page: String(page), pageSize: String(pageSize) });
  return apiGet<PaginatedResponse<any[]>>(`/history/readings?${qs.toString()}`);
}

export function fetchHistoryAggregate(metric: string, from: string, to: string, interval = "1h", location?: string) {
  const qs = new URLSearchParams({ metric, from, to, interval });
  if (location) qs.set("location", location);
  return apiGet<ApiResponse<HistoryPointDTO[]>>(`/history/aggregate?${qs.toString()}`);
}

export function fetchDeviceAggregate(deviceId: string, from: string, to: string, interval = "1h") {
  const qs = new URLSearchParams({ from, to, interval });
  return apiGet<ApiResponse<any>>(`/history/devices/${deviceId}/aggregate?${qs.toString()}`);
}

export function exportHistory(metric: string, from: string, to: string, location?: string) {
  const qs = new URLSearchParams({ metric, from, to });
  if (location) qs.set("location", location);
  return apiGet<ApiResponse<any>>(`/history/export?${qs.toString()}`);
}


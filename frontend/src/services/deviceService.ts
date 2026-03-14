import { apiGet, apiPatch } from "../utils/apiClient";
import type { ApiResponse } from "../types/response";
import type { DeviceDTO, DeviceHealthSummaryDTO } from "../types/device";

// DeviceService API client for Device Health page
export function fetchDevices() {
  return apiGet<ApiResponse<DeviceDTO[]>>("/devices");
}

export function fetchDeviceById(id: string) {
  return apiGet<ApiResponse<DeviceDTO | null>>(`/devices/${id}`);
}

export function fetchDeviceHeartbeats(id: string, range = "24h") {
  return apiGet<ApiResponse<any>>(`/devices/${id}/heartbeats?range=${range}`);
}

export function fetchDeviceHealthSummary() {
  return apiGet<ApiResponse<DeviceHealthSummaryDTO>>("/devices/health/summary");
}

export function updateDeviceStatus(id: string, status: string) {
  return apiPatch<ApiResponse<any>>(`/devices/${id}/status`, { status });
}


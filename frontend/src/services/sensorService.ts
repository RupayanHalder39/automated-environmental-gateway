import { apiGet } from "../utils/apiClient";
import type { ApiResponse } from "../types/response";
import type { SensorDTO, SensorSummaryDTO } from "../types/sensor";

// SensorService API client for Dashboard data
export function fetchSensors() {
  return apiGet<ApiResponse<SensorDTO[]>>("/sensors");
}

export function fetchSensorById(id: string) {
  return apiGet<ApiResponse<SensorDTO | null>>(`/sensors/${id}`);
}

export function fetchSensorLatest(id: string) {
  return apiGet<ApiResponse<any>>(`/sensors/${id}/latest`);
}

export function fetchLatestByType(type: string) {
  return apiGet<ApiResponse<any>>(`/sensors/latest?type=${type}`);
}

export function fetchSensorSummary(range = "15m") {
  return apiGet<ApiResponse<SensorSummaryDTO>>(`/sensors/summary?range=${range}`);
}

export function fetchSensorHealth() {
  return apiGet<ApiResponse<any>>("/sensors/health");
}


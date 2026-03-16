import { apiDelete, apiGet, apiPost, apiPut } from "../utils/apiClient";
import type { ApiResponse } from "../types/response";
import type { SensorDTO, SensorSummaryDTO } from "../types/sensor";

// SensorService API client for Dashboard data
export function fetchSensors(includeInactive?: boolean) {
  const query = includeInactive ? "?includeInactive=true" : "";
  return apiGet<ApiResponse<SensorDTO[]>>(`/sensors${query}`);
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

export function createSensor(payload: {
  id: string;
  locationId: string;
  sensorType: string;
  status: "online" | "offline" | "inactive";
}) {
  return apiPost<ApiResponse<SensorDTO>>("/sensors", payload);
}

export function updateSensor(id: string, payload: Partial<{ locationId: string; sensorType: string; status: "online" | "offline" | "inactive" }>) {
  return apiPut<ApiResponse<SensorDTO | null>>(`/sensors/${id}`, payload);
}

export function deleteSensor(id: string) {
  return apiDelete<ApiResponse<SensorDTO | null>>(`/sensors/${id}`);
}

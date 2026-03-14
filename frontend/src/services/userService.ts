import { apiGet, apiPost, apiPatch } from "../utils/apiClient";
import type { ApiResponse } from "../types/response";

// UserService API client for Settings page
export function fetchUsers() {
  return apiGet<ApiResponse<any>>("/users");
}

export function fetchUserById(id: string) {
  return apiGet<ApiResponse<any>>(`/users/${id}`);
}

export function createUser(payload: any) {
  return apiPost<ApiResponse<any>>("/users", payload);
}

export function updateUser(id: string, payload: any) {
  return apiPatch<ApiResponse<any>>(`/users/${id}`, payload);
}

export function disableUser(id: string) {
  return apiPatch<ApiResponse<any>>(`/users/${id}/disable`, {});
}

export function updateNotificationSettings(payload: any) {
  return apiPatch<ApiResponse<any>>(`/settings/notifications`, payload);
}

export function updateSystemSettings(payload: any) {
  return apiPatch<ApiResponse<any>>(`/settings/system`, payload);
}


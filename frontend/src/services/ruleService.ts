import { apiGet, apiPost, apiPatch } from "../utils/apiClient";
import type { ApiResponse } from "../types/response";
import type { RuleDTO } from "../types/rule";

// RuleService API client for Rules Engine
export function fetchRules() {
  return apiGet<ApiResponse<RuleDTO[]>>("/rules");
}

export function fetchRuleById(id: string) {
  return apiGet<ApiResponse<RuleDTO | null>>(`/rules/${id}`);
}

export function createRule(payload: Partial<RuleDTO>) {
  return apiPost<ApiResponse<RuleDTO>>("/rules", payload);
}

export function updateRule(id: string, payload: Partial<RuleDTO>) {
  return apiPatch<ApiResponse<RuleDTO | null>>(`/rules/${id}`, payload);
}

export function toggleRule(id: string) {
  return apiPatch<ApiResponse<RuleDTO | null>>(`/rules/${id}/toggle`, {});
}

export function deleteRule(id: string) {
  return apiPatch<ApiResponse<any>>(`/rules/${id}`, { is_active: false });
}

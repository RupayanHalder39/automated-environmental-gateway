import { apiGet, apiPost } from "../utils/apiClient";
import type { ApiResponse } from "../types/response";
import type { SyncBatchDTO } from "../types/sync";

// SyncService API client for Bulk Data Sync page
export function createSyncBatch(source: string) {
  return apiPost<ApiResponse<any>>("/sync/batches", { source });
}

export function fetchSyncBatches() {
  return apiGet<ApiResponse<SyncBatchDTO[]>>("/sync/batches");
}

export function fetchSyncBatchById(id: string) {
  return apiGet<ApiResponse<SyncBatchDTO | null>>(`/sync/batches/${id}`);
}

export function ingestSyncBatch(id: string, readings: any[]) {
  return apiPost<ApiResponse<any>>(`/sync/batches/${id}/ingest`, { readings });
}


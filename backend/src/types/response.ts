// Shared response envelope types used by all controllers.
// Consistent envelopes reduce frontend conditionals and make errors predictable.

export interface ApiError {
  code: string; // machine-readable error code
  message: string; // human-readable error message
}

export interface ApiResponse<T> {
  // Use `data` for successful responses.
  // Use `error` when something goes wrong.
  data?: T;
  error?: ApiError;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  page?: number;
  pageSize?: number;
  total?: number;
}


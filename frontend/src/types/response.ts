// Shared response envelope used by backend.
// Frontend expects all API responses to follow this shape.

export interface ApiError {
  code: string;
  message: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  page?: number;
  pageSize?: number;
  total?: number;
}


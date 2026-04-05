// API envelope types matching backend response format

export interface ApiMeta {
  timestamp: string;
  requestId: string;
}

export interface ApiError {
  code?: string;
  message: string;
  field?: string;
}

export interface ApiResponse<T> {
  data: T;
  meta: ApiMeta;
  errors: ApiError[];
}

export interface PaginatedResult<T> {
  items: T[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ApiListResponse<T> {
  data: PaginatedResult<T>;
  meta: ApiMeta;
  errors: ApiError[];
}

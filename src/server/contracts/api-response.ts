export type SortOrder = "asc" | "desc";

export type ApiPagination = {
  page: number;
  pageSize: number;
  total: number;
  sortBy: string;
  sortOrder: SortOrder;
};

export type ApiResponse<TData> = {
  code: number;
  message: string;
  data: TData;
  pagination?: ApiPagination;
};

export function createSuccessResponse<TData>(
  data: TData,
  message = "ok",
): ApiResponse<TData> {
  return {
    code: 0,
    message,
    data,
  };
}

export function createPaginatedResponse<TData>(
  data: TData,
  pagination: ApiPagination,
  message = "ok",
): ApiResponse<TData> {
  return {
    code: 0,
    message,
    data,
    pagination,
  };
}

export function createErrorResponse(
  code: number,
  message: string,
): ApiResponse<null> {
  return {
    code,
    message,
    data: null,
  };
}

import type { SortOrder } from "../contracts/api-response";

export type PaginationInput = {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: string;
};

export type NormalizedPagination = {
  page: number;
  pageSize: number;
  sortBy: string;
  sortOrder: SortOrder;
};

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const DEFAULT_SORT_BY = "createdAt";
const DEFAULT_SORT_ORDER: SortOrder = "desc";

export function normalizePagination(
  input: PaginationInput = {},
): NormalizedPagination {
  const page =
    typeof input.page === "number" && input.page >= DEFAULT_PAGE
      ? Math.floor(input.page)
      : DEFAULT_PAGE;
  const requestedPageSize =
    typeof input.pageSize === "number" && input.pageSize > 0
      ? Math.floor(input.pageSize)
      : DEFAULT_PAGE_SIZE;
  const pageSize = Math.min(requestedPageSize, MAX_PAGE_SIZE);
  const sortBy = input.sortBy?.trim() || DEFAULT_SORT_BY;
  const sortOrder = input.sortOrder === "asc" ? "asc" : DEFAULT_SORT_ORDER;

  return {
    page,
    pageSize,
    sortBy,
    sortOrder,
  };
}

export const ADMIN_DEFAULT_PAGE_SIZE = 20;

export const ADMIN_PAGE_SIZE_OPTIONS = [20, 50, 100] as const;

export const ADMIN_CONFLICT_MESSAGE = "数据已被其他操作更新，请刷新后重试";

export type AdminPageSize = (typeof ADMIN_PAGE_SIZE_OPTIONS)[number];

export type AdminSortOrder = "asc" | "desc";

export type AdminListQuery = {
  page: number;
  pageSize: AdminPageSize;
  sortBy: string;
  sortOrder: AdminSortOrder;
  filterRevision: number;
  lastChangedFilter: string | null;
};

export function createAdminListQuery(
  overrides: Partial<AdminListQuery> = {},
): AdminListQuery {
  return {
    page: 1,
    pageSize: ADMIN_DEFAULT_PAGE_SIZE,
    sortBy: "updatedAt",
    sortOrder: "desc",
    filterRevision: 0,
    lastChangedFilter: null,
    ...overrides,
  };
}

export function toggleAdminListSort(
  query: AdminListQuery,
  sortBy: string,
): AdminListQuery {
  const isSameSort = query.sortBy === sortBy;
  const nextSortOrder: AdminSortOrder =
    isSameSort && query.sortOrder === "desc" ? "asc" : "desc";

  return {
    ...query,
    page: 1,
    sortBy,
    sortOrder: nextSortOrder,
  };
}

export function applyAdminListFilter(
  query: AdminListQuery,
  filterName: string,
): AdminListQuery {
  return {
    ...query,
    page: 1,
    filterRevision: query.filterRevision + 1,
    lastChangedFilter: filterName,
  };
}

export function updateAdminPageSize(
  query: AdminListQuery,
  pageSize: AdminPageSize,
): AdminListQuery {
  return {
    ...query,
    page: 1,
    pageSize,
  };
}

export function isAdminPageSize(value: number): value is AdminPageSize {
  return ADMIN_PAGE_SIZE_OPTIONS.includes(value as AdminPageSize);
}

import {
  ADMIN_DEFAULT_PAGE_SIZE,
  isAdminPageSize,
  type AdminPageSize,
  type AdminSortOrder,
} from "@/server/contracts/admin-interaction-contract";

export type AdminListUrlQuery<TSortBy extends string> = {
  page: number;
  pageSize: AdminPageSize;
  sortBy: TSortBy;
  sortOrder: AdminSortOrder;
};

type AdminListUrlQueryOptions<TSortBy extends string> = {
  allowedSortBy: readonly TSortBy[];
  defaultSortBy: TSortBy;
  defaultSortOrder?: AdminSortOrder;
};

export function parseAdminListUrlQuery<TSortBy extends string>(
  searchParams: URLSearchParams,
  {
    allowedSortBy,
    defaultSortBy,
    defaultSortOrder = "desc",
  }: AdminListUrlQueryOptions<TSortBy>,
): AdminListUrlQuery<TSortBy> {
  const page = Number(searchParams.get("page"));
  const pageSize = Number(searchParams.get("pageSize"));
  const sortBy = searchParams.get("sortBy");
  const sortOrder = searchParams.get("sortOrder");

  return {
    page: Number.isInteger(page) && page > 0 ? page : 1,
    pageSize: isAdminPageSize(pageSize) ? pageSize : ADMIN_DEFAULT_PAGE_SIZE,
    sortBy: allowedSortBy.includes(sortBy as TSortBy)
      ? (sortBy as TSortBy)
      : defaultSortBy,
    sortOrder:
      sortOrder === "asc" || sortOrder === "desc"
        ? sortOrder
        : defaultSortOrder,
  };
}

export function createAdminListSearchParams<TSortBy extends string>({
  page,
  pageSize,
  sortBy,
  sortOrder,
}: AdminListUrlQuery<TSortBy>) {
  return new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    sortBy,
    sortOrder,
  });
}

type AdminListIntent = {
  cancel: () => void;
  isCurrent: () => boolean;
};

export function createAdminListLatestIntent() {
  let currentRevision = 0;

  return {
    begin(): AdminListIntent {
      const revision = currentRevision + 1;
      currentRevision = revision;

      return {
        cancel() {
          if (currentRevision === revision) {
            currentRevision += 1;
          }
        },
        isCurrent() {
          return currentRevision === revision;
        },
      };
    },
  };
}

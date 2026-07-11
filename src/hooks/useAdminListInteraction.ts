"use client";

import { useMemo, useState } from "react";

import {
  applyAdminListFilter,
  createAdminListQuery,
  isAdminPageSize,
  toggleAdminListSort,
  updateAdminPage,
  updateAdminPageSize,
  type AdminListQuery,
} from "@/server/contracts/admin-interaction-contract";

type AdminListInteractionOptions = {
  initialQuery?: Partial<AdminListQuery>;
};

export function useAdminListInteraction({
  initialQuery,
}: AdminListInteractionOptions = {}) {
  const [query, setQuery] = useState(() => createAdminListQuery(initialQuery));

  const refreshCount = useMemo(() => query.filterRevision, [query]);

  function handlePageSizeChange(value: string) {
    const parsedPageSize = Number(value);

    if (!isAdminPageSize(parsedPageSize)) {
      return;
    }

    setQuery((currentQuery) =>
      updateAdminPageSize(currentQuery, parsedPageSize),
    );
  }

  function handleSortChange(sortBy: string) {
    setQuery((currentQuery) => toggleAdminListSort(currentQuery, sortBy));
  }

  function handleFilterChange(filterName: string) {
    setQuery((currentQuery) => applyAdminListFilter(currentQuery, filterName));
  }

  function handlePageChange(page: number) {
    setQuery((currentQuery) => updateAdminPage(currentQuery, page));
  }

  return {
    handleFilterChange,
    handlePageChange,
    handlePageSizeChange,
    handleSortChange,
    query,
    refreshCount,
  };
}

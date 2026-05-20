"use client";

import { useMemo, useState } from "react";

import {
  applyAdminListFilter,
  createAdminListQuery,
  isAdminPageSize,
  toggleAdminListSort,
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

  return {
    handleFilterChange,
    handlePageSizeChange,
    handleSortChange,
    query,
    refreshCount,
  };
}

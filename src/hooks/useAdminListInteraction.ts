"use client";

import { useRef, useState } from "react";

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
  resetQuery?: Partial<AdminListQuery>;
};

export function useAdminListInteraction({
  initialQuery,
  resetQuery,
}: AdminListInteractionOptions = {}) {
  const [query, setQuery] = useState(() => createAdminListQuery(initialQuery));
  const shouldResetToDefaults = resetQuery !== undefined;
  const resetQueryRef = useRef(
    createAdminListQuery({
      sortBy:
        resetQuery?.sortBy ??
        (shouldResetToDefaults ? "updatedAt" : initialQuery?.sortBy),
      sortOrder:
        resetQuery?.sortOrder ??
        (shouldResetToDefaults ? "desc" : initialQuery?.sortOrder),
      ...resetQuery,
    }),
  );

  const refreshCount = query.filterRevision;

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

  function handleReset() {
    setQuery({ ...resetQueryRef.current });
  }

  return {
    handleFilterChange,
    handlePageChange,
    handlePageSizeChange,
    handleReset,
    handleSortChange,
    query,
    refreshCount,
  };
}

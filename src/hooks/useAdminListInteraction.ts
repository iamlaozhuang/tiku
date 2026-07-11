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
};

export function useAdminListInteraction({
  initialQuery,
}: AdminListInteractionOptions = {}) {
  const [query, setQuery] = useState(() => createAdminListQuery(initialQuery));
  const resetQueryRef = useRef(
    createAdminListQuery({
      sortBy: initialQuery?.sortBy ?? "updatedAt",
      sortOrder: initialQuery?.sortOrder ?? "desc",
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

"use client";

import { useEffect, useRef, useState } from "react";

import { AdminPagination } from "@/components/admin/AdminList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  fetchAdminApi,
  getStoredSessionToken,
} from "@/features/admin/content-admin-runtime";
import type { ApiPagination } from "@/server/contracts/api-response";
import type { OrganizationListDto } from "@/server/contracts/admin-user-org-auth-ops-contract";

const PAGE_SIZE = 20;

export type AdminOrganizationReference =
  OrganizationListDto["organizations"][number];

type LoadState = "empty" | "error" | "loading" | "ready";

type AdminOrganizationReferencePickerProps = {
  disabled?: boolean;
  emptyMessage?: string;
  errorMessage?: string;
  excludedPublicIds?: string[];
  initialOrganizations?: AdminOrganizationReference[];
  itemLabel?: string;
  loadingMessage?: string;
  onChange: (
    organizationPublicId: string,
    organization: AdminOrganizationReference | null,
  ) => void;
  retryLabel?: string;
  searchLabel: string;
  selectLabel: string;
  selectTestId?: string;
  value: string;
};

export function AdminOrganizationReferencePicker({
  disabled = false,
  emptyMessage = "没有匹配的组织",
  errorMessage = "组织加载失败",
  excludedPublicIds = [],
  initialOrganizations = [],
  itemLabel = "个组织",
  loadingMessage = "正在加载组织",
  onChange,
  retryLabel = "重试加载组织",
  searchLabel,
  selectLabel,
  selectTestId,
  value,
}: AdminOrganizationReferencePickerProps) {
  const excludedPublicIdsKey = excludedPublicIds.join("\u0000");
  const [keyword, setKeyword] = useState("");
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [organizations, setOrganizations] = useState<
    AdminOrganizationReference[]
  >(() =>
    initialOrganizations.filter(
      (organization) =>
        organization.status === "active" &&
        !excludedPublicIds.includes(organization.publicId),
    ),
  );
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<ApiPagination>({
    page: 1,
    pageSize: PAGE_SIZE,
    sortBy: "updatedAt",
    sortOrder: "desc",
    total: 0,
  });
  const [retryRevision, setRetryRevision] = useState(0);
  const [selectedOrganization, setSelectedOrganization] =
    useState<AdminOrganizationReference | null>(null);
  const requestSequenceRef = useRef(0);

  useEffect(() => {
    const sessionToken = getStoredSessionToken();
    const requestSequence = requestSequenceRef.current + 1;
    requestSequenceRef.current = requestSequence;
    const normalizedKeyword = keyword.trim();
    const searchParams = new URLSearchParams({
      page: `${page}`,
      pageSize: `${PAGE_SIZE}`,
      sortBy: "updatedAt",
      sortOrder: "desc",
      status: "active",
    });

    if (normalizedKeyword.length > 0) {
      searchParams.set("keyword", normalizedKeyword);
    }

    const loadTimer = window.setTimeout(
      () => {
        if (sessionToken === null) {
          setOrganizations([]);
          setLoadState("error");
          return;
        }

        void fetchAdminApi<OrganizationListDto>(
          `/api/v1/organizations?${searchParams.toString()}`,
          sessionToken,
        )
          .then((response) => {
            if (requestSequenceRef.current !== requestSequence) {
              return;
            }

            if (response.code !== 0 || response.data === null) {
              setOrganizations([]);
              setLoadState("error");
              return;
            }

            const nextOrganizations = response.data.organizations.filter(
              (organization) =>
                organization.status === "active" &&
                !excludedPublicIdsKey
                  .split("\u0000")
                  .includes(organization.publicId),
            );
            setOrganizations(nextOrganizations);
            setPagination(
              response.pagination ?? {
                page,
                pageSize: PAGE_SIZE,
                sortBy: "updatedAt",
                sortOrder: "desc",
                total: nextOrganizations.length,
              },
            );
            setLoadState(nextOrganizations.length === 0 ? "empty" : "ready");
          })
          .catch(() => {
            if (requestSequenceRef.current === requestSequence) {
              setOrganizations([]);
              setLoadState("error");
            }
          });
      },
      normalizedKeyword.length === 0 ? 0 : 150,
    );

    return () => window.clearTimeout(loadTimer);
  }, [excludedPublicIdsKey, keyword, page, retryRevision]);

  const visibleOrganizations =
    selectedOrganization !== null &&
    value === selectedOrganization.publicId &&
    !organizations.some(
      (organization) => organization.publicId === selectedOrganization.publicId,
    )
      ? [selectedOrganization, ...organizations]
      : organizations;

  return (
    <div className="border-border flex min-w-0 flex-col gap-2 rounded-md border p-3">
      <label className="flex min-w-0 flex-col gap-2 text-sm font-medium">
        <span className="text-text-secondary">{searchLabel}</span>
        <Input
          aria-label={searchLabel}
          autoComplete="off"
          disabled={disabled}
          placeholder="输入组织名称"
          value={keyword}
          onChange={(event) => {
            setLoadState("loading");
            setKeyword(event.currentTarget.value);
            setPage(1);
          }}
        />
      </label>
      <label className="flex min-w-0 flex-col gap-2 text-sm font-medium">
        <span className="text-text-secondary">{selectLabel}</span>
        <select
          aria-label={selectLabel}
          className="border-input bg-background text-foreground h-9 rounded-md border px-3 text-sm"
          data-testid={selectTestId}
          disabled={disabled}
          value={value}
          onChange={(event) => {
            const organizationPublicId = event.currentTarget.value;
            const organization =
              organizations.find(
                (candidate) => candidate.publicId === organizationPublicId,
              ) ?? null;
            setSelectedOrganization(organization);
            onChange(organizationPublicId, organization);
          }}
        >
          <option value="">请选择组织</option>
          {visibleOrganizations.map((organization) => (
            <option key={organization.publicId} value={organization.publicId}>
              {organization.name}
            </option>
          ))}
        </select>
      </label>
      {loadState === "loading" ? (
        <p className="text-text-muted text-xs" role="status">
          {loadingMessage}
        </p>
      ) : null}
      {loadState === "empty" ? (
        <p className="text-text-muted text-xs">{emptyMessage}</p>
      ) : null}
      {loadState === "error" ? (
        <div className="flex items-center justify-between gap-3">
          <p className="text-destructive text-xs">{errorMessage}</p>
          <Button
            size="sm"
            type="button"
            variant="outline"
            onClick={() => {
              setLoadState("loading");
              setRetryRevision((revision) => revision + 1);
            }}
          >
            {retryLabel}
          </Button>
        </div>
      ) : null}
      {loadState === "ready" ? (
        <AdminPagination
          itemLabel={itemLabel}
          page={pagination.page}
          pageSize={pagination.pageSize}
          total={pagination.total}
          onPageChange={(nextPage) => {
            setLoadState("loading");
            setPage(nextPage);
          }}
        />
      ) : null}
    </div>
  );
}

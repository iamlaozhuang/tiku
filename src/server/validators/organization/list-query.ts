import type { SortOrder } from "../../contracts/api-response";
import { orgTierValues } from "../../models/auth";
import type { OrgStatus } from "../organization";

export type OrganizationListSortBy =
  | "createdAt"
  | "name"
  | "orgTier"
  | "status"
  | "updatedAt";

export type NormalizedOrganizationListQuery = {
  keyword: string | null;
  orgTier: (typeof orgTierValues)[number] | null;
  page: number;
  pageSize: number;
  sortBy: OrganizationListSortBy;
  sortOrder: SortOrder;
  status: OrgStatus | null;
};

type ValidationResult<TValue> =
  | {
      success: true;
      value: TValue;
    }
  | {
      success: false;
      message: string;
    };

const organizationListSortByValues = [
  "createdAt",
  "name",
  "orgTier",
  "status",
  "updatedAt",
] satisfies OrganizationListSortBy[];

function readQueryValue(input: unknown, key: string): unknown {
  if (input instanceof URLSearchParams) {
    return input.get(key);
  }

  if (input instanceof URL) {
    return input.searchParams.get(key);
  }

  if (typeof input === "object" && input !== null && key in input) {
    return (input as Record<string, unknown>)[key];
  }

  return null;
}

function normalizePositiveInteger(
  value: unknown,
  fallback: number,
  maxValue: number,
): number {
  const numericValue =
    typeof value === "string"
      ? Number(value)
      : typeof value === "number"
        ? value
        : NaN;

  if (!Number.isInteger(numericValue) || numericValue < 1) {
    return fallback;
  }

  return Math.min(numericValue, maxValue);
}

function normalizeNullableText(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const text = value.trim();

  return text.length === 0 ? null : text;
}

function normalizeOrgTier(
  value: unknown,
): NormalizedOrganizationListQuery["orgTier"] {
  return typeof value === "string" &&
    orgTierValues.includes(value as (typeof orgTierValues)[number])
    ? (value as (typeof orgTierValues)[number])
    : null;
}

function normalizeOrgStatus(value: unknown): OrgStatus | null {
  return value === "active" || value === "disabled" ? value : null;
}

function normalizeSortBy(value: unknown): OrganizationListSortBy {
  return typeof value === "string" &&
    organizationListSortByValues.includes(value as OrganizationListSortBy)
    ? (value as OrganizationListSortBy)
    : "createdAt";
}

function normalizeSortOrder(value: unknown): SortOrder {
  return value === "asc" ? "asc" : "desc";
}

export function normalizeOrganizationListQuery(
  input: unknown,
): ValidationResult<NormalizedOrganizationListQuery> {
  return {
    success: true,
    value: {
      keyword: normalizeNullableText(readQueryValue(input, "keyword")),
      orgTier: normalizeOrgTier(readQueryValue(input, "orgTier")),
      page: normalizePositiveInteger(readQueryValue(input, "page"), 1, 10_000),
      pageSize: normalizePositiveInteger(
        readQueryValue(input, "pageSize"),
        20,
        100,
      ),
      sortBy: normalizeSortBy(readQueryValue(input, "sortBy")),
      sortOrder: normalizeSortOrder(readQueryValue(input, "sortOrder")),
      status: normalizeOrgStatus(readQueryValue(input, "status")),
    },
  };
}

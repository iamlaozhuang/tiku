import type { AuditLogListQuery } from "@/server/contracts/audit-log/log-governance-contract";

const auditLogPageSizeOptions = [20, 50, 100] as const;
const LOG_LIST_FILTER_TEXT_MAX_LENGTH = 128;

export function parseAuditLogListQuery(request: Request): AuditLogListQuery {
  const searchParams = new URL(request.url).searchParams;
  const resultStatus = searchParams.get("resultStatus");

  return {
    actionType: normalizeFilterText(searchParams.get("actionType")),
    actorPublicId: normalizeNullableText(searchParams.get("actorPublicId")),
    fromCreatedAt: normalizeIsoDateText(searchParams.get("fromCreatedAt")),
    keyword: normalizeNullableText(searchParams.get("keyword")),
    page: normalizePositiveInteger(searchParams.get("page"), 1),
    pageSize: normalizePageSize(searchParams.get("pageSize")),
    resultStatus:
      resultStatus === "success" || resultStatus === "failed"
        ? resultStatus
        : "all",
    sortBy: "createdAt",
    sortOrder: searchParams.get("sortOrder") === "asc" ? "asc" : "desc",
    targetResourceType: normalizeFilterText(
      searchParams.get("targetResourceType"),
    ),
    toCreatedAt: normalizeIsoDateText(searchParams.get("toCreatedAt")),
  };
}

function normalizeNullableText(value: string | null): string | null {
  if (value === null) {
    return null;
  }

  const normalizedText = value.trim();

  if (normalizedText.length > LOG_LIST_FILTER_TEXT_MAX_LENGTH) {
    return null;
  }

  return normalizedText.length === 0 ? null : normalizedText;
}

function normalizeFilterText(value: string | null): string | "all" {
  return normalizeNullableText(value) ?? "all";
}

function normalizeIsoDateText(value: string | null): string | null {
  const normalizedText = normalizeNullableText(value);

  if (normalizedText === null) {
    return null;
  }

  const timestamp = Date.parse(normalizedText);

  return Number.isNaN(timestamp) ? null : new Date(timestamp).toISOString();
}

function normalizePositiveInteger(
  value: string | null,
  fallback: number,
): number {
  const parsedValue = Number(value);

  return Number.isInteger(parsedValue) && parsedValue > 0
    ? parsedValue
    : fallback;
}

function normalizePageSize(value: string | null): 20 | 50 | 100 {
  const parsedValue = Number(value);

  return auditLogPageSizeOptions.includes(
    parsedValue as (typeof auditLogPageSizeOptions)[number],
  )
    ? (parsedValue as 20 | 50 | 100)
    : 20;
}

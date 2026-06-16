import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type {
  OrganizationAnalyticsDateRangeDto,
  OrganizationAnalyticsExportScope,
} from "../contracts/organization-analytics-contract";

const ORGANIZATION_ANALYTICS_ROUTE_INPUT_INVALID_CODE = 400185;
const ORGANIZATION_ANALYTICS_ROUTE_INPUT_INVALID_MESSAGE =
  "Invalid organization analytics route input.";
const ISO_UTC_DATE_TIME_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/u;

const organizationAnalyticsExportScopeValues = [
  "dashboard_summary",
  "employee_statistics_summary",
] as const satisfies readonly OrganizationAnalyticsExportScope[];

export type OrganizationAnalyticsSummaryRouteQuery = {
  organizationPublicId: string;
  dateRange: OrganizationAnalyticsDateRangeDto;
};

export type OrganizationAnalyticsExportReadinessRouteQuery =
  OrganizationAnalyticsSummaryRouteQuery & {
    exportScope: OrganizationAnalyticsExportScope;
  };

function createInvalidRouteInputResponse(): ApiResponse<null> {
  return createErrorResponse(
    ORGANIZATION_ANALYTICS_ROUTE_INPUT_INVALID_CODE,
    ORGANIZATION_ANALYTICS_ROUTE_INPUT_INVALID_MESSAGE,
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function selectTrimmedString(
  record: Record<string, unknown>,
  key: string,
): string | null {
  const value = record[key];

  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : null;
}

function isIsoUtcDateTime(value: string): boolean {
  return (
    ISO_UTC_DATE_TIME_PATTERN.test(value) && !Number.isNaN(Date.parse(value))
  );
}

function parseDateRange(
  record: Record<string, unknown>,
): OrganizationAnalyticsDateRangeDto | null {
  const startAt = selectTrimmedString(record, "startAt");
  const endAt = selectTrimmedString(record, "endAt");

  if (
    startAt === null ||
    endAt === null ||
    !isIsoUtcDateTime(startAt) ||
    !isIsoUtcDateTime(endAt) ||
    Date.parse(startAt) > Date.parse(endAt)
  ) {
    return null;
  }

  return {
    startAt,
    endAt,
  };
}

function parseSummaryRouteQuery(
  input: unknown,
): OrganizationAnalyticsSummaryRouteQuery | null {
  if (!isRecord(input)) {
    return null;
  }

  const organizationPublicId = selectTrimmedString(
    input,
    "organizationPublicId",
  );
  const dateRange = parseDateRange(input);

  if (organizationPublicId === null || dateRange === null) {
    return null;
  }

  return {
    organizationPublicId,
    dateRange,
  };
}

function parseExportScope(
  value: string | null,
): OrganizationAnalyticsExportScope | null {
  return organizationAnalyticsExportScopeValues.some(
    (exportScope) => exportScope === value,
  )
    ? (value as OrganizationAnalyticsExportScope)
    : null;
}

export function parseOrganizationAnalyticsSummaryRouteQuery(
  input: unknown,
): ApiResponse<OrganizationAnalyticsSummaryRouteQuery | null> {
  const routeQuery = parseSummaryRouteQuery(input);

  return routeQuery === null
    ? createInvalidRouteInputResponse()
    : createSuccessResponse(routeQuery);
}

export function parseOrganizationAnalyticsExportReadinessRouteQuery(
  input: unknown,
): ApiResponse<OrganizationAnalyticsExportReadinessRouteQuery | null> {
  const summaryRouteQuery = parseSummaryRouteQuery(input);

  if (!isRecord(input) || summaryRouteQuery === null) {
    return createInvalidRouteInputResponse();
  }

  const exportScope = parseExportScope(
    selectTrimmedString(input, "exportScope"),
  );

  return exportScope === null
    ? createInvalidRouteInputResponse()
    : createSuccessResponse({
        ...summaryRouteQuery,
        exportScope,
      });
}

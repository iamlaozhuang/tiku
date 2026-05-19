import type { SortOrder } from "../contracts/api-response";
import type { ExamStatus } from "../models/student-experience";

export type NormalizedExamReportListQuery = {
  page: number;
  pageSize: number;
  status: ExamStatus | null;
  search: string | null;
  sortBy: "generatedAt";
  sortOrder: SortOrder;
};

export type NormalizedGenerateExamReportInput = {
  mockExamPublicId: string;
};

export type NormalizedRetryLearningSuggestionInput = {
  requestedFromClientAt: string | null;
};

const reportStatusValues = new Set<ExamStatus>([
  "scoring",
  "scoring_partial_failed",
  "completed",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeOptionalString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : null;
}

function normalizeRequiredString(value: unknown): string | null {
  return normalizeOptionalString(value);
}

function normalizePositiveInteger(
  value: unknown,
  defaultValue: number,
): number {
  if (typeof value !== "string" && typeof value !== "number") {
    return defaultValue;
  }

  const parsedValue = Number.parseInt(String(value), 10);

  return Number.isInteger(parsedValue) && parsedValue > 0
    ? parsedValue
    : defaultValue;
}

function normalizePageSize(value: unknown): number {
  const pageSize = normalizePositiveInteger(value, 20);

  return [20, 50, 100].includes(pageSize) ? pageSize : 20;
}

function normalizeStatus(value: unknown): ExamStatus | null {
  const status = normalizeOptionalString(value);

  if (status === null || !reportStatusValues.has(status as ExamStatus)) {
    return null;
  }

  return status as ExamStatus;
}

export function normalizeExamReportListQuery(
  input: unknown,
): NormalizedExamReportListQuery {
  const query = isRecord(input) ? input : {};

  return {
    page: normalizePositiveInteger(query.page, 1),
    pageSize: normalizePageSize(query.pageSize),
    status: normalizeStatus(query.status),
    search: normalizeOptionalString(query.search),
    sortBy: "generatedAt",
    sortOrder: "desc",
  };
}

export function normalizeGenerateExamReportInput(
  input: unknown,
): NormalizedGenerateExamReportInput | null {
  if (!isRecord(input)) {
    return null;
  }

  const mockExamPublicId = normalizeRequiredString(input.mockExamPublicId);

  if (mockExamPublicId === null) {
    return null;
  }

  return {
    mockExamPublicId,
  };
}

export function normalizeRetryLearningSuggestionInput(
  input: unknown,
): NormalizedRetryLearningSuggestionInput {
  const value = isRecord(input) ? input : {};

  return {
    requestedFromClientAt: normalizeOptionalString(value.requestedFromClientAt),
  };
}

import type {
  AiCallLogFunctionType,
  AiCallLogListQuery,
  AiCallLogProfession,
  AiCallLogStatus,
} from "@/server/contracts/ai-call-log/log-governance-contract";

const aiCallLogFunctionTypes = [
  "ai_scoring",
  "ai_explanation",
  "ai_hint",
  "kn_recommendation",
  "learning_suggestion",
  "ai_question_generation",
  "ai_paper_generation",
] as const;
const aiCallLogStatuses = ["success", "failed"] as const;
const aiCallLogProfessions = ["monopoly", "marketing", "logistics"] as const;
const aiCallLogPageSizeOptions = [20, 50, 100] as const;
const LOG_LIST_FILTER_TEXT_MAX_LENGTH = 128;

export function parseAiCallLogListQuery(request: Request): AiCallLogListQuery {
  const searchParams = new URL(request.url).searchParams;

  return {
    aiFuncType: normalizeAiFunctionType(searchParams.get("aiFuncType")),
    callStatus: normalizeCallStatus(searchParams.get("callStatus")),
    level: normalizeLevel(searchParams.get("level")),
    organizationPublicId: normalizeNullableText(
      searchParams.get("organizationPublicId"),
    ),
    page: normalizePositiveInteger(searchParams.get("page"), 1),
    pageSize: normalizePageSize(searchParams.get("pageSize")),
    profession: normalizeProfession(searchParams.get("profession")),
    sortBy:
      searchParams.get("sortBy") === "completedAt"
        ? "completedAt"
        : "startedAt",
    sortOrder: searchParams.get("sortOrder") === "asc" ? "asc" : "desc",
    userPublicId: normalizeNullableText(searchParams.get("userPublicId")),
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

function normalizeAiFunctionType(
  value: string | null,
): AiCallLogFunctionType | "all" {
  const normalizedText = normalizeNullableText(value);

  return normalizedText !== null &&
    aiCallLogFunctionTypes.includes(normalizedText as AiCallLogFunctionType)
    ? (normalizedText as AiCallLogFunctionType)
    : "all";
}

function normalizeCallStatus(value: string | null): AiCallLogStatus | "all" {
  const normalizedText = normalizeNullableText(value);

  return normalizedText !== null &&
    aiCallLogStatuses.includes(normalizedText as AiCallLogStatus)
    ? (normalizedText as AiCallLogStatus)
    : "all";
}

function normalizeProfession(
  value: string | null,
): AiCallLogProfession | "all" {
  const normalizedText = normalizeNullableText(value);

  return normalizedText !== null &&
    aiCallLogProfessions.includes(normalizedText as AiCallLogProfession)
    ? (normalizedText as AiCallLogProfession)
    : "all";
}

function normalizeLevel(value: string | null): number | null {
  const parsedValue = Number(value);

  return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : null;
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

  return aiCallLogPageSizeOptions.includes(
    parsedValue as (typeof aiCallLogPageSizeOptions)[number],
  )
    ? (parsedValue as 20 | 50 | 100)
    : 20;
}

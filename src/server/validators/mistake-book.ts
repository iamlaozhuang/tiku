import type { SortOrder } from "../contracts/api-response";
import type { QuestionType } from "../models/paper";
import type {
  MistakeBookSource,
  MistakeBookStatus,
} from "../models/student-experience";

export type NormalizedMistakeBookListQuery = {
  page: number;
  pageSize: number;
  questionType: QuestionType | null;
  source: MistakeBookSource | null;
  status: MistakeBookStatus | null;
  isFavorite: boolean | null;
  sortBy: "latestWrongAt";
  sortOrder: SortOrder;
};

export type NormalizedAiExplanationInput = {
  requestedFromClientAt: string | null;
};

const supportedObjectiveQuestionTypes = new Set<QuestionType>([
  "single_choice",
  "multi_choice",
  "true_false",
  "fill_blank",
]);

const supportedSources = new Set<MistakeBookSource>([
  "wrong_answer",
  "favorite",
]);

const supportedStatuses = new Set<MistakeBookStatus>([
  "unmastered",
  "mastered",
  "removed",
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

function normalizeQuestionType(value: unknown): QuestionType | null {
  const questionType = normalizeOptionalString(value);

  if (
    questionType === null ||
    !supportedObjectiveQuestionTypes.has(questionType as QuestionType)
  ) {
    return null;
  }

  return questionType as QuestionType;
}

function normalizeSource(value: unknown): MistakeBookSource | null {
  const source = normalizeOptionalString(value);

  if (source === null || !supportedSources.has(source as MistakeBookSource)) {
    return null;
  }

  return source as MistakeBookSource;
}

function normalizeStatus(value: unknown): MistakeBookStatus | null {
  const status = normalizeOptionalString(value);

  if (status === null || !supportedStatuses.has(status as MistakeBookStatus)) {
    return null;
  }

  return status as MistakeBookStatus;
}

function normalizeBoolean(value: unknown): boolean | null {
  if (value === true || value === "true") {
    return true;
  }

  if (value === false || value === "false") {
    return false;
  }

  return null;
}

export function normalizeMistakeBookListQuery(
  input: unknown,
): NormalizedMistakeBookListQuery {
  const query = isRecord(input) ? input : {};

  return {
    page: normalizePositiveInteger(query.page, 1),
    pageSize: normalizePageSize(query.pageSize),
    questionType: normalizeQuestionType(query.questionType),
    source: normalizeSource(query.source),
    status: normalizeStatus(query.status),
    isFavorite: normalizeBoolean(query.isFavorite),
    sortBy: "latestWrongAt",
    sortOrder: "desc",
  };
}

export function normalizeAiExplanationInput(
  input: unknown,
): NormalizedAiExplanationInput {
  const value = isRecord(input) ? input : {};

  return {
    requestedFromClientAt: normalizeOptionalString(value.requestedFromClientAt),
  };
}

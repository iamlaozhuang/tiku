import type {
  PersonalAiGenerationResultDetailQuery,
  PersonalAiGenerationResultHistoryQuery,
} from "../models/personal-ai-generation-result-history";
import type {
  PersonalAiGenerationResultOwnerType,
  PersonalAiGenerationResultTaskType,
} from "../models/personal-ai-generation-result";

export type PersonalAiGenerationResultHistoryValidationResult =
  | {
      success: true;
      value: PersonalAiGenerationResultHistoryQuery;
    }
  | {
      success: false;
      message: string;
    };

export type PersonalAiGenerationResultDetailValidationResult =
  | {
      success: true;
      value: PersonalAiGenerationResultDetailQuery;
    }
  | {
      success: false;
      message: string;
    };

const INVALID_PERSONAL_AI_GENERATION_RESULT_HISTORY_INPUT_MESSAGE =
  "Invalid personal AI generation result history input.";
const INVALID_PERSONAL_AI_GENERATION_RESULT_DETAIL_INPUT_MESSAGE =
  "Invalid personal AI generation result detail input.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeRequiredText(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const text = value.trim();

  return text.length === 0 ? null : text;
}

function normalizeOptionalText(value: unknown): string | undefined | null {
  if (value === undefined || value === null) {
    return undefined;
  }

  return normalizeRequiredText(value);
}

function normalizeLimit(value: unknown): number | undefined | null {
  if (value === undefined || value === null) {
    return undefined;
  }

  return typeof value === "number" && Number.isInteger(value) && value > 0
    ? value
    : null;
}

function normalizeOffset(value: unknown): number | undefined | null {
  if (value === undefined || value === null) {
    return undefined;
  }

  return typeof value === "number" && Number.isInteger(value) && value >= 0
    ? value
    : null;
}

function normalizeTaskType(
  value: unknown,
): PersonalAiGenerationResultTaskType | undefined | null {
  if (value === undefined || value === null) {
    return undefined;
  }

  return value === "ai_question_generation" || value === "ai_paper_generation"
    ? value
    : null;
}

function normalizeOwnerType(
  value: unknown,
): PersonalAiGenerationResultOwnerType | undefined | null {
  if (value === undefined || value === null) {
    return undefined;
  }

  return value === "personal" || value === "organization" ? value : null;
}

export function normalizePersonalAiGenerationResultHistoryQuery(
  input: unknown,
): PersonalAiGenerationResultHistoryValidationResult {
  if (!isRecord(input)) {
    return {
      success: false,
      message: INVALID_PERSONAL_AI_GENERATION_RESULT_HISTORY_INPUT_MESSAGE,
    };
  }

  const ownerPublicId = normalizeRequiredText(input.ownerPublicId);
  const actorPublicId = normalizeOptionalText(input.actorPublicId);
  const ownerType = normalizeOwnerType(input.ownerType);
  const taskType = normalizeTaskType(input.taskType);
  const page = normalizeLimit(input.page);
  const pageSize = normalizeLimit(input.pageSize);
  const limit = normalizeLimit(input.limit);
  const offset = normalizeOffset(input.offset);

  if (
    ownerPublicId === null ||
    actorPublicId === null ||
    ownerType === null ||
    taskType === null ||
    page === null ||
    pageSize === null ||
    limit === null ||
    offset === null
  ) {
    return {
      success: false,
      message: INVALID_PERSONAL_AI_GENERATION_RESULT_HISTORY_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      ownerType,
      ownerPublicId,
      actorPublicId,
      taskType,
      page,
      pageSize,
      limit,
      offset,
    },
  };
}

export function normalizePersonalAiGenerationResultDetailQuery(
  input: unknown,
): PersonalAiGenerationResultDetailValidationResult {
  if (!isRecord(input)) {
    return {
      success: false,
      message: INVALID_PERSONAL_AI_GENERATION_RESULT_DETAIL_INPUT_MESSAGE,
    };
  }

  const ownerPublicId = normalizeRequiredText(input.ownerPublicId);
  const actorPublicId = normalizeOptionalText(input.actorPublicId);
  const ownerType = normalizeOwnerType(input.ownerType);
  const resultPublicId = normalizeRequiredText(input.resultPublicId);

  if (
    ownerPublicId === null ||
    actorPublicId === null ||
    ownerType === null ||
    resultPublicId === null
  ) {
    return {
      success: false,
      message: INVALID_PERSONAL_AI_GENERATION_RESULT_DETAIL_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      ownerType,
      ownerPublicId,
      actorPublicId,
      resultPublicId,
    },
  };
}

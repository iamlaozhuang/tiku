import type {
  PersonalAiGenerationResultDetailQuery,
  PersonalAiGenerationResultHistoryQuery,
} from "../models/personal-ai-generation-result-history";

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

function normalizeLimit(value: unknown): number | undefined | null {
  if (value === undefined || value === null) {
    return undefined;
  }

  return typeof value === "number" && Number.isInteger(value) && value > 0
    ? value
    : null;
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
  const limit = normalizeLimit(input.limit);

  if (ownerPublicId === null || limit === null) {
    return {
      success: false,
      message: INVALID_PERSONAL_AI_GENERATION_RESULT_HISTORY_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      ownerPublicId,
      limit,
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
  const resultPublicId = normalizeRequiredText(input.resultPublicId);

  if (ownerPublicId === null || resultPublicId === null) {
    return {
      success: false,
      message: INVALID_PERSONAL_AI_GENERATION_RESULT_DETAIL_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      ownerPublicId,
      resultPublicId,
    },
  };
}

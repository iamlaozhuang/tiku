import { aiFuncTypeValues } from "../models/ai-rag";
import type {
  PersonalAiGenerationFuncType,
  PersonalAiGenerationRequestInput,
} from "../models/personal-ai-generation-request";

export type PersonalAiGenerationRequestValidationResult =
  | {
      success: true;
      value: PersonalAiGenerationRequestInput;
    }
  | {
      success: false;
      message: string;
    };

const INVALID_PERSONAL_AI_GENERATION_REQUEST_INPUT_MESSAGE =
  "Invalid personal AI generation request input.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeRequiredText(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const text = value.trim();

  return text.length === 0 ? null : text;
}

function normalizeOptionalText(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  return normalizeRequiredText(value);
}

function normalizePersonalAiGenerationFuncType(
  value: unknown,
): PersonalAiGenerationFuncType | null {
  return typeof value === "string" &&
    value !== "scoring" &&
    aiFuncTypeValues.includes(value as PersonalAiGenerationFuncType)
    ? (value as PersonalAiGenerationFuncType)
    : null;
}

export function normalizePersonalAiGenerationRequestInput(
  input: unknown,
): PersonalAiGenerationRequestValidationResult {
  if (!isRecord(input)) {
    return {
      success: false,
      message: INVALID_PERSONAL_AI_GENERATION_REQUEST_INPUT_MESSAGE,
    };
  }

  const userPublicId = normalizeRequiredText(input.userPublicId);
  const authorizationPublicId = normalizeRequiredText(
    input.authorizationPublicId,
  );
  const aiFuncType = normalizePersonalAiGenerationFuncType(input.aiFuncType);
  const questionPublicId = normalizeRequiredText(input.questionPublicId);

  if (
    userPublicId === null ||
    authorizationPublicId === null ||
    aiFuncType === null ||
    questionPublicId === null
  ) {
    return {
      success: false,
      message: INVALID_PERSONAL_AI_GENERATION_REQUEST_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      userPublicId,
      authorizationPublicId,
      aiFuncType,
      questionPublicId,
      answerRecordPublicId: normalizeOptionalText(input.answerRecordPublicId),
      paperPublicId: normalizeOptionalText(input.paperPublicId),
      mockExamPublicId: normalizeOptionalText(input.mockExamPublicId),
      redeemCodePublicId: normalizeOptionalText(input.redeemCodePublicId),
      auditLogPublicId: normalizeOptionalText(input.auditLogPublicId),
      aiCallLogPublicId: normalizeOptionalText(input.aiCallLogPublicId),
    },
  };
}

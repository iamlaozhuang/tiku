import { aiFuncTypeValues, type AiFuncType } from "../models/ai-rag";
import type { AiTaskDomainInput } from "../models/ai-task-domain";

export type AiTaskDomainValidationResult =
  | {
      success: true;
      value: AiTaskDomainInput;
    }
  | {
      success: false;
      message: string;
    };

const INVALID_AI_TASK_DOMAIN_INPUT_MESSAGE = "Invalid AI task domain input.";

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

function normalizeAiFuncType(value: unknown): AiFuncType | null {
  return typeof value === "string" &&
    aiFuncTypeValues.includes(value as AiFuncType)
    ? (value as AiFuncType)
    : null;
}

export function normalizeAiTaskDomainInput(
  input: unknown,
): AiTaskDomainValidationResult {
  if (!isRecord(input)) {
    return {
      success: false,
      message: INVALID_AI_TASK_DOMAIN_INPUT_MESSAGE,
    };
  }

  const userPublicId = normalizeRequiredText(input.userPublicId);
  const authorizationPublicId = normalizeRequiredText(
    input.authorizationPublicId,
  );
  const aiFuncType = normalizeAiFuncType(input.aiFuncType);
  const questionPublicId = normalizeRequiredText(input.questionPublicId);

  if (
    userPublicId === null ||
    authorizationPublicId === null ||
    aiFuncType === null ||
    questionPublicId === null
  ) {
    return {
      success: false,
      message: INVALID_AI_TASK_DOMAIN_INPUT_MESSAGE,
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
      auditLogPublicId: normalizeOptionalText(input.auditLogPublicId),
      aiCallLogPublicId: normalizeOptionalText(input.aiCallLogPublicId),
    },
  };
}

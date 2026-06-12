import {
  aiGenerationTaskFailureCategoryValues,
  aiGenerationTaskStatusValues,
  aiGenerationTaskTypeValues,
  type AiGenerationTaskFailureCategory,
  type AiGenerationTaskStatus,
  type AiGenerationTaskType,
} from "../models/ai-generation-task";
import { evidenceStatusValues, type EvidenceStatus } from "../models/ai-rag";
import {
  isPersonalAiGenerationResultReferenceTaskType,
  type PersonalAiGenerationResultReferenceTaskType,
} from "../models/personal-ai-generation-result-reference";
import type { PersonalAiGenerationAiCallLogReferenceInput } from "../models/personal-ai-generation-ai-call-log-reference";

export type PersonalAiGenerationAiCallLogReferenceValidationResult =
  | {
      success: true;
      value: PersonalAiGenerationAiCallLogReferenceInput;
    }
  | {
      success: false;
      message: string;
    };

const INVALID_PERSONAL_AI_GENERATION_AI_CALL_LOG_REFERENCE_INPUT_MESSAGE =
  "Invalid personal AI generation ai_call_log reference input.";

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

function normalizeTaskType(
  value: unknown,
): PersonalAiGenerationResultReferenceTaskType | null {
  const text = normalizeRequiredText(value);

  if (
    text === null ||
    !aiGenerationTaskTypeValues.includes(text as AiGenerationTaskType)
  ) {
    return null;
  }

  const taskType = text as AiGenerationTaskType;

  return isPersonalAiGenerationResultReferenceTaskType(taskType)
    ? taskType
    : null;
}

function normalizeTaskStatus(value: unknown): AiGenerationTaskStatus | null {
  const text = normalizeRequiredText(value);

  return text !== null &&
    aiGenerationTaskStatusValues.includes(text as AiGenerationTaskStatus)
    ? (text as AiGenerationTaskStatus)
    : null;
}

function normalizeFailureCategory(
  value: unknown,
): AiGenerationTaskFailureCategory | null {
  if (value === null || value === undefined) {
    return null;
  }

  const text = normalizeRequiredText(value);

  return text !== null &&
    aiGenerationTaskFailureCategoryValues.includes(
      text as AiGenerationTaskFailureCategory,
    )
    ? (text as AiGenerationTaskFailureCategory)
    : null;
}

function normalizeEvidenceStatus(value: unknown): EvidenceStatus | null {
  const text = normalizeRequiredText(value);

  return text !== null && evidenceStatusValues.includes(text as EvidenceStatus)
    ? (text as EvidenceStatus)
    : null;
}

function normalizeCitationCount(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) && value >= 0
    ? value
    : null;
}

export function normalizePersonalAiGenerationAiCallLogReferenceInput(
  input: unknown,
): PersonalAiGenerationAiCallLogReferenceValidationResult {
  if (!isRecord(input)) {
    return {
      success: false,
      message:
        INVALID_PERSONAL_AI_GENERATION_AI_CALL_LOG_REFERENCE_INPUT_MESSAGE,
    };
  }

  const taskPublicId = normalizeRequiredText(input.taskPublicId);
  const taskType = normalizeTaskType(input.taskType);
  const status = normalizeTaskStatus(input.status);
  const failureCategory = normalizeFailureCategory(input.failureCategory);
  const evidenceStatus = normalizeEvidenceStatus(input.evidenceStatus);
  const citationCount = normalizeCitationCount(input.citationCount);

  if (
    taskPublicId === null ||
    taskType === null ||
    status === null ||
    evidenceStatus === null ||
    citationCount === null
  ) {
    return {
      success: false,
      message:
        INVALID_PERSONAL_AI_GENERATION_AI_CALL_LOG_REFERENCE_INPUT_MESSAGE,
    };
  }

  if (status === "failed" && failureCategory === null) {
    return {
      success: false,
      message:
        INVALID_PERSONAL_AI_GENERATION_AI_CALL_LOG_REFERENCE_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      taskPublicId,
      taskType,
      status,
      failureCategory,
      resultPublicId: normalizeOptionalText(input.resultPublicId),
      evidenceStatus,
      citationCount,
      aiCallLogPublicId: normalizeOptionalText(input.aiCallLogPublicId),
    },
  };
}

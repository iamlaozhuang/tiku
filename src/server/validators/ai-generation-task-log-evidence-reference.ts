import {
  aiGenerationTaskFailureCategoryValues,
  aiGenerationTaskStatusValues,
  aiGenerationTaskTypeValues,
  type AiGenerationTaskFailureCategory,
  type AiGenerationTaskStatus,
  type AiGenerationTaskType,
} from "../models/ai-generation-task";
import {
  hasAiGenerationTaskLogEvidenceReference,
  type AiGenerationTaskLogEvidenceReferenceInput,
} from "../models/ai-generation-task-log-evidence-reference";
import { evidenceStatusValues, type EvidenceStatus } from "../models/ai-rag";

export type AiGenerationTaskLogEvidenceReferenceValidationResult =
  | {
      success: true;
      value: AiGenerationTaskLogEvidenceReferenceInput;
    }
  | {
      success: false;
      message: string;
    };

const INVALID_AI_GENERATION_TASK_LOG_EVIDENCE_REFERENCE_INPUT_MESSAGE =
  "Invalid ai_generation_task log evidence reference input.";

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

function normalizeRetentionDay(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) && value > 0
    ? value
    : null;
}

function normalizeTaskType(value: unknown): AiGenerationTaskType | null {
  const text = normalizeRequiredText(value);

  return text !== null &&
    aiGenerationTaskTypeValues.includes(text as AiGenerationTaskType)
    ? (text as AiGenerationTaskType)
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

export function normalizeAiGenerationTaskLogEvidenceReferenceInput(
  input: unknown,
): AiGenerationTaskLogEvidenceReferenceValidationResult {
  if (!isRecord(input)) {
    return {
      success: false,
      message: INVALID_AI_GENERATION_TASK_LOG_EVIDENCE_REFERENCE_INPUT_MESSAGE,
    };
  }

  const taskPublicId = normalizeRequiredText(input.taskPublicId);
  const taskType = normalizeTaskType(input.taskType);
  const status = normalizeTaskStatus(input.status);
  const failureCategory = normalizeFailureCategory(input.failureCategory);
  const evidenceStatus = normalizeEvidenceStatus(input.evidenceStatus);
  const auditLogRetentionDay = normalizeRetentionDay(
    input.auditLogRetentionDay,
  );
  const aiCallLogRetentionDay = normalizeRetentionDay(
    input.aiCallLogRetentionDay,
  );

  if (
    taskPublicId === null ||
    taskType === null ||
    status === null ||
    evidenceStatus === null ||
    auditLogRetentionDay === null ||
    aiCallLogRetentionDay === null
  ) {
    return {
      success: false,
      message: INVALID_AI_GENERATION_TASK_LOG_EVIDENCE_REFERENCE_INPUT_MESSAGE,
    };
  }

  const value: AiGenerationTaskLogEvidenceReferenceInput = {
    taskPublicId,
    taskType,
    status,
    failureCategory,
    resultPublicId: normalizeOptionalText(input.resultPublicId),
    evidenceStatus,
    auditLogPublicId: normalizeOptionalText(input.auditLogPublicId),
    aiCallLogPublicId: normalizeOptionalText(input.aiCallLogPublicId),
    auditLogRetentionDay,
    aiCallLogRetentionDay,
  };

  if (!hasAiGenerationTaskLogEvidenceReference(value)) {
    return {
      success: false,
      message: INVALID_AI_GENERATION_TASK_LOG_EVIDENCE_REFERENCE_INPUT_MESSAGE,
    };
  }

  if (value.status === "failed" && value.failureCategory === null) {
    return {
      success: false,
      message: INVALID_AI_GENERATION_TASK_LOG_EVIDENCE_REFERENCE_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value,
  };
}

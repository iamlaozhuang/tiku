import {
  aiGenerationTaskTypeValues,
  type AiGenerationTaskType,
} from "../models/ai-generation-task";
import { evidenceStatusValues, type EvidenceStatus } from "../models/ai-rag";
import {
  isPersonalAiGenerationResultTaskType,
  type PersonalAiGenerationResultPersistenceInput,
  type PersonalAiGenerationResultTaskType,
} from "../models/personal-ai-generation-result";

export type PersonalAiGenerationResultPersistenceValidationResult =
  | {
      success: true;
      value: PersonalAiGenerationResultPersistenceInput;
    }
  | {
      success: false;
      message: string;
    };

const INVALID_PERSONAL_AI_GENERATION_RESULT_PERSISTENCE_INPUT_MESSAGE =
  "Invalid personal AI generation result persistence input.";

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

function normalizeOptionalText(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  return normalizeRequiredText(value);
}

function normalizeTaskType(
  value: unknown,
): PersonalAiGenerationResultTaskType | null {
  const text = normalizeRequiredText(value);

  if (
    text === null ||
    !aiGenerationTaskTypeValues.includes(text as AiGenerationTaskType)
  ) {
    return null;
  }

  const taskType = text as AiGenerationTaskType;

  return isPersonalAiGenerationResultTaskType(taskType) ? taskType : null;
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

function normalizeRedactedSnapshot(
  value: unknown,
): Record<string, unknown> | null {
  return isRecord(value) ? value : null;
}

function normalizeOptionalRedactedSnapshot(
  value: unknown,
): Record<string, unknown> | null {
  if (value === null || value === undefined) {
    return null;
  }

  return normalizeRedactedSnapshot(value);
}

function normalizeCreatedAt(value: unknown): Date | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (typeof value !== "string") {
    return null;
  }

  const createdAt = new Date(value);

  return Number.isNaN(createdAt.getTime()) ? null : createdAt;
}

export function normalizePersonalAiGenerationResultPersistenceInput(
  input: unknown,
): PersonalAiGenerationResultPersistenceValidationResult {
  if (!isRecord(input)) {
    return {
      success: false,
      message: INVALID_PERSONAL_AI_GENERATION_RESULT_PERSISTENCE_INPUT_MESSAGE,
    };
  }

  const resultPublicId = normalizeRequiredText(input.resultPublicId);
  const taskPublicId = normalizeRequiredText(input.taskPublicId);
  const ownerPublicId = normalizeRequiredText(input.ownerPublicId);
  const taskType = normalizeTaskType(input.taskType);
  const contentRedactedSnapshot = normalizeRedactedSnapshot(
    input.contentRedactedSnapshot,
  );
  const contentDigest = normalizeRequiredText(input.contentDigest);
  const contentPreviewMasked = normalizeRequiredText(
    input.contentPreviewMasked,
  );
  const citationRedactedSnapshot = normalizeOptionalRedactedSnapshot(
    input.citationRedactedSnapshot,
  );
  const evidenceStatus = normalizeEvidenceStatus(input.evidenceStatus);
  const citationCount = normalizeCitationCount(input.citationCount);
  const createdAt = normalizeCreatedAt(input.createdAt);

  if (
    resultPublicId === null ||
    taskPublicId === null ||
    ownerPublicId === null ||
    taskType === null ||
    contentRedactedSnapshot === null ||
    contentDigest === null ||
    contentPreviewMasked === null ||
    evidenceStatus === null ||
    citationCount === null ||
    createdAt === null
  ) {
    return {
      success: false,
      message: INVALID_PERSONAL_AI_GENERATION_RESULT_PERSISTENCE_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      resultPublicId,
      taskPublicId,
      ownerPublicId,
      taskType,
      contentRedactedSnapshot,
      contentDigest,
      contentPreviewMasked,
      citationRedactedSnapshot,
      evidenceStatus,
      citationCount,
      aiCallLogPublicId: normalizeOptionalText(input.aiCallLogPublicId),
      createdAt,
    },
  };
}

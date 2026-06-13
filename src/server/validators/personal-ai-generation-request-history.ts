import { aiGenerationTaskStatusValues } from "../models/ai-generation-task";
import type { AiGenerationTaskStatus } from "../models/ai-generation-task";
import { evidenceStatusValues } from "../models/ai-rag";
import type { EvidenceStatus } from "../models/ai-rag";
import type { PersonalAiGenerationRequestHistoryInput } from "../models/personal-ai-generation-request-history";

export type PersonalAiGenerationRequestHistoryValidationResult =
  | {
      success: true;
      value: PersonalAiGenerationRequestHistoryInput[];
    }
  | {
      success: false;
      message: string;
    };

const INVALID_PERSONAL_AI_GENERATION_REQUEST_HISTORY_INPUT_MESSAGE =
  "Invalid personal AI generation request history input.";

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

function normalizeRequestedAt(value: unknown): string | null {
  const text = normalizeRequiredText(value);

  if (text === null) {
    return null;
  }

  const timestamp = Date.parse(text);

  return Number.isNaN(timestamp) ? null : new Date(timestamp).toISOString();
}

function normalizeStatus(value: unknown): AiGenerationTaskStatus | null {
  return typeof value === "string" &&
    aiGenerationTaskStatusValues.includes(value as AiGenerationTaskStatus)
    ? (value as AiGenerationTaskStatus)
    : null;
}

function normalizeEvidenceStatus(value: unknown): EvidenceStatus | null {
  return typeof value === "string" &&
    evidenceStatusValues.includes(value as EvidenceStatus)
    ? (value as EvidenceStatus)
    : null;
}

function normalizeCitationCount(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) && value >= 0
    ? value
    : null;
}

function normalizeHistoryRow(
  value: unknown,
): PersonalAiGenerationRequestHistoryInput | null {
  if (!isRecord(value)) {
    return null;
  }

  const requestPublicId = normalizeRequiredText(value.requestPublicId);
  const taskPublicId = normalizeRequiredText(value.taskPublicId);
  const status = normalizeStatus(value.status);
  const requestedAt = normalizeRequestedAt(value.requestedAt);
  const evidenceStatus = normalizeEvidenceStatus(value.evidenceStatus);
  const citationCount = normalizeCitationCount(value.citationCount);

  if (
    requestPublicId === null ||
    taskPublicId === null ||
    status === null ||
    requestedAt === null ||
    evidenceStatus === null ||
    citationCount === null
  ) {
    return null;
  }

  return {
    requestPublicId,
    taskPublicId,
    status,
    requestedAt,
    resultPublicId: normalizeOptionalText(value.resultPublicId),
    evidenceStatus,
    citationCount,
    aiCallLogPublicId: normalizeOptionalText(value.aiCallLogPublicId),
  };
}

export function normalizePersonalAiGenerationRequestHistoryInput(
  input: unknown,
): PersonalAiGenerationRequestHistoryValidationResult {
  if (!Array.isArray(input)) {
    return {
      success: false,
      message: INVALID_PERSONAL_AI_GENERATION_REQUEST_HISTORY_INPUT_MESSAGE,
    };
  }

  const historyInputList = input.map(normalizeHistoryRow);

  if (historyInputList.some((historyInput) => historyInput === null)) {
    return {
      success: false,
      message: INVALID_PERSONAL_AI_GENERATION_REQUEST_HISTORY_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: historyInputList as PersonalAiGenerationRequestHistoryInput[],
  };
}

import {
  aiGenerationTaskStatusValues,
  aiGenerationTaskTypeValues,
  type AiGenerationTaskStatus,
  type AiGenerationTaskType,
} from "../models/ai-generation-task";
import {
  type AiGenerationTaskRequestAuthorizationSource,
  type AiGenerationTaskRequestEffectiveEdition,
  type AiGenerationTaskRequestOwnerType,
  type AiGenerationTaskRequestPolicyInput,
} from "../models/ai-generation-task-request";
import { evidenceStatusValues, type EvidenceStatus } from "../models/ai-rag";

export type AiGenerationTaskRequestValidationResult =
  | {
      success: true;
      value: AiGenerationTaskRequestPolicyInput;
    }
  | {
      success: false;
      message: string;
    };

const INVALID_AI_GENERATION_TASK_REQUEST_INPUT_MESSAGE =
  "Invalid AI generation task request input.";

const authorizationSourceValues = [
  "personal_auth",
  "org_auth",
  "admin_role",
] as const;

const ownerTypeValues = ["personal", "organization", "platform"] as const;

const effectiveEditionValues = ["advanced", "standard"] as const;

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

function normalizeBoolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function normalizeCitationCount(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) && value >= 0
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
  if (value === null || value === undefined) {
    return null;
  }

  const text = normalizeRequiredText(value);

  return text !== null &&
    aiGenerationTaskStatusValues.includes(text as AiGenerationTaskStatus)
    ? (text as AiGenerationTaskStatus)
    : null;
}

function normalizeAuthorizationSource(
  value: unknown,
): AiGenerationTaskRequestAuthorizationSource | null {
  const text = normalizeRequiredText(value);

  return text !== null &&
    authorizationSourceValues.includes(
      text as AiGenerationTaskRequestAuthorizationSource,
    )
    ? (text as AiGenerationTaskRequestAuthorizationSource)
    : null;
}

function normalizeOwnerType(
  value: unknown,
): AiGenerationTaskRequestOwnerType | null {
  const text = normalizeRequiredText(value);

  return text !== null &&
    ownerTypeValues.includes(text as AiGenerationTaskRequestOwnerType)
    ? (text as AiGenerationTaskRequestOwnerType)
    : null;
}

function normalizeEffectiveEdition(
  value: unknown,
): AiGenerationTaskRequestEffectiveEdition | null {
  const text = normalizeRequiredText(value);

  return text !== null &&
    effectiveEditionValues.includes(
      text as AiGenerationTaskRequestEffectiveEdition,
    )
    ? (text as AiGenerationTaskRequestEffectiveEdition)
    : null;
}

function normalizeEvidenceStatus(value: unknown): EvidenceStatus | null {
  const text = normalizeRequiredText(value);

  return text !== null && evidenceStatusValues.includes(text as EvidenceStatus)
    ? (text as EvidenceStatus)
    : null;
}

export function normalizeAiGenerationTaskRequestPolicyInput(
  input: unknown,
): AiGenerationTaskRequestValidationResult {
  if (!isRecord(input)) {
    return {
      success: false,
      message: INVALID_AI_GENERATION_TASK_REQUEST_INPUT_MESSAGE,
    };
  }

  const taskPublicId = normalizeRequiredText(input.taskPublicId);
  const taskType = normalizeTaskType(input.taskType);
  const actorPublicId = normalizeRequiredText(input.actorPublicId);
  const authorizationSource = normalizeAuthorizationSource(
    input.authorizationSource,
  );
  const authorizationPublicId = normalizeRequiredText(
    input.authorizationPublicId,
  );
  const ownerType = normalizeOwnerType(input.ownerType);
  const ownerPublicId = normalizeRequiredText(input.ownerPublicId);
  const quotaOwnerType = normalizeOwnerType(input.quotaOwnerType);
  const quotaOwnerPublicId = normalizeRequiredText(input.quotaOwnerPublicId);
  const effectiveEdition = normalizeEffectiveEdition(input.effectiveEdition);
  const isAuthorizationActive = normalizeBoolean(input.isAuthorizationActive);
  const isScopeAllowed = normalizeBoolean(input.isScopeAllowed);
  const isQuotaAvailable = normalizeBoolean(input.isQuotaAvailable);
  const isRuntimeConfigReady = normalizeBoolean(input.isRuntimeConfigReady);
  const idempotencyKeyHash = normalizeRequiredText(input.idempotencyKeyHash);
  const existingTaskPublicId = normalizeOptionalText(
    input.existingTaskPublicId,
  );
  const existingTaskStatus = normalizeTaskStatus(input.existingTaskStatus);
  const evidenceStatus = normalizeEvidenceStatus(input.evidenceStatus);
  const citationCount = normalizeCitationCount(input.citationCount);

  if (
    taskPublicId === null ||
    taskType === null ||
    actorPublicId === null ||
    authorizationSource === null ||
    authorizationPublicId === null ||
    ownerType === null ||
    ownerPublicId === null ||
    quotaOwnerType === null ||
    quotaOwnerPublicId === null ||
    effectiveEdition === null ||
    isAuthorizationActive === null ||
    isScopeAllowed === null ||
    isQuotaAvailable === null ||
    isRuntimeConfigReady === null ||
    idempotencyKeyHash === null ||
    evidenceStatus === null ||
    citationCount === null
  ) {
    return {
      success: false,
      message: INVALID_AI_GENERATION_TASK_REQUEST_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      taskPublicId,
      taskType,
      actorPublicId,
      authorizationSource,
      authorizationPublicId,
      ownerType,
      ownerPublicId,
      organizationPublicId: normalizeOptionalText(input.organizationPublicId),
      quotaOwnerType,
      quotaOwnerPublicId,
      effectiveEdition,
      isAuthorizationActive,
      isScopeAllowed,
      isQuotaAvailable,
      isRuntimeConfigReady,
      idempotencyKeyHash,
      existingTaskPublicId,
      existingTaskStatus,
      resultPublicId: normalizeOptionalText(input.resultPublicId),
      evidenceStatus,
      citationCount,
      auditLogPublicId: normalizeOptionalText(input.auditLogPublicId),
      aiCallLogPublicId: normalizeOptionalText(input.aiCallLogPublicId),
    },
  };
}

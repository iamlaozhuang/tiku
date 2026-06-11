import {
  aiGenerationTaskTypeValues,
  type AiGenerationTaskType,
} from "../models/ai-generation-task";
import {
  aiGenerationTaskProviderSandboxApprovalStatusValues,
  aiGenerationTaskProviderSandboxTargetRuntimeValues,
  type AiGenerationTaskProviderSandboxApprovalStatus,
  type AiGenerationTaskProviderSandboxProposalInput,
  type AiGenerationTaskProviderSandboxTargetRuntime,
} from "../models/ai-generation-task-provider-sandbox-proposal";
import { evidenceStatusValues, type EvidenceStatus } from "../models/ai-rag";

export type AiGenerationTaskProviderSandboxProposalValidationResult =
  | {
      success: true;
      value: AiGenerationTaskProviderSandboxProposalInput;
    }
  | {
      success: false;
      message: string;
    };

const INVALID_AI_GENERATION_TASK_PROVIDER_SANDBOX_PROPOSAL_INPUT_MESSAGE =
  "Invalid ai_generation_task provider sandbox proposal input.";

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

function normalizeTaskType(value: unknown): AiGenerationTaskType | null {
  const text = normalizeRequiredText(value);

  return text !== null &&
    aiGenerationTaskTypeValues.includes(text as AiGenerationTaskType)
    ? (text as AiGenerationTaskType)
    : null;
}

function normalizeTargetRuntime(
  value: unknown,
): AiGenerationTaskProviderSandboxTargetRuntime | null {
  const text = normalizeRequiredText(value);

  return text !== null &&
    aiGenerationTaskProviderSandboxTargetRuntimeValues.includes(
      text as AiGenerationTaskProviderSandboxTargetRuntime,
    )
    ? (text as AiGenerationTaskProviderSandboxTargetRuntime)
    : null;
}

function normalizeApprovalStatus(
  value: unknown,
): AiGenerationTaskProviderSandboxApprovalStatus | null {
  const text = normalizeRequiredText(value);

  return text !== null &&
    aiGenerationTaskProviderSandboxApprovalStatusValues.includes(
      text as AiGenerationTaskProviderSandboxApprovalStatus,
    )
    ? (text as AiGenerationTaskProviderSandboxApprovalStatus)
    : null;
}

function normalizeEvidenceStatus(value: unknown): EvidenceStatus | null {
  const text = normalizeRequiredText(value);

  return text !== null && evidenceStatusValues.includes(text as EvidenceStatus)
    ? (text as EvidenceStatus)
    : null;
}

export function normalizeAiGenerationTaskProviderSandboxProposalInput(
  input: unknown,
): AiGenerationTaskProviderSandboxProposalValidationResult {
  if (!isRecord(input)) {
    return {
      success: false,
      message:
        INVALID_AI_GENERATION_TASK_PROVIDER_SANDBOX_PROPOSAL_INPUT_MESSAGE,
    };
  }

  const taskPublicId = normalizeRequiredText(input.taskPublicId);
  const taskType = normalizeTaskType(input.taskType);
  const actorPublicId = normalizeRequiredText(input.actorPublicId);
  const targetRuntime = normalizeTargetRuntime(input.targetRuntime);
  const approvalStatus = normalizeApprovalStatus(input.approvalStatus);
  const requiresEnvSecretAccess = normalizeBoolean(
    input.requiresEnvSecretAccess,
  );
  const requiresProviderConfigurationChange = normalizeBoolean(
    input.requiresProviderConfigurationChange,
  );
  const requiresDependencyChange = normalizeBoolean(
    input.requiresDependencyChange,
  );
  const requiresSchemaMigration = normalizeBoolean(
    input.requiresSchemaMigration,
  );
  const requestsCostCalibration = normalizeBoolean(
    input.requestsCostCalibration,
  );
  const evidenceRedactionConfirmed = normalizeBoolean(
    input.evidenceRedactionConfirmed,
  );
  const evidenceStatus = normalizeEvidenceStatus(input.evidenceStatus);
  const approvalPublicId = normalizeOptionalText(input.approvalPublicId);
  const auditLogPublicId = normalizeOptionalText(input.auditLogPublicId);
  const aiCallLogPublicId = normalizeOptionalText(input.aiCallLogPublicId);

  if (
    taskPublicId === null ||
    taskType === null ||
    actorPublicId === null ||
    targetRuntime === null ||
    approvalStatus === null ||
    requiresEnvSecretAccess === null ||
    requiresProviderConfigurationChange === null ||
    requiresDependencyChange === null ||
    requiresSchemaMigration === null ||
    requestsCostCalibration === null ||
    evidenceRedactionConfirmed === null ||
    evidenceStatus === null
  ) {
    return {
      success: false,
      message:
        INVALID_AI_GENERATION_TASK_PROVIDER_SANDBOX_PROPOSAL_INPUT_MESSAGE,
    };
  }

  if (approvalStatus === "approved" && approvalPublicId === null) {
    return {
      success: false,
      message:
        INVALID_AI_GENERATION_TASK_PROVIDER_SANDBOX_PROPOSAL_INPUT_MESSAGE,
    };
  }

  if (auditLogPublicId === null && aiCallLogPublicId === null) {
    return {
      success: false,
      message:
        INVALID_AI_GENERATION_TASK_PROVIDER_SANDBOX_PROPOSAL_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      taskPublicId,
      taskType,
      actorPublicId,
      targetRuntime,
      approvalStatus,
      approvalPublicId,
      requiresEnvSecretAccess,
      requiresProviderConfigurationChange,
      requiresDependencyChange,
      requiresSchemaMigration,
      requestsCostCalibration,
      evidenceRedactionConfirmed,
      evidenceStatus,
      auditLogPublicId,
      aiCallLogPublicId,
    },
  };
}

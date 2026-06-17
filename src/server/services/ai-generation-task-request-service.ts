import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type { AiGenerationTaskRequestPolicyDto } from "../contracts/ai-generation-task-request-contract";
import {
  resolveAiGenerationTaskRequestPolicy,
  resolveAiGenerationTaskResultReferencePublicId,
  resolveAiGenerationTaskResultKind,
  type AiGenerationTaskRequestPolicy,
  type AiGenerationTaskRequestPolicyInput,
} from "../models/ai-generation-task-request";
import type { EvidenceStatus } from "../models/ai-rag";
import { normalizeAiGenerationTaskRequestPolicyInput } from "../validators/ai-generation-task-request";

const INVALID_AI_GENERATION_TASK_REQUEST_INPUT_CODE = 400012;

function resolveResultEvidenceStatus(
  input: AiGenerationTaskRequestPolicyInput,
  policy: AiGenerationTaskRequestPolicy,
): EvidenceStatus {
  if (policy.decision === "reuse_existing_task") {
    return input.evidenceStatus;
  }

  return "none";
}

function resolveResultCitationCount(
  input: AiGenerationTaskRequestPolicyInput,
  policy: AiGenerationTaskRequestPolicy,
): number {
  if (policy.decision === "reuse_existing_task") {
    return input.citationCount;
  }

  return 0;
}

function mapAiGenerationTaskRequestPolicyToDto(
  input: AiGenerationTaskRequestPolicyInput,
): AiGenerationTaskRequestPolicyDto {
  const policy = resolveAiGenerationTaskRequestPolicy(input);

  return {
    runtimeStatus: "local_contract_only",
    decision: policy.decision,
    taskPublicId: policy.taskPublicId,
    taskType: input.taskType,
    initialStatus: policy.initialStatus,
    blockedFailureCategory: policy.blockedFailureCategory,
    authorizationSource: input.authorizationSource,
    authorizationPublicId: input.authorizationPublicId,
    actorPublicId: input.actorPublicId,
    ownerType: input.ownerType,
    ownerPublicId: input.ownerPublicId,
    organizationPublicId: input.organizationPublicId,
    quotaOwnerType: input.quotaOwnerType,
    quotaOwnerPublicId: input.quotaOwnerPublicId,
    idempotency: {
      keyHash: input.idempotencyKeyHash,
      reuseTaskPublicId: input.existingTaskPublicId,
    },
    resultReference: {
      resultKind: resolveAiGenerationTaskResultKind(input.taskType),
      resultPublicId: resolveAiGenerationTaskResultReferencePublicId(
        input,
        policy,
      ),
      contentVisibility: "summary_only",
      redactionStatus: "redacted",
      evidenceStatus: resolveResultEvidenceStatus(input, policy),
      citationCount: resolveResultCitationCount(input, policy),
    },
    evidenceReferences: {
      auditLogPublicId: input.auditLogPublicId,
      aiCallLogPublicId: input.aiCallLogPublicId,
      redactionStatus: "redacted",
    },
  };
}

export function buildAiGenerationTaskRequestPolicyReadModel(
  input: unknown,
): ApiResponse<AiGenerationTaskRequestPolicyDto | null> {
  const aiGenerationTaskRequestInput =
    normalizeAiGenerationTaskRequestPolicyInput(input);

  if (!aiGenerationTaskRequestInput.success) {
    return createErrorResponse(
      INVALID_AI_GENERATION_TASK_REQUEST_INPUT_CODE,
      aiGenerationTaskRequestInput.message,
    );
  }

  return createSuccessResponse(
    mapAiGenerationTaskRequestPolicyToDto(aiGenerationTaskRequestInput.value),
  );
}

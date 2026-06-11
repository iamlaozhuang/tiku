import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type { AiGenerationTaskProviderSandboxProposalDto } from "../contracts/ai-generation-task-provider-sandbox-proposal-contract";
import {
  aiGenerationTaskProviderSandboxAllowedMetadataValues,
  aiGenerationTaskProviderSandboxForbiddenEvidenceValues,
  resolveAiGenerationTaskProviderSandboxProposal,
  type AiGenerationTaskProviderSandboxProposalInput,
} from "../models/ai-generation-task-provider-sandbox-proposal";
import { normalizeAiGenerationTaskProviderSandboxProposalInput } from "../validators/ai-generation-task-provider-sandbox-proposal";

const INVALID_AI_GENERATION_TASK_PROVIDER_SANDBOX_PROPOSAL_INPUT_CODE = 400014;

function mapAiGenerationTaskProviderSandboxProposalToDto(
  input: AiGenerationTaskProviderSandboxProposalInput,
): AiGenerationTaskProviderSandboxProposalDto {
  const proposal = resolveAiGenerationTaskProviderSandboxProposal(input);

  return {
    runtimeStatus: "proposal_only",
    decision: proposal.decision,
    taskPublicId: input.taskPublicId,
    taskType: input.taskType,
    actorPublicId: input.actorPublicId,
    targetRuntime: input.targetRuntime,
    localOnly: proposal.localOnly,
    blockedReasons: proposal.blockedReasons,
    providerCallGate: {
      approvalStatus: input.approvalStatus,
      approvalPublicId: input.approvalPublicId,
      gateStatus: proposal.providerCallGate.gateStatus,
      providerCallExecuted: proposal.providerCallGate.providerCallExecuted,
    },
    evidenceRules: {
      visibility: "summary_only",
      redactionStatus: "redacted",
      evidenceStatus: input.evidenceStatus,
      auditLogPublicId: input.auditLogPublicId,
      aiCallLogPublicId: input.aiCallLogPublicId,
      allowedMetadata: [
        ...aiGenerationTaskProviderSandboxAllowedMetadataValues,
      ],
      forbiddenEvidence: [
        ...aiGenerationTaskProviderSandboxForbiddenEvidenceValues,
      ],
    },
    costCalibrationGateStatus: proposal.costCalibrationGateStatus,
  };
}

export function buildAiGenerationTaskProviderSandboxProposalReadModel(
  input: unknown,
): ApiResponse<AiGenerationTaskProviderSandboxProposalDto | null> {
  const aiGenerationTaskProviderSandboxProposalInput =
    normalizeAiGenerationTaskProviderSandboxProposalInput(input);

  if (!aiGenerationTaskProviderSandboxProposalInput.success) {
    return createErrorResponse(
      INVALID_AI_GENERATION_TASK_PROVIDER_SANDBOX_PROPOSAL_INPUT_CODE,
      aiGenerationTaskProviderSandboxProposalInput.message,
    );
  }

  return createSuccessResponse(
    mapAiGenerationTaskProviderSandboxProposalToDto(
      aiGenerationTaskProviderSandboxProposalInput.value,
    ),
  );
}

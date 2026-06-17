import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type {
  OpsGovernanceLogBlockedCapability,
  OpsGovernanceLogRetentionRedactionContractsDto,
} from "../contracts/ops-governance-log-retention-redaction-contracts-contract";
import type {
  OpsGovernanceLogReferenceStatus,
  OpsGovernanceLogRetentionRedactionContractsInput,
} from "../models/ops-governance-log-retention-redaction-contracts";
import {
  INVALID_OPS_GOVERNANCE_LOG_RETENTION_REDACTION_CONTRACTS_INPUT_MESSAGE,
  normalizeOpsGovernanceLogRetentionRedactionContractsInput,
} from "../validators/ops-governance-log-retention-redaction-contracts";

const INVALID_OPS_GOVERNANCE_LOG_RETENTION_REDACTION_CONTRACTS_INPUT_CODE = 400063;

const blockedCapabilities: OpsGovernanceLogBlockedCapability[] = [
  "raw_sensitive_viewer",
  "raw_prompt_provider_response_viewer",
  "provider_model_request",
  "hard_delete_executor",
  "export_file_generation_download",
  "schema_migration",
  "cost_calibration",
];

function resolveLogReferenceStatus(
  publicId: string | null,
): OpsGovernanceLogReferenceStatus {
  return publicId === null ? "none" : "redacted_reference";
}

function mapOpsGovernanceLogRetentionRedactionContractsToDto(
  input: OpsGovernanceLogRetentionRedactionContractsInput,
): OpsGovernanceLogRetentionRedactionContractsDto {
  return {
    generatedAt: input.generatedAt,
    runtimeStatus: "local_read_model_only",
    retentionPolicy: {
      auditLogRetentionDay: input.auditLogRetentionDay,
      aiCallLogRetentionDay: input.aiCallLogRetentionDay,
      retentionSource: "advanced_ops_config_contract",
      hardDeleteStatus: "blocked",
    },
    referencePolicy: {
      auditLogReferenceStatus: resolveLogReferenceStatus(
        input.auditLogPublicId,
      ),
      aiCallLogReferenceStatus: resolveLogReferenceStatus(
        input.aiCallLogPublicId,
      ),
      publicIdDisplayStatus: "hidden",
      publicIdInventoryStatus: "not_included",
    },
    redactionPolicy: {
      auditLogRedactionStatus: "redacted",
      aiCallLogRedactionStatus: "redacted",
      rawSensitiveViewerStatus: "blocked",
      rawPromptStatus: "not_included",
      rawAnswerStatus: "not_included",
      providerPayloadStatus: "not_included",
      rowDataStatus: "not_included",
    },
    blockedCapabilities,
    operationsReview: {
      retentionReviewStatus: "configured",
      redactionReviewStatus: "redacted_evidence_only",
      evidenceReviewStatus: "policy_only",
    },
  };
}

export function buildOpsGovernanceLogRetentionRedactionContractsReadModel(
  input: unknown,
): ApiResponse<OpsGovernanceLogRetentionRedactionContractsDto | null> {
  const retentionRedactionContractsInput =
    normalizeOpsGovernanceLogRetentionRedactionContractsInput(input);

  if (!retentionRedactionContractsInput.success) {
    return createErrorResponse(
      INVALID_OPS_GOVERNANCE_LOG_RETENTION_REDACTION_CONTRACTS_INPUT_CODE,
      INVALID_OPS_GOVERNANCE_LOG_RETENTION_REDACTION_CONTRACTS_INPUT_MESSAGE,
    );
  }

  return createSuccessResponse(
    mapOpsGovernanceLogRetentionRedactionContractsToDto(
      retentionRedactionContractsInput.value,
    ),
  );
}

import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type {
  OpsGovernanceLocalRecoveryBlockedCapability,
  OpsGovernanceLocalRecoveryExpiredHiddenBoundaryContractsDto,
} from "../contracts/ops-governance-local-recovery-expired-hidden-boundary-contracts-contract";
import type {
  OpsGovernanceExpiredHiddenCoverageStatus,
  OpsGovernanceExpiredHiddenReviewStatus,
  OpsGovernanceLocalRecoveryExpiredHiddenBoundaryContractsInput,
  OpsGovernanceLocalRecoveryReferenceStatus,
  OpsGovernanceLocalRecoveryStatus,
  OpsGovernanceRecoveryReviewStatus,
} from "../models/ops-governance-local-recovery-expired-hidden-boundary-contracts";
import {
  INVALID_OPS_GOVERNANCE_LOCAL_RECOVERY_EXPIRED_HIDDEN_BOUNDARY_CONTRACTS_INPUT_MESSAGE,
  normalizeOpsGovernanceLocalRecoveryExpiredHiddenBoundaryContractsInput,
} from "../validators/ops-governance-local-recovery-expired-hidden-boundary-contracts";

const INVALID_OPS_GOVERNANCE_LOCAL_RECOVERY_EXPIRED_HIDDEN_BOUNDARY_CONTRACTS_INPUT_CODE = 400064;

const blockedCapabilities: OpsGovernanceLocalRecoveryBlockedCapability[] = [
  "destructive_recovery_executor",
  "expired_public_id_inventory",
  "raw_log_viewer",
  "provider_model_request",
  "schema_migration",
  "cost_calibration",
];

function resolveReferenceStatus(
  publicId: string | null,
): OpsGovernanceLocalRecoveryReferenceStatus {
  return publicId === null ? "none" : "redacted_reference";
}

function resolveLocalRecoveryStatus(
  input: OpsGovernanceLocalRecoveryExpiredHiddenBoundaryContractsInput,
): OpsGovernanceLocalRecoveryStatus {
  return input.staleLogReferenceCount === 0 ||
    input.recoverableLocalArtifactCount > 0
    ? "ready"
    : "attention_required";
}

function resolveHiddenCoverageStatus(
  input: OpsGovernanceLocalRecoveryExpiredHiddenBoundaryContractsInput,
): OpsGovernanceExpiredHiddenCoverageStatus {
  if (input.expiredAuthorizationCount === 0) {
    return "not_applicable";
  }

  return input.hiddenExpiredAuthorizationCount ===
    input.expiredAuthorizationCount
    ? "complete"
    : "partial";
}

function resolveRecoveryReviewStatus(
  localRecoveryStatus: OpsGovernanceLocalRecoveryStatus,
): OpsGovernanceRecoveryReviewStatus {
  return localRecoveryStatus === "ready"
    ? "local_recovery_ready"
    : "review_recovery_artifacts";
}

function resolveExpiredHiddenReviewStatus(
  hiddenCoverageStatus: OpsGovernanceExpiredHiddenCoverageStatus,
): OpsGovernanceExpiredHiddenReviewStatus {
  return hiddenCoverageStatus === "partial"
    ? "review_expired_hidden_gap"
    : "expired_hidden_boundary_ready";
}

function mapOpsGovernanceLocalRecoveryExpiredHiddenBoundaryContractsToDto(
  input: OpsGovernanceLocalRecoveryExpiredHiddenBoundaryContractsInput,
): OpsGovernanceLocalRecoveryExpiredHiddenBoundaryContractsDto {
  const localRecoveryStatus = resolveLocalRecoveryStatus(input);
  const hiddenCoverageStatus = resolveHiddenCoverageStatus(input);

  return {
    generatedAt: input.generatedAt,
    runtimeStatus: "local_read_model_only",
    recoveryPolicy: {
      recoveryMode: input.recoveryMode,
      localRecoveryStatus,
      recoverableLocalArtifactCount: input.recoverableLocalArtifactCount,
      destructiveRecoveryStatus: "blocked",
    },
    expiredHiddenBoundary: {
      expiredAuthorizationCount: input.expiredAuthorizationCount,
      hiddenExpiredAuthorizationCount: input.hiddenExpiredAuthorizationCount,
      hiddenCoverageStatus,
      expiredVisibilityStatus: "hidden",
      publicIdDisplayStatus: "hidden",
      publicIdInventoryStatus: "not_included",
    },
    evidencePolicy: {
      auditLogReferenceStatus: resolveReferenceStatus(input.auditLogPublicId),
      aiCallLogReferenceStatus: resolveReferenceStatus(input.aiCallLogPublicId),
      rowDataStatus: "not_included",
      privateDataStatus: "not_included",
      providerPayloadStatus: "not_included",
    },
    blockedCapabilities,
    operationsReview: {
      recoveryReviewStatus: resolveRecoveryReviewStatus(localRecoveryStatus),
      expiredHiddenReviewStatus:
        resolveExpiredHiddenReviewStatus(hiddenCoverageStatus),
      evidenceReviewStatus: "redacted_evidence_only",
    },
  };
}

export function buildOpsGovernanceLocalRecoveryExpiredHiddenBoundaryContractsReadModel(
  input: unknown,
): ApiResponse<OpsGovernanceLocalRecoveryExpiredHiddenBoundaryContractsDto | null> {
  const contractsInput =
    normalizeOpsGovernanceLocalRecoveryExpiredHiddenBoundaryContractsInput(
      input,
    );

  if (!contractsInput.success) {
    return createErrorResponse(
      INVALID_OPS_GOVERNANCE_LOCAL_RECOVERY_EXPIRED_HIDDEN_BOUNDARY_CONTRACTS_INPUT_CODE,
      INVALID_OPS_GOVERNANCE_LOCAL_RECOVERY_EXPIRED_HIDDEN_BOUNDARY_CONTRACTS_INPUT_MESSAGE,
    );
  }

  return createSuccessResponse(
    mapOpsGovernanceLocalRecoveryExpiredHiddenBoundaryContractsToDto(
      contractsInput.value,
    ),
  );
}

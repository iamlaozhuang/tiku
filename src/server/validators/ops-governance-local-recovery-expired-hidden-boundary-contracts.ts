import type {
  OpsGovernanceLocalRecoveryExpiredHiddenBoundaryContractsInput,
  OpsGovernanceLocalRecoveryMode,
} from "../models/ops-governance-local-recovery-expired-hidden-boundary-contracts";

type SuccessfulValidation = {
  success: true;
  value: OpsGovernanceLocalRecoveryExpiredHiddenBoundaryContractsInput;
};

type FailedValidation = {
  success: false;
  message: string;
};

export type OpsGovernanceLocalRecoveryExpiredHiddenBoundaryContractsValidationResult =
  SuccessfulValidation | FailedValidation;

export const INVALID_OPS_GOVERNANCE_LOCAL_RECOVERY_EXPIRED_HIDDEN_BOUNDARY_CONTRACTS_INPUT_MESSAGE =
  "Invalid ops governance local recovery expired-hidden boundary contracts input.";

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

function normalizeIsoText(value: unknown): string | null {
  const text = normalizeRequiredText(value);

  if (text === null || Number.isNaN(Date.parse(text))) {
    return null;
  }

  return text;
}

function normalizeNonNegativeInteger(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) && value >= 0
    ? value
    : null;
}

function normalizeRecoveryMode(
  value: unknown,
): OpsGovernanceLocalRecoveryMode | null {
  return value === "local_read_model" ? value : null;
}

export function normalizeOpsGovernanceLocalRecoveryExpiredHiddenBoundaryContractsInput(
  input: unknown,
): OpsGovernanceLocalRecoveryExpiredHiddenBoundaryContractsValidationResult {
  if (!isRecord(input)) {
    return {
      success: false,
      message:
        INVALID_OPS_GOVERNANCE_LOCAL_RECOVERY_EXPIRED_HIDDEN_BOUNDARY_CONTRACTS_INPUT_MESSAGE,
    };
  }

  const generatedAt = normalizeIsoText(input.generatedAt);
  const recoveryMode = normalizeRecoveryMode(input.recoveryMode);
  const expiredAuthorizationCount = normalizeNonNegativeInteger(
    input.expiredAuthorizationCount,
  );
  const hiddenExpiredAuthorizationCount = normalizeNonNegativeInteger(
    input.hiddenExpiredAuthorizationCount,
  );
  const staleLogReferenceCount = normalizeNonNegativeInteger(
    input.staleLogReferenceCount,
  );
  const recoverableLocalArtifactCount = normalizeNonNegativeInteger(
    input.recoverableLocalArtifactCount,
  );

  if (
    generatedAt === null ||
    recoveryMode === null ||
    expiredAuthorizationCount === null ||
    hiddenExpiredAuthorizationCount === null ||
    staleLogReferenceCount === null ||
    recoverableLocalArtifactCount === null ||
    hiddenExpiredAuthorizationCount > expiredAuthorizationCount
  ) {
    return {
      success: false,
      message:
        INVALID_OPS_GOVERNANCE_LOCAL_RECOVERY_EXPIRED_HIDDEN_BOUNDARY_CONTRACTS_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      generatedAt,
      recoveryMode,
      expiredAuthorizationCount,
      hiddenExpiredAuthorizationCount,
      staleLogReferenceCount,
      recoverableLocalArtifactCount,
      auditLogPublicId: normalizeOptionalText(input.auditLogPublicId),
      aiCallLogPublicId: normalizeOptionalText(input.aiCallLogPublicId),
    },
  };
}

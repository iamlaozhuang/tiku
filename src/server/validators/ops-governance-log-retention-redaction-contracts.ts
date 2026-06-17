import type { OpsGovernanceLogRetentionRedactionContractsInput } from "../models/ops-governance-log-retention-redaction-contracts";

export type OpsGovernanceLogRetentionRedactionContractsValidationResult =
  | {
      success: true;
      value: OpsGovernanceLogRetentionRedactionContractsInput;
    }
  | {
      success: false;
      message: string;
    };

export const INVALID_OPS_GOVERNANCE_LOG_RETENTION_REDACTION_CONTRACTS_INPUT_MESSAGE =
  "Invalid ops governance log retention redaction contracts input.";

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

function normalizePositiveInteger(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) && value > 0
    ? value
    : null;
}

export function normalizeOpsGovernanceLogRetentionRedactionContractsInput(
  input: unknown,
): OpsGovernanceLogRetentionRedactionContractsValidationResult {
  if (!isRecord(input)) {
    return {
      success: false,
      message:
        INVALID_OPS_GOVERNANCE_LOG_RETENTION_REDACTION_CONTRACTS_INPUT_MESSAGE,
    };
  }

  const generatedAt = normalizeIsoText(input.generatedAt);
  const auditLogRetentionDay = normalizePositiveInteger(
    input.auditLogRetentionDay,
  );
  const aiCallLogRetentionDay = normalizePositiveInteger(
    input.aiCallLogRetentionDay,
  );

  if (
    generatedAt === null ||
    auditLogRetentionDay === null ||
    aiCallLogRetentionDay === null
  ) {
    return {
      success: false,
      message:
        INVALID_OPS_GOVERNANCE_LOG_RETENTION_REDACTION_CONTRACTS_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      generatedAt,
      auditLogPublicId: normalizeOptionalText(input.auditLogPublicId),
      aiCallLogPublicId: normalizeOptionalText(input.aiCallLogPublicId),
      auditLogRetentionDay,
      aiCallLogRetentionDay,
    },
  };
}

import type { OpsGovernanceRedeemCodeRedactedReferenceInput } from "../models/ops-governance-redeem-code-redacted-reference";

export type OpsGovernanceRedeemCodeRedactedReferenceValidationResult =
  | {
      success: true;
      value: OpsGovernanceRedeemCodeRedactedReferenceInput;
    }
  | {
      success: false;
      message: string;
    };

export const INVALID_OPS_GOVERNANCE_REDEEM_CODE_REDACTED_REFERENCE_INPUT_MESSAGE =
  "Invalid ops governance redeem_code redacted reference input.";

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

export function normalizeOpsGovernanceRedeemCodeRedactedReferenceInput(
  input: unknown,
): OpsGovernanceRedeemCodeRedactedReferenceValidationResult {
  if (!isRecord(input)) {
    return {
      success: false,
      message:
        INVALID_OPS_GOVERNANCE_REDEEM_CODE_REDACTED_REFERENCE_INPUT_MESSAGE,
    };
  }

  const generatedAt = normalizeIsoText(input.generatedAt);
  const userPublicId = normalizeRequiredText(input.userPublicId);
  const authorizationPublicId = normalizeRequiredText(
    input.authorizationPublicId,
  );
  const redeemCodePublicId = normalizeRequiredText(input.redeemCodePublicId);

  if (
    generatedAt === null ||
    userPublicId === null ||
    authorizationPublicId === null ||
    redeemCodePublicId === null
  ) {
    return {
      success: false,
      message:
        INVALID_OPS_GOVERNANCE_REDEEM_CODE_REDACTED_REFERENCE_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      generatedAt,
      userPublicId,
      authorizationPublicId,
      redeemCodePublicId,
      paperPublicId: normalizeOptionalText(input.paperPublicId),
      mockExamPublicId: normalizeOptionalText(input.mockExamPublicId),
      auditLogPublicId: normalizeOptionalText(input.auditLogPublicId),
      aiCallLogPublicId: normalizeOptionalText(input.aiCallLogPublicId),
    },
  };
}

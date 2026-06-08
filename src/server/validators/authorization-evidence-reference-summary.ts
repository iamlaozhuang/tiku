import type { AuthorizationEvidenceReferenceSummaryInput } from "../models/authorization-evidence-reference-summary";

export type AuthorizationEvidenceReferenceSummaryValidationResult =
  | {
      success: true;
      value: AuthorizationEvidenceReferenceSummaryInput;
    }
  | {
      success: false;
      message: string;
    };

const INVALID_AUTHORIZATION_EVIDENCE_REFERENCE_SUMMARY_INPUT_MESSAGE =
  "Invalid authorization evidence reference summary input.";

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

export function normalizeAuthorizationEvidenceReferenceSummaryInput(
  input: unknown,
): AuthorizationEvidenceReferenceSummaryValidationResult {
  if (!isRecord(input)) {
    return {
      success: false,
      message: INVALID_AUTHORIZATION_EVIDENCE_REFERENCE_SUMMARY_INPUT_MESSAGE,
    };
  }

  const userPublicId = normalizeRequiredText(input.userPublicId);
  const authorizationPublicId = normalizeRequiredText(
    input.authorizationPublicId,
  );

  if (userPublicId === null || authorizationPublicId === null) {
    return {
      success: false,
      message: INVALID_AUTHORIZATION_EVIDENCE_REFERENCE_SUMMARY_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      userPublicId,
      authorizationPublicId,
      redeemCodePublicId: normalizeOptionalText(input.redeemCodePublicId),
      auditLogPublicId: normalizeOptionalText(input.auditLogPublicId),
      aiCallLogPublicId: normalizeOptionalText(input.aiCallLogPublicId),
    },
  };
}

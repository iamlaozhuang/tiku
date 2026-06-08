import type { AuthorizationReasonEvidencePresentationInput } from "../models/authorization-reason-evidence-presentation";

export type AuthorizationReasonEvidencePresentationValidationResult =
  | {
      success: true;
      value: AuthorizationReasonEvidencePresentationInput;
    }
  | {
      success: false;
      message: string;
    };

const INVALID_AUTHORIZATION_REASON_EVIDENCE_PRESENTATION_INPUT_MESSAGE =
  "Invalid authorization reason evidence presentation input.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeOptionalText(value: unknown): string | null | undefined {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const text = value.trim();

  return text.length > 0 ? text : null;
}

export function normalizeAuthorizationReasonEvidencePresentationInput(
  input: unknown,
): AuthorizationReasonEvidencePresentationValidationResult {
  if (!isRecord(input) || input.reasonStatus !== "reason_summary_only") {
    return {
      success: false,
      message: INVALID_AUTHORIZATION_REASON_EVIDENCE_PRESENTATION_INPUT_MESSAGE,
    };
  }

  const redeemCodePublicId = normalizeOptionalText(input.redeemCodePublicId);
  const auditLogPublicId = normalizeOptionalText(input.auditLogPublicId);
  const aiCallLogPublicId = normalizeOptionalText(input.aiCallLogPublicId);

  if (
    redeemCodePublicId === undefined ||
    auditLogPublicId === undefined ||
    aiCallLogPublicId === undefined
  ) {
    return {
      success: false,
      message: INVALID_AUTHORIZATION_REASON_EVIDENCE_PRESENTATION_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      reasonStatus: "reason_summary_only",
      redeemCodePublicId,
      auditLogPublicId,
      aiCallLogPublicId,
    },
  };
}

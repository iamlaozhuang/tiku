import type { AuthorizationContextReasonCode } from "../models/authorization-context-reason-summary";
import type {
  AuthorizationReasonPresentationSummaryContextInput,
  AuthorizationReasonPresentationSummaryEvidenceInput,
  AuthorizationReasonPresentationSummaryInput,
  AuthorizationReasonPresentationSummarySourceInput,
} from "../models/authorization-reason-presentation-summary";
import type { AuthorizationSourceReasonCode } from "../models/authorization-source-reason-summary";
import { normalizeAuthorizationReasonEvidencePresentationInput } from "./authorization-reason-evidence-presentation";
import { normalizeAuthorizationReasonItemPresentationInput } from "./authorization-reason-item-presentation";

export type AuthorizationReasonPresentationSummaryValidationResult =
  | {
      success: true;
      value: AuthorizationReasonPresentationSummaryInput;
    }
  | {
      success: false;
      message: string;
    };

const INVALID_AUTHORIZATION_REASON_PRESENTATION_SUMMARY_INPUT_MESSAGE =
  "Invalid authorization reason presentation summary input.";

const AUTHORIZATION_SOURCE_REASON_CODES: readonly AuthorizationSourceReasonCode[] =
  ["selected_authorization_active", "selected_authorization_inactive"] as const;

const AUTHORIZATION_CONTEXT_REASON_CODES: readonly AuthorizationContextReasonCode[] =
  ["context_matches_authorization", "context_mismatch"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeRequiredText(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const text = value.trim();

  return text.length > 0 ? text : null;
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

function normalizeSourceReasonCode(
  value: unknown,
): AuthorizationSourceReasonCode | null {
  const reasonCode = normalizeRequiredText(value);

  if (reasonCode === null) {
    return null;
  }

  return AUTHORIZATION_SOURCE_REASON_CODES.includes(
    reasonCode as AuthorizationSourceReasonCode,
  )
    ? (reasonCode as AuthorizationSourceReasonCode)
    : null;
}

function normalizeContextReasonCode(
  value: unknown,
): AuthorizationContextReasonCode | null | undefined {
  if (value === null || value === undefined) {
    return null;
  }

  const reasonCode = normalizeRequiredText(value);

  if (reasonCode === null) {
    return undefined;
  }

  return AUTHORIZATION_CONTEXT_REASON_CODES.includes(
    reasonCode as AuthorizationContextReasonCode,
  )
    ? (reasonCode as AuthorizationContextReasonCode)
    : undefined;
}

function normalizeSourceReason(
  value: unknown,
): AuthorizationReasonPresentationSummarySourceInput | null {
  if (!isRecord(value)) {
    return null;
  }

  const selectedAuthorizationPublicId = normalizeRequiredText(
    value.selectedAuthorizationPublicId,
  );
  const sourceReasonCode = normalizeSourceReasonCode(value.sourceReasonCode);

  if (selectedAuthorizationPublicId === null || sourceReasonCode === null) {
    return null;
  }

  return {
    selectedAuthorizationPublicId,
    sourceReasonCode,
  };
}

function normalizeContextReason(
  value: unknown,
): AuthorizationReasonPresentationSummaryContextInput | null {
  if (!isRecord(value)) {
    return null;
  }

  const paperReasonCode = normalizeContextReasonCode(value.paperReasonCode);
  const mockExamReasonCode = normalizeContextReasonCode(
    value.mockExamReasonCode,
  );

  if (paperReasonCode === undefined || mockExamReasonCode === undefined) {
    return null;
  }

  return {
    paperReasonCode,
    mockExamReasonCode,
  };
}

function normalizeEvidenceReferences(
  value: unknown,
): AuthorizationReasonPresentationSummaryEvidenceInput | null {
  if (!isRecord(value) || !isRecord(value.redeemCodeReference)) {
    return null;
  }

  if (
    value.redactionStatus !== "redacted" ||
    value.referenceStatus !== "redacted_reference" ||
    value.redeemCodeReference.redactionStatus !== "redacted" ||
    value.redeemCodeReference.referenceStatus !== "redacted_reference"
  ) {
    return null;
  }

  const redeemCodePublicId = normalizeOptionalText(
    value.redeemCodeReference.publicId,
  );
  const evidenceInput = normalizeAuthorizationReasonEvidencePresentationInput({
    reasonStatus: "reason_summary_only",
    redeemCodePublicId,
    auditLogPublicId: value.auditLogPublicId,
    aiCallLogPublicId: value.aiCallLogPublicId,
  });

  if (!evidenceInput.success) {
    return null;
  }

  return {
    redeemCodeReference: {
      publicId: evidenceInput.value.redeemCodePublicId,
      redactionStatus: "redacted",
      referenceStatus: "redacted_reference",
    },
    auditLogPublicId: evidenceInput.value.auditLogPublicId,
    aiCallLogPublicId: evidenceInput.value.aiCallLogPublicId,
    redactionStatus: "redacted",
    referenceStatus: "redacted_reference",
  };
}

function hasRequiredContextPublicReference(
  reasonCode: AuthorizationContextReasonCode | null,
  publicId: string | null,
): boolean {
  return reasonCode === null || publicId !== null;
}

export function normalizeAuthorizationReasonPresentationSummaryInput(
  input: unknown,
): AuthorizationReasonPresentationSummaryValidationResult {
  if (!isRecord(input)) {
    return {
      success: false,
      message: INVALID_AUTHORIZATION_REASON_PRESENTATION_SUMMARY_INPUT_MESSAGE,
    };
  }

  const userPublicId = normalizeRequiredText(input.userPublicId);
  const authorizationPublicId = normalizeRequiredText(
    input.authorizationPublicId,
  );
  const reasonItemInput = normalizeAuthorizationReasonItemPresentationInput({
    reasonStatus: input.reasonStatus,
    reasonCodes: input.reasonCodes,
  });
  const sourceReason = normalizeSourceReason(input.sourceReason);
  const contextReason = normalizeContextReason(input.contextReason);
  const paperContextPublicId = normalizeOptionalText(
    input.paperContextPublicId,
  );
  const mockExamContextPublicId = normalizeOptionalText(
    input.mockExamContextPublicId,
  );
  const evidenceReferences = normalizeEvidenceReferences(
    input.evidenceReferences,
  );

  if (
    userPublicId === null ||
    authorizationPublicId === null ||
    !reasonItemInput.success ||
    sourceReason === null ||
    contextReason === null ||
    paperContextPublicId === undefined ||
    mockExamContextPublicId === undefined ||
    evidenceReferences === null ||
    sourceReason.selectedAuthorizationPublicId !== authorizationPublicId ||
    !hasRequiredContextPublicReference(
      contextReason.paperReasonCode,
      paperContextPublicId,
    ) ||
    !hasRequiredContextPublicReference(
      contextReason.mockExamReasonCode,
      mockExamContextPublicId,
    )
  ) {
    return {
      success: false,
      message: INVALID_AUTHORIZATION_REASON_PRESENTATION_SUMMARY_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      userPublicId,
      authorizationPublicId,
      reasonStatus: "reason_summary_only",
      reasonCodes: reasonItemInput.value.reasonCodes,
      sourceReason,
      contextReason,
      paperContextPublicId,
      mockExamContextPublicId,
      evidenceReferences,
    },
  };
}

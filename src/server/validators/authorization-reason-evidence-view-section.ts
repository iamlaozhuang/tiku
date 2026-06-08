import type {
  AuthorizationReasonEvidenceRedactionStatus,
  AuthorizationReasonEvidenceReferenceStatus,
  AuthorizationReasonEvidenceType,
} from "../models/authorization-reason-evidence-presentation";
import type {
  AuthorizationReasonEvidenceViewSectionInput,
  AuthorizationReasonEvidenceViewSectionPresentationInput,
} from "../models/authorization-reason-evidence-view-section";

export type AuthorizationReasonEvidenceViewSectionValidationResult =
  | {
      success: true;
      value: AuthorizationReasonEvidenceViewSectionInput;
    }
  | {
      success: false;
      message: string;
    };

const INVALID_AUTHORIZATION_REASON_EVIDENCE_VIEW_SECTION_INPUT_MESSAGE =
  "Invalid authorization reason evidence view section input.";

const AUTHORIZATION_REASON_EVIDENCE_TYPES: readonly AuthorizationReasonEvidenceType[] =
  ["redeem_code", "audit_log", "ai_call_log"] as const;

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

function normalizeEvidenceType(
  value: unknown,
): AuthorizationReasonEvidenceType | null {
  const evidenceType = normalizeRequiredText(value);

  return AUTHORIZATION_REASON_EVIDENCE_TYPES.includes(
    evidenceType as AuthorizationReasonEvidenceType,
  )
    ? (evidenceType as AuthorizationReasonEvidenceType)
    : null;
}

function normalizeRedactionStatus(
  value: unknown,
): AuthorizationReasonEvidenceRedactionStatus | null {
  return value === "redacted" ? value : null;
}

function normalizeReferenceStatus(
  value: unknown,
): AuthorizationReasonEvidenceReferenceStatus | null {
  return value === "redacted_reference" ? value : null;
}

function normalizeEvidencePresentation(
  value: unknown,
): AuthorizationReasonEvidenceViewSectionPresentationInput | null {
  if (!isRecord(value)) {
    return null;
  }

  const evidenceType = normalizeEvidenceType(value.evidenceType);
  const publicId = normalizeOptionalText(value.publicId);
  const redactionStatus = normalizeRedactionStatus(value.redactionStatus);
  const referenceStatus = normalizeReferenceStatus(value.referenceStatus);
  const presentationKey = normalizeRequiredText(value.presentationKey);

  if (
    evidenceType === null ||
    publicId === undefined ||
    redactionStatus === null ||
    referenceStatus === null ||
    presentationKey === null
  ) {
    return null;
  }

  return {
    evidenceType,
    publicId,
    redactionStatus,
    referenceStatus,
    presentationKey,
  };
}

function normalizeEvidencePresentations(
  value: unknown,
): AuthorizationReasonEvidenceViewSectionPresentationInput[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const evidencePresentations = value.map(normalizeEvidencePresentation);

  if (
    evidencePresentations.some(
      (evidencePresentation) => evidencePresentation === null,
    )
  ) {
    return null;
  }

  return evidencePresentations as AuthorizationReasonEvidenceViewSectionPresentationInput[];
}

export function normalizeAuthorizationReasonEvidenceViewSectionInput(
  input: unknown,
): AuthorizationReasonEvidenceViewSectionValidationResult {
  if (
    !isRecord(input) ||
    input.presentationStatus !== "local_presentation_only"
  ) {
    return {
      success: false,
      message: INVALID_AUTHORIZATION_REASON_EVIDENCE_VIEW_SECTION_INPUT_MESSAGE,
    };
  }

  const evidencePresentations = normalizeEvidencePresentations(
    input.evidencePresentations,
  );

  if (evidencePresentations === null) {
    return {
      success: false,
      message: INVALID_AUTHORIZATION_REASON_EVIDENCE_VIEW_SECTION_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      presentationStatus: "local_presentation_only",
      evidencePresentations,
    },
  };
}

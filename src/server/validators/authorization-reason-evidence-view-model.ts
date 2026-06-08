import type {
  AuthorizationReasonEvidenceRedactionStatus,
  AuthorizationReasonEvidenceReferenceStatus,
  AuthorizationReasonEvidenceType,
} from "../models/authorization-reason-evidence-presentation";
import type {
  AuthorizationReasonEvidenceViewModelEvidenceItemInput,
  AuthorizationReasonEvidenceViewModelInput,
} from "../models/authorization-reason-evidence-view-model";
import type { AuthorizationReasonItemPresentationSeverity } from "../models/authorization-reason-item-presentation";

export type AuthorizationReasonEvidenceViewModelValidationResult =
  | {
      success: true;
      value: AuthorizationReasonEvidenceViewModelInput;
    }
  | {
      success: false;
      message: string;
    };

const INVALID_AUTHORIZATION_REASON_EVIDENCE_VIEW_MODEL_INPUT_MESSAGE =
  "Invalid authorization reason evidence view model input.";

const AUTHORIZATION_REASON_EVIDENCE_TYPES: readonly AuthorizationReasonEvidenceType[] =
  ["redeem_code", "audit_log", "ai_call_log"] as const;

const AUTHORIZATION_REASON_ITEM_SEVERITIES: readonly AuthorizationReasonItemPresentationSeverity[] =
  ["info", "attention"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeOptionalText(value: unknown): string | null {
  if (value === null) {
    return null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const text = value.trim();

  return text.length > 0 ? text : null;
}

function normalizeRequiredText(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const text = value.trim();

  return text.length > 0 ? text : null;
}

function normalizePositiveInteger(value: unknown): number | null {
  return Number.isInteger(value) && Number(value) > 0 ? Number(value) : null;
}

function normalizeSeverity(
  severity: unknown,
): AuthorizationReasonItemPresentationSeverity | null {
  if (typeof severity !== "string") {
    return null;
  }

  return AUTHORIZATION_REASON_ITEM_SEVERITIES.includes(
    severity as AuthorizationReasonItemPresentationSeverity,
  )
    ? (severity as AuthorizationReasonItemPresentationSeverity)
    : null;
}

function normalizeEvidenceType(
  evidenceType: unknown,
): AuthorizationReasonEvidenceType | null {
  if (typeof evidenceType !== "string") {
    return null;
  }

  return AUTHORIZATION_REASON_EVIDENCE_TYPES.includes(
    evidenceType as AuthorizationReasonEvidenceType,
  )
    ? (evidenceType as AuthorizationReasonEvidenceType)
    : null;
}

function normalizeRedactionStatus(
  redactionStatus: unknown,
): AuthorizationReasonEvidenceRedactionStatus | null {
  return redactionStatus === "redacted" ? "redacted" : null;
}

function normalizeReferenceStatus(
  referenceStatus: unknown,
): AuthorizationReasonEvidenceReferenceStatus | null {
  return referenceStatus === "redacted_reference" ? "redacted_reference" : null;
}

function normalizeEvidenceItem(
  item: unknown,
): AuthorizationReasonEvidenceViewModelEvidenceItemInput | null {
  if (!isRecord(item)) {
    return null;
  }

  const evidenceType = normalizeEvidenceType(item.evidenceType);
  const publicId = normalizeOptionalText(item.publicId);
  const redactionStatus = normalizeRedactionStatus(item.redactionStatus);
  const referenceStatus = normalizeReferenceStatus(item.referenceStatus);
  const presentationKey = normalizeRequiredText(item.presentationKey);
  const sortOrder = normalizePositiveInteger(item.sortOrder);

  if (
    evidenceType === null ||
    redactionStatus === null ||
    referenceStatus === null ||
    presentationKey === null ||
    sortOrder === null
  ) {
    return null;
  }

  return {
    evidenceType,
    publicId,
    redactionStatus,
    referenceStatus,
    presentationKey,
    sortOrder,
  };
}

function normalizeEvidenceItems(
  value: unknown,
): AuthorizationReasonEvidenceViewModelEvidenceItemInput[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const evidenceItems = value.map(normalizeEvidenceItem);

  if (evidenceItems.some((evidenceItem) => evidenceItem === null)) {
    return null;
  }

  return evidenceItems as AuthorizationReasonEvidenceViewModelEvidenceItemInput[];
}

export function normalizeAuthorizationReasonEvidenceViewModelInput(
  input: unknown,
): AuthorizationReasonEvidenceViewModelValidationResult {
  if (
    !isRecord(input) ||
    input.sectionStatus !== "local_view_section_only" ||
    input.sectionKey !== "authorization.reason.view_section.evidence"
  ) {
    return {
      success: false,
      message: INVALID_AUTHORIZATION_REASON_EVIDENCE_VIEW_MODEL_INPUT_MESSAGE,
    };
  }

  const sectionSeverity = normalizeSeverity(input.sectionSeverity);
  const evidenceItems = normalizeEvidenceItems(input.evidenceItems);

  if (sectionSeverity === null || evidenceItems === null) {
    return {
      success: false,
      message: INVALID_AUTHORIZATION_REASON_EVIDENCE_VIEW_MODEL_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      sectionStatus: "local_view_section_only",
      sectionKey: "authorization.reason.view_section.evidence",
      sectionSeverity,
      evidenceItems,
    },
  };
}

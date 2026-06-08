import type { AuthorizationReasonEvidenceViewModelChipDto } from "../contracts/authorization-reason-evidence-view-model-contract";
import type {
  AuthorizationReasonEvidenceRedactionStatus,
  AuthorizationReasonEvidenceReferenceStatus,
  AuthorizationReasonEvidenceType,
} from "../models/authorization-reason-evidence-presentation";
import type { AuthorizationReasonEvidenceSelectorInput } from "../models/authorization-reason-evidence-selector";
import type { AuthorizationReasonItemPresentationSeverity } from "../models/authorization-reason-item-presentation";

export type AuthorizationReasonEvidenceSelectorValidationResult =
  | {
      success: true;
      value: AuthorizationReasonEvidenceSelectorInput;
    }
  | {
      success: false;
      message: string;
    };

const INVALID_AUTHORIZATION_REASON_EVIDENCE_SELECTOR_INPUT_MESSAGE =
  "Invalid authorization reason evidence selector input.";

const AUTHORIZATION_REASON_EVIDENCE_TYPES: readonly AuthorizationReasonEvidenceType[] =
  ["redeem_code", "audit_log", "ai_call_log"] as const;

const AUTHORIZATION_REASON_ITEM_SEVERITIES: readonly AuthorizationReasonItemPresentationSeverity[] =
  ["info", "attention"] as const;

const AUTHORIZATION_REASON_EVIDENCE_CHIP_KEYS: readonly AuthorizationReasonEvidenceViewModelChipDto["chipKey"][] =
  [
    "authorization.reason.view_model.evidence.redeem_code",
    "authorization.reason.view_model.evidence.audit_log",
    "authorization.reason.view_model.evidence.ai_call_log",
  ] as const;

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

function normalizeChipKey(
  chipKey: unknown,
): AuthorizationReasonEvidenceViewModelChipDto["chipKey"] | null {
  if (typeof chipKey !== "string") {
    return null;
  }

  return AUTHORIZATION_REASON_EVIDENCE_CHIP_KEYS.includes(
    chipKey as AuthorizationReasonEvidenceViewModelChipDto["chipKey"],
  )
    ? (chipKey as AuthorizationReasonEvidenceViewModelChipDto["chipKey"])
    : null;
}

function resolveExpectedChipKey(
  evidenceType: AuthorizationReasonEvidenceType,
): AuthorizationReasonEvidenceViewModelChipDto["chipKey"] {
  if (evidenceType === "redeem_code") {
    return "authorization.reason.view_model.evidence.redeem_code";
  }

  if (evidenceType === "audit_log") {
    return "authorization.reason.view_model.evidence.audit_log";
  }

  return "authorization.reason.view_model.evidence.ai_call_log";
}

function normalizeEvidenceChip(
  chip: unknown,
): AuthorizationReasonEvidenceViewModelChipDto | null {
  if (!isRecord(chip)) {
    return null;
  }

  const chipKey = normalizeChipKey(chip.chipKey);
  const evidenceType = normalizeEvidenceType(chip.evidenceType);
  const publicId = normalizeOptionalText(chip.publicId);
  const redactionStatus = normalizeRedactionStatus(chip.redactionStatus);
  const referenceStatus = normalizeReferenceStatus(chip.referenceStatus);
  const presentationKey = normalizeRequiredText(chip.presentationKey);
  const sortOrder = normalizePositiveInteger(chip.sortOrder);

  if (
    chipKey === null ||
    evidenceType === null ||
    redactionStatus === null ||
    referenceStatus === null ||
    presentationKey === null ||
    sortOrder === null ||
    chipKey !== resolveExpectedChipKey(evidenceType)
  ) {
    return null;
  }

  return {
    chipKey,
    evidenceType,
    publicId,
    redactionStatus,
    referenceStatus,
    presentationKey,
    sortOrder,
  };
}

function normalizeEvidenceChips(
  value: unknown,
): AuthorizationReasonEvidenceViewModelChipDto[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const evidenceChips = value.map(normalizeEvidenceChip);

  if (evidenceChips.some((evidenceChip) => evidenceChip === null)) {
    return null;
  }

  return evidenceChips as AuthorizationReasonEvidenceViewModelChipDto[];
}

export function normalizeAuthorizationReasonEvidenceSelectorInput(
  input: unknown,
): AuthorizationReasonEvidenceSelectorValidationResult {
  if (
    !isRecord(input) ||
    input.viewModelStatus !== "local_view_model_only" ||
    input.sourceSectionStatus !== "local_view_section_only" ||
    input.modelKey !== "authorization.reason.view_model.evidence"
  ) {
    return {
      success: false,
      message: INVALID_AUTHORIZATION_REASON_EVIDENCE_SELECTOR_INPUT_MESSAGE,
    };
  }

  const severity = normalizeSeverity(input.severity);
  const evidenceChips = normalizeEvidenceChips(input.evidenceChips);

  if (severity === null || evidenceChips === null) {
    return {
      success: false,
      message: INVALID_AUTHORIZATION_REASON_EVIDENCE_SELECTOR_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      viewModelStatus: "local_view_model_only",
      sourceSectionStatus: "local_view_section_only",
      modelKey: "authorization.reason.view_model.evidence",
      severity,
      evidenceChips,
    },
  };
}

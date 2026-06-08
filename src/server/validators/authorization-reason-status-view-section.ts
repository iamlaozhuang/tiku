import type { AuthorizationAccessReasonCode } from "../models/authorization-access-reason-summary";
import type { AuthorizationReasonItemPresentationSeverity } from "../models/authorization-reason-item-presentation";
import type {
  AuthorizationReasonStatusViewSectionInput,
  AuthorizationReasonStatusViewSectionReasonItemInput,
  AuthorizationReasonStatusViewSectionSourceInput,
} from "../models/authorization-reason-status-view-section";
import type { AuthorizationSourceReasonCode } from "../models/authorization-source-reason-summary";

export type AuthorizationReasonStatusViewSectionValidationResult =
  | {
      success: true;
      value: AuthorizationReasonStatusViewSectionInput;
    }
  | {
      success: false;
      message: string;
    };

const INVALID_AUTHORIZATION_REASON_STATUS_VIEW_SECTION_INPUT_MESSAGE =
  "Invalid authorization reason status view section input.";

const AUTHORIZATION_ACCESS_REASON_CODES = [
  "selected_authorization_active",
  "selected_authorization_inactive",
  "authorization_window_within_window",
  "authorization_window_not_started",
  "authorization_window_expired",
  "authorization_window_open_ended",
  "context_matches_authorization",
  "context_mismatch",
  "redacted_references_present",
  "redacted_references_missing",
] as const satisfies AuthorizationAccessReasonCode[];

const AUTHORIZATION_SOURCE_REASON_CODES: readonly AuthorizationSourceReasonCode[] =
  ["selected_authorization_active", "selected_authorization_inactive"] as const;

const AUTHORIZATION_REASON_ITEM_SEVERITIES: readonly AuthorizationReasonItemPresentationSeverity[] =
  ["info", "attention"] as const;

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

function normalizeSeverity(
  value: unknown,
): AuthorizationReasonItemPresentationSeverity | null {
  const severity = normalizeRequiredText(value);

  return AUTHORIZATION_REASON_ITEM_SEVERITIES.includes(
    severity as AuthorizationReasonItemPresentationSeverity,
  )
    ? (severity as AuthorizationReasonItemPresentationSeverity)
    : null;
}

function normalizeAccessReasonCode(
  value: unknown,
): AuthorizationAccessReasonCode | null {
  const reasonCode = normalizeRequiredText(value);

  return AUTHORIZATION_ACCESS_REASON_CODES.includes(
    reasonCode as AuthorizationAccessReasonCode,
  )
    ? (reasonCode as AuthorizationAccessReasonCode)
    : null;
}

function normalizeSourceReasonCode(
  value: unknown,
): AuthorizationSourceReasonCode | null {
  const reasonCode = normalizeRequiredText(value);

  return AUTHORIZATION_SOURCE_REASON_CODES.includes(
    reasonCode as AuthorizationSourceReasonCode,
  )
    ? (reasonCode as AuthorizationSourceReasonCode)
    : null;
}

function normalizePositiveSortOrder(value: unknown): number | null {
  return Number.isInteger(value) && Number(value) > 0 ? Number(value) : null;
}

function normalizeSourcePresentation(
  value: unknown,
): AuthorizationReasonStatusViewSectionSourceInput | null {
  if (!isRecord(value)) {
    return null;
  }

  const selectedAuthorizationPublicId = normalizeRequiredText(
    value.selectedAuthorizationPublicId,
  );
  const sourceReasonCode = normalizeSourceReasonCode(value.sourceReasonCode);
  const presentationKey = normalizeRequiredText(value.presentationKey);
  const severity = normalizeSeverity(value.severity);

  if (
    selectedAuthorizationPublicId === null ||
    sourceReasonCode === null ||
    presentationKey === null ||
    severity === null
  ) {
    return null;
  }

  return {
    selectedAuthorizationPublicId,
    sourceReasonCode,
    presentationKey,
    severity,
  };
}

function normalizeReasonItem(
  value: unknown,
): AuthorizationReasonStatusViewSectionReasonItemInput | null {
  if (!isRecord(value)) {
    return null;
  }

  const reasonCode = normalizeAccessReasonCode(value.reasonCode);
  const presentationKey = normalizeRequiredText(value.presentationKey);
  const severity = normalizeSeverity(value.severity);
  const sortOrder = normalizePositiveSortOrder(value.sortOrder);

  if (
    reasonCode === null ||
    presentationKey === null ||
    severity === null ||
    sortOrder === null
  ) {
    return null;
  }

  return {
    reasonCode,
    presentationKey,
    severity,
    sortOrder,
  };
}

function normalizeReasonItems(
  value: unknown,
): AuthorizationReasonStatusViewSectionReasonItemInput[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const reasonItems = value.map(normalizeReasonItem);

  if (reasonItems.some((reasonItem) => reasonItem === null)) {
    return null;
  }

  return reasonItems as AuthorizationReasonStatusViewSectionReasonItemInput[];
}

export function normalizeAuthorizationReasonStatusViewSectionInput(
  input: unknown,
): AuthorizationReasonStatusViewSectionValidationResult {
  if (
    !isRecord(input) ||
    input.presentationStatus !== "local_presentation_only"
  ) {
    return {
      success: false,
      message: INVALID_AUTHORIZATION_REASON_STATUS_VIEW_SECTION_INPUT_MESSAGE,
    };
  }

  const authorizationPublicId = normalizeRequiredText(
    input.authorizationPublicId,
  );
  const sourcePresentation = normalizeSourcePresentation(
    input.sourcePresentation,
  );
  const reasonItems = normalizeReasonItems(input.reasonItems);

  if (
    authorizationPublicId === null ||
    sourcePresentation === null ||
    reasonItems === null ||
    sourcePresentation.selectedAuthorizationPublicId !== authorizationPublicId
  ) {
    return {
      success: false,
      message: INVALID_AUTHORIZATION_REASON_STATUS_VIEW_SECTION_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      presentationStatus: "local_presentation_only",
      authorizationPublicId,
      sourcePresentation,
      reasonItems,
    },
  };
}

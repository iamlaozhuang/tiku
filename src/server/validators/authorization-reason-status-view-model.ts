import type { AuthorizationAccessReasonCode } from "../models/authorization-access-reason-summary";
import type { AuthorizationReasonItemPresentationSeverity } from "../models/authorization-reason-item-presentation";
import type {
  AuthorizationReasonStatusViewModelInput,
  AuthorizationReasonStatusViewModelStatusItemInput,
} from "../models/authorization-reason-status-view-model";

export type AuthorizationReasonStatusViewModelValidationResult =
  | {
      success: true;
      value: AuthorizationReasonStatusViewModelInput;
    }
  | {
      success: false;
      message: string;
    };

const INVALID_AUTHORIZATION_REASON_STATUS_VIEW_MODEL_INPUT_MESSAGE =
  "Invalid authorization reason status view model input.";

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

function normalizeReasonCode(
  reasonCode: unknown,
): AuthorizationAccessReasonCode | null {
  if (typeof reasonCode !== "string") {
    return null;
  }

  return AUTHORIZATION_ACCESS_REASON_CODES.includes(
    reasonCode as AuthorizationAccessReasonCode,
  )
    ? (reasonCode as AuthorizationAccessReasonCode)
    : null;
}

function normalizeStatusItem(
  item: unknown,
): AuthorizationReasonStatusViewModelStatusItemInput | null {
  if (!isRecord(item)) {
    return null;
  }

  const itemKey = normalizeRequiredText(item.itemKey);
  const reasonCode = normalizeReasonCode(item.reasonCode);
  const presentationKey = normalizeRequiredText(item.presentationKey);
  const severity = normalizeSeverity(item.severity);
  const sortOrder = normalizePositiveInteger(item.sortOrder);

  if (
    itemKey === null ||
    reasonCode === null ||
    presentationKey === null ||
    severity === null ||
    sortOrder === null
  ) {
    return null;
  }

  return {
    itemKey,
    reasonCode,
    presentationKey,
    severity,
    sortOrder,
  };
}

function normalizeStatusItems(
  value: unknown,
): AuthorizationReasonStatusViewModelStatusItemInput[] | null {
  if (!Array.isArray(value) || value.length === 0) {
    return null;
  }

  const statusItems = value.map(normalizeStatusItem);

  if (statusItems.some((statusItem) => statusItem === null)) {
    return null;
  }

  return statusItems as AuthorizationReasonStatusViewModelStatusItemInput[];
}

export function normalizeAuthorizationReasonStatusViewModelInput(
  input: unknown,
): AuthorizationReasonStatusViewModelValidationResult {
  if (
    !isRecord(input) ||
    input.sectionStatus !== "local_view_section_only" ||
    input.sectionKey !== "authorization.reason.view_section.status"
  ) {
    return {
      success: false,
      message: INVALID_AUTHORIZATION_REASON_STATUS_VIEW_MODEL_INPUT_MESSAGE,
    };
  }

  const sectionSeverity = normalizeSeverity(input.sectionSeverity);
  const selectedAuthorizationPublicId = normalizeRequiredText(
    input.selectedAuthorizationPublicId,
  );
  const statusItems = normalizeStatusItems(input.statusItems);

  if (
    sectionSeverity === null ||
    selectedAuthorizationPublicId === null ||
    statusItems === null
  ) {
    return {
      success: false,
      message: INVALID_AUTHORIZATION_REASON_STATUS_VIEW_MODEL_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      sectionStatus: "local_view_section_only",
      sectionKey: "authorization.reason.view_section.status",
      sectionSeverity,
      selectedAuthorizationPublicId,
      statusItems,
    },
  };
}

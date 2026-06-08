import type { AuthorizationAccessReasonCode } from "../models/authorization-access-reason-summary";
import type { AuthorizationReasonItemPresentationSeverity } from "../models/authorization-reason-item-presentation";
import type { AuthorizationReasonStatusSelectorInput } from "../models/authorization-reason-status-selector";
import type { AuthorizationReasonStatusViewModelRowDto } from "../contracts/authorization-reason-status-view-model-contract";

export type AuthorizationReasonStatusSelectorValidationResult =
  | {
      success: true;
      value: AuthorizationReasonStatusSelectorInput;
    }
  | {
      success: false;
      message: string;
    };

const INVALID_AUTHORIZATION_REASON_STATUS_SELECTOR_INPUT_MESSAGE =
  "Invalid authorization reason status selector input.";

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

const AUTHORIZATION_REASON_STATUS_ROW_KEYS: readonly AuthorizationReasonStatusViewModelRowDto["rowKey"][] =
  [
    "authorization.reason.view_model.status.source",
    "authorization.reason.view_model.status.window",
  ] as const;

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

function normalizeRowKey(
  rowKey: unknown,
): AuthorizationReasonStatusViewModelRowDto["rowKey"] | null {
  if (typeof rowKey !== "string") {
    return null;
  }

  return AUTHORIZATION_REASON_STATUS_ROW_KEYS.includes(
    rowKey as AuthorizationReasonStatusViewModelRowDto["rowKey"],
  )
    ? (rowKey as AuthorizationReasonStatusViewModelRowDto["rowKey"])
    : null;
}

function normalizeStatusRow(
  row: unknown,
): AuthorizationReasonStatusViewModelRowDto | null {
  if (!isRecord(row)) {
    return null;
  }

  const rowKey = normalizeRowKey(row.rowKey);
  const reasonCode = normalizeReasonCode(row.reasonCode);
  const presentationKey = normalizeRequiredText(row.presentationKey);
  const severity = normalizeSeverity(row.severity);
  const sortOrder = normalizePositiveInteger(row.sortOrder);

  if (
    rowKey === null ||
    reasonCode === null ||
    presentationKey === null ||
    severity === null ||
    sortOrder === null
  ) {
    return null;
  }

  return {
    rowKey,
    reasonCode,
    presentationKey,
    severity,
    sortOrder,
  };
}

function normalizeStatusRows(
  value: unknown,
): AuthorizationReasonStatusViewModelRowDto[] | null {
  if (!Array.isArray(value) || value.length === 0) {
    return null;
  }

  const statusRows = value.map(normalizeStatusRow);

  if (statusRows.some((statusRow) => statusRow === null)) {
    return null;
  }

  return statusRows as AuthorizationReasonStatusViewModelRowDto[];
}

export function normalizeAuthorizationReasonStatusSelectorInput(
  input: unknown,
): AuthorizationReasonStatusSelectorValidationResult {
  if (
    !isRecord(input) ||
    input.viewModelStatus !== "local_view_model_only" ||
    input.sourceSectionStatus !== "local_view_section_only" ||
    input.modelKey !== "authorization.reason.view_model.status"
  ) {
    return {
      success: false,
      message: INVALID_AUTHORIZATION_REASON_STATUS_SELECTOR_INPUT_MESSAGE,
    };
  }

  const severity = normalizeSeverity(input.severity);
  const selectedAuthorizationPublicId = normalizeRequiredText(
    input.selectedAuthorizationPublicId,
  );
  const statusRows = normalizeStatusRows(input.statusRows);

  if (
    severity === null ||
    selectedAuthorizationPublicId === null ||
    statusRows === null
  ) {
    return {
      success: false,
      message: INVALID_AUTHORIZATION_REASON_STATUS_SELECTOR_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      viewModelStatus: "local_view_model_only",
      sourceSectionStatus: "local_view_section_only",
      modelKey: "authorization.reason.view_model.status",
      severity,
      selectedAuthorizationPublicId,
      statusRows,
    },
  };
}

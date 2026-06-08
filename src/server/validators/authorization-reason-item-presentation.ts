import type {
  AuthorizationAccessReasonCode,
  AuthorizationAccessReasonSummaryStatus,
} from "../models/authorization-access-reason-summary";
import type { AuthorizationReasonItemPresentationInput } from "../models/authorization-reason-item-presentation";

export type AuthorizationReasonItemPresentationValidationResult =
  | {
      success: true;
      value: AuthorizationReasonItemPresentationInput;
    }
  | {
      success: false;
      message: string;
    };

const INVALID_AUTHORIZATION_REASON_ITEM_PRESENTATION_INPUT_MESSAGE =
  "Invalid authorization reason item presentation input.";

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeReasonStatus(
  value: unknown,
): AuthorizationAccessReasonSummaryStatus | null {
  return value === "reason_summary_only" ? value : null;
}

function normalizeReasonCode(
  value: unknown,
): AuthorizationAccessReasonCode | null {
  if (typeof value !== "string") {
    return null;
  }

  const reasonCode = value.trim();

  return AUTHORIZATION_ACCESS_REASON_CODES.includes(
    reasonCode as AuthorizationAccessReasonCode,
  )
    ? (reasonCode as AuthorizationAccessReasonCode)
    : null;
}

function normalizeReasonCodes(
  value: unknown,
): AuthorizationAccessReasonCode[] | null {
  if (!Array.isArray(value) || value.length === 0) {
    return null;
  }

  const reasonCodes = value.map(normalizeReasonCode);

  if (reasonCodes.some((reasonCode) => reasonCode === null)) {
    return null;
  }

  return reasonCodes as AuthorizationAccessReasonCode[];
}

export function normalizeAuthorizationReasonItemPresentationInput(
  input: unknown,
): AuthorizationReasonItemPresentationValidationResult {
  if (!isRecord(input)) {
    return {
      success: false,
      message: INVALID_AUTHORIZATION_REASON_ITEM_PRESENTATION_INPUT_MESSAGE,
    };
  }

  const reasonStatus = normalizeReasonStatus(input.reasonStatus);
  const reasonCodes = normalizeReasonCodes(input.reasonCodes);

  if (reasonStatus === null || reasonCodes === null) {
    return {
      success: false,
      message: INVALID_AUTHORIZATION_REASON_ITEM_PRESENTATION_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      reasonStatus,
      reasonCodes,
    },
  };
}

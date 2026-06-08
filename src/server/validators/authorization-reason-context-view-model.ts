import type { AuthorizationContextReasonCode } from "../models/authorization-context-reason-summary";
import type {
  AuthorizationReasonContextViewModelContextItemInput,
  AuthorizationReasonContextViewModelInput,
} from "../models/authorization-reason-context-view-model";
import type { AuthorizationReasonContextViewSectionType } from "../models/authorization-reason-context-view-section";
import type { AuthorizationReasonItemPresentationSeverity } from "../models/authorization-reason-item-presentation";

export type AuthorizationReasonContextViewModelValidationResult =
  | {
      success: true;
      value: AuthorizationReasonContextViewModelInput;
    }
  | {
      success: false;
      message: string;
    };

const INVALID_AUTHORIZATION_REASON_CONTEXT_VIEW_MODEL_INPUT_MESSAGE =
  "Invalid authorization reason context view model input.";

const AUTHORIZATION_CONTEXT_REASON_CODES: readonly AuthorizationContextReasonCode[] =
  ["context_matches_authorization", "context_mismatch"] as const;

const AUTHORIZATION_REASON_CONTEXT_TYPES: readonly AuthorizationReasonContextViewSectionType[] =
  ["paper", "mock_exam"] as const;

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

function normalizeContextType(
  contextType: unknown,
): AuthorizationReasonContextViewSectionType | null {
  if (typeof contextType !== "string") {
    return null;
  }

  return AUTHORIZATION_REASON_CONTEXT_TYPES.includes(
    contextType as AuthorizationReasonContextViewSectionType,
  )
    ? (contextType as AuthorizationReasonContextViewSectionType)
    : null;
}

function normalizeReasonCode(
  reasonCode: unknown,
): AuthorizationContextReasonCode | null {
  if (typeof reasonCode !== "string") {
    return null;
  }

  return AUTHORIZATION_CONTEXT_REASON_CODES.includes(
    reasonCode as AuthorizationContextReasonCode,
  )
    ? (reasonCode as AuthorizationContextReasonCode)
    : null;
}

function normalizeContextItem(
  item: unknown,
): AuthorizationReasonContextViewModelContextItemInput | null {
  if (!isRecord(item)) {
    return null;
  }

  const contextType = normalizeContextType(item.contextType);
  const publicId = normalizeRequiredText(item.publicId);
  const reasonCode = normalizeReasonCode(item.reasonCode);
  const presentationKey = normalizeRequiredText(item.presentationKey);
  const severity = normalizeSeverity(item.severity);
  const sortOrder = normalizePositiveInteger(item.sortOrder);

  if (
    contextType === null ||
    publicId === null ||
    reasonCode === null ||
    presentationKey === null ||
    severity === null ||
    sortOrder === null
  ) {
    return null;
  }

  return {
    contextType,
    publicId,
    reasonCode,
    presentationKey,
    severity,
    sortOrder,
  };
}

function normalizeContextItems(
  value: unknown,
): AuthorizationReasonContextViewModelContextItemInput[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const contextItems = value.map(normalizeContextItem);

  if (contextItems.some((contextItem) => contextItem === null)) {
    return null;
  }

  return contextItems as AuthorizationReasonContextViewModelContextItemInput[];
}

export function normalizeAuthorizationReasonContextViewModelInput(
  input: unknown,
): AuthorizationReasonContextViewModelValidationResult {
  if (
    !isRecord(input) ||
    input.sectionStatus !== "local_view_section_only" ||
    input.sectionKey !== "authorization.reason.view_section.context"
  ) {
    return {
      success: false,
      message: INVALID_AUTHORIZATION_REASON_CONTEXT_VIEW_MODEL_INPUT_MESSAGE,
    };
  }

  const sectionSeverity = normalizeSeverity(input.sectionSeverity);
  const contextItems = normalizeContextItems(input.contextItems);

  if (sectionSeverity === null || contextItems === null) {
    return {
      success: false,
      message: INVALID_AUTHORIZATION_REASON_CONTEXT_VIEW_MODEL_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      sectionStatus: "local_view_section_only",
      sectionKey: "authorization.reason.view_section.context",
      sectionSeverity,
      contextItems,
    },
  };
}

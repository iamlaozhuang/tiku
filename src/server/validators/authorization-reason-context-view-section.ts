import type { AuthorizationContextReasonCode } from "../models/authorization-context-reason-summary";
import type { AuthorizationReasonItemPresentationSeverity } from "../models/authorization-reason-item-presentation";
import type {
  AuthorizationReasonContextViewSectionInput,
  AuthorizationReasonContextViewSectionPresentationInput,
  AuthorizationReasonContextViewSectionType,
} from "../models/authorization-reason-context-view-section";

export type AuthorizationReasonContextViewSectionValidationResult =
  | {
      success: true;
      value: AuthorizationReasonContextViewSectionInput;
    }
  | {
      success: false;
      message: string;
    };

const INVALID_AUTHORIZATION_REASON_CONTEXT_VIEW_SECTION_INPUT_MESSAGE =
  "Invalid authorization reason context view section input.";

const AUTHORIZATION_CONTEXT_VIEW_SECTION_TYPES: readonly AuthorizationReasonContextViewSectionType[] =
  ["paper", "mock_exam"] as const;

const AUTHORIZATION_CONTEXT_REASON_CODES: readonly AuthorizationContextReasonCode[] =
  ["context_matches_authorization", "context_mismatch"] as const;

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

function normalizeContextType(
  value: unknown,
): AuthorizationReasonContextViewSectionType | null {
  const contextType = normalizeRequiredText(value);

  return AUTHORIZATION_CONTEXT_VIEW_SECTION_TYPES.includes(
    contextType as AuthorizationReasonContextViewSectionType,
  )
    ? (contextType as AuthorizationReasonContextViewSectionType)
    : null;
}

function normalizeContextReasonCode(
  value: unknown,
): AuthorizationContextReasonCode | null {
  const reasonCode = normalizeRequiredText(value);

  return AUTHORIZATION_CONTEXT_REASON_CODES.includes(
    reasonCode as AuthorizationContextReasonCode,
  )
    ? (reasonCode as AuthorizationContextReasonCode)
    : null;
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

function normalizeContextPresentation(
  value: unknown,
  expectedContextType: AuthorizationReasonContextViewSectionType,
): AuthorizationReasonContextViewSectionPresentationInput | null | undefined {
  if (value === null || value === undefined) {
    return null;
  }

  if (!isRecord(value)) {
    return undefined;
  }

  const contextType = normalizeContextType(value.contextType);
  const publicId = normalizeRequiredText(value.publicId);
  const reasonCode = normalizeContextReasonCode(value.reasonCode);
  const presentationKey = normalizeRequiredText(value.presentationKey);
  const severity = normalizeSeverity(value.severity);

  if (
    contextType !== expectedContextType ||
    publicId === null ||
    reasonCode === null ||
    presentationKey === null ||
    severity === null
  ) {
    return undefined;
  }

  return {
    contextType,
    publicId,
    reasonCode,
    presentationKey,
    severity,
  };
}

export function normalizeAuthorizationReasonContextViewSectionInput(
  input: unknown,
): AuthorizationReasonContextViewSectionValidationResult {
  if (
    !isRecord(input) ||
    input.presentationStatus !== "local_presentation_only"
  ) {
    return {
      success: false,
      message: INVALID_AUTHORIZATION_REASON_CONTEXT_VIEW_SECTION_INPUT_MESSAGE,
    };
  }

  const paperContextPresentation = normalizeContextPresentation(
    input.paperContextPresentation,
    "paper",
  );
  const mockExamContextPresentation = normalizeContextPresentation(
    input.mockExamContextPresentation,
    "mock_exam",
  );

  if (
    paperContextPresentation === undefined ||
    mockExamContextPresentation === undefined
  ) {
    return {
      success: false,
      message: INVALID_AUTHORIZATION_REASON_CONTEXT_VIEW_SECTION_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      presentationStatus: "local_presentation_only",
      paperContextPresentation,
      mockExamContextPresentation,
    },
  };
}

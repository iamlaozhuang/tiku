import type { AuthorizationContextReasonCode } from "../models/authorization-context-reason-summary";
import type { AuthorizationReasonContextViewModelCardDto } from "../contracts/authorization-reason-context-view-model-contract";
import type { AuthorizationReasonContextSelectorInput } from "../models/authorization-reason-context-selector";
import type { AuthorizationReasonContextViewSectionType } from "../models/authorization-reason-context-view-section";
import type { AuthorizationReasonItemPresentationSeverity } from "../models/authorization-reason-item-presentation";

export type AuthorizationReasonContextSelectorValidationResult =
  | {
      success: true;
      value: AuthorizationReasonContextSelectorInput;
    }
  | {
      success: false;
      message: string;
    };

const INVALID_AUTHORIZATION_REASON_CONTEXT_SELECTOR_INPUT_MESSAGE =
  "Invalid authorization reason context selector input.";

const AUTHORIZATION_CONTEXT_REASON_CODES: readonly AuthorizationContextReasonCode[] =
  ["context_matches_authorization", "context_mismatch"] as const;

const AUTHORIZATION_REASON_CONTEXT_TYPES: readonly AuthorizationReasonContextViewSectionType[] =
  ["paper", "mock_exam"] as const;

const AUTHORIZATION_REASON_ITEM_SEVERITIES: readonly AuthorizationReasonItemPresentationSeverity[] =
  ["info", "attention"] as const;

const AUTHORIZATION_REASON_CONTEXT_CARD_KEYS: readonly AuthorizationReasonContextViewModelCardDto["cardKey"][] =
  [
    "authorization.reason.view_model.context.paper",
    "authorization.reason.view_model.context.mock_exam",
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

function normalizeCardKey(
  cardKey: unknown,
): AuthorizationReasonContextViewModelCardDto["cardKey"] | null {
  if (typeof cardKey !== "string") {
    return null;
  }

  return AUTHORIZATION_REASON_CONTEXT_CARD_KEYS.includes(
    cardKey as AuthorizationReasonContextViewModelCardDto["cardKey"],
  )
    ? (cardKey as AuthorizationReasonContextViewModelCardDto["cardKey"])
    : null;
}

function resolveExpectedCardKey(
  contextType: AuthorizationReasonContextViewSectionType,
): AuthorizationReasonContextViewModelCardDto["cardKey"] {
  return contextType === "paper"
    ? "authorization.reason.view_model.context.paper"
    : "authorization.reason.view_model.context.mock_exam";
}

function normalizeContextCard(
  card: unknown,
): AuthorizationReasonContextViewModelCardDto | null {
  if (!isRecord(card)) {
    return null;
  }

  const cardKey = normalizeCardKey(card.cardKey);
  const contextType = normalizeContextType(card.contextType);
  const publicId = normalizeRequiredText(card.publicId);
  const reasonCode = normalizeReasonCode(card.reasonCode);
  const presentationKey = normalizeRequiredText(card.presentationKey);
  const severity = normalizeSeverity(card.severity);
  const sortOrder = normalizePositiveInteger(card.sortOrder);

  if (
    cardKey === null ||
    contextType === null ||
    publicId === null ||
    reasonCode === null ||
    presentationKey === null ||
    severity === null ||
    sortOrder === null ||
    cardKey !== resolveExpectedCardKey(contextType)
  ) {
    return null;
  }

  return {
    cardKey,
    contextType,
    publicId,
    reasonCode,
    presentationKey,
    severity,
    sortOrder,
  };
}

function normalizeContextCards(
  value: unknown,
): AuthorizationReasonContextViewModelCardDto[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const contextCards = value.map(normalizeContextCard);

  if (contextCards.some((contextCard) => contextCard === null)) {
    return null;
  }

  return contextCards as AuthorizationReasonContextViewModelCardDto[];
}

export function normalizeAuthorizationReasonContextSelectorInput(
  input: unknown,
): AuthorizationReasonContextSelectorValidationResult {
  if (
    !isRecord(input) ||
    input.viewModelStatus !== "local_view_model_only" ||
    input.sourceSectionStatus !== "local_view_section_only" ||
    input.modelKey !== "authorization.reason.view_model.context"
  ) {
    return {
      success: false,
      message: INVALID_AUTHORIZATION_REASON_CONTEXT_SELECTOR_INPUT_MESSAGE,
    };
  }

  const severity = normalizeSeverity(input.severity);
  const contextCards = normalizeContextCards(input.contextCards);

  if (severity === null || contextCards === null) {
    return {
      success: false,
      message: INVALID_AUTHORIZATION_REASON_CONTEXT_SELECTOR_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      viewModelStatus: "local_view_model_only",
      sourceSectionStatus: "local_view_section_only",
      modelKey: "authorization.reason.view_model.context",
      severity,
      contextCards,
    },
  };
}

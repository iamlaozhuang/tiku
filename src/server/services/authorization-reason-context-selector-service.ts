import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type { AuthorizationReasonContextSelectorDto } from "../contracts/authorization-reason-context-selector-contract";
import type { AuthorizationReasonContextViewModelCardDto } from "../contracts/authorization-reason-context-view-model-contract";
import type { AuthorizationReasonContextSelectorInput } from "../models/authorization-reason-context-selector";
import type { AuthorizationReasonContextViewSectionType } from "../models/authorization-reason-context-view-section";
import { normalizeAuthorizationReasonContextSelectorInput } from "../validators/authorization-reason-context-selector";

const INVALID_AUTHORIZATION_REASON_CONTEXT_SELECTOR_INPUT_CODE = 400037;

function resolveHighestSeverity(
  contextCards: AuthorizationReasonContextViewModelCardDto[],
  fallbackSeverity: AuthorizationReasonContextSelectorInput["severity"],
) {
  return contextCards.some(
    (contextCard) => contextCard.severity === "attention",
  )
    ? "attention"
    : fallbackSeverity;
}

function resolveContextPublicId(
  contextCards: AuthorizationReasonContextViewModelCardDto[],
  contextType: AuthorizationReasonContextViewSectionType,
): string | null {
  return (
    [...contextCards]
      .filter((contextCard) => contextCard.contextType === contextType)
      .sort((leftContextCard, rightContextCard) => {
        return leftContextCard.sortOrder - rightContextCard.sortOrder;
      })[0]?.publicId ?? null
  );
}

export function buildAuthorizationReasonContextSelectorReadModel(
  input: unknown,
): ApiResponse<AuthorizationReasonContextSelectorDto | null> {
  const authorizationReasonContextSelectorInput =
    normalizeAuthorizationReasonContextSelectorInput(input);

  if (!authorizationReasonContextSelectorInput.success) {
    return createErrorResponse(
      INVALID_AUTHORIZATION_REASON_CONTEXT_SELECTOR_INPUT_CODE,
      authorizationReasonContextSelectorInput.message,
    );
  }

  return createSuccessResponse({
    selectorStatus: "local_selector_only",
    sourceViewModelStatus:
      authorizationReasonContextSelectorInput.value.viewModelStatus,
    selectorKey: "authorization.reason.selector.context",
    severity: resolveHighestSeverity(
      authorizationReasonContextSelectorInput.value.contextCards,
      authorizationReasonContextSelectorInput.value.severity,
    ),
    paperPublicId: resolveContextPublicId(
      authorizationReasonContextSelectorInput.value.contextCards,
      "paper",
    ),
    mockExamPublicId: resolveContextPublicId(
      authorizationReasonContextSelectorInput.value.contextCards,
      "mock_exam",
    ),
    contextCardCount:
      authorizationReasonContextSelectorInput.value.contextCards.length,
  });
}

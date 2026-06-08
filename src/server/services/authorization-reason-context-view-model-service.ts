import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type {
  AuthorizationReasonContextViewModelCardDto,
  AuthorizationReasonContextViewModelDto,
} from "../contracts/authorization-reason-context-view-model-contract";
import type { AuthorizationReasonContextViewModelContextItemInput } from "../models/authorization-reason-context-view-model";
import { normalizeAuthorizationReasonContextViewModelInput } from "../validators/authorization-reason-context-view-model";

const INVALID_AUTHORIZATION_REASON_CONTEXT_VIEW_MODEL_INPUT_CODE = 400033;

function resolveContextCardKey(
  contextItem: AuthorizationReasonContextViewModelContextItemInput,
): AuthorizationReasonContextViewModelCardDto["cardKey"] {
  return contextItem.contextType === "paper"
    ? "authorization.reason.view_model.context.paper"
    : "authorization.reason.view_model.context.mock_exam";
}

function mapContextCard(
  contextItem: AuthorizationReasonContextViewModelContextItemInput,
): AuthorizationReasonContextViewModelCardDto {
  return {
    cardKey: resolveContextCardKey(contextItem),
    contextType: contextItem.contextType,
    publicId: contextItem.publicId,
    reasonCode: contextItem.reasonCode,
    presentationKey: contextItem.presentationKey,
    severity: contextItem.severity,
    sortOrder: contextItem.sortOrder,
  };
}

export function buildAuthorizationReasonContextViewModelReadModel(
  input: unknown,
): ApiResponse<AuthorizationReasonContextViewModelDto | null> {
  const authorizationReasonContextViewModelInput =
    normalizeAuthorizationReasonContextViewModelInput(input);

  if (!authorizationReasonContextViewModelInput.success) {
    return createErrorResponse(
      INVALID_AUTHORIZATION_REASON_CONTEXT_VIEW_MODEL_INPUT_CODE,
      authorizationReasonContextViewModelInput.message,
    );
  }

  const contextCards = [
    ...authorizationReasonContextViewModelInput.value.contextItems,
  ]
    .sort((leftContextItem, rightContextItem) => {
      return leftContextItem.sortOrder - rightContextItem.sortOrder;
    })
    .map(mapContextCard);

  return createSuccessResponse({
    viewModelStatus: "local_view_model_only",
    sourceSectionStatus:
      authorizationReasonContextViewModelInput.value.sectionStatus,
    modelKey: "authorization.reason.view_model.context",
    severity: authorizationReasonContextViewModelInput.value.sectionSeverity,
    contextCards,
  });
}

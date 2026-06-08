import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type {
  AuthorizationReasonContextViewSectionDto,
  AuthorizationReasonContextViewSectionItemDto,
} from "../contracts/authorization-reason-context-view-section-contract";
import type { AuthorizationReasonContextViewSectionPresentationInput } from "../models/authorization-reason-context-view-section";
import { normalizeAuthorizationReasonContextViewSectionInput } from "../validators/authorization-reason-context-view-section";

const INVALID_AUTHORIZATION_REASON_CONTEXT_VIEW_SECTION_INPUT_CODE = 400029;

function resolveSectionSeverity(
  contextItems: AuthorizationReasonContextViewSectionItemDto[],
) {
  return contextItems.some(
    (contextItem) => contextItem.severity === "attention",
  )
    ? "attention"
    : "info";
}

function mapContextItem(
  contextPresentation: AuthorizationReasonContextViewSectionPresentationInput,
  index: number,
): AuthorizationReasonContextViewSectionItemDto {
  return {
    contextType: contextPresentation.contextType,
    publicId: contextPresentation.publicId,
    reasonCode: contextPresentation.reasonCode,
    presentationKey: contextPresentation.presentationKey,
    severity: contextPresentation.severity,
    sortOrder: index + 1,
  };
}

export function buildAuthorizationReasonContextViewSectionReadModel(
  input: unknown,
): ApiResponse<AuthorizationReasonContextViewSectionDto | null> {
  const authorizationReasonContextViewSectionInput =
    normalizeAuthorizationReasonContextViewSectionInput(input);

  if (!authorizationReasonContextViewSectionInput.success) {
    return createErrorResponse(
      INVALID_AUTHORIZATION_REASON_CONTEXT_VIEW_SECTION_INPUT_CODE,
      authorizationReasonContextViewSectionInput.message,
    );
  }

  const contextItems = [
    authorizationReasonContextViewSectionInput.value.paperContextPresentation,
    authorizationReasonContextViewSectionInput.value
      .mockExamContextPresentation,
  ]
    .filter(
      (
        contextPresentation,
      ): contextPresentation is AuthorizationReasonContextViewSectionPresentationInput =>
        contextPresentation !== null,
    )
    .map(mapContextItem);

  return createSuccessResponse({
    sectionStatus: "local_view_section_only",
    sectionKey: "authorization.reason.view_section.context",
    sectionSeverity: resolveSectionSeverity(contextItems),
    contextItems,
  });
}

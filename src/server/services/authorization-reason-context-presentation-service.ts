import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type {
  AuthorizationReasonContextPresentationDto,
  AuthorizationReasonContextPresentationSummaryDto,
} from "../contracts/authorization-reason-context-presentation-contract";
import type {
  AuthorizationReasonContextPresentationReference,
  AuthorizationReasonContextType,
} from "../models/authorization-reason-context-presentation";
import { normalizeAuthorizationReasonContextPresentationInput } from "../validators/authorization-reason-context-presentation";

const INVALID_AUTHORIZATION_REASON_CONTEXT_PRESENTATION_INPUT_CODE = 400025;

function resolveContextSeverity(
  contextReference: AuthorizationReasonContextPresentationReference,
) {
  return contextReference.reasonCode === "context_mismatch"
    ? "attention"
    : "info";
}

function mapContextReferenceToPresentation(
  contextType: AuthorizationReasonContextType,
  contextReference: AuthorizationReasonContextPresentationReference | null,
): AuthorizationReasonContextPresentationDto | null {
  if (contextReference === null) {
    return null;
  }

  return {
    contextType,
    publicId: contextReference.publicId,
    reasonCode: contextReference.reasonCode,
    presentationKey: `authorization.reason.context.${contextType}.${contextReference.reasonCode}`,
    severity: resolveContextSeverity(contextReference),
  };
}

export function buildAuthorizationReasonContextPresentationReadModel(
  input: unknown,
): ApiResponse<AuthorizationReasonContextPresentationSummaryDto | null> {
  const authorizationReasonContextPresentationInput =
    normalizeAuthorizationReasonContextPresentationInput(input);

  if (!authorizationReasonContextPresentationInput.success) {
    return createErrorResponse(
      INVALID_AUTHORIZATION_REASON_CONTEXT_PRESENTATION_INPUT_CODE,
      authorizationReasonContextPresentationInput.message,
    );
  }

  return createSuccessResponse({
    presentationStatus: "local_presentation_only",
    paperContextPresentation: mapContextReferenceToPresentation(
      "paper",
      authorizationReasonContextPresentationInput.value.paperContext,
    ),
    mockExamContextPresentation: mapContextReferenceToPresentation(
      "mock_exam",
      authorizationReasonContextPresentationInput.value.mockExamContext,
    ),
  });
}

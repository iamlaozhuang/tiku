import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type {
  AuthorizationReasonItemPresentationDto,
  AuthorizationReasonItemPresentationSummaryDto,
} from "../contracts/authorization-reason-item-presentation-contract";
import type { AuthorizationAccessReasonCode } from "../models/authorization-access-reason-summary";
import { normalizeAuthorizationReasonItemPresentationInput } from "../validators/authorization-reason-item-presentation";

const INVALID_AUTHORIZATION_REASON_ITEM_PRESENTATION_INPUT_CODE = 400024;

const ATTENTION_REASON_CODES: readonly AuthorizationAccessReasonCode[] = [
  "selected_authorization_inactive",
  "authorization_window_not_started",
  "authorization_window_expired",
  "context_mismatch",
  "redacted_references_missing",
] as const;

function resolveReasonSeverity(reasonCode: AuthorizationAccessReasonCode) {
  return ATTENTION_REASON_CODES.includes(reasonCode) ? "attention" : "info";
}

function mapReasonCodeToPresentationItem(
  reasonCode: AuthorizationAccessReasonCode,
  index: number,
): AuthorizationReasonItemPresentationDto {
  return {
    reasonCode,
    presentationKey: `authorization.reason.${reasonCode}`,
    severity: resolveReasonSeverity(reasonCode),
    sortOrder: index + 1,
  };
}

export function buildAuthorizationReasonItemPresentationReadModel(
  input: unknown,
): ApiResponse<AuthorizationReasonItemPresentationSummaryDto | null> {
  const authorizationReasonItemPresentationInput =
    normalizeAuthorizationReasonItemPresentationInput(input);

  if (!authorizationReasonItemPresentationInput.success) {
    return createErrorResponse(
      INVALID_AUTHORIZATION_REASON_ITEM_PRESENTATION_INPUT_CODE,
      authorizationReasonItemPresentationInput.message,
    );
  }

  return createSuccessResponse({
    presentationStatus: "local_presentation_only",
    reasonItems: authorizationReasonItemPresentationInput.value.reasonCodes.map(
      mapReasonCodeToPresentationItem,
    ),
  });
}

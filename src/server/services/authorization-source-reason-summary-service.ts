import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type {
  AuthorizationSourceReasonSelectedAuthorizationDto,
  AuthorizationSourceReasonSummaryDto,
} from "../contracts/authorization-source-reason-summary-contract";
import type { AuthorizationSourceReasonSummarySource } from "../models/authorization-source-reason-summary";
import { normalizeAuthorizationSourceReasonSummaryInput } from "../validators/authorization-source-reason-summary";

const INVALID_AUTHORIZATION_SOURCE_REASON_SUMMARY_INPUT_CODE = 400022;

function mapSelectedAuthorizationToDto(
  authorizationSource: AuthorizationSourceReasonSummarySource,
): AuthorizationSourceReasonSelectedAuthorizationDto {
  return {
    publicId: authorizationSource.publicId,
    authorizationType: authorizationSource.authorizationType,
    status: authorizationSource.status,
    organizationPublicId: authorizationSource.organizationPublicId,
    sourceReasonCode:
      authorizationSource.status === "active"
        ? "selected_authorization_active"
        : "selected_authorization_inactive",
    redeemCodeReference: {
      publicId: authorizationSource.redeemCodePublicId,
      redactionStatus: "redacted",
    },
  };
}

export function buildAuthorizationSourceReasonSummaryReadModel(
  input: unknown,
): ApiResponse<AuthorizationSourceReasonSummaryDto | null> {
  const authorizationSourceReasonSummaryInput =
    normalizeAuthorizationSourceReasonSummaryInput(input);

  if (!authorizationSourceReasonSummaryInput.success) {
    return createErrorResponse(
      INVALID_AUTHORIZATION_SOURCE_REASON_SUMMARY_INPUT_CODE,
      authorizationSourceReasonSummaryInput.message,
    );
  }

  const selectedAuthorization =
    authorizationSourceReasonSummaryInput.value.authorizationSources.find(
      (authorizationSource) =>
        authorizationSource.publicId ===
        authorizationSourceReasonSummaryInput.value
          .selectedAuthorizationPublicId,
    ) ?? null;

  return createSuccessResponse({
    userPublicId: authorizationSourceReasonSummaryInput.value.userPublicId,
    selectedAuthorizationPublicId:
      authorizationSourceReasonSummaryInput.value.selectedAuthorizationPublicId,
    reasonStatus: "reason_summary_only",
    selectedAuthorization:
      selectedAuthorization === null
        ? null
        : mapSelectedAuthorizationToDto(selectedAuthorization),
  });
}

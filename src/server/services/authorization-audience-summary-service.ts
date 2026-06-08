import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type {
  AuthorizationAudienceDto,
  AuthorizationAudienceSummaryDto,
} from "../contracts/authorization-audience-summary-contract";
import type {
  AuthorizationAudienceSourceInput,
  AuthorizationAudienceSummaryInput,
} from "../models/authorization-audience-summary";
import { normalizeAuthorizationAudienceSummaryInput } from "../validators/authorization-audience-summary";

const INVALID_AUTHORIZATION_AUDIENCE_SUMMARY_INPUT_CODE = 400017;

function mapAuthorizationAudienceToDto(
  input: AuthorizationAudienceSourceInput,
): AuthorizationAudienceDto {
  return {
    authorizationPublicId: input.publicId,
    authorizationType: input.authorizationType,
    audienceType: input.authorizationType,
    organizationPublicId: input.organizationPublicId,
  };
}

function mapAuthorizationAudienceSummaryToDto(
  input: AuthorizationAudienceSummaryInput,
): AuthorizationAudienceSummaryDto {
  const personalAuthCount = input.authorizationSources.filter(
    (authorizationSource) =>
      authorizationSource.authorizationType === "personal_auth",
  ).length;
  const orgAuthCount = input.authorizationSources.filter(
    (authorizationSource) =>
      authorizationSource.authorizationType === "org_auth",
  ).length;
  const organizationReferenceCount = input.authorizationSources.filter(
    (authorizationSource) => authorizationSource.organizationPublicId !== null,
  ).length;

  return {
    userPublicId: input.userPublicId,
    displayStatus: "display_only",
    audienceSummary: {
      totalCount: input.authorizationSources.length,
      personalAuthCount,
      orgAuthCount,
      organizationReferenceCount,
    },
    audiences: input.authorizationSources.map(mapAuthorizationAudienceToDto),
  };
}

export function buildAuthorizationAudienceSummaryReadModel(
  input: unknown,
): ApiResponse<AuthorizationAudienceSummaryDto | null> {
  const authorizationAudienceSummaryInput =
    normalizeAuthorizationAudienceSummaryInput(input);

  if (!authorizationAudienceSummaryInput.success) {
    return createErrorResponse(
      INVALID_AUTHORIZATION_AUDIENCE_SUMMARY_INPUT_CODE,
      authorizationAudienceSummaryInput.message,
    );
  }

  return createSuccessResponse(
    mapAuthorizationAudienceSummaryToDto(
      authorizationAudienceSummaryInput.value,
    ),
  );
}

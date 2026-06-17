import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type {
  AuthorizationSourceTypeDto,
  AuthorizationSourceTypeSummaryCountDto,
  AuthorizationSourceTypeSummaryDto,
} from "../contracts/authorization-source-type-summary-contract";
import type {
  AuthorizationSourceTypeSummaryInput,
  AuthorizationSourceTypeSummarySource,
} from "../models/authorization-source-type-summary";
import { normalizeAuthorizationSourceTypeSummaryInput } from "../validators/authorization-source-type-summary";

const INVALID_AUTHORIZATION_SOURCE_TYPE_SUMMARY_INPUT_CODE = 400022;

function countSources(
  input: AuthorizationSourceTypeSummaryInput,
): AuthorizationSourceTypeSummaryCountDto {
  const personalAuthSources = input.authorizationSources.filter(
    (authorizationSource) =>
      authorizationSource.authorizationType === "personal_auth",
  );
  const orgAuthSources = input.authorizationSources.filter(
    (authorizationSource) =>
      authorizationSource.authorizationType === "org_auth",
  );

  return {
    totalCount: input.authorizationSources.length,
    personalAuthCount: personalAuthSources.length,
    orgAuthCount: orgAuthSources.length,
    activePersonalAuthCount: personalAuthSources.filter(
      (authorizationSource) => authorizationSource.status === "active",
    ).length,
    activeOrgAuthCount: orgAuthSources.filter(
      (authorizationSource) => authorizationSource.status === "active",
    ).length,
    organizationReferenceCount: orgAuthSources.length,
  };
}

function mapSourceTypeToDto(
  userPublicId: string,
  authorizationSource: AuthorizationSourceTypeSummarySource,
): AuthorizationSourceTypeDto {
  const isPersonalAuth =
    authorizationSource.authorizationType === "personal_auth";
  const ownerPublicId = isPersonalAuth
    ? userPublicId
    : authorizationSource.organizationPublicId;
  const ownerType = isPersonalAuth ? "personal" : "organization";

  return {
    authorizationPublicId: authorizationSource.publicId,
    authorizationSource: authorizationSource.authorizationType,
    effectiveEdition: authorizationSource.effectiveEdition,
    ownerType,
    ownerPublicId: ownerPublicId ?? userPublicId,
    quotaOwnerType: ownerType,
    quotaOwnerPublicId: ownerPublicId ?? userPublicId,
    profession: authorizationSource.profession,
    level: authorizationSource.level,
    startsAt: authorizationSource.startsAt.toISOString(),
    expiresAt: authorizationSource.expiresAt.toISOString(),
    status: authorizationSource.status,
    organizationPublicId: authorizationSource.organizationPublicId,
    summaryStatus: "source_summary_only",
  };
}

function mapAuthorizationSourceTypeSummaryToDto(
  input: AuthorizationSourceTypeSummaryInput,
): AuthorizationSourceTypeSummaryDto {
  const startsAtValues = input.authorizationSources.map((authorizationSource) =>
    authorizationSource.startsAt.getTime(),
  );
  const expiresAtValues = input.authorizationSources.map(
    (authorizationSource) => authorizationSource.expiresAt.getTime(),
  );

  return {
    userPublicId: input.userPublicId,
    runtimeStatus: "local_contract_only",
    sourceSummaryStatus: "personal_org_summary",
    sourceTypeSummary: countSources(input),
    effectiveWindow: {
      earliestStartsAt: new Date(Math.min(...startsAtValues)).toISOString(),
      latestExpiresAt: new Date(Math.max(...expiresAtValues)).toISOString(),
    },
    sourceTypes: input.authorizationSources.map((authorizationSource) =>
      mapSourceTypeToDto(input.userPublicId, authorizationSource),
    ),
  };
}

export function buildAuthorizationSourceTypeSummaryReadModel(
  input: unknown,
): ApiResponse<AuthorizationSourceTypeSummaryDto | null> {
  const authorizationSourceTypeSummaryInput =
    normalizeAuthorizationSourceTypeSummaryInput(input);

  if (!authorizationSourceTypeSummaryInput.success) {
    return createErrorResponse(
      INVALID_AUTHORIZATION_SOURCE_TYPE_SUMMARY_INPUT_CODE,
      authorizationSourceTypeSummaryInput.message,
    );
  }

  return createSuccessResponse(
    mapAuthorizationSourceTypeSummaryToDto(
      authorizationSourceTypeSummaryInput.value,
    ),
  );
}

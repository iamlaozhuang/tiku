import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import {
  mapAuthorizationSourceToDto,
  type AuthorizationSourceSummaryDto,
} from "../contracts/authorization-source-summary-contract";
import type { AuthorizationSourceSummaryInput } from "../models/authorization-source-summary";
import { normalizeAuthorizationSourceSummaryInput } from "../validators/authorization-source-summary";

const INVALID_AUTHORIZATION_SOURCE_SUMMARY_INPUT_CODE = 400013;

function mapAuthorizationSourceSummaryToDto(
  input: AuthorizationSourceSummaryInput,
): AuthorizationSourceSummaryDto {
  const activeCount = input.authorizationSources.filter(
    (authorizationSource) => authorizationSource.status === "active",
  ).length;

  return {
    userPublicId: input.userPublicId,
    runtimeStatus: "local_contract_only",
    sourceSummary: {
      totalCount: input.authorizationSources.length,
      activeCount,
      inactiveCount: input.authorizationSources.length - activeCount,
    },
    authorizationSources: input.authorizationSources.map(
      mapAuthorizationSourceToDto,
    ),
  };
}

export function buildAuthorizationSourceSummaryReadModel(
  input: unknown,
): ApiResponse<AuthorizationSourceSummaryDto | null> {
  const authorizationSourceSummaryInput =
    normalizeAuthorizationSourceSummaryInput(input);

  if (!authorizationSourceSummaryInput.success) {
    return createErrorResponse(
      INVALID_AUTHORIZATION_SOURCE_SUMMARY_INPUT_CODE,
      authorizationSourceSummaryInput.message,
    );
  }

  return createSuccessResponse(
    mapAuthorizationSourceSummaryToDto(authorizationSourceSummaryInput.value),
  );
}

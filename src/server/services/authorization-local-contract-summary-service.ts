import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type { AuthorizationLocalContractSummaryDto } from "../contracts/authorization-local-contract-summary-contract";
import type { AuthorizationScopeContextDto } from "../contracts/authorization-scope-summary-contract";
import {
  mapAuthorizationSourceToDto,
  type AuthorizationSourceSummaryCountDto,
} from "../contracts/authorization-source-summary-contract";
import type {
  AuthorizationScopeContext,
  AuthorizationScopeSummaryInput,
} from "../models/authorization-scope-summary";
import type { AuthorizationLocalContractSummaryInput } from "../models/authorization-local-contract-summary";
import { normalizeAuthorizationLocalContractSummaryInput } from "../validators/authorization-local-contract-summary";

const INVALID_AUTHORIZATION_LOCAL_CONTRACT_SUMMARY_INPUT_CODE = 400015;

function mapSourceSummaryToDto(
  input: AuthorizationLocalContractSummaryInput,
): AuthorizationSourceSummaryCountDto {
  const activeCount = input.sourceSummary.authorizationSources.filter(
    (authorizationSource) => authorizationSource.status === "active",
  ).length;

  return {
    totalCount: input.sourceSummary.authorizationSources.length,
    activeCount,
    inactiveCount:
      input.sourceSummary.authorizationSources.length - activeCount,
  };
}

function mapScopeContextToDto(
  input: AuthorizationScopeSummaryInput,
  scopeContext: AuthorizationScopeContext | null,
): AuthorizationScopeContextDto | null {
  if (scopeContext === null) {
    return null;
  }

  const isMatchingAuthorization =
    scopeContext.profession === input.profession &&
    scopeContext.level === input.level;

  return {
    publicId: scopeContext.publicId,
    profession: scopeContext.profession,
    level: scopeContext.level,
    scopeMatchStatus: isMatchingAuthorization
      ? "matches_authorization"
      : "context_mismatch",
  };
}

function mapAuthorizationLocalContractSummaryToDto(
  input: AuthorizationLocalContractSummaryInput,
): AuthorizationLocalContractSummaryDto {
  return {
    userPublicId: input.userPublicId,
    runtimeStatus: "local_contract_only",
    sourceSummary: mapSourceSummaryToDto(input),
    authorizationSources: input.sourceSummary.authorizationSources.map(
      mapAuthorizationSourceToDto,
    ),
    selectedAuthorization: {
      publicId: input.scopeSummary.authorizationPublicId,
      authorizationType: input.scopeSummary.authorizationType,
      profession: input.scopeSummary.profession,
      level: input.scopeSummary.level,
    },
    contextScope: {
      contentAccessStatus: "scope_only",
      paper: mapScopeContextToDto(
        input.scopeSummary,
        input.scopeSummary.paperScope,
      ),
      mockExam: mapScopeContextToDto(
        input.scopeSummary,
        input.scopeSummary.mockExamScope,
      ),
    },
    redeemCodeReference: {
      publicId: input.redeemCodePublicId,
      redactionStatus: "redacted",
      referenceStatus: "redacted_reference",
    },
    evidenceReferences: {
      auditLogPublicId: input.auditLogPublicId,
      aiCallLogPublicId: input.aiCallLogPublicId,
      redactionStatus: "redacted",
      referenceStatus: "redacted_reference",
    },
  };
}

export function buildAuthorizationLocalContractSummaryReadModel(
  input: unknown,
): ApiResponse<AuthorizationLocalContractSummaryDto | null> {
  const authorizationLocalContractSummaryInput =
    normalizeAuthorizationLocalContractSummaryInput(input);

  if (!authorizationLocalContractSummaryInput.success) {
    return createErrorResponse(
      INVALID_AUTHORIZATION_LOCAL_CONTRACT_SUMMARY_INPUT_CODE,
      authorizationLocalContractSummaryInput.message,
    );
  }

  return createSuccessResponse(
    mapAuthorizationLocalContractSummaryToDto(
      authorizationLocalContractSummaryInput.value,
    ),
  );
}

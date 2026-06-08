import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type {
  AuthorizationScopeContextDto,
  AuthorizationScopeSummaryDto,
} from "../contracts/authorization-scope-summary-contract";
import type {
  AuthorizationScopeContext,
  AuthorizationScopeSummaryInput,
} from "../models/authorization-scope-summary";
import { normalizeAuthorizationScopeSummaryInput } from "../validators/authorization-scope-summary";

const INVALID_AUTHORIZATION_SCOPE_SUMMARY_INPUT_CODE = 400014;

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

function mapAuthorizationScopeSummaryToDto(
  input: AuthorizationScopeSummaryInput,
): AuthorizationScopeSummaryDto {
  return {
    userPublicId: input.userPublicId,
    runtimeStatus: "local_contract_only",
    authorization: {
      publicId: input.authorizationPublicId,
      authorizationType: input.authorizationType,
      profession: input.profession,
      level: input.level,
    },
    contextScope: {
      contentAccessStatus: "scope_only",
      paper: mapScopeContextToDto(input, input.paperScope),
      mockExam: mapScopeContextToDto(input, input.mockExamScope),
    },
    evidenceReferences: {
      auditLogPublicId: input.auditLogPublicId,
      aiCallLogPublicId: input.aiCallLogPublicId,
      redactionStatus: "redacted",
    },
  };
}

export function buildAuthorizationScopeSummaryReadModel(
  input: unknown,
): ApiResponse<AuthorizationScopeSummaryDto | null> {
  const authorizationScopeSummaryInput =
    normalizeAuthorizationScopeSummaryInput(input);

  if (!authorizationScopeSummaryInput.success) {
    return createErrorResponse(
      INVALID_AUTHORIZATION_SCOPE_SUMMARY_INPUT_CODE,
      authorizationScopeSummaryInput.message,
    );
  }

  return createSuccessResponse(
    mapAuthorizationScopeSummaryToDto(authorizationScopeSummaryInput.value),
  );
}

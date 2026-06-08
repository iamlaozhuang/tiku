import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type { AuthorizationContextDto } from "../contracts/authorization-context-contract";
import type {
  AuthorizationContextInput,
  AuthorizationContextSource,
} from "../models/authorization-context";
import { normalizeAuthorizationContextInput } from "../validators/authorization-context";

const INVALID_AUTHORIZATION_CONTEXT_INPUT_CODE = 400006;
const AUTHORIZATION_CONTEXT_MISSING_CODE = 404004;

function selectActiveAuthorization(
  input: AuthorizationContextInput,
): AuthorizationContextSource | null {
  return (
    input.authorizationSources.find(
      (authorizationSource) => authorizationSource.status === "active",
    ) ?? null
  );
}

function mapAuthorizationContextToDto(
  input: AuthorizationContextInput,
  authorization: AuthorizationContextSource,
): AuthorizationContextDto {
  return {
    userPublicId: input.userPublicId,
    authorization: {
      publicId: authorization.publicId,
      authorizationType: authorization.authorizationType,
      profession: authorization.profession,
      level: authorization.level,
      startsAt: authorization.startsAt.toISOString(),
      expiresAt: authorization.expiresAt.toISOString(),
      status: authorization.status,
      organizationPublicId: authorization.organizationPublicId,
    },
    redeemCodeReference: {
      publicId: authorization.redeemCodePublicId,
      redactionStatus: "redacted",
    },
    contextScope: {
      paperPublicId: input.scope.paperPublicId,
      mockExamPublicId: input.scope.mockExamPublicId,
    },
    evidenceReferences: {
      auditLogPublicId: input.evidenceReferences.auditLogPublicId,
      aiCallLogPublicId: input.evidenceReferences.aiCallLogPublicId,
      redactionStatus: "redacted",
    },
  };
}

export function buildAuthorizationContextReadModel(
  input: unknown,
): ApiResponse<AuthorizationContextDto | null> {
  const authorizationContextInput = normalizeAuthorizationContextInput(input);

  if (!authorizationContextInput.success) {
    return createErrorResponse(
      INVALID_AUTHORIZATION_CONTEXT_INPUT_CODE,
      authorizationContextInput.message,
    );
  }

  const authorization = selectActiveAuthorization(
    authorizationContextInput.value,
  );

  if (authorization === null) {
    return createErrorResponse(
      AUTHORIZATION_CONTEXT_MISSING_CODE,
      "Authorization context does not include an active authorization.",
    );
  }

  return createSuccessResponse(
    mapAuthorizationContextToDto(
      authorizationContextInput.value,
      authorization,
    ),
  );
}

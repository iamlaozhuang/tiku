import type { AuthAdapterBoundary } from "../auth/auth-boundary";
import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type { AuthContextDto } from "../contracts/auth-contract";
import { mapAuthContextToApi } from "../mappers/auth-mapper";
import type { AuthUserRepository } from "../repositories/auth-repository";
import { normalizeBearerToken } from "../validators/auth-session";

export type AuthRequestInput = {
  authorization?: string | null;
};

export type AuthServiceOptions = {
  now?: () => Date;
};

export type AuthService = {
  getCurrentAuthContext(
    input: AuthRequestInput,
  ): Promise<ApiResponse<AuthContextDto | null>>;
};

const UNAUTHORIZED_CODE = 401001;
const UNAUTHORIZED_MESSAGE = "Unauthorized.";

function createUnauthorizedResponse(): ApiResponse<null> {
  return createErrorResponse(UNAUTHORIZED_CODE, UNAUTHORIZED_MESSAGE);
}

export function createAuthService(
  authAdapter: AuthAdapterBoundary,
  authUserRepository: AuthUserRepository,
  options: AuthServiceOptions = {},
): AuthService {
  const getNow = options.now ?? (() => new Date());

  return {
    async getCurrentAuthContext(input) {
      const sessionToken = normalizeBearerToken(input.authorization);

      if (sessionToken === null) {
        return createUnauthorizedResponse();
      }

      const authSession = await authAdapter.findSessionByToken(sessionToken);

      if (authSession === null || authSession.expires_at <= getNow()) {
        return createUnauthorizedResponse();
      }

      const authUser = await authUserRepository.findActiveUserByAuthUserId(
        authSession.auth_user_id,
      );

      if (authUser === null) {
        return createUnauthorizedResponse();
      }

      return createSuccessResponse(
        mapAuthContextToApi({
          session: authSession,
          user: authUser,
        }),
      );
    },
  };
}

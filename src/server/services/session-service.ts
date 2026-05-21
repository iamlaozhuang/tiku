import type { SessionCredentialAdapter } from "../auth/session-boundary";
import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type {
  AuthContextDto,
  SessionLoginDto,
} from "../contracts/auth-contract";
import { mapAuthContextToApi } from "../mappers/auth-mapper";
import type { SessionUserRepository } from "../repositories/session-repository";
import { normalizeSessionLoginInput } from "../validators/session-login";
import type { AuthService, AuthRequestInput } from "./auth-service";

export type SessionServiceOptions = {
  now?: () => Date;
};

export type SessionService = {
  login(input: unknown): Promise<ApiResponse<SessionLoginDto | null>>;
  getCurrentSession(
    input: AuthRequestInput,
  ): Promise<ApiResponse<AuthContextDto | null>>;
};

const INVALID_REQUEST_CODE = 400001;
const INVALID_CREDENTIAL_CODE = 401002;
const ACCOUNT_LOCKED_CODE = 423001;
const SESSION_UNAVAILABLE_CODE = 503001;
const SESSION_DURATION_DAY = 7;
const MAX_LOGIN_FAILURE_COUNT = 3;
const LOCK_DURATION_MINUTE = 5;

function addDays(value: Date, dayCount: number): Date {
  return new Date(value.getTime() + dayCount * 24 * 60 * 60 * 1000);
}

function addMinutes(value: Date, minuteCount: number): Date {
  return new Date(value.getTime() + minuteCount * 60 * 1000);
}

function createInvalidCredentialResponse(): ApiResponse<null> {
  return createErrorResponse(
    INVALID_CREDENTIAL_CODE,
    "Invalid phone or password.",
  );
}

function createAccountLockedResponse(): ApiResponse<null> {
  return createErrorResponse(ACCOUNT_LOCKED_CODE, "Account locked.");
}

export function createSessionService(
  credentialAdapter: SessionCredentialAdapter,
  sessionUserRepository: SessionUserRepository,
  options: SessionServiceOptions = {},
  authService?: AuthService,
): SessionService {
  const getNow = options.now ?? (() => new Date());

  return {
    async login(input) {
      const loginInput = normalizeSessionLoginInput(input);

      if (!loginInput.success) {
        return createErrorResponse(INVALID_REQUEST_CODE, loginInput.message);
      }

      const loginUser = await sessionUserRepository.findLoginUserByPhone(
        loginInput.value.phone,
      );

      if (loginUser === null) {
        return createInvalidCredentialResponse();
      }

      const now = getNow();

      if (
        loginUser.locked_until_at !== null &&
        loginUser.locked_until_at > now
      ) {
        return createAccountLockedResponse();
      }

      const isPasswordValid = await credentialAdapter.verifyPasswordCredential({
        authUserId: loginUser.auth_user_id,
        password: loginInput.value.password,
      });

      if (!isPasswordValid) {
        const loginFailedCount = loginUser.login_failed_count + 1;
        const lockedUntilAt =
          loginFailedCount >= MAX_LOGIN_FAILURE_COUNT
            ? addMinutes(now, LOCK_DURATION_MINUTE)
            : null;

        if (loginUser.login_failure_user_id !== null) {
          await sessionUserRepository.recordLoginFailure({
            userId: loginUser.login_failure_user_id,
            loginFailedCount,
            lockedUntilAt,
          });
        }

        return lockedUntilAt === null
          ? createInvalidCredentialResponse()
          : createAccountLockedResponse();
      }

      const authSession = await credentialAdapter.createSingleActiveSession({
        authUserId: loginUser.auth_user_id,
        expiresAt: addDays(now, SESSION_DURATION_DAY),
      });

      if (loginUser.login_failure_user_id !== null) {
        await sessionUserRepository.resetLoginFailures(
          loginUser.login_failure_user_id,
        );
      }

      return createSuccessResponse({
        token: authSession.token,
        ...mapAuthContextToApi({
          session: authSession,
          user: loginUser,
        }),
      });
    },

    async getCurrentSession(input) {
      if (authService === undefined) {
        return createErrorResponse(
          SESSION_UNAVAILABLE_CODE,
          "Session runtime is not configured.",
        );
      }

      return authService.getCurrentAuthContext(input);
    },
  };
}

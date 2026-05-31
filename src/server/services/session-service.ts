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
const ACCOUNT_DISABLED_CODE = 403002;
const SESSION_UNAVAILABLE_CODE = 503001;
const STUDENT_SESSION_DURATION_DAY = 7;
const ADMIN_SESSION_DURATION_HOUR = 8;
const STUDENT_MAX_LOGIN_FAILURE_COUNT = 3;
const STUDENT_LOCK_DURATION_MINUTE = 5;
const ADMIN_MAX_LOGIN_FAILURE_COUNT = 5;
const ADMIN_LOCK_DURATION_MINUTE = 15;

function addDays(value: Date, dayCount: number): Date {
  return new Date(value.getTime() + dayCount * 24 * 60 * 60 * 1000);
}

function addMinutes(value: Date, minuteCount: number): Date {
  return new Date(value.getTime() + minuteCount * 60 * 1000);
}

function addHours(value: Date, hourCount: number): Date {
  return new Date(value.getTime() + hourCount * 60 * 60 * 1000);
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

function createAccountDisabledResponse(): ApiResponse<null> {
  return createErrorResponse(ACCOUNT_DISABLED_CODE, "Account disabled.");
}

function isAdminLoginUser(
  loginUser: Awaited<ReturnType<SessionUserRepository["findLoginUserByPhone"]>>,
): boolean {
  return (
    loginUser !== null &&
    loginUser.user_type === null &&
    loginUser.admin_public_id !== null
  );
}

function getLoginLockPolicy(isAdminLogin: boolean): {
  maxFailureCount: number;
  lockDurationMinute: number;
} {
  return isAdminLogin
    ? {
        maxFailureCount: ADMIN_MAX_LOGIN_FAILURE_COUNT,
        lockDurationMinute: ADMIN_LOCK_DURATION_MINUTE,
      }
    : {
        maxFailureCount: STUDENT_MAX_LOGIN_FAILURE_COUNT,
        lockDurationMinute: STUDENT_LOCK_DURATION_MINUTE,
      };
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

      if (loginUser.status !== "active") {
        return createAccountDisabledResponse();
      }

      const now = getNow();

      if (
        loginUser.locked_until_at !== null &&
        loginUser.locked_until_at > now
      ) {
        return createAccountLockedResponse();
      }

      const isAdminLogin = isAdminLoginUser(loginUser);
      const lockPolicy = getLoginLockPolicy(isAdminLogin);
      const isPasswordValid = await credentialAdapter.verifyPasswordCredential({
        authUserId: loginUser.auth_user_id,
        password: loginInput.value.password,
      });

      if (!isPasswordValid) {
        const loginFailedCount = loginUser.login_failed_count + 1;
        const lockedUntilAt =
          loginFailedCount >= lockPolicy.maxFailureCount
            ? addMinutes(now, lockPolicy.lockDurationMinute)
            : null;

        if (loginUser.login_failure_user_id !== null) {
          await sessionUserRepository.recordLoginFailure({
            userId: loginUser.login_failure_user_id,
            userKind: loginUser.login_failure_user_kind,
            loginFailedCount,
            lockedUntilAt,
          });
        }

        return lockedUntilAt === null
          ? createInvalidCredentialResponse()
          : createAccountLockedResponse();
      }

      const createAuthSession =
        isAdminLogin && credentialAdapter.createSession !== undefined
          ? credentialAdapter.createSession
          : credentialAdapter.createSingleActiveSession;
      const authSession = await createAuthSession({
        authUserId: loginUser.auth_user_id,
        expiresAt: isAdminLogin
          ? addHours(now, ADMIN_SESSION_DURATION_HOUR)
          : addDays(now, STUDENT_SESSION_DURATION_DAY),
      });

      if (loginUser.login_failure_user_id !== null) {
        await sessionUserRepository.resetLoginFailures(
          loginUser.login_failure_user_id,
          loginUser.login_failure_user_kind,
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

import { randomUUID } from "node:crypto";

import type { AuthSessionSnapshot } from "../auth/auth-boundary";
import {
  createSessionCookieHeader,
  SESSION_COOKIE_NAME,
} from "../auth/session-cookie";
import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import {
  isLocalAcceptanceSessionRole,
  LOCAL_ACCEPTANCE_SESSION_ERROR_CODES,
  type LocalAcceptanceSessionDto,
  type LocalAcceptanceSessionRole,
} from "../contracts/local-acceptance-session-contract";
import type { AuthUserAccessRow } from "../repositories/auth-repository";

type LocalAcceptanceSessionRecord = {
  authUser: AuthUserAccessRow;
  expiresAt: Date;
  role: LocalAcceptanceSessionRole;
  sessionCredential: string;
};

export type LocalAcceptanceSessionBootstrapResult = {
  response: ApiResponse<LocalAcceptanceSessionDto | null>;
  sessionCredential: string | null;
  expiresAt: Date | null;
};

export type LocalAcceptanceSessionService = {
  createSession(input: unknown): LocalAcceptanceSessionBootstrapResult;
};

export type LocalAcceptanceSessionServiceOptions = {
  createToken?: () => string;
  isRuntimeEnabled?: () => boolean;
  now?: () => Date;
};

export type LocalAcceptanceSessionRouteOptions = {
  service?: LocalAcceptanceSessionService;
};

const LOCAL_ACCEPTANCE_SESSION_DURATION_HOUR = 8;
const LOCAL_ACCEPTANCE_AUTH_USER_ID_PREFIX = "local-acceptance-auth-user";
const AUTH_SESSION_CREDENTIAL_FIELD = "token";
const LOCAL_ACCEPTANCE_SESSION_STORE_KEY = "__tikuLocalAcceptanceSessions";

type LocalAcceptanceSessionGlobalStore = typeof globalThis & {
  [LOCAL_ACCEPTANCE_SESSION_STORE_KEY]?: Map<
    string,
    LocalAcceptanceSessionRecord
  >;
};

function getLocalAcceptanceSessions(): Map<
  string,
  LocalAcceptanceSessionRecord
> {
  const globalStore = globalThis as LocalAcceptanceSessionGlobalStore;

  // Next dev/runtime chunks can evaluate this module more than once; keep the
  // local-only acceptance store process-scoped so route and session resolvers share it.
  globalStore[LOCAL_ACCEPTANCE_SESSION_STORE_KEY] ??= new Map<
    string,
    LocalAcceptanceSessionRecord
  >();

  return globalStore[LOCAL_ACCEPTANCE_SESSION_STORE_KEY];
}

function addHours(value: Date, hourCount: number): Date {
  return new Date(value.getTime() + hourCount * 60 * 60 * 1000);
}

function createDefaultToken(): string {
  return `local-acceptance-session-${randomUUID()}`;
}

function createAuthUserId(role: LocalAcceptanceSessionRole): string {
  return `${LOCAL_ACCEPTANCE_AUTH_USER_ID_PREFIX}-${role}`;
}

function createContentAdminUser(): AuthUserAccessRow {
  return {
    admin_public_id: "local-acceptance-content-admin",
    admin_roles: ["content_admin"],
    auth_user_id: createAuthUserId("content_admin"),
    employee_public_id: null,
    id: -1,
    locked_until_at: null,
    name: "本地验收内容管理员",
    organization_public_id: null,
    phone: "local-acceptance-content-admin",
    public_id: "local-acceptance-content-admin-user",
    status: "active",
    user_type: null,
  };
}

function createInvalidRequestResponse(): ApiResponse<null> {
  return createErrorResponse(
    LOCAL_ACCEPTANCE_SESSION_ERROR_CODES.invalidRequest,
    "Invalid local acceptance session request.",
  );
}

function createForbiddenResponse(): ApiResponse<null> {
  return createErrorResponse(
    LOCAL_ACCEPTANCE_SESSION_ERROR_CODES.forbidden,
    "Local acceptance session is not available for this request.",
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isLocalHostName(hostname: string): boolean {
  return (
    hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]"
  );
}

function isLocalAcceptanceRequestAllowed(request: Request): boolean {
  if (!isLocalAcceptanceRuntimeEnabled()) {
    return false;
  }

  const hostname = new URL(request.url).hostname;

  return isLocalHostName(hostname);
}

function pruneExpiredSessions(now: Date): void {
  const localAcceptanceSessions = getLocalAcceptanceSessions();

  for (const [token, session] of localAcceptanceSessions) {
    if (session.expiresAt <= now) {
      localAcceptanceSessions.delete(token);
    }
  }
}

function findLocalAcceptanceSessionRecord(
  token: string,
  now: Date,
): LocalAcceptanceSessionRecord | null {
  if (!isLocalAcceptanceRuntimeEnabled()) {
    return null;
  }

  pruneExpiredSessions(now);

  return getLocalAcceptanceSessions().get(token) ?? null;
}

async function readRequestJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function createJsonResponse<TData>(
  response: ApiResponse<TData>,
  init?: ResponseInit,
): Response {
  return Response.json(response, init);
}

export function isLocalAcceptanceRuntimeEnabled(): boolean {
  return process.env.NODE_ENV !== "production";
}

export function createLocalAcceptanceSessionService(
  options: LocalAcceptanceSessionServiceOptions = {},
): LocalAcceptanceSessionService {
  const getNow = options.now ?? (() => new Date());
  const createToken = options.createToken ?? createDefaultToken;
  const isRuntimeEnabled =
    options.isRuntimeEnabled ?? isLocalAcceptanceRuntimeEnabled;

  return {
    createSession(input) {
      if (!isRuntimeEnabled()) {
        return {
          response: createForbiddenResponse(),
          sessionCredential: null,
          expiresAt: null,
        };
      }

      if (!isRecord(input) || !isLocalAcceptanceSessionRole(input.role)) {
        return {
          response: createInvalidRequestResponse(),
          sessionCredential: null,
          expiresAt: null,
        };
      }

      const now = getNow();
      const expiresAt = addHours(now, LOCAL_ACCEPTANCE_SESSION_DURATION_HOUR);
      const sessionCredential = createToken();
      const authUser = createContentAdminUser();

      pruneExpiredSessions(now);
      getLocalAcceptanceSessions().set(sessionCredential, {
        authUser,
        expiresAt,
        role: input.role,
        sessionCredential,
      });

      return {
        response: createSuccessResponse({
          role: input.role,
          sessionMode: "cookie",
          expiresAt: expiresAt.toISOString(),
        }),
        sessionCredential,
        expiresAt,
      };
    },
  };
}

export function findLocalAcceptanceSessionByToken(
  token: string,
  now = new Date(),
): AuthSessionSnapshot | null {
  const session = findLocalAcceptanceSessionRecord(token, now);

  if (session === null) {
    return null;
  }

  return {
    auth_user_id: session.authUser.auth_user_id,
    expires_at: session.expiresAt,
    [AUTH_SESSION_CREDENTIAL_FIELD]: session.sessionCredential,
  };
}

export function findLocalAcceptanceUserByAuthUserId(
  authUserId: string,
  now = new Date(),
): AuthUserAccessRow | null {
  if (!authUserId.startsWith(LOCAL_ACCEPTANCE_AUTH_USER_ID_PREFIX)) {
    return null;
  }

  pruneExpiredSessions(now);

  for (const session of getLocalAcceptanceSessions().values()) {
    if (session.authUser.auth_user_id === authUserId) {
      return session.authUser;
    }
  }

  return null;
}

export function createLocalAcceptanceSessionRouteHandlers(
  options: LocalAcceptanceSessionRouteOptions = {},
) {
  const service = options.service ?? createLocalAcceptanceSessionService();

  return {
    async POST(request: Request): Promise<Response> {
      if (!isLocalAcceptanceRequestAllowed(request)) {
        return createJsonResponse(createForbiddenResponse(), { status: 403 });
      }

      const result = service.createSession(await readRequestJson(request));

      if (result.response.code !== 0 || result.sessionCredential === null) {
        return createJsonResponse(result.response, { status: 400 });
      }

      return createJsonResponse(result.response, {
        headers: {
          "Set-Cookie": createSessionCookieHeader(
            result.sessionCredential,
            request,
            result.expiresAt?.toUTCString() ?? null,
          ),
        },
      });
    },
  };
}

export { SESSION_COOKIE_NAME };

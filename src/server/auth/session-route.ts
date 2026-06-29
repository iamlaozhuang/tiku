import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type { AuthRequestInput } from "../services/auth-service";
import type { SessionService } from "../services/session-service";
import {
  createExpiredSessionCookieHeader,
  createSessionCookieHeader,
  getRequestAuthorization,
} from "./session-cookie";

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getLoginSessionToken(response: ApiResponse<unknown>): string | null {
  if (response.code !== 0 || !isRecord(response.data)) {
    return null;
  }

  const sessionCredential = response.data["token"];

  return typeof sessionCredential === "string" &&
    sessionCredential.trim() !== ""
    ? sessionCredential
    : null;
}

function getLoginSessionExpiresAt(
  response: ApiResponse<unknown>,
): string | null {
  if (response.code !== 0 || !isRecord(response.data)) {
    return null;
  }

  const session = response.data.session;

  if (!isRecord(session) || typeof session.expiresAt !== "string") {
    return null;
  }

  const expiresAt = new Date(session.expiresAt);

  return Number.isNaN(expiresAt.getTime()) ? null : expiresAt.toUTCString();
}

function createClientSafeLoginResponse(
  response: ApiResponse<unknown>,
): ApiResponse<unknown> {
  if (response.code !== 0 || !isRecord(response.data)) {
    return response;
  }

  const clientData = Object.fromEntries(
    Object.entries(response.data).filter(
      ([fieldName]) => fieldName !== "token",
    ),
  );

  return {
    ...response,
    data: clientData,
  };
}

type SessionLogoutCapableService = SessionService & {
  logout?(input: AuthRequestInput): Promise<ApiResponse<null>>;
};

export function createSessionRouteHandlers(
  sessionService: SessionLogoutCapableService,
) {
  return {
    async POST(request: Request): Promise<Response> {
      const input = await readRequestJson(request);
      const loginResponse = await sessionService.login(input);
      const sessionToken = getLoginSessionToken(loginResponse);
      const clientSafeLoginResponse =
        createClientSafeLoginResponse(loginResponse);

      if (sessionToken === null) {
        return createJsonResponse(clientSafeLoginResponse);
      }

      return createJsonResponse(clientSafeLoginResponse, {
        headers: {
          "Set-Cookie": createSessionCookieHeader(
            sessionToken,
            request,
            getLoginSessionExpiresAt(loginResponse),
          ),
        },
      });
    },

    async GET(request: Request): Promise<Response> {
      return createJsonResponse(
        await sessionService.getCurrentSession({
          authorization: getRequestAuthorization(request),
        }),
      );
    },

    async DELETE(request: Request): Promise<Response> {
      const logoutResponse =
        sessionService.logout === undefined
          ? createSuccessResponse(null)
          : await sessionService.logout({
              authorization: getRequestAuthorization(request),
            });

      return createJsonResponse(logoutResponse, {
        headers: {
          "Set-Cookie": createExpiredSessionCookieHeader(request),
        },
      });
    },
  };
}

export function createUnavailableSessionRouteHandlers() {
  return createSessionRouteHandlers({
    async login() {
      return createErrorResponse(503001, "Session runtime is not configured.");
    },
    async getCurrentSession() {
      return createErrorResponse(503001, "Session runtime is not configured.");
    },
    async logout() {
      return createSuccessResponse(null);
    },
  });
}

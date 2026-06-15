import {
  createErrorResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type { SessionService } from "../services/session-service";
import {
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

export function createSessionRouteHandlers(sessionService: SessionService) {
  return {
    async POST(request: Request): Promise<Response> {
      const input = await readRequestJson(request);
      const loginResponse = await sessionService.login(input);
      const sessionToken = getLoginSessionToken(loginResponse);

      if (sessionToken === null) {
        return createJsonResponse(loginResponse);
      }

      return createJsonResponse(loginResponse, {
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
  });
}

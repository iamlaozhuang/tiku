import {
  createErrorResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type { UserRegistrationService } from "../services/user-registration-service";
import { createSessionCookieHeader } from "./session-cookie";

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

function getRegistrationSessionToken(
  response: ApiResponse<unknown>,
): string | null {
  if (response.code !== 0 || !isRecord(response.data)) {
    return null;
  }

  const sessionCredential = response.data["token"];

  return typeof sessionCredential === "string" &&
    sessionCredential.trim() !== ""
    ? sessionCredential
    : null;
}

function getRegistrationSessionExpiresAt(
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

function createClientSafeRegistrationResponse(
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

export function createUserRegistrationRouteHandlers(
  userRegistrationService: UserRegistrationService,
) {
  return {
    async POST(request: Request): Promise<Response> {
      const input = await readRequestJson(request);
      const registrationResponse =
        await userRegistrationService.registerPersonalUser(
          input,
          request.headers.get("Idempotency-Key"),
        );
      const sessionToken = getRegistrationSessionToken(registrationResponse);
      const clientSafeRegistrationResponse =
        createClientSafeRegistrationResponse(registrationResponse);

      if (sessionToken === null) {
        return createJsonResponse(clientSafeRegistrationResponse);
      }

      return createJsonResponse(clientSafeRegistrationResponse, {
        headers: {
          "Set-Cookie": createSessionCookieHeader(
            sessionToken,
            request,
            getRegistrationSessionExpiresAt(registrationResponse),
          ),
        },
      });
    },
  };
}

export function createUnavailableUserRegistrationRouteHandlers() {
  return createUserRegistrationRouteHandlers({
    async registerPersonalUser() {
      return createErrorResponse(
        503002,
        "User registration runtime is not configured.",
      );
    },
  });
}

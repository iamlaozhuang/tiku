import {
  createErrorResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type { SessionService } from "../services/session-service";

async function readRequestJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function createJsonResponse<TData>(response: ApiResponse<TData>): Response {
  return Response.json(response);
}

export function createSessionRouteHandlers(sessionService: SessionService) {
  return {
    async POST(request: Request): Promise<Response> {
      const input = await readRequestJson(request);

      return createJsonResponse(await sessionService.login(input));
    },

    async GET(request: Request): Promise<Response> {
      return createJsonResponse(
        await sessionService.getCurrentSession({
          authorization: request.headers.get("authorization"),
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

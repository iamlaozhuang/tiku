import {
  createErrorResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type { UserRegistrationService } from "../services/user-registration-service";

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

export function createUserRegistrationRouteHandlers(
  userRegistrationService: UserRegistrationService,
) {
  return {
    async POST(request: Request): Promise<Response> {
      const input = await readRequestJson(request);

      return createJsonResponse(
        await userRegistrationService.registerPersonalUser(input),
      );
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

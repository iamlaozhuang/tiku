import {
  createErrorResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type {
  AuthorizationUserContext,
  RedeemCodeAuthorizationService,
} from "./redeem-code-authorization-service";

export type AuthorizationUserResolver = (
  request: Request,
) => Promise<AuthorizationUserContext | null>;

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

async function resolveRequiredUserContext(
  request: Request,
  resolveUserContext: AuthorizationUserResolver,
): Promise<AuthorizationUserContext | ApiResponse<null>> {
  const userContext = await resolveUserContext(request);

  if (userContext === null) {
    return createErrorResponse(401001, "User session is required.");
  }

  return userContext;
}

function isAuthorizationUserContext(
  value: AuthorizationUserContext | ApiResponse<null>,
): value is AuthorizationUserContext {
  return "userPublicId" in value;
}

export function createRedeemCodeRouteHandlers(
  authorizationService: RedeemCodeAuthorizationService,
  resolveUserContext: AuthorizationUserResolver,
) {
  return {
    async POST(request: Request): Promise<Response> {
      const userContext = await resolveRequiredUserContext(
        request,
        resolveUserContext,
      );

      if (!isAuthorizationUserContext(userContext)) {
        return createJsonResponse(userContext);
      }

      const input = await readRequestJson(request);

      return createJsonResponse(
        await authorizationService.redeemCode(input, userContext),
      );
    },
  };
}

export function createPersonalAuthRouteHandlers(
  authorizationService: RedeemCodeAuthorizationService,
  resolveUserContext: AuthorizationUserResolver,
) {
  return {
    async GET(request: Request): Promise<Response> {
      const userContext = await resolveRequiredUserContext(
        request,
        resolveUserContext,
      );

      if (!isAuthorizationUserContext(userContext)) {
        return createJsonResponse(userContext);
      }

      return createJsonResponse(
        await authorizationService.listPersonalAuths(userContext),
      );
    },
  };
}

export function createUnavailableAuthorizationUserResolver(): AuthorizationUserResolver {
  return async () => null;
}

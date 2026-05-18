import {
  createErrorResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type {
  EffectiveAuthorizationService,
  EffectiveAuthorizationUserContext,
} from "./effective-authorization-service";

export type EffectiveAuthorizationUserResolver = (
  request: Request,
) => Promise<EffectiveAuthorizationUserContext | null>;

function createJsonResponse<TData>(response: ApiResponse<TData>): Response {
  return Response.json(response);
}

async function resolveRequiredUserContext(
  request: Request,
  resolveUserContext: EffectiveAuthorizationUserResolver,
): Promise<EffectiveAuthorizationUserContext | ApiResponse<null>> {
  const userContext = await resolveUserContext(request);

  if (userContext === null) {
    return createErrorResponse(401001, "User session is required.");
  }

  return userContext;
}

function isEffectiveAuthorizationUserContext(
  value: EffectiveAuthorizationUserContext | ApiResponse<null>,
): value is EffectiveAuthorizationUserContext {
  return "userPublicId" in value;
}

export function createEffectiveAuthorizationRouteHandlers(
  effectiveAuthorizationService: EffectiveAuthorizationService,
  resolveUserContext: EffectiveAuthorizationUserResolver,
) {
  return {
    async GET(request: Request): Promise<Response> {
      const userContext = await resolveRequiredUserContext(
        request,
        resolveUserContext,
      );

      if (!isEffectiveAuthorizationUserContext(userContext)) {
        return createJsonResponse(userContext);
      }

      return createJsonResponse(
        await effectiveAuthorizationService.listEffectiveAuthorizations(
          userContext,
        ),
      );
    },
  };
}

export function createUnavailableEffectiveAuthorizationUserResolver(): EffectiveAuthorizationUserResolver {
  return async () => null;
}

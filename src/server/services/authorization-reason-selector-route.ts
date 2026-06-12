import {
  createErrorResponse,
  type ApiResponse,
} from "../contracts/api-response";
import { buildAuthorizationReasonSelectorApiContract } from "./authorization-reason-selector-api-contract-service";
import {
  createRouteHandlerWithErrorEnvelope,
  createRouteHandlersWithErrorEnvelope,
} from "./route-error-response";

type AuthorizationReasonSelectorRouteContext = {
  params: Promise<{
    authorizationPublicId: string;
  }>;
};

export type AuthorizationReasonSelectorUserContext = {
  userPublicId: string;
};

export type AuthorizationReasonSelectorUserResolver = (
  request: Request,
) => Promise<AuthorizationReasonSelectorUserContext | null>;

function createJsonResponse<TData>(response: ApiResponse<TData>): Response {
  return Response.json(response);
}

async function resolveRequiredUserContext(
  request: Request,
  resolveUserContext: AuthorizationReasonSelectorUserResolver,
): Promise<AuthorizationReasonSelectorUserContext | ApiResponse<null>> {
  const userContext = await resolveUserContext(request);

  if (userContext === null) {
    return createErrorResponse(401001, "User session is required.");
  }

  return userContext;
}

function isAuthorizationReasonSelectorUserContext(
  value: AuthorizationReasonSelectorUserContext | ApiResponse<null>,
): value is AuthorizationReasonSelectorUserContext {
  return "userPublicId" in value;
}

export function createAuthorizationReasonSelectorRouteHandlers(
  resolveUserContext: AuthorizationReasonSelectorUserResolver,
) {
  return createRouteHandlersWithErrorEnvelope({
    detail: {
      POST: createRouteHandlerWithErrorEnvelope(
        async (
          request: Request,
          context: AuthorizationReasonSelectorRouteContext,
        ): Promise<Response> => {
          const userContext = await resolveRequiredUserContext(
            request,
            resolveUserContext,
          );

          if (!isAuthorizationReasonSelectorUserContext(userContext)) {
            return createJsonResponse(userContext);
          }

          const { authorizationPublicId } = await context.params;
          const requestBody = (await request.json()) as Record<string, unknown>;

          return createJsonResponse(
            buildAuthorizationReasonSelectorApiContract({
              method: "POST",
              userPublicId: userContext.userPublicId,
              authorizationPublicId,
              selectorSummary: requestBody,
            }),
          );
        },
      ),
    },
  });
}

export function createUnavailableAuthorizationReasonSelectorUserResolver(): AuthorizationReasonSelectorUserResolver {
  return async () => null;
}

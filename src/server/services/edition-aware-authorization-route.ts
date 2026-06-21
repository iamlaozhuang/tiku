import {
  createErrorResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type { EditionAwareAuthorizationListDto } from "../contracts/edition-aware-authorization-contract";
import {
  normalizeEditionAwareAuthorizationQuery,
  type EditionAwareAuthorizationQuery,
} from "../validators/edition-aware-authorization";
import {
  createRouteHandlerWithErrorEnvelope,
  createRouteHandlersWithErrorEnvelope,
} from "./route-error-response";

const invalidRequestCode = 400001;

export type EditionAwareAuthorizationUserContext = {
  userPublicId: string;
};

export type EditionAwareAuthorizationUserResolver = (
  request: Request,
) => Promise<EditionAwareAuthorizationUserContext | null>;

export type EditionAwareAuthorizationRouteService = {
  listAuthorizationContexts(
    userContext: EditionAwareAuthorizationUserContext,
    query: EditionAwareAuthorizationQuery,
  ): Promise<ApiResponse<EditionAwareAuthorizationListDto>>;
};

function createJsonResponse<TData>(response: ApiResponse<TData>): Response {
  return Response.json(response);
}

async function resolveRequiredUserContext(
  request: Request,
  resolveUserContext: EditionAwareAuthorizationUserResolver,
): Promise<EditionAwareAuthorizationUserContext | ApiResponse<null>> {
  const userContext = await resolveUserContext(request);

  if (userContext === null) {
    return createErrorResponse(401001, "User session is required.");
  }

  return userContext;
}

function isEditionAwareAuthorizationUserContext(
  value: EditionAwareAuthorizationUserContext | ApiResponse<null>,
): value is EditionAwareAuthorizationUserContext {
  return "userPublicId" in value;
}

export function createEditionAwareAuthorizationRouteHandlers(
  authorizationService: EditionAwareAuthorizationRouteService,
  resolveUserContext: EditionAwareAuthorizationUserResolver,
) {
  return createRouteHandlersWithErrorEnvelope({
    GET: createRouteHandlerWithErrorEnvelope(
      async (request: Request): Promise<Response> => {
        const userContext = await resolveRequiredUserContext(
          request,
          resolveUserContext,
        );

        if (!isEditionAwareAuthorizationUserContext(userContext)) {
          return createJsonResponse(userContext);
        }

        const queryResult = normalizeEditionAwareAuthorizationQuery(
          new URL(request.url).searchParams,
        );

        if (!queryResult.success) {
          return createJsonResponse(
            createErrorResponse(invalidRequestCode, queryResult.message),
          );
        }

        return createJsonResponse(
          await authorizationService.listAuthorizationContexts(
            userContext,
            queryResult.value,
          ),
        );
      },
    ),
  });
}

export function createUnavailableEditionAwareAuthorizationUserResolver(): EditionAwareAuthorizationUserResolver {
  return async () => null;
}

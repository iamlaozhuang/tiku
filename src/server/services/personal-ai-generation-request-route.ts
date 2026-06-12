import {
  createErrorResponse,
  type ApiResponse,
} from "../contracts/api-response";
import { buildPersonalAiGenerationRequestReadModel } from "./personal-ai-generation-request-service";
import {
  createRouteHandlerWithErrorEnvelope,
  createRouteHandlersWithErrorEnvelope,
} from "./route-error-response";
import { buildPersonalAiGenerationLocalBrowserExperienceReadModel } from "./personal-ai-generation-local-browser-experience-service";

export type PersonalAiGenerationRequestUserContext = {
  userPublicId: string;
};

export type PersonalAiGenerationRequestUserResolver = (
  request: Request,
) => Promise<PersonalAiGenerationRequestUserContext | null>;

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
  resolveUserContext: PersonalAiGenerationRequestUserResolver,
): Promise<PersonalAiGenerationRequestUserContext | ApiResponse<null>> {
  const userContext = await resolveUserContext(request);

  if (userContext === null) {
    return createErrorResponse(401001, "User session is required.");
  }

  return userContext;
}

function isPersonalAiGenerationRequestUserContext(
  value: PersonalAiGenerationRequestUserContext | ApiResponse<null>,
): value is PersonalAiGenerationRequestUserContext {
  return "userPublicId" in value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function shouldReturnLocalBrowserExperience(input: unknown): boolean {
  return isRecord(input) && input.responseMode === "local_browser_experience";
}

function createRequestInputWithUserContext(
  input: unknown,
  userContext: PersonalAiGenerationRequestUserContext,
): Record<string, unknown> {
  return {
    ...(isRecord(input) ? input : {}),
    userPublicId: userContext.userPublicId,
  };
}

export function createPersonalAiGenerationRequestRouteHandlers(
  resolveUserContext: PersonalAiGenerationRequestUserResolver,
) {
  return createRouteHandlersWithErrorEnvelope({
    collection: {
      POST: createRouteHandlerWithErrorEnvelope(
        async (request: Request): Promise<Response> => {
          const userContext = await resolveRequiredUserContext(
            request,
            resolveUserContext,
          );

          if (!isPersonalAiGenerationRequestUserContext(userContext)) {
            return createJsonResponse(userContext);
          }

          const requestInput = createRequestInputWithUserContext(
            await readRequestJson(request),
            userContext,
          );

          if (shouldReturnLocalBrowserExperience(requestInput)) {
            return createJsonResponse(
              buildPersonalAiGenerationLocalBrowserExperienceReadModel(
                requestInput,
              ),
            );
          }

          return createJsonResponse(
            buildPersonalAiGenerationRequestReadModel(requestInput),
          );
        },
      ),
    },
  });
}

export function createUnavailablePersonalAiGenerationRequestUserResolver(): PersonalAiGenerationRequestUserResolver {
  return async () => null;
}

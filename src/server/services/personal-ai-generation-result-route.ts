import {
  createErrorResponse,
  type ApiResponse,
} from "../contracts/api-response";
import { getRequestAuthorization } from "../auth/session-cookie";
import type { AuthContextDto } from "../contracts/auth-contract";
import type { PersonalAiGenerationResultRepository } from "../repositories/personal-ai-generation-result-repository";
import type { SessionService } from "./session-service";
import { createPersonalAiGenerationResultHistoryService } from "./personal-ai-generation-result-history-service";
import {
  createRouteHandlerWithErrorEnvelope,
  createRouteHandlersWithErrorEnvelope,
} from "./route-error-response";

export type PersonalAiGenerationResultUserContext = {
  userPublicId: string;
  userType: "personal" | "employee";
  organizationPublicId: string | null;
};

export type PersonalAiGenerationResultUserResolver = (
  request: Request,
) => Promise<PersonalAiGenerationResultUserContext | null>;

export type PersonalAiGenerationResultRouteDependencies = {
  resultRepository?: Pick<
    PersonalAiGenerationResultRepository,
    "listDraftResults"
  >;
};

type ResultDetailRouteContext = {
  params: Promise<{
    publicId: string;
  }>;
};

const emptyResultRepository: Pick<
  PersonalAiGenerationResultRepository,
  "listDraftResults"
> = {
  async listDraftResults() {
    return [];
  },
};

function createJsonResponse<TData>(response: ApiResponse<TData>): Response {
  return Response.json(response);
}

function isSuccessfulSessionResponse(
  response: Awaited<ReturnType<SessionService["getCurrentSession"]>>,
): response is ApiResponse<AuthContextDto> {
  return response.code === 0 && response.data !== null;
}

async function resolveRequiredUserContext(
  request: Request,
  resolveUserContext: PersonalAiGenerationResultUserResolver,
): Promise<PersonalAiGenerationResultUserContext | ApiResponse<null>> {
  const userContext = await resolveUserContext(request);

  if (userContext === null) {
    return createErrorResponse(401001, "User session is required.");
  }

  return userContext;
}

function isPersonalAiGenerationResultUserContext(
  value: PersonalAiGenerationResultUserContext | ApiResponse<null>,
): value is PersonalAiGenerationResultUserContext {
  return "userPublicId" in value;
}

function readLimitInput(request: Request): number | string | undefined {
  const limit = new URL(request.url).searchParams.get("limit");

  if (limit === null) {
    return undefined;
  }

  return /^\d+$/.test(limit) ? Number(limit) : limit;
}

function createResultHistoryQuery(
  request: Request,
  userContext: PersonalAiGenerationResultUserContext,
) {
  return {
    ownerPublicId: userContext.userPublicId,
    limit: readLimitInput(request),
  };
}

async function createResultDetailQuery(
  context: ResultDetailRouteContext,
  userContext: PersonalAiGenerationResultUserContext,
) {
  const { publicId } = await context.params;

  return {
    ownerPublicId: userContext.userPublicId,
    resultPublicId: publicId,
  };
}

export function createPersonalAiGenerationResultUserResolver(
  sessionService: Pick<SessionService, "getCurrentSession">,
): PersonalAiGenerationResultUserResolver {
  return async (request) => {
    const sessionResponse = await sessionService.getCurrentSession({
      authorization: getRequestAuthorization(request),
    });

    if (!isSuccessfulSessionResponse(sessionResponse)) {
      return null;
    }

    if (sessionResponse.data.user.userType === "personal") {
      return {
        userPublicId: sessionResponse.data.user.publicId,
        userType: "personal",
        organizationPublicId: null,
      };
    }

    if (
      sessionResponse.data.user.userType !== "employee" ||
      sessionResponse.data.user.organizationPublicId === null
    ) {
      return null;
    }

    return {
      userPublicId: sessionResponse.data.user.publicId,
      userType: "employee",
      organizationPublicId: sessionResponse.data.user.organizationPublicId,
    };
  };
}

export function createPersonalAiGenerationResultRouteHandlers(
  resolveUserContext: PersonalAiGenerationResultUserResolver,
  dependencies: PersonalAiGenerationResultRouteDependencies = {},
) {
  const resultRepository =
    dependencies.resultRepository ?? emptyResultRepository;
  const resultHistoryService =
    createPersonalAiGenerationResultHistoryService(resultRepository);

  return createRouteHandlersWithErrorEnvelope({
    collection: {
      GET: createRouteHandlerWithErrorEnvelope(
        async (request: Request): Promise<Response> => {
          const userContext = await resolveRequiredUserContext(
            request,
            resolveUserContext,
          );

          if (!isPersonalAiGenerationResultUserContext(userContext)) {
            return createJsonResponse(userContext);
          }

          return createJsonResponse(
            await resultHistoryService.listDraftResultHistory(
              createResultHistoryQuery(request, userContext),
            ),
          );
        },
      ),
    },
    detail: {
      GET: createRouteHandlerWithErrorEnvelope(
        async (
          request: Request,
          context: ResultDetailRouteContext,
        ): Promise<Response> => {
          const userContext = await resolveRequiredUserContext(
            request,
            resolveUserContext,
          );

          if (!isPersonalAiGenerationResultUserContext(userContext)) {
            return createJsonResponse(userContext);
          }

          return createJsonResponse(
            await resultHistoryService.getDraftResultDetail(
              await createResultDetailQuery(context, userContext),
            ),
          );
        },
      ),
    },
  });
}

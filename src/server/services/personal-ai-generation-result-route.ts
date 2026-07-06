import {
  createErrorResponse,
  type ApiResponse,
} from "../contracts/api-response";
import { getRequestAuthorization } from "../auth/session-cookie";
import type { AuthContextDto } from "../contracts/auth-contract";
import type { PersonalAiGenerationResultRepository } from "../repositories/personal-ai-generation-result-repository";
import type { PersonalAiGenerationResultOwnerType } from "../models/personal-ai-generation-result";
import type { SessionService } from "./session-service";
import { createPersonalAiGenerationResultHistoryService } from "./personal-ai-generation-result-history-service";
import {
  createRouteHandlerWithErrorEnvelope,
  createRouteHandlersWithErrorEnvelope,
} from "./route-error-response";

export type PersonalAiGenerationResultUserContext = {
  userPublicId: string;
  userType: "personal" | "employee";
  employeePublicId: string | null;
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

type PersonalAiGenerationResultOwnerScope = {
  ownerType: PersonalAiGenerationResultOwnerType;
  ownerPublicId: string;
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

function resolvePersonalAiGenerationResultOwnerScope(
  userContext: PersonalAiGenerationResultUserContext,
): PersonalAiGenerationResultOwnerScope {
  if (
    userContext.userType === "employee" &&
    userContext.organizationPublicId !== null
  ) {
    return {
      ownerType: "organization",
      ownerPublicId: userContext.organizationPublicId,
    };
  }

  return {
    ownerType: "personal",
    ownerPublicId: userContext.userPublicId,
  };
}

function readPositiveIntegerInput(
  searchParams: URLSearchParams,
  name: string,
): number | string | undefined {
  const value = searchParams.get(name);

  if (value === null) {
    return undefined;
  }

  return /^\d+$/.test(value) ? Number(value) : value;
}

function readTaskTypeInput(
  searchParams: URLSearchParams,
): "ai_question_generation" | "ai_paper_generation" | string | undefined {
  const taskType = searchParams.get("taskType");

  if (taskType === null) {
    return undefined;
  }

  return taskType === "ai_question_generation" ||
    taskType === "ai_paper_generation"
    ? taskType
    : taskType;
}

function createResultHistoryQuery(
  request: Request,
  userContext: PersonalAiGenerationResultUserContext,
) {
  const searchParams = new URL(request.url).searchParams;
  const page = readPositiveIntegerInput(searchParams, "page");
  const pageSize = readPositiveIntegerInput(searchParams, "pageSize");
  const limit = readPositiveIntegerInput(searchParams, "limit");
  const resolvedPage = typeof page === "number" ? page : 1;
  const resolvedPageSize =
    typeof pageSize === "number"
      ? pageSize
      : typeof limit === "number"
        ? limit
        : 10;
  const ownerScope = resolvePersonalAiGenerationResultOwnerScope(userContext);

  return {
    ownerType: ownerScope.ownerType,
    ownerPublicId: ownerScope.ownerPublicId,
    taskType: readTaskTypeInput(searchParams),
    page,
    pageSize,
    limit: pageSize ?? limit,
    offset:
      typeof page === "string" || typeof pageSize === "string"
        ? undefined
        : (resolvedPage - 1) * resolvedPageSize,
  };
}

async function createResultDetailQuery(
  context: ResultDetailRouteContext,
  userContext: PersonalAiGenerationResultUserContext,
) {
  const { publicId } = await context.params;
  const ownerScope = resolvePersonalAiGenerationResultOwnerScope(userContext);

  return {
    ownerType: ownerScope.ownerType,
    ownerPublicId: ownerScope.ownerPublicId,
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
        employeePublicId: null,
        organizationPublicId: null,
      };
    }

    if (
      sessionResponse.data.user.userType !== "employee" ||
      sessionResponse.data.user.employeePublicId === null ||
      sessionResponse.data.user.organizationPublicId === null
    ) {
      return null;
    }

    return {
      userPublicId: sessionResponse.data.user.publicId,
      userType: "employee",
      employeePublicId: sessionResponse.data.user.employeePublicId,
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

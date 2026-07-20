import {
  createErrorResponse,
  type ApiResponse,
} from "../contracts/api-response";
import { getRequestAuthorization } from "../auth/session-cookie";
import type { AuthContextDto } from "../contracts/auth-contract";
import type { SessionService } from "./session-service";
import {
  createPersonalAiGenerationResultHistoryService,
  type PersonalAiGenerationResultHistoryRepositoryPort,
} from "./personal-ai-generation-result-history-service";
import {
  resolveEffectivePersonalAiGenerationAuthorizationContext,
  resolveOwnedPersonalAiGenerationAuthorizationContext,
  type OwnedPersonalAiGenerationAuthorizationContext,
  type PersonalAiGenerationAuthorizationOwnershipRepository,
} from "./personal-ai-generation-authorization-context";
import type { EffectiveAuthorizationService } from "./effective-authorization-service";
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
  resultRepository?: PersonalAiGenerationResultHistoryRepositoryPort;
  authorizationRepository?: PersonalAiGenerationAuthorizationOwnershipRepository;
  effectiveAuthorizationService?: Pick<
    EffectiveAuthorizationService,
    "listEffectiveAuthorizations"
  >;
};

type ResultDetailRouteContext = {
  params: Promise<{
    publicId: string;
  }>;
};

const PERSONAL_AI_GENERATION_AUTHORIZATION_UNAVAILABLE_CODE = 403057;
const PERSONAL_AI_GENERATION_AUTHORIZATION_UNAVAILABLE_MESSAGE =
  "Personal AI generation is not available for this authorization.";
const INVALID_RESULT_HISTORY_INPUT_CODE = 400044;
const INVALID_RESULT_HISTORY_INPUT_MESSAGE =
  "Invalid personal AI generation result history input.";
const INVALID_RESULT_DETAIL_INPUT_CODE = 400045;
const INVALID_RESULT_DETAIL_INPUT_MESSAGE =
  "Invalid personal AI generation result detail input.";

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

function normalizeRequiredText(value: string | null): string | null {
  if (value === null) {
    return null;
  }

  const normalizedValue = value.trim();

  return normalizedValue.length === 0 ? null : normalizedValue;
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
  authorizationContext: OwnedPersonalAiGenerationAuthorizationContext,
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

  return {
    authorizationPublicId: authorizationContext.authorizationPublicId,
    ownerType: authorizationContext.ownerType,
    ownerPublicId: authorizationContext.ownerPublicId,
    actorPublicId: userContext.userPublicId,
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
  authorizationContext: OwnedPersonalAiGenerationAuthorizationContext,
) {
  const { publicId } = await context.params;

  return {
    authorizationPublicId: authorizationContext.authorizationPublicId,
    ownerType: authorizationContext.ownerType,
    ownerPublicId: authorizationContext.ownerPublicId,
    actorPublicId: userContext.userPublicId,
    resultPublicId: publicId,
  };
}

function readAuthorizationPublicId(request: Request): string | null {
  return normalizeRequiredText(
    new URL(request.url).searchParams.get("authorizationPublicId"),
  );
}

function isResultRepositoryAvailable(
  repository: PersonalAiGenerationResultHistoryRepositoryPort | undefined,
): repository is PersonalAiGenerationResultHistoryRepositoryPort {
  return (
    repository !== undefined &&
    typeof repository.listDraftResults === "function" &&
    typeof repository.findDraftResultByPublicId === "function"
  );
}

function createAuthorizationUnavailableResponse(): ApiResponse<null> {
  return createErrorResponse(
    PERSONAL_AI_GENERATION_AUTHORIZATION_UNAVAILABLE_CODE,
    PERSONAL_AI_GENERATION_AUTHORIZATION_UNAVAILABLE_MESSAGE,
  );
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
  const resultRepository = dependencies.resultRepository;
  const authorizationRepository = dependencies.authorizationRepository;
  const effectiveAuthorizationService =
    dependencies.effectiveAuthorizationService;

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

          const authorizationPublicId = readAuthorizationPublicId(request);
          const taskType = readTaskTypeInput(new URL(request.url).searchParams);

          if (
            authorizationPublicId === null ||
            (taskType !== "ai_question_generation" &&
              taskType !== "ai_paper_generation")
          ) {
            return createJsonResponse(
              createErrorResponse(
                INVALID_RESULT_HISTORY_INPUT_CODE,
                INVALID_RESULT_HISTORY_INPUT_MESSAGE,
              ),
            );
          }

          if (
            !isResultRepositoryAvailable(resultRepository) ||
            authorizationRepository === undefined ||
            effectiveAuthorizationService === undefined
          ) {
            return createJsonResponse(createAuthorizationUnavailableResponse());
          }

          const authorizationContext =
            await resolveEffectivePersonalAiGenerationAuthorizationContext({
              authorizationPublicId,
              requestedScope: null,
              taskType,
              userContext,
              authorizationRepository,
              effectiveAuthorizationService,
            });

          if (authorizationContext === null) {
            return createJsonResponse(createAuthorizationUnavailableResponse());
          }

          const ownerType = authorizationContext.ownerType;
          const quotaOwnerType = authorizationContext.quotaOwnerType;

          if (
            (ownerType !== "personal" && ownerType !== "organization") ||
            (quotaOwnerType !== "personal" && quotaOwnerType !== "organization")
          ) {
            return createJsonResponse(createAuthorizationUnavailableResponse());
          }
          const ownedAuthorizationContext: OwnedPersonalAiGenerationAuthorizationContext =
            {
              authorizationSource: authorizationContext.authorizationSource,
              authorizationPublicId: authorizationContext.authorizationPublicId,
              ownerType,
              ownerPublicId: authorizationContext.ownerPublicId,
              organizationPublicId: authorizationContext.organizationPublicId,
              quotaOwnerType,
              quotaOwnerPublicId: authorizationContext.quotaOwnerPublicId,
            };

          const resultHistoryService =
            createPersonalAiGenerationResultHistoryService(resultRepository);

          return createJsonResponse(
            await resultHistoryService.listDraftResultHistory(
              createResultHistoryQuery(
                request,
                userContext,
                ownedAuthorizationContext,
              ),
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

          const authorizationPublicId = readAuthorizationPublicId(request);

          if (authorizationPublicId === null) {
            return createJsonResponse(
              createErrorResponse(
                INVALID_RESULT_DETAIL_INPUT_CODE,
                INVALID_RESULT_DETAIL_INPUT_MESSAGE,
              ),
            );
          }

          if (
            !isResultRepositoryAvailable(resultRepository) ||
            authorizationRepository === undefined ||
            effectiveAuthorizationService === undefined
          ) {
            return createJsonResponse(createAuthorizationUnavailableResponse());
          }

          const authorizationContext =
            await resolveOwnedPersonalAiGenerationAuthorizationContext({
              authorizationPublicId,
              userContext,
              authorizationRepository,
            });

          if (authorizationContext === null) {
            return createJsonResponse(createAuthorizationUnavailableResponse());
          }

          const resultHistoryService =
            createPersonalAiGenerationResultHistoryService(resultRepository);

          const resultResponse =
            await resultHistoryService.getDraftResultDetail(
              await createResultDetailQuery(
                context,
                userContext,
                authorizationContext,
              ),
            );
          const result = resultResponse.data?.result;

          if (result !== undefined) {
            const effectiveAuthorizationContext =
              await resolveEffectivePersonalAiGenerationAuthorizationContext({
                authorizationPublicId,
                requestedScope: null,
                taskType: result.taskType,
                userContext,
                authorizationRepository,
                effectiveAuthorizationService,
              });

            if (effectiveAuthorizationContext === null) {
              return createJsonResponse(
                createAuthorizationUnavailableResponse(),
              );
            }
          }

          return createJsonResponse(resultResponse);
        },
      ),
    },
  });
}

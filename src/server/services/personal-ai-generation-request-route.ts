import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import { getRequestAuthorization } from "../auth/session-cookie";
import type { PersonalAiGenerationRequestHistoryDto } from "../contracts/personal-ai-generation-request-history-contract";
import type {
  CreatePersonalAiGenerationRequestInput,
  PersonalAiGenerationRequestRepository,
} from "../repositories/personal-ai-generation-request-repository";
import { buildPersonalAiGenerationRequestReadModel } from "./personal-ai-generation-request-service";
import {
  createRouteHandlerWithErrorEnvelope,
  createRouteHandlersWithErrorEnvelope,
} from "./route-error-response";
import { buildPersonalAiGenerationLocalBrowserExperienceReadModelForRoute } from "./personal-ai-generation-local-browser-experience-service";
import type { PersonalAiGenerationRuntimeBridgeControl } from "./personal-ai-generation-runtime-bridge-service";
import type { SessionService } from "./session-service";

export type PersonalAiGenerationRequestUserContext = {
  userPublicId: string;
  userType: "personal" | "employee";
  organizationPublicId: string | null;
};

export type PersonalAiGenerationRequestUserResolver = (
  request: Request,
) => Promise<PersonalAiGenerationRequestUserContext | null>;

type PersonalAiGenerationRequestRouteRepository = Pick<
  PersonalAiGenerationRequestRepository,
  "listRequestHistory"
> &
  Partial<Pick<PersonalAiGenerationRequestRepository, "createOrReuseRequest">>;

export type PersonalAiGenerationRequestRouteDependencies = {
  requestRepository?: PersonalAiGenerationRequestRouteRepository;
  runtimeBridgeControl?: PersonalAiGenerationRuntimeBridgeControl;
  now?: () => Date;
};

const REQUEST_HISTORY_UNAVAILABLE_CODE = 500017;
const REQUEST_HISTORY_UNAVAILABLE_MESSAGE =
  "Personal AI request history is temporarily unavailable.";
const REQUEST_PERSISTENCE_UNAVAILABLE_CODE = 500018;
const REQUEST_PERSISTENCE_UNAVAILABLE_MESSAGE =
  "Personal AI generation request could not be persisted.";
const emptyRequestRepository: PersonalAiGenerationRequestRouteRepository = {
  async listRequestHistory() {
    return [];
  },
};

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

function normalizeRequiredText(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const text = value.trim();

  return text.length === 0 ? null : text;
}

function normalizeOptionalText(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  return normalizeRequiredText(value);
}

function normalizeBoolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function normalizeCitationCount(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) && value >= 0
    ? value
    : null;
}

function isPersonalAiGenerationTaskType(
  value: string | null,
): value is CreatePersonalAiGenerationRequestInput["taskType"] {
  return value === "ai_question_generation" || value === "ai_paper_generation";
}

function isPersonalAiGenerationFuncType(
  value: string | null,
): value is CreatePersonalAiGenerationRequestInput["aiFuncType"] {
  return (
    value === "explanation" ||
    value === "hint" ||
    value === "kn_recommendation" ||
    value === "learning_suggestion"
  );
}

function isEvidenceStatus(
  value: string | null,
): value is NonNullable<
  CreatePersonalAiGenerationRequestInput["evidenceStatus"]
> {
  return value === "sufficient" || value === "weak" || value === "none";
}

function createRequestInputWithUserContext(
  input: unknown,
  userContext: PersonalAiGenerationRequestUserContext,
): Record<string, unknown> {
  const authorizationContext =
    userContext.userType === "employee" &&
    userContext.organizationPublicId !== null
      ? {
          authorizationSource: "org_auth",
          ownerType: "organization",
          ownerPublicId: userContext.organizationPublicId,
          organizationPublicId: userContext.organizationPublicId,
          quotaOwnerType: "organization",
          quotaOwnerPublicId: userContext.organizationPublicId,
        }
      : {
          authorizationSource: "personal_auth",
          ownerType: "personal",
          ownerPublicId: userContext.userPublicId,
          organizationPublicId: null,
          quotaOwnerType: "personal",
          quotaOwnerPublicId: userContext.userPublicId,
        };

  return {
    ...(isRecord(input) ? input : {}),
    userPublicId: userContext.userPublicId,
    actorPublicId: userContext.userPublicId,
    ...authorizationContext,
  };
}

function createServerOwnedLocalBrowserRequestInput(
  input: Record<string, unknown>,
): Record<string, unknown> {
  return {
    ...input,
    effectiveEdition: "advanced",
    isAuthorizationActive: true,
    isScopeAllowed: true,
    isQuotaAvailable: true,
    isRuntimeConfigReady: true,
    existingTaskPublicId: null,
    existingTaskStatus: null,
    resultPublicId: null,
    evidenceStatus: "none",
    citationCount: 0,
    auditLogPublicId: null,
    aiCallLogPublicId: null,
  };
}

function createPersistentRequestInput(
  input: Record<string, unknown>,
  requestedAt: Date,
): CreatePersonalAiGenerationRequestInput | null {
  const requestPublicId = normalizeRequiredText(input.requestPublicId);
  const taskPublicId = normalizeRequiredText(input.taskPublicId);
  const taskType = normalizeRequiredText(input.taskType);
  const aiFuncType = normalizeRequiredText(input.aiFuncType);
  const authorizationPublicId = normalizeRequiredText(
    input.authorizationPublicId,
  );
  const actorPublicId = normalizeRequiredText(input.actorPublicId);
  const authorizationSource = normalizeRequiredText(input.authorizationSource);
  const ownerType = normalizeRequiredText(input.ownerType);
  const ownerPublicId = normalizeRequiredText(input.ownerPublicId);
  const organizationPublicId = normalizeOptionalText(
    input.organizationPublicId,
  );
  const quotaOwnerType = normalizeRequiredText(input.quotaOwnerType);
  const quotaOwnerPublicId = normalizeRequiredText(input.quotaOwnerPublicId);
  const effectiveEdition = normalizeRequiredText(input.effectiveEdition);
  const questionPublicId = normalizeRequiredText(input.questionPublicId);
  const idempotencyKeyHash = normalizeRequiredText(input.idempotencyKeyHash);
  const evidenceStatus = normalizeRequiredText(input.evidenceStatus);
  const citationCount = normalizeCitationCount(input.citationCount);
  const isAuthorizationActive = normalizeBoolean(input.isAuthorizationActive);
  const isScopeAllowed = normalizeBoolean(input.isScopeAllowed);
  const isQuotaAvailable = normalizeBoolean(input.isQuotaAvailable);
  const isRuntimeConfigReady = normalizeBoolean(input.isRuntimeConfigReady);

  if (
    requestPublicId === null ||
    taskPublicId === null ||
    !isPersonalAiGenerationTaskType(taskType) ||
    !isPersonalAiGenerationFuncType(aiFuncType) ||
    authorizationPublicId === null ||
    actorPublicId === null ||
    authorizationSource === null ||
    ownerType === null ||
    ownerPublicId === null ||
    quotaOwnerType === null ||
    quotaOwnerPublicId === null ||
    effectiveEdition === null ||
    questionPublicId === null ||
    idempotencyKeyHash === null ||
    !isEvidenceStatus(evidenceStatus) ||
    citationCount === null ||
    isAuthorizationActive === null ||
    isScopeAllowed === null ||
    isQuotaAvailable === null ||
    isRuntimeConfigReady === null
  ) {
    return null;
  }

  if (
    authorizationSource !== "personal_auth" ||
    ownerType !== "personal" ||
    organizationPublicId !== null ||
    quotaOwnerType !== "personal"
  ) {
    return null;
  }

  return {
    requestPublicId,
    taskPublicId,
    taskType,
    aiFuncType,
    authorizationPublicId,
    actorPublicId,
    ownerPublicId,
    organizationPublicId,
    quotaOwnerPublicId,
    effectiveEdition,
    questionPublicId,
    answerRecordPublicId: normalizeOptionalText(input.answerRecordPublicId),
    paperPublicId: normalizeOptionalText(input.paperPublicId),
    mockExamPublicId: normalizeOptionalText(input.mockExamPublicId),
    idempotencyKeyHash,
    requestedAt,
    resultPublicId: normalizeOptionalText(input.resultPublicId),
    evidenceStatus,
    citationCount,
    aiCallLogPublicId: normalizeOptionalText(input.aiCallLogPublicId),
    isAuthorizationActive,
    isScopeAllowed,
    isQuotaAvailable,
    isRuntimeConfigReady,
  };
}

async function createRequestInputWithPersistentRequestMetadata(
  input: Record<string, unknown>,
  requestRepository: PersonalAiGenerationRequestRouteRepository,
  requestedAt: Date,
): Promise<Record<string, unknown> | null> {
  if (requestRepository.createOrReuseRequest === undefined) {
    return input;
  }

  const persistentInput = createPersistentRequestInput(input, requestedAt);

  if (persistentInput === null) {
    return input;
  }

  try {
    const persistenceResult =
      await requestRepository.createOrReuseRequest(persistentInput);
    const historyItem = persistenceResult.historyItem;
    const shouldReuseTask = persistenceResult.persistenceStatus === "reused";

    return {
      ...input,
      taskPublicId: historyItem.taskPublicId,
      existingTaskPublicId: shouldReuseTask ? historyItem.taskPublicId : null,
      existingTaskStatus: shouldReuseTask ? historyItem.status : null,
      resultPublicId: historyItem.resultPublicId,
      evidenceStatus: historyItem.evidenceStatus,
      citationCount: historyItem.citationCount,
      aiCallLogPublicId: historyItem.aiCallLogPublicId,
    };
  } catch {
    return null;
  }
}

function isSuccessfulSessionResponse(
  response: Awaited<ReturnType<SessionService["getCurrentSession"]>>,
): response is ApiResponse<NonNullable<typeof response.data>> & {
  data: NonNullable<typeof response.data>;
} {
  return response.code === 0 && response.data !== null;
}

export function createPersonalAiGenerationRequestUserResolver(
  sessionService: Pick<SessionService, "getCurrentSession">,
): PersonalAiGenerationRequestUserResolver {
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

export function createPersonalAiGenerationRequestRouteHandlers(
  resolveUserContext: PersonalAiGenerationRequestUserResolver,
  dependencies: PersonalAiGenerationRequestRouteDependencies = {},
) {
  const requestRepository =
    dependencies.requestRepository ?? emptyRequestRepository;
  const runtimeBridgeControl = dependencies.runtimeBridgeControl;
  const now = dependencies.now ?? (() => new Date());

  return createRouteHandlersWithErrorEnvelope({
    collection: {
      GET: createRouteHandlerWithErrorEnvelope(
        async (request: Request): Promise<Response> => {
          const userContext = await resolveRequiredUserContext(
            request,
            resolveUserContext,
          );

          if (!isPersonalAiGenerationRequestUserContext(userContext)) {
            return createJsonResponse(userContext);
          }

          try {
            const history = await requestRepository.listRequestHistory({
              ownerPublicId: userContext.userPublicId,
            });

            return createJsonResponse(
              createSuccessResponse<PersonalAiGenerationRequestHistoryDto>(
                history,
              ),
            );
          } catch {
            return createJsonResponse(
              createErrorResponse(
                REQUEST_HISTORY_UNAVAILABLE_CODE,
                REQUEST_HISTORY_UNAVAILABLE_MESSAGE,
              ),
            );
          }
        },
      ),
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
            const serverOwnedRequestInput =
              createServerOwnedLocalBrowserRequestInput(requestInput);
            const localBrowserRequestInput =
              await createRequestInputWithPersistentRequestMetadata(
                serverOwnedRequestInput,
                requestRepository,
                now(),
              );

            if (localBrowserRequestInput === null) {
              return createJsonResponse(
                createErrorResponse(
                  REQUEST_PERSISTENCE_UNAVAILABLE_CODE,
                  REQUEST_PERSISTENCE_UNAVAILABLE_MESSAGE,
                ),
              );
            }

            return createJsonResponse(
              await buildPersonalAiGenerationLocalBrowserExperienceReadModelForRoute(
                localBrowserRequestInput,
                { runtimeBridgeControl },
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

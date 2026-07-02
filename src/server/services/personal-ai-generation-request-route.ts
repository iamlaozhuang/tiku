import { createHash } from "node:crypto";

import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
  type ApiPagination,
  type ApiResponse,
} from "../contracts/api-response";
import { getRequestAuthorization } from "../auth/session-cookie";
import type { PersonalAiGenerationRequestHistoryDto } from "../contracts/personal-ai-generation-request-history-contract";
import type {
  CreatePersonalAiGenerationRequestInput,
  PersonalAiGenerationRequestOwnerType,
  PersonalAiGenerationRequestRepository,
} from "../repositories/personal-ai-generation-request-repository";
import type { PersonalAiGenerationResultRepository } from "../repositories/personal-ai-generation-result-repository";
import type { AiGenerationRouteIntegratedVisibleGeneratedContent } from "../contracts/route-integrated-provider-execution-contract";
import { buildPersonalAiGenerationRequestReadModel } from "./personal-ai-generation-request-service";
import {
  createRouteHandlerWithErrorEnvelope,
  createRouteHandlersWithErrorEnvelope,
} from "./route-error-response";
import { buildPersonalAiGenerationLocalBrowserExperienceReadModelForRoute } from "./personal-ai-generation-local-browser-experience-service";
import type { PersonalAiGenerationRuntimeBridgeControl } from "./personal-ai-generation-runtime-bridge-service";
import { isRouteIntegratedVisibleGeneratedContentAcceptableForDraft } from "./route-integrated-provider-execution-service";
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
  Partial<
    Pick<
      PersonalAiGenerationRequestRepository,
      "countRequestHistory" | "createOrReuseRequest"
    >
  >;

type PersonalAiGenerationRequestOwnerScope = {
  ownerType: PersonalAiGenerationRequestOwnerType;
  ownerPublicId: string;
};

type PersonalAiGenerationResultPublicIdInput = {
  taskPublicId: string;
};

export type PersonalAiGenerationRequestRouteDependencies = {
  requestRepository?: PersonalAiGenerationRequestRouteRepository;
  resultRepository?: Pick<
    PersonalAiGenerationResultRepository,
    "createOrReuseDraftResult"
  >;
  createResultPublicId?: (
    input: PersonalAiGenerationResultPublicIdInput,
  ) => string;
  runtimeBridgeControl?: PersonalAiGenerationRuntimeBridgeControl;
  now?: () => Date;
};

const REQUEST_HISTORY_UNAVAILABLE_CODE = 500017;
const REQUEST_HISTORY_UNAVAILABLE_MESSAGE =
  "Personal AI request history is temporarily unavailable.";
const PERSONAL_AI_GENERATION_HISTORY_DEFAULT_PAGE = 1;
const PERSONAL_AI_GENERATION_HISTORY_DEFAULT_PAGE_SIZE = 10;
const PERSONAL_AI_GENERATION_HISTORY_MAX_PAGE_SIZE = 50;
const REQUEST_PERSISTENCE_UNAVAILABLE_CODE = 500018;
const REQUEST_PERSISTENCE_UNAVAILABLE_MESSAGE =
  "Personal AI generation request could not be persisted.";
const RESULT_MATERIALIZATION_UNAVAILABLE_CODE = 500019;
const RESULT_MATERIALIZATION_UNAVAILABLE_MESSAGE =
  "Personal AI generation result could not be materialized.";
const emptyRequestRepository: PersonalAiGenerationRequestRouteRepository = {
  async listRequestHistory() {
    return [];
  },
};

function createDefaultResultPublicId(
  input: PersonalAiGenerationResultPublicIdInput,
): string {
  const scopeSegment = createHash("sha256")
    .update(input.taskPublicId)
    .digest("hex")
    .slice(0, 32);

  return `personal_ai_generation_result_${scopeSegment}`;
}

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

function resolvePersonalAiGenerationRequestOwnerScope(
  userContext: PersonalAiGenerationRequestUserContext,
): PersonalAiGenerationRequestOwnerScope {
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizePersonalAiGenerationTaskType(
  value: string | null,
): CreatePersonalAiGenerationRequestInput["taskType"] | undefined | null {
  if (value === null) {
    return undefined;
  }

  return value === "ai_question_generation" || value === "ai_paper_generation"
    ? value
    : null;
}

function normalizePositiveInteger(
  value: string | null,
  fallbackValue: number,
): number {
  if (value === null || !/^\d+$/.test(value)) {
    return fallbackValue;
  }

  const parsedValue = Number(value);

  return parsedValue > 0 ? parsedValue : fallbackValue;
}

function createPersonalAiGenerationHistoryQuery(request: Request): {
  taskType:
    | CreatePersonalAiGenerationRequestInput["taskType"]
    | undefined
    | null;
  page: number;
  pageSize: number;
  limit: number;
  offset: number;
} {
  const searchParams = new URL(request.url).searchParams;
  const taskType = normalizePersonalAiGenerationTaskType(
    searchParams.get("taskType"),
  );
  const page = normalizePositiveInteger(
    searchParams.get("page"),
    PERSONAL_AI_GENERATION_HISTORY_DEFAULT_PAGE,
  );
  const requestedPageSize = normalizePositiveInteger(
    searchParams.get("pageSize"),
    PERSONAL_AI_GENERATION_HISTORY_DEFAULT_PAGE_SIZE,
  );
  const pageSize = Math.min(
    requestedPageSize,
    PERSONAL_AI_GENERATION_HISTORY_MAX_PAGE_SIZE,
  );

  return {
    taskType,
    page,
    pageSize,
    limit: pageSize,
    offset: (page - 1) * pageSize,
  };
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

function isPersonalAiGenerationRequestOwnerType(
  value: string | null,
): value is PersonalAiGenerationRequestOwnerType {
  return value === "personal" || value === "organization";
}

function matchesPersistentAuthorizationBoundary(input: {
  authorizationSource: string;
  ownerType: PersonalAiGenerationRequestOwnerType;
  ownerPublicId: string;
  organizationPublicId: string | null;
  quotaOwnerType: PersonalAiGenerationRequestOwnerType;
  quotaOwnerPublicId: string;
}): boolean {
  if (input.authorizationSource === "personal_auth") {
    return (
      input.ownerType === "personal" &&
      input.organizationPublicId === null &&
      input.quotaOwnerType === "personal" &&
      input.quotaOwnerPublicId === input.ownerPublicId
    );
  }

  if (input.authorizationSource !== "org_auth") {
    return false;
  }

  return (
    input.ownerType === "organization" &&
    input.organizationPublicId !== null &&
    input.ownerPublicId === input.organizationPublicId &&
    input.quotaOwnerType === "organization" &&
    input.quotaOwnerPublicId === input.organizationPublicId
  );
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
    !isPersonalAiGenerationRequestOwnerType(ownerType) ||
    ownerPublicId === null ||
    !isPersonalAiGenerationRequestOwnerType(quotaOwnerType) ||
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
    !matchesPersistentAuthorizationBoundary({
      authorizationSource,
      ownerType,
      ownerPublicId,
      organizationPublicId,
      quotaOwnerType,
      quotaOwnerPublicId,
    })
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
    ownerType,
    ownerPublicId,
    organizationPublicId,
    quotaOwnerType,
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

function createVisibleContentDigest(
  visibleGeneratedContent: AiGenerationRouteIntegratedVisibleGeneratedContent,
): string {
  return `sha256:${createHash("sha256")
    .update(
      JSON.stringify({
        content: visibleGeneratedContent.content,
        structuredPreview: visibleGeneratedContent.structuredPreview ?? null,
      }),
    )
    .digest("hex")}`;
}

function createVisibleContentPreviewMasked(
  visibleGeneratedContent: AiGenerationRouteIntegratedVisibleGeneratedContent,
): string {
  const structuredPreview = visibleGeneratedContent.structuredPreview;

  if (structuredPreview?.kind === "question_set") {
    return structuredPreview.parseStatus === "parsed"
      ? `生成草稿已创建：题目 ${structuredPreview.actualQuestionCount}/${structuredPreview.requestedQuestionCount}，待训练页查看`
      : "生成草稿已创建：题目结构待重新解析，待训练页查看";
  }

  if (structuredPreview?.kind === "paper_draft") {
    return structuredPreview.parseStatus === "parsed"
      ? `生成草稿已创建：大题 ${structuredPreview.paperSectionCount}，题量 ${structuredPreview.questionCount ?? "未识别"}，待训练页查看`
      : "生成草稿已创建：试卷结构待重新解析，待训练页查看";
  }

  return "生成草稿已创建，待训练页查看";
}

function resolveExpectedStructuredPreviewKind(
  taskType: CreatePersonalAiGenerationRequestInput["taskType"],
): "question_set" | "paper_draft" {
  return taskType === "ai_question_generation" ? "question_set" : "paper_draft";
}

function createRuntimeBridgeControlWithResultMaterialization(input: {
  createResultPublicId: (
    publicIdInput: PersonalAiGenerationResultPublicIdInput,
  ) => string;
  resultRepository:
    | Pick<PersonalAiGenerationResultRepository, "createOrReuseDraftResult">
    | undefined;
  runtimeBridgeControl: PersonalAiGenerationRuntimeBridgeControl | undefined;
}): PersonalAiGenerationRuntimeBridgeControl | undefined {
  const resultRepository = input.resultRepository;

  if (
    input.runtimeBridgeControl === undefined ||
    resultRepository === undefined
  ) {
    return input.runtimeBridgeControl;
  }

  return {
    ...input.runtimeBridgeControl,
    createResultMaterialization: ({ executionOutcome, requestFlow }) => {
      const visibleGeneratedContent = executionOutcome.visibleGeneratedContent;

      if (
        !executionOutcome.providerCallExecuted ||
        executionOutcome.executionSummary.resultStatus !== "pass" ||
        visibleGeneratedContent === null
      ) {
        return null;
      }

      if (
        !isRouteIntegratedVisibleGeneratedContentAcceptableForDraft(
          visibleGeneratedContent,
          resolveExpectedStructuredPreviewKind(
            requestFlow.resultReference.taskType,
          ),
        )
      ) {
        return null;
      }

      const existingResultPublicId =
        requestFlow.resultReference.resultReference.resultPublicId;
      const resultPublicId =
        existingResultPublicId ??
        input.createResultPublicId({
          taskPublicId: requestFlow.resultReference.taskPublicId,
        });
      const groundingSummary = visibleGeneratedContent.groundingSummary;

      return {
        materializationMode: "fake_sanitized_in_memory_output",
        resultPublicId,
        contentDigest: createVisibleContentDigest(visibleGeneratedContent),
        contentPreviewMasked: createVisibleContentPreviewMasked(
          visibleGeneratedContent,
        ),
        evidenceStatus:
          groundingSummary?.evidenceStatus ??
          requestFlow.resultReference.resultReference.evidenceStatus,
        citationCount:
          groundingSummary?.citationCount ??
          requestFlow.resultReference.resultReference.citationCount,
        persistDraftResult: async (resultInput) => {
          try {
            return createSuccessResponse(
              await resultRepository.createOrReuseDraftResult(resultInput),
            );
          } catch {
            return createErrorResponse(
              RESULT_MATERIALIZATION_UNAVAILABLE_CODE,
              RESULT_MATERIALIZATION_UNAVAILABLE_MESSAGE,
            );
          }
        },
      };
    },
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
  const runtimeBridgeControl =
    createRuntimeBridgeControlWithResultMaterialization({
      createResultPublicId:
        dependencies.createResultPublicId ?? createDefaultResultPublicId,
      resultRepository: dependencies.resultRepository,
      runtimeBridgeControl: dependencies.runtimeBridgeControl,
    });
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
            const historyQuery =
              createPersonalAiGenerationHistoryQuery(request);

            if (historyQuery.taskType === null) {
              return createJsonResponse(
                createErrorResponse(
                  400016,
                  "Invalid personal AI generation request history input.",
                ),
              );
            }

            const ownerScope =
              resolvePersonalAiGenerationRequestOwnerScope(userContext);
            const history = await requestRepository.listRequestHistory({
              ownerType: ownerScope.ownerType,
              ownerPublicId: ownerScope.ownerPublicId,
              taskType: historyQuery.taskType,
              page: historyQuery.page,
              pageSize: historyQuery.pageSize,
              limit: historyQuery.limit,
              offset: historyQuery.offset,
            });
            const historyTotal =
              requestRepository.countRequestHistory === undefined
                ? history.length
                : await requestRepository.countRequestHistory({
                    ownerType: ownerScope.ownerType,
                    ownerPublicId: ownerScope.ownerPublicId,
                    taskType: historyQuery.taskType,
                  });

            return createJsonResponse(
              createPaginatedResponse<PersonalAiGenerationRequestHistoryDto>(
                history,
                {
                  page: historyQuery.page,
                  pageSize: historyQuery.pageSize,
                  total: historyTotal,
                  sortBy: "requestedAt",
                  sortOrder: "desc",
                } satisfies ApiPagination,
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

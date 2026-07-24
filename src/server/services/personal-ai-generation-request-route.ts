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
import type { PersonalAiGenerationResultPaperAssemblySnapshotDto } from "../contracts/personal-ai-generation-result-persistence-contract";
import type { PersonalAiGenerationRuntimeBridgePaperAssemblyDto } from "../contracts/personal-ai-generation-runtime-bridge-contract";
import type {
  CreatePersonalAiGenerationRequestInput,
  PersonalAiGenerationRequestOwnerType,
  PersonalAiGenerationRequestRepository,
  PersonalAiGenerationTaskType,
} from "../repositories/personal-ai-generation-request-repository";
import { PersonalAiGenerationSnapshotConflictError } from "../repositories/personal-ai-generation-request-repository";
import type { PersonalAiGenerationResultRepository } from "../repositories/personal-ai-generation-result-repository";
import {
  createPostgresAiGenerationTaskLifecycleRepository,
  type AiGenerationTaskAttemptIdentity,
  type AiGenerationTaskLifecycleRepository,
} from "../repositories/ai-generation-task-lifecycle-repository";
import type { OrganizationTrainingRepository } from "../repositories/organization-training-repository";
import type { AiPaperQuestionSourceRepository } from "../repositories/question-repository";
import type { AiGenerationRouteIntegratedVisibleGeneratedContent } from "../contracts/route-integrated-provider-execution-contract";
import {
  getAiGenerationSharedTaskSpec,
  type AiGenerationSharedTaskType,
} from "../contracts/ai-generation-task-spec-contract";
import type { EffectiveAuthorizationContextDto } from "../contracts/effective-authorization-contract";
import { professionValues, type Profession } from "../models/auth";
import type { AiGenerationTaskFailureCategory } from "../models/ai-generation-task";
import { buildPersonalAiGenerationRequestReadModel } from "./personal-ai-generation-request-service";
import {
  createRouteHandlerWithErrorEnvelope,
  createRouteHandlersWithErrorEnvelope,
} from "./route-error-response";
import {
  buildPersonalAiGenerationLocalBrowserExperienceReadModel,
  buildPersonalAiGenerationLocalBrowserExperienceReadModelForRoute,
} from "./personal-ai-generation-local-browser-experience-service";
import type {
  PersonalAiGenerationPaperAssemblyResolver,
  PersonalAiGenerationRuntimeBridgeControl,
} from "./personal-ai-generation-runtime-bridge-service";
import { isRouteIntegratedVisibleGeneratedContentAcceptableForDraft } from "./route-integrated-provider-execution-service";
import type { EffectiveAuthorizationService } from "./effective-authorization-service";
import type { SessionService } from "./session-service";
import { resolveAndAssembleAiPaperFromRoute } from "./ai-paper-route-plan-select-wiring-service";
import {
  resolveEffectivePersonalAiGenerationAuthorizationContext,
  type PersonalAiGenerationAuthorizationOwnershipRepository,
} from "./personal-ai-generation-authorization-context";
import { normalizePersonalAiGenerationRequestInput } from "../validators/personal-ai-generation-request";
import {
  createPersonalAiGenerationPrivatePaperQuestionSnapshot,
  createPersonalAiGenerationPrivateQuestionDraftSnapshot,
} from "../validators/personal-ai-generation-result-persistence";

export type PersonalAiGenerationRequestUserContext = {
  userPublicId: string;
  userType: "personal" | "employee";
  employeePublicId: string | null;
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

type PersonalAiGenerationResultPublicIdInput = {
  taskPublicId: string;
};

const INVALID_PERSONAL_AI_GENERATION_REQUEST_INPUT_CODE = 400011;
const INVALID_PERSONAL_AI_GENERATION_REQUEST_INPUT_MESSAGE =
  "Invalid personal AI generation request input.";
const INVALID_PERSONAL_AI_GENERATION_REQUEST_FLOW_INPUT_CODE = 400015;
const INVALID_PERSONAL_AI_GENERATION_REQUEST_FLOW_INPUT_MESSAGE =
  "Invalid personal AI generation request flow input.";

export type PersonalAiGenerationRequestRouteDependencies = {
  requestRepository?: PersonalAiGenerationRequestRouteRepository;
  resultRepository?: Pick<
    PersonalAiGenerationResultRepository,
    "createOrReuseDraftResult"
  >;
  paperAssemblyResolver?: PersonalAiGenerationPaperAssemblyResolver;
  questionRepository?: AiPaperQuestionSourceRepository;
  organizationTrainingRepository?: Pick<
    OrganizationTrainingRepository,
    "listAdminLifecycleVersions" | "listEmployeeVisibleVersions"
  > &
    Partial<
      Pick<OrganizationTrainingRepository, "findCanonicalQuestionsByVersion">
    >;
  createResultPublicId?: (
    input: PersonalAiGenerationResultPublicIdInput,
  ) => string;
  runtimeBridgeControl?: PersonalAiGenerationRuntimeBridgeControl;
  effectiveAuthorizationService?: Pick<
    EffectiveAuthorizationService,
    "listEffectiveAuthorizations"
  >;
  authorizationRepository?: PersonalAiGenerationAuthorizationOwnershipRepository;
  now?: () => Date;
  lifecycleRepository?: AiGenerationTaskLifecycleRepository;
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
const REQUEST_SNAPSHOT_CONFLICT_CODE = 409016;
const REQUEST_SNAPSHOT_CONFLICT_MESSAGE =
  "Personal AI generation request conflicts with an existing idempotency key.";
const RESULT_MATERIALIZATION_UNAVAILABLE_CODE = 500019;
const RESULT_MATERIALIZATION_UNAVAILABLE_MESSAGE =
  "Personal AI generation result could not be materialized.";
const PERSONAL_AI_GENERATION_AUTHORIZATION_UNAVAILABLE_CODE = 403057;
const PERSONAL_AI_GENERATION_AUTHORIZATION_UNAVAILABLE_MESSAGE =
  "Personal AI generation is not available for this authorization.";
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

function normalizeRouteIntegratedTaskType(
  value: unknown,
): AiGenerationSharedTaskType | null {
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
  authorizationPublicId: string | null;
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
    authorizationPublicId: normalizeRequiredText(
      searchParams.get("authorizationPublicId"),
    ),
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

function isRouteIntegratedQuestionCountWithinProductContract(input: {
  taskType: AiGenerationSharedTaskType;
  questionCount: unknown;
}): boolean {
  const parsedQuestionCount =
    typeof input.questionCount === "number"
      ? input.questionCount
      : typeof input.questionCount === "string"
        ? Number(input.questionCount)
        : null;
  const maxQuestionCount = getAiGenerationSharedTaskSpec(
    input.taskType,
  ).maxQuestionCount;

  return (
    parsedQuestionCount !== null &&
    Number.isInteger(parsedQuestionCount) &&
    parsedQuestionCount > 0 &&
    parsedQuestionCount <= maxQuestionCount
  );
}

function isRouteIntegratedGenerationQuantityAllowed(
  requestInput: Record<string, unknown>,
): boolean {
  const taskType = normalizeRouteIntegratedTaskType(requestInput.taskType);
  const generationParameters = requestInput.generationParameters;

  if (taskType === null || generationParameters === null) {
    return true;
  }

  if (generationParameters === undefined) {
    return true;
  }

  if (!isRecord(generationParameters)) {
    return false;
  }

  return isRouteIntegratedQuestionCountWithinProductContract({
    taskType,
    questionCount: generationParameters.questionCount,
  });
}

function createInvalidRouteIntegratedQuantityResponse(
  requestInput: Record<string, unknown>,
): ApiResponse<null> | null {
  if (isRouteIntegratedGenerationQuantityAllowed(requestInput)) {
    return null;
  }

  return shouldReturnLocalBrowserExperience(requestInput)
    ? createErrorResponse(
        INVALID_PERSONAL_AI_GENERATION_REQUEST_FLOW_INPUT_CODE,
        INVALID_PERSONAL_AI_GENERATION_REQUEST_FLOW_INPUT_MESSAGE,
      )
    : createErrorResponse(
        INVALID_PERSONAL_AI_GENERATION_REQUEST_INPUT_CODE,
        INVALID_PERSONAL_AI_GENERATION_REQUEST_INPUT_MESSAGE,
      );
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

function isPersonalAiGenerationAuthorizationSource(
  value: string | null,
): value is CreatePersonalAiGenerationRequestInput["authorizationSource"] {
  return value === "personal_auth" || value === "org_auth";
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
  return {
    ...(isRecord(input) ? input : {}),
    userPublicId: userContext.userPublicId,
    actorPublicId: userContext.userPublicId,
  };
}

function createServerOwnedLocalBrowserRequestInput(
  input: Record<string, unknown>,
): Record<string, unknown> {
  return {
    ...input,
    aiFuncType: null,
    questionPublicId: null,
    answerRecordPublicId: null,
    paperPublicId: null,
    mockExamPublicId: null,
    effectiveEdition: "advanced",
    isAuthorizationActive: true,
    isScopeAllowed: true,
    isQuotaAvailable: false,
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

type PersonalAiGenerationRequestedAuthorizationScope = {
  profession: Profession;
  level: number;
};

type PersonalAiGenerationRequestedAuthorizationScopeReadResult =
  | { status: "absent" }
  | { status: "invalid" }
  | {
      status: "valid";
      scope: PersonalAiGenerationRequestedAuthorizationScope;
    };

function normalizePersonalAiGenerationRequestedAuthorizationLevel(
  value: unknown,
): number | null {
  const parsedLevel =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : null;

  return parsedLevel === 1 ||
    parsedLevel === 2 ||
    parsedLevel === 3 ||
    parsedLevel === 4 ||
    parsedLevel === 5
    ? parsedLevel
    : null;
}

function readPersonalAiGenerationRequestedAuthorizationScope(
  requestInput: Record<string, unknown>,
): PersonalAiGenerationRequestedAuthorizationScopeReadResult {
  const generationParameters = requestInput.generationParameters;

  if (generationParameters === null || generationParameters === undefined) {
    return { status: "absent" };
  }

  if (!isRecord(generationParameters)) {
    return { status: "invalid" };
  }

  const profession = generationParameters.profession;
  const level = normalizePersonalAiGenerationRequestedAuthorizationLevel(
    generationParameters.level,
  );

  if (
    typeof profession !== "string" ||
    !professionValues.includes(profession as Profession) ||
    level === null
  ) {
    return { status: "invalid" };
  }

  return {
    status: "valid",
    scope: {
      profession: profession as Profession,
      level,
    },
  };
}

function createRequestInputWithEffectiveAuthorizationContext(
  input: Record<string, unknown>,
  authorizationContext: EffectiveAuthorizationContextDto,
): Record<string, unknown> {
  return {
    ...input,
    authorizationSource: authorizationContext.authorizationSource,
    authorizationPublicId: authorizationContext.authorizationPublicId,
    ownerType: authorizationContext.ownerType,
    ownerPublicId: authorizationContext.ownerPublicId,
    organizationPublicId: authorizationContext.organizationPublicId,
    quotaOwnerType: authorizationContext.quotaOwnerType,
    quotaOwnerPublicId: authorizationContext.quotaOwnerPublicId,
    effectiveEdition: authorizationContext.effectiveEdition,
  };
}

async function resolvePersonalAiGenerationAuthorizationContext(input: {
  requestInput: Record<string, unknown>;
  userContext: PersonalAiGenerationRequestUserContext;
  effectiveAuthorizationService:
    | Pick<EffectiveAuthorizationService, "listEffectiveAuthorizations">
    | undefined;
  authorizationRepository:
    | PersonalAiGenerationAuthorizationOwnershipRepository
    | undefined;
}): Promise<EffectiveAuthorizationContextDto | null> {
  const effectiveAuthorizationService = input.effectiveAuthorizationService;
  const authorizationRepository = input.authorizationRepository;

  if (
    effectiveAuthorizationService === undefined ||
    authorizationRepository === undefined
  ) {
    return null;
  }

  const authorizationPublicId = normalizeRequiredText(
    input.requestInput.authorizationPublicId,
  );
  const taskType = normalizeRequiredText(input.requestInput.taskType);

  if (
    authorizationPublicId === null ||
    !isPersonalAiGenerationTaskType(taskType)
  ) {
    return null;
  }

  const requestedScope = readPersonalAiGenerationRequestedAuthorizationScope(
    input.requestInput,
  );

  if (requestedScope.status !== "valid") {
    return null;
  }

  return resolveEffectivePersonalAiGenerationAuthorizationContext({
    authorizationPublicId,
    requestedScope: requestedScope.scope,
    taskType,
    userContext: input.userContext,
    authorizationRepository,
    effectiveAuthorizationService,
  });
}

function createPersistentRequestInput(
  input: Record<string, unknown>,
  requestedAt: Date,
): CreatePersonalAiGenerationRequestInput | null {
  const requestPublicId = normalizeRequiredText(input.requestPublicId);
  const taskPublicId = normalizeRequiredText(input.taskPublicId);
  const taskType = normalizeRequiredText(input.taskType);
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
  const clientIdempotencyKeyHash = normalizeRequiredText(
    input.idempotencyKeyHash,
  );
  const evidenceStatus = normalizeRequiredText(input.evidenceStatus);
  const citationCount = normalizeCitationCount(input.citationCount);
  const isAuthorizationActive = normalizeBoolean(input.isAuthorizationActive);
  const isScopeAllowed = normalizeBoolean(input.isScopeAllowed);
  const isQuotaAvailable = normalizeBoolean(input.isQuotaAvailable);
  const isRuntimeConfigReady = normalizeBoolean(input.isRuntimeConfigReady);
  const normalizedRequest = normalizePersonalAiGenerationRequestInput(input);

  if (
    requestPublicId === null ||
    taskPublicId === null ||
    !isPersonalAiGenerationTaskType(taskType) ||
    authorizationPublicId === null ||
    actorPublicId === null ||
    authorizationSource === null ||
    !isPersonalAiGenerationAuthorizationSource(authorizationSource) ||
    !isPersonalAiGenerationRequestOwnerType(ownerType) ||
    ownerPublicId === null ||
    !isPersonalAiGenerationRequestOwnerType(quotaOwnerType) ||
    quotaOwnerPublicId === null ||
    effectiveEdition === null ||
    clientIdempotencyKeyHash === null ||
    !isEvidenceStatus(evidenceStatus) ||
    citationCount === null ||
    isAuthorizationActive === null ||
    isScopeAllowed === null ||
    isQuotaAvailable === null ||
    isRuntimeConfigReady === null ||
    !normalizedRequest.success ||
    normalizedRequest.value.generationParameters === null
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

  const requestedAuthorizationScope =
    readPersonalAiGenerationRequestedAuthorizationScope(input);
  const idempotencyKeyHash =
    requestedAuthorizationScope.status !== "valid"
      ? clientIdempotencyKeyHash
      : createAuthorizationScopedIdempotencyKeyHash({
          authorizationPublicId,
          clientIdempotencyKeyHash,
          level: requestedAuthorizationScope.scope.level,
          organizationPublicId,
          ownerPublicId,
          ownerType,
          profession: requestedAuthorizationScope.scope.profession,
          taskType,
        });

  return {
    requestPublicId,
    taskPublicId,
    taskType,
    aiFuncType: null,
    authorizationSource,
    authorizationPublicId,
    actorPublicId,
    ownerType,
    ownerPublicId,
    organizationPublicId,
    quotaOwnerType,
    quotaOwnerPublicId,
    effectiveEdition,
    questionPublicId: null,
    answerRecordPublicId: null,
    paperPublicId: null,
    mockExamPublicId: null,
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
    generationParameters: normalizedRequest.value.generationParameters,
  };
}

function createAuthorizationScopedIdempotencyKeyHash(input: {
  authorizationPublicId: string;
  clientIdempotencyKeyHash: string;
  level: number;
  organizationPublicId: string | null;
  ownerPublicId: string;
  ownerType: PersonalAiGenerationRequestOwnerType;
  profession: Profession;
  taskType: PersonalAiGenerationTaskType;
}): string {
  const scopeIdentity = JSON.stringify([
    input.clientIdempotencyKeyHash,
    input.taskType,
    input.ownerType,
    input.ownerPublicId,
    input.organizationPublicId,
    input.authorizationPublicId,
    input.profession,
    input.level,
  ]);

  return `sha256:${createHash("sha256").update(scopeIdentity).digest("hex")}`;
}

function createVisibleContentDigest(
  visibleGeneratedContent: AiGenerationRouteIntegratedVisibleGeneratedContent,
  paperAssembly: PersonalAiGenerationRuntimeBridgePaperAssemblyDto,
): string {
  return `sha256:${createHash("sha256")
    .update(
      JSON.stringify({
        content: visibleGeneratedContent.content,
        structuredPreview: visibleGeneratedContent.structuredPreview ?? null,
        paperAssembly:
          createPersonalAiGenerationPaperAssemblyRedactedSnapshot(
            paperAssembly,
          ),
      }),
    )
    .digest("hex")}`;
}

function createPersonalAiGenerationPaperAssemblyRedactedSnapshot(
  paperAssembly: PersonalAiGenerationRuntimeBridgePaperAssemblyDto,
): PersonalAiGenerationResultPaperAssemblySnapshotDto | null {
  if (paperAssembly === null) {
    return null;
  }

  return {
    status: paperAssembly.status,
    sourceDiagnostics: { ...paperAssembly.sourceDiagnostics },
    container: {
      ...paperAssembly.container,
      sourceComposition: { ...paperAssembly.container.sourceComposition },
      ...(paperAssembly.container.constraintLineage === undefined
        ? {}
        : {
            constraintLineage: {
              request: {
                difficulty:
                  paperAssembly.container.constraintLineage.request.difficulty,
                knowledgeNodePublicIds: [
                  ...paperAssembly.container.constraintLineage.request
                    .knowledgeNodePublicIds,
                ],
              },
              plan: {
                difficulty:
                  paperAssembly.container.constraintLineage.plan.difficulty,
                knowledgeNodePublicIds: [
                  ...paperAssembly.container.constraintLineage.plan
                    .knowledgeNodePublicIds,
                ],
                parentKnowledgeNodePublicIds: [
                  ...paperAssembly.container.constraintLineage.plan
                    .parentKnowledgeNodePublicIds,
                ],
              },
            },
          }),
      sections: paperAssembly.container.sections.map((paperSection) => ({
        ...paperSection,
        selectedQuestions: paperSection.selectedQuestions.map(
          (selectedQuestion) => ({
            ...selectedQuestion,
            ...(selectedQuestion.constraintMatchBasis === undefined
              ? {}
              : {
                  constraintMatchBasis: {
                    ...selectedQuestion.constraintMatchBasis,
                    knowledgeNodePublicIds: [
                      ...selectedQuestion.constraintMatchBasis
                        .knowledgeNodePublicIds,
                    ],
                    parentKnowledgeNodePublicIds: [
                      ...selectedQuestion.constraintMatchBasis
                        .parentKnowledgeNodePublicIds,
                    ],
                    ancestorKnowledgeNodePublicIds: [
                      ...selectedQuestion.constraintMatchBasis
                        .ancestorKnowledgeNodePublicIds,
                    ],
                  },
                }),
          }),
        ),
        degradationSummary: { ...paperSection.degradationSummary },
      })),
    },
    insufficiency:
      paperAssembly.insufficiency === null
        ? null
        : { ...paperAssembly.insufficiency },
    redactionStatus: "redacted",
  };
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
  paperAssemblyResolver: PersonalAiGenerationPaperAssemblyResolver | undefined;
  resultRepository:
    | Pick<PersonalAiGenerationResultRepository, "createOrReuseDraftResult">
    | undefined;
  runtimeBridgeControl: PersonalAiGenerationRuntimeBridgeControl | undefined;
  attempt: AiGenerationTaskAttemptIdentity | null;
}): PersonalAiGenerationRuntimeBridgeControl | undefined {
  const resultRepository = input.resultRepository;

  if (input.runtimeBridgeControl === undefined || input.attempt === null) {
    return input.runtimeBridgeControl;
  }

  const attempt = input.attempt;
  const runtimeBridgeControlWithAttempt: PersonalAiGenerationRuntimeBridgeControl =
    {
      ...input.runtimeBridgeControl,
      providerExecution:
        input.runtimeBridgeControl.providerExecution === undefined
          ? undefined
          : {
              ...input.runtimeBridgeControl.providerExecution,
              attempt,
            },
    };

  if (resultRepository === undefined) {
    return runtimeBridgeControlWithAttempt;
  }

  return {
    ...runtimeBridgeControlWithAttempt,
    paperAssemblyResolver: input.paperAssemblyResolver,
    createResultMaterialization: ({
      executionOutcome,
      paperAssembly,
      privatePaperSourceQuestions,
      requestFlow,
    }) => {
      const visibleGeneratedContent = executionOutcome.visibleGeneratedContent;
      const aiCallLogPublicId = executionOutcome.aiCallLogPublicId;

      if (
        !executionOutcome.providerCallExecuted ||
        executionOutcome.executionSummary.resultStatus !== "pass" ||
        visibleGeneratedContent === null ||
        aiCallLogPublicId === null
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
      const structuredPreview = visibleGeneratedContent.structuredPreview;
      const privateQuestionDraftSnapshot =
        requestFlow.resultReference.taskType === "ai_question_generation" &&
        structuredPreview?.kind === "question_set" &&
        structuredPreview.parseStatus === "parsed"
          ? createPersonalAiGenerationPrivateQuestionDraftSnapshot({
              taskPublicId: requestFlow.resultReference.taskPublicId,
              ownerPublicId: requestFlow.taskRequest.ownerPublicId,
              requestedQuestionCount: structuredPreview.requestedQuestionCount,
              questions: structuredPreview.draftSummaries,
            })
          : null;
      const privatePaperQuestionSnapshot =
        requestFlow.resultReference.taskType === "ai_paper_generation" &&
        paperAssembly !== null &&
        privatePaperSourceQuestions !== null
          ? createPersonalAiGenerationPrivatePaperQuestionSnapshot({
              resultPublicId,
              taskPublicId: requestFlow.resultReference.taskPublicId,
              ownerType:
                requestFlow.taskRequest.ownerType === "organization"
                  ? "organization"
                  : "personal",
              ownerPublicId: requestFlow.taskRequest.ownerPublicId,
              paperAssemblyContainer: paperAssembly.container,
              sourceQuestions: privatePaperSourceQuestions,
            })
          : null;

      if (
        requestFlow.resultReference.taskType === "ai_question_generation" &&
        privateQuestionDraftSnapshot === null
      ) {
        return null;
      }

      if (
        requestFlow.resultReference.taskType === "ai_paper_generation" &&
        privatePaperQuestionSnapshot === null
      ) {
        return null;
      }

      return {
        materializationMode: "fake_sanitized_in_memory_output",
        resultPublicId,
        contentDigest: createVisibleContentDigest(
          visibleGeneratedContent,
          paperAssembly,
        ),
        contentPreviewMasked: createVisibleContentPreviewMasked(
          visibleGeneratedContent,
        ),
        privateQuestionDraftSnapshot,
        privatePaperQuestionSnapshot,
        paperAssemblyRedactedSnapshot:
          createPersonalAiGenerationPaperAssemblyRedactedSnapshot(
            paperAssembly,
          ),
        evidenceStatus:
          groundingSummary?.evidenceStatus ??
          requestFlow.resultReference.resultReference.evidenceStatus,
        citationCount:
          groundingSummary?.citationCount ??
          requestFlow.resultReference.resultReference.citationCount,
        aiCallLogPublicId,
        persistDraftResult: async (resultInput) => {
          try {
            return createSuccessResponse(
              await resultRepository.createOrReuseDraftResult({
                ...resultInput,
                attempt,
              }),
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

function createPersonalAiGenerationPaperAssemblyResolver(
  dependencies: PersonalAiGenerationRequestRouteDependencies,
  userContext: PersonalAiGenerationRequestUserContext,
): PersonalAiGenerationPaperAssemblyResolver | undefined {
  if (dependencies.paperAssemblyResolver !== undefined) {
    return dependencies.paperAssemblyResolver;
  }

  if (dependencies.questionRepository === undefined) {
    return undefined;
  }

  const questionRepository = dependencies.questionRepository;
  const organizationTrainingRepository =
    dependencies.organizationTrainingRepository;

  return ({ generationParameters, requestFlow, visibleGeneratedContent }) =>
    resolveAndAssembleAiPaperFromRoute({
      role: resolvePersonalAiGenerationPaperAssemblyRole(requestFlow),
      organizationPublicId: requestFlow.taskRequest.organizationPublicId,
      employeePublicId:
        resolvePersonalAiGenerationPaperAssemblyEmployeePublicId(
          requestFlow,
          userContext,
        ),
      generationParameters,
      visibleGeneratedContent,
      questionRepository,
      organizationTrainingRepository,
    });
}

function resolvePersonalAiGenerationPaperAssemblyRole(
  requestFlow: Parameters<PersonalAiGenerationPaperAssemblyResolver>[0]["requestFlow"],
): "personal_advanced_student" | "org_advanced_employee" {
  return requestFlow.taskRequest.ownerType === "organization"
    ? "org_advanced_employee"
    : "personal_advanced_student";
}

function resolvePersonalAiGenerationPaperAssemblyEmployeePublicId(
  requestFlow: Parameters<PersonalAiGenerationPaperAssemblyResolver>[0]["requestFlow"],
  userContext: PersonalAiGenerationRequestUserContext,
): string | null {
  return requestFlow.taskRequest.ownerType === "organization"
    ? userContext.employeePublicId
    : null;
}

async function createRequestInputWithPersistentRequestMetadata(
  input: Record<string, unknown>,
  requestRepository: PersonalAiGenerationRequestRouteRepository,
  requestedAt: Date,
): Promise<Record<string, unknown> | "snapshot_conflict" | null> {
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
  } catch (error) {
    if (error instanceof PersonalAiGenerationSnapshotConflictError) {
      return "snapshot_conflict";
    }

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

export function createPersonalAiGenerationRequestRouteHandlers(
  resolveUserContext: PersonalAiGenerationRequestUserResolver,
  dependencies: PersonalAiGenerationRequestRouteDependencies = {},
) {
  const requestRepository =
    dependencies.requestRepository ?? emptyRequestRepository;
  const effectiveAuthorizationService =
    dependencies.effectiveAuthorizationService;
  const authorizationRepository = dependencies.authorizationRepository;
  const now = dependencies.now ?? (() => new Date());
  const lifecycleRepository =
    dependencies.lifecycleRepository ??
    createPostgresAiGenerationTaskLifecycleRepository();

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
            const taskType = historyQuery.taskType;

            if (
              historyQuery.authorizationPublicId === null ||
              (taskType !== "ai_question_generation" &&
                taskType !== "ai_paper_generation")
            ) {
              return createJsonResponse(
                createErrorResponse(
                  400016,
                  "Invalid personal AI generation request history input.",
                ),
              );
            }

            if (
              authorizationRepository === undefined ||
              effectiveAuthorizationService === undefined
            ) {
              return createJsonResponse(
                createErrorResponse(
                  PERSONAL_AI_GENERATION_AUTHORIZATION_UNAVAILABLE_CODE,
                  PERSONAL_AI_GENERATION_AUTHORIZATION_UNAVAILABLE_MESSAGE,
                ),
              );
            }

            const authorizationContext =
              await resolveEffectivePersonalAiGenerationAuthorizationContext({
                authorizationPublicId: historyQuery.authorizationPublicId,
                requestedScope: null,
                taskType,
                userContext,
                authorizationRepository,
                effectiveAuthorizationService,
              });

            if (authorizationContext === null) {
              return createJsonResponse(
                createErrorResponse(
                  PERSONAL_AI_GENERATION_AUTHORIZATION_UNAVAILABLE_CODE,
                  PERSONAL_AI_GENERATION_AUTHORIZATION_UNAVAILABLE_MESSAGE,
                ),
              );
            }

            if (
              authorizationContext.ownerType !== "personal" &&
              authorizationContext.ownerType !== "organization"
            ) {
              return createJsonResponse(
                createErrorResponse(
                  PERSONAL_AI_GENERATION_AUTHORIZATION_UNAVAILABLE_CODE,
                  PERSONAL_AI_GENERATION_AUTHORIZATION_UNAVAILABLE_MESSAGE,
                ),
              );
            }

            const history = await requestRepository.listRequestHistory({
              authorizationPublicId: authorizationContext.authorizationPublicId,
              ownerType: authorizationContext.ownerType,
              ownerPublicId: authorizationContext.ownerPublicId,
              actorPublicId: userContext.userPublicId,
              taskType,
              page: historyQuery.page,
              pageSize: historyQuery.pageSize,
              limit: historyQuery.limit,
              offset: historyQuery.offset,
            });
            const historyTotal =
              requestRepository.countRequestHistory === undefined
                ? history.length
                : await requestRepository.countRequestHistory({
                    authorizationPublicId:
                      authorizationContext.authorizationPublicId,
                    ownerType: authorizationContext.ownerType,
                    ownerPublicId: authorizationContext.ownerPublicId,
                    actorPublicId: userContext.userPublicId,
                    taskType,
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
          const quantityValidationResponse =
            createInvalidRouteIntegratedQuantityResponse(requestInput);

          if (quantityValidationResponse !== null) {
            return createJsonResponse(quantityValidationResponse);
          }

          if (shouldReturnLocalBrowserExperience(requestInput)) {
            const authorizationContext =
              await resolvePersonalAiGenerationAuthorizationContext({
                requestInput,
                userContext,
                effectiveAuthorizationService,
                authorizationRepository,
              });

            if (authorizationContext === null) {
              return createJsonResponse(
                createErrorResponse(
                  PERSONAL_AI_GENERATION_AUTHORIZATION_UNAVAILABLE_CODE,
                  PERSONAL_AI_GENERATION_AUTHORIZATION_UNAVAILABLE_MESSAGE,
                ),
              );
            }

            const authorizedRequestInput =
              createRequestInputWithEffectiveAuthorizationContext(
                requestInput,
                authorizationContext,
              );
            const serverOwnedRequestInput =
              createServerOwnedLocalBrowserRequestInput(authorizedRequestInput);
            const quotaGateResponse =
              buildPersonalAiGenerationLocalBrowserExperienceReadModel(
                serverOwnedRequestInput,
              );

            if (
              quotaGateResponse.code !== 0 ||
              quotaGateResponse.data === null ||
              quotaGateResponse.data.requestFlow.taskRequest.decision !==
                "create_pending_task"
            ) {
              return createJsonResponse(quotaGateResponse);
            }

            const requestedAt = now();
            const localBrowserRequestInput =
              await createRequestInputWithPersistentRequestMetadata(
                serverOwnedRequestInput,
                requestRepository,
                requestedAt,
              );

            if (localBrowserRequestInput === "snapshot_conflict") {
              return createJsonResponse(
                createErrorResponse(
                  REQUEST_SNAPSHOT_CONFLICT_CODE,
                  REQUEST_SNAPSHOT_CONFLICT_MESSAGE,
                ),
              );
            }

            if (localBrowserRequestInput === null) {
              return createJsonResponse(
                createErrorResponse(
                  REQUEST_PERSISTENCE_UNAVAILABLE_CODE,
                  REQUEST_PERSISTENCE_UNAVAILABLE_MESSAGE,
                ),
              );
            }

            const persistentInput = createPersistentRequestInput(
              serverOwnedRequestInput,
              requestedAt,
            );
            const persistedTaskPublicId =
              typeof localBrowserRequestInput.taskPublicId === "string"
                ? localBrowserRequestInput.taskPublicId
                : null;

            const requiresLifecycleClaim =
              dependencies.runtimeBridgeControl !== undefined &&
              (dependencies.runtimeBridgeControl.providerExecution !==
                undefined ||
                dependencies.runtimeBridgeControl.resultMaterialization !==
                  undefined ||
                dependencies.runtimeBridgeControl
                  .createResultMaterialization !== undefined);

            const lifecycleScope =
              persistentInput === null || persistedTaskPublicId === null
                ? null
                : {
                    taskPublicId: persistedTaskPublicId,
                    ownerType: persistentInput.ownerType,
                    ownerPublicId: persistentInput.ownerPublicId,
                    organizationPublicId: persistentInput.organizationPublicId,
                    taskTypes: [persistentInput.taskType],
                  };

            if (requiresLifecycleClaim && lifecycleScope === null) {
              return createJsonResponse(
                createErrorResponse(
                  REQUEST_PERSISTENCE_UNAVAILABLE_CODE,
                  REQUEST_PERSISTENCE_UNAVAILABLE_MESSAGE,
                ),
              );
            }

            const claimResult =
              !requiresLifecycleClaim || lifecycleScope === null
                ? null
                : await lifecycleRepository.claimTask({
                    ...lifecycleScope,
                    claimedAt: requestedAt,
                  });
            const claimedRequestInput =
              claimResult?.disposition === "claimed"
                ? {
                    ...localBrowserRequestInput,
                    existingTaskPublicId: null,
                    existingTaskStatus: null,
                  }
                : requiresLifecycleClaim && persistedTaskPublicId !== null
                  ? {
                      ...localBrowserRequestInput,
                      existingTaskPublicId: persistedTaskPublicId,
                      existingTaskStatus:
                        claimResult?.task?.taskStatus ?? "running",
                    }
                  : localBrowserRequestInput;

            const runtimeBridgeControl =
              createRuntimeBridgeControlWithResultMaterialization({
                createResultPublicId:
                  dependencies.createResultPublicId ??
                  createDefaultResultPublicId,
                paperAssemblyResolver:
                  createPersonalAiGenerationPaperAssemblyResolver(
                    dependencies,
                    userContext,
                  ),
                resultRepository: dependencies.resultRepository,
                runtimeBridgeControl: dependencies.runtimeBridgeControl,
                attempt: claimResult?.attempt ?? null,
              });

            const experienceResponse =
              await buildPersonalAiGenerationLocalBrowserExperienceReadModelForRoute(
                claimedRequestInput,
                { runtimeBridgeControl },
              ).catch(async () => {
                if (
                  claimResult?.disposition === "claimed" &&
                  claimResult.attempt !== null &&
                  lifecycleScope !== null
                ) {
                  await lifecycleRepository.failTask({
                    ...lifecycleScope,
                    attempt: claimResult.attempt,
                    failureCategory: "system_error",
                    aiCallLogPublicId: null,
                    finishedAt: now(),
                  });
                }

                throw new Error("personal AI generation execution unavailable");
              });

            if (
              claimResult?.disposition === "claimed" &&
              claimResult.attempt !== null &&
              lifecycleScope !== null &&
              experienceResponse.data?.resultState.status === "failed"
            ) {
              await lifecycleRepository.failTask({
                ...lifecycleScope,
                attempt: claimResult.attempt,
                failureCategory:
                  resolvePersonalAiGenerationLifecycleFailureCategory(
                    experienceResponse.data.runtimeBridge
                      .providerExecutionSummary.failureCategory,
                  ),
                aiCallLogPublicId:
                  experienceResponse.data.runtimeBridge.aiCallLogPublicId,
                finishedAt: now(),
              });
            }

            return createJsonResponse(experienceResponse);
          }

          return createJsonResponse(
            buildPersonalAiGenerationRequestReadModel(requestInput),
          );
        },
      ),
    },
  });
}

type PersonalAiGenerationCancelRouteContext = {
  params: Promise<{ publicId: string }>;
};

function createNoStorePersonalAiGenerationResponse(
  response: ApiResponse<unknown>,
  status: number,
): Response {
  return Response.json(response, {
    status,
    headers: { "cache-control": "no-store" },
  });
}

export function createPersonalAiGenerationTaskCancelRouteHandler(
  resolveUserContext: PersonalAiGenerationRequestUserResolver,
  dependencies: Pick<
    PersonalAiGenerationRequestRouteDependencies,
    | "authorizationRepository"
    | "effectiveAuthorizationService"
    | "lifecycleRepository"
    | "now"
  > = {},
) {
  const lifecycleRepository =
    dependencies.lifecycleRepository ??
    createPostgresAiGenerationTaskLifecycleRepository();
  const now = dependencies.now ?? (() => new Date());

  return async (
    request: Request,
    context: PersonalAiGenerationCancelRouteContext,
  ): Promise<Response> => {
    const userContext = await resolveRequiredUserContext(
      request,
      resolveUserContext,
    );

    if (!isPersonalAiGenerationRequestUserContext(userContext)) {
      return createNoStorePersonalAiGenerationResponse(userContext, 401);
    }

    const body = await readRequestJson(request);
    const requestInput = isRecord(body) ? body : {};
    const taskType = normalizePersonalAiGenerationTaskType(
      normalizeOptionalText(requestInput.taskType),
    );
    const currentAuthorization =
      await resolvePersonalAiGenerationAuthorizationContext({
        requestInput,
        userContext,
        effectiveAuthorizationService:
          dependencies.effectiveAuthorizationService,
        authorizationRepository: dependencies.authorizationRepository,
      });
    const { publicId } = await context.params;
    const taskPublicId = normalizeRequiredText(publicId);

    if (
      currentAuthorization === null ||
      taskPublicId === null ||
      taskType === null ||
      taskType === undefined
    ) {
      return createNoStorePersonalAiGenerationResponse(
        createErrorResponse(
          PERSONAL_AI_GENERATION_AUTHORIZATION_UNAVAILABLE_CODE,
          PERSONAL_AI_GENERATION_AUTHORIZATION_UNAVAILABLE_MESSAGE,
        ),
        403,
      );
    }

    const cancellation = await lifecycleRepository.cancelTask({
      taskPublicId,
      ownerType: currentAuthorization.ownerType,
      ownerPublicId: currentAuthorization.ownerPublicId,
      organizationPublicId: currentAuthorization.organizationPublicId,
      taskTypes: [taskType],
      finishedAt: now(),
    });

    if (cancellation.task === null) {
      return createNoStorePersonalAiGenerationResponse(
        createErrorResponse(404001, "AI generation task was not found."),
        404,
      );
    }

    return createNoStorePersonalAiGenerationResponse(
      createSuccessResponse({
        taskPublicId: cancellation.task.taskPublicId,
        status: cancellation.task.taskStatus,
        failureCategory: cancellation.task.failureCategory,
        retryCount: cancellation.task.retryCount,
        canRetry: cancellation.task.canRetry,
        canCancel: cancellation.task.canCancel,
        cancellationEffect:
          "Prevents result persistence or continued adoption; remote Provider cost or transmission may already have occurred.",
        redactionStatus: "redacted",
      }),
      200,
    );
  };
}

function resolvePersonalAiGenerationLifecycleFailureCategory(
  failureCategory: string | null,
): AiGenerationTaskFailureCategory {
  if (failureCategory === "timeout") {
    return "network_error";
  }

  if (failureCategory === "provider_error") {
    return "provider_temporary_error";
  }

  if (failureCategory === "missing_provider_credential") {
    return "configuration_missing";
  }

  if (failureCategory === "insufficient_grounding_evidence") {
    return "rag_temporary_error";
  }

  if (failureCategory === "provider_call_blocked") {
    return "production_enablement_blocked";
  }

  return "system_error";
}

export function createUnavailablePersonalAiGenerationRequestUserResolver(): PersonalAiGenerationRequestUserResolver {
  return async () => null;
}

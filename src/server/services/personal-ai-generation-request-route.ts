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
import type { PersonalAiGenerationResultRepository } from "../repositories/personal-ai-generation-result-repository";
import type { OrganizationTrainingRepository } from "../repositories/organization-training-repository";
import type { AiPaperQuestionSourceRepository } from "../repositories/question-repository";
import type { AiGenerationRouteIntegratedVisibleGeneratedContent } from "../contracts/route-integrated-provider-execution-contract";
import {
  getAiGenerationSharedTaskSpec,
  type AiGenerationSharedTaskType,
} from "../contracts/ai-generation-task-spec-contract";
import type { EffectiveAuthorizationContextDto } from "../contracts/effective-authorization-contract";
import { professionValues, type Profession } from "../models/auth";
import { buildPersonalAiGenerationRequestReadModel } from "./personal-ai-generation-request-service";
import {
  createRouteHandlerWithErrorEnvelope,
  createRouteHandlersWithErrorEnvelope,
} from "./route-error-response";
import { buildPersonalAiGenerationLocalBrowserExperienceReadModelForRoute } from "./personal-ai-generation-local-browser-experience-service";
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
  const clientIdempotencyKeyHash = normalizeRequiredText(
    input.idempotencyKeyHash,
  );
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
    clientIdempotencyKeyHash === null ||
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
      sections: paperAssembly.container.sections.map((paperSection) => ({
        ...paperSection,
        selectedQuestions: paperSection.selectedQuestions.map(
          (selectedQuestion) => ({ ...selectedQuestion }),
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
    paperAssemblyResolver: input.paperAssemblyResolver,
    createResultMaterialization: ({
      executionOutcome,
      paperAssembly,
      requestFlow,
    }) => {
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
        contentDigest: createVisibleContentDigest(
          visibleGeneratedContent,
          paperAssembly,
        ),
        contentPreviewMasked: createVisibleContentPreviewMasked(
          visibleGeneratedContent,
        ),
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
              });

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

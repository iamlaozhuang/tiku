import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type {
  PersonalAiGenerationLearningPaperAssemblySessionCreationInputDto,
  PersonalAiGenerationLearningPaperSourceQuestionDto,
  PersonalAiGenerationLearningSessionAnswerInputDto,
  PersonalAiGenerationLearningSessionCreationInputDto,
  PersonalAiGenerationLearningSessionCreationResultDto,
  PersonalAiGenerationLearningSessionPublicCreationResultDto,
  PersonalAiGenerationLearningSessionRepository,
} from "../contracts/personal-ai-generation-learning-session-contract";
import type { AiPaperPlanAndSelectContainerDto } from "../contracts/ai-paper-plan-and-select-contract";
import type { PersonalAiGenerationResultDto } from "../contracts/personal-ai-generation-result-persistence-contract";
import type { PersonalAiGenerationResultSelectedAuthorizationLookupRepository } from "../repositories/personal-ai-generation-result-repository";
import type {
  PersonalAiGenerationResultUserContext,
  PersonalAiGenerationResultUserResolver,
} from "./personal-ai-generation-result-route";
import { createPersonalAiGenerationLearningSessionService } from "./personal-ai-generation-learning-session-service";
import {
  resolveEffectivePersonalAiGenerationAuthorizationContext,
  type PersonalAiGenerationAuthorizationOwnershipRepository,
} from "./personal-ai-generation-authorization-context";
import type { EffectiveAuthorizationService } from "./effective-authorization-service";
import {
  createRouteHandlerWithErrorEnvelope,
  createRouteHandlersWithErrorEnvelope,
} from "./route-error-response";

export type PersonalAiGenerationLearningSessionRouteDependencies = {
  repository?: PersonalAiGenerationLearningSessionRepository;
  resultRepository?: PersonalAiGenerationResultSelectedAuthorizationLookupRepository;
  authorizationRepository?: PersonalAiGenerationAuthorizationOwnershipRepository;
  effectiveAuthorizationService?: Pick<
    EffectiveAuthorizationService,
    "listEffectiveAuthorizations"
  >;
  paperSourceQuestionResolver?: PersonalAiGenerationLearningPaperSourceQuestionResolver;
  now?: () => Date;
};

export type PersonalAiGenerationLearningPaperSourceQuestionResolver = (
  input: PersonalAiGenerationLearningPaperSourceQuestionResolverInput,
) =>
  | Promise<PersonalAiGenerationLearningPaperSourceQuestionDto[]>
  | PersonalAiGenerationLearningPaperSourceQuestionDto[];

export type PersonalAiGenerationLearningPaperSourceQuestionResolverInput = {
  userContext: PersonalAiGenerationResultUserContext;
  ownerScope: Pick<
    PersonalAiGenerationLearningPaperAssemblySessionCreationInputDto,
    "ownerType" | "ownerPublicId" | "actorPublicId"
  >;
  sourceResultPublicId: string;
  sourceTaskPublicId: string;
  paperAssemblyContainer: AiPaperPlanAndSelectContainerDto;
};

type LearningSessionRouteContext = {
  params: Promise<{
    publicId: string;
  }>;
};

const emptyLearningSessionRepository: PersonalAiGenerationLearningSessionRepository =
  {
    saveSession() {
      return {
        status: "blocked",
        blockReason: "source_result_not_found",
      };
    },
    findSessionByPublicId() {
      return null;
    },
    saveAnswerFeedback() {},
    listAnswerFeedbackBySessionPublicId() {
      return [];
    },
  };

function createJsonResponse<TData>(response: ApiResponse<TData>): Response {
  return Response.json(response, {
    headers: { "cache-control": "no-store" },
  });
}

function projectLearningSessionCreationForApi(
  result: PersonalAiGenerationLearningSessionCreationResultDto,
): PersonalAiGenerationLearningSessionPublicCreationResultDto {
  if (result.status === "blocked") {
    return result;
  }

  return {
    status: "created",
    blockReason: null,
    session: {
      ...result.session,
      questions: result.session.questions.map((question) => ({
        sessionQuestionPublicId: question.sessionQuestionPublicId,
        sourceDraftNumber: question.sourceDraftNumber,
        questionType: question.questionType,
        difficulty: question.difficulty,
        knowledgeNodeLabels: [...question.knowledgeNodeLabels],
        questionStem: question.questionStem,
        questionOptions: question.questionOptions.map((questionOption) => ({
          optionLabel: questionOption.optionLabel,
          optionText: questionOption.optionText,
        })),
        maxScore: question.maxScore,
        reviewStatus: question.reviewStatus,
        ...(question.questionGroup === null ||
        question.questionGroup === undefined
          ? {}
          : {
              questionGroup: {
                ...question.questionGroup,
                materialSnapshot: {
                  ...question.questionGroup.materialSnapshot,
                },
                memberQuestionPublicIds: [
                  ...question.questionGroup.memberQuestionPublicIds,
                ],
              },
            }),
      })),
    },
  };
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

async function readJsonObject(
  request: Request,
): Promise<Record<string, unknown> | null> {
  const body = await request.json();

  return isRecord(body) ? body : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readRequiredString(
  body: Record<string, unknown>,
  name: string,
): string | null {
  const value = body[name];

  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function readNullableString(
  body: Record<string, unknown>,
  name: string,
): string | null {
  const value = body[name];

  if (value === undefined || value === null) {
    return null;
  }

  return typeof value === "string" ? value : null;
}

function readSelectedOptionLabels(
  body: Record<string, unknown>,
): string[] | null {
  const value = body.selectedOptionLabels;

  if (
    !Array.isArray(value) ||
    !value.every((item) => typeof item === "string")
  ) {
    return null;
  }

  return value;
}

type LearningSessionCreationRouteInput =
  | {
      kind: "authorization_unavailable";
    }
  | {
      kind: "generated_questions";
      input: PersonalAiGenerationLearningSessionCreationInputDto;
    }
  | {
      kind: "paper_assembly";
      input: PersonalAiGenerationLearningPaperAssemblySessionCreationInputDto;
    };

type PersistedLearningResult = {
  result: PersonalAiGenerationResultDto;
  ownerScope: Pick<
    PersonalAiGenerationLearningSessionCreationInputDto,
    "ownerType" | "ownerPublicId" | "actorPublicId"
  >;
};

function createLearningSessionPublicId(resultPublicId: string): string {
  return `ai_learning_session_${resultPublicId}`;
}

async function findPersistedLearningResult(input: {
  authorizationPublicId: string;
  userContext: PersonalAiGenerationResultUserContext;
  resultPublicId: string;
  resultRepository: PersonalAiGenerationResultSelectedAuthorizationLookupRepository;
}): Promise<PersistedLearningResult | null> {
  const ownerScopes: PersistedLearningResult["ownerScope"][] = [
    {
      ownerType: "personal",
      ownerPublicId: input.userContext.userPublicId,
      actorPublicId: input.userContext.userPublicId,
    },
  ];

  if (
    input.userContext.userType === "employee" &&
    input.userContext.organizationPublicId !== null
  ) {
    ownerScopes.push({
      ownerType: "organization",
      ownerPublicId: input.userContext.organizationPublicId,
      actorPublicId: input.userContext.userPublicId,
    });
  }

  for (const ownerScope of ownerScopes) {
    const result = await input.resultRepository.findDraftResultByPublicId({
      ...ownerScope,
      authorizationPublicId: input.authorizationPublicId,
      resultPublicId: input.resultPublicId,
    });

    if (result !== null) {
      return { result, ownerScope };
    }
  }

  return null;
}

async function createPersistedLearningSessionInput(input: {
  authorizationPublicId: string;
  authorizationRepository: PersonalAiGenerationAuthorizationOwnershipRepository;
  body: Record<string, unknown>;
  effectiveAuthorizationService: Pick<
    EffectiveAuthorizationService,
    "listEffectiveAuthorizations"
  >;
  userContext: PersonalAiGenerationResultUserContext;
  resultPublicId: string;
  learningSessionRepository: PersonalAiGenerationLearningSessionRepository;
  resultRepository: PersonalAiGenerationResultSelectedAuthorizationLookupRepository;
  paperSourceQuestionResolver:
    | PersonalAiGenerationLearningPaperSourceQuestionResolver
    | undefined;
  now: () => Date;
}): Promise<LearningSessionCreationRouteInput | null> {
  const persistedLearningResult = await findPersistedLearningResult(input);

  if (persistedLearningResult === null) {
    return null;
  }

  const { result, ownerScope } = persistedLearningResult;
  const authorizationContext =
    await resolveEffectivePersonalAiGenerationAuthorizationContext({
      authorizationPublicId: input.authorizationPublicId,
      requestedScope: null,
      taskType: result.taskType,
      userContext: input.userContext,
      authorizationRepository: input.authorizationRepository,
      effectiveAuthorizationService: input.effectiveAuthorizationService,
    });

  if (
    authorizationContext === null ||
    authorizationContext.ownerType !== ownerScope.ownerType ||
    authorizationContext.ownerPublicId !== ownerScope.ownerPublicId
  ) {
    return { kind: "authorization_unavailable" };
  }

  const sessionPublicId = createLearningSessionPublicId(result.resultPublicId);

  if (result.taskType === "ai_question_generation") {
    if (
      input.resultRepository.findPrivateQuestionDraftSnapshotByPublicId ===
      undefined
    ) {
      return null;
    }

    const questionDraftSnapshot =
      await input.resultRepository.findPrivateQuestionDraftSnapshotByPublicId({
        ...ownerScope,
        authorizationPublicId: input.authorizationPublicId,
        resultPublicId: result.resultPublicId,
      });

    if (
      questionDraftSnapshot === null ||
      questionDraftSnapshot.snapshot.taskPublicId !== result.taskPublicId ||
      questionDraftSnapshot.snapshot.ownerPublicId !==
        ownerScope.ownerPublicId ||
      result.evidenceReference.evidenceStatus !== "sufficient" ||
      result.evidenceReference.citationCount <= 0
    ) {
      return null;
    }

    return {
      kind: "generated_questions",
      input: {
        sessionPublicId,
        sourceResultPublicId: result.resultPublicId,
        sourceTaskPublicId: result.taskPublicId,
        questionDraftSnapshot,
        evidenceStatus: result.evidenceReference.evidenceStatus,
        citationCount: result.evidenceReference.citationCount,
        createdAt: input.now(),
        ...ownerScope,
      },
    };
  }

  const paperAssembly = result.paperAssembly;

  if (
    result.evidenceReference.evidenceStatus !== "sufficient" ||
    result.evidenceReference.citationCount <= 0 ||
    paperAssembly === null ||
    paperAssembly.status !== "assembled" ||
    paperAssembly.insufficiency !== null ||
    paperAssembly.container.selectedQuestionCount <= 0
  ) {
    return null;
  }

  // A created session is its own immutable learning snapshot. Reuse it before
  // resolving current question sources so later source changes cannot break resume.
  const existingSession =
    await input.learningSessionRepository.findSessionByPublicId(
      sessionPublicId,
    );

  const sourceQuestions =
    existingSession !== null || input.paperSourceQuestionResolver === undefined
      ? []
      : await input.paperSourceQuestionResolver({
          userContext: input.userContext,
          ownerScope,
          sourceResultPublicId: result.resultPublicId,
          sourceTaskPublicId: result.taskPublicId,
          paperAssemblyContainer: paperAssembly.container,
        });

  return {
    kind: "paper_assembly",
    input: {
      sessionPublicId,
      sourceResultPublicId: result.resultPublicId,
      sourceTaskPublicId: result.taskPublicId,
      evidenceStatus: result.evidenceReference.evidenceStatus,
      citationCount: result.evidenceReference.citationCount,
      paperAssemblyContainer: paperAssembly.container,
      sourceQuestions,
      createdAt: input.now(),
      ...ownerScope,
    },
  };
}

async function createLearningSessionInput(input: {
  request: Request;
  userContext: PersonalAiGenerationResultUserContext;
  learningSessionRepository: PersonalAiGenerationLearningSessionRepository;
  paperSourceQuestionResolver:
    | PersonalAiGenerationLearningPaperSourceQuestionResolver
    | undefined;
  resultRepository:
    | PersonalAiGenerationResultSelectedAuthorizationLookupRepository
    | undefined;
  authorizationRepository:
    | PersonalAiGenerationAuthorizationOwnershipRepository
    | undefined;
  effectiveAuthorizationService:
    | Pick<EffectiveAuthorizationService, "listEffectiveAuthorizations">
    | undefined;
  now: () => Date;
}): Promise<LearningSessionCreationRouteInput | null> {
  const body = await readJsonObject(input.request);

  if (body === null) {
    return null;
  }

  const sourceResultPublicId = readRequiredString(body, "sourceResultPublicId");
  const authorizationPublicId = readRequiredString(
    body,
    "authorizationPublicId",
  );

  if (
    sourceResultPublicId === null ||
    authorizationPublicId === null ||
    Object.keys(body).length !== 2 ||
    !Object.hasOwn(body, "sourceResultPublicId") ||
    !Object.hasOwn(body, "authorizationPublicId")
  ) {
    return null;
  }

  if (
    input.resultRepository === undefined ||
    input.authorizationRepository === undefined ||
    input.effectiveAuthorizationService === undefined
  ) {
    return { kind: "authorization_unavailable" };
  }

  return createPersistedLearningSessionInput({
    authorizationPublicId,
    authorizationRepository: input.authorizationRepository,
    body,
    effectiveAuthorizationService: input.effectiveAuthorizationService,
    userContext: input.userContext,
    resultPublicId: sourceResultPublicId,
    learningSessionRepository: input.learningSessionRepository,
    resultRepository: input.resultRepository,
    paperSourceQuestionResolver: input.paperSourceQuestionResolver,
    now: input.now,
  });
}

function readAuthorizationPublicId(request: Request): string | null {
  const value = new URL(request.url).searchParams.get("authorizationPublicId");

  if (value === null) {
    return null;
  }

  const normalizedValue = value.trim();

  return normalizedValue.length === 0 ? null : normalizedValue;
}

function createAuthorizationUnavailableResponse(): ApiResponse<null> {
  return createErrorResponse(
    403057,
    "Personal AI generation is not available for this authorization.",
  );
}

async function resolveLearningSessionAuthorization(input: {
  authorizationPublicId: string;
  sessionPublicId: string;
  userContext: PersonalAiGenerationResultUserContext;
  repository: PersonalAiGenerationLearningSessionRepository;
  resultRepository: PersonalAiGenerationResultSelectedAuthorizationLookupRepository;
  authorizationRepository: PersonalAiGenerationAuthorizationOwnershipRepository;
  effectiveAuthorizationService: Pick<
    EffectiveAuthorizationService,
    "listEffectiveAuthorizations"
  >;
}): Promise<boolean> {
  const session = await input.repository.findSessionByPublicId(
    input.sessionPublicId,
  );

  if (
    session === null ||
    session.sourceResultPublicId === null ||
    session.actorPublicId !== input.userContext.userPublicId ||
    (session.ownerType === "personal" &&
      session.ownerPublicId !== input.userContext.userPublicId) ||
    (session.ownerType === "organization" &&
      session.ownerPublicId !== input.userContext.organizationPublicId)
  ) {
    return false;
  }

  const result = await input.resultRepository.findDraftResultByPublicId({
    authorizationPublicId: input.authorizationPublicId,
    ownerType: session.ownerType,
    ownerPublicId: session.ownerPublicId,
    actorPublicId: input.userContext.userPublicId,
    resultPublicId: session.sourceResultPublicId,
  });

  if (result === null) {
    return false;
  }

  const authorizationContext =
    await resolveEffectivePersonalAiGenerationAuthorizationContext({
      authorizationPublicId: input.authorizationPublicId,
      requestedScope: null,
      taskType: result.taskType,
      userContext: input.userContext,
      authorizationRepository: input.authorizationRepository,
      effectiveAuthorizationService: input.effectiveAuthorizationService,
    });

  return (
    authorizationContext !== null &&
    authorizationContext.ownerType === session.ownerType &&
    authorizationContext.ownerPublicId === session.ownerPublicId
  );
}

async function createAnswerInput(input: {
  request: Request;
  context: LearningSessionRouteContext;
  userContext: PersonalAiGenerationResultUserContext;
  now: () => Date;
}): Promise<PersonalAiGenerationLearningSessionAnswerInputDto | null> {
  const body = await readJsonObject(input.request);

  if (body === null) {
    return null;
  }

  const { publicId } = await input.context.params;
  const sessionQuestionPublicId = readRequiredString(
    body,
    "sessionQuestionPublicId",
  );
  const selectedOptionLabels = readSelectedOptionLabels(body);

  if (sessionQuestionPublicId === null || selectedOptionLabels === null) {
    return null;
  }

  return {
    sessionPublicId: publicId,
    sessionQuestionPublicId,
    actorPublicId: input.userContext.userPublicId,
    selectedOptionLabels,
    textAnswer: readNullableString(body, "textAnswer"),
    submittedAt: input.now(),
  };
}

export function createPersonalAiGenerationLearningSessionRouteHandlers(
  resolveUserContext: PersonalAiGenerationResultUserResolver,
  dependencies: PersonalAiGenerationLearningSessionRouteDependencies = {},
) {
  const repository = dependencies.repository ?? emptyLearningSessionRepository;
  const now = dependencies.now ?? (() => new Date());
  const learningSessionService =
    createPersonalAiGenerationLearningSessionService({
      repository,
    });

  return createRouteHandlersWithErrorEnvelope({
    collection: {
      POST: createRouteHandlerWithErrorEnvelope(
        async (request: Request): Promise<Response> => {
          const userContext = await resolveRequiredUserContext(
            request,
            resolveUserContext,
          );

          if (!isPersonalAiGenerationResultUserContext(userContext)) {
            return createJsonResponse(userContext);
          }

          const creationInput = await createLearningSessionInput({
            request,
            userContext,
            learningSessionRepository: repository,
            paperSourceQuestionResolver:
              dependencies.paperSourceQuestionResolver,
            resultRepository: dependencies.resultRepository,
            authorizationRepository: dependencies.authorizationRepository,
            effectiveAuthorizationService:
              dependencies.effectiveAuthorizationService,
            now,
          });

          if (creationInput === null) {
            return createJsonResponse(
              createErrorResponse(
                400056,
                "Invalid personal AI learning session input.",
              ),
            );
          }

          if (creationInput.kind === "authorization_unavailable") {
            return createJsonResponse(createAuthorizationUnavailableResponse());
          }

          const creationResult =
            creationInput.kind === "paper_assembly"
              ? await learningSessionService.createLearningSessionFromPaperAssembly(
                  creationInput.input,
                )
              : await learningSessionService.createLearningSession(
                  creationInput.input,
                );

          return createJsonResponse(
            createSuccessResponse(
              projectLearningSessionCreationForApi(creationResult),
            ),
          );
        },
      ),
    },
    progress: {
      GET: createRouteHandlerWithErrorEnvelope(
        async (
          request: Request,
          context: LearningSessionRouteContext,
        ): Promise<Response> => {
          const userContext = await resolveRequiredUserContext(
            request,
            resolveUserContext,
          );

          if (!isPersonalAiGenerationResultUserContext(userContext)) {
            return createJsonResponse(userContext);
          }

          const { publicId } = await context.params;
          const authorizationPublicId = readAuthorizationPublicId(request);

          if (
            authorizationPublicId === null ||
            dependencies.resultRepository === undefined ||
            dependencies.authorizationRepository === undefined ||
            dependencies.effectiveAuthorizationService === undefined ||
            !(await resolveLearningSessionAuthorization({
              authorizationPublicId,
              sessionPublicId: publicId,
              userContext,
              repository,
              resultRepository: dependencies.resultRepository,
              authorizationRepository: dependencies.authorizationRepository,
              effectiveAuthorizationService:
                dependencies.effectiveAuthorizationService,
            }))
          ) {
            return createJsonResponse(createAuthorizationUnavailableResponse());
          }

          return createJsonResponse(
            createSuccessResponse(
              await learningSessionService.getLearningSessionProgress({
                sessionPublicId: publicId,
                actorPublicId: userContext.userPublicId,
                viewedAt: now(),
              }),
            ),
          );
        },
      ),
    },
    answers: {
      POST: createRouteHandlerWithErrorEnvelope(
        async (
          request: Request,
          context: LearningSessionRouteContext,
        ): Promise<Response> => {
          const userContext = await resolveRequiredUserContext(
            request,
            resolveUserContext,
          );

          if (!isPersonalAiGenerationResultUserContext(userContext)) {
            return createJsonResponse(userContext);
          }

          const answerInput = await createAnswerInput({
            request,
            context,
            userContext,
            now,
          });

          if (answerInput === null) {
            return createJsonResponse(
              createErrorResponse(
                400057,
                "Invalid personal AI learning answer input.",
              ),
            );
          }

          const authorizationPublicId = readAuthorizationPublicId(request);

          if (
            authorizationPublicId === null ||
            dependencies.resultRepository === undefined ||
            dependencies.authorizationRepository === undefined ||
            dependencies.effectiveAuthorizationService === undefined ||
            !(await resolveLearningSessionAuthorization({
              authorizationPublicId,
              sessionPublicId: answerInput.sessionPublicId,
              userContext,
              repository,
              resultRepository: dependencies.resultRepository,
              authorizationRepository: dependencies.authorizationRepository,
              effectiveAuthorizationService:
                dependencies.effectiveAuthorizationService,
            }))
          ) {
            return createJsonResponse(createAuthorizationUnavailableResponse());
          }

          return createJsonResponse(
            createSuccessResponse(
              await learningSessionService.submitLearningSessionAnswer(
                answerInput,
              ),
            ),
          );
        },
      ),
    },
  });
}

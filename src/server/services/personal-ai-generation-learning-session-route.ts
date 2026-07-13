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
  PersonalAiGenerationLearningSessionRepository,
} from "../contracts/personal-ai-generation-learning-session-contract";
import type { AiPaperPlanAndSelectContainerDto } from "../contracts/ai-paper-plan-and-select-contract";
import type { AiGenerationRouteIntegratedVisibleGeneratedContent } from "../contracts/route-integrated-provider-execution-contract";
import type { PersonalAiGenerationResultDto } from "../contracts/personal-ai-generation-result-persistence-contract";
import type { PersonalAiGenerationResultLookupRepository } from "../repositories/personal-ai-generation-result-repository";
import type {
  PersonalAiGenerationResultUserContext,
  PersonalAiGenerationResultUserResolver,
} from "./personal-ai-generation-result-route";
import { createPersonalAiGenerationLearningSessionService } from "./personal-ai-generation-learning-session-service";
import {
  createRouteHandlerWithErrorEnvelope,
  createRouteHandlersWithErrorEnvelope,
} from "./route-error-response";

export type PersonalAiGenerationLearningSessionRouteDependencies = {
  repository?: PersonalAiGenerationLearningSessionRepository;
  resultRepository?: PersonalAiGenerationResultLookupRepository;
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
  return Response.json(response);
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

function resolveLearningSessionOwnerScope(
  userContext: PersonalAiGenerationResultUserContext,
  body: Record<string, unknown>,
): Pick<
  PersonalAiGenerationLearningSessionCreationInputDto,
  "ownerType" | "ownerPublicId" | "actorPublicId"
> | null {
  const ownerType = readNullableString(body, "ownerType");
  const ownerPublicId = readNullableString(body, "ownerPublicId");

  if (ownerType !== null || ownerPublicId !== null) {
    if (
      ownerType === "personal" &&
      ownerPublicId === userContext.userPublicId
    ) {
      return {
        ownerType: "personal",
        ownerPublicId,
        actorPublicId: userContext.userPublicId,
      };
    }

    if (
      ownerType === "organization" &&
      ownerPublicId === userContext.organizationPublicId &&
      userContext.organizationPublicId !== null
    ) {
      return {
        ownerType: "organization",
        ownerPublicId: userContext.organizationPublicId,
        actorPublicId: userContext.userPublicId,
      };
    }

    return null;
  }

  if (
    userContext.userType === "employee" &&
    userContext.organizationPublicId !== null
  ) {
    return {
      ownerType: "organization",
      ownerPublicId: userContext.organizationPublicId,
      actorPublicId: userContext.userPublicId,
    };
  }

  return {
    ownerType: "personal",
    ownerPublicId: userContext.userPublicId,
    actorPublicId: userContext.userPublicId,
  };
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

function readVisibleGeneratedContent(
  body: Record<string, unknown>,
): AiGenerationRouteIntegratedVisibleGeneratedContent | null {
  const value = body.visibleGeneratedContent;

  return isRecord(value)
    ? (value as AiGenerationRouteIntegratedVisibleGeneratedContent)
    : null;
}

function readPaperAssemblyContainer(
  body: Record<string, unknown>,
): AiPaperPlanAndSelectContainerDto | null {
  const value = body.paperAssemblyContainer;

  return isRecord(value) && Array.isArray(value.sections)
    ? (value as AiPaperPlanAndSelectContainerDto)
    : null;
}

type LearningSessionCreationRouteInput =
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
  userContext: PersonalAiGenerationResultUserContext;
  resultPublicId: string;
  resultRepository: PersonalAiGenerationResultLookupRepository;
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
      resultPublicId: input.resultPublicId,
    });

    if (result !== null) {
      return { result, ownerScope };
    }
  }

  return null;
}

async function createPersistedLearningSessionInput(input: {
  body: Record<string, unknown>;
  userContext: PersonalAiGenerationResultUserContext;
  resultPublicId: string;
  learningSessionRepository: PersonalAiGenerationLearningSessionRepository;
  resultRepository: PersonalAiGenerationResultLookupRepository;
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
  const sessionPublicId = createLearningSessionPublicId(result.resultPublicId);

  if (result.taskType === "ai_question_generation") {
    const visibleGeneratedContent = readVisibleGeneratedContent(input.body);

    if (visibleGeneratedContent === null) {
      return null;
    }

    return {
      kind: "generated_questions",
      input: {
        sessionPublicId,
        sourceResultPublicId: result.resultPublicId,
        sourceTaskPublicId: result.taskPublicId,
        visibleGeneratedContent,
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
  resultRepository: PersonalAiGenerationResultLookupRepository | undefined;
  now: () => Date;
}): Promise<LearningSessionCreationRouteInput | null> {
  const body = await readJsonObject(input.request);

  if (body === null) {
    return null;
  }

  const sourceResultPublicId = readRequiredString(body, "sourceResultPublicId");

  if (sourceResultPublicId === null) {
    return null;
  }

  if (input.resultRepository !== undefined) {
    return createPersistedLearningSessionInput({
      body,
      userContext: input.userContext,
      resultPublicId: sourceResultPublicId,
      learningSessionRepository: input.learningSessionRepository,
      resultRepository: input.resultRepository,
      paperSourceQuestionResolver: input.paperSourceQuestionResolver,
      now: input.now,
    });
  }

  const sessionPublicId = readRequiredString(body, "sessionPublicId");
  const sourceTaskPublicId = readRequiredString(body, "sourceTaskPublicId");
  const visibleGeneratedContent = readVisibleGeneratedContent(body);
  const paperAssemblyContainer = readPaperAssemblyContainer(body);
  const ownerScope = resolveLearningSessionOwnerScope(input.userContext, body);

  if (
    sessionPublicId === null ||
    sourceResultPublicId === null ||
    sourceTaskPublicId === null ||
    visibleGeneratedContent === null ||
    ownerScope === null
  ) {
    return null;
  }

  if (paperAssemblyContainer !== null) {
    const sourceQuestions =
      input.paperSourceQuestionResolver === undefined
        ? []
        : await input.paperSourceQuestionResolver({
            userContext: input.userContext,
            ownerScope,
            sourceResultPublicId,
            sourceTaskPublicId,
            paperAssemblyContainer,
          });
    const groundingSummary = visibleGeneratedContent.groundingSummary;

    return {
      kind: "paper_assembly",
      input: {
        sessionPublicId,
        sourceResultPublicId,
        sourceTaskPublicId,
        evidenceStatus: groundingSummary?.evidenceStatus ?? "none",
        citationCount: groundingSummary?.citationCount ?? 0,
        paperAssemblyContainer,
        sourceQuestions,
        createdAt: input.now(),
        ...ownerScope,
      },
    };
  }

  return {
    kind: "generated_questions",
    input: {
      sessionPublicId,
      sourceResultPublicId,
      sourceTaskPublicId,
      visibleGeneratedContent,
      createdAt: input.now(),
      ...ownerScope,
    },
  };
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

          return createJsonResponse(
            createSuccessResponse(
              creationInput.kind === "paper_assembly"
                ? await learningSessionService.createLearningSessionFromPaperAssembly(
                    creationInput.input,
                  )
                : await learningSessionService.createLearningSession(
                    creationInput.input,
                  ),
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

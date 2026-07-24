import { createLocalSessionRuntime } from "../auth/local-session-runtime";
import { getRequestAuthorization } from "../auth/session-cookie";
import type { ApiResponse } from "../contracts/api-response";
import type {
  RagCitationDto,
  RagRetrievalResultDto,
} from "../contracts/ai-rag-contract";
import type { AiExplanationDto } from "../contracts/mistake-book-contract";
import type { Profession } from "../models/auth";
import {
  createPostgresMistakeBookRepository,
  type MistakeBookRepository,
  type MistakeBookRuntimeRepositoryOptions,
} from "../repositories/mistake-book-repository";
import {
  createPostgresAdminAiAuditLogRuntimeRepositories,
  type AdminAiAuditLogRuntimeRepositories,
} from "../repositories/admin-ai-audit-log-runtime-repository";
import {
  createAiExplanationHintService,
  type AiExplanationRunner,
} from "./ai-explanation-hint-service";
import {
  createMistakeBookRouteHandlers,
  type MistakeBookUserResolver,
} from "./mistake-book-route";
import {
  createMistakeBookService,
  type MistakeBookAiExplanationRuntime,
  type MistakeBookAiExplanationRuntimeContext,
} from "./mistake-book-service";
import {
  createModelConfigRuntimeResolver,
  type ModelConfigRuntimeCatalog,
} from "./model-config-runtime";
import {
  buildLocalResourceRagRetrievalResult,
  buildResourceRagRetrievalResult,
} from "./rag-resource-knowledge-runtime";
import type { SessionService } from "./session-service";
import { mapLearnerCitations } from "../mappers/learner-citation-mapper";

export type StudentMistakeBookRuntimeOptions =
  MistakeBookRuntimeRepositoryOptions & {
    mistakeBookRepository?: MistakeBookRepository;
    sessionService?: Pick<SessionService, "getCurrentSession">;
    aiCallLogRepository?: Pick<
      AdminAiAuditLogRuntimeRepositories,
      "appendAiCallLog"
    >;
    modelConfigRuntimeCatalog?: ModelConfigRuntimeCatalog;
    localResourceStorageRoot?: string;
    ragRetrievalRuntime?: MistakeBookRagRetrievalRuntime;
    aiExplanationRuntime?: MistakeBookAiExplanationRuntime;
    explanationRunner?: AiExplanationRunner;
  };

type MistakeBookRagRetrievalRuntime = {
  retrieveForAiExplanation(
    context: MistakeBookAiExplanationRuntimeContext,
  ): Promise<RagRetrievalResultDto>;
};

type InternalMistakeBookAiExplanationRuntime = {
  generateObjectiveExplanation(
    context: MistakeBookAiExplanationRuntimeContext,
  ): Promise<
    Omit<AiExplanationDto, "citations"> & { citations: RagCitationDto[] }
  >;
};

function isSuccessfulSessionResponse(
  response: Awaited<ReturnType<SessionService["getCurrentSession"]>>,
): response is ApiResponse<NonNullable<typeof response.data>> & {
  data: NonNullable<typeof response.data>;
} {
  return response.code === 0 && response.data !== null;
}

export function createStudentMistakeBookUserResolver(
  sessionService: Pick<SessionService, "getCurrentSession">,
): MistakeBookUserResolver {
  return async (request) => {
    const sessionResponse = await sessionService.getCurrentSession({
      authorization: getRequestAuthorization(request),
    });

    if (!isSuccessfulSessionResponse(sessionResponse)) {
      return null;
    }

    if (sessionResponse.data.user.userType === null) {
      return null;
    }

    return {
      userPublicId: sessionResponse.data.user.publicId,
      organizationPublicId:
        sessionResponse.data.user.organizationPublicId ?? null,
    };
  };
}

function createEmptyRagRetrievalResult(): RagRetrievalResultDto {
  return {
    evidenceStatus: "none",
    citations: [],
    evidenceSummary: {
      evidenceStatus: "none",
      citationCount: 0,
      resourcePublicIds: [],
      chunkPublicIds: [],
      generationPublicIds: [],
      chunkIndexes: [],
      textHashes: [],
      queryHash:
        "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      maxScore: null,
      retrievalMode: "fusion_sort",
    },
  };
}

function readSnapshotProfession(
  questionSnapshot: Record<string, unknown>,
): Profession | null {
  const profession = questionSnapshot.profession;

  return profession === "monopoly" ||
    profession === "marketing" ||
    profession === "logistics"
    ? profession
    : null;
}

function readSnapshotLevel(
  questionSnapshot: Record<string, unknown>,
): number | null {
  const level = questionSnapshot.level;

  if (typeof level === "number" && Number.isInteger(level) && level > 0) {
    return level;
  }

  if (typeof level === "string" && level.trim().length > 0) {
    const parsedLevel = Number(level);

    return Number.isInteger(parsedLevel) && parsedLevel > 0
      ? parsedLevel
      : null;
  }

  return null;
}

function createAiExplanationRetrievalQuery(
  context: MistakeBookAiExplanationRuntimeContext,
): string {
  return [
    typeof context.questionSnapshot.stemRichText === "string"
      ? context.questionSnapshot.stemRichText
      : "",
    context.standardAnswer,
    context.analysis ?? "",
    context.learnerAnswer,
  ]
    .join(" ")
    .trim();
}

function createDefaultMistakeBookRagRetrievalRuntime(
  storageRoot?: string,
): MistakeBookRagRetrievalRuntime {
  return {
    async retrieveForAiExplanation(context) {
      const profession = readSnapshotProfession(context.questionSnapshot);

      if (profession === null) {
        return createEmptyRagRetrievalResult();
      }

      const retrievalInput = {
        query: createAiExplanationRetrievalQuery(context),
        profession,
        level: readSnapshotLevel(context.questionSnapshot),
      };

      return storageRoot === undefined
        ? buildResourceRagRetrievalResult(retrievalInput)
        : buildLocalResourceRagRetrievalResult({
            ...retrievalInput,
            storageRoot,
          });
    },
  };
}

export function createGovernedMistakeBookAiExplanationRuntime(input: {
  aiCallLogRepository?: Pick<
    AdminAiAuditLogRuntimeRepositories,
    "appendAiCallLog"
  >;
  modelConfigRuntimeCatalog: ModelConfigRuntimeCatalog;
  explanationRunner: AiExplanationRunner;
  ragRetrievalRuntime?: MistakeBookRagRetrievalRuntime;
  localResourceStorageRoot?: string;
}): InternalMistakeBookAiExplanationRuntime {
  const aiCallLogRepository =
    input.aiCallLogRepository ??
    createPostgresAdminAiAuditLogRuntimeRepositories();
  const modelConfigAttemptPlan = createModelConfigRuntimeResolver(
    input.modelConfigRuntimeCatalog,
  ).resolveAttemptPlan({
    aiFuncType: "explanation",
    allowFallback: true,
  });

  if (
    modelConfigAttemptPlan.status !== "planned" ||
    modelConfigAttemptPlan.attempts.some(
      (attempt) => attempt.executionMode !== "governed_provider",
    )
  ) {
    throw new Error("Governed ai_explanation model_config is unavailable.");
  }

  const [primaryAttempt, fallbackAttempt] = modelConfigAttemptPlan.attempts;
  const ragRetrievalRuntime =
    input.ragRetrievalRuntime ??
    createDefaultMistakeBookRagRetrievalRuntime(input.localResourceStorageRoot);

  return {
    async generateObjectiveExplanation(
      context: MistakeBookAiExplanationRuntimeContext,
    ) {
      const explanationHintService = createAiExplanationHintService({
        explanationRunner: input.explanationRunner,
        async hintRunner() {
          throw new Error("Mistake book hint execution is not configured.");
        },
        async onAttemptComplete(aiCallLogDraft) {
          await aiCallLogRepository.appendAiCallLog({
            userPublicId: context.userPublicId,
            organizationPublicId: context.organizationPublicId ?? null,
            profession: readSnapshotProfession(context.questionSnapshot),
            level: readSnapshotLevel(context.questionSnapshot),
            answerRecordPublicId: null,
            mockExamPublicId: null,
            questionPublicId: context.questionPublicId,
            aiFuncType: "ai_explanation",
            callStatus: aiCallLogDraft.callStatus,
            modelConfigSnapshot: aiCallLogDraft.modelConfigSnapshot,
            promptTemplateKey: aiCallLogDraft.promptTemplateKey,
            promptTemplateVersion: aiCallLogDraft.promptTemplateVersion,
            requestRedactedSnapshot: aiCallLogDraft.requestRedactedSnapshot,
            responseRedactedSnapshot: aiCallLogDraft.responseRedactedSnapshot,
            errorRedactedSnapshot: aiCallLogDraft.errorRedactedSnapshot,
            citationRedactedSnapshot: aiCallLogDraft.citationRedactedSnapshot,
            promptTokenCount: aiCallLogDraft.promptTokenCount,
            completionTokenCount: aiCallLogDraft.completionTokenCount,
            totalTokenCount: aiCallLogDraft.totalTokenCount,
            latencyMs: aiCallLogDraft.observation.latencyMs,
            observation: aiCallLogDraft.observation,
            startedAt: aiCallLogDraft.startedAt,
            completedAt: aiCallLogDraft.completedAt,
          });
        },
      });
      const result = await explanationHintService.generateObjectiveExplanation({
        userPublicId: context.userPublicId,
        practicePublicId: null,
        answerRecordPublicId: context.mistakeBookPublicId,
        questionPublicId: context.questionPublicId,
        questionText:
          typeof context.questionSnapshot.stemRichText === "string"
            ? context.questionSnapshot.stemRichText
            : "",
        standardAnswer: context.standardAnswer,
        analysis: context.analysis,
        learnerAnswer: context.learnerAnswer,
        isCorrect: false,
        triggerReason: "manual_request",
        modelConfigSnapshot: primaryAttempt.modelConfigSnapshot,
        promptTemplate: primaryAttempt.promptTemplate,
        fallbackAttempt:
          fallbackAttempt === undefined
            ? undefined
            : {
                modelConfigSnapshot: fallbackAttempt.modelConfigSnapshot,
                promptTemplate: fallbackAttempt.promptTemplate,
              },
        ragRetrievalResult:
          await ragRetrievalRuntime.retrieveForAiExplanation(context),
      });

      return {
        explanationStatus: result.explanationStatus,
        explanationText: result.explanationText,
        keyPoints: result.keyPoints,
        learningSuggestion: result.learningSuggestion,
        insufficientEvidenceMessage: result.insufficientEvidenceMessage,
        evidenceStatus: result.evidenceStatus,
        citations: result.citations,
        promptTemplateKey: result.promptTemplateKey,
        promptTemplateVersion: result.promptTemplateVersion,
      };
    },
  };
}

export function createStudentMistakeBookRuntimeRouteHandlers(
  options: StudentMistakeBookRuntimeOptions = {},
) {
  const repository =
    options.mistakeBookRepository ??
    createPostgresMistakeBookRepository(options);
  const sessionService = options.sessionService ?? createLocalSessionRuntime();
  const clock = options.now === undefined ? undefined : { now: options.now };
  const aiExplanationRuntime =
    options.aiExplanationRuntime ??
    (options.explanationRunner !== undefined &&
    options.modelConfigRuntimeCatalog !== undefined
      ? createGovernedMistakeBookAiExplanationRuntime({
          aiCallLogRepository: options.aiCallLogRepository,
          modelConfigRuntimeCatalog: options.modelConfigRuntimeCatalog,
          explanationRunner: options.explanationRunner,
          ragRetrievalRuntime: options.ragRetrievalRuntime,
          localResourceStorageRoot: options.localResourceStorageRoot,
        })
      : undefined);
  const learnerAiExplanationRuntime =
    aiExplanationRuntime === undefined
      ? undefined
      : {
          async generateObjectiveExplanation(
            context: MistakeBookAiExplanationRuntimeContext,
          ) {
            const result =
              await aiExplanationRuntime.generateObjectiveExplanation(context);

            return {
              explanationStatus: result.explanationStatus,
              explanationText: result.explanationText,
              keyPoints: result.keyPoints,
              learningSuggestion: result.learningSuggestion,
              insufficientEvidenceMessage: result.insufficientEvidenceMessage,
              evidenceStatus: result.evidenceStatus,
              citations: mapLearnerCitations({
                evidenceStatus: result.evidenceStatus,
                citations: result.citations,
              }),
              promptTemplateKey: result.promptTemplateKey,
              promptTemplateVersion: result.promptTemplateVersion,
            };
          },
        };

  return createMistakeBookRouteHandlers(
    createMistakeBookService(repository, clock, {
      aiExplanationRuntime: learnerAiExplanationRuntime,
    }),
    createStudentMistakeBookUserResolver(sessionService),
  );
}

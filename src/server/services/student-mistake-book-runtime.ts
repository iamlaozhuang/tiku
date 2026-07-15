import { createLocalSessionRuntime } from "../auth/local-session-runtime";
import { getRequestAuthorization } from "../auth/session-cookie";
import type { ApiResponse } from "../contracts/api-response";
import type { RagRetrievalResultDto } from "../contracts/ai-rag-contract";
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

function estimateTokenCount(value: string): number {
  return Math.max(1, Math.ceil(value.length / 4));
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
}): MistakeBookAiExplanationRuntime {
  const aiCallLogRepository =
    input.aiCallLogRepository ??
    createPostgresAdminAiAuditLogRuntimeRepositories();
  const modelConfigSelection = createModelConfigRuntimeResolver(
    input.modelConfigRuntimeCatalog,
  ).resolve({
    aiFuncType: "explanation",
    allowFallback: true,
  });

  if (
    modelConfigSelection.status !== "selected" ||
    modelConfigSelection.executionMode !== "governed_provider"
  ) {
    throw new Error("Governed ai_explanation model_config is unavailable.");
  }

  const modelConfigSnapshot = modelConfigSelection.modelConfigSnapshot;
  const promptTemplate = modelConfigSelection.promptTemplate;
  const ragRetrievalRuntime =
    input.ragRetrievalRuntime ??
    createDefaultMistakeBookRagRetrievalRuntime(input.localResourceStorageRoot);
  const explanationHintService = createAiExplanationHintService({
    explanationRunner: input.explanationRunner,
    async hintRunner() {
      throw new Error("Mistake book hint execution is not configured.");
    },
  });

  return {
    async generateObjectiveExplanation(
      context: MistakeBookAiExplanationRuntimeContext,
    ) {
      const startedAt = new Date();
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
        modelConfigSnapshot,
        promptTemplate,
        ragRetrievalResult:
          await ragRetrievalRuntime.retrieveForAiExplanation(context),
      });
      const completedAt = new Date();

      if (result.aiCallLogDraft !== null) {
        await aiCallLogRepository.appendAiCallLog({
          userPublicId: context.userPublicId,
          answerRecordPublicId: null,
          mockExamPublicId: null,
          questionPublicId: context.questionPublicId,
          aiFuncType: "ai_explanation",
          callStatus: result.aiCallLogDraft.callStatus,
          modelConfigSnapshot: result.aiCallLogDraft.modelConfigSnapshot,
          promptTemplateKey: result.aiCallLogDraft.promptTemplateKey,
          promptTemplateVersion: result.aiCallLogDraft.promptTemplateVersion,
          requestRedactedSnapshot:
            result.aiCallLogDraft.requestRedactedSnapshot,
          responseRedactedSnapshot:
            result.aiCallLogDraft.responseRedactedSnapshot,
          errorRedactedSnapshot: result.aiCallLogDraft.errorRedactedSnapshot,
          citationRedactedSnapshot:
            result.aiCallLogDraft.citationRedactedSnapshot,
          promptTokenCount: estimateTokenCount(context.learnerAnswer),
          completionTokenCount: estimateTokenCount(result.explanationText),
          totalTokenCount:
            estimateTokenCount(context.learnerAnswer) +
            estimateTokenCount(result.explanationText),
          latencyMs: Math.max(1, completedAt.getTime() - startedAt.getTime()),
          startedAt,
          completedAt,
        });
      }

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

  return createMistakeBookRouteHandlers(
    createMistakeBookService(repository, clock, {
      aiExplanationRuntime,
    }),
    createStudentMistakeBookUserResolver(sessionService),
  );
}

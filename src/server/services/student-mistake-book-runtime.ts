import { createLocalSessionRuntime } from "../auth/local-session-runtime";
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
import { createAiExplanationHintService } from "./ai-explanation-hint-service";
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
  createLocalModelConfigRuntimeCatalog,
  createModelConfigRuntimeResolver,
  type ModelConfigRuntimeCatalog,
} from "./model-config-runtime";
import { defaultLocalUploadStorageRoot } from "./local-paper-asset-storage";
import { buildLocalResourceRagRetrievalResult } from "./rag-resource-knowledge-runtime";
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
      authorization: request.headers.get("authorization"),
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
      chunkIndexes: [],
      textHashes: [],
      queryHash: "local-deterministic-query",
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
  storageRoot: string,
): MistakeBookRagRetrievalRuntime {
  return {
    async retrieveForAiExplanation(context) {
      const profession = readSnapshotProfession(context.questionSnapshot);

      if (profession === null) {
        return createEmptyRagRetrievalResult();
      }

      return buildLocalResourceRagRetrievalResult({
        storageRoot,
        query: createAiExplanationRetrievalQuery(context),
        profession,
        level: readSnapshotLevel(context.questionSnapshot),
      });
    },
  };
}

function estimateTokenCount(value: string): number {
  return Math.max(1, Math.ceil(value.length / 4));
}

function createDefaultAiExplanationRuntime(input: {
  aiCallLogRepository?: Pick<
    AdminAiAuditLogRuntimeRepositories,
    "appendAiCallLog"
  >;
  modelConfigRuntimeCatalog?: ModelConfigRuntimeCatalog;
  ragRetrievalRuntime?: MistakeBookRagRetrievalRuntime;
  localResourceStorageRoot?: string;
}): MistakeBookAiExplanationRuntime {
  const aiCallLogRepository =
    input.aiCallLogRepository ??
    createPostgresAdminAiAuditLogRuntimeRepositories();
  const modelConfigSelection = createModelConfigRuntimeResolver(
    input.modelConfigRuntimeCatalog ?? createLocalModelConfigRuntimeCatalog(),
  ).resolve({
    aiFuncType: "explanation",
    allowFallback: true,
  });

  if (modelConfigSelection.status !== "selected") {
    throw new Error(
      `Local ai_explanation model_config is unavailable: ${modelConfigSelection.reason}`,
    );
  }

  const modelConfigSnapshot = modelConfigSelection.modelConfigSnapshot;
  const promptTemplate = modelConfigSelection.promptTemplate;
  const ragRetrievalRuntime =
    input.ragRetrievalRuntime ??
    createDefaultMistakeBookRagRetrievalRuntime(
      input.localResourceStorageRoot ?? defaultLocalUploadStorageRoot,
    );
  const explanationHintService = createAiExplanationHintService({
    async explanationRunner(input) {
      return {
        explanationText:
          "本地确定性 AI 讲解：先核对题干关键词，再对照标准答案和老师解析定位错误原因。",
        keyPoints: [
          "题干关键词",
          input.isCorrect ? "正确项巩固" : "错误项排查",
        ],
        learningSuggestion: "复习本题对应知识点并完成一道同类题。",
        providerRequestPayload: {
          model: input.modelConfigSnapshot.modelName,
          promptTemplateKey: input.promptTemplate.promptTemplateKey,
          triggerReason: input.triggerReason,
        },
        providerResponsePayload: {
          requestId: "mock-ai-explanation-request-dev-001",
          output: "local deterministic explanation result",
        },
      };
    },
    async hintRunner(input) {
      return {
        hintText:
          "本地确定性 AI 提示：补充推理步骤和法规依据，不直接给出标准答案。",
        improvementDirections: input.scoringPointLabels,
        providerRequestPayload: {
          model: input.modelConfigSnapshot.modelName,
          promptTemplateKey: input.promptTemplate.promptTemplateKey,
        },
        providerResponsePayload: {
          requestId: "mock-ai-hint-request-dev-001",
          output: "local deterministic hint result",
        },
      };
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

  return createMistakeBookRouteHandlers(
    createMistakeBookService(repository, clock, {
      aiExplanationRuntime: createDefaultAiExplanationRuntime({
        aiCallLogRepository: options.aiCallLogRepository,
        modelConfigRuntimeCatalog: options.modelConfigRuntimeCatalog,
        ragRetrievalRuntime: options.ragRetrievalRuntime,
        localResourceStorageRoot: options.localResourceStorageRoot,
      }),
    }),
    createStudentMistakeBookUserResolver(sessionService),
  );
}

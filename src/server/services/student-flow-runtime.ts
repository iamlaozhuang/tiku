import { createLocalSessionRuntime } from "../auth/local-session-runtime";
import { createMockAiProvider } from "@/ai/mock-provider";
import type { ApiResponse } from "../contracts/api-response";
import { createAdminAiAuditLogListQuery } from "../contracts/admin-ai-audit-log-ops-contract";
import type { EvidenceStatus } from "../models/ai-rag";
import type { Profession } from "../models/auth";
import type {
  RagCitationDto,
  RagRetrievalResultDto,
} from "../contracts/ai-rag-contract";
import type { StudentPaperRepository } from "../repositories/student-paper-repository";
import type { PracticeRepository } from "../repositories/practice-repository";
import type { MockExamRepository } from "../repositories/mock-exam-repository";
import type { ExamReportRepository } from "../repositories/exam-report-repository";
import {
  createPostgresAdminAiAuditLogRuntimeRepositories,
  type AdminAiAuditLogRuntimeRepositories,
} from "../repositories/admin-ai-audit-log-runtime-repository";
import {
  createPostgresStudentFlowRepositories,
  type StudentFlowRuntimeRepositoryOptions,
} from "../repositories/student-flow-runtime-repository";
import { createAiMockProviderRuntime } from "./ai-mock-provider-runtime";
import { createAiScoringService } from "./ai-scoring-service";
import {
  createExamReportRouteHandlers,
  type ExamReportUserResolver,
} from "./exam-report-route";
import {
  createExamReportService,
  type ExamReportLearningSuggestionOptions,
  type ExamReportPublicIdFactory,
} from "./exam-report-service";
import {
  createMockExamRouteHandlers,
  type MockExamUserResolver,
} from "./mock-exam-route";
import {
  createMockExamService,
  type MockExamAiScoringRuntime,
  type MockExamAiScoringRuntimeContext,
  type MockExamPublicIdFactory,
} from "./mock-exam-service";
import {
  createPracticeRouteHandlers,
  type PracticeUserResolver,
} from "./practice-route";
import {
  createPracticeService,
  type PracticePublicIdFactory,
} from "./practice-service";
import type { SessionService } from "./session-service";
import {
  createLocalModelConfigRuntimeCatalog,
  createModelConfigRuntimeResolver,
  createPersistedModelConfigRuntimeCatalog,
  type ModelConfigRuntimeCatalog,
} from "./model-config-runtime";
import { defaultLocalUploadStorageRoot } from "./local-paper-asset-storage";
import { buildLocalResourceRagRetrievalResult } from "./rag-resource-knowledge-runtime";
import {
  createStudentPaperRouteHandlers,
  type StudentPaperUserResolver,
} from "./student-paper-route";
import { createStudentPaperService } from "./student-paper-service";

type StudentFlowPublicIdPrefix =
  | Parameters<PracticePublicIdFactory["createPublicId"]>[0]
  | Parameters<MockExamPublicIdFactory["createPublicId"]>[0]
  | Parameters<ExamReportPublicIdFactory["createPublicId"]>[0];

export type StudentFlowRuntimeOptions = StudentFlowRuntimeRepositoryOptions & {
  sessionService?: Pick<SessionService, "getCurrentSession">;
  studentPaperRepository?: StudentPaperRepository;
  practiceRepository?: PracticeRepository;
  mockExamRepository?: MockExamRepository;
  examReportRepository?: ExamReportRepository;
  examReportLearningSuggestionOptions?: ExamReportLearningSuggestionOptions;
  modelConfigRuntimeCatalog?: ModelConfigRuntimeCatalog;
  localResourceStorageRoot?: string;
  ragRetrievalRuntime?: StudentFlowRagRetrievalRuntime;
  createPublicId?: (prefix: StudentFlowPublicIdPrefix) => string;
};

type StudentFlowRagRetrievalRuntime = {
  retrieveForAiScoring(
    context: MockExamAiScoringRuntimeContext,
  ): Promise<RagRetrievalResultDto>;
};

export type ModelConfigRuntimeCatalogLoader =
  () => Promise<ModelConfigRuntimeCatalog | null>;

type StudentFlowUserResolver = StudentPaperUserResolver &
  PracticeUserResolver &
  MockExamUserResolver &
  ExamReportUserResolver;

function createDefaultPublicId(prefix: StudentFlowPublicIdPrefix): string {
  return `${prefix}_${crypto.randomUUID()}`;
}

function createDefaultLearningSuggestionOptions(
  modelConfigRuntimeCatalog?: ModelConfigRuntimeCatalog,
): ExamReportLearningSuggestionOptions {
  const modelConfigSelection = createModelConfigRuntimeResolver(
    modelConfigRuntimeCatalog ?? createLocalModelConfigRuntimeCatalog(),
  ).resolve({
    aiFuncType: "learning_suggestion",
    allowFallback: true,
  });

  if (modelConfigSelection.status !== "selected") {
    throw new Error(
      `Local learning_suggestion model_config is unavailable: ${modelConfigSelection.reason}`,
    );
  }

  return {
    learningSuggestionRuntime: createAiMockProviderRuntime({
      provider: createMockAiProvider(),
      aiCallLogRepository: createPostgresAdminAiAuditLogRuntimeRepositories(),
    }),
    modelConfigSnapshot: modelConfigSelection.modelConfigSnapshot,
    promptTemplate: modelConfigSelection.promptTemplate,
  };
}

export async function loadPersistedModelConfigRuntimeCatalog(
  repositories: Pick<
    AdminAiAuditLogRuntimeRepositories,
    "listModelConfigs" | "listPromptTemplates"
  > = createPostgresAdminAiAuditLogRuntimeRepositories(),
): Promise<ModelConfigRuntimeCatalog | null> {
  try {
    const query = createAdminAiAuditLogListQuery({
      page: 1,
      pageSize: 100,
      sortBy: "updatedAt",
      sortOrder: "desc",
    });
    const [modelConfigPage, promptTemplatePage] = await Promise.all([
      repositories.listModelConfigs(query),
      repositories.listPromptTemplates?.(query) ??
        Promise.resolve({
          promptTemplates: [],
          pagination: {
            page: 1,
            pageSize: 100,
            sortBy: "updatedAt" as const,
            sortOrder: "desc" as const,
            total: 0,
          },
        }),
    ]);
    const catalog = createPersistedModelConfigRuntimeCatalog({
      modelConfigs: modelConfigPage.modelConfigs,
      promptTemplates: promptTemplatePage.promptTemplates,
    });

    return catalog.records.length === 0 ? null : catalog;
  } catch {
    return null;
  }
}

async function resolveModelConfigRuntimeCatalog(
  modelConfigRuntimeCatalog: ModelConfigRuntimeCatalog | undefined,
  modelConfigRuntimeCatalogLoader: ModelConfigRuntimeCatalogLoader,
): Promise<ModelConfigRuntimeCatalog> {
  if (modelConfigRuntimeCatalog !== undefined) {
    return modelConfigRuntimeCatalog;
  }

  return (
    (await modelConfigRuntimeCatalogLoader()) ??
    createLocalModelConfigRuntimeCatalog()
  );
}

function createEmptyRagRetrievalResult(
  evidenceStatus: EvidenceStatus = "none",
): RagRetrievalResultDto {
  return {
    evidenceStatus,
    citations: [],
    evidenceSummary: {
      evidenceStatus,
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

function createAiScoringRetrievalQuery(
  context: MockExamAiScoringRuntimeContext,
): string {
  return [
    context.questionText,
    context.standardAnswer,
    context.studentAnswer,
    ...context.scoringPoints.map((scoringPoint) => scoringPoint.label),
  ]
    .join(" ")
    .trim();
}

function createDefaultStudentFlowRagRetrievalRuntime(
  storageRoot: string,
): StudentFlowRagRetrievalRuntime {
  return {
    async retrieveForAiScoring(context) {
      const profession = readSnapshotProfession(context.questionSnapshot);

      if (profession === null) {
        return createEmptyRagRetrievalResult();
      }

      return buildLocalResourceRagRetrievalResult({
        storageRoot,
        query: createAiScoringRetrievalQuery(context),
        profession,
        level: readSnapshotLevel(context.questionSnapshot),
      });
    },
  };
}

function estimateTokenCount(value: string): number {
  return Math.max(1, Math.ceil(value.length / 4));
}

export function createDefaultAiScoringRuntime(
  modelConfigRuntimeCatalog?: ModelConfigRuntimeCatalog,
  ragRetrievalRuntime: StudentFlowRagRetrievalRuntime = createDefaultStudentFlowRagRetrievalRuntime(
    defaultLocalUploadStorageRoot,
  ),
  modelConfigRuntimeCatalogLoader: ModelConfigRuntimeCatalogLoader = loadPersistedModelConfigRuntimeCatalog,
  aiCallLogRepository: Pick<
    AdminAiAuditLogRuntimeRepositories,
    "appendAiCallLog"
  > = createPostgresAdminAiAuditLogRuntimeRepositories(),
): MockExamAiScoringRuntime {
  const aiScoringService = createAiScoringService({
    async runner(input) {
      const scoringPointMaxScoreTotal = input.scoringPoints.reduce(
        (scoreTotal, scoringPoint) => scoreTotal + scoringPoint.maxScore,
        0,
      );
      const answerLengthRatio = Math.min(
        1,
        input.studentAnswer.trim().length / 40,
      );
      const earnedScore = Math.min(
        scoringPointMaxScoreTotal,
        Math.max(0.5, scoringPointMaxScoreTotal * answerLengthRatio),
      );

      return {
        scoringPoints: input.scoringPoints.map((scoringPoint, index) => ({
          scoringPointPublicId: scoringPoint.scoringPointPublicId,
          isHit: earnedScore > 0 && index === 0,
          score: index === 0 ? earnedScore : 0,
          reason: "Local deterministic scoring based on answer completeness.",
        })),
        overallComment: "本地确定性 AI 评分完成。",
        improvementSuggestion: "围绕评分点补充法规依据和步骤说明。",
        providerRequestPayload: {
          model: input.modelConfigSnapshot.modelName,
          promptTemplateKey: input.promptTemplate.promptTemplateKey,
          answerLength: input.studentAnswer.length,
        },
        providerResponsePayload: {
          requestId: "mock-ai-scoring-request-dev-001",
          output: "local deterministic scoring result",
        },
      };
    },
  });

  return {
    async scoreSubjectiveAnswer(context: MockExamAiScoringRuntimeContext) {
      const modelConfigSelection = createModelConfigRuntimeResolver(
        await resolveModelConfigRuntimeCatalog(
          modelConfigRuntimeCatalog,
          modelConfigRuntimeCatalogLoader,
        ),
      ).resolve({
        aiFuncType: "scoring",
        allowFallback: false,
      });

      if (modelConfigSelection.status !== "selected") {
        throw new Error(
          `Local ai_scoring model_config is unavailable: ${modelConfigSelection.reason}`,
        );
      }

      const modelConfigSnapshot = modelConfigSelection.modelConfigSnapshot;
      const promptTemplate = modelConfigSelection.promptTemplate;
      const startedAt = new Date();
      const result = await aiScoringService.scoreSubjectiveAnswer({
        userPublicId: context.userPublicId,
        mockExamPublicId: context.mockExamPublicId,
        answerRecordPublicId: context.answerRecordPublicId,
        questionPublicId: context.questionPublicId,
        questionText: context.questionText,
        standardAnswer: context.standardAnswer,
        studentAnswer: context.studentAnswer,
        maxScore: Number.parseFloat(context.maxScore),
        scoringPoints: context.scoringPoints,
        modelConfigSnapshot,
        promptTemplate,
        ragRetrievalResult:
          await ragRetrievalRuntime.retrieveForAiScoring(context),
        existingResult: null,
        retryCount: 0,
      });
      const completedAt = new Date();

      if (result.aiCallLogDraft !== null) {
        await aiCallLogRepository.appendAiCallLog({
          userPublicId: context.userPublicId,
          answerRecordPublicId: context.answerRecordPublicId,
          mockExamPublicId: context.mockExamPublicId,
          questionPublicId: context.questionPublicId,
          aiFuncType: "ai_scoring",
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
          promptTokenCount: estimateTokenCount(context.questionText),
          completionTokenCount: estimateTokenCount(result.overallComment),
          totalTokenCount:
            estimateTokenCount(context.questionText) +
            estimateTokenCount(result.overallComment),
          latencyMs: Math.max(1, completedAt.getTime() - startedAt.getTime()),
          startedAt,
          completedAt,
        });
      }

      return {
        answerRecordPublicId: context.answerRecordPublicId,
        scoringStatus: result.scoringStatus,
        score:
          result.scoringStatus === "scored"
            ? result.totalScore.toFixed(1)
            : null,
        maxScore: result.maxScore.toFixed(1),
        scoringSnapshot:
          result.scoringStatus === "scored"
            ? {
                scoringStatus: result.scoringStatus,
                totalScore: result.totalScore.toFixed(1),
                scoringPoints: result.scoringPoints,
                overallComment: result.overallComment,
                improvementSuggestion: result.improvementSuggestion,
                citations: result.citations satisfies RagCitationDto[],
                evidenceStatus: result.evidenceStatus,
                modelConfigPublicId:
                  result.modelConfigSnapshot.modelConfigPublicId,
                modelName: result.modelConfigSnapshot.modelName,
                promptTemplateKey: result.promptTemplateKey,
                promptTemplateVersion: result.promptTemplateVersion,
              }
            : null,
        failureReason: result.failureReason ?? null,
      };
    },
  };
}

function isSuccessfulSessionResponse(
  response: Awaited<ReturnType<SessionService["getCurrentSession"]>>,
): response is ApiResponse<NonNullable<typeof response.data>> & {
  data: NonNullable<typeof response.data>;
} {
  return response.code === 0 && response.data !== null;
}

export function createStudentFlowUserResolver(
  sessionService: Pick<SessionService, "getCurrentSession">,
): StudentFlowUserResolver {
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

export function createStudentFlowRuntimeRouteHandlers(
  options: StudentFlowRuntimeOptions = {},
) {
  const repositories =
    options.studentPaperRepository !== undefined &&
    options.practiceRepository !== undefined &&
    options.mockExamRepository !== undefined &&
    options.examReportRepository !== undefined
      ? {
          studentPaperRepository: options.studentPaperRepository,
          practiceRepository: options.practiceRepository,
          mockExamRepository: options.mockExamRepository,
          examReportRepository: options.examReportRepository,
        }
      : createPostgresStudentFlowRepositories(options);
  const sessionService = options.sessionService ?? createLocalSessionRuntime();
  const resolveUserContext = createStudentFlowUserResolver(sessionService);
  const createPublicId = options.createPublicId ?? createDefaultPublicId;
  const clock = options.now === undefined ? undefined : { now: options.now };

  return {
    studentPapers: createStudentPaperRouteHandlers(
      createStudentPaperService(repositories.studentPaperRepository),
      resolveUserContext,
    ),
    practices: createPracticeRouteHandlers(
      createPracticeService(repositories.practiceRepository, clock, {
        createPublicId: (prefix) => createPublicId(prefix),
      }),
      resolveUserContext,
    ),
    mockExams: createMockExamRouteHandlers(
      createMockExamService(
        repositories.mockExamRepository,
        clock,
        {
          createPublicId: (prefix) => createPublicId(prefix),
        },
        {
          aiScoringRuntime: createDefaultAiScoringRuntime(
            options.modelConfigRuntimeCatalog,
            options.ragRetrievalRuntime ??
              createDefaultStudentFlowRagRetrievalRuntime(
                options.localResourceStorageRoot ??
                  defaultLocalUploadStorageRoot,
              ),
          ),
        },
      ),
      resolveUserContext,
    ),
    examReports: createExamReportRouteHandlers(
      createExamReportService(
        repositories.examReportRepository,
        clock,
        {
          createPublicId: (prefix) => createPublicId(prefix),
        },
        options.examReportLearningSuggestionOptions ??
          createDefaultLearningSuggestionOptions(
            options.modelConfigRuntimeCatalog,
          ),
      ),
      resolveUserContext,
    ),
  };
}

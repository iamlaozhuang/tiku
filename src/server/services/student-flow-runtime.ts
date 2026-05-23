import { createLocalSessionRuntime } from "../auth/local-session-runtime";
import { createMockAiProvider } from "@/ai/mock-provider";
import type { ApiResponse } from "../contracts/api-response";
import {
  createModelConfigSnapshot,
  type EvidenceStatus,
  type ModelConfigSnapshot,
} from "../models/ai-rag";
import type {
  RagCitationDto,
  RagRetrievalResultDto,
} from "../contracts/ai-rag-contract";
import type { StudentPaperRepository } from "../repositories/student-paper-repository";
import type { PracticeRepository } from "../repositories/practice-repository";
import type { MockExamRepository } from "../repositories/mock-exam-repository";
import type { ExamReportRepository } from "../repositories/exam-report-repository";
import { createPostgresAdminAiAuditLogRuntimeRepositories } from "../repositories/admin-ai-audit-log-runtime-repository";
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
  createPublicId?: (prefix: StudentFlowPublicIdPrefix) => string;
};

type StudentFlowUserResolver = StudentPaperUserResolver &
  PracticeUserResolver &
  MockExamUserResolver &
  ExamReportUserResolver;

function createDefaultPublicId(prefix: StudentFlowPublicIdPrefix): string {
  return `${prefix}_${crypto.randomUUID()}`;
}

function createDefaultLearningSuggestionOptions(): ExamReportLearningSuggestionOptions {
  return {
    learningSuggestionRuntime: createAiMockProviderRuntime({
      provider: createMockAiProvider(),
      aiCallLogRepository: createPostgresAdminAiAuditLogRuntimeRepositories(),
    }),
    modelConfigSnapshot: createModelConfigSnapshot({
      providerPublicId: "model-provider-dev-mock",
      providerKey: "mock",
      providerDisplayName: "Local Mock AI",
      modelConfigPublicId: "model-config-dev-learning-suggestion",
      aiFuncType: "learning_suggestion",
      modelName: "mock-learning-suggestion",
      displayName: "Local mock learning suggestion",
      configVersion: 1,
      timeoutSecond: 5,
      maxRetryCount: 0,
      fallbackModelConfigPublicId: null,
      promptTemplateKey: "dev_learning_suggestion",
      promptTemplateVersion: 1,
    }),
    promptTemplate: {
      promptTemplateKey: "dev_learning_suggestion",
      version: 1,
      templateHash: "dev-learning-suggestion-template-v1",
    },
  };
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

function createLocalModelConfigSnapshot(input: {
  aiFuncType: ModelConfigSnapshot["aiFuncType"];
  modelConfigPublicId: string;
  modelName: string;
  promptTemplateKey: string;
}): ModelConfigSnapshot {
  return createModelConfigSnapshot({
    providerPublicId: "model-provider-dev-mock",
    providerKey: "mock",
    providerDisplayName: "Local Mock AI",
    modelConfigPublicId: input.modelConfigPublicId,
    aiFuncType: input.aiFuncType,
    modelName: input.modelName,
    displayName: `Local mock ${input.aiFuncType}`,
    configVersion: 1,
    timeoutSecond: 5,
    maxRetryCount: 3,
    fallbackModelConfigPublicId: null,
    promptTemplateKey: input.promptTemplateKey,
    promptTemplateVersion: 1,
  });
}

function estimateTokenCount(value: string): number {
  return Math.max(1, Math.ceil(value.length / 4));
}

function createDefaultAiScoringRuntime(): MockExamAiScoringRuntime {
  const aiCallLogRepository =
    createPostgresAdminAiAuditLogRuntimeRepositories();
  const modelConfigSnapshot = createLocalModelConfigSnapshot({
    aiFuncType: "scoring",
    modelConfigPublicId: "model-config-dev-ai-scoring",
    modelName: "mock-ai-scoring",
    promptTemplateKey: "dev_ai_scoring_v1",
  });
  const promptTemplate = {
    promptTemplateKey: "dev_ai_scoring_v1",
    version: 1,
    templateHash: "dev-ai-scoring-template-v1",
  };
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
        ragRetrievalResult: createEmptyRagRetrievalResult(),
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
          aiScoringRuntime: createDefaultAiScoringRuntime(),
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
          createDefaultLearningSuggestionOptions(),
      ),
      resolveUserContext,
    ),
  };
}

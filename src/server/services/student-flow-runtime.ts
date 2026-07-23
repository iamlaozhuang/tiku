import { createLocalSessionRuntime } from "../auth/local-session-runtime";
import { getRequestAuthorization } from "../auth/session-cookie";
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
  createPostgresAiScoringAttemptRepository,
  type AiScoringAttemptRepository,
} from "../repositories/ai-scoring-attempt-repository";
import {
  createPostgresStudentFlowRepositories,
  type StudentFlowRuntimeRepositoryOptions,
} from "../repositories/student-flow-runtime-repository";
import {
  createAiScoringService,
  type AiScoringRunner,
} from "./ai-scoring-service";
import { createAiScoringTaskEnqueueInputFactory } from "./ai-scoring-task-runtime";
import { normalizeAiScoringQuestionContext } from "./ai-scoring-question-context";
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
  type MockExamAiScoringTaskPreparer,
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
  createModelConfigRuntimeResolver,
  createPersistedModelConfigRuntimeCatalog,
  type ModelConfigRuntimeCatalog,
} from "./model-config-runtime";
import {
  buildLocalResourceRagRetrievalResult,
  buildResourceRagRetrievalResult,
} from "./rag-resource-knowledge-runtime";
import {
  createStudentPaperRouteHandlers,
  type StudentPaperUserResolver,
} from "./student-paper-route";
import { createStudentPaperService } from "./student-paper-service";
import { createRouteHandlersWithErrorEnvelope } from "./route-error-response";

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
  aiScoringTaskPreparer?: MockExamAiScoringTaskPreparer;
  modelConfigRuntimeCatalogLoader?: ModelConfigRuntimeCatalogLoader;
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
    createPersistedModelConfigRuntimeCatalog({
      modelConfigs: [],
      promptTemplates: [],
    })
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
      generationPublicIds: [],
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

export function createAiScoringRetrievalQuery(
  context: MockExamAiScoringRuntimeContext,
): string {
  const questionContext = normalizeAiScoringQuestionContext(
    context.questionContext,
    {
      paperQuestionPublicId: context.paperQuestionPublicId,
      questionPublicId: context.questionPublicId,
      profession: context.profession,
      level: context.level,
      subject: context.subject,
    },
  );

  if (questionContext === null) {
    throw new Error("Invalid AI scoring question context.");
  }

  const questionGroup = questionContext.questionGroup;
  const createUntrustedSegment = (name: string, value: string) =>
    `${name}:${JSON.stringify(value)}`;
  const contextSegments =
    questionGroup === null
      ? [
          createUntrustedSegment(
            "untrusted_paper_section_title",
            questionContext.paperSection.title,
          ),
        ]
      : [
          createUntrustedSegment(
            "untrusted_material_title",
            questionGroup.material.title,
          ),
          createUntrustedSegment(
            "untrusted_material_content",
            questionGroup.material.contentRichText,
          ),
          createUntrustedSegment(
            "untrusted_paper_section_title",
            questionContext.paperSection.title,
          ),
          createUntrustedSegment(
            "untrusted_question_group_title",
            questionGroup.title,
          ),
        ];

  return [
    ...contextSegments,
    createUntrustedSegment("question", context.questionText),
    createUntrustedSegment("standard_answer", context.standardAnswer),
    createUntrustedSegment("student_answer", context.studentAnswer),
    ...context.scoringPoints.map((scoringPoint) =>
      createUntrustedSegment("scoring_point", scoringPoint.label),
    ),
  ].join("\n");
}

function createDefaultStudentFlowRagRetrievalRuntime(
  storageRoot?: string,
): StudentFlowRagRetrievalRuntime {
  return {
    async retrieveForAiScoring(context) {
      const profession = readSnapshotProfession(context.questionSnapshot);

      if (profession === null) {
        return createEmptyRagRetrievalResult();
      }

      const retrievalInput = {
        query: createAiScoringRetrievalQuery(context),
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

export function createDefaultAiScoringRuntime(
  modelConfigRuntimeCatalog?: ModelConfigRuntimeCatalog,
  ragRetrievalRuntime: StudentFlowRagRetrievalRuntime = createDefaultStudentFlowRagRetrievalRuntime(),
  modelConfigRuntimeCatalogLoader: ModelConfigRuntimeCatalogLoader = loadPersistedModelConfigRuntimeCatalog,
  aiCallLogRepository: Pick<
    AdminAiAuditLogRuntimeRepositories,
    "appendAiCallLog"
  > = createPostgresAdminAiAuditLogRuntimeRepositories(),
  aiScoringAttemptRepository: AiScoringAttemptRepository = createPostgresAiScoringAttemptRepository(),
  runner: AiScoringRunner = async () => {
    throw new Error("Governed AI scoring executor is unavailable.");
  },
): MockExamAiScoringRuntime {
  const aiScoringService = createAiScoringService({ runner });

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
      const questionContext = normalizeAiScoringQuestionContext(
        context.questionContext,
        {
          paperQuestionPublicId: context.paperQuestionPublicId,
          questionPublicId: context.questionPublicId,
          profession: context.profession,
          level: context.level,
          subject: context.subject,
        },
      );
      const result = await aiScoringService.scoreSubjectiveAnswer({
        userPublicId: context.userPublicId,
        mockExamPublicId: context.mockExamPublicId,
        profession: context.profession,
        level: context.level,
        subject: context.subject,
        answerRecordPublicId: context.answerRecordPublicId,
        paperQuestionPublicId: context.paperQuestionPublicId,
        questionPublicId: context.questionPublicId,
        questionContext: questionContext ?? context.questionContext,
        questionText: context.questionText,
        standardAnswer: context.standardAnswer,
        studentAnswer: context.studentAnswer,
        maxScore: Number.parseFloat(context.maxScore),
        scoringPoints: context.scoringPoints,
        modelConfigSnapshot,
        promptTemplate,
        ragRetrievalResult:
          questionContext === null
            ? createEmptyRagRetrievalResult()
            : await ragRetrievalRuntime.retrieveForAiScoring({
                ...context,
                questionContext,
              }),
        existingResult: null,
        retryCount: 0,
      });
      const completedAt = new Date();
      let aiCallLogPublicId: string | null = null;

      if (result.aiCallLogDraft !== null) {
        const aiCallLog = await aiCallLogRepository.appendAiCallLog({
          userPublicId: context.userPublicId,
          organizationPublicId: context.organizationPublicId ?? null,
          profession: context.profession,
          level: context.level,
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

        aiCallLogPublicId = aiCallLog.publicId;
      }

      if (result.aiScoringAttemptDraft !== null) {
        await aiScoringAttemptRepository.appendAiScoringAttempt({
          answerRecordPublicId: context.answerRecordPublicId,
          aiCallLogPublicId,
          status: result.aiScoringAttemptDraft.status,
          failureCode: result.aiScoringAttemptDraft.failureCode,
          failureMessageDigest:
            result.aiScoringAttemptDraft.failureMessageDigest,
          scheduledAt: startedAt,
          startedAt,
          finishedAt: completedAt,
          retryAfterAt: result.aiScoringAttemptDraft.retryAfterAt,
          attemptSnapshot: result.aiScoringAttemptDraft.attemptSnapshot,
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

export function createDefaultAiScoringTaskPreparer(
  modelConfigRuntimeCatalog?: ModelConfigRuntimeCatalog,
  ragRetrievalRuntime: StudentFlowRagRetrievalRuntime = createDefaultStudentFlowRagRetrievalRuntime(),
  modelConfigRuntimeCatalogLoader: ModelConfigRuntimeCatalogLoader = loadPersistedModelConfigRuntimeCatalog,
  now: () => Date = () => new Date(),
): MockExamAiScoringTaskPreparer {
  const enqueueInputFactory = createAiScoringTaskEnqueueInputFactory({ now });

  return {
    async prepareTask(context) {
      const questionContext = normalizeAiScoringQuestionContext(
        context.questionContext,
        {
          paperQuestionPublicId: context.paperQuestionPublicId,
          questionPublicId: context.questionPublicId,
          profession: context.profession,
          level: context.level,
          subject: context.subject,
        },
      );

      if (questionContext === null) {
        throw new Error("Invalid AI scoring question context.");
      }

      const selection = createModelConfigRuntimeResolver(
        await resolveModelConfigRuntimeCatalog(
          modelConfigRuntimeCatalog,
          modelConfigRuntimeCatalogLoader,
        ),
      ).resolve({
        aiFuncType: "scoring",
        allowFallback: false,
      });

      if (
        selection.status !== "selected" ||
        selection.executionMode !== "governed_provider"
      ) {
        throw new Error("Governed AI scoring model_config is unavailable.");
      }

      const ragRetrievalResult = await ragRetrievalRuntime.retrieveForAiScoring(
        {
          ...context,
          questionContext,
        },
      );

      return enqueueInputFactory.create({
        answerRecordPublicId: context.answerRecordPublicId,
        mockExamPublicId: context.mockExamPublicId,
        actorPublicId: context.userPublicId,
        idempotencyKey: `${context.mockExamPublicId}:${context.answerRecordPublicId}`,
        modelConfigSnapshot: {
          ...selection.modelConfigSnapshot,
          executionMode: selection.executionMode,
        },
        promptTemplateKey: selection.promptTemplate.promptTemplateKey,
        promptTemplateVersion: selection.promptTemplate.version,
        promptTemplateHash: selection.promptTemplate.templateHash,
        inputSnapshot: {
          questionPublicId: context.questionPublicId,
          paperQuestionPublicId: context.paperQuestionPublicId,
          questionContext,
          questionSnapshot: context.questionSnapshot,
          answerSnapshot: context.answerSnapshot,
          questionText: context.questionText,
          standardAnswer: context.standardAnswer,
          studentAnswer: context.studentAnswer,
          maxScore: context.maxScore,
          scoringPoints: context.scoringPoints,
        },
        authorizationSnapshot: {
          actorPublicId: context.userPublicId,
          mockExamPublicId: context.mockExamPublicId,
          profession: context.profession,
          level: context.level,
          subject: context.subject,
          checkedAt: now().toISOString(),
          authorizationBoundary: "mock_exam_submit_guard",
        },
        ragSnapshot: ragRetrievalResult,
      });
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

  return createRouteHandlersWithErrorEnvelope({
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
          aiScoringTaskPreparer:
            options.aiScoringTaskPreparer ??
            createDefaultAiScoringTaskPreparer(
              options.modelConfigRuntimeCatalog,
              options.ragRetrievalRuntime ??
                createDefaultStudentFlowRagRetrievalRuntime(
                  options.localResourceStorageRoot,
                ),
              options.modelConfigRuntimeCatalogLoader ??
                loadPersistedModelConfigRuntimeCatalog,
              options.now,
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
        options.examReportLearningSuggestionOptions,
      ),
      resolveUserContext,
    ),
  });
}

import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type {
  ExamReportListResultDto,
  ExamReportResultDto,
  ExamReportSnapshotDto,
} from "../contracts/exam-report-contract";
import {
  mapExamReportDetailToApi,
  mapExamReportSummaryToApi,
} from "../mappers/exam-report-mapper";
import type {
  ExamReportAnswerRecordRow,
  ExamReportAuthorizationScopeRow,
  ExamReportMockExamRow,
  ExamReportRepository,
  ExamReportRow,
} from "../repositories/exam-report-repository";
import type {
  AiMockProviderPromptTemplateSnapshot,
  LearningSuggestionMockContext,
} from "./ai-mock-provider-runtime";
import type { ModelConfigSnapshot } from "../models/ai-rag";
import {
  normalizeExamReportListQuery,
  normalizeGenerateExamReportInput,
  normalizeRetryLearningSuggestionInput,
} from "../validators/exam-report";

export type ExamReportUserContext = {
  userPublicId: string;
};

export type ExamReportClock = {
  now(): Date;
};

export type ExamReportPublicIdFactory = {
  createPublicId(prefix: "exam_report"): string;
};

export type ExamReportLearningSuggestionRuntime = {
  generateLearningSuggestion(context: LearningSuggestionMockContext): Promise<{
    learningSuggestion: string;
    aiCallLog: unknown;
  }>;
};

export type ExamReportLearningSuggestionOptions = {
  learningSuggestionRuntime: ExamReportLearningSuggestionRuntime;
  modelConfigSnapshot: ModelConfigSnapshot;
  promptTemplate: AiMockProviderPromptTemplateSnapshot;
};

export type ExamReportService = {
  listExamReports(
    userContext: ExamReportUserContext,
    query: unknown,
  ): Promise<ApiResponse<ExamReportListResultDto>>;
  getExamReport(
    userContext: ExamReportUserContext,
    publicId: string,
  ): Promise<ApiResponse<ExamReportResultDto | null>>;
  generateExamReport(
    userContext: ExamReportUserContext,
    input: unknown,
  ): Promise<ApiResponse<ExamReportResultDto | null>>;
  retryLearningSuggestion(
    userContext: ExamReportUserContext,
    publicId: string,
    input: unknown,
  ): Promise<ApiResponse<null>>;
};

const examReportContractTerm = "exam_report";
const snapshotContractTerm = "snapshot";
const scoringContractTerm = "scoring";

void [examReportContractTerm, snapshotContractTerm, scoringContractTerm];

const systemClock: ExamReportClock = {
  now() {
    return new Date();
  },
};

const systemPublicIdFactory: ExamReportPublicIdFactory = {
  createPublicId(prefix) {
    return `${prefix}_${crypto.randomUUID()}`;
  },
};

type ReportPaperQuestionSnapshot = {
  paperQuestionPublicId: string;
  questionPublicId: string;
  questionSnapshot: Record<string, unknown>;
  maxScore: string;
  isObjective: boolean;
};

function hasEffectiveAuthorization(
  scopes: ExamReportAuthorizationScopeRow[],
  reportScope: { profession: ExamReportRow["profession"]; level: number },
): boolean {
  return scopes.some(
    (scope) =>
      scope.profession === reportScope.profession &&
      scope.level === reportScope.level,
  );
}

function createExamReportNotFoundResponse(): ApiResponse<null> {
  return createErrorResponse(404321, "Exam report does not exist.");
}

function createMockExamNotFoundResponse(): ApiResponse<null> {
  return createErrorResponse(404322, "Mock exam does not exist.");
}

function getStringField(
  value: Record<string, unknown>,
  key: string,
): string | null {
  return typeof value[key] === "string" ? value[key] : null;
}

function getScore(value: Record<string, unknown>): string {
  const score = value.score;

  if (typeof score === "number") {
    return score.toFixed(1);
  }

  return typeof score === "string" && score.length > 0 ? score : "0.0";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getStandardAnswerLabels(value: Record<string, unknown>): string[] {
  const standardAnswerLabels = value.standardAnswerLabels;

  if (!Array.isArray(standardAnswerLabels)) {
    return [];
  }

  return standardAnswerLabels.filter(
    (label): label is string => typeof label === "string" && label.length > 0,
  );
}

function getPaperName(paperSnapshot: Record<string, unknown>): string {
  return getStringField(paperSnapshot, "name") ?? "Untitled paper";
}

function calculateDurationSecond(mockExam: ExamReportMockExamRow): number {
  if (mockExam.submitted_at === null) {
    return 0;
  }

  return Math.max(
    0,
    Math.floor(
      (mockExam.submitted_at.getTime() - mockExam.started_at.getTime()) / 1000,
    ),
  );
}

function listReportPaperQuestions(
  paperSnapshot: Record<string, unknown>,
): ReportPaperQuestionSnapshot[] {
  const paperSections = Array.isArray(paperSnapshot.paperSections)
    ? paperSnapshot.paperSections
    : [];

  return paperSections.flatMap((paperSection) => {
    if (
      !isRecord(paperSection) ||
      !Array.isArray(paperSection.paperQuestions)
    ) {
      return [];
    }

    return paperSection.paperQuestions.flatMap((paperQuestion) => {
      if (!isRecord(paperQuestion)) {
        return [];
      }

      const paperQuestionPublicId = getStringField(
        paperQuestion,
        "paperQuestionPublicId",
      );
      const questionPublicId = getStringField(
        paperQuestion,
        "questionPublicId",
      );

      if (paperQuestionPublicId === null || questionPublicId === null) {
        return [];
      }

      return [
        {
          paperQuestionPublicId,
          questionPublicId,
          questionSnapshot: paperQuestion,
          maxScore: getScore(paperQuestion),
          isObjective: getStandardAnswerLabels(paperQuestion).length > 0,
        },
      ];
    });
  });
}

function buildSavedQuestionDetail(answerRecord: ExamReportAnswerRecordRow) {
  return {
    answerRecordPublicId: answerRecord.public_id,
    paperQuestionPublicId: answerRecord.paper_question_public_id,
    questionPublicId: answerRecord.question_public_id,
    questionSnapshot: answerRecord.question_snapshot,
    answerSnapshot: answerRecord.answer_snapshot,
    answerRecordStatus: answerRecord.answer_record_status,
    isCorrect: answerRecord.is_correct,
    score: answerRecord.score,
    maxScore: answerRecord.max_score,
    answeredAt: answerRecord.answered_at?.toISOString() ?? null,
    submittedAt: answerRecord.submitted_at?.toISOString() ?? null,
  };
}

function buildUnansweredQuestionDetail(question: ReportPaperQuestionSnapshot) {
  return {
    answerRecordPublicId: null,
    paperQuestionPublicId: question.paperQuestionPublicId,
    questionPublicId: question.questionPublicId,
    questionSnapshot: question.questionSnapshot,
    answerSnapshot: null,
    answerRecordStatus: null,
    isCorrect: question.isObjective ? false : null,
    score: question.isObjective ? "0.0" : null,
    maxScore: question.maxScore,
    answeredAt: null,
    submittedAt: null,
  };
}

function buildQuestionDetails(
  paperSnapshot: Record<string, unknown>,
  answerRecords: ExamReportAnswerRecordRow[],
) {
  const answerByPaperQuestion = new Map(
    answerRecords.map((answerRecord) => [
      answerRecord.paper_question_public_id,
      answerRecord,
    ]),
  );

  return listReportPaperQuestions(paperSnapshot).map((question) => {
    const answerRecord = answerByPaperQuestion.get(
      question.paperQuestionPublicId,
    );

    return answerRecord === undefined
      ? buildUnansweredQuestionDetail(question)
      : buildSavedQuestionDetail(answerRecord);
  });
}

function buildReportSnapshot(
  mockExam: ExamReportMockExamRow,
  answerRecords: ExamReportAnswerRecordRow[],
): ExamReportSnapshotDto {
  return {
    paperPublicId: mockExam.paper_public_id,
    paperName: getPaperName(mockExam.paper_snapshot),
    profession: mockExam.profession,
    level: mockExam.level,
    subject: mockExam.subject,
    examStatus: mockExam.exam_status,
    scoreSummary: {
      objectiveScore: mockExam.objective_score,
      subjectiveScore: mockExam.subjective_score,
      totalScore: mockExam.total_score,
    },
    paperSnapshot: mockExam.paper_snapshot,
    questionDetails: buildQuestionDetails(
      mockExam.paper_snapshot,
      answerRecords,
    ),
    learningSuggestionStatus: null,
  };
}

function canGenerateReport(mockExam: ExamReportMockExamRow): boolean {
  return ["completed", "scoring_partial_failed"].includes(mockExam.exam_status);
}

async function listScopes(
  repository: ExamReportRepository,
  userContext: ExamReportUserContext,
): Promise<ExamReportAuthorizationScopeRow[]> {
  return repository.listEffectiveAuthorizationScopes({
    userPublicId: userContext.userPublicId,
  });
}

async function getAuthorizedReport(
  repository: ExamReportRepository,
  userContext: ExamReportUserContext,
  publicId: string,
): Promise<ExamReportRow | ApiResponse<null>> {
  const report = await repository.findExamReportByPublicId({
    userPublicId: userContext.userPublicId,
    publicId,
  });

  if (report === null) {
    return createExamReportNotFoundResponse();
  }

  const scopes = await listScopes(repository, userContext);

  if (!hasEffectiveAuthorization(scopes, report)) {
    return createExamReportNotFoundResponse();
  }

  return report;
}

function isExamReportRow(
  value: ExamReportRow | ApiResponse<null>,
): value is ExamReportRow {
  return "public_id" in value;
}

function selectLearningSuggestionAnswerRecord(
  answerRecords: ExamReportAnswerRecordRow[],
): ExamReportAnswerRecordRow | null {
  return (
    answerRecords.find((answerRecord) => answerRecord.is_correct === false) ??
    answerRecords[0] ??
    null
  );
}

function buildLearningSuggestionPrompt(
  report: ExamReportRow,
  answerRecord: ExamReportAnswerRecordRow | null,
): string {
  return JSON.stringify({
    reportPublicId: report.public_id,
    paperPublicId: report.paper_public_id,
    mockExamPublicId: report.mock_exam_public_id,
    totalScore: report.total_score,
    selectedQuestionPublicId: answerRecord?.question_public_id ?? null,
    selectedAnswerRecordPublicId: answerRecord?.public_id ?? null,
    selectedAnswerScore: answerRecord?.score ?? null,
    selectedAnswerMaxScore: answerRecord?.max_score ?? null,
  });
}

function buildLearningSuggestionRawAnswer(
  answerRecord: ExamReportAnswerRecordRow | null,
): string {
  if (answerRecord === null) {
    return "no answer record";
  }

  return JSON.stringify({
    answerSnapshot: answerRecord.answer_snapshot,
    questionSnapshot: answerRecord.question_snapshot,
    isCorrect: answerRecord.is_correct,
    score: answerRecord.score,
    maxScore: answerRecord.max_score,
  });
}

export function createExamReportService(
  repository: ExamReportRepository,
  clock: ExamReportClock = systemClock,
  publicIdFactory: ExamReportPublicIdFactory = systemPublicIdFactory,
  learningSuggestionOptions?: ExamReportLearningSuggestionOptions,
): ExamReportService {
  return {
    async listExamReports(userContext, query) {
      const normalizedQuery = normalizeExamReportListQuery(query);
      const [scopes, reportPage] = await Promise.all([
        listScopes(repository, userContext),
        repository.listExamReports({
          userPublicId: userContext.userPublicId,
          ...normalizedQuery,
        }),
      ]);
      const authorizedReports = reportPage.rows.filter((report) =>
        hasEffectiveAuthorization(scopes, report),
      );

      return createPaginatedResponse(
        {
          examReports: authorizedReports.map(mapExamReportSummaryToApi),
        },
        {
          page: normalizedQuery.page,
          pageSize: normalizedQuery.pageSize,
          total: authorizedReports.length,
          sortBy: normalizedQuery.sortBy,
          sortOrder: normalizedQuery.sortOrder,
        },
      );
    },

    async getExamReport(userContext, publicId) {
      const report = await getAuthorizedReport(
        repository,
        userContext,
        publicId,
      );

      if (!isExamReportRow(report)) {
        return report;
      }

      return createSuccessResponse({
        examReport: mapExamReportDetailToApi(report),
      });
    },

    async generateExamReport(userContext, input) {
      const normalizedInput = normalizeGenerateExamReportInput(input);

      if (normalizedInput === null) {
        return createErrorResponse(422322, "Exam report input is invalid.");
      }

      const existingReport = await repository.findExamReportByMockExamPublicId({
        userPublicId: userContext.userPublicId,
        mockExamPublicId: normalizedInput.mockExamPublicId,
      });

      if (existingReport !== null) {
        return createSuccessResponse({
          examReport: mapExamReportDetailToApi(existingReport),
        });
      }

      const mockExam = await repository.findSubmittedMockExamByPublicId({
        userPublicId: userContext.userPublicId,
        mockExamPublicId: normalizedInput.mockExamPublicId,
      });

      if (mockExam === null) {
        return createMockExamNotFoundResponse();
      }

      if (mockExam.exam_status === "terminated") {
        return createErrorResponse(
          409321,
          "Terminated mock exam cannot generate exam report.",
        );
      }

      if (!canGenerateReport(mockExam)) {
        return createErrorResponse(
          409322,
          "Mock exam scoring is not ready for exam report.",
        );
      }

      const scopes = await listScopes(repository, userContext);

      if (!hasEffectiveAuthorization(scopes, mockExam)) {
        return createMockExamNotFoundResponse();
      }

      const answerRecords = await repository.listMockExamAnswerRecords({
        userPublicId: userContext.userPublicId,
        mockExamPublicId: normalizedInput.mockExamPublicId,
      });
      const generatedAt = clock.now();
      const report = await repository.createExamReport({
        publicId: publicIdFactory.createPublicId("exam_report"),
        userPublicId: userContext.userPublicId,
        mockExamPublicId: mockExam.public_id,
        paperPublicId: mockExam.paper_public_id,
        paperName: getPaperName(mockExam.paper_snapshot),
        profession: mockExam.profession,
        level: mockExam.level,
        subject: mockExam.subject,
        examStatus: mockExam.exam_status,
        objectiveScore: mockExam.objective_score,
        subjectiveScore: mockExam.subjective_score,
        totalScore: mockExam.total_score,
        durationSecond: calculateDurationSecond(mockExam),
        reportSnapshot: buildReportSnapshot(mockExam, answerRecords),
        learningSuggestionSnapshot: null,
        generatedAt,
      });

      return createSuccessResponse({
        examReport: mapExamReportDetailToApi(report),
      });
    },

    async retryLearningSuggestion(userContext, publicId, input) {
      normalizeRetryLearningSuggestionInput(input);

      const report = await getAuthorizedReport(
        repository,
        userContext,
        publicId,
      );

      if (!isExamReportRow(report)) {
        return report;
      }

      if (learningSuggestionOptions === undefined) {
        return createErrorResponse(
          422321,
          "Learning suggestion retry is not available in Phase 4.",
        );
      }

      const answerRecords = await repository.listMockExamAnswerRecords({
        userPublicId: userContext.userPublicId,
        mockExamPublicId: report.mock_exam_public_id,
      });
      const selectedAnswerRecord =
        selectLearningSuggestionAnswerRecord(answerRecords);

      await learningSuggestionOptions.learningSuggestionRuntime.generateLearningSuggestion(
        {
          userPublicId: userContext.userPublicId,
          answerRecordPublicId: selectedAnswerRecord?.public_id ?? null,
          mockExamPublicId: report.mock_exam_public_id,
          questionPublicId: selectedAnswerRecord?.question_public_id ?? null,
          rawPrompt: buildLearningSuggestionPrompt(
            report,
            selectedAnswerRecord,
          ),
          rawAnswer: buildLearningSuggestionRawAnswer(selectedAnswerRecord),
          modelConfigSnapshot: learningSuggestionOptions.modelConfigSnapshot,
          promptTemplate: learningSuggestionOptions.promptTemplate,
          startedAt: clock.now(),
        },
      );

      return createSuccessResponse(null);
    },
  };
}

export function createUnavailableExamReportService(): ExamReportService {
  return {
    async listExamReports() {
      return createPaginatedResponse(
        {
          examReports: [],
        },
        {
          page: 1,
          pageSize: 20,
          total: 0,
          sortBy: "generatedAt",
          sortOrder: "desc",
        },
        "Exam report runtime is not configured.",
      );
    },
    async getExamReport() {
      return createErrorResponse(
        503321,
        "Exam report runtime is not configured.",
      );
    },
    async generateExamReport() {
      return createErrorResponse(
        503321,
        "Exam report runtime is not configured.",
      );
    },
    async retryLearningSuggestion() {
      return createErrorResponse(
        503321,
        "Exam report runtime is not configured.",
      );
    },
  };
}

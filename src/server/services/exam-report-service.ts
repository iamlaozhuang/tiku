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
  questionType: string | null;
  paperSectionTitle: string | null;
  knowledgeNodePublicIds: string[];
};

type ReportFillBlankAnswer = {
  blankKey: string;
  standardAnswers: string[];
  score: string;
  sortOrder: number;
};

type KnowledgeNodeAnalysisAccumulator = {
  knowledgeNodePublicId: string;
  questionPublicIds: string[];
  questionCount: number;
  answeredCount: number;
  correctCount: number;
  score: number;
  maxScore: number;
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

function parseScore(score: string | null): number {
  if (score === null) {
    return 0;
  }

  const parsedScore = Number.parseFloat(score);

  return Number.isFinite(parsedScore) ? parsedScore : 0;
}

function formatScore(score: number): string {
  return score.toFixed(1);
}

function formatRate(numerator: number, denominator: number): number {
  if (denominator <= 0) {
    return 0;
  }

  return Math.round((numerator / denominator) * 100);
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

function getStringArrayField(
  value: Record<string, unknown>,
  key: string,
): string[] {
  const fieldValue = value[key];

  if (!Array.isArray(fieldValue)) {
    return [];
  }

  return fieldValue.filter(
    (item): item is string => typeof item === "string" && item.length > 0,
  );
}

function getFillBlankAnswers(
  value: Record<string, unknown>,
): ReportFillBlankAnswer[] {
  const fillBlankAnswers = value.fillBlankAnswers;

  if (!Array.isArray(fillBlankAnswers)) {
    return [];
  }

  return fillBlankAnswers
    .filter((fillBlankAnswer): fillBlankAnswer is Record<string, unknown> =>
      isRecord(fillBlankAnswer),
    )
    .map((fillBlankAnswer) => ({
      blankKey: getStringField(fillBlankAnswer, "blankKey") ?? "",
      standardAnswers: Array.isArray(fillBlankAnswer.standardAnswers)
        ? fillBlankAnswer.standardAnswers.filter(
            (standardAnswer): standardAnswer is string =>
              typeof standardAnswer === "string" && standardAnswer.length > 0,
          )
        : [],
      score: getScore(fillBlankAnswer),
      sortOrder:
        typeof fillBlankAnswer.sortOrder === "number"
          ? fillBlankAnswer.sortOrder
          : 0,
    }))
    .filter(
      (fillBlankAnswer) =>
        fillBlankAnswer.blankKey.length > 0 &&
        fillBlankAnswer.standardAnswers.length > 0 &&
        fillBlankAnswer.sortOrder > 0,
    )
    .sort((left, right) => left.sortOrder - right.sortOrder);
}

function formatFillBlankStandardAnswer(
  fillBlankAnswers: ReportFillBlankAnswer[],
): string | null {
  if (fillBlankAnswers.length === 0) {
    return null;
  }

  return fillBlankAnswers
    .map(
      (fillBlankAnswer) =>
        `${fillBlankAnswer.blankKey}: ${fillBlankAnswer.standardAnswers.join("/")}`,
    )
    .join("; ");
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

    const paperSectionTitle = getStringField(paperSection, "paperSectionTitle");

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
          questionType: getStringField(paperQuestion, "questionType"),
          paperSectionTitle,
          knowledgeNodePublicIds: getStringArrayField(
            paperQuestion,
            "knowledgeNodePublicIds",
          ),
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

function formatCountSummary(
  label: string,
  counts: Map<string, number>,
): string | null {
  if (counts.size === 0) {
    return null;
  }

  const summary = [...counts.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key} ${value}`)
    .join(", ");

  return `${label}: ${summary}`;
}

function incrementCount(counts: Map<string, number>, key: string | null) {
  if (key === null || key.length === 0) {
    return;
  }

  counts.set(key, (counts.get(key) ?? 0) + 1);
}

function buildAnalyticsSummary(questions: ReportPaperQuestionSnapshot[]) {
  const questionTypeCounts = new Map<string, number>();
  const paperSectionCounts = new Map<string, number>();
  const knowledgeNodeCounts = new Map<string, number>();

  questions.forEach((question) => {
    incrementCount(questionTypeCounts, question.questionType);
    incrementCount(paperSectionCounts, question.paperSectionTitle);
    question.knowledgeNodePublicIds.forEach((knowledgeNodePublicId) => {
      incrementCount(knowledgeNodeCounts, knowledgeNodePublicId);
    });
  });

  return {
    questionTypeSummaryText: formatCountSummary(
      "question_type analytics",
      questionTypeCounts,
    ),
    paperSectionSummaryText: formatCountSummary(
      "paper_section analytics",
      paperSectionCounts,
    ),
    knowledgeNodeSummaryText: formatCountSummary(
      "knowledge_node analytics",
      knowledgeNodeCounts,
    ),
  };
}

function buildKnowledgeNodeAnalysis(
  questions: ReportPaperQuestionSnapshot[],
  answerRecords: ExamReportAnswerRecordRow[],
) {
  const answerByPaperQuestion = new Map(
    answerRecords.map((answerRecord) => [
      answerRecord.paper_question_public_id,
      answerRecord,
    ]),
  );
  const accumulatorByKnowledgeNodePublicId = new Map<
    string,
    KnowledgeNodeAnalysisAccumulator
  >();

  questions.forEach((question) => {
    const answerRecord = answerByPaperQuestion.get(
      question.paperQuestionPublicId,
    );
    const score = parseScore(
      answerRecord?.score ?? (question.isObjective ? "0.0" : null),
    );
    const maxScore = parseScore(question.maxScore);
    const isAnswered = answerRecord !== undefined;
    const isCorrect = answerRecord?.is_correct === true;

    question.knowledgeNodePublicIds.forEach((knowledgeNodePublicId) => {
      const accumulator = accumulatorByKnowledgeNodePublicId.get(
        knowledgeNodePublicId,
      ) ?? {
        knowledgeNodePublicId,
        questionPublicIds: [],
        questionCount: 0,
        answeredCount: 0,
        correctCount: 0,
        score: 0,
        maxScore: 0,
      };

      accumulator.questionPublicIds.push(question.questionPublicId);
      accumulator.questionCount += 1;
      accumulator.answeredCount += isAnswered ? 1 : 0;
      accumulator.correctCount += isCorrect ? 1 : 0;
      accumulator.score += score;
      accumulator.maxScore += maxScore;
      accumulatorByKnowledgeNodePublicId.set(
        knowledgeNodePublicId,
        accumulator,
      );
    });
  });

  const knowledgeNodeAnalysis = [...accumulatorByKnowledgeNodePublicId.values()]
    .map((accumulator) => ({
      knowledgeNodePublicId: accumulator.knowledgeNodePublicId,
      questionCount: accumulator.questionCount,
      answeredCount: accumulator.answeredCount,
      correctCount: accumulator.correctCount,
      score: formatScore(accumulator.score),
      maxScore: formatScore(accumulator.maxScore),
      scoreRate: formatRate(accumulator.score, accumulator.maxScore),
      accuracyRate: formatRate(
        accumulator.correctCount,
        accumulator.questionCount,
      ),
      questionPublicIds: accumulator.questionPublicIds,
    }))
    .sort(
      (left, right) =>
        left.scoreRate - right.scoreRate ||
        left.accuracyRate - right.accuracyRate ||
        left.knowledgeNodePublicId.localeCompare(right.knowledgeNodePublicId),
    )
    .map((analysisItem, index) => ({
      ...analysisItem,
      weaknessRank: index + 1,
    }));

  return {
    knowledgeNodeAnalysis,
    knowledgeNodeWeaknessSummaryText:
      knowledgeNodeAnalysis.length === 0
        ? null
        : `knowledge_node weakness: ${knowledgeNodeAnalysis
            .map(
              (analysisItem) =>
                `${analysisItem.knowledgeNodePublicId} score_rate ${analysisItem.scoreRate}% accuracy ${analysisItem.accuracyRate}% score ${analysisItem.score}/${analysisItem.maxScore}`,
            )
            .join("; ")}`,
  };
}

function formatSelectedAnswer(
  answerSnapshot: ExamReportAnswerRecordRow["answer_snapshot"] | null,
): string | null {
  if (answerSnapshot === null) {
    return null;
  }

  if (answerSnapshot.textAnswer !== null && answerSnapshot.textAnswer !== "") {
    return answerSnapshot.textAnswer;
  }

  return answerSnapshot.selectedLabels.length === 0
    ? null
    : answerSnapshot.selectedLabels.join(", ");
}

function projectStoredAiScoringEvidence(
  answerRecord: ExamReportAnswerRecordRow | undefined,
): Record<string, unknown> | null {
  const evidence = answerRecord?.ai_scoring_evidence;
  const resultSnapshot = evidence?.resultSnapshot;

  if (
    evidence === null ||
    evidence === undefined ||
    !isRecord(resultSnapshot) ||
    resultSnapshot.scoringStatus !== "scored"
  ) {
    return null;
  }

  const scoringPoints = Array.isArray(resultSnapshot.scoringPoints)
    ? resultSnapshot.scoringPoints.flatMap((candidate) => {
        if (!isRecord(candidate)) {
          return [];
        }

        const scoringPointPublicId = getStringField(
          candidate,
          "scoringPointPublicId",
        );
        const isHit = candidate.isHit;
        const score = candidate.score;

        if (
          scoringPointPublicId === null ||
          typeof isHit !== "boolean" ||
          (typeof score !== "number" && typeof score !== "string")
        ) {
          return [];
        }

        return [
          {
            scoringPointPublicId,
            isHit,
            score,
            reason: getStringField(candidate, "reason"),
          },
        ];
      })
    : [];
  const citations = Array.isArray(resultSnapshot.citations)
    ? resultSnapshot.citations.flatMap((candidate) => {
        if (!isRecord(candidate)) {
          return [];
        }

        const resourcePublicId = getStringField(candidate, "resourcePublicId");
        const chunkPublicId = getStringField(candidate, "chunkPublicId");
        const generationPublicId = getStringField(
          candidate,
          "generationPublicId",
        );
        const chunkIndex = candidate.chunkIndex;

        if (
          resourcePublicId === null ||
          chunkPublicId === null ||
          generationPublicId === null ||
          typeof chunkIndex !== "number" ||
          !Number.isInteger(chunkIndex)
        ) {
          return [];
        }

        return [
          {
            resourcePublicId,
            resourceTitle: getStringField(candidate, "resourceTitle"),
            chunkPublicId,
            generationPublicId,
            headingPath: getStringArrayField(candidate, "headingPath"),
            chunkIndex,
            textHash: getStringField(candidate, "textHash"),
          },
        ];
      })
    : [];
  const modelConfigSnapshot = evidence.modelConfigSnapshot;

  return {
    taskPublicId: evidence.taskPublicId,
    taskStatus: evidence.taskStatus,
    attemptNumber: evidence.attemptNumber,
    attemptStatus: evidence.attemptStatus,
    modelConfig: {
      modelConfigPublicId: getStringField(
        modelConfigSnapshot,
        "modelConfigPublicId",
      ),
      modelName: getStringField(modelConfigSnapshot, "modelName"),
      providerDisplayName: getStringField(
        modelConfigSnapshot,
        "providerDisplayName",
      ),
      configVersion:
        typeof modelConfigSnapshot.configVersion === "number"
          ? modelConfigSnapshot.configVersion
          : null,
    },
    promptTemplate: {
      promptTemplateKey: evidence.promptTemplateKey,
      version: evidence.promptTemplateVersion,
      templateHash: evidence.promptTemplateHash,
    },
    scoringPoints,
    overallComment: getStringField(resultSnapshot, "overallComment"),
    improvementSuggestion: getStringField(
      resultSnapshot,
      "improvementSuggestion",
    ),
    evidenceStatus: getStringField(resultSnapshot, "evidenceStatus"),
    citations,
  };
}

function buildQuestionResults(
  paperSnapshot: Record<string, unknown>,
  answerRecords: ExamReportAnswerRecordRow[],
) {
  const answerByPaperQuestion = new Map(
    answerRecords.map((answerRecord) => [
      answerRecord.paper_question_public_id,
      answerRecord,
    ]),
  );

  return listReportPaperQuestions(paperSnapshot).map((question, index) => {
    const answerRecord = answerByPaperQuestion.get(
      question.paperQuestionPublicId,
    );
    const standardAnswerLabels = getStandardAnswerLabels(
      question.questionSnapshot,
    );
    const fillBlankAnswers = getFillBlankAnswers(question.questionSnapshot);

    return {
      paperQuestionPublicId: question.paperQuestionPublicId,
      questionPublicId: question.questionPublicId,
      questionType: question.questionType,
      scoringMethod: getStringField(question.questionSnapshot, "scoringMethod"),
      title:
        getStringField(question.questionSnapshot, "title") ??
        getStringField(question.questionSnapshot, "stemText") ??
        `Question ${index + 1}`,
      isCorrect:
        answerRecord?.is_correct ?? (question.isObjective ? false : null),
      score: answerRecord?.score ?? (question.isObjective ? "0.0" : null),
      maxScore: question.maxScore,
      selectedAnswer: formatSelectedAnswer(
        answerRecord?.answer_snapshot ?? null,
      ),
      standardAnswer:
        standardAnswerLabels.length === 0
          ? formatFillBlankStandardAnswer(fillBlankAnswers)
          : standardAnswerLabels.join(", "),
      fillBlankAnswers,
      aiScoringEvidence: projectStoredAiScoringEvidence(answerRecord),
      mistakeBookPublicId: null,
    };
  });
}

export function buildExamReportSnapshot(
  mockExam: ExamReportMockExamRow,
  answerRecords: ExamReportAnswerRecordRow[],
): ExamReportSnapshotDto {
  const questions = listReportPaperQuestions(mockExam.paper_snapshot);

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
    questionResults: buildQuestionResults(
      mockExam.paper_snapshot,
      answerRecords,
    ),
    ...buildAnalyticsSummary(questions),
    ...buildKnowledgeNodeAnalysis(questions, answerRecords),
    learningSuggestionStatus: null,
  };
}

function buildLearningSuggestionSnapshot(
  report: ExamReportRow,
  answerRecord: ExamReportAnswerRecordRow | null,
  result: Awaited<
    ReturnType<
      ExamReportLearningSuggestionRuntime["generateLearningSuggestion"]
    >
  >,
  options: ExamReportLearningSuggestionOptions,
  generatedAt: Date,
) {
  return {
    status: "generated",
    learningSuggestion: result.learningSuggestion,
    evidenceStatus: "none",
    generatedAt: generatedAt.toISOString(),
    reportPublicId: report.public_id,
    mockExamPublicId: report.mock_exam_public_id,
    selectedAnswerRecordPublicId: answerRecord?.public_id ?? null,
    selectedQuestionPublicId: answerRecord?.question_public_id ?? null,
    modelConfigSnapshot: {
      modelConfigPublicId: options.modelConfigSnapshot.modelConfigPublicId,
      aiFuncType: options.modelConfigSnapshot.aiFuncType,
      modelName: options.modelConfigSnapshot.modelName,
      providerDisplayName: options.modelConfigSnapshot.providerDisplayName,
      configVersion: options.modelConfigSnapshot.configVersion,
    },
    promptTemplate: {
      promptTemplateKey: options.promptTemplate.promptTemplateKey,
      version: options.promptTemplate.version,
      templateHash: options.promptTemplate.templateHash,
    },
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
      const reportPage = await repository.listExamReports({
        userPublicId: userContext.userPublicId,
        ...normalizedQuery,
      });

      return createPaginatedResponse(
        {
          examReports: reportPage.rows.map(mapExamReportSummaryToApi),
        },
        {
          page: normalizedQuery.page,
          pageSize: normalizedQuery.pageSize,
          total: reportPage.total,
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
      const reportInput = {
        publicId:
          existingReport?.public_id ??
          publicIdFactory.createPublicId("exam_report"),
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
        reportSnapshot: buildExamReportSnapshot(mockExam, answerRecords),
        learningSuggestionSnapshot: null,
        generatedAt,
      } as const;
      const report =
        existingReport === null
          ? await repository.createExamReport(reportInput)
          : await repository.rebuildExamReport(reportInput);

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

      const generatedAt = clock.now();
      const suggestionPrompt = buildLearningSuggestionPrompt(
        report,
        selectedAnswerRecord,
      );
      const suggestionAnswer =
        buildLearningSuggestionRawAnswer(selectedAnswerRecord);
      const learningSuggestionResult =
        await learningSuggestionOptions.learningSuggestionRuntime.generateLearningSuggestion(
          {
            userPublicId: userContext.userPublicId,
            answerRecordPublicId: selectedAnswerRecord?.public_id ?? null,
            mockExamPublicId: report.mock_exam_public_id,
            questionPublicId: selectedAnswerRecord?.question_public_id ?? null,
            rawPrompt: suggestionPrompt,
            rawAnswer: suggestionAnswer,
            modelConfigSnapshot: learningSuggestionOptions.modelConfigSnapshot,
            promptTemplate: learningSuggestionOptions.promptTemplate,
            startedAt: generatedAt,
          },
        );

      await repository.updateExamReportLearningSuggestionSnapshot({
        userPublicId: userContext.userPublicId,
        publicId: report.public_id,
        learningSuggestionSnapshot: buildLearningSuggestionSnapshot(
          report,
          selectedAnswerRecord,
          learningSuggestionResult,
          learningSuggestionOptions,
          generatedAt,
        ),
      });

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
          sortBy: "startedAt",
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

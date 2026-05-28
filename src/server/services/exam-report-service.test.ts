import { describe, expect, it } from "vitest";

import {
  createExamReportService,
  type ExamReportClock,
  type ExamReportLearningSuggestionOptions,
  type ExamReportPublicIdFactory,
} from "./exam-report-service";
import { createModelConfigSnapshot } from "../models/ai-rag";
import type {
  ExamReportAnswerRecordRow,
  ExamReportAuthorizationScopeRow,
  ExamReportMockExamRow,
  ExamReportRepository,
  ExamReportRow,
} from "../repositories/exam-report-repository";
import type { LearningSuggestionMockContext } from "./ai-mock-provider-runtime";

const now = new Date("2026-05-19T09:00:00.000Z");
const startedAt = new Date("2026-05-19T08:00:00.000Z");
const submittedAt = new Date("2026-05-19T08:45:00.000Z");
const scopeExpiresAt = new Date("2026-06-19T08:00:00.000Z");
const modelConfigSnapshot = createModelConfigSnapshot({
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
  promptTemplateKey: "learning_suggestion_v1",
  promptTemplateVersion: 1,
});

const userContext = {
  userPublicId: "user_public_123",
};

const clock: ExamReportClock = {
  now() {
    return now;
  },
};

function createIdFactory(): ExamReportPublicIdFactory {
  return {
    createPublicId() {
      return "exam_report_public_new";
    },
  };
}

function createScope(
  overrides: Partial<ExamReportAuthorizationScopeRow> = {},
): ExamReportAuthorizationScopeRow {
  return {
    profession: "monopoly",
    level: 3,
    authorization_types: ["personal_auth"],
    expires_at: scopeExpiresAt,
    ...overrides,
  };
}

function createPaperSnapshot(): Record<string, unknown> {
  return {
    paperPublicId: "paper_public_123",
    name: "2024年专卖三级理论真题",
    paperSections: [
      {
        paperSectionTitle: "一、单项选择题",
        paperQuestions: [
          {
            paperQuestionPublicId: "paper_question_public_123",
            questionPublicId: "question_public_123",
            questionType: "single_choice",
            title: "Runtime single choice",
            stemRichText: "<p>题干</p>",
            standardAnswerLabels: ["A"],
            score: "1.0",
            knowledgeNodePublicIds: ["knowledge_node_public_123"],
          },
          {
            paperQuestionPublicId: "paper_question_public_unanswered",
            questionPublicId: "question_public_unanswered",
            questionType: "single_choice",
            title: "Runtime unanswered single choice",
            stemRichText: "<p>未答题干</p>",
            standardAnswerLabels: ["B"],
            score: "2.0",
            knowledgeNodePublicIds: ["knowledge_node_public_456"],
          },
        ],
      },
    ],
  };
}

function createExamReportRow(
  overrides: Partial<ExamReportRow> = {},
): ExamReportRow {
  return {
    id: 3001,
    public_id: "exam_report_public_123",
    exam_report_public_id: "exam_report_public_123",
    mock_exam_public_id: "mock_exam_public_123",
    paper_public_id: "paper_public_123",
    paper_name: "2024年专卖三级理论真题",
    profession: "monopoly",
    level: 3,
    subject: "theory",
    exam_status: "completed",
    objective_score: "1.0",
    subjective_score: null,
    total_score: "1.0",
    duration_second: 2700,
    report_snapshot: {
      paperName: "2024年专卖三级理论真题",
      questionDetails: [],
    },
    learning_suggestion_snapshot: null,
    generated_at: now,
    started_at: startedAt,
    created_at: now,
    updated_at: now,
    ...overrides,
  };
}

function createMockExamRow(
  overrides: Partial<ExamReportMockExamRow> = {},
): ExamReportMockExamRow {
  return {
    public_id: "mock_exam_public_123",
    paper_public_id: "paper_public_123",
    paper_snapshot: createPaperSnapshot(),
    profession: "monopoly",
    level: 3,
    subject: "theory",
    exam_status: "completed",
    started_at: startedAt,
    submitted_at: submittedAt,
    objective_score: "1.0",
    subjective_score: null,
    total_score: "1.0",
    ...overrides,
  };
}

function createAnswerRecordRow(): ExamReportAnswerRecordRow {
  return {
    public_id: "answer_record_public_123",
    paper_question_public_id: "paper_question_public_123",
    question_public_id: "question_public_123",
    question_snapshot: {
      stemRichText: "<p>题干</p>",
      score: "1.0",
    },
    answer_snapshot: {
      selectedLabels: ["A"],
      textAnswer: null,
      savedFromClientAt: null,
    },
    answer_record_status: "scored",
    is_correct: true,
    score: "1.0",
    max_score: "1.0",
    answered_at: submittedAt,
    submitted_at: submittedAt,
  };
}

function createRepository(
  overrides: Partial<ExamReportRepository> = {},
): ExamReportRepository {
  return {
    async listEffectiveAuthorizationScopes() {
      return [createScope()];
    },
    async listExamReports() {
      return {
        rows: [createExamReportRow()],
        total: 1,
      };
    },
    async findExamReportByPublicId() {
      return createExamReportRow();
    },
    async findExamReportByMockExamPublicId() {
      return null;
    },
    async findSubmittedMockExamByPublicId() {
      return createMockExamRow();
    },
    async listMockExamAnswerRecords() {
      return [createAnswerRecordRow()];
    },
    async createExamReport(input) {
      return createExamReportRow({
        public_id: input.publicId,
        mock_exam_public_id: input.mockExamPublicId,
        paper_public_id: input.paperPublicId,
        paper_name: input.paperName,
        report_snapshot: input.reportSnapshot,
        learning_suggestion_snapshot: input.learningSuggestionSnapshot,
        generated_at: input.generatedAt,
        duration_second: input.durationSecond,
      });
    },
    async updateExamReportLearningSuggestionSnapshot() {},
    ...overrides,
  };
}

function createLearningSuggestionOptions(
  capturedContexts: LearningSuggestionMockContext[],
): ExamReportLearningSuggestionOptions {
  return {
    learningSuggestionRuntime: {
      async generateLearningSuggestion(context) {
        capturedContexts.push(context);

        return {
          learningSuggestion: "Review missed knowledge nodes.",
          aiCallLog: {
            publicId: "ai_call_log_public_redacted",
          },
        };
      },
    },
    modelConfigSnapshot,
    promptTemplate: {
      promptTemplateKey: "learning_suggestion_v1",
      version: 1,
      templateHash: "learning_suggestion_v1_baseline",
    },
  };
}

describe("exam report service", () => {
  it("lists authorization-filtered exam_report summaries with pagination", async () => {
    const service = createExamReportService(createRepository(), clock);

    await expect(
      service.listExamReports(userContext, {
        page: "1",
        pageSize: "20",
      }),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        examReports: [
          {
            publicId: "exam_report_public_123",
            mockExamPublicId: "mock_exam_public_123",
            paperName: "2024年专卖三级理论真题",
          },
        ],
      },
      pagination: {
        page: 1,
        pageSize: 20,
        total: 1,
      },
    });
  });

  it("passes terminated status and startedAt sort semantics to the repository", async () => {
    const receivedQueries: unknown[] = [];
    const service = createExamReportService(
      createRepository({
        async listExamReports(query) {
          receivedQueries.push(query);

          return {
            rows: [
              createExamReportRow({
                public_id: "mock_exam_public_terminated",
                exam_report_public_id: null,
                mock_exam_public_id: "mock_exam_public_terminated",
                exam_status: "terminated",
                total_score: null,
                generated_at: startedAt,
                started_at: startedAt,
              }),
            ],
            total: 1,
          };
        },
      }),
      clock,
    );

    await expect(
      service.listExamReports(userContext, {
        status: "terminated",
      }),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        examReports: [
          {
            publicId: "mock_exam_public_terminated",
            examReportPublicId: null,
            mockExamPublicId: "mock_exam_public_terminated",
            examStatus: "terminated",
            startedAt: "2026-05-19T08:00:00.000Z",
          },
        ],
      },
      pagination: {
        sortBy: "startedAt",
      },
    });
    expect(receivedQueries).toEqual([
      expect.objectContaining({
        status: "terminated",
        sortBy: "startedAt",
        sortOrder: "desc",
      }),
    ]);
  });

  it("hides report detail when current authorization no longer covers its scope", async () => {
    const service = createExamReportService(
      createRepository({
        async listEffectiveAuthorizationScopes() {
          return [createScope({ level: 4 })];
        },
      }),
      clock,
    );

    await expect(
      service.getExamReport(userContext, "exam_report_public_123"),
    ).resolves.toEqual({
      code: 404321,
      message: "Exam report does not exist.",
      data: null,
    });
  });

  it("generates immutable report snapshot from completed mock_exam answers", async () => {
    const createInputs: unknown[] = [];
    const service = createExamReportService(
      createRepository({
        async createExamReport(input) {
          createInputs.push(input);

          return createExamReportRow({
            public_id: input.publicId,
            report_snapshot: input.reportSnapshot,
            learning_suggestion_snapshot: input.learningSuggestionSnapshot,
          });
        },
      }),
      clock,
      createIdFactory(),
    );

    await expect(
      service.generateExamReport(userContext, {
        mockExamPublicId: "mock_exam_public_123",
      }),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        examReport: {
          publicId: "exam_report_public_new",
          learningSuggestionSnapshot: null,
          reportSnapshot: {
            paperName: "2024年专卖三级理论真题",
            questionTypeSummaryText: "question_type analytics: single_choice 2",
            paperSectionSummaryText:
              "paper_section analytics: 一、单项选择题 2",
            knowledgeNodeSummaryText:
              "knowledge_node analytics: knowledge_node_public_123 1, knowledge_node_public_456 1",
            questionResults: [
              {
                paperQuestionPublicId: "paper_question_public_123",
                questionPublicId: "question_public_123",
                questionType: "single_choice",
                title: "Runtime single choice",
                isCorrect: true,
                score: "1.0",
                maxScore: "1.0",
                selectedAnswer: "A",
                standardAnswer: "A",
                mistakeBookPublicId: null,
              },
              {
                paperQuestionPublicId: "paper_question_public_unanswered",
                questionPublicId: "question_public_unanswered",
                questionType: "single_choice",
                title: "Runtime unanswered single choice",
                isCorrect: false,
                score: "0.0",
                maxScore: "2.0",
                selectedAnswer: null,
                standardAnswer: "B",
                mistakeBookPublicId: null,
              },
            ],
            questionDetails: [
              {
                answerRecordPublicId: "answer_record_public_123",
                paperQuestionPublicId: "paper_question_public_123",
                score: "1.0",
              },
              {
                answerRecordPublicId: null,
                paperQuestionPublicId: "paper_question_public_unanswered",
                questionPublicId: "question_public_unanswered",
                answerSnapshot: null,
                answerRecordStatus: null,
                isCorrect: false,
                score: "0.0",
                maxScore: "2.0",
                answeredAt: null,
                submittedAt: null,
              },
            ],
          },
        },
      },
    });
    expect(createInputs).toEqual([
      expect.objectContaining({
        publicId: "exam_report_public_new",
        mockExamPublicId: "mock_exam_public_123",
        durationSecond: 2700,
        learningSuggestionSnapshot: null,
      }),
    ]);
  });

  it("persists a redaction-safe learning suggestion snapshot after local retry", async () => {
    const capturedContexts: LearningSuggestionMockContext[] = [];
    const updateInputs: unknown[] = [];
    const service = createExamReportService(
      createRepository({
        async updateExamReportLearningSuggestionSnapshot(input) {
          updateInputs.push(input);
        },
      }),
      clock,
      createIdFactory(),
      createLearningSuggestionOptions(capturedContexts),
    );

    await expect(
      service.retryLearningSuggestion(userContext, "exam_report_public_123", {
        requestedFromClientAt: "2026-05-19T09:05:00.000Z",
      }),
    ).resolves.toEqual({
      code: 0,
      message: "ok",
      data: null,
    });
    expect(capturedContexts).toHaveLength(1);
    expect(updateInputs).toEqual([
      {
        userPublicId: "user_public_123",
        publicId: "exam_report_public_123",
        learningSuggestionSnapshot: {
          status: "generated",
          learningSuggestion: "Review missed knowledge nodes.",
          evidenceStatus: "none",
          generatedAt: "2026-05-19T09:00:00.000Z",
          reportPublicId: "exam_report_public_123",
          mockExamPublicId: "mock_exam_public_123",
          selectedAnswerRecordPublicId: "answer_record_public_123",
          selectedQuestionPublicId: "question_public_123",
          modelConfigSnapshot: {
            modelConfigPublicId: "model-config-dev-learning-suggestion",
            aiFuncType: "learning_suggestion",
            modelName: "mock-learning-suggestion",
            providerDisplayName: "Local Mock AI",
            configVersion: 1,
          },
          promptTemplate: {
            promptTemplateKey: "learning_suggestion_v1",
            version: 1,
            templateHash: "learning_suggestion_v1_baseline",
          },
        },
      },
    ]);

    const serializedSnapshot = JSON.stringify(updateInputs);
    expect(serializedSnapshot).not.toContain("selectedLabels");
    expect(serializedSnapshot).not.toContain("rawPrompt");
    expect(serializedSnapshot).not.toContain("rawAnswer");
    expect(serializedSnapshot).not.toContain("ai_call_log_public_redacted");
  });

  it("does not generate report for terminated or unknown mock_exam attempts", async () => {
    const terminatedService = createExamReportService(
      createRepository({
        async findSubmittedMockExamByPublicId() {
          return createMockExamRow({
            exam_status: "terminated",
            submitted_at: null,
          });
        },
      }),
      clock,
      createIdFactory(),
    );

    await expect(
      terminatedService.generateExamReport(userContext, {
        mockExamPublicId: "mock_exam_public_terminated",
      }),
    ).resolves.toEqual({
      code: 409321,
      message: "Terminated mock exam cannot generate exam report.",
      data: null,
    });

    const missingService = createExamReportService(
      createRepository({
        async findSubmittedMockExamByPublicId() {
          return null;
        },
      }),
      clock,
      createIdFactory(),
    );

    await expect(
      missingService.generateExamReport(userContext, {
        mockExamPublicId: "missing_mock_exam",
      }),
    ).resolves.toEqual({
      code: 404322,
      message: "Mock exam does not exist.",
      data: null,
    });
  });

  it("returns documented not-available response for Phase 5 learning suggestion retry", async () => {
    const service = createExamReportService(createRepository(), clock);

    await expect(
      service.retryLearningSuggestion(userContext, "exam_report_public_123", {
        requestedFromClientAt: "2026-05-19T09:05:00.000Z",
      }),
    ).resolves.toEqual({
      code: 422321,
      message: "Learning suggestion retry is not available in Phase 4.",
      data: null,
    });
  });
});

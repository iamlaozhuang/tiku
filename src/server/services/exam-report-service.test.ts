import { describe, expect, it } from "vitest";

import {
  createExamReportService,
  type ExamReportClock,
  type ExamReportPublicIdFactory,
} from "./exam-report-service";
import type {
  ExamReportAnswerRecordRow,
  ExamReportAuthorizationScopeRow,
  ExamReportMockExamRow,
  ExamReportRepository,
  ExamReportRow,
} from "../repositories/exam-report-repository";

const now = new Date("2026-05-19T09:00:00.000Z");
const startedAt = new Date("2026-05-19T08:00:00.000Z");
const submittedAt = new Date("2026-05-19T08:45:00.000Z");
const scopeExpiresAt = new Date("2026-06-19T08:00:00.000Z");

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
            stemRichText: "<p>题干</p>",
            standardAnswerLabels: ["A"],
            score: "1.0",
            knowledgeNodePublicIds: ["knowledge_node_public_123"],
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
    ...overrides,
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
            questionDetails: [
              {
                answerRecordPublicId: "answer_record_public_123",
                score: "1.0",
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

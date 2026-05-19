import { describe, expect, it } from "vitest";

import {
  createMockExamService,
  type MockExamClock,
  type MockExamPublicIdFactory,
} from "./mock-exam-service";
import type {
  MockExamAuthorizationScopeRow,
  MockExamPaperRow,
  MockExamRepository,
  MockExamRow,
} from "../repositories/mock-exam-repository";

const now = new Date("2026-05-19T08:00:00.000Z");
const serverDeadlineAt = new Date("2026-05-19T10:00:00.000Z");
const expiredDeadlineAt = new Date("2026-05-19T07:59:00.000Z");
const scopeExpiresAt = new Date("2026-06-19T08:00:00.000Z");

const userContext = {
  userPublicId: "user_public_123",
};

const clock: MockExamClock = {
  now() {
    return now;
  },
};

function createIdFactory(): MockExamPublicIdFactory {
  let nextValue = 1;

  return {
    createPublicId(prefix) {
      return `${prefix}_public_${nextValue++}`;
    },
  };
}

function createPaperSnapshot(): Record<string, unknown> {
  return {
    paperPublicId: "paper_public_123",
    name: "2024年专卖三级理论真题",
    durationMinute: 120,
    paperSections: [
      {
        paperSectionTitle: "一、单项选择题",
        paperQuestions: [
          {
            paperQuestionPublicId: "paper_question_public_123",
            questionPublicId: "question_public_123",
            questionType: "single_choice",
            stemRichText: "<p>题干</p>",
            questionOptions: [
              { label: "A", contentRichText: "<p>A</p>" },
              { label: "B", contentRichText: "<p>B</p>" },
            ],
            standardAnswerLabels: ["A"],
            standardAnswerRichText: "<p>A</p>",
            analysisRichText: "<p>解析</p>",
            score: "1.0",
            scoringMethod: "auto_match",
          },
          {
            paperQuestionPublicId: "paper_question_public_456",
            questionPublicId: "question_public_456",
            questionType: "short_answer",
            stemRichText: "<p>主观题</p>",
            standardAnswerLabels: [],
            standardAnswerRichText: "<p>标准答案</p>",
            analysisRichText: "<p>解析</p>",
            score: "5.0",
            scoringMethod: "ai_scoring",
          },
        ],
      },
    ],
  };
}

function createScope(
  overrides: Partial<MockExamAuthorizationScopeRow> = {},
): MockExamAuthorizationScopeRow {
  return {
    profession: "monopoly",
    level: 3,
    authorization_types: ["personal_auth"],
    expires_at: scopeExpiresAt,
    ...overrides,
  };
}

function createPaper(
  overrides: Partial<MockExamPaperRow> = {},
): MockExamPaperRow {
  return {
    public_id: "paper_public_123",
    profession: "monopoly",
    level: 3,
    subject: "theory",
    duration_minute: 120,
    paper_snapshot: createPaperSnapshot(),
    ...overrides,
  };
}

function createMockExam(overrides: Partial<MockExamRow> = {}): MockExamRow {
  return {
    id: 2001,
    public_id: "mock_exam_public_existing",
    paper_public_id: "paper_public_123",
    profession: "monopoly",
    level: 3,
    subject: "theory",
    exam_status: "in_progress",
    started_at: now,
    submitted_at: null,
    server_deadline_at: serverDeadlineAt,
    duration_minute: 120,
    terminated_at: null,
    termination_reason: null,
    objective_score: null,
    subjective_score: null,
    total_score: null,
    paper_snapshot: createPaperSnapshot(),
    answered_count: 0,
    ...overrides,
  };
}

function createRepository(
  overrides: Partial<MockExamRepository> = {},
): MockExamRepository {
  return {
    async listEffectiveAuthorizationScopes() {
      return [createScope()];
    },
    async findPublishedPaperByPublicId() {
      return createPaper();
    },
    async findActiveMockExamByPaper() {
      return null;
    },
    async findMockExamByPublicId() {
      return createMockExam();
    },
    async createMockExam(input) {
      return createMockExam({
        public_id: input.publicId,
        paper_public_id: input.paperPublicId,
        paper_snapshot: input.paperSnapshot,
        profession: input.profession,
        level: input.level,
        subject: input.subject,
        started_at: input.startedAt,
        server_deadline_at: input.serverDeadlineAt,
        duration_minute: input.durationMinute,
      });
    },
    async saveMockExamAnswerRecord(input) {
      return {
        public_id: input.publicId,
        exam_mode: "mock_exam",
        paper_question_public_id: input.paperQuestionPublicId,
        question_public_id: input.questionPublicId,
        answer_snapshot: input.answerSnapshot,
        answer_record_status: "saved",
        is_correct: null,
        score: null,
        max_score: input.maxScore,
        answered_at: input.answeredAt,
        submitted_at: null,
      };
    },
    async listMockExamAnswerRecords() {
      return [];
    },
    async submitMockExam(input) {
      return createMockExam({
        public_id: input.publicId,
        exam_status: "completed",
        submitted_at: input.submittedAt,
        objective_score: input.objectiveScore,
        subjective_score: input.subjectiveScore,
        total_score: input.totalScore,
      });
    },
    async terminateMockExam(input) {
      return createMockExam({
        public_id: input.publicId,
        exam_status: "terminated",
        terminated_at: input.terminatedAt,
        termination_reason: input.terminationReason,
      });
    },
    ...overrides,
  };
}

describe("mock exam service", () => {
  it("starts a new authorized mock_exam with server deadline", async () => {
    const createdInputs: unknown[] = [];
    const service = createMockExamService(
      createRepository({
        async createMockExam(input) {
          createdInputs.push(input);

          return createMockExam({
            public_id: input.publicId,
            started_at: input.startedAt,
            server_deadline_at: input.serverDeadlineAt,
          });
        },
      }),
      clock,
      createIdFactory(),
    );

    await expect(
      service.startMockExam(userContext, {
        paperPublicId: "paper_public_123",
      }),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        mockExam: {
          publicId: "mock_exam_public_1",
          paperPublicId: "paper_public_123",
          examStatus: "in_progress",
          serverNow: "2026-05-19T08:00:00.000Z",
          serverDeadlineAt: "2026-05-19T10:00:00.000Z",
          questionCount: 2,
        },
      },
    });
    expect(createdInputs).toEqual([
      expect.objectContaining({
        publicId: "mock_exam_public_1",
        userPublicId: "user_public_123",
        paperPublicId: "paper_public_123",
        startedAt: now,
        serverDeadlineAt,
        durationMinute: 120,
      }),
    ]);
  });

  it("resumes an active mock_exam but auto-submits when server deadline has passed", async () => {
    const resumedService = createMockExamService(
      createRepository({
        async findActiveMockExamByPaper() {
          return createMockExam();
        },
      }),
      clock,
      createIdFactory(),
    );

    await expect(
      resumedService.startMockExam(userContext, {
        paperPublicId: "paper_public_123",
      }),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        mockExam: {
          publicId: "mock_exam_public_existing",
          examStatus: "in_progress",
        },
      },
    });

    const submitInputs: unknown[] = [];
    const expiredService = createMockExamService(
      createRepository({
        async findActiveMockExamByPaper() {
          return createMockExam({
            server_deadline_at: expiredDeadlineAt,
          });
        },
        async submitMockExam(input) {
          submitInputs.push(input);

          return createMockExam({
            public_id: input.publicId,
            exam_status: "completed",
            submitted_at: input.submittedAt,
            objective_score: input.objectiveScore,
            total_score: input.totalScore,
          });
        },
      }),
      clock,
      createIdFactory(),
    );

    await expect(
      expiredService.startMockExam(userContext, {
        paperPublicId: "paper_public_123",
      }),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        mockExam: {
          publicId: "mock_exam_public_existing",
          examStatus: "completed",
        },
      },
    });
    expect(submitInputs).toEqual([
      expect.objectContaining({
        publicId: "mock_exam_public_existing",
        submittedAt: now,
      }),
    ]);
  });

  it("rejects missing paper, missing authorization, and terminated sessions", async () => {
    const missingPaperService = createMockExamService(
      createRepository({
        async findPublishedPaperByPublicId() {
          return null;
        },
      }),
      clock,
      createIdFactory(),
    );

    await expect(
      missingPaperService.startMockExam(userContext, {
        paperPublicId: "missing_paper",
      }),
    ).resolves.toEqual({
      code: 404311,
      message: "Mock exam paper does not exist.",
      data: null,
    });

    const unauthorizedService = createMockExamService(
      createRepository({
        async listEffectiveAuthorizationScopes() {
          return [];
        },
      }),
      clock,
      createIdFactory(),
    );

    await expect(
      unauthorizedService.getMockExam(userContext, "mock_exam_public_123"),
    ).resolves.toEqual({
      code: 404312,
      message: "Mock exam does not exist.",
      data: null,
    });

    const terminatedService = createMockExamService(
      createRepository({
        async findMockExamByPublicId() {
          return createMockExam({
            exam_status: "terminated",
          });
        },
      }),
      clock,
      createIdFactory(),
    );

    await expect(
      terminatedService.saveMockExamAnswer(
        userContext,
        "mock_exam_public_123",
        {
          paperQuestionPublicId: "paper_question_public_123",
          selectedLabels: ["A"],
        },
      ),
    ).resolves.toEqual({
      code: 409311,
      message: "Mock exam is not in progress.",
      data: null,
    });
  });

  it("saves answers without returning correctness, standard answer, or analysis", async () => {
    const answerInputs: unknown[] = [];
    const service = createMockExamService(
      createRepository({
        async saveMockExamAnswerRecord(input) {
          answerInputs.push(input);

          return {
            public_id: input.publicId,
            exam_mode: "mock_exam",
            paper_question_public_id: input.paperQuestionPublicId,
            question_public_id: input.questionPublicId,
            answer_snapshot: input.answerSnapshot,
            answer_record_status: "saved",
            is_correct: null,
            score: null,
            max_score: input.maxScore,
            answered_at: input.answeredAt,
            submitted_at: null,
          };
        },
      }),
      clock,
      createIdFactory(),
    );

    const response = await service.saveMockExamAnswer(
      userContext,
      "mock_exam_public_existing",
      {
        paperQuestionPublicId: "paper_question_public_123",
        selectedLabels: ["B"],
        savedFromClientAt: "2026-05-19T08:00:00.000Z",
      },
    );

    expect(response).toEqual({
      code: 0,
      message: "ok",
      data: {
        answerRecord: {
          publicId: "answer_record_public_1",
          examMode: "mock_exam",
          paperQuestionPublicId: "paper_question_public_123",
          questionPublicId: "question_public_123",
          answerSnapshot: {
            selectedLabels: ["B"],
            textAnswer: null,
            savedFromClientAt: "2026-05-19T08:00:00.000Z",
          },
          answerRecordStatus: "saved",
          isCorrect: null,
          score: null,
          maxScore: "1.0",
          answeredAt: "2026-05-19T08:00:00.000Z",
          submittedAt: null,
        },
      },
    });
    expect(JSON.stringify(response)).not.toContain("standardAnswerRichText");
    expect(JSON.stringify(response)).not.toContain("analysisRichText");
    expect(answerInputs).toEqual([
      expect.objectContaining({
        publicId: "answer_record_public_1",
        answerRecordStatus: "saved",
        isCorrect: null,
        score: null,
      }),
    ]);
  });

  it("submits mock_exam with objective scoring and unanswered count", async () => {
    const submitInputs: unknown[] = [];
    const service = createMockExamService(
      createRepository({
        async listMockExamAnswerRecords() {
          return [
            {
              public_id: "answer_record_public_123",
              exam_mode: "mock_exam",
              paper_question_public_id: "paper_question_public_123",
              question_public_id: "question_public_123",
              answer_snapshot: {
                selectedLabels: ["A"],
                textAnswer: null,
                savedFromClientAt: null,
              },
              answer_record_status: "saved",
              is_correct: null,
              score: null,
              max_score: "1.0",
              answered_at: now,
              submitted_at: null,
            },
          ];
        },
        async submitMockExam(input) {
          submitInputs.push(input);

          return createMockExam({
            public_id: input.publicId,
            exam_status: "completed",
            submitted_at: input.submittedAt,
            objective_score: input.objectiveScore,
            subjective_score: input.subjectiveScore,
            total_score: input.totalScore,
            answered_count: 1,
          });
        },
      }),
      clock,
      createIdFactory(),
    );

    await expect(
      service.submitMockExam(userContext, "mock_exam_public_existing", {}),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        mockExam: {
          examStatus: "completed",
        },
        unansweredCount: 1,
      },
    });
    expect(submitInputs).toEqual([
      expect.objectContaining({
        publicId: "mock_exam_public_existing",
        submittedAt: now,
        objectiveScore: "1.0",
        subjectiveScore: null,
        totalScore: "1.0",
        unansweredCount: 1,
      }),
    ]);
  });

  it("terminates mock_exam without scoring", async () => {
    const terminatedInputs: unknown[] = [];
    const service = createMockExamService(
      createRepository({
        async terminateMockExam(input) {
          terminatedInputs.push(input);

          return createMockExam({
            public_id: input.publicId,
            exam_status: "terminated",
            terminated_at: input.terminatedAt,
            termination_reason: input.terminationReason,
          });
        },
      }),
      clock,
      createIdFactory(),
    );

    await expect(
      service.terminateMockExam(userContext, "mock_exam_public_existing"),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        mockExam: {
          publicId: "mock_exam_public_existing",
          examStatus: "terminated",
        },
      },
    });
    expect(terminatedInputs).toEqual([
      {
        publicId: "mock_exam_public_existing",
        terminatedAt: now,
        terminationReason: "student_request",
      },
    ]);
  });
});

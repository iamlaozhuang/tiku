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
        exam_status: input.examStatus,
        submitted_at: input.submittedAt,
        objective_score: input.objectiveScore,
        subjective_score: input.subjectiveScore,
        total_score: input.totalScore,
      });
    },
    async applyMockExamScoringResults(input) {
      return createMockExam({
        public_id: input.publicId,
        exam_status: input.examStatus,
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
      code: 403313,
      message: "Mock exam authorization is invalid; session terminated.",
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
        answerRecordResults: [
          {
            paperQuestionPublicId: "paper_question_public_123",
            answerRecordStatus: "scored",
            isCorrect: true,
            score: "1.0",
            submittedAt: now,
          },
        ],
      }),
    ]);
  });

  it("submits subjective answers as pending scoring without exposing feedback", async () => {
    const submitInputs: unknown[] = [];
    const service = createMockExamService(
      createRepository({
        async listMockExamAnswerRecords() {
          return [
            {
              public_id: "answer_record_public_subjective",
              exam_mode: "mock_exam",
              paper_question_public_id: "paper_question_public_456",
              question_public_id: "question_public_456",
              answer_snapshot: {
                selectedLabels: [],
                textAnswer: "主观题作答",
                savedFromClientAt: null,
              },
              answer_record_status: "saved",
              is_correct: null,
              score: null,
              max_score: "5.0",
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

    const response = await service.submitMockExam(
      userContext,
      "mock_exam_public_existing",
      {},
    );

    expect(response).toMatchObject({
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
        objectiveScore: "0.0",
        subjectiveScore: null,
        totalScore: "0.0",
        unansweredCount: 1,
        answerRecordResults: [
          {
            paperQuestionPublicId: "paper_question_public_456",
            answerRecordStatus: "submitted",
            isCorrect: null,
            score: null,
            submittedAt: now,
          },
        ],
      }),
    ]);
  });

  it("scores submitted subjective answers with deterministic AI runtime", async () => {
    const submitInputs: unknown[] = [];
    const scoringContexts: unknown[] = [];
    const service = createMockExamService(
      createRepository({
        async listMockExamAnswerRecords() {
          return [
            {
              public_id: "answer_record_public_objective",
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
            {
              public_id: "answer_record_public_subjective",
              exam_mode: "mock_exam",
              paper_question_public_id: "paper_question_public_456",
              question_public_id: "question_public_456",
              answer_snapshot: {
                selectedLabels: [],
                textAnswer: "主观题作答",
                savedFromClientAt: null,
              },
              answer_record_status: "saved",
              is_correct: null,
              score: null,
              max_score: "5.0",
              answered_at: now,
              submitted_at: null,
            },
          ];
        },
        async submitMockExam(input) {
          submitInputs.push(input);

          return createMockExam({
            public_id: input.publicId,
            exam_status: input.examStatus,
            submitted_at: input.submittedAt,
            objective_score: input.objectiveScore,
            subjective_score: input.subjectiveScore,
            total_score: input.totalScore,
            answered_count: 2,
          });
        },
      }),
      clock,
      createIdFactory(),
      {
        aiScoringRuntime: {
          async scoreSubjectiveAnswer(context) {
            scoringContexts.push(context);

            return {
              answerRecordPublicId: context.answerRecordPublicId,
              scoringStatus: "scored",
              score: "4.5",
              maxScore: "5.0",
              scoringSnapshot: {
                promptTemplateKey: "dev_ai_scoring_v1",
                promptTemplateVersion: 1,
                scoringPoints: [],
                overallComment: "本地确定性评分完成。",
                improvementSuggestion: "补充法规依据。",
                citations: [],
                evidenceStatus: "none",
              },
              failureReason: null,
            };
          },
        },
      },
    );

    await expect(
      service.submitMockExam(userContext, "mock_exam_public_existing", {}),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        mockExam: {
          examStatus: "completed",
        },
        unansweredCount: 0,
      },
    });
    expect(scoringContexts).toEqual([
      expect.objectContaining({
        userPublicId: "user_public_123",
        mockExamPublicId: "mock_exam_public_existing",
        answerRecordPublicId: "answer_record_public_subjective",
        questionPublicId: "question_public_456",
        studentAnswer: "主观题作答",
        maxScore: "5.0",
      }),
    ]);
    expect(submitInputs).toEqual([
      expect.objectContaining({
        examStatus: "completed",
        objectiveScore: "1.0",
        subjectiveScore: "4.5",
        totalScore: "5.5",
        unansweredCount: 0,
        answerRecordResults: [
          expect.objectContaining({
            paperQuestionPublicId: "paper_question_public_123",
            answerRecordStatus: "scored",
            score: "1.0",
          }),
          expect.objectContaining({
            paperQuestionPublicId: "paper_question_public_456",
            answerRecordStatus: "scored",
            score: "4.5",
            aiScoringSnapshot: expect.objectContaining({
              promptTemplateKey: "dev_ai_scoring_v1",
            }),
          }),
        ],
      }),
    ]);
  });

  it("scores unanswered subjective questions as zero without invoking AI", async () => {
    const submitInputs: unknown[] = [];
    const scoringContexts: unknown[] = [];
    const service = createMockExamService(
      createRepository({
        async listMockExamAnswerRecords() {
          return [
            {
              public_id: "answer_record_public_objective",
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
            exam_status: input.examStatus,
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
      {
        aiScoringRuntime: {
          async scoreSubjectiveAnswer(context) {
            scoringContexts.push(context);
            throw new Error("unanswered subjective answer must not call AI");
          },
        },
      },
    );

    await service.submitMockExam(userContext, "mock_exam_public_existing", {});

    expect(scoringContexts).toEqual([]);
    expect(submitInputs).toEqual([
      expect.objectContaining({
        examStatus: "completed",
        objectiveScore: "1.0",
        subjectiveScore: "0.0",
        totalScore: "1.0",
        unansweredCount: 1,
      }),
    ]);
  });

  it("marks mock_exam as scoring_partial_failed when subjective AI scoring fails", async () => {
    const submitInputs: unknown[] = [];
    const service = createMockExamService(
      createRepository({
        async listMockExamAnswerRecords() {
          return [
            {
              public_id: "answer_record_public_subjective",
              exam_mode: "mock_exam",
              paper_question_public_id: "paper_question_public_456",
              question_public_id: "question_public_456",
              answer_snapshot: {
                selectedLabels: [],
                textAnswer: "主观题作答",
                savedFromClientAt: null,
              },
              answer_record_status: "saved",
              is_correct: null,
              score: null,
              max_score: "5.0",
              answered_at: now,
              submitted_at: null,
            },
          ];
        },
        async submitMockExam(input) {
          submitInputs.push(input);

          return createMockExam({
            public_id: input.publicId,
            exam_status: input.examStatus,
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
      {
        aiScoringRuntime: {
          async scoreSubjectiveAnswer(context) {
            return {
              answerRecordPublicId: context.answerRecordPublicId,
              scoringStatus: "scoring_failed",
              score: null,
              maxScore: "5.0",
              scoringSnapshot: null,
              failureReason: "scoring_runner_failed",
            };
          },
        },
      },
    );

    await expect(
      service.submitMockExam(userContext, "mock_exam_public_existing", {}),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        mockExam: {
          examStatus: "scoring_partial_failed",
        },
      },
    });
    expect(submitInputs).toEqual([
      expect.objectContaining({
        examStatus: "scoring_partial_failed",
        objectiveScore: "0.0",
        subjectiveScore: null,
        totalScore: "0.0",
        answerRecordResults: [
          expect.objectContaining({
            paperQuestionPublicId: "paper_question_public_456",
            answerRecordStatus: "scoring_failed",
            score: null,
            aiScoringSnapshot: expect.objectContaining({
              failureReason: "scoring_runner_failed",
            }),
          }),
        ],
      }),
    ]);
  });

  it("retries only failed subjective scoring records and preserves successful results", async () => {
    const retryInputs: unknown[] = [];
    const scoringContexts: unknown[] = [];
    const service = createMockExamService(
      createRepository({
        async findMockExamByPublicId() {
          return createMockExam({
            exam_status: "scoring_partial_failed",
            submitted_at: now,
            objective_score: "1.0",
            subjective_score: null,
            total_score: "1.0",
          });
        },
        async listMockExamAnswerRecords() {
          return [
            {
              public_id: "answer_record_public_scored",
              exam_mode: "mock_exam",
              paper_question_public_id: "paper_question_public_123",
              question_public_id: "question_public_123",
              answer_snapshot: {
                selectedLabels: ["A"],
                textAnswer: null,
                savedFromClientAt: null,
              },
              answer_record_status: "scored",
              is_correct: true,
              score: "1.0",
              max_score: "1.0",
              answered_at: now,
              submitted_at: now,
            },
            {
              public_id: "answer_record_public_failed",
              exam_mode: "mock_exam",
              paper_question_public_id: "paper_question_public_456",
              question_public_id: "question_public_456",
              answer_snapshot: {
                selectedLabels: [],
                textAnswer: "重试作答",
                savedFromClientAt: null,
              },
              answer_record_status: "scoring_failed",
              is_correct: null,
              score: null,
              max_score: "5.0",
              answered_at: now,
              submitted_at: now,
            },
          ];
        },
        async applyMockExamScoringResults(input) {
          retryInputs.push(input);

          return createMockExam({
            public_id: input.publicId,
            exam_status: input.examStatus,
            submitted_at: now,
            objective_score: input.objectiveScore,
            subjective_score: input.subjectiveScore,
            total_score: input.totalScore,
            answered_count: 2,
          });
        },
      }),
      clock,
      createIdFactory(),
      {
        aiScoringRuntime: {
          async scoreSubjectiveAnswer(context) {
            scoringContexts.push(context);

            return {
              answerRecordPublicId: context.answerRecordPublicId,
              scoringStatus: "scored",
              score: "3.5",
              maxScore: "5.0",
              scoringSnapshot: {
                promptTemplateKey: "dev_ai_scoring_v1",
                promptTemplateVersion: 1,
                scoringPoints: [],
                citations: [],
                evidenceStatus: "none",
              },
              failureReason: null,
            };
          },
        },
      },
    );

    await expect(
      service.retryMockExamScoring(userContext, "mock_exam_public_existing"),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        mockExam: {
          examStatus: "completed",
        },
      },
    });
    expect(scoringContexts).toEqual([
      expect.objectContaining({
        answerRecordPublicId: "answer_record_public_failed",
      }),
    ]);
    expect(retryInputs).toEqual([
      expect.objectContaining({
        examStatus: "completed",
        objectiveScore: "1.0",
        subjectiveScore: "3.5",
        totalScore: "4.5",
        answerRecordResults: [
          expect.objectContaining({
            paperQuestionPublicId: "paper_question_public_456",
            answerRecordStatus: "scored",
            score: "3.5",
          }),
        ],
      }),
    ]);
  });

  it("terminates in-progress mock_exam when authorization is expired or no longer effective", async () => {
    const startTerminationInputs: unknown[] = [];
    const startService = createMockExamService(
      createRepository({
        async listEffectiveAuthorizationScopes() {
          return [createScope({ expires_at: now })];
        },
        async findActiveMockExamByPaper() {
          return createMockExam({
            public_id: "mock_exam_public_scope_expired",
          });
        },
        async terminateMockExam(input) {
          startTerminationInputs.push(input);

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
      startService.startMockExam(userContext, {
        paperPublicId: "paper_public_123",
      }),
    ).resolves.toEqual({
      code: 403311,
      message: "Student authorization is not valid for this mock exam.",
      data: null,
    });
    expect(startTerminationInputs).toEqual([
      {
        publicId: "mock_exam_public_scope_expired",
        terminatedAt: now,
        terminationReason: "authorization_invalid",
      },
    ]);

    const readTerminationInputs: unknown[] = [];
    const readService = createMockExamService(
      createRepository({
        async listEffectiveAuthorizationScopes() {
          return [];
        },
        async terminateMockExam(input) {
          readTerminationInputs.push(input);

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
      readService.getMockExam(userContext, "mock_exam_public_existing"),
    ).resolves.toEqual({
      code: 403313,
      message: "Mock exam authorization is invalid; session terminated.",
      data: null,
    });
    expect(readTerminationInputs).toEqual([
      {
        publicId: "mock_exam_public_existing",
        terminatedAt: now,
        terminationReason: "authorization_invalid",
      },
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

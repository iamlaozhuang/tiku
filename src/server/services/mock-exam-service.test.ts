import { describe, expect, it } from "vitest";

import {
  createDeterministicMockExamAiScoringQueue,
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

function createPaperSnapshot(
  questionType = "short_answer",
): Record<string, unknown> {
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
            multiChoiceRule: "all_correct_only",
            scoringMethod: "auto_match",
          },
          {
            paperQuestionPublicId: "paper_question_public_456",
            questionPublicId: "question_public_456",
            questionType,
            stemRichText: "<p>主观题</p>",
            standardAnswerLabels: [],
            standardAnswerRichText: "<p>标准答案</p>",
            analysisRichText: "<p>解析</p>",
            score: "5.0",
            multiChoiceRule: "all_correct_only",
            scoringMethod: "ai_scoring",
            scoringPoints: [
              {
                scoringPointPublicId: "scoring_point_public_456",
                description: "主观题评分点",
                score: "5.0",
                sortOrder: 1,
              },
            ],
          },
        ],
      },
    ],
  };
}

function createNestedQuestionGroupPaperSnapshot(): Record<string, unknown> {
  const createQuestion = (index: number) => ({
    paperQuestionPublicId: `paper_question_group_${index}`,
    questionPublicId: `question_group_${index}`,
    questionType: "short_answer",
    stemRichText: `<p>材料子题 ${index}</p>`,
    standardAnswerLabels: [],
    standardAnswerRichText: "<p>标准答案</p>",
    analysisRichText: "<p>解析</p>",
    score: "5.0",
    multiChoiceRule: "all_correct_only",
    scoringMethod: "ai_scoring",
    scoringPoints: [
      {
        scoringPointPublicId: `scoring_point_group_${index}`,
        description: "评分点",
        score: "5.0",
        sortOrder: 1,
      },
    ],
  });

  return {
    snapshotVersion: 2,
    publicId: "paper_public_123",
    name: "2024年专卖三级技能材料题",
    durationMinute: 120,
    paperSections: [
      {
        publicId: "paper_section_public_123",
        title: "一、案例分析题",
        sortOrder: 1,
        paperQuestions: [],
        questionGroups: [
          {
            publicId: "qgroup_public_123",
            title: "客户异议处理案例",
            sortOrder: 1,
            totalScore: "10.0",
            materialSnapshot: {
              materialPublicId: "material_public_123",
              title: "客户异议材料",
            },
            paperQuestions: [createQuestion(1), createQuestion(2)],
          },
        ],
      },
    ],
  };
}

function createQuestionOptionsOnlyPaperSnapshot(): Record<string, unknown> {
  return {
    paperPublicId: "paper_public_123",
    name: "content-created-objective-paper",
    durationMinute: 120,
    paperSections: [
      {
        paperSectionTitle: "objective questions",
        paperQuestions: [
          {
            paperQuestionPublicId: "paper_question_options_only_123",
            questionPublicId: "question_options_only_123",
            questionType: "single_choice",
            stemRichText: "<p>content-created objective question</p>",
            questionOptions: [
              {
                label: "A",
                contentRichText: "<p>correct question_option</p>",
                isCorrect: true,
                sortOrder: 1,
              },
              {
                label: "B",
                contentRichText: "<p>distractor question_option</p>",
                isCorrect: false,
                sortOrder: 2,
              },
            ],
            standardAnswerRichText: "<p>A</p>",
            analysisRichText: "<p>analysis</p>",
            score: "5.0",
            multiChoiceRule: "all_correct_only",
            scoringMethod: "auto_match",
          },
        ],
      },
    ],
  };
}

function createEmptyPaperSnapshot(): Record<string, unknown> {
  return {
    paperPublicId: "paper_public_123",
    name: "empty_snapshot",
    durationMinute: 120,
    paperSections: [],
  };
}

function createPaperSnapshotWithQuestionCount(
  questionCount: number,
): Record<string, unknown> {
  return {
    paperPublicId: "paper_public_123",
    name: "count_boundary_paper",
    durationMinute: 120,
    paperSections: [
      {
        paperSectionTitle: "count boundary questions",
        paperQuestions: Array.from({ length: questionCount }, (_, index) => ({
          paperQuestionPublicId: `paper_question_public_${index + 1}`,
          questionPublicId: `question_public_${index + 1}`,
          questionType: "single_choice",
          standardAnswerLabels: ["A"],
          standardAnswerRichText: "<p>A</p>",
          analysisRichText: "<p>analysis</p>",
          score: "1.0",
          multiChoiceRule: "all_correct_only",
          scoringMethod: "auto_match",
        })),
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
        status: "saved",
        answerRecord: {
          public_id: input.publicId,
          exam_mode: "mock_exam",
          paper_question_public_id: input.paperQuestionPublicId,
          question_public_id: input.questionPublicId,
          answer_snapshot: input.answerSnapshot,
          answer_revision: input.expectedRevision + 1,
          client_operation_id: input.operationId,
          client_saved_at: input.answeredAt,
          answer_record_status: "saved",
          is_correct: null,
          score: null,
          max_score: input.maxScore,
          answered_at: input.answeredAt,
          submitted_at: null,
        },
      };
    },
    async listMockExamAnswerRecords() {
      return [];
    },
    async supplementMissingMockExamAnswers() {
      return null;
    },
    async rebuildExistingExamReport() {
      return null;
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
    async retryFailedAiScoringTasks() {
      return null;
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
  it("starts from a versioned snapshot whose questions are nested in one question_group", async () => {
    const nestedSnapshot = createNestedQuestionGroupPaperSnapshot();
    const service = createMockExamService(
      createRepository({
        async findPublishedPaperByPublicId() {
          return createPaper({ paper_snapshot: nestedSnapshot });
        },
        async createMockExam(input) {
          return createMockExam({
            public_id: input.publicId,
            paper_snapshot: input.paperSnapshot,
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
          questionCount: 2,
        },
      },
    });
  });

  it("supplements terminal answers through a missing-only transaction and durable scoring task", async () => {
    const supplementInputs: unknown[] = [];
    const rebuildInputs: unknown[] = [];
    const service = createMockExamService(
      createRepository({
        async findMockExamByPublicId() {
          return createMockExam({
            exam_status: "completed",
            submitted_at: serverDeadlineAt,
          });
        },
        async supplementMissingMockExamAnswers(input) {
          supplementInputs.push(input);

          return {
            mockExam: createMockExam({
              exam_status: "scoring",
              submitted_at: serverDeadlineAt,
              objective_score: "1.0",
              subjective_score: null,
              total_score: "1.0",
              answered_count: 2,
            }),
            answerRecords: input.answers.map((answer) => ({
              public_id: answer.publicId,
              exam_mode: "mock_exam" as const,
              paper_question_public_id: answer.paperQuestionPublicId,
              question_public_id: answer.questionPublicId,
              question_snapshot: answer.questionSnapshot,
              answer_snapshot: answer.answerSnapshot,
              answer_revision: 1,
              client_operation_id: answer.operationId,
              client_saved_at: answer.clientSavedAt,
              answer_record_status: answer.answerRecordStatus,
              is_correct: answer.isCorrect,
              score: answer.score,
              max_score: answer.maxScore,
              answered_at: input.supplementedAt,
              submitted_at: input.supplementedAt,
            })),
            supplementedCount: 2,
            skippedExistingCount: 0,
          };
        },
        async rebuildExistingExamReport(input) {
          rebuildInputs.push(input);
          return {
            publicId: "exam_report_public_123",
            reportRevision: 2,
          };
        },
      }),
      clock,
      createIdFactory(),
      {
        aiScoringTaskPreparer: {
          async prepareTask(context) {
            return {
              publicId: "ai_scoring_task_public_123",
              answerRecordPublicId: context.answerRecordPublicId,
              mockExamPublicId: context.mockExamPublicId,
              actorPublicId: context.userPublicId,
              idempotencyKeyHash: "hash_123",
              maxAttemptCount: 3,
              timeoutSecond: 60,
              modelConfigSnapshot: {},
              promptTemplateKey: "ai_scoring_v1",
              promptTemplateVersion: 1,
              promptTemplateHash: "prompt_hash_123",
              inputSnapshot: {},
              authorizationSnapshot: {},
              ragSnapshot: {},
              scheduledAt: now,
            };
          },
        },
      },
    );

    const response = await service.supplementMockExamAnswers(
      userContext,
      "mock_exam_public_existing",
      {
        answers: [
          {
            paperQuestionPublicId: "paper_question_public_123",
            selectedLabels: ["A"],
            textAnswer: null,
            operationId: "answer_operation_public_123",
            expectedRevision: 0,
            savedFromClientAt: "2026-05-19T08:05:00.000Z",
          },
          {
            paperQuestionPublicId: "paper_question_public_456",
            selectedLabels: [],
            textAnswer: "主观题离线答案",
            operationId: "answer_operation_public_456",
            expectedRevision: 0,
            savedFromClientAt: "2026-05-19T08:06:00.000Z",
          },
        ],
      },
    );

    expect(response).toMatchObject({
      code: 0,
      data: {
        mockExam: { examStatus: "scoring" },
        supplementedCount: 2,
        skippedExistingCount: 0,
        examReportPublicId: "exam_report_public_123",
        reportRevision: 2,
      },
    });
    expect(supplementInputs).toHaveLength(1);
    expect(supplementInputs).toEqual([
      expect.objectContaining({
        userPublicId: userContext.userPublicId,
        mockExamPublicId: "mock_exam_public_existing",
        answers: [
          expect.objectContaining({
            paperQuestionPublicId: "paper_question_public_123",
            answerRecordStatus: "scored",
            isCorrect: true,
            score: "1.0",
            aiScoringTask: null,
          }),
          expect.objectContaining({
            paperQuestionPublicId: "paper_question_public_456",
            answerRecordStatus: "submitted",
            isCorrect: null,
            score: null,
            aiScoringTask: expect.objectContaining({
              publicId: "ai_scoring_task_public_123",
            }),
          }),
        ],
      }),
    ]);
    expect(rebuildInputs).toEqual([
      expect.objectContaining({ hasChanges: true }),
    ]);
  });

  it("keeps a terminal supplement replay report revision stable", async () => {
    const rebuildInputs: unknown[] = [];
    const service = createMockExamService(
      createRepository({
        async findMockExamByPublicId() {
          return createMockExam({
            exam_status: "completed",
            submitted_at: serverDeadlineAt,
          });
        },
        async supplementMissingMockExamAnswers() {
          return {
            mockExam: createMockExam({
              exam_status: "completed",
              submitted_at: serverDeadlineAt,
              objective_score: "1.0",
              subjective_score: "0.0",
              total_score: "1.0",
              answered_count: 1,
            }),
            answerRecords: [],
            supplementedCount: 0,
            skippedExistingCount: 1,
          };
        },
        async rebuildExistingExamReport(input) {
          rebuildInputs.push(input);
          return {
            publicId: "exam_report_public_123",
            reportRevision: 2,
          };
        },
      }),
      clock,
      createIdFactory(),
    );

    const response = await service.supplementMockExamAnswers(
      userContext,
      "mock_exam_public_existing",
      {
        answers: [
          {
            paperQuestionPublicId: "paper_question_public_123",
            selectedLabels: ["A"],
            textAnswer: null,
            operationId: "answer_operation_public_123",
            expectedRevision: 0,
            savedFromClientAt: "2026-05-19T08:05:00.000Z",
          },
        ],
      },
    );

    expect(response).toMatchObject({
      code: 0,
      data: {
        supplementedCount: 0,
        skippedExistingCount: 1,
        examReportPublicId: "exam_report_public_123",
        reportRevision: 2,
      },
    });
    expect(rebuildInputs).toEqual([
      expect.objectContaining({ hasChanges: false }),
    ]);
  });

  it("rejects post-deadline terminal supplements before persistence", async () => {
    let supplementCalled = false;
    const service = createMockExamService(
      createRepository({
        async findMockExamByPublicId() {
          return createMockExam({
            exam_status: "completed",
            submitted_at: serverDeadlineAt,
          });
        },
        async supplementMissingMockExamAnswers() {
          supplementCalled = true;
          throw new Error("must not persist");
        },
      }),
      clock,
      createIdFactory(),
    );

    const response = await service.supplementMockExamAnswers(
      userContext,
      "mock_exam_public_existing",
      {
        answers: [
          {
            paperQuestionPublicId: "paper_question_public_123",
            selectedLabels: ["A"],
            textAnswer: null,
            operationId: "answer_operation_public_late",
            expectedRevision: 0,
            savedFromClientAt: "2026-05-19T10:00:00.001Z",
          },
        ],
      },
    );

    expect(response).toEqual({
      code: 422319,
      message: "Mock exam supplemental answer was saved after the deadline.",
      data: null,
    });
    expect(supplementCalled).toBe(false);
  });

  it("rejects terminal supplementation after an early manual submit", async () => {
    let supplementCalled = false;
    const service = createMockExamService(
      createRepository({
        async findMockExamByPublicId() {
          return createMockExam({
            exam_status: "completed",
            submitted_at: now,
          });
        },
        async supplementMissingMockExamAnswers() {
          supplementCalled = true;
          throw new Error("must not persist");
        },
      }),
      clock,
      createIdFactory(),
    );

    await expect(
      service.supplementMockExamAnswers(
        userContext,
        "mock_exam_public_existing",
        {
          answers: [
            {
              paperQuestionPublicId: "paper_question_public_123",
              selectedLabels: ["A"],
              operationId: "answer_operation_public_early_submit",
              expectedRevision: 0,
              savedFromClientAt: "2026-05-19T08:05:00.000Z",
            },
          ],
        },
      ),
    ).resolves.toEqual({
      code: 409317,
      message: "Mock exam does not allow terminal answer supplementation.",
      data: null,
    });
    expect(supplementCalled).toBe(false);
  });

  it("replays the authoritative terminal result for duplicate submit requests", async () => {
    let submitCalled = false;
    const service = createMockExamService(
      createRepository({
        async findMockExamByPublicId() {
          return createMockExam({
            exam_status: "completed",
            submitted_at: now,
            answered_count: 1,
          });
        },
        async submitMockExam() {
          submitCalled = true;
          return null;
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
        mockExam: { examStatus: "completed" },
        unansweredCount: 1,
      },
    });
    expect(submitCalled).toBe(false);
  });

  it("fails closed before start when the published snapshot scoring contract is invalid", async () => {
    const invalidSnapshot = structuredClone(createPaperSnapshot());
    const paperSections = invalidSnapshot.paperSections as Array<{
      paperQuestions: Array<Record<string, unknown>>;
    }>;
    paperSections[0].paperQuestions[1].scoringPoints = [];
    let createCalled = false;
    const service = createMockExamService(
      createRepository({
        async findPublishedPaperByPublicId() {
          return createPaper({ paper_snapshot: invalidSnapshot });
        },
        async createMockExam(input) {
          createCalled = true;
          return createMockExam({ public_id: input.publicId });
        },
      }),
      clock,
      createIdFactory(),
    );

    await expect(
      service.startMockExam(userContext, {
        paperPublicId: "paper_public_123",
      }),
    ).resolves.toEqual({
      code: 422317,
      message: "Mock exam paper scoring contract is invalid.",
      data: null,
    });
    expect(createCalled).toBe(false);
  });

  it.each([
    [
      "a question is missing its stable paper identity",
      (
        paperSections: Array<{
          paperQuestions: Array<Record<string, unknown>>;
        }>,
      ) => {
        delete paperSections[0].paperQuestions[0].paperQuestionPublicId;
      },
    ],
    [
      "an objective question contains a malformed scoring point",
      (
        paperSections: Array<{
          paperQuestions: Array<Record<string, unknown>>;
        }>,
      ) => {
        paperSections[0].paperQuestions[0].scoringPoints = [{}];
      },
    ],
    [
      "a subjective question contains an extra malformed scoring point",
      (
        paperSections: Array<{
          paperQuestions: Array<Record<string, unknown>>;
        }>,
      ) => {
        const scoringPoints = paperSections[0].paperQuestions[1]
          .scoringPoints as unknown[];
        scoringPoints.push({
          description: "missing stable identity",
          score: "1.0",
          sortOrder: 2,
        });
      },
    ],
  ])("fails closed before start when %s", async (_caseName, mutateSnapshot) => {
    const invalidSnapshot = structuredClone(createPaperSnapshot());
    const paperSections = invalidSnapshot.paperSections as Array<{
      paperQuestions: Array<Record<string, unknown>>;
    }>;
    mutateSnapshot(paperSections);
    let createCalled = false;
    const service = createMockExamService(
      createRepository({
        async findPublishedPaperByPublicId() {
          return createPaper({ paper_snapshot: invalidSnapshot });
        },
        async createMockExam() {
          createCalled = true;

          return createMockExam();
        },
      }),
      clock,
      createIdFactory(),
    );

    await expect(
      service.startMockExam(userContext, {
        paperPublicId: "paper_public_123",
      }),
    ).resolves.toEqual({
      code: 422317,
      message: "Mock exam paper scoring contract is invalid.",
      data: null,
    });
    expect(createCalled).toBe(false);
  });

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
        deadlineTaskPublicId: "mock_exam_deadline_task_public_2",
        userPublicId: "user_public_123",
        paperPublicId: "paper_public_123",
        startedAt: now,
        serverDeadlineAt,
        durationMinute: 120,
      }),
    ]);
  });

  it.each([
    ["empty", 0],
    ["oversized", 101],
  ])(
    "rejects %s published paper question count before starting mock_exam",
    async (_caseName, questionCount) => {
      const sideEffects: string[] = [];
      const service = createMockExamService(
        createRepository({
          async findPublishedPaperByPublicId() {
            return createPaper({
              paper_snapshot:
                createPaperSnapshotWithQuestionCount(questionCount),
            });
          },
          async listEffectiveAuthorizationScopes() {
            sideEffects.push("list_effective_authorization_scope");

            return [createScope()];
          },
          async findActiveMockExamByPaper() {
            sideEffects.push("find_active_mock_exam");

            return null;
          },
          async createMockExam(input) {
            sideEffects.push("create_mock_exam");

            return createMockExam({
              public_id: input.publicId,
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
      ).resolves.toEqual({
        code: 422316,
        message: "Mock exam paper question count is invalid.",
        data: null,
      });
      expect(sideEffects).toEqual([]);
    },
  );

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

  it("returns revisioned learner-safe answer state when resuming an active mock_exam", async () => {
    const service = createMockExamService(
      createRepository({
        async findActiveMockExamByPaper() {
          return createMockExam({ answered_count: 1 });
        },
        async listMockExamAnswerRecords() {
          return [
            {
              public_id: "answer_record_public_resume",
              exam_mode: "mock_exam",
              paper_question_public_id: "paper_question_public_123",
              question_public_id: "question_public_123",
              answer_snapshot: {
                selectedLabels: ["A"],
                textAnswer: null,
                savedFromClientAt: "2026-05-19T07:59:00.000Z",
              },
              answer_revision: 3,
              client_operation_id: "answer_operation_public_resume",
              client_saved_at: now,
              answer_record_status: "saved",
              is_correct: true,
              score: "2.0",
              max_score: "2.0",
              answered_at: now,
              submitted_at: null,
            },
          ];
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
        answerRecords: [
          {
            paperQuestionPublicId: "paper_question_public_123",
            answerRevision: 3,
            answerSnapshot: { selectedLabels: ["A"] },
            isCorrect: null,
            score: null,
          },
        ],
      },
    });
  });

  it("terminates an active mock_exam with an empty snapshot before creating a fresh mock_exam", async () => {
    const terminatedInputs: unknown[] = [];
    const createdInputs: unknown[] = [];
    const service = createMockExamService(
      createRepository({
        async findActiveMockExamByPaper() {
          return createMockExam({
            public_id: "mock_exam_public_empty_snapshot",
            paper_snapshot: createEmptyPaperSnapshot(),
          });
        },
        async terminateMockExam(input) {
          terminatedInputs.push(input);

          return createMockExam({
            public_id: input.publicId,
            exam_status: "terminated",
            terminated_at: input.terminatedAt,
            termination_reason: input.terminationReason,
          });
        },
        async createMockExam(input) {
          createdInputs.push(input);

          return createMockExam({
            public_id: input.publicId,
            paper_snapshot: input.paperSnapshot,
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
          questionCount: 2,
        },
      },
    });
    expect(terminatedInputs).toEqual([
      {
        publicId: "mock_exam_public_empty_snapshot",
        terminatedAt: now,
        terminationReason: "stale_empty_snapshot",
      },
    ]);
    expect(createdInputs).toEqual([
      expect.objectContaining({
        paperSnapshot: createPaperSnapshot(),
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
          operationId: "answer_operation_public_terminated",
          expectedRevision: 0,
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
            status: "saved",
            answerRecord: {
              public_id: input.publicId,
              exam_mode: "mock_exam",
              paper_question_public_id: input.paperQuestionPublicId,
              question_public_id: input.questionPublicId,
              answer_snapshot: input.answerSnapshot,
              answer_revision: input.expectedRevision + 1,
              client_operation_id: input.operationId,
              client_saved_at: input.answeredAt,
              answer_record_status: "saved",
              is_correct: null,
              score: null,
              max_score: input.maxScore,
              answered_at: input.answeredAt,
              submitted_at: null,
            },
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
        operationId: "answer_operation_public_1",
        expectedRevision: 0,
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
          answerRevision: 1,
          clientOperationId: "answer_operation_public_1",
          clientSavedAt: "2026-05-19T08:00:00.000Z",
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
        operationId: "answer_operation_public_1",
        expectedRevision: 0,
      }),
    ]);
  });

  it("rejects stale answer revisions while returning no teacher facts", async () => {
    const service = createMockExamService(
      createRepository({
        async saveMockExamAnswerRecord(input) {
          return {
            status: "stale",
            answerRecord: {
              public_id: "answer_record_public_existing",
              exam_mode: "mock_exam",
              paper_question_public_id: input.paperQuestionPublicId,
              question_public_id: input.questionPublicId,
              answer_snapshot: {
                selectedLabels: ["A"],
                textAnswer: null,
                savedFromClientAt: "2026-05-19T07:59:00.000Z",
              },
              answer_revision: 3,
              client_operation_id: "answer_operation_public_existing",
              client_saved_at: now,
              answer_record_status: "saved",
              is_correct: null,
              score: null,
              max_score: input.maxScore,
              answered_at: now,
              submitted_at: null,
            },
          };
        },
      }),
      clock,
      createIdFactory(),
    );

    await expect(
      service.saveMockExamAnswer(userContext, "mock_exam_public_existing", {
        paperQuestionPublicId: "paper_question_public_123",
        selectedLabels: ["B"],
        operationId: "answer_operation_public_stale",
        expectedRevision: 1,
        savedFromClientAt: "2026-05-19T08:00:00.000Z",
      }),
    ).resolves.toEqual({
      code: 409316,
      message: "Mock exam answer revision is stale.",
      data: null,
    });
  });

  it("rejects reuse of an operation id owned by another question", async () => {
    const service = createMockExamService(
      createRepository({
        async saveMockExamAnswerRecord() {
          return {
            status: "operation_conflict" as const,
            answerRecord: null,
          };
        },
      }),
      clock,
      createIdFactory(),
    );

    await expect(
      service.saveMockExamAnswer(userContext, "mock_exam_public_existing", {
        paperQuestionPublicId: "paper_question_public_123",
        selectedLabels: ["B"],
        operationId: "answer_operation_public_conflict",
        expectedRevision: 0,
        savedFromClientAt: "2026-05-19T08:00:00.000Z",
      }),
    ).resolves.toEqual({
      code: 409318,
      message: "Mock exam answer operation id conflicts with another question.",
      data: null,
    });
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
              answer_revision: 1,
              client_operation_id: null,
              client_saved_at: null,
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

  it("derives mock objective scoring from question options when standard labels are absent", async () => {
    const submitInputs: unknown[] = [];
    const service = createMockExamService(
      createRepository({
        async findMockExamByPublicId() {
          return createMockExam({
            paper_snapshot: createQuestionOptionsOnlyPaperSnapshot(),
          });
        },
        async listMockExamAnswerRecords() {
          return [
            {
              public_id: "answer_record_public_123",
              exam_mode: "mock_exam",
              paper_question_public_id: "paper_question_options_only_123",
              question_public_id: "question_options_only_123",
              answer_snapshot: {
                selectedLabels: ["A"],
                textAnswer: null,
                savedFromClientAt: null,
              },
              answer_revision: 1,
              client_operation_id: null,
              client_saved_at: null,
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
            paper_snapshot: createQuestionOptionsOnlyPaperSnapshot(),
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
        unansweredCount: 0,
      },
    });
    expect(submitInputs).toEqual([
      expect.objectContaining({
        objectiveScore: "5.0",
        totalScore: "5.0",
        answerRecordResults: [
          {
            paperQuestionPublicId: "paper_question_options_only_123",
            answerRecordStatus: "scored",
            isCorrect: true,
            score: "5.0",
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
              answer_revision: 1,
              client_operation_id: null,
              client_saved_at: null,
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
              answer_revision: 1,
              client_operation_id: null,
              client_saved_at: null,
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
              answer_revision: 1,
              client_operation_id: null,
              client_saved_at: null,
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
                promptTemplateKey: "ai_scoring_v1",
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
              promptTemplateKey: "ai_scoring_v1",
            }),
          }),
        ],
      }),
    ]);
  });

  it("queues subjective AI scoring and applies results after FIFO drain", async () => {
    const submitInputs: unknown[] = [];
    const scoringUpdateInputs: unknown[] = [];
    const scoringContexts: unknown[] = [];
    const aiScoringQueue = createDeterministicMockExamAiScoringQueue();
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
              answer_revision: 1,
              client_operation_id: null,
              client_saved_at: null,
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
                textAnswer: "queued subjective answer",
                savedFromClientAt: null,
              },
              answer_revision: 1,
              client_operation_id: null,
              client_saved_at: null,
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
        async applyMockExamScoringResults(input) {
          scoringUpdateInputs.push(input);

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
        aiScoringQueue,
        aiScoringRuntime: {
          async scoreSubjectiveAnswer(context) {
            scoringContexts.push(context);

            return {
              answerRecordPublicId: context.answerRecordPublicId,
              scoringStatus: "scored",
              score: "4.5",
              maxScore: "5.0",
              scoringSnapshot: {
                promptTemplateKey: "ai_scoring_v1",
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
      service.submitMockExam(userContext, "mock_exam_public_existing", {}),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        mockExam: {
          examStatus: "scoring",
        },
        unansweredCount: 0,
      },
    });
    expect(scoringContexts).toEqual([]);
    expect(aiScoringQueue.listPendingJobs()).toEqual([
      expect.objectContaining({
        mockExamPublicId: "mock_exam_public_existing",
        answerRecordPublicIds: ["answer_record_public_subjective"],
      }),
    ]);
    expect(submitInputs).toEqual([
      expect.objectContaining({
        examStatus: "scoring",
        objectiveScore: "1.0",
        subjectiveScore: null,
        totalScore: "1.0",
        answerRecordResults: [
          expect.objectContaining({
            paperQuestionPublicId: "paper_question_public_123",
            answerRecordStatus: "scored",
            score: "1.0",
          }),
          expect.objectContaining({
            paperQuestionPublicId: "paper_question_public_456",
            answerRecordStatus: "submitted",
            score: null,
          }),
        ],
      }),
    ]);

    await expect(aiScoringQueue.drainNext()).resolves.toMatchObject({
      status: "processed",
      mockExamPublicId: "mock_exam_public_existing",
    });

    expect(scoringContexts).toEqual([
      expect.objectContaining({
        answerRecordPublicId: "answer_record_public_subjective",
        studentAnswer: "queued subjective answer",
      }),
    ]);
    expect(scoringUpdateInputs).toEqual([
      expect.objectContaining({
        examStatus: "completed",
        objectiveScore: "1.0",
        subjectiveScore: "4.5",
        totalScore: "5.5",
        answerRecordResults: [
          expect.objectContaining({
            paperQuestionPublicId: "paper_question_public_456",
            answerRecordStatus: "scored",
            score: "4.5",
          }),
        ],
      }),
    ]);
  });

  it("persists prepared scoring tasks through the authoritative submit input", async () => {
    const submitInputs: unknown[] = [];
    const preparedContexts: unknown[] = [];
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
                textAnswer: "durable subjective answer",
                savedFromClientAt: null,
              },
              answer_revision: 1,
              client_operation_id: null,
              client_saved_at: null,
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
        aiScoringTaskPreparer: {
          async prepareTask(context) {
            preparedContexts.push(context);

            return {
              publicId: "ai_scoring_task_public_001",
              answerRecordPublicId: context.answerRecordPublicId,
              mockExamPublicId: context.mockExamPublicId,
              actorPublicId: context.userPublicId,
              idempotencyKeyHash: "a".repeat(64),
              maxAttemptCount: 3,
              timeoutSecond: 60,
              modelConfigSnapshot: {
                modelConfigPublicId: "model_config_public_001",
                executionMode: "governed_provider",
              },
              promptTemplateKey: "ai_scoring_v1",
              promptTemplateVersion: 3,
              promptTemplateHash: "sha256:prompt-v3",
              inputSnapshot: { studentAnswer: context.studentAnswer },
              authorizationSnapshot: {
                actorPublicId: context.userPublicId,
              },
              ragSnapshot: { evidenceStatus: "none" },
              scheduledAt: now,
            };
          },
        },
      },
    );

    await expect(
      service.submitMockExam(userContext, "mock_exam_public_existing", {}),
    ).resolves.toMatchObject({
      code: 0,
      data: { mockExam: { examStatus: "scoring" } },
    });
    expect(preparedContexts).toEqual([
      expect.objectContaining({
        answerRecordPublicId: "answer_record_public_subjective",
        studentAnswer: "durable subjective answer",
      }),
    ]);
    expect(submitInputs).toEqual([
      expect.objectContaining({
        examStatus: "scoring",
        aiScoringTasks: [
          expect.objectContaining({
            publicId: "ai_scoring_task_public_001",
            answerRecordPublicId: "answer_record_public_subjective",
            maxAttemptCount: 3,
            timeoutSecond: 60,
          }),
        ],
        answerRecordResults: [
          expect.objectContaining({
            paperQuestionPublicId: "paper_question_public_456",
            answerRecordStatus: "submitted",
            score: null,
          }),
        ],
      }),
    ]);
  });

  it("does not submit when governed scoring task preparation fails", async () => {
    let submitCalled = false;
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
                textAnswer: "subjective answer",
                savedFromClientAt: null,
              },
              answer_revision: 1,
              client_operation_id: null,
              client_saved_at: null,
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
          submitCalled = true;
          return createMockExam({ public_id: input.publicId });
        },
      }),
      clock,
      createIdFactory(),
      {
        aiScoringTaskPreparer: {
          async prepareTask() {
            throw new Error("governed model_config unavailable");
          },
        },
      },
    );

    await expect(
      service.submitMockExam(userContext, "mock_exam_public_existing", {}),
    ).resolves.toEqual({
      code: 503318,
      message: "AI scoring configuration is unavailable.",
      data: null,
    });
    expect(submitCalled).toBe(false);
  });

  it.each(["case_analysis", "calculation"] as const)(
    "preserves %s snapshots while sending text answers to AI scoring",
    async (questionType) => {
      const scoringContexts: unknown[] = [];
      const service = createMockExamService(
        createRepository({
          async findMockExamByPublicId(input) {
            return createMockExam({
              public_id: input.publicId,
              paper_snapshot: createPaperSnapshot(questionType),
            });
          },
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
                answer_revision: 1,
                client_operation_id: null,
                client_saved_at: null,
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
                  textAnswer: "Synthetic subjective answer.",
                  savedFromClientAt: null,
                },
                answer_revision: 1,
                client_operation_id: null,
                client_saved_at: null,
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
            return createMockExam({
              public_id: input.publicId,
              exam_status: input.examStatus,
              submitted_at: input.submittedAt,
              subjective_score: input.subjectiveScore,
              total_score: input.totalScore,
              paper_snapshot: createPaperSnapshot(questionType),
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

              return {
                answerRecordPublicId: context.answerRecordPublicId,
                scoringStatus: "scored",
                score: "4.0",
                maxScore: "5.0",
                scoringSnapshot: {
                  promptTemplateKey: "ai_scoring_v1",
                  promptTemplateVersion: 1,
                  scoringPoints: [],
                  overallComment: "Synthetic scoring completed.",
                  improvementSuggestion: "Synthetic improvement.",
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
          questionSnapshot: expect.objectContaining({
            questionType,
          }),
          answerSnapshot: expect.objectContaining({
            selectedLabels: [],
          }),
          studentAnswer: "Synthetic subjective answer.",
        }),
      ]);
    },
  );

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
              answer_revision: 1,
              client_operation_id: null,
              client_saved_at: null,
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
              answer_revision: 1,
              client_operation_id: null,
              client_saved_at: null,
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
              answer_revision: 1,
              client_operation_id: null,
              client_saved_at: null,
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
              answer_revision: 1,
              client_operation_id: null,
              client_saved_at: null,
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
                promptTemplateKey: "ai_scoring_v1",
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

  it("reschedules durable failed scoring tasks without invoking a Provider in the request", async () => {
    const retryInputs: unknown[] = [];
    const service = createMockExamService(
      createRepository({
        async findMockExamByPublicId() {
          return createMockExam({
            exam_status: "scoring_partial_failed",
            submitted_at: now,
          });
        },
        async retryFailedAiScoringTasks(input) {
          retryInputs.push(input);

          return {
            mockExam: createMockExam({
              exam_status: "scoring",
              submitted_at: now,
            }),
            retriedCount: 1,
            failedCount: 0,
          };
        },
      }),
      clock,
      createIdFactory(),
      {
        aiScoringTaskPreparer: {
          async prepareTask() {
            throw new Error("retry must not prepare a new task");
          },
        },
      },
    );

    await expect(
      service.retryMockExamScoring(userContext, "mock_exam_public_existing"),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        mockExam: { examStatus: "scoring" },
        retriedCount: 1,
        failedCount: 0,
      },
    });
    expect(retryInputs).toEqual([
      {
        userPublicId: userContext.userPublicId,
        mockExamPublicId: "mock_exam_public_existing",
        retriedAt: now,
      },
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

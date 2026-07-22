import { describe, expect, it } from "vitest";

import {
  createPracticeService,
  type PracticeClock,
  type PracticePublicIdFactory,
} from "./practice-service";
import type {
  PracticeAuthorizationScopeRow,
  PracticePaperRow,
  PracticeRepository,
  PracticeRow,
} from "../repositories/practice-repository";

const now = new Date("2026-05-19T08:00:00.000Z");
const expiresAt = new Date("2026-06-03T08:00:00.000Z");
const expiredAt = new Date("2026-05-18T08:00:00.000Z");

const userContext = {
  userPublicId: "user_public_123",
};

const clock: PracticeClock = {
  now() {
    return now;
  },
};

function createIdFactory(): PracticePublicIdFactory {
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
        ],
      },
    ],
  };
}

function createNestedQuestionGroupPaperSnapshot(): Record<string, unknown> {
  return {
    snapshotVersion: 2,
    publicId: "paper_public_123",
    name: "2024年专卖三级技能材料题",
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
            totalScore: "20.0",
            materialSnapshot: {
              materialPublicId: "material_public_123",
              title: "客户异议材料",
              contentRichText: "<p>客户连续反馈配送延迟。</p>",
            },
            paperQuestions: [
              {
                paperQuestionPublicId: "paper_question_group_1",
                questionPublicId: "question_group_1",
                questionType: "short_answer",
                stemRichText: "<p>说明沟通步骤。</p>",
                standardAnswerRichText: "<p>确认事实并反馈方案。</p>",
                analysisRichText: "<p>按事实、方案、跟进作答。</p>",
                score: "10.0",
                multiChoiceRule: "all_correct_only",
                scoringMethod: "ai_scoring",
              },
              {
                paperQuestionPublicId: "paper_question_group_2",
                questionPublicId: "question_group_2",
                questionType: "short_answer",
                stemRichText: "<p>说明复盘步骤。</p>",
                standardAnswerRichText: "<p>记录原因并形成改进项。</p>",
                analysisRichText: "<p>按原因、责任、改进作答。</p>",
                score: "10.0",
                multiChoiceRule: "all_correct_only",
                scoringMethod: "ai_scoring",
              },
            ],
          },
        ],
      },
    ],
  };
}

function createTwoQuestionPaperSnapshot(): Record<string, unknown> {
  return {
    paperPublicId: "paper_public_123",
    name: "2024年专卖三级理论真题",
    paperSections: [
      {
        paperSectionTitle: "一、选择题",
        paperQuestions: [
          {
            paperQuestionPublicId: "paper_question_public_123",
            questionPublicId: "question_public_123",
            questionType: "single_choice",
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
            questionType: "multi_choice",
            standardAnswerLabels: ["A", "B"],
            standardAnswerRichText: "<p>A、B</p>",
            analysisRichText: "<p>解析</p>",
            score: "3.0",
            multiChoiceRule: "partial_credit",
            scoringMethod: "auto_match",
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

function createFillBlankPaperSnapshot(): Record<string, unknown> {
  return {
    paperPublicId: "paper_public_123",
    name: "2024年专卖三级理论填空题",
    paperSections: [
      {
        paperSectionTitle: "二、填空题",
        paperQuestions: [
          {
            paperQuestionPublicId: "paper_question_fill_blank_123",
            questionPublicId: "question_fill_blank_123",
            questionType: "fill_blank",
            stemRichText: "<p>客户需求分析应先识别客户____。</p>",
            standardAnswerRichText: "<p>真实购买动机</p>",
            analysisRichText: "<p>先识别真实购买动机。</p>",
            score: "2.0",
            multiChoiceRule: "all_correct_only",
            scoringMethod: "auto_match",
          },
        ],
      },
    ],
  };
}

function createFillBlankPerBlankPaperSnapshot(): Record<string, unknown> {
  return {
    paperPublicId: "paper_public_123",
    name: "fill_blank_per_blank_paper",
    paperSections: [
      {
        paperSectionTitle: "二、填空题",
        paperQuestions: [
          {
            paperQuestionPublicId: "paper_question_fill_blank_123",
            questionPublicId: "question_fill_blank_123",
            questionType: "fill_blank",
            stemRichText: "<p>客户分析应识别___和___。</p>",
            standardAnswerRichText: "<p>客户动机；消费频率</p>",
            analysisRichText: "<p>逐空核对答案。</p>",
            score: "2.0",
            multiChoiceRule: "all_correct_only",
            scoringMethod: "auto_match",
            fillBlankAnswers: [
              {
                blankKey: "blank_1",
                standardAnswers: ["客户动机", "购买动机"],
                score: "1.0",
                sortOrder: 1,
              },
              {
                blankKey: "blank_2",
                standardAnswers: ["消费频率"],
                score: "1.0",
                sortOrder: 2,
              },
            ],
          },
        ],
      },
    ],
  };
}

function createSubjectivePaperSnapshot(
  questionType = "short_answer",
): Record<string, unknown> {
  return {
    paperPublicId: "paper_public_123",
    name: "2024年专卖三级技能案例",
    paperSections: [
      {
        paperSectionTitle: "一、案例分析题",
        paperQuestions: [
          {
            paperQuestionPublicId: "paper_question_subjective_123",
            questionPublicId: "question_subjective_123",
            questionType,
            stemRichText: "<p>请说明检查处置步骤。</p>",
            standardAnswerRichText: "<p>先核验事实，再依法处置并跟进闭环。</p>",
            analysisRichText: "<p>按事实、依据、处置、复盘展开。</p>",
            scoringPoints: [
              {
                scoringPointPublicId: "scoring_point_public_1",
                description: "事实核验",
                score: "10.0",
                sortOrder: 1,
              },
            ],
            score: "10.0",
            multiChoiceRule: "all_correct_only",
            scoringMethod: "ai_scoring",
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
    paperSections: [],
  };
}

function createPaperSnapshotWithQuestionCount(
  questionCount: number,
): Record<string, unknown> {
  return {
    paperPublicId: "paper_public_123",
    name: "count_boundary_paper",
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
  overrides: Partial<PracticeAuthorizationScopeRow> = {},
): PracticeAuthorizationScopeRow {
  return {
    profession: "monopoly",
    level: 3,
    authorization_types: ["personal_auth"],
    expires_at: expiresAt,
    ...overrides,
  };
}

function createPaper(
  overrides: Partial<PracticePaperRow> = {},
): PracticePaperRow {
  return {
    public_id: "paper_public_123",
    profession: "monopoly",
    level: 3,
    subject: "theory",
    paper_snapshot: createPaperSnapshot(),
    ...overrides,
  };
}

function createPractice(overrides: Partial<PracticeRow> = {}): PracticeRow {
  return {
    id: 1001,
    public_id: "practice_public_existing",
    paper_public_id: "paper_public_123",
    profession: "monopoly",
    level: 3,
    subject: "theory",
    practice_status: "in_progress",
    started_at: now,
    last_answered_at: null,
    expires_at: expiresAt,
    paper_snapshot: createPaperSnapshot(),
    ...overrides,
  };
}

function createRepository(
  overrides: Partial<PracticeRepository> = {},
): PracticeRepository {
  return {
    async listEffectiveAuthorizationScopes() {
      return [createScope()];
    },
    async findPublishedPaperByPublicId() {
      return createPaper();
    },
    async findActivePracticeByPaper() {
      return null;
    },
    async findPracticeByPublicId() {
      return createPractice();
    },
    async createPractice(input) {
      return createPractice({
        public_id: input.publicId,
        paper_public_id: input.paperPublicId,
        paper_snapshot: input.paperSnapshot,
        profession: input.profession,
        level: input.level,
        subject: input.subject,
        started_at: input.startedAt,
        expires_at: input.expiresAt,
      });
    },
    async expirePractice() {},
    async terminatePractice(input) {
      return createPractice({
        public_id: input.publicId,
        practice_status: "terminated",
      });
    },
    async findAnswerRecordByPracticeAndQuestion() {
      return null;
    },
    async listAnswerRecordsByPractice() {
      return [];
    },
    async createPracticeAnswerRecord(input) {
      return {
        public_id: input.publicId,
        exam_mode: "practice",
        paper_question_public_id: input.paperQuestionPublicId,
        question_public_id: input.questionPublicId,
        answer_snapshot: input.answerSnapshot,
        answer_record_status: input.answerRecordStatus,
        is_correct: input.isCorrect,
        score: input.score,
        max_score: input.maxScore,
        answered_at: input.answeredAt,
        submitted_at: input.submittedAt,
      };
    },
    async updatePracticeLastAnsweredAt() {},
    async upsertMistakeBookFromWrongAnswer(input) {
      return {
        public_id: input.publicId,
      };
    },
    async upsertMistakeBookFromFavorite(input) {
      return {
        public_id: input.publicId,
      };
    },
    ...overrides,
  };
}

describe("practice service", () => {
  it("starts from a versioned snapshot whose questions are nested in one question_group", async () => {
    const nestedSnapshot = createNestedQuestionGroupPaperSnapshot();
    const createdSnapshots: Record<string, unknown>[] = [];
    const service = createPracticeService(
      createRepository({
        async findPublishedPaperByPublicId() {
          return createPaper({ paper_snapshot: nestedSnapshot });
        },
        async createPractice(input) {
          createdSnapshots.push(input.paperSnapshot);

          return createPractice({
            public_id: input.publicId,
            paper_snapshot: input.paperSnapshot,
          });
        },
      }),
      clock,
      createIdFactory(),
    );

    await expect(
      service.startPractice(userContext, {
        paperPublicId: "paper_public_123",
      }),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        practice: {
          questionCount: 2,
        },
      },
    });
    expect(createdSnapshots).toEqual([nestedSnapshot]);
  });

  it("starts a new authorized practice with a 15 day expiry", async () => {
    const createdInputs: unknown[] = [];
    const service = createPracticeService(
      createRepository({
        async createPractice(input) {
          createdInputs.push(input);

          return createPractice({
            public_id: input.publicId,
            started_at: input.startedAt,
            expires_at: input.expiresAt,
          });
        },
      }),
      clock,
      createIdFactory(),
    );

    await expect(
      service.startPractice(userContext, {
        paperPublicId: "paper_public_123",
      }),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        practice: {
          publicId: "practice_public_1",
          paperPublicId: "paper_public_123",
          practiceStatus: "in_progress",
          questionCount: 1,
        },
      },
    });
    expect(createdInputs).toEqual([
      expect.objectContaining({
        publicId: "practice_public_1",
        userPublicId: "user_public_123",
        paperPublicId: "paper_public_123",
        startedAt: now,
        expiresAt,
      }),
    ]);
  });

  it("deduplicates concurrent start requests for the same user and paper", async () => {
    const createdInputs: unknown[] = [];
    const service = createPracticeService(
      createRepository({
        async findActivePracticeByPaper() {
          return null;
        },
        async createPractice(input) {
          createdInputs.push(input);
          await Promise.resolve();

          return createPractice({
            public_id: input.publicId,
            paper_public_id: input.paperPublicId,
            paper_snapshot: input.paperSnapshot,
            profession: input.profession,
            level: input.level,
            subject: input.subject,
            started_at: input.startedAt,
            expires_at: input.expiresAt,
          });
        },
      }),
      clock,
      createIdFactory(),
    );

    const [firstResult, secondResult] = await Promise.all([
      service.startPractice(userContext, {
        paperPublicId: "paper_public_123",
      }),
      service.startPractice(userContext, {
        paperPublicId: "paper_public_123",
      }),
    ]);

    expect(createdInputs).toHaveLength(1);
    expect(firstResult).toMatchObject({
      code: 0,
      data: {
        practice: {
          publicId: "practice_public_1",
        },
      },
    });
    expect(secondResult).toMatchObject({
      code: 0,
      data: {
        practice: {
          publicId: "practice_public_1",
        },
      },
    });
  });

  it.each([
    ["empty", 0],
    ["oversized", 101],
  ])(
    "rejects %s published paper question count before starting practice",
    async (_caseName, questionCount) => {
      const sideEffects: string[] = [];
      const service = createPracticeService(
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
          async findActivePracticeByPaper() {
            sideEffects.push("find_active_practice");

            return null;
          },
          async createPractice(input) {
            sideEffects.push("create_practice");

            return createPractice({
              public_id: input.publicId,
            });
          },
        }),
        clock,
        createIdFactory(),
      );

      await expect(
        service.startPractice(userContext, {
          paperPublicId: "paper_public_123",
        }),
      ).resolves.toEqual({
        code: 422305,
        message: "Practice paper question count is invalid.",
        data: null,
      });
      expect(sideEffects).toEqual([]);
    },
  );

  it("fails closed before start when a published question has a non-positive score", async () => {
    const invalidSnapshot = structuredClone(createPaperSnapshot());
    const paperSections = invalidSnapshot.paperSections as Array<{
      paperQuestions: Array<Record<string, unknown>>;
    }>;
    paperSections[0].paperQuestions[0].score = "0.0";
    let createCalled = false;
    const service = createPracticeService(
      createRepository({
        async findPublishedPaperByPublicId() {
          return createPaper({ paper_snapshot: invalidSnapshot });
        },
        async createPractice() {
          createCalled = true;

          return createPractice();
        },
      }),
      clock,
      createIdFactory(),
    );

    await expect(
      service.startPractice(userContext, {
        paperPublicId: "paper_public_123",
      }),
    ).resolves.toEqual({
      code: 422306,
      message: "Practice paper scoring contract is invalid.",
      data: null,
    });
    expect(createCalled).toBe(false);
  });

  it("fails closed before start when a published question identity is missing", async () => {
    const invalidSnapshot = structuredClone(createPaperSnapshot());
    const paperSections = invalidSnapshot.paperSections as Array<{
      paperQuestions: Array<Record<string, unknown>>;
    }>;
    delete paperSections[0].paperQuestions[0].questionPublicId;
    let createCalled = false;
    const service = createPracticeService(
      createRepository({
        async findPublishedPaperByPublicId() {
          return createPaper({ paper_snapshot: invalidSnapshot });
        },
        async createPractice() {
          createCalled = true;

          return createPractice();
        },
      }),
      clock,
      createIdFactory(),
    );

    await expect(
      service.startPractice(userContext, {
        paperPublicId: "paper_public_123",
      }),
    ).resolves.toEqual({
      code: 422306,
      message: "Practice paper scoring contract is invalid.",
      data: null,
    });
    expect(createCalled).toBe(false);
  });

  it("resumes an existing active practice and expires stale progress before restarting", async () => {
    const resumedService = createPracticeService(
      createRepository({
        async findActivePracticeByPaper() {
          return createPractice();
        },
      }),
      clock,
      createIdFactory(),
    );

    await expect(
      resumedService.startPractice(userContext, {
        paperPublicId: "paper_public_123",
      }),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        practice: {
          publicId: "practice_public_existing",
        },
      },
    });

    const expiredInputs: unknown[] = [];
    const restartedService = createPracticeService(
      createRepository({
        async findActivePracticeByPaper() {
          return createPractice({
            public_id: "practice_public_expired",
            expires_at: expiredAt,
          });
        },
        async expirePractice(input) {
          expiredInputs.push(input);
        },
      }),
      clock,
      createIdFactory(),
    );

    await expect(
      restartedService.startPractice(userContext, {
        paperPublicId: "paper_public_123",
      }),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        practice: {
          publicId: "practice_public_1",
        },
      },
    });
    expect(expiredInputs).toEqual([
      {
        publicId: "practice_public_expired",
        expiredAt: now,
      },
    ]);
  });

  it("expires an active practice with an empty snapshot before creating a fresh practice", async () => {
    const expiredInputs: unknown[] = [];
    const createdInputs: unknown[] = [];
    const service = createPracticeService(
      createRepository({
        async findActivePracticeByPaper() {
          return createPractice({
            public_id: "practice_public_empty_snapshot",
            paper_snapshot: createEmptyPaperSnapshot(),
          });
        },
        async expirePractice(input) {
          expiredInputs.push(input);
        },
        async createPractice(input) {
          createdInputs.push(input);

          return createPractice({
            public_id: input.publicId,
            paper_snapshot: input.paperSnapshot,
          });
        },
      }),
      clock,
      createIdFactory(),
    );

    await expect(
      service.startPractice(userContext, {
        paperPublicId: "paper_public_123",
      }),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        practice: {
          publicId: "practice_public_1",
          questionCount: 1,
        },
      },
    });
    expect(expiredInputs).toEqual([
      {
        publicId: "practice_public_empty_snapshot",
        expiredAt: now,
      },
    ]);
    expect(createdInputs).toEqual([
      expect.objectContaining({
        paperSnapshot: createPaperSnapshot(),
      }),
    ]);
  });

  it("rejects missing paper, missing authorization, expired practice, and duplicate objective answers", async () => {
    const missingPaperService = createPracticeService(
      createRepository({
        async findPublishedPaperByPublicId() {
          return null;
        },
      }),
      clock,
      createIdFactory(),
    );

    await expect(
      missingPaperService.startPractice(userContext, {
        paperPublicId: "missing_paper",
      }),
    ).resolves.toEqual({
      code: 404301,
      message: "Practice paper does not exist.",
      data: null,
    });

    const unauthorizedService = createPracticeService(
      createRepository({
        async listEffectiveAuthorizationScopes() {
          return [];
        },
      }),
      clock,
      createIdFactory(),
    );

    await expect(
      unauthorizedService.getPractice(userContext, "practice_public_123"),
    ).resolves.toEqual({
      code: 403303,
      message: "Practice authorization is invalid; progress terminated.",
      data: null,
    });

    const expiredService = createPracticeService(
      createRepository({
        async findPracticeByPublicId() {
          return createPractice({
            expires_at: expiredAt,
          });
        },
      }),
      clock,
      createIdFactory(),
    );

    await expect(
      expiredService.getPractice(userContext, "practice_public_123"),
    ).resolves.toEqual({
      code: 404302,
      message: "Practice does not exist.",
      data: null,
    });

    const duplicateService = createPracticeService(
      createRepository({
        async findAnswerRecordByPracticeAndQuestion() {
          return {
            public_id: "answer_record_public_existing",
            exam_mode: "practice",
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
          };
        },
      }),
      clock,
      createIdFactory(),
    );

    await expect(
      duplicateService.submitPracticeAnswer(
        userContext,
        "practice_public_123",
        {
          paperQuestionPublicId: "paper_question_public_123",
          selectedLabels: ["A"],
        },
      ),
    ).resolves.toEqual({
      code: 409301,
      message: "Practice objective question has already been answered.",
      data: null,
    });
  });

  it("terminates in-progress practice when authorization is expired or no longer effective", async () => {
    const startTerminationInputs: unknown[] = [];
    const startService = createPracticeService(
      createRepository({
        async listEffectiveAuthorizationScopes() {
          return [createScope({ expires_at: now })];
        },
        async findActivePracticeByPaper() {
          return createPractice({
            public_id: "practice_public_scope_expired",
          });
        },
        async terminatePractice(input) {
          startTerminationInputs.push(input);

          return createPractice({
            public_id: input.publicId,
            practice_status: "terminated",
          });
        },
      }),
      clock,
      createIdFactory(),
    );

    await expect(
      startService.startPractice(userContext, {
        paperPublicId: "paper_public_123",
      }),
    ).resolves.toEqual({
      code: 403301,
      message: "Student authorization is not valid for this practice.",
      data: null,
    });
    expect(startTerminationInputs).toEqual([
      {
        publicId: "practice_public_scope_expired",
        terminatedAt: now,
        terminationReason: "authorization_invalid",
      },
    ]);

    const readTerminationInputs: unknown[] = [];
    const readService = createPracticeService(
      createRepository({
        async listEffectiveAuthorizationScopes() {
          return [];
        },
        async terminatePractice(input) {
          readTerminationInputs.push(input);

          return createPractice({
            public_id: input.publicId,
            practice_status: "terminated",
          });
        },
      }),
      clock,
      createIdFactory(),
    );

    await expect(
      readService.getPractice(userContext, "practice_public_existing"),
    ).resolves.toEqual({
      code: 403303,
      message: "Practice authorization is invalid; progress terminated.",
      data: null,
    });
    expect(readTerminationInputs).toEqual([
      {
        publicId: "practice_public_existing",
        terminatedAt: now,
        terminationReason: "authorization_invalid",
      },
    ]);
  });

  it("submits objective answer feedback and updates mistake book for wrong answers", async () => {
    const answerInputs: unknown[] = [];
    const mistakeBookInputs: unknown[] = [];
    const service = createPracticeService(
      createRepository({
        async createPracticeAnswerRecord(input) {
          answerInputs.push(input);

          return {
            public_id: input.publicId,
            exam_mode: "practice",
            paper_question_public_id: input.paperQuestionPublicId,
            question_public_id: input.questionPublicId,
            answer_snapshot: input.answerSnapshot,
            answer_record_status: input.answerRecordStatus,
            is_correct: input.isCorrect,
            score: input.score,
            max_score: input.maxScore,
            answered_at: input.answeredAt,
            submitted_at: input.submittedAt,
          };
        },
        async upsertMistakeBookFromWrongAnswer(input) {
          mistakeBookInputs.push(input);

          return {
            public_id: "mistake_book_public_2",
          };
        },
      }),
      clock,
      createIdFactory(),
    );

    await expect(
      service.submitPracticeAnswer(userContext, "practice_public_123", {
        paperQuestionPublicId: "paper_question_public_123",
        selectedLabels: ["B"],
        savedFromClientAt: "2026-05-19T08:00:00.000Z",
      }),
    ).resolves.toEqual({
      code: 0,
      message: "ok",
      data: {
        feedback: {
          answerRecordPublicId: "answer_record_public_1",
          isCorrect: false,
          score: "0.0",
          maxScore: "1.0",
          standardAnswerRichText: "<p>A</p>",
          analysisRichText: "<p>解析</p>",
          mistakeBookPublicId: "mistake_book_public_2",
          aiExplanationStatus: "unavailable",
          aiExplanationText: null,
          aiExplanationLearningSuggestion: null,
          aiExplanationEvidenceStatus: null,
          aiExplanationCitations: [],
          aiHintStatus: null,
          aiHintText: null,
          aiHintImprovementDirections: [],
          aiHintEvidenceStatus: null,
          aiHintCitations: [],
          retryRemainingCount: 0,
          answeredAt: "2026-05-19T08:00:00.000Z",
        },
      },
    });
    expect(answerInputs).toEqual([
      expect.objectContaining({
        publicId: "answer_record_public_1",
        isCorrect: false,
        score: "0.0",
        maxScore: "1.0",
        answerRecordStatus: "scored",
      }),
    ]);
    expect(mistakeBookInputs).toEqual([
      expect.objectContaining({
        publicId: "mistake_book_public_2",
        questionPublicId: "question_public_123",
        paperQuestionPublicId: "paper_question_public_123",
      }),
    ]);
  });

  it("keeps teacher analysis separate and rejects unavailable AI explanation", async () => {
    const answerInputs: unknown[] = [];
    const service = createPracticeService(
      createRepository({
        async createPracticeAnswerRecord(input) {
          answerInputs.push(input);

          return {
            public_id: input.publicId,
            exam_mode: "practice",
            paper_question_public_id: input.paperQuestionPublicId,
            question_public_id: input.questionPublicId,
            answer_snapshot: input.answerSnapshot,
            answer_record_status: input.answerRecordStatus,
            is_correct: input.isCorrect,
            score: input.score,
            max_score: input.maxScore,
            answered_at: input.answeredAt,
            submitted_at: input.submittedAt,
          };
        },
      }),
      clock,
      createIdFactory(),
    );

    await expect(
      service.submitPracticeAnswer(userContext, "practice_public_123", {
        paperQuestionPublicId: "paper_question_public_123",
        selectedLabels: ["A"],
        savedFromClientAt: "2026-05-19T08:00:00.000Z",
      }),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        feedback: {
          isCorrect: true,
          aiExplanationStatus: "unavailable",
          aiExplanationText: null,
        },
      },
    });
    expect(answerInputs).toHaveLength(1);

    const manualService = createPracticeService(
      createRepository({
        async findAnswerRecordByPracticeAndQuestion() {
          return {
            public_id: "answer_record_public_existing",
            exam_mode: "practice",
            paper_question_public_id: "paper_question_public_123",
            question_public_id: "question_public_123",
            answer_snapshot: {
              selectedLabels: ["A"],
              textAnswer: null,
              savedFromClientAt: "2026-05-19T08:00:00.000Z",
            },
            answer_record_status: "scored",
            is_correct: true,
            score: "1.0",
            max_score: "1.0",
            answered_at: now,
            submitted_at: now,
          };
        },
        async createPracticeAnswerRecord() {
          throw new Error("manual ai_explanation must not create an answer");
        },
      }),
      clock,
      createIdFactory(),
    );

    await expect(
      manualService.submitPracticeAnswer(userContext, "practice_public_123", {
        paperQuestionPublicId: "paper_question_public_123",
        selectedLabels: ["A"],
        aiExplanationTrigger: "manual_request",
        savedFromClientAt: "2026-05-19T08:00:00.000Z",
      }),
    ).resolves.toEqual({
      code: 503303,
      message: "Practice AI explanation is not configured.",
      data: null,
    });
  });

  it("favorites an arbitrary objective practice question without submitting an answer", async () => {
    const favoriteInputs: unknown[] = [];
    const service = createPracticeService(
      createRepository({
        async upsertMistakeBookFromFavorite(input) {
          favoriteInputs.push(input);

          return {
            public_id: "mistake_book_public_favorite",
          };
        },
      }),
      clock,
      createIdFactory(),
    );

    await expect(
      service.favoritePracticeQuestion(userContext, "practice_public_123", {
        paperQuestionPublicId: "paper_question_public_123",
      }),
    ).resolves.toEqual({
      code: 0,
      message: "ok",
      data: {
        mistakeBookPublicId: "mistake_book_public_favorite",
      },
    });
    expect(favoriteInputs).toEqual([
      expect.objectContaining({
        publicId: "mistake_book_public_1",
        userPublicId: "user_public_123",
        questionPublicId: "question_public_123",
        paperQuestionPublicId: "paper_question_public_123",
        latestAnswerSnapshot: {
          selectedLabels: [],
          textAnswer: null,
          savedFromClientAt: null,
        },
        favoritedAt: now,
      }),
    ]);
  });

  it("rejects manual favorite for subjective practice questions", async () => {
    const favoriteInputs: unknown[] = [];
    const service = createPracticeService(
      createRepository({
        async findPracticeByPublicId() {
          return createPractice({
            subject: "skill",
            paper_snapshot: createSubjectivePaperSnapshot(),
          });
        },
        async upsertMistakeBookFromFavorite(input) {
          favoriteInputs.push(input);

          return {
            public_id: input.publicId,
          };
        },
      }),
      clock,
      createIdFactory(),
    );

    await expect(
      service.favoritePracticeQuestion(userContext, "practice_public_123", {
        paperQuestionPublicId: "paper_question_subjective_123",
      }),
    ).resolves.toEqual({
      code: 422304,
      message: "Practice question cannot be added to mistake book.",
      data: null,
    });
    expect(favoriteInputs).toEqual([]);
  });

  it("derives objective feedback correctness from question options when standard labels are absent", async () => {
    const service = createPracticeService(
      createRepository({
        async findPracticeByPublicId() {
          return createPractice({
            paper_snapshot: createQuestionOptionsOnlyPaperSnapshot(),
          });
        },
      }),
      clock,
      createIdFactory(),
    );

    await expect(
      service.submitPracticeAnswer(userContext, "practice_public_123", {
        paperQuestionPublicId: "paper_question_options_only_123",
        selectedLabels: ["A"],
      }),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        feedback: {
          answerRecordPublicId: "answer_record_public_1",
          isCorrect: true,
          score: "5.0",
          maxScore: "5.0",
          mistakeBookPublicId: null,
        },
      },
    });
  });

  it("returns saved answer records for practice resume progress", async () => {
    const service = createPracticeService(
      createRepository({
        async findPracticeByPublicId() {
          return createPractice({
            paper_snapshot: createTwoQuestionPaperSnapshot(),
          });
        },
        async listAnswerRecordsByPractice() {
          return [
            {
              public_id: "answer_record_public_existing",
              exam_mode: "practice",
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
          ];
        },
      } as Partial<PracticeRepository>),
      clock,
      createIdFactory(),
    );

    await expect(
      service.getPractice(userContext, "practice_public_existing"),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        practice: {
          currentQuestionIndex: 1,
          questionCount: 2,
        },
        answerRecords: [
          {
            publicId: "answer_record_public_existing",
            paperQuestionPublicId: "paper_question_public_123",
            isCorrect: true,
          },
        ],
      },
    });
  });

  it("applies partial credit to multiple-choice answers without marking them fully correct", async () => {
    const mistakeBookInputs: unknown[] = [];
    const service = createPracticeService(
      createRepository({
        async findPracticeByPublicId() {
          return createPractice({
            paper_snapshot: createTwoQuestionPaperSnapshot(),
          });
        },
        async createPracticeAnswerRecord(input) {
          return {
            public_id: input.publicId,
            exam_mode: "practice",
            paper_question_public_id: input.paperQuestionPublicId,
            question_public_id: input.questionPublicId,
            answer_snapshot: input.answerSnapshot,
            answer_record_status: input.answerRecordStatus,
            is_correct: input.isCorrect,
            score: input.score,
            max_score: input.maxScore,
            answered_at: input.answeredAt,
            submitted_at: input.submittedAt,
          };
        },
        async upsertMistakeBookFromWrongAnswer(input) {
          mistakeBookInputs.push(input);

          return {
            public_id: input.publicId,
          };
        },
      }),
      clock,
      createIdFactory(),
    );

    await expect(
      service.submitPracticeAnswer(userContext, "practice_public_123", {
        paperQuestionPublicId: "paper_question_public_456",
        selectedLabels: ["A"],
      }),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        feedback: {
          isCorrect: false,
          score: "1.5",
          maxScore: "3.0",
          mistakeBookPublicId: "mistake_book_public_2",
        },
      },
    });
    expect(mistakeBookInputs).toHaveLength(1);
  });

  it("scores auto-match fill_blank answers and adds wrong answers to mistake_book", async () => {
    const mistakeBookInputs: unknown[] = [];
    const service = createPracticeService(
      createRepository({
        async findPracticeByPublicId() {
          return createPractice({
            paper_snapshot: createFillBlankPaperSnapshot(),
          });
        },
        async upsertMistakeBookFromWrongAnswer(input) {
          mistakeBookInputs.push(input);

          return {
            public_id: input.publicId,
          };
        },
      }),
      clock,
      createIdFactory(),
    );

    await expect(
      service.submitPracticeAnswer(userContext, "practice_public_123", {
        paperQuestionPublicId: "paper_question_fill_blank_123",
        textAnswer: "购买频率",
      }),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        feedback: {
          isCorrect: false,
          score: "0.0",
          maxScore: "2.0",
          mistakeBookPublicId: "mistake_book_public_2",
          aiHintStatus: null,
        },
      },
    });
    expect(mistakeBookInputs).toHaveLength(1);
  });

  it("scores structured fill_blank answers per blank instead of all-or-nothing", async () => {
    const mistakeBookInputs: unknown[] = [];
    const service = createPracticeService(
      createRepository({
        async findPracticeByPublicId() {
          return createPractice({
            paper_snapshot: createFillBlankPerBlankPaperSnapshot(),
          });
        },
        async upsertMistakeBookFromWrongAnswer(input) {
          mistakeBookInputs.push(input);

          return {
            public_id: input.publicId,
          };
        },
      }),
      clock,
      createIdFactory(),
    );

    await expect(
      service.submitPracticeAnswer(userContext, "practice_public_123", {
        paperQuestionPublicId: "paper_question_fill_blank_123",
        textAnswer: "购买动机；购买频率",
      }),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        feedback: {
          isCorrect: false,
          score: "1.0",
          maxScore: "2.0",
          mistakeBookPublicId: "mistake_book_public_2",
        },
      },
    });
    expect(mistakeBookInputs).toHaveLength(1);
  });

  it("does not fabricate an AI hint for a subjective practice answer", async () => {
    const service = createPracticeService(
      createRepository({
        async findPracticeByPublicId() {
          return createPractice({
            subject: "skill",
            paper_snapshot: createSubjectivePaperSnapshot(),
          });
        },
      }),
      clock,
      createIdFactory(),
    );

    await expect(
      service.submitPracticeAnswer(userContext, "practice_public_123", {
        paperQuestionPublicId: "paper_question_subjective_123",
        textAnswer: "先核验现场事实，再说明处理依据和后续跟进。",
        savedFromClientAt: "2026-05-19T08:00:00.000Z",
      }),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        feedback: {
          answerRecordPublicId: "answer_record_public_1",
          isCorrect: null,
          score: null,
          maxScore: "10.0",
          aiHintStatus: "unavailable",
          aiHintText: null,
          aiHintEvidenceStatus: null,
          aiHintCitations: [],
          retryRemainingCount: 0,
        },
      },
    });
  });

  it.each(["case_analysis", "calculation"] as const)(
    "treats %s practice answers as subjective text answers",
    async (questionType) => {
      const service = createPracticeService(
        createRepository({
          async findPracticeByPublicId() {
            return createPractice({
              subject: "skill",
              paper_snapshot: createSubjectivePaperSnapshot(questionType),
            });
          },
        }),
        clock,
        createIdFactory(),
      );

      await expect(
        service.submitPracticeAnswer(userContext, "practice_public_123", {
          paperQuestionPublicId: "paper_question_subjective_123",
          textAnswer: "Synthetic subjective answer.",
        }),
      ).resolves.toMatchObject({
        code: 0,
        data: {
          feedback: {
            isCorrect: null,
            score: null,
            maxScore: "10.0",
            aiHintStatus: "unavailable",
            retryRemainingCount: 0,
          },
        },
      });
    },
  );

  it("enforces the subjective practice retry limit without exposing the raw answer", async () => {
    const retryService = createPracticeService(
      createRepository({
        async findPracticeByPublicId() {
          return createPractice({
            subject: "skill",
            paper_snapshot: createSubjectivePaperSnapshot(),
          });
        },
        async listAnswerRecordsByPractice() {
          return [
            {
              public_id: "answer_record_public_existing",
              exam_mode: "practice",
              paper_question_public_id: "paper_question_subjective_123",
              question_public_id: "question_subjective_123",
              answer_snapshot: {
                selectedLabels: [],
                textAnswer: "first answer",
                savedFromClientAt: null,
              },
              answer_record_status: "submitted",
              is_correct: null,
              score: null,
              max_score: "10.0",
              answered_at: now,
              submitted_at: now,
            },
          ];
        },
      }),
      clock,
      createIdFactory(),
    );

    await expect(
      retryService.submitPracticeAnswer(userContext, "practice_public_123", {
        paperQuestionPublicId: "paper_question_subjective_123",
        textAnswer: "second answer after hint",
      }),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        feedback: {
          score: null,
          aiHintStatus: "unavailable",
          retryRemainingCount: 0,
        },
      },
    });

    const exhaustedService = createPracticeService(
      createRepository({
        async findPracticeByPublicId() {
          return createPractice({
            subject: "skill",
            paper_snapshot: createSubjectivePaperSnapshot(),
          });
        },
        async listAnswerRecordsByPractice() {
          return [
            {
              public_id: "answer_record_public_first",
              exam_mode: "practice",
              paper_question_public_id: "paper_question_subjective_123",
              question_public_id: "question_subjective_123",
              answer_snapshot: {
                selectedLabels: [],
                textAnswer: "first answer",
                savedFromClientAt: null,
              },
              answer_record_status: "submitted",
              is_correct: null,
              score: null,
              max_score: "10.0",
              answered_at: now,
              submitted_at: now,
            },
            {
              public_id: "answer_record_public_second",
              exam_mode: "practice",
              paper_question_public_id: "paper_question_subjective_123",
              question_public_id: "question_subjective_123",
              answer_snapshot: {
                selectedLabels: [],
                textAnswer: "second answer",
                savedFromClientAt: null,
              },
              answer_record_status: "submitted",
              is_correct: null,
              score: null,
              max_score: "10.0",
              answered_at: now,
              submitted_at: now,
            },
          ];
        },
      }),
      clock,
      createIdFactory(),
    );

    await expect(
      exhaustedService.submitPracticeAnswer(
        userContext,
        "practice_public_123",
        {
          paperQuestionPublicId: "paper_question_subjective_123",
          textAnswer: "third answer should be rejected",
        },
      ),
    ).resolves.toEqual({
      code: 409302,
      message: "Practice subjective question retry limit reached.",
      data: null,
    });
  });

  it("keeps a subjective retry unscored when governed AI is unavailable", async () => {
    const createdAnswerInputs: unknown[] = [];
    const retryService = createPracticeService(
      createRepository({
        async findPracticeByPublicId() {
          return createPractice({
            subject: "skill",
            paper_snapshot: createSubjectivePaperSnapshot(),
          });
        },
        async listAnswerRecordsByPractice() {
          return [
            {
              public_id: "answer_record_public_first",
              exam_mode: "practice",
              paper_question_public_id: "paper_question_subjective_123",
              question_public_id: "question_subjective_123",
              answer_snapshot: {
                selectedLabels: [],
                textAnswer: "first answer",
                savedFromClientAt: null,
              },
              answer_record_status: "submitted",
              is_correct: null,
              score: null,
              max_score: "10.0",
              answered_at: now,
              submitted_at: now,
            },
          ];
        },
        async createPracticeAnswerRecord(input) {
          createdAnswerInputs.push(input);

          return {
            public_id: input.publicId,
            exam_mode: "practice",
            paper_question_public_id: input.paperQuestionPublicId,
            question_public_id: input.questionPublicId,
            answer_snapshot: input.answerSnapshot,
            answer_record_status: input.answerRecordStatus,
            is_correct: input.isCorrect,
            score: input.score,
            max_score: input.maxScore,
            answered_at: input.answeredAt,
            submitted_at: input.submittedAt,
          };
        },
      }),
      clock,
      createIdFactory(),
    );

    await expect(
      retryService.submitPracticeAnswer(userContext, "practice_public_123", {
        paperQuestionPublicId: "paper_question_subjective_123",
        textAnswer:
          "second answer includes facts, basis, handling steps, and follow up.",
      }),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        feedback: {
          isCorrect: null,
          score: null,
          maxScore: "10.0",
          aiHintStatus: "unavailable",
          retryRemainingCount: 0,
        },
      },
    });
    expect(createdAnswerInputs).toMatchObject([
      {
        answerRecordStatus: "submitted",
        score: null,
      },
    ]);
  });

  it("rejects a direct subjective scoring request when governed AI is unavailable", async () => {
    const directScoreService = createPracticeService(
      createRepository({
        async findPracticeByPublicId() {
          return createPractice({
            subject: "skill",
            paper_snapshot: createSubjectivePaperSnapshot(),
          });
        },
        async listAnswerRecordsByPractice() {
          return [
            {
              public_id: "answer_record_public_first",
              exam_mode: "practice",
              paper_question_public_id: "paper_question_subjective_123",
              question_public_id: "question_subjective_123",
              answer_snapshot: {
                selectedLabels: [],
                textAnswer: "first answer",
                savedFromClientAt: null,
              },
              answer_record_status: "submitted",
              is_correct: null,
              score: null,
              max_score: "10.0",
              answered_at: now,
              submitted_at: now,
            },
          ];
        },
      }),
      clock,
      createIdFactory(),
    );

    await expect(
      directScoreService.submitPracticeAnswer(
        userContext,
        "practice_public_123",
        {
          paperQuestionPublicId: "paper_question_subjective_123",
          textAnswer:
            "direct final scoring answer includes facts, legal basis, action, and follow up.",
          aiScoringTrigger: "manual_request",
        },
      ),
    ).resolves.toEqual({
      code: 503304,
      message: "Practice AI scoring is not configured.",
      data: null,
    });
  });

  it("restarts and terminates practice through explicit lifecycle transitions", async () => {
    const terminatedInputs: unknown[] = [];
    const service = createPracticeService(
      createRepository({
        async terminatePractice(input) {
          terminatedInputs.push(input);

          return createPractice({
            public_id: input.publicId,
            practice_status: "terminated",
          });
        },
      }),
      clock,
      createIdFactory(),
    );

    await expect(
      service.restartPractice(userContext, "practice_public_existing"),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        practice: {
          publicId: "practice_public_1",
          practiceStatus: "in_progress",
        },
      },
    });
    expect(terminatedInputs[0]).toEqual({
      publicId: "practice_public_existing",
      terminatedAt: now,
      terminationReason: "restart",
    });

    await expect(
      service.terminatePractice(userContext, "practice_public_existing"),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        practice: {
          publicId: "practice_public_existing",
          practiceStatus: "terminated",
        },
      },
    });
  });
});

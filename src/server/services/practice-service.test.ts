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
            scoringMethod: "auto_match",
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
            scoringMethod: "auto_match",
          },
        ],
      },
    ],
  };
}

function createSubjectivePaperSnapshot(): Record<string, unknown> {
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
            questionType: "short_answer",
            stemRichText: "<p>请说明检查处置步骤。</p>",
            standardAnswerRichText: "<p>先核验事实，再依法处置并跟进闭环。</p>",
            analysisRichText: "<p>按事实、依据、处置、复盘展开。</p>",
            scoringPoints: [
              {
                scoringPointPublicId: "scoring_point_public_1",
                label: "事实核验",
                maxScore: 5,
              },
            ],
            score: "10.0",
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
    ...overrides,
  };
}

describe("practice service", () => {
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
          aiExplanationStatus: null,
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

  it("returns a redacted local AI hint and one retry budget for a subjective practice answer", async () => {
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
          aiHintStatus: "hinted",
          aiHintText: expect.stringContaining("AI 提示"),
          aiHintEvidenceStatus: "none",
          aiHintCitations: [],
          retryRemainingCount: 1,
        },
      },
    });
  });

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
          aiHintStatus: "hinted",
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

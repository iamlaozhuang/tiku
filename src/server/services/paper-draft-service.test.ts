import { describe, expect, it, vi } from "vitest";

import { createPaperDraftService } from "./paper-draft-service";
import type {
  PaperDraftAccessRow,
  PaperDraftRepository,
  PaperQuestionAccessRow,
} from "../repositories/paper-draft-repository";

const createdAt = new Date("2026-05-19T06:00:00.000Z");
const updatedAt = new Date("2026-05-19T07:00:00.000Z");

function createPaperQuestion(
  overrides: Partial<PaperQuestionAccessRow> = {},
): PaperQuestionAccessRow {
  return {
    id: 301,
    public_id: "paper_question_public_123",
    source_question_public_id: "question_public_123",
    paper_section_id: 201,
    paper_section_sort_order: 1,
    question_group_id: 401,
    question_group_sort_order: 1,
    question_snapshot: {
      questionPublicId: "question_public_123",
      questionStatus: "available",
      questionType: "short_answer",
      profession: "logistics",
      level: 4,
      subject: "skill",
      stemRichText: "<p>说明入库验收步骤</p>",
      questionOptions: [],
      standardAnswerRichText: "<p>核对单据并验收货物</p>",
      analysisRichText: "<p>按流程验收</p>",
      multiChoiceRule: "all_correct_only",
      scoringMethod: "ai_scoring",
    },
    material_snapshot: {
      materialPublicId: "material_public_123",
      title: "入库案例材料",
      contentRichText: "<p>某仓库入库案例</p>",
      profession: "logistics",
      level: 4,
      subject: "skill",
    },
    score: "5.0",
    sort_order: 1,
    scoring_points: [
      {
        source_scoring_point_id: 501,
        description: "说明单据核对",
        score: "2.5",
        sort_order: 1,
      },
      {
        source_scoring_point_id: 502,
        description: "说明实物验收",
        score: "2.5",
        sort_order: 2,
      },
    ],
    created_at: createdAt,
    updated_at: updatedAt,
    ...overrides,
  };
}

function createPaperQuestions(questionCount: number): PaperQuestionAccessRow[] {
  return Array.from({ length: questionCount }, (_, questionIndex) => {
    const questionNumber = questionIndex + 1;

    return createPaperQuestion({
      id: 300 + questionNumber,
      public_id: `paper_question_public_${questionNumber}`,
      source_question_public_id: `question_public_${questionNumber}`,
      score: "1.0",
      sort_order: questionNumber,
      question_snapshot: {
        ...createPaperQuestion().question_snapshot,
        questionPublicId: `question_public_${questionNumber}`,
      },
      scoring_points: [
        {
          source_scoring_point_id: 500 + questionNumber,
          description: `评分点 ${questionNumber}`,
          score: "1.0",
          sort_order: 1,
        },
      ],
    });
  });
}

function createFillBlankPaperQuestion(
  overrides: Partial<PaperQuestionAccessRow> = {},
): PaperQuestionAccessRow {
  return createPaperQuestion({
    question_snapshot: {
      questionPublicId: "question_fill_blank_public_123",
      questionStatus: "available",
      questionType: "fill_blank",
      profession: "logistics",
      level: 4,
      subject: "skill",
      stemRichText: "<p>客户分析应识别___和___。</p>",
      questionOptions: [],
      standardAnswerRichText: "<p>客户动机；消费频率</p>",
      analysisRichText: "<p>逐空核对答案。</p>",
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
    } as PaperQuestionAccessRow["question_snapshot"],
    source_question_public_id: "question_fill_blank_public_123",
    score: "2.0",
    scoring_points: [],
    ...overrides,
  });
}

function createPaper(
  overrides: Partial<PaperDraftAccessRow> = {},
): PaperDraftAccessRow {
  return {
    id: 101,
    public_id: "paper_public_123",
    name: "物流技能草稿卷",
    profession: "logistics",
    level: 4,
    subject: "skill",
    paper_status: "draft",
    paper_type: "mock_paper",
    year: 2026,
    source: "phase-3 baseline",
    duration_minute: 90,
    total_score: "5.0",
    published_at: null,
    archived_at: null,
    paper_sections: [
      {
        id: 201,
        title: "案例分析",
        description: "技能题",
        sort_order: 1,
        total_score: "5.0",
        paper_questions: [createPaperQuestion()],
      },
    ],
    question_groups: [
      {
        id: 401,
        paper_section_id: 201,
        material_public_id: "material_public_123",
        material_snapshot: {
          materialPublicId: "material_public_123",
          title: "入库案例材料",
          contentRichText: "<p>某仓库入库案例</p>",
          profession: "logistics",
          level: 4,
          subject: "skill",
        },
        title: "入库案例题组",
        sort_order: 1,
      },
    ],
    created_at: createdAt,
    updated_at: updatedAt,
    ...overrides,
  };
}

function createRepository(
  overrides: Partial<PaperDraftRepository> = {},
): PaperDraftRepository {
  return {
    async listPapers(query) {
      return {
        total: 1,
        rows: [
          createPaper({
            profession: query.profession ?? "logistics",
            subject: query.subject ?? "skill",
          }),
        ],
      };
    },
    async createPaper(input) {
      return createPaper({
        name: input.name,
        profession: input.profession,
        level: input.level,
        subject: input.subject,
        paper_type: input.paperType,
        year: input.year,
        source: input.source,
        duration_minute: input.durationMinute,
        total_score: input.totalScore,
        paper_sections: [],
        question_groups: [],
      });
    },
    async findPaperByPublicId(publicId) {
      return createPaper({
        public_id: publicId,
      });
    },
    async updatePaper(input) {
      return createPaper({
        public_id: input.publicId,
        name: input.name,
        profession: input.profession,
        level: input.level,
        subject: input.subject,
        paper_type: input.paperType,
        year: input.year,
        source: input.source,
        duration_minute: input.durationMinute,
        total_score: input.totalScore,
      });
    },
    async addQuestionToDraftPaper(input) {
      return createPaperQuestion({
        public_id: "paper_question_public_123",
        source_question_public_id: input.questionPublicId,
        score: input.score,
        sort_order: input.sortOrder,
      });
    },
    async updatePaperQuestion(input) {
      return createPaperQuestion({
        public_id: input.paperQuestionPublicId,
        score: input.score,
        sort_order: input.sortOrder,
      });
    },
    async removePaperQuestion() {
      return createPaper({
        paper_sections: [],
        question_groups: [],
        total_score: "0.0",
      });
    },
    async publishPaper() {
      return createPaper({
        paper_status: "published",
        published_at: new Date("2026-05-19T08:00:00.000Z"),
      });
    },
    async archivePaper(input) {
      return createPaper({
        public_id: input.paperPublicId,
        paper_status: "archived",
        published_at: new Date("2026-05-19T08:00:00.000Z"),
        archived_at: new Date("2026-05-19T09:00:00.000Z"),
      });
    },
    async deletePaper() {
      return true;
    },
    async copyPaper(input) {
      return createPaper({
        public_id: "paper_public_copy_123",
        name: "物流技能草稿卷（副本）",
        paper_status: "draft",
        published_at: null,
        archived_at: null,
        paper_sections: input.sourcePaper.paper_sections,
        question_groups: input.sourcePaper.question_groups,
      });
    },
    ...overrides,
  };
}

describe("paper draft service", () => {
  it("lists draft papers with paper sections, question groups, and sort order", async () => {
    const receivedQueries: unknown[] = [];
    const service = createPaperDraftService(
      createRepository({
        async listPapers(query) {
          receivedQueries.push(query);

          return {
            total: 1,
            rows: [createPaper()],
          };
        },
      }),
    );

    await expect(
      service.listPapers({
        page: 0,
        pageSize: 500,
        sortOrder: "sideways",
        profession: "logistics",
        level: "4",
        subject: "skill",
        paperStatus: "draft",
      }),
    ).resolves.toMatchObject({
      code: 0,
      data: [
        {
          publicId: "paper_public_123",
          name: "物流技能草稿卷",
          questionCount: 1,
          paperSections: [
            {
              title: "案例分析",
              sortOrder: 1,
              totalScore: "5.0",
              paperQuestions: [
                {
                  publicId: "paper_question_public_123",
                  sortOrder: 1,
                  score: "5.0",
                },
              ],
            },
          ],
          questionGroups: [
            {
              title: "入库案例题组",
              materialPublicId: "material_public_123",
              sortOrder: 1,
            },
          ],
        },
      ],
      pagination: {
        page: 1,
        pageSize: 100,
        total: 1,
        sortBy: "createdAt",
        sortOrder: "desc",
      },
    });
    expect(receivedQueries).toEqual([
      {
        page: 1,
        pageSize: 100,
        sortBy: "createdAt",
        sortOrder: "desc",
        profession: "logistics",
        level: 4,
        subject: "skill",
        paperStatus: "draft",
      },
    ]);
  });

  it("creates, reads, and updates draft paper metadata", async () => {
    const service = createPaperDraftService(createRepository());
    const input = {
      name: "物流技能草稿卷",
      profession: "logistics",
      level: 4,
      subject: "skill",
      paperType: "mock_paper",
      year: 2026,
      source: "phase-3 baseline",
      durationMinute: 90,
      totalScore: "5.0",
    };

    await expect(service.createPaper(input)).resolves.toMatchObject({
      code: 0,
      data: {
        paper: {
          publicId: "paper_public_123",
          name: "物流技能草稿卷",
          paperStatus: "draft",
          paperSections: [],
        },
      },
    });

    await expect(service.getPaper("paper_public_123")).resolves.toMatchObject({
      code: 0,
      data: {
        paper: {
          publicId: "paper_public_123",
          questionCount: 1,
        },
      },
    });

    await expect(
      service.updatePaper("paper_public_123", {
        ...input,
        name: "更新后的草稿卷",
      }),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        paper: {
          publicId: "paper_public_123",
          name: "更新后的草稿卷",
        },
      },
    });
  });

  it("adds a source question to a draft paper with snapshots and scoring points", async () => {
    const service = createPaperDraftService(createRepository());

    await expect(
      service.addQuestionToDraftPaper("paper_public_123", {
        questionPublicId: "question_public_123",
        score: "5.0",
        sortOrder: 1,
        paperSection: {
          title: "案例分析",
          description: "技能题",
          sortOrder: 1,
        },
        questionGroup: {
          title: "入库案例题组",
          materialPublicId: "material_public_123",
          sortOrder: 1,
        },
      }),
    ).resolves.toEqual({
      code: 0,
      message: "ok",
      data: {
        paperQuestion: {
          publicId: "paper_question_public_123",
          sourceQuestionPublicId: "question_public_123",
          paperSectionSortOrder: 1,
          questionGroupSortOrder: 1,
          score: "5.0",
          sortOrder: 1,
          questionSnapshot: {
            questionPublicId: "question_public_123",
            questionStatus: "available",
            questionType: "short_answer",
            profession: "logistics",
            level: 4,
            subject: "skill",
            stemRichText: "<p>说明入库验收步骤</p>",
            questionOptions: [],
            standardAnswerRichText: "<p>核对单据并验收货物</p>",
            analysisRichText: "<p>按流程验收</p>",
            multiChoiceRule: "all_correct_only",
            scoringMethod: "ai_scoring",
          },
          materialSnapshot: {
            materialPublicId: "material_public_123",
            title: "入库案例材料",
            contentRichText: "<p>某仓库入库案例</p>",
            profession: "logistics",
            level: 4,
            subject: "skill",
          },
          scoringPoints: [
            {
              description: "说明单据核对",
              score: "2.5",
              sortOrder: 1,
            },
            {
              description: "说明实物验收",
              score: "2.5",
              sortOrder: 2,
            },
          ],
          createdAt: "2026-05-19T06:00:00.000Z",
          updatedAt: "2026-05-19T07:00:00.000Z",
        },
      },
    });
  });

  it("rejects adding the 101st question to a draft paper", async () => {
    let addQuestionCalled = false;
    const service = createPaperDraftService(
      createRepository({
        async findPaperByPublicId(publicId) {
          return createPaper({
            public_id: publicId,
            total_score: "100.0",
            paper_sections: [
              {
                id: 201,
                title: "题量上限",
                description: null,
                sort_order: 1,
                total_score: "100.0",
                paper_questions: createPaperQuestions(100),
              },
            ],
            question_groups: [],
          });
        },
        async addQuestionToDraftPaper() {
          addQuestionCalled = true;
          return createPaperQuestion();
        },
      }),
    );

    await expect(
      service.addQuestionToDraftPaper("paper_public_123", {
        questionPublicId: "question_public_101",
        score: "1.0",
        sortOrder: 101,
        paperSection: {
          title: "题量上限",
          description: null,
          sortOrder: 1,
        },
        questionGroup: null,
      }),
    ).resolves.toEqual({
      code: 422205,
      message: "Draft paper cannot contain more than 100 questions.",
      data: null,
    });
    expect(addQuestionCalled).toBe(false);
  });

  it("updates and removes paper questions by public identifiers", async () => {
    const repository = createRepository();
    const updatePaperQuestion = vi.spyOn(repository, "updatePaperQuestion");
    const service = createPaperDraftService(repository);

    await expect(
      service.updatePaperQuestion(
        "paper_public_123",
        "paper_question_public_123",
        {
          score: "6.0",
          sortOrder: 2,
          scoringPoints: [
            {
              description: "调整后的评分点",
              score: "6.0",
              sortOrder: 1,
            },
          ],
          paperSection: {
            title: "案例分析",
            description: null,
            sortOrder: 2,
          },
        },
      ),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        paperQuestion: {
          publicId: "paper_question_public_123",
          score: "6.0",
          sortOrder: 2,
        },
      },
    });
    expect(updatePaperQuestion).toHaveBeenCalledWith(
      expect.objectContaining({
        paperPublicId: "paper_public_123",
        paperQuestionPublicId: "paper_question_public_123",
        paperSection: {
          title: "案例分析",
          description: null,
          sortOrder: 2,
        },
      }),
    );

    await expect(
      service.removePaperQuestion(
        "paper_public_123",
        "paper_question_public_123",
      ),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        paper: {
          publicId: "paper_public_123",
          questionCount: 0,
          paperSections: [],
        },
      },
    });
  });

  it("rejects invalid input, missing paper, and non-draft composition changes", async () => {
    const service = createPaperDraftService(
      createRepository({
        async findPaperByPublicId(publicId) {
          if (publicId === "missing_paper") {
            return null;
          }

          return createPaper({
            public_id: publicId,
            paper_status:
              publicId === "published_paper" ? "published" : "draft",
          });
        },
      }),
    );

    await expect(service.createPaper({ name: "" })).resolves.toEqual({
      code: 422203,
      message: "Invalid paper input.",
      data: null,
    });

    await expect(service.getPaper("missing_paper")).resolves.toEqual({
      code: 404203,
      message: "Paper does not exist.",
      data: null,
    });

    await expect(
      service.addQuestionToDraftPaper("published_paper", {
        questionPublicId: "question_public_123",
        score: "5.0",
        sortOrder: 1,
        paperSection: {
          title: "案例分析",
          description: null,
          sortOrder: 1,
        },
        questionGroup: null,
      }),
    ).resolves.toEqual({
      code: 409203,
      message: "Only draft paper can be composed.",
      data: null,
    });
  });

  it("publishes a valid draft paper and locks source question and material public identifiers", async () => {
    const publishedInputs: unknown[] = [];
    const draftPaper = createPaper();
    const service = createPaperDraftService(
      createRepository({
        async findPaperByPublicId(publicId) {
          return createPaper({
            public_id: publicId,
          });
        },
        async publishPaper(input) {
          publishedInputs.push(input);

          return createPaper({
            public_id: input.paperPublicId,
            paper_status: "published",
            published_at: new Date("2026-05-19T08:00:00.000Z"),
          });
        },
      }),
    );

    await expect(service.publishPaper(draftPaper.public_id)).resolves.toEqual({
      code: 0,
      message: "ok",
      data: {
        paper: {
          publicId: "paper_public_123",
          name: "物流技能草稿卷",
          profession: "logistics",
          level: 4,
          subject: "skill",
          paperStatus: "published",
          paperType: "mock_paper",
          year: 2026,
          source: "phase-3 baseline",
          durationMinute: 90,
          totalScore: "5.0",
          publishedAt: "2026-05-19T08:00:00.000Z",
          archivedAt: null,
          questionCount: 1,
          paperSections: [
            {
              title: "案例分析",
              description: "技能题",
              sortOrder: 1,
              totalScore: "5.0",
              paperQuestions: [
                {
                  publicId: "paper_question_public_123",
                  sourceQuestionPublicId: "question_public_123",
                  paperSectionSortOrder: 1,
                  questionGroupSortOrder: 1,
                  score: "5.0",
                  sortOrder: 1,
                  questionSnapshot: {
                    questionPublicId: "question_public_123",
                    questionStatus: "available",
                    questionType: "short_answer",
                    profession: "logistics",
                    level: 4,
                    subject: "skill",
                    stemRichText: "<p>说明入库验收步骤</p>",
                    questionOptions: [],
                    standardAnswerRichText: "<p>核对单据并验收货物</p>",
                    analysisRichText: "<p>按流程验收</p>",
                    multiChoiceRule: "all_correct_only",
                    scoringMethod: "ai_scoring",
                  },
                  materialSnapshot: {
                    materialPublicId: "material_public_123",
                    title: "入库案例材料",
                    contentRichText: "<p>某仓库入库案例</p>",
                    profession: "logistics",
                    level: 4,
                    subject: "skill",
                  },
                  scoringPoints: [
                    {
                      description: "说明单据核对",
                      score: "2.5",
                      sortOrder: 1,
                    },
                    {
                      description: "说明实物验收",
                      score: "2.5",
                      sortOrder: 2,
                    },
                  ],
                  createdAt: "2026-05-19T06:00:00.000Z",
                  updatedAt: "2026-05-19T07:00:00.000Z",
                },
              ],
            },
          ],
          questionGroups: [
            {
              title: "入库案例题组",
              materialPublicId: "material_public_123",
              materialSnapshot: {
                materialPublicId: "material_public_123",
                title: "入库案例材料",
                contentRichText: "<p>某仓库入库案例</p>",
                profession: "logistics",
                level: 4,
                subject: "skill",
              },
              sortOrder: 1,
            },
          ],
          createdAt: "2026-05-19T06:00:00.000Z",
          updatedAt: "2026-05-19T07:00:00.000Z",
        },
        lockedQuestionPublicIds: ["question_public_123"],
        lockedMaterialPublicIds: ["material_public_123"],
      },
    });

    expect(publishedInputs).toEqual([
      {
        paperPublicId: "paper_public_123",
        sourceQuestionPublicIds: ["question_public_123"],
        materialPublicIds: ["material_public_123"],
      },
    ]);
  });

  it("rejects publishing a draft paper with more than 100 questions", async () => {
    const publishedInputs: unknown[] = [];
    const service = createPaperDraftService(
      createRepository({
        async findPaperByPublicId(publicId) {
          return createPaper({
            public_id: publicId,
            total_score: "101.0",
            paper_sections: [
              {
                id: 201,
                title: "题量超限",
                description: null,
                sort_order: 1,
                total_score: "101.0",
                paper_questions: createPaperQuestions(101),
              },
            ],
            question_groups: [],
          });
        },
        async publishPaper(input) {
          publishedInputs.push(input);

          return createPaper({
            public_id: input.paperPublicId,
            paper_status: "published",
            published_at: new Date("2026-05-19T08:00:00.000Z"),
          });
        },
      }),
    );

    await expect(service.publishPaper("paper_public_123")).resolves.toEqual({
      code: 422204,
      message: "Paper publish validation failed.",
      data: null,
    });
    expect(publishedInputs).toEqual([]);
  });

  it("rejects publishing missing, non-draft, incomplete, and source-lock-invalid papers", async () => {
    const service = createPaperDraftService(
      createRepository({
        async findPaperByPublicId(publicId) {
          if (publicId === "missing_paper") {
            return null;
          }

          if (publicId === "published_paper") {
            return createPaper({
              public_id: publicId,
              paper_status: "published",
            });
          }

          if (publicId === "empty_paper") {
            return createPaper({
              public_id: publicId,
              total_score: "0.0",
              paper_sections: [
                {
                  id: 201,
                  title: "空大题",
                  description: null,
                  sort_order: 1,
                  total_score: "0.0",
                  paper_questions: [],
                },
              ],
              question_groups: [],
            });
          }

          if (publicId === "invalid_score_paper") {
            return createPaper({
              public_id: publicId,
              total_score: "6.0",
              paper_sections: [
                {
                  id: 201,
                  title: "案例分析",
                  description: "技能题",
                  sort_order: 1,
                  total_score: "5.0",
                  paper_questions: [
                    createPaperQuestion({
                      score: "5.0",
                      scoring_points: [
                        {
                          source_scoring_point_id: 501,
                          description: "说明单据核对",
                          score: "2.0",
                          sort_order: 1,
                        },
                      ],
                    }),
                  ],
                },
              ],
            });
          }

          if (publicId === "missing_question_score_paper") {
            return createPaper({
              public_id: publicId,
              total_score: "5.0",
              paper_sections: [
                {
                  id: 201,
                  title: "案例分析",
                  description: "技能题",
                  sort_order: 1,
                  total_score: "0.0",
                  paper_questions: [
                    createPaperQuestion({
                      score: null,
                    }),
                  ],
                },
              ],
            });
          }

          return createPaper({
            public_id: publicId,
          });
        },
        async publishPaper() {
          return null;
        },
      }),
    );

    await expect(service.publishPaper("missing_paper")).resolves.toEqual({
      code: 404203,
      message: "Paper does not exist.",
      data: null,
    });

    await expect(service.publishPaper("published_paper")).resolves.toEqual({
      code: 409204,
      message: "Only draft paper can be published.",
      data: null,
    });

    await expect(service.publishPaper("empty_paper")).resolves.toEqual({
      code: 422204,
      message: "Paper publish validation failed.",
      data: null,
    });

    await expect(service.publishPaper("invalid_score_paper")).resolves.toEqual({
      code: 422204,
      message: "Paper publish validation failed.",
      data: null,
    });

    await expect(
      service.publishPaper("missing_question_score_paper"),
    ).resolves.toEqual({
      code: 422204,
      message: "Paper publish validation failed.",
      data: null,
    });

    await expect(service.publishPaper("lock_failure_paper")).resolves.toEqual({
      code: 422204,
      message: "Paper publish validation failed.",
      data: null,
    });
  });

  it("validates fill_blank per-blank score totals before publish", async () => {
    const publishedInputs: unknown[] = [];
    const service = createPaperDraftService(
      createRepository({
        async findPaperByPublicId(publicId) {
          return createPaper({
            public_id: publicId,
            total_score: "2.0",
            paper_sections: [
              {
                id: 201,
                title: "填空题",
                description: null,
                sort_order: 1,
                total_score: "2.0",
                paper_questions: [
                  createFillBlankPaperQuestion({
                    score: publicId === "fill_blank_mismatch" ? "3.0" : "2.0",
                  }),
                ],
              },
            ],
            question_groups: [],
          });
        },
        async publishPaper(input) {
          publishedInputs.push(input);

          return createPaper({
            public_id: input.paperPublicId,
            paper_status: "published",
            published_at: new Date("2026-05-19T08:00:00.000Z"),
          });
        },
      }),
    );

    await expect(service.publishPaper("fill_blank_mismatch")).resolves.toEqual({
      code: 422204,
      message: "Paper publish validation failed.",
      data: null,
    });

    await expect(service.publishPaper("fill_blank_match")).resolves.toEqual(
      expect.objectContaining({
        code: 0,
      }),
    );
    expect(publishedInputs).toEqual([
      expect.objectContaining({
        paperPublicId: "fill_blank_match",
        sourceQuestionPublicIds: ["question_fill_blank_public_123"],
      }),
    ]);
  });

  it("rejects fill_blank publish when per-blank answers are missing", async () => {
    const publishedInputs: unknown[] = [];
    const service = createPaperDraftService(
      createRepository({
        async findPaperByPublicId(publicId) {
          return createPaper({
            public_id: publicId,
            total_score: "2.0",
            paper_sections: [
              {
                id: 201,
                title: "fill_blank paper_section",
                description: null,
                sort_order: 1,
                total_score: "2.0",
                paper_questions: [
                  createFillBlankPaperQuestion({
                    question_snapshot: {
                      ...createFillBlankPaperQuestion().question_snapshot,
                      fillBlankAnswers: [],
                    },
                  }),
                ],
              },
            ],
            question_groups: [],
          });
        },
        async publishPaper(input) {
          publishedInputs.push(input);

          return createPaper({
            public_id: input.paperPublicId,
            paper_status: "published",
            published_at: new Date("2026-05-19T08:00:00.000Z"),
          });
        },
      }),
    );

    await expect(service.publishPaper("fill_blank_missing")).resolves.toEqual({
      code: 422204,
      message: "Paper publish validation failed.",
      data: null,
    });
    expect(publishedInputs).toEqual([]);
  });

  it.each(["case_analysis", "calculation"] as const)(
    "validates %s scoring_point totals as subjective paper questions",
    async (questionType) => {
      const publishedInputs: unknown[] = [];
      const service = createPaperDraftService(
        createRepository({
          async findPaperByPublicId(publicId) {
            return createPaper({
              public_id: publicId,
              paper_sections: [
                {
                  id: 201,
                  title: "Synthetic paper_section",
                  description: "Synthetic subjective question",
                  sort_order: 1,
                  total_score: "5.0",
                  paper_questions: [
                    createPaperQuestion({
                      question_snapshot: {
                        ...createPaperQuestion().question_snapshot,
                        questionType,
                        questionOptions: [],
                        scoringMethod: "auto_match",
                      },
                      score: "5.0",
                      scoring_points: [
                        {
                          source_scoring_point_id: 501,
                          description: "Synthetic scoring point",
                          score: "2.5",
                          sort_order: 1,
                        },
                      ],
                    }),
                  ],
                },
              ],
            });
          },
          async publishPaper(input) {
            publishedInputs.push(input);

            return createPaper({
              paper_status: "published",
              published_at: new Date("2026-05-19T08:00:00.000Z"),
            });
          },
        }),
      );

      await expect(service.publishPaper("paper_public_123")).resolves.toEqual({
        code: 422204,
        message: "Paper publish validation failed.",
        data: null,
      });
      expect(publishedInputs).toEqual([]);
    },
  );

  it("keeps existing paper question snapshots immutable while publishing", async () => {
    const sourcePaperQuestion = createPaperQuestion();
    const service = createPaperDraftService(
      createRepository({
        async findPaperByPublicId() {
          return createPaper({
            paper_sections: [
              {
                id: 201,
                title: "案例分析",
                description: "技能题",
                sort_order: 1,
                total_score: "5.0",
                paper_questions: [sourcePaperQuestion],
              },
            ],
          });
        },
        async publishPaper() {
          return createPaper({
            paper_status: "published",
            published_at: new Date("2026-05-19T08:00:00.000Z"),
          });
        },
      }),
    );

    await service.publishPaper("paper_public_123");

    expect(sourcePaperQuestion.question_snapshot).toEqual({
      questionPublicId: "question_public_123",
      questionStatus: "available",
      questionType: "short_answer",
      profession: "logistics",
      level: 4,
      subject: "skill",
      stemRichText: "<p>说明入库验收步骤</p>",
      questionOptions: [],
      standardAnswerRichText: "<p>核对单据并验收货物</p>",
      analysisRichText: "<p>按流程验收</p>",
      multiChoiceRule: "all_correct_only",
      scoringMethod: "ai_scoring",
    });
  });

  it("archives published paper without deleting historical snapshots", async () => {
    const archivedInputs: unknown[] = [];
    const service = createPaperDraftService(
      createRepository({
        async findPaperByPublicId(publicId) {
          return createPaper({
            public_id: publicId,
            paper_status: "published",
            published_at: new Date("2026-05-19T08:00:00.000Z"),
          });
        },
        async archivePaper(input) {
          archivedInputs.push(input);

          return createPaper({
            public_id: input.paperPublicId,
            paper_status: "archived",
            published_at: new Date("2026-05-19T08:00:00.000Z"),
            archived_at: new Date("2026-05-19T09:00:00.000Z"),
          });
        },
      }),
    );

    await expect(
      service.archivePaper("paper_public_123"),
    ).resolves.toMatchObject({
      code: 0,
      message: "ok",
      data: {
        paper: {
          publicId: "paper_public_123",
          paperStatus: "archived",
          publishedAt: "2026-05-19T08:00:00.000Z",
          archivedAt: "2026-05-19T09:00:00.000Z",
          questionCount: 1,
        },
      },
    });
    expect(archivedInputs).toEqual([
      {
        paperPublicId: "paper_public_123",
      },
    ]);
  });

  it("deletes only unreferenced draft paper by public identifier", async () => {
    const deletedPaperPublicIds: string[] = [];
    const service = createPaperDraftService(
      createRepository({
        async findPaperByPublicId(publicId) {
          if (publicId === "published_paper") {
            return createPaper({
              public_id: publicId,
              paper_status: "published",
            });
          }

          return createPaper({
            public_id: publicId,
            paper_status: "draft",
          });
        },
        async deletePaper(input) {
          deletedPaperPublicIds.push(input.paperPublicId);

          return input.paperPublicId !== "referenced_draft";
        },
      }),
    );

    await expect(service.deletePaper("paper_public_123")).resolves.toEqual({
      code: 0,
      message: "ok",
      data: {
        deletedPaperPublicId: "paper_public_123",
      },
    });
    await expect(service.deletePaper("published_paper")).resolves.toEqual({
      code: 409205,
      message: "Only unreferenced draft paper can be deleted.",
      data: null,
    });
    await expect(service.deletePaper("referenced_draft")).resolves.toEqual({
      code: 409205,
      message: "Only unreferenced draft paper can be deleted.",
      data: null,
    });
    expect(deletedPaperPublicIds).toEqual([
      "paper_public_123",
      "referenced_draft",
    ]);
  });

  it("copies published or archived paper as a new draft while preserving paper scoring points", async () => {
    const copiedInputs: unknown[] = [];
    const service = createPaperDraftService(
      createRepository({
        async findPaperByPublicId(publicId) {
          return createPaper({
            public_id: publicId,
            paper_status: publicId === "draft_paper" ? "draft" : "archived",
          });
        },
        async copyPaper(input) {
          copiedInputs.push({
            sourcePaperPublicId: input.sourcePaper.public_id,
            scoringPoints:
              input.sourcePaper.paper_sections[0]?.paper_questions[0]
                ?.scoring_points,
          });

          return createPaper({
            public_id: "paper_public_copy_123",
            name: "物流技能草稿卷（副本）",
            paper_status: "draft",
            published_at: null,
            archived_at: null,
            paper_sections: input.sourcePaper.paper_sections,
            question_groups: input.sourcePaper.question_groups,
          });
        },
      }),
    );

    await expect(service.copyPaper("paper_public_123")).resolves.toMatchObject({
      code: 0,
      message: "ok",
      data: {
        copiedFromPaperPublicId: "paper_public_123",
        paper: {
          publicId: "paper_public_copy_123",
          name: "物流技能草稿卷（副本）",
          paperStatus: "draft",
          publishedAt: null,
          archivedAt: null,
          paperSections: [
            {
              paperQuestions: [
                {
                  scoringPoints: [
                    {
                      description: "说明单据核对",
                      score: "2.5",
                      sortOrder: 1,
                    },
                    {
                      description: "说明实物验收",
                      score: "2.5",
                      sortOrder: 2,
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
    });
    await expect(service.copyPaper("draft_paper")).resolves.toEqual({
      code: 409206,
      message: "Only published or archived paper can be copied.",
      data: null,
    });
    expect(copiedInputs).toEqual([
      {
        sourcePaperPublicId: "paper_public_123",
        scoringPoints: [
          {
            source_scoring_point_id: 501,
            description: "说明单据核对",
            score: "2.5",
            sort_order: 1,
          },
          {
            source_scoring_point_id: 502,
            description: "说明实物验收",
            score: "2.5",
            sort_order: 2,
          },
        ],
      },
    ]);
  });
});

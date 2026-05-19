import { describe, expect, it } from "vitest";

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

  it("updates and removes paper questions by public identifiers", async () => {
    const service = createPaperDraftService(createRepository());

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
});

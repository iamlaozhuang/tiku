import { describe, expect, it } from "vitest";

import { createQuestionService } from "./question-service";
import type {
  QuestionAccessRow,
  QuestionRepository,
} from "../repositories/question-repository";

const createdAt = new Date("2026-05-19T04:00:00.000Z");
const lockedAt = new Date("2026-05-19T05:00:00.000Z");

function createQuestion(
  overrides: Partial<QuestionAccessRow> = {},
): QuestionAccessRow {
  return {
    id: 201,
    public_id: "question_public_123",
    question_type: "single_choice",
    profession: "logistics",
    level: 4,
    subject: "theory",
    stem_rich_text: "<p>仓储作业应优先检查哪项？</p>",
    analysis_rich_text: "<p>老师解析内容</p>",
    standard_answer_rich_text: "<p>A</p>",
    status: "available",
    is_locked: false,
    locked_at: null,
    multi_choice_rule: "all_correct_only",
    scoring_method: "auto_match",
    material_id: 301,
    material_public_id: "material_public_123",
    question_options: [
      {
        id: 401,
        question_id: 201,
        label: "A",
        content_rich_text: "<p>核对入库单</p>",
        is_correct: true,
        sort_order: 1,
        created_at: createdAt,
        updated_at: createdAt,
      },
      {
        id: 402,
        question_id: 201,
        label: "B",
        content_rich_text: "<p>直接上架</p>",
        is_correct: false,
        sort_order: 2,
        created_at: createdAt,
        updated_at: createdAt,
      },
    ],
    scoring_points: [
      {
        id: 501,
        question_id: 201,
        description: "指出核对单据",
        score: "2.5",
        sort_order: 1,
        created_at: createdAt,
        updated_at: createdAt,
      },
    ],
    fill_blank_answers: [],
    knowledge_node_public_ids: ["knowledge_node_public_storage"],
    tag_public_ids: ["tag_public_storage"],
    created_at: createdAt,
    updated_at: createdAt,
    ...overrides,
  };
}

function createRepository(
  overrides: Partial<QuestionRepository> = {},
): QuestionRepository {
  return {
    async listQuestions(query) {
      return {
        total: 1,
        rows: [
          createQuestion({
            question_type: query.questionType ?? "single_choice",
            profession: query.profession ?? "logistics",
            subject: query.subject ?? "theory",
          }),
        ],
      };
    },
    async createQuestion(input) {
      return createQuestion({
        question_type: input.questionType,
        profession: input.profession,
        level: input.level,
        subject: input.subject,
        stem_rich_text: input.stemRichText,
        analysis_rich_text: input.analysisRichText,
        standard_answer_rich_text: input.standardAnswerRichText,
        multi_choice_rule: input.multiChoiceRule,
        scoring_method: input.scoringMethod,
        fill_blank_answers: input.fillBlankAnswers,
        material_public_id: input.materialPublicId,
        knowledge_node_public_ids: input.knowledgeNodePublicIds,
        tag_public_ids: input.tagPublicIds,
      });
    },
    async findQuestionByPublicId(publicId) {
      return createQuestion({
        public_id: publicId,
      });
    },
    async updateQuestion(input) {
      return createQuestion({
        public_id: input.publicId,
        question_type: input.questionType,
        profession: input.profession,
        level: input.level,
        subject: input.subject,
        stem_rich_text: input.stemRichText,
        analysis_rich_text: input.analysisRichText,
        standard_answer_rich_text: input.standardAnswerRichText,
        status: input.status,
        multi_choice_rule: input.multiChoiceRule,
        scoring_method: input.scoringMethod,
        fill_blank_answers: input.fillBlankAnswers,
        material_public_id: input.materialPublicId,
        knowledge_node_public_ids: input.knowledgeNodePublicIds,
        tag_public_ids: input.tagPublicIds,
      });
    },
    async disableQuestion(publicId) {
      return createQuestion({
        public_id: publicId,
        status: "disabled",
      });
    },
    async copyQuestion(publicId) {
      return createQuestion({
        public_id: `${publicId}_copy`,
        status: "available",
        is_locked: false,
        locked_at: null,
      });
    },
    ...overrides,
  };
}

describe("question service", () => {
  it("lists questions with normalized pagination and question filters", async () => {
    const receivedQueries: unknown[] = [];
    const service = createQuestionService(
      createRepository({
        async listQuestions(query) {
          receivedQueries.push(query);

          return {
            total: 1,
            rows: [createQuestion()],
          };
        },
      }),
    );

    await expect(
      service.listQuestions({
        page: 0,
        pageSize: 500,
        sortOrder: "sideways",
        profession: "logistics",
        level: "4",
        subject: "theory",
        questionType: "single_choice",
        status: "available",
        knowledgeNodePublicId: " knowledge_node_public_storage ",
        tagPublicId: " tag_public_storage ",
        keyword: "仓储",
      }),
    ).resolves.toMatchObject({
      code: 0,
      data: [
        {
          publicId: "question_public_123",
          questionType: "single_choice",
          stemRichText: "<p>仓储作业应优先检查哪项？</p>",
          analysisRichText: "<p>老师解析内容</p>",
          standardAnswerRichText: "<p>A</p>",
          materialPublicId: "material_public_123",
          knowledgeNodePublicIds: ["knowledge_node_public_storage"],
          tagPublicIds: ["tag_public_storage"],
          questionOptions: [
            {
              label: "A",
              isCorrect: true,
              sortOrder: 1,
            },
            {
              label: "B",
              isCorrect: false,
              sortOrder: 2,
            },
          ],
          scoringPoints: [
            {
              description: "指出核对单据",
              score: "2.5",
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
        subject: "theory",
        questionType: "single_choice",
        status: "available",
        knowledgeNodePublicId: "knowledge_node_public_storage",
        tagPublicId: "tag_public_storage",
        keyword: "仓储",
      },
    ]);
  });

  it("creates, reads, updates, disables, and copies question content", async () => {
    const service = createQuestionService(createRepository());
    const input = {
      questionType: "single_choice",
      profession: "logistics",
      level: 4,
      subject: "theory",
      stemRichText: "<p>仓储作业应优先检查哪项？</p>",
      analysisRichText: "<p>老师解析内容</p>",
      standardAnswerRichText: "<p>A</p>",
      multiChoiceRule: "all_correct_only",
      scoringMethod: "auto_match",
      materialPublicId: "material_public_123",
      questionOptions: [
        {
          label: "A",
          contentRichText: "<p>核对入库单</p>",
          isCorrect: true,
          sortOrder: 1,
        },
      ],
      scoringPoints: [
        {
          description: "指出核对单据",
          score: "2.5",
          sortOrder: 1,
        },
      ],
      knowledgeNodePublicIds: ["knowledge_node_public_1"],
      tagPublicIds: ["tag_public_1"],
    };

    await expect(service.createQuestion(input)).resolves.toMatchObject({
      code: 0,
      data: {
        question: {
          publicId: "question_public_123",
          materialPublicId: "material_public_123",
          knowledgeNodePublicIds: ["knowledge_node_public_1"],
          tagPublicIds: ["tag_public_1"],
        },
      },
    });

    await expect(
      service.getQuestion("question_public_123"),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        question: {
          publicId: "question_public_123",
          knowledgeNodePublicIds: ["knowledge_node_public_storage"],
          tagPublicIds: ["tag_public_storage"],
          questionOptions: [
            {
              label: "A",
              contentRichText: "<p>核对入库单</p>",
            },
            {
              label: "B",
              contentRichText: "<p>直接上架</p>",
            },
          ],
        },
      },
    });

    await expect(
      service.updateQuestion("question_public_123", {
        ...input,
        status: "available",
        analysisRichText: "<p>更新解析</p>",
      }),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        question: {
          publicId: "question_public_123",
          analysisRichText: "<p>更新解析</p>",
        },
      },
    });

    await expect(
      service.disableQuestion("question_public_123"),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        question: {
          publicId: "question_public_123",
          status: "disabled",
        },
      },
    });

    await expect(service.copyQuestion("question_public_123")).resolves.toEqual({
      code: 0,
      message: "ok",
      data: {
        question: {
          publicId: "question_public_123_copy",
          questionType: "single_choice",
          profession: "logistics",
          level: 4,
          subject: "theory",
          stemRichText: "<p>仓储作业应优先检查哪项？</p>",
          analysisRichText: "<p>老师解析内容</p>",
          standardAnswerRichText: "<p>A</p>",
          status: "available",
          isLocked: false,
          lockedAt: null,
          multiChoiceRule: "all_correct_only",
          scoringMethod: "auto_match",
          materialPublicId: "material_public_123",
          questionOptions: [
            {
              label: "A",
              contentRichText: "<p>核对入库单</p>",
              isCorrect: true,
              sortOrder: 1,
            },
            {
              label: "B",
              contentRichText: "<p>直接上架</p>",
              isCorrect: false,
              sortOrder: 2,
            },
          ],
          scoringPoints: [
            {
              description: "指出核对单据",
              score: "2.5",
              sortOrder: 1,
            },
          ],
          fillBlankAnswers: [],
          knowledgeNodePublicIds: ["knowledge_node_public_storage"],
          tagPublicIds: ["tag_public_storage"],
          createdAt: "2026-05-19T04:00:00.000Z",
          updatedAt: "2026-05-19T04:00:00.000Z",
        },
      },
    });
  });

  it("passes an explicit initial status for internal draft creation while normal creation defaults to available", async () => {
    const createdCalls: Array<{ options: unknown }> = [];
    const service = createQuestionService(
      createRepository({
        async createQuestion(input, _context, options) {
          createdCalls.push({ options });

          return createQuestion({
            question_type: input.questionType,
            profession: input.profession,
            level: input.level,
            subject: input.subject,
            stem_rich_text: input.stemRichText,
            analysis_rich_text: input.analysisRichText,
            standard_answer_rich_text: input.standardAnswerRichText,
            multi_choice_rule: input.multiChoiceRule,
            scoring_method: input.scoringMethod,
            fill_blank_answers: input.fillBlankAnswers,
            material_public_id: input.materialPublicId,
            knowledge_node_public_ids: input.knowledgeNodePublicIds,
            tag_public_ids: input.tagPublicIds,
            status: options?.initialStatus ?? "available",
          });
        },
      }),
    );
    const input = {
      questionType: "single_choice",
      profession: "logistics",
      level: 4,
      subject: "theory",
      stemRichText: "<p>Synthetic stem.</p>",
      analysisRichText: "<p>Synthetic analysis.</p>",
      standardAnswerRichText: "<p>A</p>",
      multiChoiceRule: "all_correct_only",
      scoringMethod: "auto_match",
      materialPublicId: null,
      questionOptions: [
        {
          label: "A",
          contentRichText: "<p>Synthetic option.</p>",
          isCorrect: true,
          sortOrder: 1,
        },
      ],
      scoringPoints: [],
      knowledgeNodePublicIds: [],
      tagPublicIds: [],
    };

    await expect(service.createQuestion(input)).resolves.toMatchObject({
      code: 0,
      data: {
        question: {
          status: "available",
        },
      },
    });
    await expect(
      service.createQuestion(input, { initialStatus: "disabled" }),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        question: {
          status: "disabled",
        },
      },
    });

    expect(createdCalls).toEqual([
      { options: undefined },
      { options: { initialStatus: "disabled" } },
    ]);
  });

  it.each(["case_analysis", "calculation"] as const)(
    "creates %s as a subjective question without options",
    async (questionType) => {
      const createdInputs: unknown[] = [];
      const service = createQuestionService(
        createRepository({
          async createQuestion(input) {
            createdInputs.push(input);

            return createQuestion({
              question_type: input.questionType,
              profession: input.profession,
              level: input.level,
              subject: input.subject,
              stem_rich_text: input.stemRichText,
              analysis_rich_text: input.analysisRichText,
              standard_answer_rich_text: input.standardAnswerRichText,
              multi_choice_rule: input.multiChoiceRule,
              scoring_method: input.scoringMethod,
              material_public_id: input.materialPublicId,
              knowledge_node_public_ids: input.knowledgeNodePublicIds,
              tag_public_ids: input.tagPublicIds,
              question_options: [],
              scoring_points: input.scoringPoints.map(
                (scoringPoint, index) => ({
                  id: 501 + index,
                  question_id: 201,
                  description: scoringPoint.description,
                  score: scoringPoint.score,
                  sort_order: scoringPoint.sortOrder,
                  created_at: createdAt,
                  updated_at: createdAt,
                }),
              ),
            });
          },
        }),
      );

      await expect(
        service.createQuestion({
          questionType,
          profession: "logistics",
          level: 4,
          subject: "skill",
          stemRichText: "<p>Synthetic stem.</p>",
          analysisRichText: "<p>Synthetic analysis.</p>",
          standardAnswerRichText: "<p>Synthetic reference.</p>",
          multiChoiceRule: "all_correct_only",
          scoringMethod: "ai_scoring",
          materialPublicId: "material_public_123",
          questionOptions: [],
          scoringPoints: [
            {
              description: "Synthetic scoring point",
              score: "2.0",
              sortOrder: 1,
            },
          ],
          knowledgeNodePublicIds: [],
          tagPublicIds: [],
        }),
      ).resolves.toMatchObject({
        code: 0,
        data: {
          question: {
            questionType,
            materialPublicId: "material_public_123",
            questionOptions: [],
            scoringMethod: "ai_scoring",
            scoringPoints: [
              {
                description: "Synthetic scoring point",
                score: "2.0",
                sortOrder: 1,
              },
            ],
          },
        },
      });
      expect(createdInputs).toEqual([
        expect.objectContaining({
          questionType,
          questionOptions: [],
          scoringMethod: "ai_scoring",
          knowledgeNodePublicIds: [],
          tagPublicIds: [],
        }),
      ]);
    },
  );

  it("rejects invalid input, missing question, and locked question update", async () => {
    const service = createQuestionService(
      createRepository({
        async findQuestionByPublicId(publicId) {
          if (publicId === "missing_question") {
            return null;
          }

          return createQuestion({
            public_id: publicId,
            is_locked: publicId === "locked_question",
            locked_at: publicId === "locked_question" ? lockedAt : null,
          });
        },
        async disableQuestion(publicId) {
          return publicId === "missing_question" ? null : createQuestion();
        },
        async copyQuestion(publicId) {
          return publicId === "missing_question" ? null : createQuestion();
        },
      }),
    );

    await expect(service.createQuestion({ stemRichText: "" })).resolves.toEqual(
      {
        code: 422202,
        message: "Invalid question input.",
        data: null,
      },
    );

    await expect(service.getQuestion("missing_question")).resolves.toEqual({
      code: 404202,
      message: "Question does not exist.",
      data: null,
    });

    await expect(
      service.updateQuestion("locked_question", {
        questionType: "short_answer",
        profession: "logistics",
        level: 4,
        subject: "theory",
        stemRichText: "<p>不可编辑</p>",
        analysisRichText: "<p>解析</p>",
        standardAnswerRichText: "<p>答案</p>",
        status: "available",
        multiChoiceRule: "all_correct_only",
        scoringMethod: "ai_scoring",
        materialPublicId: null,
        questionOptions: [],
        scoringPoints: [
          {
            description: "说明关键步骤",
            score: "2.0",
            sortOrder: 1,
          },
        ],
        knowledgeNodePublicIds: [],
        tagPublicIds: [],
      }),
    ).resolves.toEqual({
      code: 409202,
      message: "Locked question cannot be edited.",
      data: null,
    });

    await expect(service.disableQuestion("missing_question")).resolves.toEqual({
      code: 404202,
      message: "Question does not exist.",
      data: null,
    });

    await expect(service.copyQuestion("missing_question")).resolves.toEqual({
      code: 404202,
      message: "Question does not exist.",
      data: null,
    });
  });

  it("maps material association without exposing internal ids", async () => {
    const service = createQuestionService(createRepository());

    const response = await service.getQuestion("question_public_123");

    expect(response.data).toMatchObject({
      question: {
        publicId: "question_public_123",
        materialPublicId: "material_public_123",
      },
    });
    expect(JSON.stringify(response)).not.toContain('"id"');
    expect(JSON.stringify(response)).not.toContain("material_id");
  });
});

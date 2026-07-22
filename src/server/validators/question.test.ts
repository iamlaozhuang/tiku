import { describe, expect, it } from "vitest";

import {
  normalizeCreateQuestionInput,
  normalizeQuestionListInput,
  normalizeUpdateQuestionInput,
} from "./question";

function createSubjectiveQuestionInput(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    questionType: "case_analysis",
    profession: "logistics",
    level: 4,
    subject: "skill",
    stemRichText: "<p>Synthetic stem.</p>",
    analysisRichText: "<p>Synthetic analysis.</p>",
    standardAnswerRichText: "<p>Synthetic reference.</p>",
    multiChoiceRule: "all_correct_only",
    scoringMethod: "ai_scoring",
    materialPublicId: null,
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
    ...overrides,
  };
}

function createObjectiveQuestionInput(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    ...createSubjectiveQuestionInput(),
    questionType: "single_choice",
    scoringMethod: "auto_match",
    standardAnswerRichText: "<p>A</p>",
    questionOptions: [
      {
        label: "A",
        contentRichText: "<p>First answer.</p>",
        isCorrect: true,
        sortOrder: 1,
      },
      {
        label: "B",
        contentRichText: "<p>Second answer.</p>",
        isCorrect: false,
        sortOrder: 2,
      },
    ],
    scoringPoints: [],
    ...overrides,
  };
}

describe("question validator", () => {
  it.each(["easy", "medium", "hard"])(
    "preserves canonical question difficulty %s",
    (difficulty) => {
      expect(
        normalizeCreateQuestionInput(
          createObjectiveQuestionInput({ difficulty }),
        ),
      ).toMatchObject({
        success: true,
        value: { difficulty },
      });
    },
  );

  it("keeps omitted legacy difficulty null and rejects unknown values", () => {
    expect(
      normalizeCreateQuestionInput(createObjectiveQuestionInput()),
    ).toMatchObject({ success: true, value: { difficulty: null } });
    expect(
      normalizeCreateQuestionInput(
        createObjectiveQuestionInput({ difficulty: "extreme" }),
      ),
    ).toEqual({ success: false, message: "Invalid question input." });
  });

  it.each(["   ", "<p><br></p>", "<div>&nbsp;</div>", "<p>\u200B\u2060</p>"])(
    "rejects semantically empty required rich text: %s",
    (emptyRichText) => {
      expect(
        normalizeCreateQuestionInput(
          createObjectiveQuestionInput({ stemRichText: emptyRichText }),
        ),
      ).toEqual({
        success: false,
        message: "Invalid question input.",
      });
    },
  );

  it("accepts a managed image with an accessible description as meaningful rich text", () => {
    expect(
      normalizeCreateQuestionInput(
        createObjectiveQuestionInput({
          stemRichText:
            '<img src="/api/v1/content-images/content-image-public-1" data-content-image-public-id="content-image-public-1" alt="流程示意图" />',
        }),
      ),
    ).toMatchObject({ success: true });
  });

  it.each([
    {
      name: "single choice with fewer than two options",
      input: createObjectiveQuestionInput({
        questionOptions: [
          {
            label: "A",
            contentRichText: "Only answer.",
            isCorrect: true,
            sortOrder: 1,
          },
        ],
      }),
    },
    {
      name: "single choice with two correct options",
      input: createObjectiveQuestionInput({
        questionOptions: [
          {
            label: "A",
            contentRichText: "First answer.",
            isCorrect: true,
            sortOrder: 1,
          },
          {
            label: "B",
            contentRichText: "Second answer.",
            isCorrect: true,
            sortOrder: 2,
          },
        ],
      }),
    },
    {
      name: "single choice with answer inconsistent with correct option",
      input: createObjectiveQuestionInput({ standardAnswerRichText: "B" }),
    },
    {
      name: "multi choice with fewer than two correct options",
      input: createObjectiveQuestionInput({
        questionType: "multi_choice",
        standardAnswerRichText: "A",
      }),
    },
    {
      name: "multi choice with an inconsistent answer set",
      input: createObjectiveQuestionInput({
        questionType: "multi_choice",
        standardAnswerRichText: "A,C",
        questionOptions: [
          {
            label: "A",
            contentRichText: "First answer.",
            isCorrect: true,
            sortOrder: 1,
          },
          {
            label: "B",
            contentRichText: "Second answer.",
            isCorrect: true,
            sortOrder: 2,
          },
        ],
      }),
    },
    {
      name: "duplicate option labels",
      input: createObjectiveQuestionInput({
        questionOptions: [
          {
            label: "A",
            contentRichText: "First answer.",
            isCorrect: true,
            sortOrder: 1,
          },
          {
            label: "A",
            contentRichText: "Second answer.",
            isCorrect: false,
            sortOrder: 2,
          },
        ],
      }),
    },
    {
      name: "objective question with subjective scoring points",
      input: createObjectiveQuestionInput({
        scoringPoints: [
          {
            description: "Unexpected scoring point",
            score: "1.0",
            sortOrder: 1,
          },
        ],
      }),
    },
  ])("rejects $name", ({ input }) => {
    expect(normalizeCreateQuestionInput(input)).toEqual({
      success: false,
      message: "Invalid question input.",
    });
  });

  it("accepts a multi-choice answer set regardless of label order", () => {
    expect(
      normalizeCreateQuestionInput(
        createObjectiveQuestionInput({
          questionType: "multi_choice",
          standardAnswerRichText: "B,A",
          questionOptions: [
            {
              label: "A",
              contentRichText: "First answer.",
              isCorrect: true,
              sortOrder: 1,
            },
            {
              label: "B",
              contentRichText: "Second answer.",
              isCorrect: true,
              sortOrder: 2,
            },
          ],
        }),
      ),
    ).toMatchObject({ success: true });
  });

  it("preserves the true-false A/B display and internal answer mapping", () => {
    expect(
      normalizeCreateQuestionInput(
        createObjectiveQuestionInput({
          questionType: "true_false",
          standardAnswerRichText: "错误",
          questionOptions: [
            {
              label: "A",
              contentRichText: "正确",
              isCorrect: false,
              sortOrder: 1,
            },
            {
              label: "B",
              contentRichText: "错误",
              isCorrect: true,
              sortOrder: 2,
            },
          ],
        }),
      ),
    ).toMatchObject({ success: true });

    expect(
      normalizeCreateQuestionInput(
        createObjectiveQuestionInput({
          questionType: "true_false",
          questionOptions: [
            {
              label: "A",
              contentRichText: "错误",
              isCorrect: true,
              sortOrder: 1,
            },
            {
              label: "B",
              contentRichText: "正确",
              isCorrect: false,
              sortOrder: 2,
            },
          ],
        }),
      ),
    ).toEqual({ success: false, message: "Invalid question input." });
  });

  it("requires auto-match fill blanks and positive half-point scoring points", () => {
    expect(
      normalizeCreateQuestionInput(
        createSubjectiveQuestionInput({
          questionType: "fill_blank",
          scoringMethod: "auto_match",
          scoringPoints: [],
          fillBlankAnswers: [],
        }),
      ),
    ).toEqual({ success: false, message: "Invalid question input." });

    expect(
      normalizeCreateQuestionInput(
        createSubjectiveQuestionInput({
          questionType: "fill_blank",
          scoringMethod: "auto_match",
          scoringPoints: [],
          fillBlankAnswers: [
            {
              blankKey: "blank_1",
              standardAnswers: ["<p><br></p>"],
              score: "1.0",
              sortOrder: 1,
            },
          ],
        }),
      ),
    ).toEqual({ success: false, message: "Invalid question input." });

    expect(
      normalizeCreateQuestionInput(
        createSubjectiveQuestionInput({
          questionType: "fill_blank",
          scoringMethod: "auto_match",
          scoringPoints: [],
          fillBlankAnswers: [
            {
              blankKey: "blank_1",
              standardAnswers: ["Synthetic answer"],
              score: "0",
              sortOrder: 1,
            },
          ],
        }),
      ),
    ).toEqual({ success: false, message: "Invalid question input." });

    expect(
      normalizeCreateQuestionInput(
        createSubjectiveQuestionInput({
          scoringPoints: [
            { description: "Valid description", score: "0", sortOrder: 1 },
          ],
        }),
      ),
    ).toEqual({ success: false, message: "Invalid question input." });
  });

  it.each(["case_analysis", "calculation"] as const)(
    "accepts %s as a subjective text-answer question with scoring points",
    (questionType) => {
      expect(
        normalizeCreateQuestionInput(
          createSubjectiveQuestionInput({ questionType }),
        ),
      ).toMatchObject({
        success: true,
        value: {
          questionType,
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
      });
    },
  );

  it.each(["case_analysis", "calculation"] as const)(
    "rejects %s question options because it is subjective text-answer",
    (questionType) => {
      expect(
        normalizeCreateQuestionInput(
          createSubjectiveQuestionInput({
            questionType,
            questionOptions: [
              {
                label: "A",
                contentRichText: "<p>Option payload must not be accepted.</p>",
                isCorrect: true,
                sortOrder: 1,
              },
            ],
          }),
        ),
      ).toEqual({
        success: false,
        message: "Invalid question input.",
      });
    },
  );

  it("accepts knowledge_node and tag public identifier arrays for create and update", () => {
    const input = createSubjectiveQuestionInput({
      knowledgeNodePublicIds: ["knowledge_node_public_1"],
      tagPublicIds: ["tag_public_1", "tag_public_2"],
      status: "available",
      expectedUpdatedAt: "2026-05-19T04:00:00.000Z",
    });

    expect(normalizeCreateQuestionInput(input)).toMatchObject({
      success: true,
      value: {
        knowledgeNodePublicIds: ["knowledge_node_public_1"],
        tagPublicIds: ["tag_public_1", "tag_public_2"],
      },
    });
    const updateResult = normalizeUpdateQuestionInput(input);

    expect(updateResult).toMatchObject({
      success: true,
      value: {
        knowledgeNodePublicIds: ["knowledge_node_public_1"],
        tagPublicIds: ["tag_public_1", "tag_public_2"],
      },
    });
    expect(updateResult.success && updateResult.value.difficulty).toBe(
      undefined,
    );
  });

  it("requires a canonical optimistic concurrency timestamp for update", () => {
    expect(
      normalizeUpdateQuestionInput(
        createObjectiveQuestionInput({ status: "available" }),
      ),
    ).toEqual({ success: false, message: "Invalid question input." });
    expect(
      normalizeUpdateQuestionInput(
        createObjectiveQuestionInput({
          status: "available",
          expectedUpdatedAt: "2026-05-19T04:00:00Z",
        }),
      ),
    ).toEqual({ success: false, message: "Invalid question input." });
  });

  it("rejects malformed knowledge_node and tag public identifier arrays", () => {
    expect(
      normalizeCreateQuestionInput(
        createSubjectiveQuestionInput({
          knowledgeNodePublicIds: ["knowledge_node_public_1", ""],
        }),
      ),
    ).toEqual({
      success: false,
      message: "Invalid question input.",
    });
    expect(
      normalizeCreateQuestionInput(
        createSubjectiveQuestionInput({
          tagPublicIds: "tag_public_1",
        }),
      ),
    ).toEqual({
      success: false,
      message: "Invalid question input.",
    });
  });

  it("normalizes knowledge_node and tag public identifier list filters", () => {
    expect(
      normalizeQuestionListInput({
        knowledgeNodePublicId: " knowledge_node_public_1 ",
        tagPublicId: " tag_public_1 ",
      }),
    ).toMatchObject({
      knowledgeNodePublicId: "knowledge_node_public_1",
      tagPublicId: "tag_public_1",
    });

    expect(
      normalizeQuestionListInput({
        knowledgeNodePublicId: "",
        tagPublicId: 123,
      }),
    ).toMatchObject({
      knowledgeNodePublicId: null,
      tagPublicId: null,
    });
  });

  it("accepts structured fill_blank per-blank answers for auto-match scoring", () => {
    expect(
      normalizeCreateQuestionInput(
        createSubjectiveQuestionInput({
          questionType: "fill_blank",
          scoringMethod: "auto_match",
          scoringPoints: [],
          standardAnswerRichText: "<p>客户动机；消费频率</p>",
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
              score: 1,
              sortOrder: 2,
            },
          ],
        }),
      ),
    ).toMatchObject({
      success: true,
      value: {
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
    });
  });

  it("rejects malformed or misplaced fill_blank per-blank answers", () => {
    expect(
      normalizeCreateQuestionInput(
        createSubjectiveQuestionInput({
          questionType: "fill_blank",
          fillBlankAnswers: [
            {
              blankKey: "blank_1",
              standardAnswers: [],
              score: "1.0",
              sortOrder: 1,
            },
          ],
        }),
      ),
    ).toEqual({
      success: false,
      message: "Invalid question input.",
    });

    expect(
      normalizeCreateQuestionInput(
        createSubjectiveQuestionInput({
          fillBlankAnswers: [
            {
              blankKey: "blank_1",
              standardAnswers: ["客户动机"],
              score: "1.0",
              sortOrder: 1,
            },
          ],
        }),
      ),
    ).toEqual({
      success: false,
      message: "Invalid question input.",
    });
  });

  it("normalizes the optional material filter used by material-first composition", () => {
    expect(
      normalizeQuestionListInput({
        materialPublicId: " material_public_case_1 ",
      }),
    ).toMatchObject({ materialPublicId: "material_public_case_1" });

    expect(normalizeQuestionListInput({ materialPublicId: 123 })).toMatchObject(
      { materialPublicId: null },
    );
  });
});

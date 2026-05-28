import { describe, expect, it } from "vitest";

import {
  normalizeCreateQuestionInput,
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

describe("question validator", () => {
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
    });

    expect(normalizeCreateQuestionInput(input)).toMatchObject({
      success: true,
      value: {
        knowledgeNodePublicIds: ["knowledge_node_public_1"],
        tagPublicIds: ["tag_public_1", "tag_public_2"],
      },
    });
    expect(normalizeUpdateQuestionInput(input)).toMatchObject({
      success: true,
      value: {
        knowledgeNodePublicIds: ["knowledge_node_public_1"],
        tagPublicIds: ["tag_public_1", "tag_public_2"],
      },
    });
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
});

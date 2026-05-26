import { describe, expect, it } from "vitest";

import { normalizeCreateQuestionInput } from "./question";

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
});

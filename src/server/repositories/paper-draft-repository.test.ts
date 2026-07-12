import { describe, expect, it } from "vitest";

import { createPaperQuestionSectionMovePlan } from "./paper-draft-repository";

describe("paper question section move planning", () => {
  it("moves a standalone paper question without rebuilding its snapshot", () => {
    expect(
      createPaperQuestionSectionMovePlan({
        paperQuestionId: 11,
        questionGroupId: null,
        sourcePaperSectionId: 21,
        targetPaperSectionId: 22,
      }),
    ).toEqual({
      kind: "paper_question",
      paperQuestionId: 11,
      sourcePaperSectionId: 21,
      targetPaperSectionId: 22,
    });
  });

  it("moves a material group atomically instead of detaching one child", () => {
    expect(
      createPaperQuestionSectionMovePlan({
        paperQuestionId: 11,
        questionGroupId: 31,
        sourcePaperSectionId: 21,
        targetPaperSectionId: 22,
      }),
    ).toEqual({
      kind: "question_group",
      questionGroupId: 31,
      sourcePaperSectionId: 21,
      targetPaperSectionId: 22,
    });
  });
});

import { describe, expect, it } from "vitest";

import {
  PAPER_QUESTION_COUNT_LIMIT,
  validateDraftPaperQuestionCount,
  validatePublishedPaperQuestionCount,
} from "./paper-draft";

describe("paper draft question count validation", () => {
  it("allows draft papers with 0 to 100 questions and rejects 101 questions", () => {
    expect(validateDraftPaperQuestionCount(0)).toEqual({ success: true });
    expect(validateDraftPaperQuestionCount(PAPER_QUESTION_COUNT_LIMIT)).toEqual(
      { success: true },
    );
    expect(
      validateDraftPaperQuestionCount(PAPER_QUESTION_COUNT_LIMIT + 1),
    ).toEqual({
      success: false,
      message: "Draft paper cannot contain more than 100 questions.",
    });
  });

  it("allows published papers with 1 to 100 questions and rejects 0 or 101 questions", () => {
    expect(validatePublishedPaperQuestionCount(0)).toEqual({
      success: false,
      message: "Published paper must contain 1 to 100 questions.",
    });
    expect(validatePublishedPaperQuestionCount(1)).toEqual({ success: true });
    expect(
      validatePublishedPaperQuestionCount(PAPER_QUESTION_COUNT_LIMIT),
    ).toEqual({ success: true });
    expect(
      validatePublishedPaperQuestionCount(PAPER_QUESTION_COUNT_LIMIT + 1),
    ).toEqual({
      success: false,
      message: "Published paper must contain 1 to 100 questions.",
    });
  });
});

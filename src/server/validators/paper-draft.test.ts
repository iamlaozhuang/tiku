import { describe, expect, it } from "vitest";

import {
  normalizeAddPaperQuestionInput,
  normalizePaperCommandInput,
  normalizeUpdatePaperQuestionInput,
  PAPER_QUESTION_COUNT_LIMIT,
  validateDraftPaperQuestionCount,
  validatePublishedPaperQuestionCount,
} from "./paper-draft";

describe("paper question composition update validation", () => {
  it("accepts a target paper_section while preserving score and scoring points", () => {
    expect(
      normalizeUpdatePaperQuestionInput({
        expectedRevision: 3,
        score: "6.0",
        sortOrder: 2,
        scoringPoints: [
          { description: "关键步骤", score: "6.0", sortOrder: 1 },
        ],
        paperSection: {
          title: "案例分析",
          description: "综合应用",
          sortOrder: 3,
        },
      }),
    ).toEqual({
      success: true,
      value: {
        expectedRevision: 3,
        score: "6.0",
        sortOrder: 2,
        scoringPoints: [
          { description: "关键步骤", score: "6.0", sortOrder: 1 },
        ],
        paperSection: {
          title: "案例分析",
          description: "综合应用",
          sortOrder: 3,
        },
      },
    });
  });

  it("rejects a malformed target paper_section", () => {
    expect(
      normalizeUpdatePaperQuestionInput({
        expectedRevision: 3,
        score: "6.0",
        sortOrder: 2,
        scoringPoints: [],
        paperSection: { title: "", description: null, sortOrder: 0 },
      }),
    ).toEqual({ success: false, message: "Invalid paper input." });
  });

  it("requires revision and command identity and distinguishes group create from join", () => {
    const baseInput = {
      commandPublicId: "paper-command-public-1",
      expectedRevision: 2,
      questionPublicId: "question-public-1",
      score: "2.0",
      sortOrder: 1,
      paperSection: { title: "单选题", description: null, sortOrder: 1 },
    };

    expect(
      normalizeAddPaperQuestionInput({
        ...baseInput,
        questionGroup: {
          publicId: "question-group-public-1",
          title: "材料一",
          materialPublicId: "material-public-1",
          sortOrder: 1,
        },
      }),
    ).toMatchObject({
      success: true,
      value: {
        commandPublicId: "paper-command-public-1",
        expectedRevision: 2,
        questionGroup: { publicId: "question-group-public-1" },
      },
    });
    expect(
      normalizeAddPaperQuestionInput({
        ...baseInput,
        questionGroup: {
          publicId: null,
          title: "材料一",
          materialPublicId: "material-public-1",
          sortOrder: 1,
        },
      }),
    ).toMatchObject({
      success: true,
      value: { questionGroup: { publicId: null } },
    });
    expect(normalizePaperCommandInput({ expectedRevision: 2 })).toEqual({
      success: false,
      message: "Invalid paper input.",
    });
  });
});

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

import { describe, expect, it } from "vitest";

import {
  normalizeAddPaperQuestionInput,
  normalizePaperCommandInput,
  normalizePaperSectionCommandInput,
  normalizeQuestionGroupCommandInput,
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

describe("paper structure command validation", () => {
  it("accepts strict section create, update, reorder, and delete commands", () => {
    expect(
      normalizePaperSectionCommandInput({
        action: "create",
        expectedRevision: 4,
        title: "案例分析",
        description: null,
        sortOrder: 2,
      }),
    ).toMatchObject({ success: true, value: { action: "create" } });
    expect(
      normalizePaperSectionCommandInput({
        action: "update",
        expectedRevision: 4,
        paperSectionPublicId: "paper_section_public_1",
        title: "综合案例",
        description: "更新说明",
      }),
    ).toMatchObject({ success: true, value: { action: "update" } });
    expect(
      normalizePaperSectionCommandInput({
        action: "reorder",
        expectedRevision: 4,
        paperSectionPublicIds: [
          "paper_section_public_2",
          "paper_section_public_1",
        ],
      }),
    ).toMatchObject({ success: true, value: { action: "reorder" } });
    expect(
      normalizePaperSectionCommandInput({
        action: "delete",
        expectedRevision: 4,
        paperSectionPublicId: "paper_section_public_1",
      }),
    ).toMatchObject({ success: true, value: { action: "delete" } });
  });

  it("rejects duplicate or malformed section identities", () => {
    expect(
      normalizePaperSectionCommandInput({
        action: "reorder",
        expectedRevision: 4,
        paperSectionPublicIds: [
          "paper_section_public_1",
          "paper_section_public_1",
        ],
      }),
    ).toEqual({ success: false, message: "Invalid paper input." });
    expect(
      normalizePaperSectionCommandInput({
        action: "delete",
        expectedRevision: 0,
        paperSectionPublicId: "",
      }),
    ).toEqual({ success: false, message: "Invalid paper input." });
  });

  it("accepts group lifecycle and explicit membership commands", () => {
    expect(
      normalizeQuestionGroupCommandInput({
        action: "create",
        expectedRevision: 5,
        paperSectionPublicId: "paper_section_public_1",
        materialPublicId: "material_public_1",
        title: "材料题组",
        sortOrder: 1,
      }),
    ).toMatchObject({ success: true, value: { action: "create" } });
    expect(
      normalizeQuestionGroupCommandInput({
        action: "reorder",
        expectedRevision: 5,
        paperSectionPublicId: "paper_section_public_1",
        questionGroupPublicIds: ["question_group_public_2"],
      }),
    ).toMatchObject({ success: true, value: { action: "reorder" } });
    expect(
      normalizeQuestionGroupCommandInput({
        action: "set_question_membership",
        expectedRevision: 5,
        paperQuestionPublicId: "paper_question_public_1",
        questionGroupPublicId: "question_group_public_2",
      }),
    ).toMatchObject({
      success: true,
      value: { action: "set_question_membership" },
    });
    expect(
      normalizeQuestionGroupCommandInput({
        action: "set_question_membership",
        expectedRevision: 5,
        paperQuestionPublicId: "paper_question_public_1",
        questionGroupPublicId: null,
        paperSectionPublicId: "paper_section_public_1",
      }),
    ).toMatchObject({
      success: true,
      value: { action: "set_question_membership" },
    });
  });

  it("rejects ambiguous standalone membership and duplicate group reorder identities", () => {
    expect(
      normalizeQuestionGroupCommandInput({
        action: "set_question_membership",
        expectedRevision: 5,
        paperQuestionPublicId: "paper_question_public_1",
        questionGroupPublicId: null,
      }),
    ).toEqual({ success: false, message: "Invalid paper input." });
    expect(
      normalizeQuestionGroupCommandInput({
        action: "reorder",
        expectedRevision: 5,
        paperSectionPublicId: "paper_section_public_1",
        questionGroupPublicIds: [
          "question_group_public_1",
          "question_group_public_1",
        ],
      }),
    ).toEqual({ success: false, message: "Invalid paper input." });
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

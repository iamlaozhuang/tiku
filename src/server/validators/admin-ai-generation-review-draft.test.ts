import { describe, expect, it } from "vitest";

import {
  normalizeAdminAiGenerationReviewDraftCommand,
  normalizeAdminAiGenerationReviewedDraft,
} from "./admin-ai-generation-review-draft";

function createQuestionDraft() {
  return {
    questionType: "single_choice",
    profession: "marketing",
    level: 3,
    subject: "theory",
    difficulty: "medium",
    stemRichText: "<p>规范题干</p>",
    analysisRichText: "<p>规范解析</p>",
    standardAnswerRichText: "A",
    multiChoiceRule: "all_correct_only",
    scoringMethod: "auto_match",
    materialPublicId: null,
    questionOptions: [
      {
        label: "A",
        contentRichText: "正确选项",
        isCorrect: true,
        sortOrder: 1,
      },
      {
        label: "B",
        contentRichText: "错误选项",
        isCorrect: false,
        sortOrder: 2,
      },
    ],
    scoringPoints: [],
    fillBlankAnswers: [],
    knowledgeNodePublicIds: ["knowledge_node_public_1"],
    tagPublicIds: [],
  };
}

function createPaperDraft() {
  return {
    name: "营销理论试卷",
    profession: "marketing",
    level: 3,
    subject: "theory",
    paperType: "mock_paper",
    year: 2026,
    month: 7,
    sourceDescription: null,
    sourceRegion: null,
    sourceOrganization: null,
    questionBasis: null,
    generationMethod: "ai",
    durationMinute: 90,
    totalScore: "100",
    paperSections: [
      {
        title: "单选题",
        description: null,
        sortOrder: 1,
        paperQuestions: [
          {
            questionPublicId: "question_public_1",
            companionQuestionDraft: null,
            score: "2",
            sortOrder: 1,
            questionGroup: null,
          },
        ],
      },
    ],
  };
}

describe("admin AI generation review draft validator", () => {
  it("accepts only an exact bounded draft command and strips no business fields", () => {
    const reviewedDraft = createQuestionDraft();
    const result = normalizeAdminAiGenerationReviewDraftCommand({
      expectedRevision: 0,
      expectedDraftDigest:
        "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      targetType: "question",
      reviewedDraft,
    });

    expect(result).toEqual({
      success: true,
      value: {
        expectedRevision: 0,
        expectedDraftDigest:
          "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        targetType: "question",
        reviewedDraft,
      },
    });
  });

  it.each([
    ["unknown identity", { ownerPublicId: "admin_public_1" }],
    ["client source", { sourceContentDigest: "sha256:unsafe" }],
    ["provider data", { providerPayload: { raw: true } }],
    ["citation data", { citation: { chunk: "secret" } }],
  ])("rejects %s fields", (_name, extra) => {
    expect(
      normalizeAdminAiGenerationReviewDraftCommand({
        expectedRevision: null,
        expectedDraftDigest: null,
        targetType: "question",
        reviewedDraft: createQuestionDraft(),
        ...extra,
      }),
    ).toEqual({
      success: false,
      message: "Invalid admin AI generation review draft input.",
    });
  });

  it("requires legacy predecessor fields to be null together", () => {
    expect(
      normalizeAdminAiGenerationReviewDraftCommand({
        expectedRevision: null,
        expectedDraftDigest:
          "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        targetType: "question",
        reviewedDraft: createQuestionDraft(),
      }).success,
    ).toBe(false);
  });

  it("preserves server-owned unresolved knowledge candidates for initial revision but rejects them as client edits", () => {
    const candidate = {
      ...createQuestionDraft(),
      knowledgeNodePublicIds: [],
      knowledgeNodeConfirmation: {
        schemaVersion: 1,
        status: "unresolved",
        generationMode: "balanced",
        requestPublicId: "request_public_1",
        resultPublicId: "result_public_1",
        taskPublicId: "task_public_1",
        sourceContentDigest:
          "sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        generatedLabels: ["营销基础"],
      },
    };

    expect(
      normalizeAdminAiGenerationReviewedDraft("question", candidate, {
        allowUnresolvedKnowledgeCandidate: true,
      }),
    ).toMatchObject({ knowledgeNodeConfirmation: { status: "unresolved" } });
    expect(
      normalizeAdminAiGenerationReviewDraftCommand({
        expectedRevision: 0,
        expectedDraftDigest:
          "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        targetType: "question",
        reviewedDraft: candidate,
      }),
    ).toMatchObject({ success: false });
  });

  it("rejects incomplete, unknown-field and oversized structured drafts", () => {
    expect(
      normalizeAdminAiGenerationReviewDraftCommand({
        expectedRevision: 0,
        expectedDraftDigest:
          "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        targetType: "question",
        reviewedDraft: {
          ...createQuestionDraft(),
          unknownField: true,
        },
      }).success,
    ).toBe(false);
    expect(
      normalizeAdminAiGenerationReviewDraftCommand({
        expectedRevision: 0,
        expectedDraftDigest:
          "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        targetType: "question",
        reviewedDraft: {
          ...createQuestionDraft(),
          stemRichText: "x".repeat(300_000),
        },
      }).success,
    ).toBe(false);
  });

  it("rejects paper sections that do not match the formal nested contract", () => {
    const paperDraft = createPaperDraft();
    expect(
      normalizeAdminAiGenerationReviewDraftCommand({
        expectedRevision: 0,
        expectedDraftDigest:
          "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        targetType: "paper",
        reviewedDraft: paperDraft,
      }).success,
    ).toBe(true);

    expect(
      normalizeAdminAiGenerationReviewDraftCommand({
        expectedRevision: 0,
        expectedDraftDigest:
          "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        targetType: "paper",
        reviewedDraft: {
          ...paperDraft,
          paperSections: [
            {
              ...paperDraft.paperSections[0],
              paperQuestions: [
                {
                  ...paperDraft.paperSections[0].paperQuestions[0],
                  companionQuestionDraft: createQuestionDraft(),
                },
              ],
            },
          ],
        },
      }).success,
    ).toBe(false);
  });
});

import { describe, expect, it } from "vitest";

import {
  createAdminAiGenerationReviewDraftDigest,
  createAdminAiGenerationReviewDraftPublicId,
  resolveNextAdminAiGenerationReviewDraftRevision,
} from "./admin-ai-generation-review-draft-repository";

const reviewedDraft = {
  name: "AI 评审试卷",
  profession: "marketing" as const,
  level: 3,
  subject: "theory" as const,
  paperType: "mock_paper" as const,
  year: 2026,
  month: 7,
  sourceDescription: null,
  sourceRegion: null,
  sourceOrganization: null,
  questionBasis: null,
  generationMethod: "ai" as const,
  durationMinute: 90,
  totalScore: "100",
};

describe("admin AI generation review draft repository", () => {
  it("canonicalizes object keys and binds result, source, target, revision and full draft", () => {
    const input = {
      resultPublicId: "admin_ai_generation_result_public_1",
      sourceContentDigest: "sha256:source-content-1",
      targetType: "paper" as const,
      revision: 0,
      reviewedDraft,
    };

    const digest = createAdminAiGenerationReviewDraftDigest(input);
    const reorderedDigest = createAdminAiGenerationReviewDraftDigest({
      ...input,
      reviewedDraft: Object.fromEntries(
        Object.entries(reviewedDraft).reverse(),
      ) as typeof reviewedDraft,
    });

    expect(digest).toMatch(/^sha256:[0-9a-f]{64}$/u);
    expect(reorderedDigest).toBe(digest);
    expect(
      createAdminAiGenerationReviewDraftDigest({ ...input, revision: 1 }),
    ).not.toBe(digest);
    expect(
      createAdminAiGenerationReviewDraftDigest({
        ...input,
        sourceContentDigest: "sha256:source-content-2",
      }),
    ).not.toBe(digest);
    expect(createAdminAiGenerationReviewDraftPublicId(input)).toMatch(
      /^admin_ai_review_draft_[0-9a-f]{48}$/u,
    );
  });

  it("starts new and legacy results at revision zero and advances without gaps", () => {
    expect(resolveNextAdminAiGenerationReviewDraftRevision(null)).toBe(0);
    expect(resolveNextAdminAiGenerationReviewDraftRevision(0)).toBe(1);
    expect(resolveNextAdminAiGenerationReviewDraftRevision(9)).toBe(10);
    expect(() => resolveNextAdminAiGenerationReviewDraftRevision(-1)).toThrow(
      "unsafe admin AI generation review draft revision",
    );
  });
});

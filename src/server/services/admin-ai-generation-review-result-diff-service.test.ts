import { describe, expect, it } from "vitest";

import type { AdminAiGenerationReviewResultDiffSource } from "../contracts/admin-ai-generation-formal-adoption-contract";
import { createAdminAiGenerationReviewResultDiff } from "./admin-ai-generation-review-result-diff-service";

function createDiffSource(
  overrides: Partial<AdminAiGenerationReviewResultDiffSource> = {},
): AdminAiGenerationReviewResultDiffSource {
  return {
    resultPublicId: "admin_ai_generation_result_public_201",
    adoptionPublicId: "admin_ai_generation_adoption_public_201",
    taskPublicId: "admin_ai_generation_task_public_201",
    requestPublicId: "admin_ai_generation_request_public_201",
    targetType: "question",
    targetDomain: "platform_formal_content",
    formalTargetWriteStatus: "draft_created",
    formalQuestionPublicId: "formal_question_public_201",
    formalPaperPublicId: null,
    reviewerPublicId: "content_admin_public_201",
    reviewedAt: "2026-06-27T09:00:00.000Z",
    generatedResult: {
      contentDigest: "sha256:generated-result",
      contentPreviewMasked: "masked generated question preview",
      evidenceStatus: "weak",
      citationCount: 2,
      aiCallLogPublicId: "ai_call_log_public_201",
      redactionStatus: "redacted",
    },
    adoptedDraft: {
      draftPublicId: "formal_question_public_201",
      contentDigest: "sha256:adopted-draft",
      contentPreviewMasked: "masked adopted draft preview",
      evidenceStatus: "weak",
      citationCount: 2,
      redactionStatus: "redacted",
    },
    fields: [
      {
        fieldKey: "question",
        generatedResultDigest: "sha256:question-generated",
        generatedResultPreviewMasked: "masked generated question",
        adoptedDraftDigest: "sha256:question-adopted",
        adoptedDraftPreviewMasked: "masked adopted question",
      },
      {
        fieldKey: "analysis",
        generatedResultDigest: "sha256:analysis-same",
        generatedResultPreviewMasked: "masked shared analysis",
        adoptedDraftDigest: "sha256:analysis-same",
        adoptedDraftPreviewMasked: "masked shared analysis",
      },
      {
        fieldKey: "scoring_point",
        generatedResultDigest: "sha256:scoring-point-generated",
        generatedResultPreviewMasked: "masked generated scoring point",
        adoptedDraftDigest: null,
        adoptedDraftPreviewMasked: null,
      },
    ],
    redactionStatus: "redacted",
    ...overrides,
  };
}

describe("admin AI generation review result diff service", () => {
  it("creates a redacted generated-result vs adopted-draft diff read-model", () => {
    const protectedInputArtifact = "PROTECTED_INPUT_ARTIFACT_MUST_NOT_LEAK";
    const protectedGeneratedArtifact =
      "PROTECTED_GENERATED_ARTIFACT_MUST_NOT_LEAK";
    const protectedExternalArtifact =
      "PROTECTED_EXTERNAL_ARTIFACT_MUST_NOT_LEAK";
    const source = {
      ...createDiffSource(),
      protectedInputArtifact,
      protectedGeneratedArtifact,
      protectedExternalArtifact,
    } as AdminAiGenerationReviewResultDiffSource & {
      protectedInputArtifact: string;
      protectedGeneratedArtifact: string;
      protectedExternalArtifact: string;
    };

    const diff = createAdminAiGenerationReviewResultDiff(source);
    const serializedDiff = JSON.stringify(diff);

    expect(diff).toEqual({
      diffStatus: "ready",
      resultPublicId: "admin_ai_generation_result_public_201",
      adoptionPublicId: "admin_ai_generation_adoption_public_201",
      taskPublicId: "admin_ai_generation_task_public_201",
      requestPublicId: "admin_ai_generation_request_public_201",
      target: {
        targetType: "question",
        targetDomain: "platform_formal_content",
        formalTargetWriteStatus: "draft_created",
        formalQuestionPublicId: "formal_question_public_201",
        formalPaperPublicId: null,
      },
      sourceSummary: {
        contentDigest: "sha256:generated-result",
        contentPreviewMasked: "masked generated question preview",
        evidenceStatus: "weak",
        citationCount: 2,
        aiCallLogPublicId: "ai_call_log_public_201",
        redactionStatus: "redacted",
      },
      adoptedDraftSummary: {
        draftPublicId: "formal_question_public_201",
        contentDigest: "sha256:adopted-draft",
        contentPreviewMasked: "masked adopted draft preview",
        evidenceStatus: "weak",
        citationCount: 2,
        redactionStatus: "redacted",
      },
      diffSummary: {
        fieldCount: 3,
        changedCount: 1,
        unchangedCount: 1,
        generatedResultOnlyCount: 1,
        adoptedDraftOnlyCount: 0,
      },
      fields: [
        {
          fieldKey: "question",
          changeStatus: "changed",
          generatedResult: {
            contentDigest: "sha256:question-generated",
            contentPreviewMasked: "masked generated question",
            redactionStatus: "redacted",
          },
          adoptedDraft: {
            contentDigest: "sha256:question-adopted",
            contentPreviewMasked: "masked adopted question",
            redactionStatus: "redacted",
          },
          redactionStatus: "redacted",
        },
        {
          fieldKey: "analysis",
          changeStatus: "unchanged",
          generatedResult: {
            contentDigest: "sha256:analysis-same",
            contentPreviewMasked: "masked shared analysis",
            redactionStatus: "redacted",
          },
          adoptedDraft: {
            contentDigest: "sha256:analysis-same",
            contentPreviewMasked: "masked shared analysis",
            redactionStatus: "redacted",
          },
          redactionStatus: "redacted",
        },
        {
          fieldKey: "scoring_point",
          changeStatus: "generated_result_only",
          generatedResult: {
            contentDigest: "sha256:scoring-point-generated",
            contentPreviewMasked: "masked generated scoring point",
            redactionStatus: "redacted",
          },
          adoptedDraft: null,
          redactionStatus: "redacted",
        },
      ],
      readBoundary: {
        readOnly: true,
        rawPromptExposed: false,
        rawGeneratedOutputExposed: false,
        providerPayloadExposed: false,
        mutationStatus: "not_executed",
        publishStatus: "not_executed",
        redactionStatus: "redacted",
      },
      reviewedBy: {
        reviewerPublicId: "content_admin_public_201",
        reviewedAt: "2026-06-27T09:00:00.000Z",
      },
      redactionStatus: "redacted",
    });
    expect(serializedDiff).not.toContain(protectedInputArtifact);
    expect(serializedDiff).not.toContain(protectedGeneratedArtifact);
    expect(serializedDiff).not.toContain(protectedExternalArtifact);
    expect(serializedDiff).not.toMatch(/"id":/u);
  });

  it("blocks the diff read-model when the adopted draft summary is missing", () => {
    const diff = createAdminAiGenerationReviewResultDiff(
      createDiffSource({
        adoptedDraft: null,
      }),
    );

    expect(diff.diffStatus).toBe("blocked_missing_adopted_draft");
    expect(diff.adoptedDraftSummary).toBeNull();
    expect(diff.readBoundary).toMatchObject({
      readOnly: true,
      mutationStatus: "not_executed",
      publishStatus: "not_executed",
    });
  });
});

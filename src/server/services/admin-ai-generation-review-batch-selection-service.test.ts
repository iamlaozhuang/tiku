import { describe, expect, it } from "vitest";

import type { AdminAiGenerationReviewBatchSelectionSource } from "../contracts/admin-ai-generation-formal-adoption-contract";
import { createAdminAiGenerationReviewBatchSelectionPreview } from "./admin-ai-generation-review-batch-selection-service";

function createCandidate(
  overrides: Partial<AdminAiGenerationReviewBatchSelectionSource> = {},
): AdminAiGenerationReviewBatchSelectionSource {
  return {
    resultPublicId: "admin_ai_generation_result_public_101",
    taskPublicId: "admin_ai_generation_task_public_101",
    requestPublicId: "admin_ai_generation_request_public_101",
    workspace: "content",
    generationKind: "question",
    ownerType: "platform",
    ownerPublicId: "platform_content_review_pool",
    organizationPublicId: null,
    taskType: "ai_question_generation",
    resultStatus: "draft",
    isFormalAdoptionBlocked: true,
    contentDigest: "sha256:admin_ai_generation_result_101",
    contentPreviewMasked: "masked question result preview",
    evidenceStatus: "weak",
    citationCount: 2,
    generatedAt: "2026-06-27T07:00:00.000Z",
    ...overrides,
  };
}

describe("admin AI generation review batch selection service", () => {
  it("creates a redacted preview-only batch candidate selection contract", () => {
    const protectedInputArtifact = "PROTECTED_INPUT_ARTIFACT_MUST_NOT_LEAK";
    const protectedOutputArtifact = "PROTECTED_OUTPUT_ARTIFACT_MUST_NOT_LEAK";
    const protectedProviderArtifact =
      "PROTECTED_PROVIDER_ARTIFACT_MUST_NOT_LEAK";
    const eligibleCandidate = {
      ...createCandidate(),
      protectedInputArtifact,
      protectedOutputArtifact,
      protectedProviderArtifact,
    } as AdminAiGenerationReviewBatchSelectionSource & {
      protectedInputArtifact: string;
      protectedOutputArtifact: string;
      protectedProviderArtifact: string;
    };

    const preview = createAdminAiGenerationReviewBatchSelectionPreview({
      candidates: [
        eligibleCandidate,
        createCandidate({
          resultPublicId: "admin_ai_generation_result_public_organization",
          workspace: "organization",
          ownerType: "organization",
          ownerPublicId: "organization_public_101",
          organizationPublicId: "organization_public_101",
        }),
        createCandidate({
          resultPublicId: "admin_ai_generation_result_public_unblocked",
          isFormalAdoptionBlocked: false,
        }),
      ],
      selectedResultPublicIds: ["admin_ai_generation_result_public_101"],
      targetType: "question",
    });
    const serializedPreview = JSON.stringify(preview);

    expect(preview).toEqual({
      previewStatus: "ready",
      targetType: "question",
      selectionMode: "manual_batch_preview",
      batchAdoptionMutationStatus: "not_executed",
      validationState: {
        candidateCount: 3,
        eligibleCount: 1,
        blockedCount: 2,
        selectedCount: 1,
        invalidSelectedCount: 0,
        previewOnly: true,
      },
      candidates: [
        {
          resultPublicId: "admin_ai_generation_result_public_101",
          taskPublicId: "admin_ai_generation_task_public_101",
          requestPublicId: "admin_ai_generation_request_public_101",
          generationKind: "question",
          validationStatus: "eligible",
          blockedReason: null,
          selectionState: "selected",
          contentPreviewMasked: "masked question result preview",
          contentDigest: "sha256:admin_ai_generation_result_101",
          evidenceStatus: "weak",
          citationCount: 2,
          generatedAt: "2026-06-27T07:00:00.000Z",
          formalTargetWriteStatus: "blocked_without_follow_up_task",
          batchAdoptionMutationStatus: "not_executed",
          redactionStatus: "redacted",
        },
        {
          resultPublicId: "admin_ai_generation_result_public_organization",
          taskPublicId: "admin_ai_generation_task_public_101",
          requestPublicId: "admin_ai_generation_request_public_101",
          generationKind: "question",
          validationStatus: "blocked",
          blockedReason: "blocked_non_content_workspace",
          selectionState: "blocked",
          contentPreviewMasked: "masked question result preview",
          contentDigest: "sha256:admin_ai_generation_result_101",
          evidenceStatus: "weak",
          citationCount: 2,
          generatedAt: "2026-06-27T07:00:00.000Z",
          formalTargetWriteStatus: "blocked_without_follow_up_task",
          batchAdoptionMutationStatus: "not_executed",
          redactionStatus: "redacted",
        },
        {
          resultPublicId: "admin_ai_generation_result_public_unblocked",
          taskPublicId: "admin_ai_generation_task_public_101",
          requestPublicId: "admin_ai_generation_request_public_101",
          generationKind: "question",
          validationStatus: "blocked",
          blockedReason: "blocked_formal_adoption_not_blocked",
          selectionState: "blocked",
          contentPreviewMasked: "masked question result preview",
          contentDigest: "sha256:admin_ai_generation_result_101",
          evidenceStatus: "weak",
          citationCount: 2,
          generatedAt: "2026-06-27T07:00:00.000Z",
          formalTargetWriteStatus: "blocked_without_follow_up_task",
          batchAdoptionMutationStatus: "not_executed",
          redactionStatus: "redacted",
        },
      ],
      redactionStatus: "redacted",
    });
    expect(serializedPreview).not.toContain(protectedInputArtifact);
    expect(serializedPreview).not.toContain(protectedOutputArtifact);
    expect(serializedPreview).not.toContain(protectedProviderArtifact);
    expect(serializedPreview).not.toMatch(/"id":/u);
  });

  it("marks selected blocked candidates as invalid without enabling adoption mutation", () => {
    const preview = createAdminAiGenerationReviewBatchSelectionPreview({
      candidates: [
        createCandidate({
          resultPublicId: "admin_ai_generation_result_public_target_mismatch",
          generationKind: "paper",
          taskType: "ai_paper_generation",
        }),
      ],
      selectedResultPublicIds: [
        "admin_ai_generation_result_public_target_mismatch",
      ],
      targetType: "question",
    });

    expect(preview.previewStatus).toBe("blocked_by_invalid_selection");
    expect(preview.batchAdoptionMutationStatus).toBe("not_executed");
    expect(preview.validationState).toMatchObject({
      eligibleCount: 0,
      blockedCount: 1,
      selectedCount: 1,
      invalidSelectedCount: 1,
      previewOnly: true,
    });
    expect(preview.candidates[0]).toMatchObject({
      blockedReason: "blocked_target_type_mismatch",
      selectionState: "blocked",
    });
  });
});

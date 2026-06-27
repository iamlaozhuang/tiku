import { describe, expect, it } from "vitest";

import type { AdminAiGenerationAdoptionHistoryReadModelSource } from "../contracts/admin-ai-generation-formal-adoption-contract";
import { createAdminAiGenerationAdoptionHistoryReadModel } from "./admin-ai-generation-adoption-history-read-model-service";

function createHistorySource(
  overrides: Partial<AdminAiGenerationAdoptionHistoryReadModelSource> = {},
): AdminAiGenerationAdoptionHistoryReadModelSource {
  return {
    resultPublicId: "admin_ai_generation_result_public_301",
    adoptionPublicId: "admin_ai_generation_adoption_public_301",
    taskPublicId: "admin_ai_generation_task_public_301",
    requestPublicId: "admin_ai_generation_request_public_301",
    targetType: "question",
    targetDomain: "platform_formal_content",
    formalTargetWriteStatus: "draft_created",
    formalQuestionPublicId: "formal_question_public_301",
    formalPaperPublicId: null,
    reviewerPublicId: "content_admin_public_301",
    reviewedAt: "2026-06-27T10:10:00.000Z",
    events: [
      {
        eventPublicId: "adoption_history_event_public_draft",
        eventType: "formal_draft_created",
        eventAt: "2026-06-27T10:15:00.000Z",
        actorPublicId: "content_admin_public_301",
        actionType: "admin_ai_generation_result.formal_draft.create",
        targetResourceType: "formal_question",
        targetPublicId: "formal_question_public_301",
        metadataSummaryMasked: "masked draft creation metadata",
        contentDigest: "sha256:formal-draft-301",
        redactionStatus: "redacted",
      },
      {
        eventPublicId: "adoption_history_event_public_generated",
        eventType: "generated_result_created",
        eventAt: "2026-06-27T10:00:00.000Z",
        actorPublicId: "ai_generation_runtime_public_301",
        actionType: "admin_ai_generation_result.generated_result.create",
        targetResourceType: "admin_ai_generation_result",
        targetPublicId: "admin_ai_generation_result_public_301",
        metadataSummaryMasked: "masked generated result metadata",
        contentDigest: "sha256:generated-result-301",
        redactionStatus: "redacted",
      },
      {
        eventPublicId: "adoption_history_event_public_approved",
        eventType: "formal_adoption_approved",
        eventAt: "2026-06-27T10:10:00.000Z",
        actorPublicId: "content_admin_public_301",
        actionType: "admin_ai_generation_result.formal_adoption.approve",
        targetResourceType: "admin_ai_generation_result",
        targetPublicId: "admin_ai_generation_result_public_301",
        metadataSummaryMasked: "masked adoption approval metadata",
        contentDigest: "sha256:generated-result-301",
        redactionStatus: "redacted",
      },
    ],
    redactionStatus: "redacted",
    ...overrides,
  };
}

describe("admin AI generation adoption history read model service", () => {
  it("creates a chronological read-only adoption history traceability model", () => {
    const protectedInputArtifact = "PROTECTED_INPUT_ARTIFACT_MUST_NOT_LEAK";
    const protectedHistoryArtifact = "PROTECTED_HISTORY_ARTIFACT_MUST_NOT_LEAK";
    const protectedExternalArtifact =
      "PROTECTED_EXTERNAL_ARTIFACT_MUST_NOT_LEAK";
    const source = {
      ...createHistorySource(),
      protectedInputArtifact,
      protectedHistoryArtifact,
      protectedExternalArtifact,
    } as AdminAiGenerationAdoptionHistoryReadModelSource & {
      protectedInputArtifact: string;
      protectedHistoryArtifact: string;
      protectedExternalArtifact: string;
    };

    const history = createAdminAiGenerationAdoptionHistoryReadModel(source);
    const serializedHistory = JSON.stringify(history);

    expect(history).toEqual({
      historyStatus: "traceable",
      resultPublicId: "admin_ai_generation_result_public_301",
      adoptionPublicId: "admin_ai_generation_adoption_public_301",
      taskPublicId: "admin_ai_generation_task_public_301",
      requestPublicId: "admin_ai_generation_request_public_301",
      target: {
        targetType: "question",
        targetDomain: "platform_formal_content",
        formalTargetWriteStatus: "draft_created",
        formalQuestionPublicId: "formal_question_public_301",
        formalPaperPublicId: null,
      },
      timelineSummary: {
        eventCount: 3,
        firstEventAt: "2026-06-27T10:00:00.000Z",
        latestEventAt: "2026-06-27T10:15:00.000Z",
        generatedResultEventCount: 1,
        adoptionApprovalEventCount: 1,
        formalDraftEventCount: 1,
      },
      events: [
        {
          eventPublicId: "adoption_history_event_public_generated",
          eventType: "generated_result_created",
          eventAt: "2026-06-27T10:00:00.000Z",
          actorPublicId: "ai_generation_runtime_public_301",
          actionType: "admin_ai_generation_result.generated_result.create",
          targetResourceType: "admin_ai_generation_result",
          targetPublicId: "admin_ai_generation_result_public_301",
          metadataSummaryMasked: "masked generated result metadata",
          contentDigest: "sha256:generated-result-301",
          redactionStatus: "redacted",
        },
        {
          eventPublicId: "adoption_history_event_public_approved",
          eventType: "formal_adoption_approved",
          eventAt: "2026-06-27T10:10:00.000Z",
          actorPublicId: "content_admin_public_301",
          actionType: "admin_ai_generation_result.formal_adoption.approve",
          targetResourceType: "admin_ai_generation_result",
          targetPublicId: "admin_ai_generation_result_public_301",
          metadataSummaryMasked: "masked adoption approval metadata",
          contentDigest: "sha256:generated-result-301",
          redactionStatus: "redacted",
        },
        {
          eventPublicId: "adoption_history_event_public_draft",
          eventType: "formal_draft_created",
          eventAt: "2026-06-27T10:15:00.000Z",
          actorPublicId: "content_admin_public_301",
          actionType: "admin_ai_generation_result.formal_draft.create",
          targetResourceType: "formal_question",
          targetPublicId: "formal_question_public_301",
          metadataSummaryMasked: "masked draft creation metadata",
          contentDigest: "sha256:formal-draft-301",
          redactionStatus: "redacted",
        },
      ],
      readBoundary: {
        readOnly: true,
        historyMutationStatus: "not_executed",
        publishStatus: "not_executed",
        rawPromptExposed: false,
        rawGeneratedOutputExposed: false,
        providerPayloadExposed: false,
        redactionStatus: "redacted",
      },
      reviewedBy: {
        reviewerPublicId: "content_admin_public_301",
        reviewedAt: "2026-06-27T10:10:00.000Z",
      },
      redactionStatus: "redacted",
    });
    expect(serializedHistory).not.toContain(protectedInputArtifact);
    expect(serializedHistory).not.toContain(protectedHistoryArtifact);
    expect(serializedHistory).not.toContain(protectedExternalArtifact);
    expect(serializedHistory).not.toMatch(/"id":/u);
  });

  it("returns an empty read-only history without attempting mutation or publish", () => {
    const history = createAdminAiGenerationAdoptionHistoryReadModel(
      createHistorySource({
        events: [],
      }),
    );

    expect(history.historyStatus).toBe("empty");
    expect(history.timelineSummary).toMatchObject({
      eventCount: 0,
      firstEventAt: null,
      latestEventAt: null,
    });
    expect(history.events).toEqual([]);
    expect(history.readBoundary).toMatchObject({
      readOnly: true,
      historyMutationStatus: "not_executed",
      publishStatus: "not_executed",
    });
  });
});

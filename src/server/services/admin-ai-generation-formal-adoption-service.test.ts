import { describe, expect, it, vi } from "vitest";

import type {
  AdminAiGenerationFormalAdoptionRepository,
  AdminAiGenerationFormalAdoptionResult,
} from "../contracts/admin-ai-generation-formal-adoption-contract";
import { ADMIN_AI_GENERATION_FORMAL_ADOPTION_CONFIRMATION_REQUIRED_MESSAGE } from "../validators/admin-ai-generation-formal-adoption";
import { createAdminAiGenerationFormalAdoptionService } from "./admin-ai-generation-formal-adoption-service";
import type { AdminAiGenerationFormalDraftAdapterService } from "./admin-ai-generation-formal-draft-adapter";

function createRejectedAdoptionResult(): AdminAiGenerationFormalAdoptionResult {
  return {
    persistenceStatus: "created",
    adoption: {
      adoptionPublicId: "admin_ai_formal_adoption_public_service_177",
      sourceReference: {
        resultPublicId: "admin_ai_generation_result_content_question_177",
        taskPublicId: "admin_ai_generation_task_content_question_177",
        requestPublicId: "admin_ai_generation_request_content_question_177",
        workspace: "content",
        generationKind: "question",
        ownerType: "platform",
        ownerPublicId: "platform_content_review_pool",
        organizationPublicId: null,
      },
      targetReference: {
        targetType: "question",
        targetDomain: "platform_formal_content",
        formalTargetWriteStatus: "blocked_without_follow_up_task",
        formalQuestionPublicId: null,
        formalPaperPublicId: null,
      },
      review: {
        reviewStatus: "rejected",
        reviewDecision: "rejected",
        reviewerPublicId: "admin_content_public_177",
        reviewedAt: "2026-06-26T20:00:00.000Z",
      },
      sourceSummary: {
        contentDigest: "sha256:admin_ai_generation_result_177",
        contentPreviewMasked: "masked admin AI generated result preview",
        evidenceStatus: "weak",
        citationCount: 1,
        aiCallLogPublicId: null,
        redactionStatus: "redacted",
      },
      audit: {
        actionType: "admin_ai_generation_result.formal_adoption.reject",
        targetResourceType: "admin_ai_generation_result",
        targetPublicId: "admin_ai_generation_result_content_question_177",
        redactionStatus: "redacted",
      },
      reviewTraceability: {
        traceabilityStatus: "single_result_traceable",
        sourceGeneratedResultPublicId:
          "admin_ai_generation_result_content_question_177",
        validationStatus: "validated_for_formal_adoption",
        reviewStatus: "rejected",
        reviewDecision: "rejected",
        reviewerPublicId: "admin_content_public_177",
        reviewedAt: "2026-06-26T20:00:00.000Z",
        adoptAction: {
          actionStatus: "not_executed",
          actionType: null,
          actorPublicId: null,
          actionAt: null,
          formalTargetWriteStatus: "blocked_without_follow_up_task",
          formalQuestionPublicId: null,
          formalPaperPublicId: null,
        },
        rejectAction: {
          actionStatus: "executed",
          actionType: "admin_ai_generation_result.formal_adoption.reject",
          actorPublicId: "admin_content_public_177",
          actionAt: "2026-06-26T20:00:00.000Z",
        },
        directPublishStatus: "blocked_requires_fresh_publish_task",
        auditSummary: {
          actionType: "admin_ai_generation_result.formal_adoption.reject",
          targetResourceType: "admin_ai_generation_result",
          targetPublicId: "admin_ai_generation_result_content_question_177",
          redactionStatus: "redacted",
        },
        redactionStatus: "redacted",
      },
      redactionStatus: "redacted",
    },
  };
}

function createRepository(
  result: AdminAiGenerationFormalAdoptionResult,
): AdminAiGenerationFormalAdoptionRepository {
  return {
    createOrReuseFormalAdoption: vi.fn(async () => result),
    markFormalDraftCreated: vi.fn(),
  };
}

function createFormalDraftAdapter(): AdminAiGenerationFormalDraftAdapterService {
  return {
    createFormalDraft: vi.fn(),
  };
}

describe("admin AI generation formal adoption service", () => {
  it("accepts a confirmed reject command without calling the formal draft adapter", async () => {
    const adoptionResult = createRejectedAdoptionResult();
    const adoptionRepository = createRepository(adoptionResult);
    const formalDraftAdapter = createFormalDraftAdapter();
    const service = createAdminAiGenerationFormalAdoptionService({
      adoptionRepository,
      formalDraftAdapter,
    });

    const response = await service.approveFormalAdoption({
      adoptionPublicId: "admin_ai_formal_adoption_public_service_177",
      actor: {
        publicId: "admin_content_public_177",
        roles: ["content_admin"],
      },
      resultPublicId: "admin_ai_generation_result_content_question_177",
      targetType: "question",
      reviewDecision: "rejected",
      reviewerConfirmed: true,
      reviewedAt: "2026-06-26T20:00:00.000Z",
    });

    expect(response).toEqual({
      code: 0,
      message: "ok",
      data: adoptionResult,
    });
    expect(adoptionRepository.createOrReuseFormalAdoption).toHaveBeenCalledWith(
      {
        adoptionPublicId: "admin_ai_formal_adoption_public_service_177",
        actor: {
          publicId: "admin_content_public_177",
          roles: ["content_admin"],
        },
        resultPublicId: "admin_ai_generation_result_content_question_177",
        targetType: "question",
        reviewDecision: "rejected",
        reviewerConfirmed: true,
        reviewedAt: new Date("2026-06-26T20:00:00.000Z"),
      },
    );
    expect(formalDraftAdapter.createFormalDraft).not.toHaveBeenCalled();
    expect(adoptionRepository.markFormalDraftCreated).not.toHaveBeenCalled();
    expect(JSON.stringify(response)).not.toMatch(/"id":/u);
  });

  it("requires explicit reviewer confirmation before a reject command reaches the repository", async () => {
    const adoptionRepository = createRepository(createRejectedAdoptionResult());
    const service = createAdminAiGenerationFormalAdoptionService({
      adoptionRepository,
      formalDraftAdapter: createFormalDraftAdapter(),
    });

    const response = await service.approveFormalAdoption({
      adoptionPublicId: "admin_ai_formal_adoption_public_service_177",
      actor: {
        publicId: "admin_content_public_177",
        roles: ["content_admin"],
      },
      resultPublicId: "admin_ai_generation_result_content_question_177",
      targetType: "question",
      reviewDecision: "rejected",
      reviewerConfirmed: false,
      reviewedAt: "2026-06-26T20:00:00.000Z",
    });

    expect(response).toEqual({
      code: 400014,
      message:
        ADMIN_AI_GENERATION_FORMAL_ADOPTION_CONFIRMATION_REQUIRED_MESSAGE,
      data: null,
    });
    expect(
      adoptionRepository.createOrReuseFormalAdoption,
    ).not.toHaveBeenCalled();
  });
});

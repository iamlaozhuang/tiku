import { describe, expect, it, vi } from "vitest";

import type { AdminAiGenerationFormalAdoptionResult } from "../contracts/admin-ai-generation-formal-adoption-contract";
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

function createDraftCreatedAdoptionResult(): AdminAiGenerationFormalAdoptionResult {
  const rejectedResult = createRejectedAdoptionResult();

  return {
    ...rejectedResult,
    persistenceStatus: "reused",
    adoption: {
      ...rejectedResult.adoption,
      targetReference: {
        ...rejectedResult.adoption.targetReference,
        formalTargetWriteStatus: "draft_created",
        formalQuestionPublicId: "question_formal_draft_service_177",
      },
      review: {
        ...rejectedResult.adoption.review,
        reviewStatus: "approved_for_formal_adoption",
        reviewDecision: "approved",
      },
      audit: {
        ...rejectedResult.adoption.audit,
        actionType: "admin_ai_generation_result.formal_adoption.approve",
      },
      reviewTraceability: {
        ...rejectedResult.adoption.reviewTraceability,
        reviewStatus: "approved_for_formal_adoption",
        reviewDecision: "approved",
        adoptAction: {
          actionStatus: "executed",
          actionType: "admin_ai_generation_result.formal_adoption.approve",
          actorPublicId: "admin_content_public_177",
          actionAt: "2026-06-26T20:00:00.000Z",
          formalTargetWriteStatus: "draft_created",
          formalQuestionPublicId: "question_formal_draft_service_177",
          formalPaperPublicId: null,
        },
        rejectAction: {
          actionStatus: "not_executed",
          actorPublicId: null,
          actionAt: null,
        },
        auditSummary: {
          ...rejectedResult.adoption.reviewTraceability.auditSummary,
          actionType: "admin_ai_generation_result.formal_adoption.approve",
        },
      },
    },
  };
}

function createRepository(result: AdminAiGenerationFormalAdoptionResult) {
  return {
    createOrReuseFormalAdoption: vi.fn(async () => result),
    findTrustedReviewedDraftForAdoption: vi.fn(),
    markFormalDraftCreated: vi.fn(async () => result),
  };
}

function createFormalDraftAdapter(): AdminAiGenerationFormalDraftAdapterService {
  return {
    createFormalDraft: vi.fn(async () => ({
      code: 0,
      message: "ok",
      data: {
        adoptionPublicId: "admin_ai_formal_adoption_public_service_177",
        sourceResultPublicId: "admin_ai_generation_result_content_question_177",
        targetType: "question" as const,
        formalTargetWriteStatus: "draft_created" as const,
        formalQuestionPublicId: "question_formal_draft_service_177",
        formalPaperPublicId: null,
        redactionStatus: "redacted" as const,
      },
    })),
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
      expectedContentDigest: "sha256:admin_ai_generation_result_177",
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
        expectedContentDigest: "sha256:admin_ai_generation_result_177",
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
      expectedContentDigest: "sha256:admin_ai_generation_result_177",
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

  it("uses only the server-owned reviewed draft bound to the expected digest", async () => {
    const adoptionResult = createRejectedAdoptionResult();
    const adoptionRepository = createRepository(adoptionResult);
    const formalDraftAdapter = createFormalDraftAdapter();
    const trustedReviewedDraft = {
      questionType: "short_answer",
      stemRichText: "trusted server draft",
    };
    const tamperedBrowserDraft = {
      questionType: "short_answer",
      stemRichText: "tampered browser draft",
    };
    adoptionRepository.findTrustedReviewedDraftForAdoption.mockResolvedValue(
      trustedReviewedDraft,
    );
    const service = createAdminAiGenerationFormalAdoptionService({
      adoptionRepository,
      formalDraftAdapter,
    });

    await service.approveFormalAdoption({
      adoptionPublicId: "admin_ai_formal_adoption_public_service_177",
      actor: {
        publicId: "admin_content_public_177",
        roles: ["content_admin"],
      },
      resultPublicId: "admin_ai_generation_result_content_question_177",
      targetType: "question",
      reviewDecision: "approved",
      reviewerConfirmed: true,
      expectedContentDigest: "sha256:admin_ai_generation_result_177",
      reviewedDraft: tamperedBrowserDraft,
      reviewedAt: "2026-06-26T20:00:00.000Z",
    });

    expect(
      adoptionRepository.findTrustedReviewedDraftForAdoption,
    ).toHaveBeenCalledWith({
      expectedContentDigest: "sha256:admin_ai_generation_result_177",
      resultPublicId: "admin_ai_generation_result_content_question_177",
      targetType: "question",
    });
    expect(formalDraftAdapter.createFormalDraft).toHaveBeenCalledWith(
      expect.objectContaining({ reviewedDraft: trustedReviewedDraft }),
    );
    expect(formalDraftAdapter.createFormalDraft).not.toHaveBeenCalledWith(
      expect.objectContaining({ reviewedDraft: tamperedBrowserDraft }),
    );
  });

  it("replays a committed draft target without invoking any writer again", async () => {
    const adoptionResult = createDraftCreatedAdoptionResult();
    const adoptionRepository = createRepository(adoptionResult);
    const formalDraftAdapter = createFormalDraftAdapter();
    const service = createAdminAiGenerationFormalAdoptionService({
      adoptionRepository,
      formalDraftAdapter,
    });

    const response = await service.approveFormalAdoption({
      adoptionPublicId: "admin_ai_formal_adoption_public_retry_177",
      actor: {
        publicId: "admin_content_public_177",
        roles: ["content_admin"],
      },
      resultPublicId: "admin_ai_generation_result_content_question_177",
      targetType: "question",
      reviewDecision: "approved",
      reviewerConfirmed: true,
      expectedContentDigest: "sha256:admin_ai_generation_result_177",
      reviewedAt: "2026-06-26T20:01:00.000Z",
    });

    expect(response).toEqual({ code: 0, message: "ok", data: adoptionResult });
    expect(
      adoptionRepository.findTrustedReviewedDraftForAdoption,
    ).not.toHaveBeenCalled();
    expect(formalDraftAdapter.createFormalDraft).not.toHaveBeenCalled();
    expect(adoptionRepository.markFormalDraftCreated).not.toHaveBeenCalled();
  });
});

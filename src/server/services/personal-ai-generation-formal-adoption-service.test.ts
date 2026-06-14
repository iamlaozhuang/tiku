import { describe, expect, it, vi } from "vitest";

import type {
  PersonalAiGenerationFormalAdoptionAuditRepository,
  PersonalAiGenerationFormalAdoptionRepository,
} from "../repositories/personal-ai-generation-formal-adoption-repository";
import { createPersonalAiGenerationFormalAdoptionService } from "./personal-ai-generation-formal-adoption-service";

function createSourceResult() {
  return {
    resultPublicId: "personal_ai_result_public_177",
    taskPublicId: "ai_generation_task_public_177",
    requestPublicId: "personal_ai_request_public_177",
    ownerPublicId: "student_public_177",
    taskType: "ai_question_generation" as const,
    resultStatus: "draft" as const,
    isFormalAdoptionBlocked: true,
    contentDigest: "sha256:content_177",
    contentPreviewMasked: "masked generated content preview",
    evidenceStatus: "weak" as const,
    citationCount: 1,
    aiCallLogPublicId: "ai_call_log_public_177",
  };
}

function createRepositories(): {
  adoptionRepository: PersonalAiGenerationFormalAdoptionRepository;
  auditLogRepository: PersonalAiGenerationFormalAdoptionAuditRepository;
} {
  return {
    adoptionRepository: {
      findDraftResultForReview: vi.fn(async () => createSourceResult()),
    },
    auditLogRepository: {
      appendAuditLog: vi.fn(async () => undefined),
    },
  };
}

function createBaseInput() {
  return {
    actor: {
      publicId: "admin_content_public_177",
      roles: ["content_admin"] as const,
    },
    resultPublicId: "personal_ai_result_public_177",
    targetType: "question",
    reviewDecision: "approved",
    reviewReasonCategory: "content_quality_passed",
    reviewerConfirmed: true,
    reviewedAt: new Date("2026-06-14T07:35:00.000Z"),
    rawGeneratedContent: "RAW GENERATED CONTENT MUST NOT LEAK",
  };
}

describe("personal AI formal adoption review service", () => {
  it("requires an existing content admin reviewer before reading the source result", async () => {
    const repositories = createRepositories();
    const service =
      createPersonalAiGenerationFormalAdoptionService(repositories);

    const response = await service.reviewFormalAdoption({
      ...createBaseInput(),
      actor: {
        publicId: "admin_ops_public_177",
        roles: ["ops_admin"],
      },
    });

    expect(response).toEqual({
      code: 403177,
      message: "Admin permission denied.",
      data: null,
    });
    expect(
      repositories.adoptionRepository.findDraftResultForReview,
    ).not.toHaveBeenCalled();
    expect(
      repositories.auditLogRepository.appendAuditLog,
    ).not.toHaveBeenCalled();
  });

  it("requires an explicit human review confirmation before adoption review", async () => {
    const repositories = createRepositories();
    const service =
      createPersonalAiGenerationFormalAdoptionService(repositories);

    const response = await service.reviewFormalAdoption({
      ...createBaseInput(),
      reviewerConfirmed: false,
    });

    expect(response).toEqual({
      code: 400177,
      message: "Formal adoption review confirmation is required.",
      data: null,
    });
    expect(
      repositories.adoptionRepository.findDraftResultForReview,
    ).not.toHaveBeenCalled();
  });

  it("rejects unsupported formal targets without touching the source result", async () => {
    const repositories = createRepositories();
    const service =
      createPersonalAiGenerationFormalAdoptionService(repositories);

    const response = await service.reviewFormalAdoption({
      ...createBaseInput(),
      targetType: "mock_exam",
    });

    expect(response).toEqual({
      code: 400177,
      message: "Invalid formal adoption review input.",
      data: null,
    });
    expect(
      repositories.adoptionRepository.findDraftResultForReview,
    ).not.toHaveBeenCalled();
  });

  it("returns not found for a missing personal AI draft result", async () => {
    const repositories = createRepositories();
    vi.mocked(
      repositories.adoptionRepository.findDraftResultForReview,
    ).mockResolvedValueOnce(null);
    const service =
      createPersonalAiGenerationFormalAdoptionService(repositories);

    const response = await service.reviewFormalAdoption(createBaseInput());

    expect(response).toEqual({
      code: 404177,
      message: "Personal AI generation result does not exist.",
      data: null,
    });
    expect(
      repositories.auditLogRepository.appendAuditLog,
    ).not.toHaveBeenCalled();
  });

  it("records an approved manual adoption review gate with redacted source summary only", async () => {
    const repositories = createRepositories();
    const service =
      createPersonalAiGenerationFormalAdoptionService(repositories);
    const input = createBaseInput();

    const response = await service.reviewFormalAdoption(input);
    const serializedResponse = JSON.stringify(response);

    expect(response).toEqual({
      code: 0,
      message: "ok",
      data: {
        adoptionReview: {
          sourceResultPublicId: "personal_ai_result_public_177",
          sourceTaskPublicId: "ai_generation_task_public_177",
          sourceOwnerPublicId: "student_public_177",
          targetType: "question",
          reviewDecision: "approved",
          reviewStatus: "approved_for_manual_adoption",
          formalTargetWriteStatus: "blocked_without_follow_up_task",
          reviewerPublicId: "admin_content_public_177",
          reviewedAt: "2026-06-14T07:35:00.000Z",
          sourceReference: {
            contentDigest: "sha256:content_177",
            contentPreviewMasked: "masked generated content preview",
            evidenceStatus: "weak",
            citationCount: 1,
            aiCallLogPublicId: "ai_call_log_public_177",
            redactionStatus: "redacted",
          },
          audit: {
            actionType:
              "personal_ai_generation_result.formal_adoption_review.approve",
            targetResourceType: "personal_ai_generation_result",
            targetPublicId: "personal_ai_result_public_177",
            redactionStatus: "redacted",
          },
        },
      },
    });
    expect(serializedResponse).not.toContain(input.rawGeneratedContent);
    expect(serializedResponse).not.toMatch(/"id":/);
    expect(repositories.auditLogRepository.appendAuditLog).toHaveBeenCalledWith(
      {
        actorPublicId: "admin_content_public_177",
        actorRole: "content_admin",
        actionType:
          "personal_ai_generation_result.formal_adoption_review.approve",
        targetResourceType: "personal_ai_generation_result",
        targetPublicId: "personal_ai_result_public_177",
        resultStatus: "success",
        metadataSummary: "redacted formal adoption review metadata",
        requestIp: null,
      },
    );
  });
});

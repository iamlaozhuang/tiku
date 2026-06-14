import { describe, expect, it, vi } from "vitest";

import type { ApiResponse } from "../contracts/api-response";
import type { AuthContextDto } from "../contracts/auth-contract";
import type {
  PersonalAiGenerationFormalAdoptionAuditRepository,
  PersonalAiGenerationFormalAdoptionRepository,
} from "../repositories/personal-ai-generation-formal-adoption-repository";
import { createPersonalAiGenerationFormalAdoptionRuntimeRouteHandlers } from "./personal-ai-generation-formal-adoption-runtime";

function createSessionResponse(
  adminRoles: string[] = ["content_admin"],
): ApiResponse<AuthContextDto | null> {
  return {
    code: 0,
    message: "ok",
    data: {
      user: {
        publicId: "user_admin_public_177",
        phone: "13800000000",
        name: "Content Admin",
        userType: null,
        status: "active",
        lockedUntilAt: null,
        employeePublicId: null,
        organizationPublicId: null,
        adminPublicId: "admin_content_public_177",
        adminRoles: adminRoles as AuthContextDto["user"]["adminRoles"],
      },
      session: {
        expiresAt: "2026-06-14T15:35:00.000Z",
      },
    },
  };
}

function createRepositories(): {
  adoptionRepository: PersonalAiGenerationFormalAdoptionRepository;
  auditLogRepository: PersonalAiGenerationFormalAdoptionAuditRepository;
} {
  return {
    adoptionRepository: {
      findDraftResultForReview: vi.fn(async () => ({
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
      })),
    },
    auditLogRepository: {
      appendAuditLog: vi.fn(async () => undefined),
    },
  };
}

async function readJsonResponse(response: Response): Promise<unknown> {
  return response.json();
}

describe("personal AI formal adoption runtime route", () => {
  it("returns a standard admin session required response without repository access", async () => {
    const repositories = createRepositories();
    const routeHandlers =
      createPersonalAiGenerationFormalAdoptionRuntimeRouteHandlers({
        repositories,
        sessionService: {
          getCurrentSession: vi.fn(async () => ({
            code: 401001,
            message: "Admin session is required.",
            data: null,
          })),
        },
      });

    const response = await routeHandlers.formalAdoptionReviews.POST(
      new Request(
        "http://localhost/api/v1/personal-ai-generation-results/personal_ai_result_public_177/formal-adoption-reviews",
        {
          method: "POST",
          body: JSON.stringify({
            targetType: "question",
            reviewDecision: "approved",
            reviewReasonCategory: "content_quality_passed",
            reviewerConfirmed: true,
          }),
        },
      ),
      {
        params: Promise.resolve({ publicId: "personal_ai_result_public_177" }),
      },
    );

    await expect(readJsonResponse(response)).resolves.toEqual({
      code: 401001,
      message: "Admin session is required.",
      data: null,
    });
    expect(
      repositories.adoptionRepository.findDraftResultForReview,
    ).not.toHaveBeenCalled();
  });

  it("allows a content admin to submit a manual adoption review and appends redacted audit evidence", async () => {
    const repositories = createRepositories();
    const routeHandlers =
      createPersonalAiGenerationFormalAdoptionRuntimeRouteHandlers({
        repositories,
        sessionService: {
          getCurrentSession: vi.fn(async () => createSessionResponse()),
        },
      });

    const response = await routeHandlers.formalAdoptionReviews.POST(
      new Request(
        "http://localhost/api/v1/personal-ai-generation-results/personal_ai_result_public_177/formal-adoption-reviews",
        {
          method: "POST",
          headers: {
            authorization: "Bearer unit-test-admin-token",
            "content-type": "application/json",
          },
          body: JSON.stringify({
            targetType: "question",
            reviewDecision: "approved",
            reviewReasonCategory: "content_quality_passed",
            reviewerConfirmed: true,
            reviewedAt: "2026-06-14T07:35:00.000Z",
            rawGeneratedContent: "RAW GENERATED CONTENT MUST NOT LEAK",
          }),
        },
      ),
      {
        params: Promise.resolve({ publicId: "personal_ai_result_public_177" }),
      },
    );
    const responseBody = await readJsonResponse(response);
    const serializedResponse = JSON.stringify(responseBody);

    expect(responseBody).toMatchObject({
      code: 0,
      message: "ok",
      data: {
        adoptionReview: {
          sourceResultPublicId: "personal_ai_result_public_177",
          targetType: "question",
          reviewStatus: "approved_for_manual_adoption",
          formalTargetWriteStatus: "blocked_without_follow_up_task",
          reviewerPublicId: "admin_content_public_177",
        },
      },
    });
    expect(serializedResponse).not.toContain(
      "RAW GENERATED CONTENT MUST NOT LEAK",
    );
    expect(repositories.auditLogRepository.appendAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        actorPublicId: "admin_content_public_177",
        actorRole: "content_admin",
        actionType:
          "personal_ai_generation_result.formal_adoption_review.approve",
        targetResourceType: "personal_ai_generation_result",
        targetPublicId: "personal_ai_result_public_177",
        resultStatus: "success",
        metadataSummary: "redacted formal adoption review metadata",
      }),
    );
  });
});

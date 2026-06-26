import { describe, expect, it, vi } from "vitest";

import type { ApiResponse } from "../contracts/api-response";
import type {
  AdminAiGenerationFormalAdoptionRepository,
  AdminAiGenerationFormalAdoptionResult,
} from "../contracts/admin-ai-generation-formal-adoption-contract";
import type { AuthContextDto } from "../contracts/auth-contract";
import { createAdminAiGenerationFormalAdoptionRuntimeRouteHandlers } from "./admin-ai-generation-formal-adoption-runtime";

function createSessionResponse(
  adminRoles: AuthContextDto["user"]["adminRoles"] = ["content_admin"],
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
        adminRoles,
      },
      session: {
        expiresAt: "2026-06-26T20:00:00.000Z",
      },
    },
  };
}

function createAdoptionRepository(): AdminAiGenerationFormalAdoptionRepository {
  const adoptionResult = {
    persistenceStatus: "created",
    adoption: {
      adoptionPublicId: "admin_ai_formal_adoption_public_route_177",
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
        reviewStatus: "approved_for_formal_adoption",
        reviewDecision: "approved",
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
        actionType: "admin_ai_generation_result.formal_adoption.approve",
        targetResourceType: "admin_ai_generation_result",
        targetPublicId: "admin_ai_generation_result_content_question_177",
        redactionStatus: "redacted",
      },
      redactionStatus: "redacted",
    },
  } satisfies AdminAiGenerationFormalAdoptionResult;

  return {
    createOrReuseFormalAdoption: vi.fn(async () => adoptionResult),
  };
}

function createPostRequest(body: Record<string, unknown>): Request {
  return new Request(
    "http://localhost/api/v1/content-ai-generation-results/admin_ai_generation_result_content_question_177/formal-adoptions",
    {
      body: JSON.stringify(body),
      headers: {
        authorization: "Bearer synthetic-admin-session",
        "content-type": "application/json",
      },
      method: "POST",
    },
  );
}

async function readJsonResponse(response: Response): Promise<unknown> {
  return response.json();
}

describe("admin AI generation formal adoption runtime route", () => {
  it("allows content admin to approve content generated result adoption metadata without formal draft writes", async () => {
    const adoptionRepository = createAdoptionRepository();
    const protectedFixtureA = "OMITTED_FORMAL_ADOPTION_FIXTURE_A";
    const protectedFixtureB = "OMITTED_FORMAL_ADOPTION_FIXTURE_B";
    const protectedFixtureC = "OMITTED_FORMAL_ADOPTION_FIXTURE_C";
    const routeHandlers =
      createAdminAiGenerationFormalAdoptionRuntimeRouteHandlers({
        adoptionRepository,
        createAdoptionPublicId: () =>
          "admin_ai_formal_adoption_public_route_177",
        requestClock: () => new Date("2026-06-26T20:00:00.000Z"),
        sessionService: {
          getCurrentSession: vi.fn(async () => createSessionResponse()),
        },
      });

    const response = await routeHandlers.formalAdoptions.POST(
      createPostRequest({
        targetType: "question",
        reviewDecision: "approved",
        reviewerConfirmed: true,
        clientOnlyFixtureA: protectedFixtureA,
        clientOnlyFixtureB: protectedFixtureB,
        clientOnlyFixtureC: protectedFixtureC,
      }),
      {
        params: Promise.resolve({
          publicId: "admin_ai_generation_result_content_question_177",
        }),
      },
    );
    const payload = await readJsonResponse(response);
    const serializedPayload = JSON.stringify(payload);

    expect(payload).toMatchObject({
      code: 0,
      message: "ok",
      data: {
        persistenceStatus: "created",
        adoption: {
          adoptionPublicId: "admin_ai_formal_adoption_public_route_177",
          sourceReference: {
            resultPublicId: "admin_ai_generation_result_content_question_177",
            workspace: "content",
            generationKind: "question",
            ownerType: "platform",
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
            reviewStatus: "approved_for_formal_adoption",
            reviewerPublicId: "admin_content_public_177",
          },
          redactionStatus: "redacted",
        },
      },
    });
    expect(adoptionRepository.createOrReuseFormalAdoption).toHaveBeenCalledWith(
      {
        adoptionPublicId: "admin_ai_formal_adoption_public_route_177",
        actor: {
          publicId: "admin_content_public_177",
          roles: ["content_admin"],
        },
        resultPublicId: "admin_ai_generation_result_content_question_177",
        targetType: "question",
        reviewDecision: "approved",
        reviewerConfirmed: true,
        reviewedAt: new Date("2026-06-26T20:00:00.000Z"),
      },
    );
    expect(serializedPayload).not.toContain(protectedFixtureA);
    expect(serializedPayload).not.toContain(protectedFixtureB);
    expect(serializedPayload).not.toContain(protectedFixtureC);
    expect(serializedPayload).not.toContain("synthetic-admin-session");
    expect(serializedPayload).not.toMatch(/"id":/u);
  });

  it("returns a standard admin session required response without repository access", async () => {
    const adoptionRepository = createAdoptionRepository();
    const routeHandlers =
      createAdminAiGenerationFormalAdoptionRuntimeRouteHandlers({
        adoptionRepository,
        sessionService: {
          getCurrentSession: vi.fn(async () => ({
            code: 401001,
            message: "Admin session is required.",
            data: null,
          })),
        },
      });

    const response = await routeHandlers.formalAdoptions.POST(
      createPostRequest({
        targetType: "question",
        reviewDecision: "approved",
        reviewerConfirmed: true,
      }),
      {
        params: Promise.resolve({
          publicId: "admin_ai_generation_result_content_question_177",
        }),
      },
    );

    await expect(readJsonResponse(response)).resolves.toEqual({
      code: 401001,
      message: "Admin session is required.",
      data: null,
    });
    expect(
      adoptionRepository.createOrReuseFormalAdoption,
    ).not.toHaveBeenCalled();
  });

  it("denies organization admins on the content formal adoption route", async () => {
    const adoptionRepository = createAdoptionRepository();
    const routeHandlers =
      createAdminAiGenerationFormalAdoptionRuntimeRouteHandlers({
        adoptionRepository,
        sessionService: {
          getCurrentSession: vi.fn(async () =>
            createSessionResponse(["org_advanced_admin"]),
          ),
        },
      });

    const response = await routeHandlers.formalAdoptions.POST(
      createPostRequest({
        targetType: "question",
        reviewDecision: "approved",
        reviewerConfirmed: true,
      }),
      {
        params: Promise.resolve({
          publicId: "admin_ai_generation_result_content_question_177",
        }),
      },
    );

    await expect(readJsonResponse(response)).resolves.toEqual({
      code: 403012,
      message:
        "Admin AI generation formal adoption is not available for this role.",
      data: null,
    });
    expect(
      adoptionRepository.createOrReuseFormalAdoption,
    ).not.toHaveBeenCalled();
  });
});

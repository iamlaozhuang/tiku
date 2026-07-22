import { describe, expect, it, vi } from "vitest";

import type { ApiResponse } from "../contracts/api-response";
import type {
  AdminAiGenerationFormalAdoptionRepository,
  AdminAiGenerationFormalAdoptionResult,
} from "../contracts/admin-ai-generation-formal-adoption-contract";
import type { AuthContextDto } from "../contracts/auth-contract";
import { createAdminAiGenerationFormalAdoptionRuntimeRouteHandlers } from "./admin-ai-generation-formal-adoption-runtime";
import type { AdminAiGenerationFormalDraftAdapterService } from "./admin-ai-generation-formal-draft-adapter";

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

type DraftCreatedMetadataInput = {
  adoptionPublicId: string;
  targetType: "question" | "paper";
  formalQuestionPublicId: string | null;
  formalPaperPublicId: string | null;
};

type AdoptionRepositoryWithDraftUpdate =
  AdminAiGenerationFormalAdoptionRepository & {
    markFormalDraftCreated: (
      input: DraftCreatedMetadataInput,
    ) => Promise<AdminAiGenerationFormalAdoptionResult>;
  };

function createAdoptionResult(
  overrides: {
    formalQuestionPublicId?: string | null;
    formalPaperPublicId?: string | null;
    formalTargetWriteStatus?:
      | "blocked_without_follow_up_task"
      | "draft_created";
    generationKind?: "question" | "paper";
    reviewerPublicId?: string;
    resultPublicId?: string;
    targetType?: "question" | "paper";
  } = {},
): AdminAiGenerationFormalAdoptionResult {
  const generationKind = overrides.generationKind ?? "question";
  const targetType = overrides.targetType ?? generationKind;
  const resultPublicId =
    overrides.resultPublicId ??
    `admin_ai_generation_result_content_${generationKind}_177`;
  const formalTargetWriteStatus =
    overrides.formalTargetWriteStatus ?? "blocked_without_follow_up_task";
  const formalQuestionPublicId = overrides.formalQuestionPublicId ?? null;
  const formalPaperPublicId = overrides.formalPaperPublicId ?? null;
  const reviewerPublicId =
    overrides.reviewerPublicId ?? "admin_content_public_177";

  return {
    persistenceStatus: "created",
    adoption: {
      adoptionPublicId: "admin_ai_formal_adoption_public_route_177",
      sourceReference: {
        resultPublicId,
        taskPublicId: `admin_ai_generation_task_content_${generationKind}_177`,
        requestPublicId: `admin_ai_generation_request_content_${generationKind}_177`,
        workspace: "content",
        generationKind,
        ownerType: "platform",
        ownerPublicId: "platform_content_review_pool",
        organizationPublicId: null,
      },
      targetReference: {
        targetType,
        targetDomain: "platform_formal_content",
        formalTargetWriteStatus,
        formalQuestionPublicId,
        formalPaperPublicId,
      },
      review: {
        reviewStatus: "approved_for_formal_adoption",
        reviewDecision: "approved",
        reviewerPublicId,
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
        targetPublicId: resultPublicId,
        redactionStatus: "redacted",
      },
      reviewTraceability: {
        traceabilityStatus: "single_result_traceable",
        sourceGeneratedResultPublicId: resultPublicId,
        validationStatus: "validated_for_formal_adoption",
        reviewStatus: "approved_for_formal_adoption",
        reviewDecision: "approved",
        reviewerPublicId,
        reviewedAt: "2026-06-26T20:00:00.000Z",
        adoptAction: {
          actionStatus: "executed",
          actionType: "admin_ai_generation_result.formal_adoption.approve",
          actorPublicId: reviewerPublicId,
          actionAt: "2026-06-26T20:00:00.000Z",
          formalTargetWriteStatus,
          formalQuestionPublicId,
          formalPaperPublicId,
        },
        rejectAction: {
          actionStatus: "not_executed",
          actorPublicId: null,
          actionAt: null,
        },
        directPublishStatus: "blocked_requires_fresh_publish_task",
        auditSummary: {
          actionType: "admin_ai_generation_result.formal_adoption.approve",
          targetResourceType: "admin_ai_generation_result",
          targetPublicId: resultPublicId,
          redactionStatus: "redacted",
        },
        redactionStatus: "redacted",
      },
      redactionStatus: "redacted",
    },
  };
}

function createRejectedAdoptionResult(): AdminAiGenerationFormalAdoptionResult {
  return {
    ...createAdoptionResult(),
    adoption: {
      ...createAdoptionResult().adoption,
      review: {
        reviewStatus: "rejected",
        reviewDecision: "rejected",
        reviewerPublicId: "admin_content_public_177",
        reviewedAt: "2026-06-26T20:00:00.000Z",
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
    },
  };
}

function createAdoptionRepository(
  overrides: Parameters<typeof createAdoptionResult>[0] = {},
): AdoptionRepositoryWithDraftUpdate {
  const adoptionResult = {
    ...createAdoptionResult(overrides),
  } satisfies AdminAiGenerationFormalAdoptionResult;

  return {
    createOrReuseFormalAdoption: vi.fn(async () => adoptionResult),
    findTrustedReviewedDraftForAdoption: vi.fn(async () =>
      overrides.generationKind === "paper" || overrides.targetType === "paper"
        ? createReviewedPaperDraft()
        : createReviewedQuestionDraft(),
    ),
    markFormalDraftCreated: vi.fn(async () =>
      createAdoptionResult({
        formalQuestionPublicId: "question_formal_draft_route_177",
        formalTargetWriteStatus: "draft_created",
      }),
    ),
  };
}

function createFormalDraftAdapter(): AdminAiGenerationFormalDraftAdapterService {
  return {
    createFormalDraft: vi.fn(async () => ({
      code: 0,
      message: "ok",
      data: {
        adoptionPublicId: "admin_ai_formal_adoption_public_route_177",
        sourceResultPublicId: "admin_ai_generation_result_content_question_177",
        targetType: "question" as const,
        formalTargetWriteStatus: "draft_created" as const,
        formalQuestionPublicId: "question_formal_draft_route_177",
        formalPaperPublicId: null,
        redactionStatus: "redacted" as const,
      },
    })),
  };
}

function createRejectedAdoptionRepository(): AdoptionRepositoryWithDraftUpdate {
  return {
    createOrReuseFormalAdoption: vi.fn(async () =>
      createRejectedAdoptionResult(),
    ),
    findTrustedReviewedDraftForAdoption: vi.fn(),
    markFormalDraftCreated: vi.fn(),
  };
}

function createPaperAdoptionRepository(): AdoptionRepositoryWithDraftUpdate {
  return {
    createOrReuseFormalAdoption: vi.fn(async () =>
      createAdoptionResult({
        generationKind: "paper",
        resultPublicId: "admin_ai_generation_result_content_paper_177",
        targetType: "paper",
      }),
    ),
    findTrustedReviewedDraftForAdoption: vi.fn(async () =>
      createReviewedPaperDraft(),
    ),
    markFormalDraftCreated: vi.fn(async () =>
      createAdoptionResult({
        formalPaperPublicId: "paper_formal_draft_route_177",
        formalTargetWriteStatus: "draft_created",
        generationKind: "paper",
        resultPublicId: "admin_ai_generation_result_content_paper_177",
        targetType: "paper",
      }),
    ),
  };
}

function createPaperFormalDraftAdapter(): AdminAiGenerationFormalDraftAdapterService {
  return {
    createFormalDraft: vi.fn(async () => ({
      code: 0,
      message: "ok",
      data: {
        adoptionPublicId: "admin_ai_formal_adoption_public_route_177",
        sourceResultPublicId: "admin_ai_generation_result_content_paper_177",
        targetType: "paper" as const,
        formalTargetWriteStatus: "draft_created" as const,
        formalQuestionPublicId: null,
        formalPaperPublicId: "paper_formal_draft_route_177",
        redactionStatus: "redacted" as const,
      },
    })),
  };
}

function createReviewedQuestionDraft() {
  return {
    questionType: "single_choice",
    profession: "monopoly",
    level: 3,
    subject: "theory",
    stemRichText: "Reviewed formal question stem",
    analysisRichText: "Reviewed formal analysis",
    standardAnswerRichText: "A",
    multiChoiceRule: "all_correct_only",
    scoringMethod: "auto_match",
    materialPublicId: null,
    questionOptions: [
      {
        label: "A",
        contentRichText: "Reviewed option A",
        isCorrect: true,
        sortOrder: 1,
      },
    ],
    scoringPoints: [],
    fillBlankAnswers: [],
    knowledgeNodePublicIds: [],
    tagPublicIds: [],
    rawGeneratedContent: "RAW GENERATED CONTENT MUST NOT RETURN",
  };
}

function createReviewedPaperDraft() {
  return {
    name: "Reviewed formal paper draft",
    profession: "monopoly",
    level: 3,
    subject: "theory",
    paperType: "mock_paper",
    year: 2026,
    month: null,
    sourceDescription: "AI reviewed adoption",
    sourceRegion: null,
    sourceOrganization: null,
    questionBasis: null,
    generationMethod: "ai",
    durationMinute: 120,
    totalScore: "100.0",
    rawGeneratedContent: "RAW PAPER CONTENT MUST NOT RETURN",
  };
}

function createPostRequest(body: Record<string, unknown>): Request {
  return new Request(
    "http://localhost/api/v1/content-ai-generation-results/admin_ai_generation_result_content_question_177/formal-adoptions",
    {
      body: JSON.stringify({
        expectedContentDigest: "sha256:admin_ai_generation_result_177",
        ...body,
      }),
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
  it("allows content admin to adopt a generated question into a formal question draft and updates redacted metadata", async () => {
    const adoptionRepository = createAdoptionRepository({
      reviewerPublicId: "admin_content_public_stale_177",
    });
    const formalDraftAdapter = createFormalDraftAdapter();
    const reviewedDraft = createReviewedQuestionDraft();
    const protectedFixtureA = "OMITTED_FORMAL_ADOPTION_FIXTURE_A";
    const protectedFixtureB = "OMITTED_FORMAL_ADOPTION_FIXTURE_B";
    const protectedFixtureC = "OMITTED_FORMAL_ADOPTION_FIXTURE_C";
    const routeHandlers =
      createAdminAiGenerationFormalAdoptionRuntimeRouteHandlers({
        adoptionRepository,
        createAdoptionPublicId: () =>
          "admin_ai_formal_adoption_public_route_177",
        formalDraftAdapter,
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
        reviewedDraft,
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
            formalTargetWriteStatus: "draft_created",
            formalQuestionPublicId: "question_formal_draft_route_177",
            formalPaperPublicId: null,
          },
          review: {
            reviewStatus: "approved_for_formal_adoption",
            reviewerPublicId: "admin_content_public_177",
          },
          reviewTraceability: {
            traceabilityStatus: "single_result_traceable",
            sourceGeneratedResultPublicId:
              "admin_ai_generation_result_content_question_177",
            directPublishStatus: "blocked_requires_fresh_publish_task",
            adoptAction: {
              formalTargetWriteStatus: "draft_created",
              formalQuestionPublicId: "question_formal_draft_route_177",
              formalPaperPublicId: null,
            },
            rejectAction: {
              actionStatus: "not_executed",
            },
            redactionStatus: "redacted",
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
        expectedContentDigest: "sha256:admin_ai_generation_result_177",
        resultPublicId: "admin_ai_generation_result_content_question_177",
        targetType: "question",
        reviewDecision: "approved",
        reviewerConfirmed: true,
        reviewedAt: new Date("2026-06-26T20:00:00.000Z"),
      },
    );
    expect(formalDraftAdapter.createFormalDraft).toHaveBeenCalledWith({
      adoption: createAdoptionResult({
        reviewerPublicId: "admin_content_public_stale_177",
      }).adoption,
      reviewedDraft,
      targetType: "question",
      writerContext: {
        actorPublicId: "admin_content_public_177",
      },
    });
    expect(
      adoptionRepository.findTrustedReviewedDraftForAdoption,
    ).toHaveBeenCalledWith({
      expectedContentDigest: "sha256:admin_ai_generation_result_177",
      resultPublicId: "admin_ai_generation_result_content_question_177",
      targetType: "question",
    });
    expect(adoptionRepository.markFormalDraftCreated).toHaveBeenCalledWith({
      adoptionPublicId: "admin_ai_formal_adoption_public_route_177",
      formalPaperPublicId: null,
      formalQuestionPublicId: "question_formal_draft_route_177",
      targetType: "question",
    });
    expect(serializedPayload).not.toContain(protectedFixtureA);
    expect(serializedPayload).not.toContain(protectedFixtureB);
    expect(serializedPayload).not.toContain(protectedFixtureC);
    expect(serializedPayload).not.toContain(reviewedDraft.rawGeneratedContent);
    expect(serializedPayload).not.toContain("synthetic-admin-session");
    expect(serializedPayload).not.toMatch(/"id":/u);
  });

  it("allows content admin to adopt a generated paper into a formal paper draft and updates redacted metadata", async () => {
    const adoptionRepository = createPaperAdoptionRepository();
    const formalDraftAdapter = createPaperFormalDraftAdapter();
    const reviewedDraft = createReviewedPaperDraft();
    const routeHandlers =
      createAdminAiGenerationFormalAdoptionRuntimeRouteHandlers({
        adoptionRepository,
        createAdoptionPublicId: () =>
          "admin_ai_formal_adoption_public_route_177",
        formalDraftAdapter,
        requestClock: () => new Date("2026-06-26T20:00:00.000Z"),
        sessionService: {
          getCurrentSession: vi.fn(async () => createSessionResponse()),
        },
      });

    const response = await routeHandlers.formalAdoptions.POST(
      createPostRequest({
        targetType: "paper",
        reviewDecision: "approved",
        reviewerConfirmed: true,
        reviewedDraft,
      }),
      {
        params: Promise.resolve({
          publicId: "admin_ai_generation_result_content_paper_177",
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
          sourceReference: {
            resultPublicId: "admin_ai_generation_result_content_paper_177",
            workspace: "content",
            generationKind: "paper",
            ownerType: "platform",
            organizationPublicId: null,
          },
          targetReference: {
            targetType: "paper",
            targetDomain: "platform_formal_content",
            formalTargetWriteStatus: "draft_created",
            formalQuestionPublicId: null,
            formalPaperPublicId: "paper_formal_draft_route_177",
          },
          redactionStatus: "redacted",
        },
      },
    });
    expect(formalDraftAdapter.createFormalDraft).toHaveBeenCalledWith({
      adoption: createAdoptionResult({
        generationKind: "paper",
        resultPublicId: "admin_ai_generation_result_content_paper_177",
        targetType: "paper",
      }).adoption,
      reviewedDraft,
      targetType: "paper",
      writerContext: {
        actorPublicId: "admin_content_public_177",
      },
    });
    expect(
      adoptionRepository.findTrustedReviewedDraftForAdoption,
    ).toHaveBeenCalledWith({
      expectedContentDigest: "sha256:admin_ai_generation_result_177",
      resultPublicId: "admin_ai_generation_result_content_paper_177",
      targetType: "paper",
    });
    expect(adoptionRepository.markFormalDraftCreated).toHaveBeenCalledWith({
      adoptionPublicId: "admin_ai_formal_adoption_public_route_177",
      formalPaperPublicId: "paper_formal_draft_route_177",
      formalQuestionPublicId: null,
      targetType: "paper",
    });
    expect(serializedPayload).not.toContain(reviewedDraft.rawGeneratedContent);
    expect(serializedPayload).not.toMatch(/"id":/u);
  });

  it("allows content admin to reject a generated question without formal draft creation", async () => {
    const adoptionRepository = createRejectedAdoptionRepository();
    const formalDraftAdapter = createFormalDraftAdapter();
    const routeHandlers =
      createAdminAiGenerationFormalAdoptionRuntimeRouteHandlers({
        adoptionRepository,
        createAdoptionPublicId: () =>
          "admin_ai_formal_adoption_public_route_177",
        formalDraftAdapter,
        requestClock: () => new Date("2026-06-26T20:00:00.000Z"),
        sessionService: {
          getCurrentSession: vi.fn(async () => createSessionResponse()),
        },
      });

    const response = await routeHandlers.formalAdoptions.POST(
      createPostRequest({
        targetType: "question",
        reviewDecision: "rejected",
        reviewerConfirmed: true,
        rawGeneratedContent: "RAW GENERATED CONTENT MUST NOT RETURN",
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
            reviewStatus: "rejected",
            reviewDecision: "rejected",
            reviewerPublicId: "admin_content_public_177",
          },
          audit: {
            actionType: "admin_ai_generation_result.formal_adoption.reject",
            redactionStatus: "redacted",
          },
          reviewTraceability: {
            reviewStatus: "rejected",
            reviewDecision: "rejected",
            adoptAction: {
              actionStatus: "not_executed",
              actorPublicId: null,
              actionAt: null,
            },
            rejectAction: {
              actionStatus: "executed",
              actionType: "admin_ai_generation_result.formal_adoption.reject",
              actorPublicId: "admin_content_public_177",
              actionAt: "2026-06-26T20:00:00.000Z",
            },
            directPublishStatus: "blocked_requires_fresh_publish_task",
            redactionStatus: "redacted",
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
        expectedContentDigest: "sha256:admin_ai_generation_result_177",
        resultPublicId: "admin_ai_generation_result_content_question_177",
        targetType: "question",
        reviewDecision: "rejected",
        reviewerConfirmed: true,
        reviewedAt: new Date("2026-06-26T20:00:00.000Z"),
      },
    );
    expect(formalDraftAdapter.createFormalDraft).not.toHaveBeenCalled();
    expect(adoptionRepository.markFormalDraftCreated).not.toHaveBeenCalled();
    expect(serializedPayload).not.toContain(
      "RAW GENERATED CONTENT MUST NOT RETURN",
    );
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

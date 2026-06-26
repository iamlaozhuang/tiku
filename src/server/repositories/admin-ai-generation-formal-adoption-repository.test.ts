import { describe, expect, it, vi } from "vitest";

import type {
  AdminAiGenerationFormalAdoptionGateway,
  AdminAiGenerationFormalAdoptionRow,
} from "../contracts/admin-ai-generation-formal-adoption-contract";
import type { AdminAiGenerationFormalAdoptionSourceResult } from "../models/admin-ai-generation-formal-adoption";
import { createAdminAiGenerationFormalAdoptionRepository } from "./admin-ai-generation-formal-adoption-repository";

function createSourceResult(
  overrides: Partial<AdminAiGenerationFormalAdoptionSourceResult> = {},
): AdminAiGenerationFormalAdoptionSourceResult {
  return {
    resultPublicId: "admin_ai_generation_result_public_177",
    taskPublicId: "admin_ai_generation_task_public_177",
    requestPublicId: "admin_ai_generation_request_public_177",
    workspace: "content",
    generationKind: "question",
    ownerType: "platform",
    ownerPublicId: "platform_content_review_pool",
    organizationPublicId: null,
    taskType: "ai_question_generation",
    resultStatus: "draft",
    isFormalAdoptionBlocked: true,
    contentDigest: "sha256:admin_ai_generation_result_177",
    contentPreviewMasked: "masked admin AI result preview",
    evidenceStatus: "weak",
    citationCount: 1,
    aiCallLogPublicId: null,
    ...overrides,
  };
}

function createAdoptionRow(
  overrides: Partial<AdminAiGenerationFormalAdoptionRow> = {},
): AdminAiGenerationFormalAdoptionRow {
  return {
    adoption_public_id: "admin_ai_formal_adoption_public_177",
    source_result_public_id: "admin_ai_generation_result_public_177",
    source_task_public_id: "admin_ai_generation_task_public_177",
    source_request_public_id: "admin_ai_generation_request_public_177",
    workspace: "content",
    generation_kind: "question",
    owner_type: "platform",
    owner_public_id: "platform_content_review_pool",
    organization_public_id: null,
    target_type: "question",
    target_domain: "platform_formal_content",
    review_status: "approved_for_formal_adoption",
    formal_target_write_status: "blocked_without_follow_up_task",
    formal_question_public_id: null,
    formal_paper_public_id: null,
    reviewer_public_id: "admin_content_public_177",
    reviewed_at: new Date("2026-06-26T23:40:00.000Z"),
    content_digest: "sha256:admin_ai_generation_result_177",
    content_preview_masked: "masked admin AI result preview",
    evidence_status: "weak",
    citation_count: 1,
    ai_call_log_public_id: null,
    created_at: new Date("2026-06-26T23:40:00.000Z"),
    ...overrides,
  };
}

function createGateway(options: {
  sourceResult?: AdminAiGenerationFormalAdoptionSourceResult | null;
  existingRow?: AdminAiGenerationFormalAdoptionRow | null;
  insertedRow?: AdminAiGenerationFormalAdoptionRow | null;
}) {
  const findAdoptionBySourceResult = vi.fn(
    async () => options.existingRow ?? null,
  );
  const findSourceResultForAdoption = vi.fn(
    async () => options.sourceResult ?? createSourceResult(),
  );
  const insertAdoptionRecord = vi.fn(
    async () => options.insertedRow ?? createAdoptionRow(),
  );

  const gateway: AdminAiGenerationFormalAdoptionGateway = {
    findAdoptionBySourceResult,
    findSourceResultForAdoption,
    insertAdoptionRecord,
  };

  return {
    gateway,
    findAdoptionBySourceResult,
    findSourceResultForAdoption,
    insertAdoptionRecord,
  };
}

function createBaseInput() {
  const protectedGeneratedText = [
    "RAW",
    "ADMIN",
    "AI",
    "CONTENT",
    "MUST",
    "NOT",
    "LEAK",
  ].join(" ");
  const protectedProviderArtifact = [
    "RAW",
    "PROVIDER",
    "PAYLOAD",
    "MUST",
    "NOT",
    "LEAK",
  ].join(" ");

  return {
    adoptionPublicId: "admin_ai_formal_adoption_public_177",
    actor: {
      publicId: "admin_content_public_177",
      roles: ["content_admin"] as const,
    },
    resultPublicId: "admin_ai_generation_result_public_177",
    targetType: "question" as const,
    reviewDecision: "approved" as const,
    reviewerConfirmed: true as const,
    reviewedAt: new Date("2026-06-26T23:40:00.000Z"),
    protectedGeneratedText,
    protectedProviderArtifact,
  };
}

describe("admin AI generation formal adoption repository", () => {
  it("creates a redacted platform formal adoption plan for a reviewed content generated question result", async () => {
    const { gateway, findSourceResultForAdoption, insertAdoptionRecord } =
      createGateway({
        sourceResult: createSourceResult(),
        insertedRow: createAdoptionRow(),
      });
    const repository = createAdminAiGenerationFormalAdoptionRepository(gateway);
    const input = createBaseInput();

    const result = await repository.createOrReuseFormalAdoption(input);
    const serializedResult = JSON.stringify(result);

    expect(findSourceResultForAdoption).toHaveBeenCalledWith(
      "admin_ai_generation_result_public_177",
    );
    expect(insertAdoptionRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        adoptionPublicId: "admin_ai_formal_adoption_public_177",
        sourceResultPublicId: "admin_ai_generation_result_public_177",
        sourceTaskPublicId: "admin_ai_generation_task_public_177",
        sourceRequestPublicId: "admin_ai_generation_request_public_177",
        workspace: "content",
        targetType: "question",
        targetDomain: "platform_formal_content",
        reviewStatus: "approved_for_formal_adoption",
        formalTargetWriteStatus: "blocked_without_follow_up_task",
        formalQuestionPublicId: null,
        formalPaperPublicId: null,
        reviewerPublicId: "admin_content_public_177",
      }),
    );
    expect(result).toEqual({
      persistenceStatus: "created",
      adoption: {
        adoptionPublicId: "admin_ai_formal_adoption_public_177",
        sourceReference: {
          resultPublicId: "admin_ai_generation_result_public_177",
          taskPublicId: "admin_ai_generation_task_public_177",
          requestPublicId: "admin_ai_generation_request_public_177",
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
          reviewedAt: "2026-06-26T23:40:00.000Z",
        },
        sourceSummary: {
          contentDigest: "sha256:admin_ai_generation_result_177",
          contentPreviewMasked: "masked admin AI result preview",
          evidenceStatus: "weak",
          citationCount: 1,
          aiCallLogPublicId: null,
          redactionStatus: "redacted",
        },
        audit: {
          actionType: "admin_ai_generation_result.formal_adoption.approve",
          targetResourceType: "admin_ai_generation_result",
          targetPublicId: "admin_ai_generation_result_public_177",
          redactionStatus: "redacted",
        },
        redactionStatus: "redacted",
      },
    });
    expect(serializedResult).not.toContain(input.protectedGeneratedText);
    expect(serializedResult).not.toContain(input.protectedProviderArtifact);
    expect(serializedResult).not.toMatch(/"id":/u);
  });

  it("reuses an existing adoption plan for the same source result and target type", async () => {
    const existingRow = createAdoptionRow({
      adoption_public_id: "admin_ai_formal_adoption_public_existing",
    });
    const { gateway, insertAdoptionRecord } = createGateway({ existingRow });
    const repository = createAdminAiGenerationFormalAdoptionRepository(gateway);

    const result = await repository.createOrReuseFormalAdoption({
      ...createBaseInput(),
      adoptionPublicId: "admin_ai_formal_adoption_public_new",
    });

    expect(result.persistenceStatus).toBe("reused");
    expect(result.adoption.adoptionPublicId).toBe(
      "admin_ai_formal_adoption_public_existing",
    );
    expect(insertAdoptionRecord).not.toHaveBeenCalled();
  });

  it("rejects organization generated results from platform formal adoption", async () => {
    const { gateway, insertAdoptionRecord } = createGateway({
      sourceResult: createSourceResult({
        workspace: "organization",
        ownerType: "organization",
        ownerPublicId: "organization_public_177",
        organizationPublicId: "organization_public_177",
      }),
    });
    const repository = createAdminAiGenerationFormalAdoptionRepository(gateway);

    await expect(
      repository.createOrReuseFormalAdoption({
        ...createBaseInput(),
        actor: {
          publicId: "admin_org_public_177",
          roles: ["org_admin"],
        },
      }),
    ).rejects.toThrow(
      "organization AI generation formal adoption requires a separate organization-scoped task",
    );
    expect(insertAdoptionRecord).not.toHaveBeenCalled();
  });

  it("rejects unconfirmed or target-mismatched adoption commands before inserting records", async () => {
    const { gateway, insertAdoptionRecord } = createGateway({
      sourceResult: createSourceResult({
        generationKind: "paper",
        taskType: "ai_paper_generation",
      }),
    });
    const repository = createAdminAiGenerationFormalAdoptionRepository(gateway);

    await expect(
      repository.createOrReuseFormalAdoption({
        ...createBaseInput(),
        reviewerConfirmed: false,
      }),
    ).rejects.toThrow(
      "explicit formal adoption review confirmation is required",
    );
    await expect(
      repository.createOrReuseFormalAdoption(createBaseInput()),
    ).rejects.toThrow("admin AI generation result target type mismatch");
    expect(insertAdoptionRecord).not.toHaveBeenCalled();
  });
});

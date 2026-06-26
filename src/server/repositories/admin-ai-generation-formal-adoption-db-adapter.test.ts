import { describe, expect, it } from "vitest";

import type {
  AdminAiGenerationFormalAdoptionRow,
  InsertAdminAiGenerationFormalAdoptionInput,
} from "../contracts/admin-ai-generation-formal-adoption-contract";
import type { AdminAiGenerationFormalAdoptionSourceResult } from "../models/admin-ai-generation-formal-adoption";
import {
  createAdminAiGenerationFormalDraftMetadataUpdateValue,
  createAdminAiGenerationFormalAdoptionInsertValue,
  mapAdminAiGenerationFormalAdoptionDbRowToRow,
  mapAdminAiGenerationFormalAdoptionSourceResultDbRowToSourceResult,
} from "./admin-ai-generation-formal-adoption-db-adapter";

function createAdoptionInput(
  overrides: Partial<InsertAdminAiGenerationFormalAdoptionInput> = {},
): InsertAdminAiGenerationFormalAdoptionInput {
  return {
    adoptionPublicId: "admin_ai_formal_adoption_public_901",
    sourceResultPublicId: "admin_ai_generation_result_public_901",
    sourceTaskPublicId: "admin_ai_generation_task_public_901",
    sourceRequestPublicId: "admin_ai_generation_request_public_901",
    workspace: "content",
    generationKind: "question",
    ownerType: "platform",
    ownerPublicId: "platform_content_review_pool",
    organizationPublicId: null,
    targetType: "question",
    targetDomain: "platform_formal_content",
    reviewStatus: "approved_for_formal_adoption",
    formalTargetWriteStatus: "blocked_without_follow_up_task",
    formalQuestionPublicId: null,
    formalPaperPublicId: null,
    reviewerPublicId: "admin_content_public_901",
    reviewedAt: new Date("2026-06-26T23:50:00.000Z"),
    contentDigest: "sha256:admin_ai_generation_result_901",
    contentPreviewMasked: "masked formal adoption source preview",
    evidenceStatus: "weak",
    citationCount: 1,
    aiCallLogPublicId: null,
    createdAt: new Date("2026-06-26T23:50:00.000Z"),
    ...overrides,
  };
}

function createAdoptionDbRow(
  overrides: Partial<AdminAiGenerationFormalAdoptionDbRowFixture> = {},
): AdminAiGenerationFormalAdoptionDbRowFixture {
  return {
    id: 901,
    public_id: "admin_ai_formal_adoption_public_901",
    source_result_public_id: "admin_ai_generation_result_public_901",
    source_task_public_id: "admin_ai_generation_task_public_901",
    source_request_public_id: "admin_ai_generation_request_public_901",
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
    reviewer_public_id: "admin_content_public_901",
    reviewed_at: new Date("2026-06-26T23:50:00.000Z"),
    content_digest: "sha256:admin_ai_generation_result_901",
    content_preview_masked: "masked formal adoption source preview",
    evidence_status: "weak",
    citation_count: 1,
    ai_call_log_public_id: null,
    created_at: new Date("2026-06-26T23:50:00.000Z"),
    updated_at: new Date("2026-06-26T23:50:00.000Z"),
    ...overrides,
  };
}

function createSourceResultDbRow(
  overrides: Partial<AdminAiGenerationFormalAdoptionSourceResultDbRowFixture> = {},
): AdminAiGenerationFormalAdoptionSourceResultDbRowFixture {
  return {
    public_id: "admin_ai_generation_result_public_901",
    task_public_id: "admin_ai_generation_task_public_901",
    request_public_id: "admin_ai_generation_request_public_901",
    workspace: "content",
    generation_kind: "question",
    owner_type: "platform",
    owner_public_id: "platform_content_review_pool",
    organization_public_id: null,
    task_type: "ai_question_generation",
    result_status: "draft",
    is_formal_adoption_blocked: true,
    content_digest: "sha256:admin_ai_generation_result_901",
    content_preview_masked: "masked formal adoption source preview",
    evidence_status: "weak",
    citation_count: 1,
    ai_call_log_public_id: null,
    ...overrides,
  };
}

function protectedAiTerms(): string[] {
  return [
    ["raw", "prompt"].join("_"),
    ["raw", "output"].join("_"),
    ["provider", "payload"].join("_"),
    ["generated", "content"].join("_"),
  ];
}

type AdminAiGenerationFormalAdoptionDbRowFixture = {
  id: number;
  public_id: string;
  source_result_public_id: string;
  source_task_public_id: string;
  source_request_public_id: string;
  workspace: string;
  generation_kind: string;
  owner_type: string;
  owner_public_id: string;
  organization_public_id: string | null;
  target_type: string;
  target_domain: string;
  review_status: string;
  formal_target_write_status: string;
  formal_question_public_id: string | null;
  formal_paper_public_id: string | null;
  reviewer_public_id: string;
  reviewed_at: Date;
  content_digest: string;
  content_preview_masked: string;
  evidence_status: string;
  citation_count: number;
  ai_call_log_public_id: string | null;
  created_at: Date;
  updated_at: Date;
};

type AdminAiGenerationFormalAdoptionSourceResultDbRowFixture = {
  public_id: string;
  task_public_id: string;
  request_public_id: string;
  workspace: string;
  generation_kind: string;
  owner_type: string;
  owner_public_id: string;
  organization_public_id: string | null;
  task_type: string;
  result_status: string;
  is_formal_adoption_blocked: boolean;
  content_digest: string;
  content_preview_masked: string;
  evidence_status: string;
  citation_count: number;
  ai_call_log_public_id: string | null;
};

describe("admin AI generation formal adoption DB adapter", () => {
  it("builds metadata-only adoption insert values without raw generated content or formal draft writes", () => {
    const input = createAdoptionInput();
    const values = createAdminAiGenerationFormalAdoptionInsertValue(input);

    expect(values).toMatchObject({
      public_id: input.adoptionPublicId,
      source_result_public_id: input.sourceResultPublicId,
      source_task_public_id: input.sourceTaskPublicId,
      source_request_public_id: input.sourceRequestPublicId,
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
      reviewer_public_id: "admin_content_public_901",
      reviewed_at: input.reviewedAt,
      content_digest: "sha256:admin_ai_generation_result_901",
      content_preview_masked: "masked formal adoption source preview",
      evidence_status: "weak",
      citation_count: 1,
      ai_call_log_public_id: null,
      created_at: input.createdAt,
      updated_at: input.createdAt,
    });
    expect(JSON.stringify(values)).not.toMatch(
      /question_id|paper_id|content_redacted_snapshot/u,
    );
    for (const protectedTerm of protectedAiTerms()) {
      expect(JSON.stringify(values)).not.toContain(protectedTerm);
    }
  });

  it("maps generated-result rows to adoption source DTOs without internal ids", () => {
    const sourceResult =
      mapAdminAiGenerationFormalAdoptionSourceResultDbRowToSourceResult(
        createSourceResultDbRow(),
      );

    expect(
      sourceResult satisfies AdminAiGenerationFormalAdoptionSourceResult,
    ).toMatchObject({
      resultPublicId: "admin_ai_generation_result_public_901",
      taskPublicId: "admin_ai_generation_task_public_901",
      requestPublicId: "admin_ai_generation_request_public_901",
      workspace: "content",
      generationKind: "question",
      ownerType: "platform",
      ownerPublicId: "platform_content_review_pool",
      organizationPublicId: null,
      taskType: "ai_question_generation",
      resultStatus: "draft",
      isFormalAdoptionBlocked: true,
      contentDigest: "sha256:admin_ai_generation_result_901",
      contentPreviewMasked: "masked formal adoption source preview",
      evidenceStatus: "weak",
      citationCount: 1,
      aiCallLogPublicId: null,
    });
    expect(JSON.stringify(sourceResult)).not.toMatch(/"id":/u);
  });

  it("maps adoption DB rows to repository rows while keeping formal target writes blocked", () => {
    const row = mapAdminAiGenerationFormalAdoptionDbRowToRow(
      createAdoptionDbRow(),
    );

    expect(row satisfies AdminAiGenerationFormalAdoptionRow).toMatchObject({
      adoption_public_id: "admin_ai_formal_adoption_public_901",
      source_result_public_id: "admin_ai_generation_result_public_901",
      source_task_public_id: "admin_ai_generation_task_public_901",
      source_request_public_id: "admin_ai_generation_request_public_901",
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
      reviewer_public_id: "admin_content_public_901",
      content_digest: "sha256:admin_ai_generation_result_901",
      content_preview_masked: "masked formal adoption source preview",
      evidence_status: "weak",
      citation_count: 1,
      ai_call_log_public_id: null,
    });
    expect(JSON.stringify(row)).not.toMatch(/"id":/u);
  });

  it("maps draft-created question rows only when the matching formal question id is present", () => {
    const row = mapAdminAiGenerationFormalAdoptionDbRowToRow(
      createAdoptionDbRow({
        formal_question_public_id: "question_formal_draft_901",
        formal_target_write_status: "draft_created",
      }),
    );

    expect(row).toMatchObject({
      target_type: "question",
      formal_target_write_status: "draft_created",
      formal_question_public_id: "question_formal_draft_901",
      formal_paper_public_id: null,
    });
  });

  it("builds draft-created metadata update values for one matching formal draft id", () => {
    expect(
      createAdminAiGenerationFormalDraftMetadataUpdateValue({
        adoptionPublicId: "admin_ai_formal_adoption_public_901",
        formalPaperPublicId: null,
        formalQuestionPublicId: "question_formal_draft_901",
        targetType: "question",
      }),
    ).toEqual({
      formal_target_write_status: "draft_created",
      formal_question_public_id: "question_formal_draft_901",
      formal_paper_public_id: null,
    });
  });

  it("rejects DB rows that point to mismatched formal question or paper drafts", () => {
    expect(() =>
      mapAdminAiGenerationFormalAdoptionDbRowToRow(
        createAdoptionDbRow({
          formal_target_write_status: "draft_created",
          formal_question_public_id: "question_public_unsafe",
          formal_paper_public_id: "paper_public_unsafe",
        }),
      ),
    ).toThrow("admin AI generation formal target write is not approved");
  });
});

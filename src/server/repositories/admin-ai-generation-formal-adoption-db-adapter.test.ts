import { describe, expect, it } from "vitest";

import type {
  AdminAiGenerationFormalAdoptionRow,
  AdminAiGenerationKnowledgeNodeCandidateSnapshot,
  AdminAiGenerationKnowledgeNodeResolutionSnapshot,
  InsertAdminAiGenerationFormalAdoptionInput,
} from "../contracts/admin-ai-generation-formal-adoption-contract";
import type { AdminAiGenerationFormalAdoptionSourceResult } from "../models/admin-ai-generation-formal-adoption";
import {
  createAdminAiGenerationFormalDraftMetadataUpdateValue,
  createAdminAiGenerationFormalAdoptionAuditInsertValue,
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
    reviewerRole: "content_admin",
    reviewedAt: new Date("2026-06-26T23:50:00.000Z"),
    contentDigest: "sha256:admin_ai_generation_result_901",
    contentPreviewMasked: "masked formal adoption source preview",
    evidenceStatus: "weak",
    citationCount: 1,
    aiCallLogPublicId: null,
    knowledgeNodeCandidateSnapshot: null,
    knowledgeNodeCandidateDigest: null,
    knowledgeNodeResolutionSnapshot: null,
    knowledgeNodeResolutionDigest: null,
    reviewDraftPublicId: "admin_ai_review_draft_public_901",
    reviewDraftRevision: 0,
    reviewDraftDigest:
      "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
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
    knowledge_node_candidate_snapshot: null,
    knowledge_node_candidate_digest: null,
    knowledge_node_resolution_snapshot: null,
    knowledge_node_resolution_digest: null,
    review_draft_public_id: "admin_ai_review_draft_public_901",
    review_draft_revision: 0,
    review_draft_digest:
      "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    created_at: new Date("2026-06-26T23:50:00.000Z"),
    updated_at: new Date("2026-06-26T23:50:00.000Z"),
    ...overrides,
  };
}

function createSourceResultDbRow(
  overrides: Partial<AdminAiGenerationFormalAdoptionSourceResultDbRowFixture> = {},
): AdminAiGenerationFormalAdoptionSourceResultDbRowFixture {
  return {
    id: 901,
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
    content_redacted_snapshot: {
      formalReviewedDraft: {
        questionType: "short_answer",
        profession: "marketing",
        level: 3,
        subject: "theory",
        stemRichText: "server-owned reviewed question",
      },
    },
    content_digest: "sha256:admin_ai_generation_result_901",
    content_preview_masked: "masked formal adoption source preview",
    evidence_status: "weak",
    citation_count: 1,
    ai_call_log_public_id: null,
    current_review_draft_public_id: "admin_ai_review_draft_public_901",
    current_review_draft_revision: 0,
    current_review_draft_digest:
      "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    reviewed_draft_snapshot: {
      questionType: "short_answer",
      profession: "marketing",
      level: 3,
      subject: "theory",
      stemRichText: "server-owned reviewed question",
    },
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
  knowledge_node_candidate_snapshot: AdminAiGenerationKnowledgeNodeCandidateSnapshot | null;
  knowledge_node_candidate_digest: string | null;
  knowledge_node_resolution_snapshot: AdminAiGenerationKnowledgeNodeResolutionSnapshot | null;
  knowledge_node_resolution_digest: string | null;
  review_draft_public_id: string;
  review_draft_revision: number;
  review_draft_digest: string;
  created_at: Date;
  updated_at: Date;
};

type AdminAiGenerationFormalAdoptionSourceResultDbRowFixture = {
  id: number;
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
  content_redacted_snapshot: unknown;
  content_digest: string;
  content_preview_masked: string;
  evidence_status: string;
  citation_count: number;
  ai_call_log_public_id: string | null;
  current_review_draft_public_id: string | null;
  current_review_draft_revision: number | null;
  current_review_draft_digest: string | null;
  reviewed_draft_snapshot: unknown | null;
};

describe("admin AI generation formal adoption DB adapter", () => {
  it("builds a redacted adoption audit bound to the exact review revision", () => {
    const audit = createAdminAiGenerationFormalAdoptionAuditInsertValue(
      createAdoptionInput(),
    );

    expect(audit).toMatchObject({
      actor_public_id: "admin_content_public_901",
      actor_role: "content_admin",
      action_type: "admin_ai_generation_result.formal_adoption.approve",
      target_public_id: "admin_ai_generation_result_public_901",
    });
    expect(audit.metadata_summary).toContain('"reviewDraftRevision":0');
    expect(audit.metadata_summary).toContain('"reviewDraftDigest":"sha256:');
    expect(audit.metadata_summary).not.toContain("formalReviewedDraft");
  });

  it("maps immutable generated-knowledge snapshots and digests without exposing them in public DTOs", () => {
    const candidateSnapshot = {
      schemaVersion: 1 as const,
      generationMode: "balanced" as const,
      resultPublicId: "admin_ai_generation_result_public_901",
      taskPublicId: "admin_ai_generation_task_public_901",
      requestPublicId: "admin_ai_generation_request_public_901",
      sourceContentDigest:
        "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      profession: "marketing" as const,
      level: 3,
      generatedLabels: ["营销基础"],
    };
    const resolutionSnapshot = {
      schemaVersion: 1 as const,
      decision: "approved" as const,
      sourceContentDigest: candidateSnapshot.sourceContentDigest,
      generatedLabels: ["营销基础"],
      mappings: [
        {
          label: "营销基础",
          knowledgeNodePublicId: "knowledge_node_public_marketing",
        },
      ],
    };
    const values = createAdminAiGenerationFormalAdoptionInsertValue(
      createAdoptionInput({
        knowledgeNodeCandidateSnapshot: candidateSnapshot,
        knowledgeNodeCandidateDigest:
          "sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        knowledgeNodeResolutionSnapshot: resolutionSnapshot,
        knowledgeNodeResolutionDigest:
          "sha256:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
      }),
    );

    expect(values).toMatchObject({
      knowledge_node_candidate_snapshot: candidateSnapshot,
      knowledge_node_candidate_digest:
        "sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      knowledge_node_resolution_snapshot: resolutionSnapshot,
      knowledge_node_resolution_digest:
        "sha256:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
    });
  });
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
      review_draft_public_id: "admin_ai_review_draft_public_901",
      review_draft_revision: 0,
      review_draft_digest:
        "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
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

  it("builds metadata-only rejection insert values without formal draft writes", () => {
    const input = createAdoptionInput({
      reviewStatus: "rejected",
    });
    const values = createAdminAiGenerationFormalAdoptionInsertValue(input);

    expect(values).toMatchObject({
      public_id: input.adoptionPublicId,
      source_result_public_id: input.sourceResultPublicId,
      review_status: "rejected",
      formal_target_write_status: "blocked_without_follow_up_task",
      formal_question_public_id: null,
      formal_paper_public_id: null,
      reviewer_public_id: "admin_content_public_901",
      content_digest: "sha256:admin_ai_generation_result_901",
      content_preview_masked: "masked formal adoption source preview",
    });
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
      reviewedDraft: {
        questionType: "short_answer",
        profession: "marketing",
        level: 3,
        subject: "theory",
        stemRichText: "server-owned reviewed question",
      },
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

  it("maps rejected adoption DB rows while keeping formal target writes blocked", () => {
    const row = mapAdminAiGenerationFormalAdoptionDbRowToRow(
      createAdoptionDbRow({
        review_status: "rejected",
      }),
    );

    expect(row satisfies AdminAiGenerationFormalAdoptionRow).toMatchObject({
      adoption_public_id: "admin_ai_formal_adoption_public_901",
      source_result_public_id: "admin_ai_generation_result_public_901",
      review_status: "rejected",
      formal_target_write_status: "blocked_without_follow_up_task",
      formal_question_public_id: null,
      formal_paper_public_id: null,
      reviewer_public_id: "admin_content_public_901",
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

import { describe, expect, it } from "vitest";

import type {
  AdminAiGenerationResultPersistenceRow,
  CreateAdminAiGenerationResultInput,
  InsertAdminAiGenerationDraftResultInput,
} from "../contracts/admin-ai-generation-result-persistence-contract";
import {
  createAdminAiGenerationResultInsertValue,
  createAdminAiGenerationResultTaskUpdateValue,
  mapAdminAiGenerationResultDbRowToRow,
  persistAdminAiGenerationDraftResultAndCompleteTask,
} from "./admin-ai-generation-result-persistence-db-adapter";
import type { RuntimeDatabase } from "./runtime-database";

function createDraftResultInput(
  overrides: Partial<InsertAdminAiGenerationDraftResultInput> = {},
): InsertAdminAiGenerationDraftResultInput {
  return {
    resultPublicId: "admin_ai_generation_result_public_901",
    aiGenerationTaskId: 701,
    taskPublicId: "admin_ai_generation_task_public_901",
    requestPublicId: "admin_ai_generation_request_public_901",
    workspace: "content",
    generationKind: "question",
    ownerType: "platform",
    ownerPublicId: "platform_content_review_pool",
    organizationPublicId: null,
    taskType: "ai_question_generation",
    resultStatus: "draft",
    contentRedactedSnapshot: {
      redactionStatus: "redacted",
      contentDigest: "sha256:admin_result_901",
    },
    contentDigest: "sha256:admin_result_901",
    contentPreviewMasked: "masked admin generated result preview",
    citationRedactedSnapshot: null,
    evidenceStatus: "weak",
    citationCount: 1,
    aiCallLogPublicId: null,
    sourceQuestionPublicId: null,
    sourcePaperPublicId: null,
    isFormalAdoptionBlocked: true,
    createdAt: new Date("2026-06-26T22:30:00.000Z"),
    ...overrides,
    attempt: overrides.attempt ?? {
      taskPublicId: "admin_ai_generation_task_public_901",
      retryCount: 0,
      startedAt: new Date("2026-06-26T22:29:30.000Z"),
    },
  };
}

function createPersistenceInput(
  overrides: Partial<CreateAdminAiGenerationResultInput> = {},
): CreateAdminAiGenerationResultInput {
  return {
    resultPublicId: "admin_ai_generation_result_public_902",
    taskPublicId: "admin_ai_generation_task_public_902",
    workspace: "organization",
    generationKind: "paper",
    ownerType: "organization",
    ownerPublicId: "organization_public_902",
    organizationPublicId: "organization_public_902",
    taskType: "ai_paper_generation",
    contentRedactedSnapshot: { redactionStatus: "redacted" },
    contentDigest: "sha256:admin_result_902",
    contentPreviewMasked: "masked admin generated result preview 902",
    citationRedactedSnapshot: null,
    evidenceStatus: "sufficient",
    citationCount: 2,
    aiCallLogPublicId: "ai_call_log_public_902",
    sourceQuestionPublicId: null,
    sourcePaperPublicId: null,
    createdAt: new Date("2026-06-26T22:35:00.000Z"),
    ...overrides,
    attempt: overrides.attempt ?? {
      taskPublicId: "admin_ai_generation_task_public_902",
      retryCount: 1,
      startedAt: new Date("2026-06-26T22:34:30.123Z"),
    },
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

describe("admin AI generation result persistence DB adapter", () => {
  it("rolls back the inserted result when the exact running attempt loses the success CAS", async () => {
    const input = createDraftResultInput();
    const insertedRow = {
      id: 901,
      ...createAdminAiGenerationResultInsertValue(input),
    };
    const transactionDatabase = {
      insert: () => ({
        values: () => ({
          onConflictDoNothing: () => ({
            returning: async () => [insertedRow],
          }),
        }),
      }),
      update: () => ({
        set: () => ({
          where: () => ({ returning: async () => [] }),
        }),
      }),
    };
    const transaction = async (callback: (database: unknown) => unknown) =>
      callback(transactionDatabase);

    await expect(
      persistAdminAiGenerationDraftResultAndCompleteTask(
        { transaction } as unknown as RuntimeDatabase,
        input,
      ),
    ).rejects.toThrow("completion attempt was lost");
  });

  it("builds a backend admin draft result insert value without raw provider or formal columns", () => {
    const input = createDraftResultInput();
    const values = createAdminAiGenerationResultInsertValue(input);

    expect(values).toMatchObject({
      public_id: input.resultPublicId,
      ai_generation_task_id: 701,
      task_public_id: input.taskPublicId,
      request_public_id: input.requestPublicId,
      workspace: "content",
      generation_kind: "question",
      owner_type: "platform",
      owner_public_id: "platform_content_review_pool",
      organization_public_id: null,
      task_type: "ai_question_generation",
      result_status: "draft",
      content_redacted_snapshot: input.contentRedactedSnapshot,
      content_digest: "sha256:admin_result_901",
      content_preview_masked: "masked admin generated result preview",
      citation_redacted_snapshot: null,
      evidence_status: "weak",
      citation_count: 1,
      ai_call_log_public_id: null,
      source_question_public_id: null,
      source_paper_public_id: null,
      is_formal_adoption_blocked: true,
      created_at: input.createdAt,
      updated_at: input.createdAt,
    });
    expect(JSON.stringify(values)).not.toMatch(
      /question_id|paper_id|adopted_question_id|adopted_paper_id/u,
    );
    for (const protectedTerm of protectedAiTerms()) {
      expect(JSON.stringify(values)).not.toContain(protectedTerm);
    }
  });

  it("builds task update values with result summary fields only", () => {
    const input = createPersistenceInput();
    const values = createAdminAiGenerationResultTaskUpdateValue(input);

    expect(values).toMatchObject({
      task_status: "succeeded",
      result_public_id: "admin_ai_generation_result_public_902",
      evidence_status: "sufficient",
      citation_count: 2,
      ai_call_log_public_id: "ai_call_log_public_902",
    });
    expect(JSON.stringify(values)).not.toMatch(
      /question_public_id|paper_public_id|answer_record_public_id|mock_exam_public_id/u,
    );
  });

  it("maps backend admin result DB rows to DTO-safe persistence rows", () => {
    const row = mapAdminAiGenerationResultDbRowToRow({
      id: 901,
      public_id: "admin_ai_generation_result_public_901",
      ai_generation_task_id: 701,
      task_public_id: "admin_ai_generation_task_public_901",
      request_public_id: "admin_ai_generation_request_public_901",
      workspace: "organization",
      generation_kind: "paper",
      owner_type: "organization",
      owner_public_id: "organization_public_901",
      organization_public_id: "organization_public_901",
      task_type: "ai_paper_generation",
      result_status: "draft",
      content_redacted_snapshot: {
        redactionStatus: "redacted",
        contentDigest: "sha256:admin_result_901",
      },
      content_digest: "sha256:admin_result_901",
      content_preview_masked: "masked admin generated result preview",
      citation_redacted_snapshot: null,
      evidence_status: "weak",
      citation_count: 1,
      ai_call_log_public_id: null,
      source_question_public_id: null,
      source_paper_public_id: null,
      is_formal_adoption_blocked: true,
      formal_adoption_review_status: null,
      formal_adoption_target_write_status: null,
      formal_adoption_question_public_id: null,
      formal_adoption_paper_public_id: null,
      formal_adoption_reviewed_at: null,
      created_at: new Date("2026-06-26T23:00:00.000Z"),
      updated_at: new Date("2026-06-26T23:00:00.000Z"),
    });

    expect(row satisfies AdminAiGenerationResultPersistenceRow).toMatchObject({
      public_id: "admin_ai_generation_result_public_901",
      workspace: "organization",
      generation_kind: "paper",
      owner_type: "organization",
      owner_public_id: "organization_public_901",
      organization_public_id: "organization_public_901",
      task_type: "ai_paper_generation",
      result_status: "draft",
      content_digest: "sha256:admin_result_901",
      content_preview_masked: "masked admin generated result preview",
      evidence_status: "weak",
      citation_count: 1,
      is_formal_adoption_blocked: true,
    });
    expect(JSON.stringify(row)).not.toMatch(/"id":/u);
  });

  it("rejects rows that would make backend admin generated results formal content", () => {
    expect(() =>
      mapAdminAiGenerationResultDbRowToRow({
        id: 901,
        public_id: "admin_ai_generation_result_public_unsafe",
        ai_generation_task_id: 701,
        task_public_id: "admin_ai_generation_task_public_unsafe",
        request_public_id: "admin_ai_generation_request_public_unsafe",
        workspace: "content",
        generation_kind: "question",
        owner_type: "platform",
        owner_public_id: "platform_content_review_pool",
        organization_public_id: null,
        task_type: "ai_question_generation",
        result_status: "draft",
        content_redacted_snapshot: { redactionStatus: "redacted" },
        content_digest: "sha256:unsafe",
        content_preview_masked: "masked unsafe",
        citation_redacted_snapshot: null,
        evidence_status: "weak",
        citation_count: 1,
        ai_call_log_public_id: null,
        source_question_public_id: null,
        source_paper_public_id: null,
        is_formal_adoption_blocked: false,
        formal_adoption_review_status: null,
        formal_adoption_target_write_status: null,
        formal_adoption_question_public_id: null,
        formal_adoption_paper_public_id: null,
        formal_adoption_reviewed_at: null,
        created_at: new Date("2026-06-26T23:10:00.000Z"),
        updated_at: new Date("2026-06-26T23:10:00.000Z"),
      }),
    ).toThrow("unsafe admin AI generation formal adoption boundary");
  });
});

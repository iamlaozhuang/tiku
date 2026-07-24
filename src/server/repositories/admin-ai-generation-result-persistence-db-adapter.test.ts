import { describe, expect, it, vi } from "vitest";

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
      formalReviewedDraft: {
        questionType: "short_answer",
        profession: "marketing",
        level: 3,
        subject: "theory",
        difficulty: "medium",
        stemRichText: "<p>reviewed question</p>",
        analysisRichText: "<p>reviewed analysis</p>",
        standardAnswerRichText: "<p>reviewed answer</p>",
        multiChoiceRule: "all_correct_only",
        scoringMethod: "ai_scoring",
        materialPublicId: null,
        questionOptions: [],
        scoringPoints: [
          { description: "key point", score: "2.0", sortOrder: 1 },
        ],
        fillBlankAnswers: [],
        knowledgeNodePublicIds: [],
        tagPublicIds: [],
      },
    },
    contentDigest: "sha256:admin_result_901",
    contentPreviewMasked: "masked admin generated result preview",
    citationRedactedSnapshot: null,
    evidenceStatus: "weak",
    citationCount: 1,
    aiCallLogPublicId: "ai_call_log_public_901",
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

function containsText(value: unknown, text: string, seen = new Set()): boolean {
  if (typeof value === "string") {
    return value.includes(text);
  }
  if (typeof value !== "object" || value === null || seen.has(value)) {
    return false;
  }
  seen.add(value);
  return Object.values(value).some((item) => containsText(item, text, seen));
}

function createMeasuredAiCallLogRow(
  id: number,
  overrides: Record<string, unknown> = {},
) {
  return {
    id,
    observationSchemaVersion: 1,
    tokenSource: "provider_reported",
    tokenEstimationMethod: null,
    promptTokenCount: 10,
    completionTokenCount: 20,
    totalTokenCount: 30,
    estimatedCostCny: "0.001000",
    latencySource: "client_observed",
    latencyMs: 50,
    ...overrides,
  };
}

describe("admin AI generation result persistence DB adapter", () => {
  it("rolls back the inserted result when the exact running attempt loses the success CAS", async () => {
    const input = createDraftResultInput();
    const insertedRow = {
      id: 901,
      ...createAdminAiGenerationResultInsertValue(input),
    };
    let updateCallCount = 0;
    const transactionDatabase = {
      select: () => ({
        from: () => ({
          where: () => ({
            for: () => ({
              limit: async () => [{ id: 701, aiCallLogId: 801 }],
            }),
          }),
        }),
      }),
      insert: () => {
        return {
          values: (values: { public_id?: string }) => ({
            returning: async () => [{ public_id: values.public_id }],
            onConflictDoNothing: () => ({
              returning: async () => [insertedRow],
            }),
          }),
        };
      },
      update: () => {
        updateCallCount += 1;
        return {
          set: () => ({
            where: () => ({
              returning: async () => {
                if (updateCallCount === 1)
                  return [createMeasuredAiCallLogRow(801)];
                if (updateCallCount === 2)
                  return [
                    {
                      ...insertedRow,
                      current_review_draft_public_id:
                        "admin_ai_review_draft_initial_persistence_test",
                      current_review_draft_revision: 0,
                      current_review_draft_digest:
                        "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
                    },
                  ];
                return [];
              },
            }),
          }),
        };
      },
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

  it("finalizes the exact bound running log, inserts one result, and completes the same attempt in one transaction", async () => {
    const input = createDraftResultInput();
    const insertedRow = {
      id: 901,
      ...createAdminAiGenerationResultInsertValue(input),
    };
    const updateValues: unknown[] = [];
    const updateConditions: unknown[] = [];
    const insertValues: unknown[] = [];
    let updateCallCount = 0;
    const transactionDatabase = {
      select: () => ({
        from: () => ({
          where: () => ({
            for: () => ({
              limit: async () => [{ id: 701, aiCallLogId: 801 }],
            }),
          }),
        }),
      }),
      insert: () => {
        return {
          values: (values: { public_id?: string }) => {
            insertValues.push(values);
            return {
              returning: async () => [{ public_id: values.public_id }],
              onConflictDoNothing: () => ({
                returning: async () => [insertedRow],
              }),
            };
          },
        };
      },
      update: () => {
        updateCallCount += 1;
        return {
          set: (values: unknown) => {
            updateValues.push(values);
            return {
              where: (condition: unknown) => {
                updateConditions.push(condition);
                return {
                  returning: async () => {
                    if (updateCallCount === 1)
                      return [createMeasuredAiCallLogRow(801)];
                    if (updateCallCount === 2)
                      return [
                        {
                          ...insertedRow,
                          current_review_draft_public_id:
                            "admin_ai_review_draft_initial_success_test",
                          current_review_draft_revision: 0,
                          current_review_draft_digest:
                            "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
                        },
                      ];
                    return [{ public_id: input.taskPublicId }];
                  },
                };
              },
            };
          },
        };
      },
    };
    const transaction = vi.fn(async (callback) =>
      callback(transactionDatabase),
    );

    const result = await persistAdminAiGenerationDraftResultAndCompleteTask(
      { transaction } as unknown as RuntimeDatabase,
      input,
    );

    expect(transaction).toHaveBeenCalledTimes(1);
    expect(updateValues).toEqual([
      expect.objectContaining({ call_status: "success" }),
      expect.objectContaining({ current_review_draft_revision: 0 }),
      expect.objectContaining({
        task_status: "succeeded",
        ai_call_log_public_id: input.aiCallLogPublicId,
      }),
    ]);
    expect(insertValues[1]).toMatchObject({
      source_result_public_id: input.resultPublicId,
      source_task_public_id: input.taskPublicId,
      revision_number: 0,
      revision_origin: "generated_result",
      predecessor_public_id: null,
      predecessor_digest: null,
      editor_public_id: null,
    });
    expect(
      containsText(updateConditions[0], "observation_schema_version"),
    ).toBe(true);
    expect(containsText(updateConditions[0], "provider_reported")).toBe(true);
    expect(containsText(updateConditions[0], "estimated")).toBe(true);
    expect(containsText(updateConditions[0], "client_observed")).toBe(true);
    expect(result?.ai_call_log_public_id).toBe(input.aiCallLogPublicId);
  });

  it("fails closed when log finalization returns more than one row", async () => {
    const input = createDraftResultInput();
    const transactionDatabase = {
      select: () => ({
        from: () => ({
          where: () => ({
            for: () => ({ limit: async () => [{ id: 701, aiCallLogId: 801 }] }),
          }),
        }),
      }),
      update: () => ({
        set: () => ({
          where: () => ({
            returning: async () => [
              createMeasuredAiCallLogRow(801),
              createMeasuredAiCallLogRow(802),
            ],
          }),
        }),
      }),
    };

    await expect(
      persistAdminAiGenerationDraftResultAndCompleteTask(
        {
          transaction: async (callback: (database: unknown) => unknown) =>
            callback(transactionDatabase),
        } as unknown as RuntimeDatabase,
        input,
      ),
    ).rejects.toThrow("ai_call_log finalization was lost");
  });

  it("rolls back before result insertion when the finalized log is not current measured provenance", async () => {
    const input = createDraftResultInput();
    const invalidObservations = [
      createMeasuredAiCallLogRow(801, {
        tokenSource: "unavailable",
        promptTokenCount: null,
        completionTokenCount: null,
        totalTokenCount: null,
        estimatedCostCny: null,
      }),
      createMeasuredAiCallLogRow(801, {
        observationSchemaVersion: null,
        tokenSource: null,
        tokenEstimationMethod: null,
        latencySource: null,
      }),
      createMeasuredAiCallLogRow(801, {
        tokenSource: null,
      }),
      createMeasuredAiCallLogRow(801, {
        totalTokenCount: 31,
      }),
    ];

    for (const invalidObservation of invalidObservations) {
      const insert = vi.fn();
      const transactionDatabase = {
        select: () => ({
          from: () => ({
            where: () => ({
              for: () => ({
                limit: async () => [{ id: 701, aiCallLogId: 801 }],
              }),
            }),
          }),
        }),
        update: () => ({
          set: () => ({
            where: () => ({ returning: async () => [invalidObservation] }),
          }),
        }),
        insert,
      };

      await expect(
        persistAdminAiGenerationDraftResultAndCompleteTask(
          {
            transaction: async (callback: (database: unknown) => unknown) =>
              callback(transactionDatabase),
          } as unknown as RuntimeDatabase,
          input,
        ),
      ).rejects.toThrow("AI call observation is invalid.");
      expect(insert).not.toHaveBeenCalled();
    }
  });

  it("rolls back the finalized log when result insertion conflicts", async () => {
    const input = createDraftResultInput();
    const transactionDatabase = {
      select: () => ({
        from: () => ({
          where: () => ({
            for: () => ({ limit: async () => [{ id: 701, aiCallLogId: 801 }] }),
          }),
        }),
      }),
      update: () => ({
        set: () => ({
          where: () => ({
            returning: async () => [createMeasuredAiCallLogRow(801)],
          }),
        }),
      }),
      insert: () => ({
        values: () => ({
          onConflictDoNothing: () => ({ returning: async () => [] }),
        }),
      }),
    };

    await expect(
      persistAdminAiGenerationDraftResultAndCompleteTask(
        {
          transaction: async (callback: (database: unknown) => unknown) =>
            callback(transactionDatabase),
        } as unknown as RuntimeDatabase,
        input,
      ),
    ).rejects.toThrow("result persistence conflicted");
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
      ai_call_log_public_id: input.aiCallLogPublicId,
      source_question_public_id: null,
      source_paper_public_id: null,
      is_formal_adoption_blocked: true,
      current_review_draft_public_id: null,
      current_review_draft_revision: null,
      current_review_draft_digest: null,
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
      current_review_draft_public_id: null,
      current_review_draft_revision: null,
      current_review_draft_digest: null,
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
        current_review_draft_public_id: null,
        current_review_draft_revision: null,
        current_review_draft_digest: null,
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

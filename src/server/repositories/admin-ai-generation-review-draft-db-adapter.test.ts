import { describe, expect, it, vi } from "vitest";

import type { SaveAdminAiGenerationReviewDraftInput } from "../contracts/admin-ai-generation-review-draft-contract";
import {
  createAdminAiGenerationReviewDraftDigest,
  createAdminAiGenerationReviewDraftPublicId,
} from "./admin-ai-generation-review-draft-repository";
import {
  createPostgresAdminAiGenerationReviewDraftRepository,
  saveAdminAiGenerationReviewDraft,
} from "./admin-ai-generation-review-draft-db-adapter";
import type { RuntimeDatabase } from "./runtime-database";

function createReviewedDraft() {
  return {
    questionType: "short_answer" as const,
    profession: "marketing" as const,
    level: 3,
    subject: "theory" as const,
    difficulty: "medium" as const,
    stemRichText: "<p>reviewed stem</p>",
    analysisRichText: "<p>reviewed analysis</p>",
    standardAnswerRichText: "<p>reviewed answer</p>",
    multiChoiceRule: "all_correct_only" as const,
    scoringMethod: "ai_scoring" as const,
    materialPublicId: null,
    questionOptions: [],
    scoringPoints: [{ description: "point", score: "2.0", sortOrder: 1 }],
    fillBlankAnswers: [],
    knowledgeNodePublicIds: [],
    tagPublicIds: [],
  };
}

function createInput(): SaveAdminAiGenerationReviewDraftInput {
  return {
    actorPublicId: "content_admin_public_1",
    actorRole: "content_admin",
    resultPublicId: "admin_ai_generation_result_public_1",
    command: {
      expectedRevision: null,
      expectedDraftDigest: null,
      targetType: "question",
      reviewedDraft: createReviewedDraft(),
    },
  };
}

describe("admin AI generation review draft DB adapter", () => {
  it("returns only the validated safe citation projection with the current revision", async () => {
    const reviewedDraft = createReviewedDraft();
    const sourceContentDigest =
      "sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
    const identity = {
      resultPublicId: "admin_ai_generation_result_public_1",
      sourceContentDigest,
      targetType: "question" as const,
      revision: 1,
      reviewedDraft,
    };
    const draftPublicId = createAdminAiGenerationReviewDraftPublicId(identity);
    const draftDigest = createAdminAiGenerationReviewDraftDigest(identity);
    const row = {
      id: 10,
      resultPublicId: identity.resultPublicId,
      taskPublicId: "admin_ai_generation_task_public_1",
      workspace: "content",
      generationKind: "question",
      ownerType: "platform",
      organizationPublicId: null,
      resultStatus: "draft",
      sourceContentDigest,
      citationRedactedSnapshot: {
        schemaVersion: 1,
        sourceCitationCount: 1,
        citations: [
          {
            resourceTitle: "营销教材",
            headingPath: ["第三章", "客户分析"],
          },
        ],
      },
      citationCount: 1,
      currentDraftPublicId: draftPublicId,
      currentRevision: 1,
      currentDraftDigest: draftDigest,
      draft: {
        publicId: draftPublicId,
        resultId: 10,
        sourceResultPublicId: identity.resultPublicId,
        sourceTaskPublicId: "admin_ai_generation_task_public_1",
        targetType: "question",
        revision: 1,
        revisionOrigin: "initial_result",
        predecessorPublicId: null,
        predecessorDigest: null,
        sourceContentDigest,
        reviewedDraft,
        draftDigest,
        editorPublicId: null,
        createdAt: new Date("2026-07-22T20:00:00.000Z"),
      },
    };
    const database = {
      select: () => ({
        from: () => ({
          leftJoin: () => ({
            where: () => ({ limit: async () => [row] }),
          }),
        }),
      }),
    } as unknown as RuntimeDatabase;
    const repository = createPostgresAdminAiGenerationReviewDraftRepository({
      createDatabase: () => database,
    });

    await expect(
      repository.findCurrentReviewDraft({
        actorPublicId: "content_admin_public_1",
        resultPublicId: identity.resultPublicId,
      }),
    ).resolves.toMatchObject({
      citationStatus: "available",
      citationSources: [
        {
          resourceTitle: "营销教材",
          headingPath: ["第三章", "客户分析"],
        },
      ],
    });
  });

  it("locks the result, appends the first legacy revision, advances the pointer and writes redacted audit in one transaction", async () => {
    const insertedValues: Array<Record<string, unknown>> = [];
    let insertCount = 0;
    const resultRow = {
      id: 10,
      resultPublicId: "admin_ai_generation_result_public_1",
      taskPublicId: "admin_ai_generation_task_public_1",
      workspace: "content",
      generationKind: "question",
      ownerType: "platform",
      organizationPublicId: null,
      resultStatus: "draft",
      sourceContentDigest:
        "sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      citationRedactedSnapshot: null,
      citationCount: 0,
      currentDraftPublicId: null,
      currentRevision: null,
      currentDraftDigest: null,
    };
    const transactionDatabase = {
      select: () => ({
        from: () => ({
          where: () => ({
            for: () => ({ limit: async () => [resultRow] }),
          }),
        }),
      }),
      insert: () => {
        insertCount += 1;
        return {
          values: (values: Record<string, unknown>) => {
            insertedValues.push(values);
            if (insertCount === 1) {
              return {
                returning: async () => [
                  {
                    publicId: values.public_id,
                    resultId: values.admin_ai_generation_result_id,
                    sourceResultPublicId: values.source_result_public_id,
                    sourceTaskPublicId: values.source_task_public_id,
                    targetType: values.target_type,
                    revision: values.revision_number,
                    revisionOrigin: values.revision_origin,
                    predecessorPublicId: values.predecessor_public_id,
                    predecessorDigest: values.predecessor_digest,
                    sourceContentDigest: values.source_content_digest,
                    reviewedDraft: values.draft_snapshot,
                    draftDigest: values.draft_digest,
                    editorPublicId: values.editor_public_id,
                    createdAt: values.created_at,
                  },
                ],
              };
            }
            return Promise.resolve();
          },
        };
      },
      update: () => ({
        set: () => ({
          where: () => ({ returning: async () => [{ id: 10 }] }),
        }),
      }),
    };
    const transaction = vi.fn(async (callback) =>
      callback(transactionDatabase),
    );

    const result = await saveAdminAiGenerationReviewDraft(
      { transaction } as unknown as RuntimeDatabase,
      createInput(),
    );

    expect(result).toMatchObject({
      status: "versioned",
      currentRevision: 0,
      reviewedDraft: createReviewedDraft(),
    });
    expect(insertedValues[0]).toMatchObject({
      revision_number: 0,
      revision_origin: "review_edit",
      predecessor_public_id: null,
      predecessor_digest: null,
      editor_public_id: "content_admin_public_1",
    });
    expect(insertedValues[1]).toMatchObject({
      action_type: "admin_ai_generation_review_draft.append",
      target_public_id: "admin_ai_generation_result_public_1",
    });
    expect(JSON.stringify(insertedValues[1])).not.toContain("reviewed stem");
    expect(transaction).toHaveBeenCalledTimes(1);
  });

  it("rejects a stale predecessor before append or audit", async () => {
    const insert = vi.fn();
    const resultRow = {
      id: 10,
      resultPublicId: "admin_ai_generation_result_public_1",
      taskPublicId: "admin_ai_generation_task_public_1",
      workspace: "content",
      generationKind: "question",
      ownerType: "platform",
      organizationPublicId: null,
      resultStatus: "draft",
      sourceContentDigest:
        "sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      citationRedactedSnapshot: null,
      citationCount: 0,
      currentDraftPublicId: "admin_ai_review_draft_current",
      currentRevision: 2,
      currentDraftDigest:
        "sha256:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
    };
    const transactionDatabase = {
      select: () => ({
        from: () => ({
          where: () => ({
            for: () => ({ limit: async () => [resultRow] }),
          }),
        }),
      }),
      insert,
    };
    const input = createInput();
    input.command.expectedRevision = 0;
    input.command.expectedDraftDigest =
      "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

    await expect(
      saveAdminAiGenerationReviewDraft(
        {
          transaction: async (callback: (database: unknown) => unknown) =>
            callback(transactionDatabase),
        } as unknown as RuntimeDatabase,
        input,
      ),
    ).rejects.toThrow("revision conflict");
    expect(insert).not.toHaveBeenCalled();
  });

  it("returns the exact committed revision for an identical response-loss replay without writing", async () => {
    const input = createInput();
    const sourceContentDigest =
      "sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
    const identity = {
      resultPublicId: input.resultPublicId,
      sourceContentDigest,
      targetType: "question" as const,
      revision: 0,
      reviewedDraft: input.command.reviewedDraft,
    };
    const draftPublicId = createAdminAiGenerationReviewDraftPublicId(identity);
    const draftDigest = createAdminAiGenerationReviewDraftDigest(identity);
    const resultRow = {
      id: 10,
      resultPublicId: input.resultPublicId,
      taskPublicId: "admin_ai_generation_task_public_1",
      workspace: "content",
      generationKind: "question",
      ownerType: "platform",
      organizationPublicId: null,
      resultStatus: "draft",
      sourceContentDigest,
      citationRedactedSnapshot: null,
      citationCount: 0,
      currentDraftPublicId: draftPublicId,
      currentRevision: 0,
      currentDraftDigest: draftDigest,
    };
    const draftRow = {
      publicId: draftPublicId,
      resultId: 10,
      sourceResultPublicId: input.resultPublicId,
      sourceTaskPublicId: "admin_ai_generation_task_public_1",
      targetType: "question",
      revision: 0,
      revisionOrigin: "review_edit",
      predecessorPublicId: null,
      predecessorDigest: null,
      sourceContentDigest,
      reviewedDraft: input.command.reviewedDraft,
      draftDigest,
      editorPublicId: input.actorPublicId,
      createdAt: new Date("2026-07-22T20:00:00.000Z"),
    };
    let selectCount = 0;
    const insert = vi.fn();
    const update = vi.fn();
    const transactionDatabase = {
      select: () => {
        selectCount += 1;
        return {
          from: () => ({
            where: () =>
              selectCount === 1
                ? { for: () => ({ limit: async () => [resultRow] }) }
                : { limit: async () => [draftRow] },
          }),
        };
      },
      insert,
      update,
    };

    await expect(
      saveAdminAiGenerationReviewDraft(
        {
          transaction: async (callback: (database: unknown) => unknown) =>
            callback(transactionDatabase),
        } as unknown as RuntimeDatabase,
        input,
      ),
    ).resolves.toMatchObject({
      status: "versioned",
      currentRevision: 0,
      currentDraftPublicId: draftPublicId,
      currentDraftDigest: draftDigest,
    });
    expect(insert).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  it("fails the transaction before audit when the current-pointer CAS loses", async () => {
    const insertedValues: Array<Record<string, unknown>> = [];
    const resultRow = {
      id: 10,
      resultPublicId: "admin_ai_generation_result_public_1",
      taskPublicId: "admin_ai_generation_task_public_1",
      workspace: "content",
      generationKind: "question",
      ownerType: "platform",
      organizationPublicId: null,
      resultStatus: "draft",
      sourceContentDigest:
        "sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      citationRedactedSnapshot: null,
      citationCount: 0,
      currentDraftPublicId: null,
      currentRevision: null,
      currentDraftDigest: null,
    };
    const transactionDatabase = {
      select: () => ({
        from: () => ({
          where: () => ({
            for: () => ({ limit: async () => [resultRow] }),
          }),
        }),
      }),
      insert: () => ({
        values: (values: Record<string, unknown>) => {
          insertedValues.push(values);
          return {
            returning: async () => [
              {
                publicId: values.public_id,
                resultId: values.admin_ai_generation_result_id,
                sourceResultPublicId: values.source_result_public_id,
                sourceTaskPublicId: values.source_task_public_id,
                targetType: values.target_type,
                revision: values.revision_number,
                revisionOrigin: values.revision_origin,
                predecessorPublicId: values.predecessor_public_id,
                predecessorDigest: values.predecessor_digest,
                sourceContentDigest: values.source_content_digest,
                reviewedDraft: values.draft_snapshot,
                draftDigest: values.draft_digest,
                editorPublicId: values.editor_public_id,
                createdAt: values.created_at,
              },
            ],
          };
        },
      }),
      update: () => ({
        set: () => ({ where: () => ({ returning: async () => [] }) }),
      }),
    };

    await expect(
      saveAdminAiGenerationReviewDraft(
        {
          transaction: async (callback: (database: unknown) => unknown) =>
            callback(transactionDatabase),
        } as unknown as RuntimeDatabase,
        createInput(),
      ),
    ).rejects.toThrow("pointer conflict");
    expect(insertedValues).toHaveLength(1);
  });
});

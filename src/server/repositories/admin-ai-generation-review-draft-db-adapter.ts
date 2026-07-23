import {
  adminAiGenerationResult,
  adminAiGenerationReviewDraft,
  auditLog,
} from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";

import type {
  AdminAiGenerationReviewDraftDto,
  AdminAiGenerationReviewDraftRepository,
  FindAdminAiGenerationReviewDraftInput,
  SaveAdminAiGenerationReviewDraftInput,
} from "../contracts/admin-ai-generation-review-draft-contract";
import {
  createLazyRuntimeDatabaseGetter,
  type RuntimeDatabase,
  type RuntimeDatabaseOptions,
} from "./runtime-database";
import {
  createAdminAiGenerationReviewDraftDigest,
  createAdminAiGenerationReviewDraftPublicId,
  resolveNextAdminAiGenerationReviewDraftRevision,
} from "./admin-ai-generation-review-draft-repository";
import { normalizeAdminAiGenerationReviewedDraft } from "../validators/admin-ai-generation-review-draft";
import { resolveAdminAiGenerationCitationProjection } from "../models/admin-ai-generation-citation";

const resultSelection = {
  id: adminAiGenerationResult.id,
  resultPublicId: adminAiGenerationResult.public_id,
  taskPublicId: adminAiGenerationResult.task_public_id,
  workspace: adminAiGenerationResult.workspace,
  generationKind: adminAiGenerationResult.generation_kind,
  ownerType: adminAiGenerationResult.owner_type,
  organizationPublicId: adminAiGenerationResult.organization_public_id,
  resultStatus: adminAiGenerationResult.result_status,
  sourceContentDigest: adminAiGenerationResult.content_digest,
  citationRedactedSnapshot: adminAiGenerationResult.citation_redacted_snapshot,
  citationCount: adminAiGenerationResult.citation_count,
  currentDraftPublicId: adminAiGenerationResult.current_review_draft_public_id,
  currentRevision: adminAiGenerationResult.current_review_draft_revision,
  currentDraftDigest: adminAiGenerationResult.current_review_draft_digest,
};

const draftSelection = {
  publicId: adminAiGenerationReviewDraft.public_id,
  resultId: adminAiGenerationReviewDraft.admin_ai_generation_result_id,
  sourceResultPublicId: adminAiGenerationReviewDraft.source_result_public_id,
  sourceTaskPublicId: adminAiGenerationReviewDraft.source_task_public_id,
  targetType: adminAiGenerationReviewDraft.target_type,
  revision: adminAiGenerationReviewDraft.revision_number,
  revisionOrigin: adminAiGenerationReviewDraft.revision_origin,
  predecessorPublicId: adminAiGenerationReviewDraft.predecessor_public_id,
  predecessorDigest: adminAiGenerationReviewDraft.predecessor_digest,
  sourceContentDigest: adminAiGenerationReviewDraft.source_content_digest,
  reviewedDraft: adminAiGenerationReviewDraft.draft_snapshot,
  draftDigest: adminAiGenerationReviewDraft.draft_digest,
  editorPublicId: adminAiGenerationReviewDraft.editor_public_id,
  createdAt: adminAiGenerationReviewDraft.created_at,
};

type ResultRow = {
  id: number;
  resultPublicId: string;
  taskPublicId: string;
  workspace: string;
  generationKind: string;
  ownerType: string;
  organizationPublicId: string | null;
  resultStatus: string;
  sourceContentDigest: string;
  citationRedactedSnapshot: unknown;
  citationCount: number;
  currentDraftPublicId: string | null;
  currentRevision: number | null;
  currentDraftDigest: string | null;
};

type DraftRow = {
  publicId: string;
  resultId: number;
  sourceResultPublicId: string;
  sourceTaskPublicId: string;
  targetType: string;
  revision: number;
  revisionOrigin: string;
  predecessorPublicId: string | null;
  predecessorDigest: string | null;
  sourceContentDigest: string;
  reviewedDraft: unknown;
  draftDigest: string;
  editorPublicId: string | null;
  createdAt: Date;
};

function assertEligibleResult(row: ResultRow): "question" | "paper" {
  if (
    row.workspace !== "content" ||
    row.ownerType !== "platform" ||
    row.organizationPublicId !== null ||
    row.resultStatus !== "draft" ||
    (row.generationKind !== "question" && row.generationKind !== "paper")
  ) {
    throw new Error("admin AI generation result is not reviewable");
  }
  return row.generationKind;
}

function mapVersionedDraft(row: ResultRow, draft: DraftRow) {
  const targetType = assertEligibleResult(row);
  const reviewedDraft = normalizeAdminAiGenerationReviewedDraft(
    targetType,
    draft.reviewedDraft,
    { allowUnresolvedKnowledgeCandidate: true },
  );
  if (
    reviewedDraft === null ||
    row.currentDraftPublicId !== draft.publicId ||
    row.currentRevision !== draft.revision ||
    row.currentDraftDigest !== draft.draftDigest ||
    draft.resultId !== row.id ||
    draft.sourceResultPublicId !== row.resultPublicId ||
    draft.sourceTaskPublicId !== row.taskPublicId ||
    draft.sourceContentDigest !== row.sourceContentDigest ||
    draft.targetType !== targetType ||
    createAdminAiGenerationReviewDraftDigest({
      resultPublicId: row.resultPublicId,
      sourceContentDigest: row.sourceContentDigest,
      targetType,
      revision: draft.revision,
      reviewedDraft,
    }) !== draft.draftDigest
  ) {
    throw new Error("admin AI generation review draft identity conflict");
  }

  const citationProjection = resolveAdminAiGenerationCitationProjection(
    row.citationRedactedSnapshot,
    row.citationCount,
  );
  return {
    status: "versioned" as const,
    resultPublicId: row.resultPublicId,
    sourceContentDigest: row.sourceContentDigest,
    targetType,
    currentRevision: draft.revision,
    currentDraftPublicId: draft.publicId,
    currentDraftDigest: draft.draftDigest,
    reviewedDraft,
    citationStatus: citationProjection.status,
    citationSources: citationProjection.sources,
    redactionStatus: "redacted" as const,
  };
}

async function findCurrentDraft(
  database: RuntimeDatabase,
  input: FindAdminAiGenerationReviewDraftInput,
): Promise<AdminAiGenerationReviewDraftDto | null> {
  const rows = await database
    .select({ ...resultSelection, draft: draftSelection })
    .from(adminAiGenerationResult)
    .leftJoin(
      adminAiGenerationReviewDraft,
      and(
        eq(
          adminAiGenerationReviewDraft.public_id,
          adminAiGenerationResult.current_review_draft_public_id,
        ),
        eq(
          adminAiGenerationReviewDraft.admin_ai_generation_result_id,
          adminAiGenerationResult.id,
        ),
      ),
    )
    .where(eq(adminAiGenerationResult.public_id, input.resultPublicId))
    .limit(2);

  if (rows.length === 0) {
    return null;
  }
  if (rows.length !== 1) {
    throw new Error("admin AI generation result identity is ambiguous");
  }
  const row = rows[0] as unknown as ResultRow & { draft: DraftRow | null };
  const targetType = assertEligibleResult(row);

  if (
    row.currentDraftPublicId === null &&
    row.currentRevision === null &&
    row.currentDraftDigest === null &&
    row.draft === null
  ) {
    const citationProjection = resolveAdminAiGenerationCitationProjection(
      row.citationRedactedSnapshot,
      row.citationCount,
    );
    return {
      status: "legacy_unversioned",
      resultPublicId: row.resultPublicId,
      sourceContentDigest: row.sourceContentDigest,
      targetType,
      currentRevision: null,
      citationStatus: citationProjection.status,
      citationSources: citationProjection.sources,
      redactionStatus: "redacted",
    };
  }
  if (row.draft === null) {
    throw new Error("admin AI generation current review draft is missing");
  }
  return mapVersionedDraft(row, row.draft);
}

async function findDraftByPublicId(
  transaction: RuntimeDatabase,
  publicId: string,
): Promise<DraftRow | null> {
  const rows = await transaction
    .select(draftSelection)
    .from(adminAiGenerationReviewDraft)
    .where(eq(adminAiGenerationReviewDraft.public_id, publicId))
    .limit(2);
  if (rows.length > 1) {
    throw new Error("admin AI generation review draft identity is ambiguous");
  }
  return (rows[0] as unknown as DraftRow | undefined) ?? null;
}

export async function saveAdminAiGenerationReviewDraft(
  database: RuntimeDatabase,
  input: SaveAdminAiGenerationReviewDraftInput,
): Promise<AdminAiGenerationReviewDraftDto | null> {
  return database.transaction(async (transaction) => {
    const resultRows = await transaction
      .select(resultSelection)
      .from(adminAiGenerationResult)
      .where(eq(adminAiGenerationResult.public_id, input.resultPublicId))
      .for("update")
      .limit(2);
    if (resultRows.length === 0) {
      return null;
    }
    if (resultRows.length !== 1) {
      throw new Error("admin AI generation result identity is ambiguous");
    }
    const result = resultRows[0] as unknown as ResultRow;
    const targetType = assertEligibleResult(result);
    if (targetType !== input.command.targetType) {
      throw new Error("admin AI generation review draft target conflict");
    }
    const normalizedReviewedDraft = normalizeAdminAiGenerationReviewedDraft(
      targetType,
      input.command.reviewedDraft,
    );
    if (normalizedReviewedDraft === null) {
      throw new Error("admin AI generation review draft is invalid");
    }

    const currentPointerIsLegacy =
      result.currentDraftPublicId === null &&
      result.currentRevision === null &&
      result.currentDraftDigest === null;
    const expectedMatchesCurrent = currentPointerIsLegacy
      ? input.command.expectedRevision === null &&
        input.command.expectedDraftDigest === null
      : input.command.expectedRevision === result.currentRevision &&
        input.command.expectedDraftDigest === result.currentDraftDigest;
    const nextRevision = resolveNextAdminAiGenerationReviewDraftRevision(
      input.command.expectedRevision,
    );
    const identity = {
      resultPublicId: result.resultPublicId,
      sourceContentDigest: result.sourceContentDigest,
      targetType,
      revision: nextRevision,
      reviewedDraft: normalizedReviewedDraft,
    } as const;
    const draftPublicId = createAdminAiGenerationReviewDraftPublicId(identity);
    const draftDigest = createAdminAiGenerationReviewDraftDigest(identity);

    if (!expectedMatchesCurrent) {
      if (
        result.currentDraftPublicId !== null &&
        result.currentRevision === nextRevision &&
        result.currentDraftDigest === draftDigest
      ) {
        const replayDraft = await findDraftByPublicId(
          transaction,
          result.currentDraftPublicId,
        );
        if (replayDraft !== null) {
          if (
            input.command.expectedRevision === null &&
            replayDraft.predecessorPublicId === null &&
            replayDraft.predecessorDigest === null
          ) {
            return mapVersionedDraft(result, replayDraft);
          }
          if (
            input.command.expectedRevision !== null &&
            replayDraft.predecessorPublicId !== null &&
            replayDraft.predecessorDigest === input.command.expectedDraftDigest
          ) {
            const predecessor = await findDraftByPublicId(
              transaction,
              replayDraft.predecessorPublicId,
            );
            if (
              predecessor !== null &&
              predecessor.resultId === result.id &&
              predecessor.revision === input.command.expectedRevision &&
              predecessor.draftDigest === input.command.expectedDraftDigest
            ) {
              return mapVersionedDraft(result, replayDraft);
            }
          }
        }
      }
      throw new Error("admin AI generation review draft revision conflict");
    }

    const createdAt = new Date();
    const insertedDrafts = await transaction
      .insert(adminAiGenerationReviewDraft)
      .values({
        public_id: draftPublicId,
        admin_ai_generation_result_id: result.id,
        source_result_public_id: result.resultPublicId,
        source_task_public_id: result.taskPublicId,
        target_type: targetType,
        revision_number: nextRevision,
        revision_origin: "review_edit",
        predecessor_public_id: result.currentDraftPublicId,
        predecessor_digest: result.currentDraftDigest,
        source_content_digest: result.sourceContentDigest,
        draft_snapshot: normalizedReviewedDraft,
        draft_digest: draftDigest,
        editor_public_id: input.actorPublicId,
        created_at: createdAt,
      })
      .returning(draftSelection);
    if (insertedDrafts.length !== 1) {
      throw new Error("admin AI generation review draft append failed");
    }

    let pointerCondition;
    if (currentPointerIsLegacy) {
      pointerCondition = and(
        sql`${adminAiGenerationResult.current_review_draft_public_id} is null`,
        sql`${adminAiGenerationResult.current_review_draft_revision} is null`,
        sql`${adminAiGenerationResult.current_review_draft_digest} is null`,
      );
    } else {
      const currentDraftPublicId = result.currentDraftPublicId;
      const currentRevision = result.currentRevision;
      const currentDraftDigest = result.currentDraftDigest;
      if (
        currentDraftPublicId === null ||
        currentRevision === null ||
        currentDraftDigest === null
      ) {
        throw new Error("admin AI generation review draft pointer conflict");
      }
      pointerCondition = and(
        eq(
          adminAiGenerationResult.current_review_draft_public_id,
          currentDraftPublicId,
        ),
        eq(
          adminAiGenerationResult.current_review_draft_revision,
          currentRevision,
        ),
        eq(
          adminAiGenerationResult.current_review_draft_digest,
          currentDraftDigest,
        ),
      );
    }
    const updatedResults = await transaction
      .update(adminAiGenerationResult)
      .set({
        current_review_draft_public_id: draftPublicId,
        current_review_draft_revision: nextRevision,
        current_review_draft_digest: draftDigest,
        updated_at: createdAt,
      })
      .where(
        and(
          eq(adminAiGenerationResult.id, result.id),
          eq(
            adminAiGenerationResult.content_digest,
            result.sourceContentDigest,
          ),
          pointerCondition,
        ),
      )
      .returning({ id: adminAiGenerationResult.id });
    if (updatedResults.length !== 1) {
      throw new Error("admin AI generation review draft pointer conflict");
    }

    await transaction.insert(auditLog).values({
      public_id: `audit_${draftPublicId}`,
      actor_public_id: input.actorPublicId,
      actor_role: input.actorRole,
      action_type: "admin_ai_generation_review_draft.append",
      target_resource_type: "admin_ai_generation_result",
      target_public_id: result.resultPublicId,
      result_status: "success",
      metadata_summary: JSON.stringify({
        draftDigest,
        revision: nextRevision,
        targetType,
      }),
      request_ip: null,
      created_at: createdAt,
    });

    const insertedDraft = insertedDrafts[0] as unknown as DraftRow;
    return mapVersionedDraft(
      {
        ...result,
        currentDraftPublicId: draftPublicId,
        currentRevision: nextRevision,
        currentDraftDigest: draftDigest,
      },
      insertedDraft,
    );
  });
}

export function createPostgresAdminAiGenerationReviewDraftRepository(
  options: RuntimeDatabaseOptions = {},
): AdminAiGenerationReviewDraftRepository {
  const getDatabase = createLazyRuntimeDatabaseGetter(
    options,
    "DATABASE_URL is required for admin AI generation review drafts.",
  );

  return {
    findCurrentReviewDraft(input) {
      return findCurrentDraft(getDatabase(), input);
    },
    saveReviewDraft(input) {
      return saveAdminAiGenerationReviewDraft(getDatabase(), input);
    },
  };
}

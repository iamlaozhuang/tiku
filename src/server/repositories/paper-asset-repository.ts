import { createHash, randomUUID } from "node:crypto";

import { and, asc, count, desc, eq, inArray, sql, type SQL } from "drizzle-orm";

import {
  admin,
  auditLog,
  paper,
  paperAsset,
  paperAssetCleanupJob,
  paperAssetUploadOperation,
} from "@/db/schema";
import type { PaperAttachmentUsage, Profession } from "../models/paper";
import type { NormalizedPaperAssetListInput } from "../validators/paper-asset";
import {
  createLazyRuntimeDatabaseGetter,
  type RuntimeDatabase,
  type RuntimeDatabaseOptions,
} from "./runtime-database";

export type PaperAssetAccessRow = {
  id: number;
  public_id: string;
  paper_public_id: string;
  profession: Profession;
  paper_attachment_usage: PaperAttachmentUsage;
  file_name: string;
  object_key: string;
  content_type: string;
  file_size_byte: number;
  file_hash: string;
  created_at: Date;
};

export type PaperAssetListResult = {
  rows: PaperAssetAccessRow[];
  total: number;
};

export type PaperAssetDeleteMutationContext = {
  actorPublicId: string;
  auditLog: {
    actorRole: string;
    actionType: "paper_asset.delete";
    metadataSummary: string;
    requestIp: string | null;
  };
};

export type PaperAssetCreateMutationContext = {
  actorPublicId: string;
  auditLog: {
    actorRole: string;
    actionType: "paper_asset.create";
    metadataSummary: string;
    requestIp: string | null;
  };
};

export type PreparePaperAssetUploadInput = {
  operationPublicId: string;
  paperAssetPublicId: string;
  actorPublicId: string;
  idempotencyKeyHash: string;
  requestFingerprint: string;
  paperPublicId: string;
  paperAttachmentUsage: PaperAttachmentUsage;
  profession: Profession;
  fileName: string;
  objectKey: string;
  contentType: string;
  fileSizeByte: number;
  fileHash: string;
};

export type PreparePaperAssetUploadResult =
  | {
      status: "prepared";
      operation: {
        publicId: string;
        paperAssetPublicId: string;
        objectKey: string;
      };
    }
  | { status: "completed"; paperAsset: PaperAssetAccessRow }
  | { status: "not_found" }
  | { status: "invalid_scope" }
  | { status: "conflict"; reason: "request_mismatch" | "invalid_state" };

export type CompletePaperAssetUploadInput = {
  operationPublicId: string;
  requestFingerprint: string;
  mutationContext: PaperAssetCreateMutationContext;
};

export type CompletePaperAssetUploadResult =
  | {
      status: "completed";
      paperAsset: PaperAssetAccessRow;
      replayed: boolean;
    }
  | { status: "conflict" };

export type PaperAssetCleanupIdentity = {
  profession: Profession;
  objectKey: string;
  fileName: string;
  fileSizeByte: number;
  fileHash: string;
};

export type PaperAssetDeleteResult =
  | { status: "completed" | "cancelled" }
  | { status: "retryable" }
  | { status: "not_found" };

export type DeletePaperAssetLocalFile = (
  identity: PaperAssetCleanupIdentity,
) => Promise<"deleted" | "missing">;

export type PaperAssetRepository = {
  preparePaperAssetUpload?(
    input: PreparePaperAssetUploadInput,
  ): Promise<PreparePaperAssetUploadResult>;
  markPaperAssetUploadFileStored?(operationPublicId: string): Promise<boolean>;
  completePaperAssetUpload?(
    input: CompletePaperAssetUploadInput,
  ): Promise<CompletePaperAssetUploadResult>;
  recordPaperAssetUploadFailure?(input: {
    operationPublicId: string;
    failureMessageDigest: string;
  }): Promise<void>;
  listPaperAssets(
    query: NormalizedPaperAssetListInput,
  ): Promise<PaperAssetListResult>;
  findPaperAssetByPublicId(
    publicId: string,
  ): Promise<PaperAssetAccessRow | null>;
  deletePaperAsset(
    publicId: string,
    context: PaperAssetDeleteMutationContext,
    deleteLocalFile: DeletePaperAssetLocalFile,
  ): Promise<PaperAssetDeleteResult>;
};

const PAPER_ASSET_OBJECT_LOCK_NAMESPACE = 200113;
const PAPER_ASSET_CLEANUP_FAILURE_DIGEST = `sha256:${createHash("sha256")
  .update("paper_asset_cleanup_failed")
  .digest("hex")}`;

export function createPostgresPaperAssetRepository(
  options: RuntimeDatabaseOptions = {},
): PaperAssetRepository {
  const getDatabase = createLazyRuntimeDatabaseGetter(
    options,
    "DATABASE_URL is required for paper_asset runtime.",
  );

  return {
    async preparePaperAssetUpload(input) {
      return preparePaperAssetUpload(getDatabase(), input);
    },

    async markPaperAssetUploadFileStored(operationPublicId) {
      return markPaperAssetUploadFileStored(getDatabase(), operationPublicId);
    },

    async completePaperAssetUpload(input) {
      return completePaperAssetUpload(getDatabase(), input);
    },

    async recordPaperAssetUploadFailure(input) {
      return recordPaperAssetUploadFailure(getDatabase(), input);
    },

    async listPaperAssets(queryInput) {
      const database = getDatabase();
      const conditions = createPaperAssetConditions(queryInput);
      const rows = await database
        .select({
          id: paperAsset.id,
          public_id: paperAsset.public_id,
          paper_public_id: paper.public_id,
          profession: paper.profession,
          paper_attachment_usage: paperAsset.paper_attachment_usage,
          file_name: paperAsset.file_name,
          object_key: paperAsset.object_key,
          content_type: paperAsset.content_type,
          file_size_byte: paperAsset.file_size_byte,
          file_hash: paperAsset.file_hash,
          created_at: paperAsset.created_at,
        })
        .from(paperAsset)
        .innerJoin(paper, eq(paper.id, paperAsset.paper_id))
        .where(and(...conditions))
        .orderBy(createPaperAssetOrderBy(queryInput))
        .limit(queryInput.pageSize)
        .offset((queryInput.page - 1) * queryInput.pageSize);
      const [totalRow] = await database
        .select({ value: count() })
        .from(paperAsset)
        .innerJoin(paper, eq(paper.id, paperAsset.paper_id))
        .where(and(...conditions));

      return {
        rows,
        total: totalRow?.value ?? 0,
      };
    },

    async findPaperAssetByPublicId(publicId) {
      return findPaperAssetByPublicId(getDatabase(), publicId);
    },

    async deletePaperAsset(publicId, context, deleteLocalFile) {
      return deletePaperAssetWithCleanup(
        getDatabase(),
        publicId,
        context,
        deleteLocalFile,
      );
    },
  };
}

async function lockPaperAssetObjectIdentity(
  database: RuntimeDatabase,
  objectKey: string,
): Promise<void> {
  await database.execute(
    sql`select pg_advisory_xact_lock(${PAPER_ASSET_OBJECT_LOCK_NAMESPACE}, hashtext(${objectKey})) as paper_asset_object_lock`,
  );
}

async function preparePaperAssetUpload(
  database: RuntimeDatabase,
  input: PreparePaperAssetUploadInput,
): Promise<PreparePaperAssetUploadResult> {
  return database.transaction(async (transaction) => {
    const scopedDatabase = transaction as RuntimeDatabase;
    const [unlockedOperation] = await scopedDatabase
      .select({ object_key: paperAssetUploadOperation.object_key })
      .from(paperAssetUploadOperation)
      .where(
        eq(
          paperAssetUploadOperation.idempotency_key_hash,
          input.idempotencyKeyHash,
        ),
      )
      .limit(1);
    const lockedObjectKey = unlockedOperation?.object_key ?? input.objectKey;

    await lockPaperAssetObjectIdentity(scopedDatabase, lockedObjectKey);
    const actorAdminId = await resolveActorAdminIdByPublicId(
      scopedDatabase,
      input.actorPublicId,
    );
    const paperRow = await resolvePaperForUpload(
      scopedDatabase,
      input.paperPublicId,
    );

    if (paperRow === null) {
      return { status: "not_found" };
    }

    if (paperRow.profession !== input.profession) {
      return { status: "invalid_scope" };
    }

    const [insertedOperation] = await scopedDatabase
      .insert(paperAssetUploadOperation)
      .values({
        public_id: input.operationPublicId,
        actor_admin_id: actorAdminId,
        paper_id: paperRow.id,
        paper_asset_public_id: input.paperAssetPublicId,
        idempotency_key_hash: input.idempotencyKeyHash,
        request_fingerprint: input.requestFingerprint,
        paper_attachment_usage: input.paperAttachmentUsage,
        file_name: input.fileName,
        object_key: input.objectKey,
        content_type: input.contentType,
        file_size_byte: input.fileSizeByte,
        file_hash: input.fileHash,
        operation_status: "pending",
      })
      .onConflictDoNothing({
        target: paperAssetUploadOperation.idempotency_key_hash,
      })
      .returning({
        public_id: paperAssetUploadOperation.public_id,
        actor_admin_id: paperAssetUploadOperation.actor_admin_id,
        paper_id: paperAssetUploadOperation.paper_id,
        paper_asset_id: paperAssetUploadOperation.paper_asset_id,
        paper_asset_public_id: paperAssetUploadOperation.paper_asset_public_id,
        request_fingerprint: paperAssetUploadOperation.request_fingerprint,
        object_key: paperAssetUploadOperation.object_key,
        operation_status: paperAssetUploadOperation.operation_status,
      });
    const operationRow =
      insertedOperation ??
      (
        await scopedDatabase
          .select({
            public_id: paperAssetUploadOperation.public_id,
            actor_admin_id: paperAssetUploadOperation.actor_admin_id,
            paper_id: paperAssetUploadOperation.paper_id,
            paper_asset_id: paperAssetUploadOperation.paper_asset_id,
            paper_asset_public_id:
              paperAssetUploadOperation.paper_asset_public_id,
            request_fingerprint: paperAssetUploadOperation.request_fingerprint,
            object_key: paperAssetUploadOperation.object_key,
            operation_status: paperAssetUploadOperation.operation_status,
          })
          .from(paperAssetUploadOperation)
          .where(
            eq(
              paperAssetUploadOperation.idempotency_key_hash,
              input.idempotencyKeyHash,
            ),
          )
          .limit(1)
          .for("update")
      )[0];

    if (
      operationRow === undefined ||
      operationRow.actor_admin_id !== actorAdminId ||
      operationRow.paper_id !== paperRow.id ||
      operationRow.object_key !== lockedObjectKey ||
      operationRow.request_fingerprint !== input.requestFingerprint
    ) {
      return { status: "conflict", reason: "request_mismatch" };
    }

    if (operationRow.operation_status === "completed") {
      if (operationRow.paper_asset_id === null) {
        return { status: "conflict", reason: "invalid_state" };
      }

      const completedPaperAsset = await findPaperAssetById(
        scopedDatabase,
        operationRow.paper_asset_id,
      );

      return completedPaperAsset === null
        ? { status: "conflict", reason: "invalid_state" }
        : { status: "completed", paperAsset: completedPaperAsset };
    }

    if (operationRow.operation_status === "failed") {
      await scopedDatabase
        .update(paperAssetUploadOperation)
        .set({
          operation_status: "pending",
          file_stored_at: null,
          last_failure_message_digest: null,
          updated_at: new Date(),
        })
        .where(eq(paperAssetUploadOperation.public_id, operationRow.public_id));
    }

    return {
      status: "prepared",
      operation: {
        publicId: operationRow.public_id,
        paperAssetPublicId: operationRow.paper_asset_public_id,
        objectKey: operationRow.object_key,
      },
    };
  });
}

async function markPaperAssetUploadFileStored(
  database: RuntimeDatabase,
  operationPublicId: string,
): Promise<boolean> {
  const [operationRow] = await database
    .update(paperAssetUploadOperation)
    .set({
      operation_status: "file_stored",
      file_stored_at: new Date(),
      last_failure_message_digest: null,
      updated_at: new Date(),
    })
    .where(
      and(
        eq(paperAssetUploadOperation.public_id, operationPublicId),
        inArray(paperAssetUploadOperation.operation_status, [
          "pending",
          "file_stored",
        ]),
      ),
    )
    .returning({ public_id: paperAssetUploadOperation.public_id });

  if (operationRow !== undefined) {
    return true;
  }

  const [completedOperation] = await database
    .select({ operation_status: paperAssetUploadOperation.operation_status })
    .from(paperAssetUploadOperation)
    .where(eq(paperAssetUploadOperation.public_id, operationPublicId))
    .limit(1);

  return completedOperation?.operation_status === "completed";
}

async function recordPaperAssetUploadFailure(
  database: RuntimeDatabase,
  input: { operationPublicId: string; failureMessageDigest: string },
): Promise<void> {
  await database
    .update(paperAssetUploadOperation)
    .set({
      operation_status: "failed",
      last_failure_message_digest: input.failureMessageDigest,
      updated_at: new Date(),
    })
    .where(
      and(
        eq(paperAssetUploadOperation.public_id, input.operationPublicId),
        inArray(paperAssetUploadOperation.operation_status, [
          "pending",
          "file_stored",
          "failed",
        ]),
      ),
    );
}

async function completePaperAssetUpload(
  database: RuntimeDatabase,
  input: CompletePaperAssetUploadInput,
): Promise<CompletePaperAssetUploadResult> {
  return database.transaction(async (transaction) => {
    const scopedDatabase = transaction as RuntimeDatabase;
    const actorAdminId = await resolveActorAdminIdByPublicId(
      scopedDatabase,
      input.mutationContext.actorPublicId,
    );
    const [unlockedOperation] = await scopedDatabase
      .select({ object_key: paperAssetUploadOperation.object_key })
      .from(paperAssetUploadOperation)
      .where(eq(paperAssetUploadOperation.public_id, input.operationPublicId))
      .limit(1);

    if (unlockedOperation === undefined) {
      return { status: "conflict" };
    }

    await lockPaperAssetObjectIdentity(
      scopedDatabase,
      unlockedOperation.object_key,
    );
    const [operationRow] = await scopedDatabase
      .select({
        id: paperAssetUploadOperation.id,
        actor_admin_id: paperAssetUploadOperation.actor_admin_id,
        paper_id: paperAssetUploadOperation.paper_id,
        paper_asset_id: paperAssetUploadOperation.paper_asset_id,
        paper_asset_public_id: paperAssetUploadOperation.paper_asset_public_id,
        request_fingerprint: paperAssetUploadOperation.request_fingerprint,
        paper_attachment_usage:
          paperAssetUploadOperation.paper_attachment_usage,
        file_name: paperAssetUploadOperation.file_name,
        object_key: paperAssetUploadOperation.object_key,
        content_type: paperAssetUploadOperation.content_type,
        file_size_byte: paperAssetUploadOperation.file_size_byte,
        file_hash: paperAssetUploadOperation.file_hash,
        operation_status: paperAssetUploadOperation.operation_status,
      })
      .from(paperAssetUploadOperation)
      .where(eq(paperAssetUploadOperation.public_id, input.operationPublicId))
      .limit(1)
      .for("update");

    if (
      operationRow === undefined ||
      operationRow.actor_admin_id !== actorAdminId ||
      operationRow.object_key !== unlockedOperation.object_key ||
      operationRow.request_fingerprint !== input.requestFingerprint ||
      input.mutationContext.auditLog.actionType !== "paper_asset.create"
    ) {
      return { status: "conflict" };
    }

    if (operationRow.operation_status === "completed") {
      const completedPaperAsset =
        operationRow.paper_asset_id === null
          ? null
          : await findPaperAssetById(
              scopedDatabase,
              operationRow.paper_asset_id,
            );

      return completedPaperAsset === null
        ? { status: "conflict" }
        : {
            status: "completed",
            paperAsset: completedPaperAsset,
            replayed: true,
          };
    }

    if (operationRow.operation_status !== "file_stored") {
      return { status: "conflict" };
    }

    const [insertedPaperAsset] = await scopedDatabase
      .insert(paperAsset)
      .values({
        public_id: operationRow.paper_asset_public_id,
        paper_id: operationRow.paper_id,
        paper_attachment_usage: operationRow.paper_attachment_usage,
        file_name: operationRow.file_name,
        object_key: operationRow.object_key,
        content_type: operationRow.content_type,
        file_size_byte: operationRow.file_size_byte,
        file_hash: operationRow.file_hash,
        created_by_admin_id: actorAdminId,
      })
      .returning({
        id: paperAsset.id,
        public_id: paperAsset.public_id,
      });

    if (insertedPaperAsset === undefined) {
      throw new Error("Paper asset insert did not return a row.");
    }

    await appendPaperAssetCreateAuditLog(
      scopedDatabase,
      {
        ...input.mutationContext,
        auditLog: {
          ...input.mutationContext.auditLog,
          metadataSummary: "redacted paper_asset mutation metadata",
        },
      },
      insertedPaperAsset.public_id,
    );
    await scopedDatabase
      .update(paperAssetUploadOperation)
      .set({
        operation_status: "completed",
        paper_asset_id: insertedPaperAsset.id,
        completed_at: new Date(),
        last_failure_message_digest: null,
        updated_at: new Date(),
      })
      .where(eq(paperAssetUploadOperation.id, operationRow.id));

    const completedPaperAsset = await findPaperAssetById(
      scopedDatabase,
      insertedPaperAsset.id,
    );

    if (completedPaperAsset === null) {
      throw new Error("Completed paper asset could not be reloaded.");
    }

    return {
      status: "completed",
      paperAsset: completedPaperAsset,
      replayed: false,
    };
  });
}

type PaperAssetCleanupJobRow = {
  id: number;
  public_id: string;
  source_paper_asset_public_id: string;
  profession: Profession;
  object_key: string;
  file_name: string;
  file_size_byte: number;
  file_hash: string;
  cleanup_status: "pending" | "completed" | "failed" | "cancelled";
};

function hasMatchingCleanupIdentity(
  expected: PaperAssetCleanupIdentity,
  actual: PaperAssetCleanupIdentity,
): boolean {
  return (
    expected.profession === actual.profession &&
    expected.objectKey === actual.objectKey &&
    expected.fileName === actual.fileName &&
    expected.fileSizeByte === actual.fileSizeByte &&
    expected.fileHash === actual.fileHash
  );
}

function mapCleanupJobIdentity(
  row: Pick<
    PaperAssetCleanupJobRow,
    "profession" | "object_key" | "file_name" | "file_size_byte" | "file_hash"
  >,
): PaperAssetCleanupIdentity {
  return {
    profession: row.profession,
    objectKey: row.object_key,
    fileName: row.file_name,
    fileSizeByte: row.file_size_byte,
    fileHash: row.file_hash,
  };
}

function cleanupJobSelection() {
  return {
    id: paperAssetCleanupJob.id,
    public_id: paperAssetCleanupJob.public_id,
    source_paper_asset_public_id:
      paperAssetCleanupJob.source_paper_asset_public_id,
    profession: paperAssetCleanupJob.profession,
    object_key: paperAssetCleanupJob.object_key,
    file_name: paperAssetCleanupJob.file_name,
    file_size_byte: paperAssetCleanupJob.file_size_byte,
    file_hash: paperAssetCleanupJob.file_hash,
    cleanup_status: paperAssetCleanupJob.cleanup_status,
  };
}

async function markPaperAssetCleanupFailed(
  database: RuntimeDatabase,
  jobId: number,
): Promise<PaperAssetDeleteResult> {
  await database
    .update(paperAssetCleanupJob)
    .set({
      cleanup_status: "failed",
      last_failure_message_digest: PAPER_ASSET_CLEANUP_FAILURE_DIGEST,
      updated_at: new Date(),
    })
    .where(eq(paperAssetCleanupJob.id, jobId));
  return { status: "retryable" };
}

async function processPaperAssetCleanupJob(
  database: RuntimeDatabase,
  sourcePaperAssetPublicId: string,
  deleteLocalFile: DeletePaperAssetLocalFile,
): Promise<PaperAssetDeleteResult> {
  const [unlockedJob] = await database
    .select(cleanupJobSelection())
    .from(paperAssetCleanupJob)
    .where(
      eq(
        paperAssetCleanupJob.source_paper_asset_public_id,
        sourcePaperAssetPublicId,
      ),
    )
    .limit(1);

  if (unlockedJob === undefined) {
    return { status: "not_found" };
  }

  await lockPaperAssetObjectIdentity(database, unlockedJob.object_key);
  const [job] = await database
    .select(cleanupJobSelection())
    .from(paperAssetCleanupJob)
    .where(eq(paperAssetCleanupJob.id, unlockedJob.id))
    .limit(1)
    .for("update");

  if (
    job === undefined ||
    !hasMatchingCleanupIdentity(
      mapCleanupJobIdentity(unlockedJob),
      mapCleanupJobIdentity(job),
    )
  ) {
    return { status: "retryable" };
  }

  if (job.cleanup_status === "completed") {
    return { status: "completed" };
  }
  if (job.cleanup_status === "cancelled") {
    return { status: "cancelled" };
  }

  await database
    .update(paperAssetCleanupJob)
    .set({
      attempt_count: sql`${paperAssetCleanupJob.attempt_count} + 1`,
      claimed_at: new Date(),
      updated_at: new Date(),
    })
    .where(eq(paperAssetCleanupJob.id, job.id));

  const cleanupIdentity = mapCleanupJobIdentity(job);
  const referenceRows = await database
    .select({
      profession: paper.profession,
      objectKey: paperAsset.object_key,
      fileName: paperAsset.file_name,
      fileSizeByte: paperAsset.file_size_byte,
      fileHash: paperAsset.file_hash,
    })
    .from(paperAsset)
    .innerJoin(paper, eq(paper.id, paperAsset.paper_id))
    .where(eq(paperAsset.object_key, job.object_key));

  if (
    referenceRows.some(
      (reference) => !hasMatchingCleanupIdentity(cleanupIdentity, reference),
    )
  ) {
    return markPaperAssetCleanupFailed(database, job.id);
  }

  if (referenceRows.length > 0) {
    await database
      .update(paperAssetCleanupJob)
      .set({
        cleanup_status: "cancelled",
        completed_at: new Date(),
        last_failure_message_digest: null,
        updated_at: new Date(),
      })
      .where(eq(paperAssetCleanupJob.id, job.id));
    return { status: "cancelled" };
  }

  const liveUploadRows = await database
    .select({
      profession: paper.profession,
      objectKey: paperAssetUploadOperation.object_key,
      fileName: paperAssetUploadOperation.file_name,
      fileSizeByte: paperAssetUploadOperation.file_size_byte,
      fileHash: paperAssetUploadOperation.file_hash,
    })
    .from(paperAssetUploadOperation)
    .innerJoin(paper, eq(paper.id, paperAssetUploadOperation.paper_id))
    .where(
      and(
        eq(paperAssetUploadOperation.object_key, job.object_key),
        inArray(paperAssetUploadOperation.operation_status, [
          "pending",
          "file_stored",
        ]),
      ),
    );

  if (
    liveUploadRows.some(
      (operation) => !hasMatchingCleanupIdentity(cleanupIdentity, operation),
    )
  ) {
    return markPaperAssetCleanupFailed(database, job.id);
  }

  if (liveUploadRows.length > 0) {
    await database
      .update(paperAssetCleanupJob)
      .set({
        cleanup_status: "pending",
        last_failure_message_digest: null,
        updated_at: new Date(),
      })
      .where(eq(paperAssetCleanupJob.id, job.id));
    return { status: "retryable" };
  }

  try {
    await deleteLocalFile(cleanupIdentity);
  } catch {
    return markPaperAssetCleanupFailed(database, job.id);
  }

  await database
    .update(paperAssetCleanupJob)
    .set({
      cleanup_status: "completed",
      completed_at: new Date(),
      last_failure_message_digest: null,
      updated_at: new Date(),
    })
    .where(eq(paperAssetCleanupJob.id, job.id));
  return { status: "completed" };
}

async function deletePaperAssetWithCleanup(
  database: RuntimeDatabase,
  publicId: string,
  context: PaperAssetDeleteMutationContext,
  deleteLocalFile: DeletePaperAssetLocalFile,
): Promise<PaperAssetDeleteResult> {
  return database.transaction(async (transaction) => {
    const scopedDatabase = transaction as RuntimeDatabase;
    const [unlockedAsset] = await scopedDatabase
      .select({
        id: paperAsset.id,
        public_id: paperAsset.public_id,
        profession: paper.profession,
        paper_status: paper.paper_status,
        object_key: paperAsset.object_key,
        file_name: paperAsset.file_name,
        file_size_byte: paperAsset.file_size_byte,
        file_hash: paperAsset.file_hash,
      })
      .from(paperAsset)
      .innerJoin(paper, eq(paper.id, paperAsset.paper_id))
      .where(eq(paperAsset.public_id, publicId))
      .limit(1);

    if (unlockedAsset === undefined) {
      return processPaperAssetCleanupJob(
        scopedDatabase,
        publicId,
        deleteLocalFile,
      );
    }

    await lockPaperAssetObjectIdentity(
      scopedDatabase,
      unlockedAsset.object_key,
    );
    const [lockedAsset] = await scopedDatabase
      .select({
        id: paperAsset.id,
        public_id: paperAsset.public_id,
        profession: paper.profession,
        paper_status: paper.paper_status,
        object_key: paperAsset.object_key,
        file_name: paperAsset.file_name,
        file_size_byte: paperAsset.file_size_byte,
        file_hash: paperAsset.file_hash,
      })
      .from(paperAsset)
      .innerJoin(paper, eq(paper.id, paperAsset.paper_id))
      .where(eq(paperAsset.id, unlockedAsset.id))
      .limit(1)
      .for("update");

    const unlockedIdentity = {
      profession: unlockedAsset.profession,
      objectKey: unlockedAsset.object_key,
      fileName: unlockedAsset.file_name,
      fileSizeByte: unlockedAsset.file_size_byte,
      fileHash: unlockedAsset.file_hash,
    };
    if (
      lockedAsset === undefined ||
      lockedAsset.paper_status !== "draft" ||
      !hasMatchingCleanupIdentity(unlockedIdentity, {
        profession: lockedAsset.profession,
        objectKey: lockedAsset.object_key,
        fileName: lockedAsset.file_name,
        fileSizeByte: lockedAsset.file_size_byte,
        fileHash: lockedAsset.file_hash,
      })
    ) {
      return { status: "not_found" };
    }

    const [deletedAsset] = await scopedDatabase
      .delete(paperAsset)
      .where(
        and(
          eq(paperAsset.id, lockedAsset.id),
          inArray(
            paperAsset.paper_id,
            scopedDatabase
              .select({ id: paper.id })
              .from(paper)
              .where(eq(paper.paper_status, "draft")),
          ),
        ),
      )
      .returning({ public_id: paperAsset.public_id });

    if (deletedAsset === undefined) {
      return { status: "not_found" };
    }

    await appendPaperAssetDeleteAuditLog(
      scopedDatabase,
      context,
      deletedAsset.public_id,
    );

    const remainingReferences = await scopedDatabase
      .select({
        profession: paper.profession,
        objectKey: paperAsset.object_key,
        fileName: paperAsset.file_name,
        fileSizeByte: paperAsset.file_size_byte,
        fileHash: paperAsset.file_hash,
      })
      .from(paperAsset)
      .innerJoin(paper, eq(paper.id, paperAsset.paper_id))
      .where(eq(paperAsset.object_key, lockedAsset.object_key));

    if (
      remainingReferences.some(
        (reference) => !hasMatchingCleanupIdentity(unlockedIdentity, reference),
      )
    ) {
      throw new Error("Paper asset object identity is inconsistent.");
    }

    if (remainingReferences.length > 0) {
      return { status: "completed" };
    }

    await scopedDatabase
      .insert(paperAssetCleanupJob)
      .values({
        public_id: `paper-asset-cleanup-job-${randomUUID()}`,
        source_paper_asset_public_id: deletedAsset.public_id,
        profession: lockedAsset.profession,
        object_key: lockedAsset.object_key,
        file_name: lockedAsset.file_name,
        file_size_byte: lockedAsset.file_size_byte,
        file_hash: lockedAsset.file_hash,
        cleanup_status: "pending",
      })
      .onConflictDoNothing({
        target: paperAssetCleanupJob.source_paper_asset_public_id,
      });

    return processPaperAssetCleanupJob(
      scopedDatabase,
      deletedAsset.public_id,
      deleteLocalFile,
    );
  });
}

async function appendPaperAssetCreateAuditLog(
  database: RuntimeDatabase,
  context: PaperAssetCreateMutationContext,
  targetPublicId: string,
): Promise<void> {
  await database.insert(auditLog).values({
    public_id: `audit-log-${randomUUID()}`,
    actor_public_id: context.actorPublicId,
    actor_role: context.auditLog.actorRole,
    action_type: "paper_asset.create",
    target_resource_type: "paper_asset",
    target_public_id: targetPublicId,
    result_status: "success",
    metadata_summary: context.auditLog.metadataSummary,
    request_ip: context.auditLog.requestIp,
  });
}

async function appendPaperAssetDeleteAuditLog(
  database: RuntimeDatabase,
  context: PaperAssetDeleteMutationContext,
  targetPublicId: string,
): Promise<void> {
  await database.insert(auditLog).values({
    public_id: `audit-log-${randomUUID()}`,
    actor_public_id: context.actorPublicId,
    actor_role: context.auditLog.actorRole,
    action_type: "paper_asset.delete",
    target_resource_type: "paper_asset",
    target_public_id: targetPublicId,
    result_status: "success",
    metadata_summary: context.auditLog.metadataSummary,
    request_ip: context.auditLog.requestIp,
  });
}

function createPaperAssetConditions(
  queryInput: NormalizedPaperAssetListInput,
): SQL[] {
  const conditions: SQL[] = [];

  if (queryInput.paperPublicId !== null) {
    conditions.push(eq(paper.public_id, queryInput.paperPublicId));
  }

  if (queryInput.paperAttachmentUsage !== null) {
    conditions.push(
      eq(paperAsset.paper_attachment_usage, queryInput.paperAttachmentUsage),
    );
  }

  return conditions;
}

function createPaperAssetOrderBy(
  queryInput: NormalizedPaperAssetListInput,
): SQL {
  if (queryInput.sortBy === "fileName") {
    return queryInput.sortOrder === "asc"
      ? asc(paperAsset.file_name)
      : desc(paperAsset.file_name);
  }

  return queryInput.sortOrder === "asc"
    ? asc(paperAsset.created_at)
    : desc(paperAsset.created_at);
}

async function findPaperAssetByPublicId(
  database: RuntimeDatabase,
  publicId: string,
): Promise<PaperAssetAccessRow | null> {
  const [row] = await database
    .select({
      id: paperAsset.id,
      public_id: paperAsset.public_id,
      paper_public_id: paper.public_id,
      profession: paper.profession,
      paper_attachment_usage: paperAsset.paper_attachment_usage,
      file_name: paperAsset.file_name,
      object_key: paperAsset.object_key,
      content_type: paperAsset.content_type,
      file_size_byte: paperAsset.file_size_byte,
      file_hash: paperAsset.file_hash,
      created_at: paperAsset.created_at,
    })
    .from(paperAsset)
    .innerJoin(paper, eq(paper.id, paperAsset.paper_id))
    .where(eq(paperAsset.public_id, publicId))
    .limit(1);

  return row ?? null;
}

async function findPaperAssetById(
  database: RuntimeDatabase,
  id: number,
): Promise<PaperAssetAccessRow | null> {
  const [row] = await database
    .select({
      id: paperAsset.id,
      public_id: paperAsset.public_id,
      paper_public_id: paper.public_id,
      profession: paper.profession,
      paper_attachment_usage: paperAsset.paper_attachment_usage,
      file_name: paperAsset.file_name,
      object_key: paperAsset.object_key,
      content_type: paperAsset.content_type,
      file_size_byte: paperAsset.file_size_byte,
      file_hash: paperAsset.file_hash,
      created_at: paperAsset.created_at,
    })
    .from(paperAsset)
    .innerJoin(paper, eq(paper.id, paperAsset.paper_id))
    .where(eq(paperAsset.id, id))
    .limit(1);

  return row ?? null;
}

async function resolvePaperForUpload(
  database: RuntimeDatabase,
  publicId: string,
): Promise<{ id: number; profession: Profession } | null> {
  const [row] = await database
    .select({ id: paper.id, profession: paper.profession })
    .from(paper)
    .where(eq(paper.public_id, publicId))
    .limit(1);

  return row ?? null;
}

async function resolveActorAdminIdByPublicId(
  database: RuntimeDatabase,
  actorPublicId: string,
): Promise<number> {
  const [row] = await database
    .select({ id: admin.id })
    .from(admin)
    .where(eq(admin.public_id, actorPublicId))
    .limit(1);

  if (row === undefined) {
    throw new Error("Paper asset mutation admin actor does not exist.");
  }

  return row.id;
}

import { randomUUID } from "node:crypto";

import { and, asc, count, desc, eq, inArray, type SQL } from "drizzle-orm";

import {
  admin,
  auditLog,
  paper,
  paperAsset,
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
  ): Promise<boolean>;
};

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

    async deletePaperAsset(publicId, context) {
      const database = getDatabase();
      return database.transaction(async (transaction) => {
        const scopedDatabase = transaction as RuntimeDatabase;
        const [row] = await scopedDatabase
          .delete(paperAsset)
          .where(
            and(
              eq(paperAsset.public_id, publicId),
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

        if (row === undefined) {
          return false;
        }

        await appendPaperAssetDeleteAuditLog(
          scopedDatabase,
          context,
          row.public_id,
        );
        return true;
      });
    },
  };
}

async function preparePaperAssetUpload(
  database: RuntimeDatabase,
  input: PreparePaperAssetUploadInput,
): Promise<PreparePaperAssetUploadResult> {
  return database.transaction(async (transaction) => {
    const scopedDatabase = transaction as RuntimeDatabase;
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

import { createHash, randomUUID } from "node:crypto";

import { and, asc, count, desc, eq, type SQL } from "drizzle-orm";

import { admin, auditLog, paper, paperAsset, paperCommand } from "@/db/schema";
import type { PaperAttachmentUsage } from "../models/paper";
import type {
  NormalizedCreatePaperAssetInput,
  NormalizedPaperAssetListInput,
} from "../validators/paper-asset";
import {
  createLazyRuntimeDatabaseGetter,
  type RuntimeDatabase,
  type RuntimeDatabaseOptions,
} from "./runtime-database";

export type PaperAssetAccessRow = {
  id: number;
  public_id: string;
  paper_public_id: string;
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

type PaperAssetCommandClaim =
  | { kind: "claimed"; id: number }
  | { kind: "replay"; resultPublicId: string }
  | { kind: "conflict" };

export class PaperAssetCommandConflictError extends Error {
  constructor() {
    super("Paper asset command conflicts with an existing request.");
    this.name = "PaperAssetCommandConflictError";
  }
}

export type PaperAssetRepository = {
  listPaperAssets(
    query: NormalizedPaperAssetListInput,
  ): Promise<PaperAssetListResult>;
  createPaperAsset(
    input: NormalizedCreatePaperAssetInput,
    context: PaperAssetCreateMutationContext,
  ): Promise<PaperAssetAccessRow | null>;
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
    async listPaperAssets(queryInput) {
      const database = getDatabase();
      const conditions = createPaperAssetConditions(queryInput);
      const rows = await database
        .select({
          id: paperAsset.id,
          public_id: paperAsset.public_id,
          paper_public_id: paper.public_id,
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

    async createPaperAsset(input, context) {
      const database = getDatabase();
      return database.transaction(async (transaction) => {
        const scopedDatabase = transaction as RuntimeDatabase;
        const actorAdminId = await resolveActorAdminId(scopedDatabase, context);
        const paperId = await resolvePaperId(
          scopedDatabase,
          input.paperPublicId,
        );

        if (paperId === null) {
          return null;
        }

        const requestHash = createPaperAssetRequestHash(input);
        const commandClaim = await claimPaperAssetCreateCommand(
          scopedDatabase,
          {
            actorAdminId,
            commandKind: "paper_asset.create",
            commandPublicId: input.commandPublicId,
            paperId,
            requestHash,
          },
        );

        if (commandClaim.kind === "replay") {
          const replayedPaperAsset = await findPaperAssetByPublicId(
            scopedDatabase,
            commandClaim.resultPublicId,
          );

          if (replayedPaperAsset !== null) {
            return replayedPaperAsset;
          }
        }

        if (commandClaim.kind !== "claimed") {
          throw new PaperAssetCommandConflictError();
        }

        const [row] = await scopedDatabase
          .insert(paperAsset)
          .values({
            content_type: input.contentType,
            created_by_admin_id: actorAdminId,
            file_hash: input.fileHash,
            file_name: input.fileName,
            file_size_byte: input.fileSizeByte,
            object_key: input.objectKey,
            paper_attachment_usage: input.paperAttachmentUsage,
            paper_id: paperId,
            public_id: `paper-asset-${randomUUID()}`,
          })
          .returning({ public_id: paperAsset.public_id });

        if (row === undefined) {
          throw new Error("Paper asset insert did not return a row.");
        }

        await appendPaperAssetCreateAuditLog(
          scopedDatabase,
          context,
          row.public_id,
        );
        await completePaperAssetCreateCommand(scopedDatabase, {
          commandId: commandClaim.id,
          resultPublicId: row.public_id,
        });

        return findPaperAssetByPublicId(scopedDatabase, row.public_id);
      });
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
          .where(eq(paperAsset.public_id, publicId))
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

export function createPaperAssetRequestHash(
  input: NormalizedCreatePaperAssetInput,
): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        contentType: input.contentType,
        fileHash: input.fileHash,
        fileName: input.fileName,
        fileSizeByte: input.fileSizeByte,
        objectKey: input.objectKey,
        paperAttachmentUsage: input.paperAttachmentUsage,
        paperPublicId: input.paperPublicId,
      }),
    )
    .digest("hex");
}

async function claimPaperAssetCreateCommand(
  database: RuntimeDatabase,
  input: {
    actorAdminId: number;
    commandKind: "paper_asset.create";
    commandPublicId: string;
    paperId: number;
    requestHash: string;
  },
): Promise<PaperAssetCommandClaim> {
  const [inserted] = await database
    .insert(paperCommand)
    .values({
      actor_admin_id: input.actorAdminId,
      command_kind: input.commandKind,
      paper_id: input.paperId,
      public_id: input.commandPublicId,
      request_hash: input.requestHash,
    })
    .onConflictDoNothing({ target: paperCommand.public_id })
    .returning({ id: paperCommand.id });

  if (inserted !== undefined) {
    return { kind: "claimed", id: inserted.id };
  }

  const [existing] = await database
    .select({
      actor_admin_id: paperCommand.actor_admin_id,
      command_kind: paperCommand.command_kind,
      paper_id: paperCommand.paper_id,
      request_hash: paperCommand.request_hash,
      result_public_id: paperCommand.result_public_id,
    })
    .from(paperCommand)
    .where(eq(paperCommand.public_id, input.commandPublicId))
    .limit(1);

  return existing !== undefined &&
    existing.actor_admin_id === input.actorAdminId &&
    existing.command_kind === input.commandKind &&
    existing.paper_id === input.paperId &&
    existing.request_hash === input.requestHash &&
    existing.result_public_id !== null
    ? { kind: "replay", resultPublicId: existing.result_public_id }
    : { kind: "conflict" };
}

async function completePaperAssetCreateCommand(
  database: RuntimeDatabase,
  input: { commandId: number; resultPublicId: string },
): Promise<void> {
  await database
    .update(paperCommand)
    .set({ result_public_id: input.resultPublicId })
    .where(eq(paperCommand.id, input.commandId));
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

async function resolvePaperId(
  database: RuntimeDatabase,
  publicId: string,
): Promise<number | null> {
  const [row] = await database
    .select({ id: paper.id })
    .from(paper)
    .where(eq(paper.public_id, publicId))
    .limit(1);

  return row?.id ?? null;
}

async function resolveActorAdminId(
  database: RuntimeDatabase,
  context: PaperAssetCreateMutationContext,
): Promise<number> {
  const [row] = await database
    .select({ id: admin.id })
    .from(admin)
    .where(eq(admin.public_id, context.actorPublicId))
    .limit(1);

  if (row === undefined) {
    throw new Error("Paper asset mutation admin actor does not exist.");
  }

  return row.id;
}

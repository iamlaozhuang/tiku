import { randomUUID } from "node:crypto";

import { and, asc, count, desc, eq, type SQL } from "drizzle-orm";

import { admin, paper, paperAsset } from "@/db/schema";
import type { PaperAttachmentUsage } from "../models/paper";
import type {
  NormalizedCreatePaperAssetInput,
  NormalizedPaperAssetListInput,
} from "../validators/paper-asset";
import type { ContentMutationContext } from "./question-repository";
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

export type PaperAssetRepository = {
  listPaperAssets(
    query: NormalizedPaperAssetListInput,
  ): Promise<PaperAssetListResult>;
  createPaperAsset(
    input: NormalizedCreatePaperAssetInput,
    context?: ContentMutationContext,
  ): Promise<PaperAssetAccessRow | null>;
  findPaperAssetByPublicId(
    publicId: string,
  ): Promise<PaperAssetAccessRow | null>;
  deletePaperAsset(publicId: string): Promise<boolean>;
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
      const actorAdminId = await resolveActorAdminId(database, context);
      const paperId = await resolvePaperId(database, input.paperPublicId);

      if (paperId === null) {
        return null;
      }

      const [row] = await database
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

      return findPaperAssetByPublicId(database, row.public_id);
    },

    async findPaperAssetByPublicId(publicId) {
      return findPaperAssetByPublicId(getDatabase(), publicId);
    },

    async deletePaperAsset(publicId) {
      const database = getDatabase();
      const [row] = await database
        .delete(paperAsset)
        .where(eq(paperAsset.public_id, publicId))
        .returning({ public_id: paperAsset.public_id });

      return row !== undefined;
    },
  };
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
  context: ContentMutationContext | undefined,
): Promise<number> {
  if (context === undefined) {
    throw new Error("Paper asset mutation requires an admin actor.");
  }

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

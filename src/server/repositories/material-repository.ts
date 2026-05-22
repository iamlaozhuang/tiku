import { randomUUID } from "node:crypto";

import { and, asc, count, desc, eq, type SQL } from "drizzle-orm";

import { admin, material } from "@/db/schema";
import type { MaterialStatus, Profession, Subject } from "../models/paper";
import type {
  NormalizedCreateMaterialInput,
  NormalizedMaterialListInput,
  NormalizedUpdateMaterialInput,
} from "../validators/material";
import type { ContentMutationContext } from "./question-repository";
import {
  createLazyRuntimeDatabaseGetter,
  type RuntimeDatabase,
  type RuntimeDatabaseOptions,
} from "./runtime-database";

export type MaterialAccessRow = {
  id: number;
  public_id: string;
  title: string;
  content_rich_text: string;
  profession: Profession;
  level: number;
  subject: Subject;
  status: MaterialStatus;
  is_locked: boolean;
  locked_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

export type MaterialListResult = {
  rows: MaterialAccessRow[];
  total: number;
};

export type UpdateMaterialInput = NormalizedUpdateMaterialInput & {
  publicId: string;
};

export type MaterialRepository = {
  listMaterials(
    query: NormalizedMaterialListInput,
  ): Promise<MaterialListResult>;
  createMaterial(
    input: NormalizedCreateMaterialInput,
    context?: ContentMutationContext,
  ): Promise<MaterialAccessRow>;
  findMaterialByPublicId(publicId: string): Promise<MaterialAccessRow | null>;
  updateMaterial(
    input: UpdateMaterialInput,
    context?: ContentMutationContext,
  ): Promise<MaterialAccessRow>;
  disableMaterial(
    publicId: string,
    context?: ContentMutationContext,
  ): Promise<MaterialAccessRow | null>;
  copyMaterial(
    publicId: string,
    context?: ContentMutationContext,
  ): Promise<MaterialAccessRow | null>;
};

export function createPostgresMaterialRepository(
  options: RuntimeDatabaseOptions = {},
): MaterialRepository {
  const getDatabase = createLazyRuntimeDatabaseGetter(
    options,
    "DATABASE_URL is required for material runtime.",
  );

  return {
    async listMaterials(queryInput) {
      const database = getDatabase();
      const conditions = createMaterialConditions(queryInput);
      const rows = await database
        .select()
        .from(material)
        .where(and(...conditions))
        .orderBy(createMaterialOrderBy(queryInput))
        .limit(queryInput.pageSize)
        .offset((queryInput.page - 1) * queryInput.pageSize);
      const [totalRow] = await database
        .select({ value: count() })
        .from(material)
        .where(and(...conditions));

      return {
        rows,
        total: totalRow?.value ?? 0,
      };
    },

    async createMaterial(input, context) {
      const database = getDatabase();
      const actorAdminId = await resolveActorAdminId(database, context);
      const [row] = await database
        .insert(material)
        .values({
          content_rich_text: input.contentRichText,
          created_by_admin_id: actorAdminId,
          level: input.level,
          profession: input.profession,
          public_id: `material-${randomUUID()}`,
          subject: input.subject,
          title: input.title,
          updated_by_admin_id: actorAdminId,
        })
        .returning();

      if (row === undefined) {
        throw new Error("Material insert did not return a row.");
      }

      return row;
    },

    async findMaterialByPublicId(publicId) {
      return findMaterialByPublicId(getDatabase(), publicId);
    },

    async updateMaterial(input, context) {
      const database = getDatabase();
      const actorAdminId = await resolveActorAdminId(database, context);
      const [row] = await database
        .update(material)
        .set({
          content_rich_text: input.contentRichText,
          level: input.level,
          profession: input.profession,
          status: input.status,
          subject: input.subject,
          title: input.title,
          updated_at: new Date(),
          updated_by_admin_id: actorAdminId,
        })
        .where(eq(material.public_id, input.publicId))
        .returning();

      if (row === undefined) {
        throw new Error("Updated material could not be loaded.");
      }

      return row;
    },

    async disableMaterial(publicId, context) {
      const database = getDatabase();
      const actorAdminId = await resolveActorAdminId(database, context);
      const [row] = await database
        .update(material)
        .set({
          status: "disabled",
          updated_at: new Date(),
          updated_by_admin_id: actorAdminId,
        })
        .where(eq(material.public_id, publicId))
        .returning();

      return row ?? null;
    },

    async copyMaterial(publicId, context) {
      const database = getDatabase();
      const actorAdminId = await resolveActorAdminId(database, context);
      const sourceMaterial = await findMaterialByPublicId(database, publicId);

      if (sourceMaterial === null) {
        return null;
      }

      const [row] = await database
        .insert(material)
        .values({
          content_rich_text: sourceMaterial.content_rich_text,
          created_by_admin_id: actorAdminId,
          is_locked: false,
          level: sourceMaterial.level,
          profession: sourceMaterial.profession,
          public_id: `material-${randomUUID()}`,
          status: "available",
          subject: sourceMaterial.subject,
          title: `${sourceMaterial.title} copy`,
          updated_by_admin_id: actorAdminId,
        })
        .returning();

      if (row === undefined) {
        throw new Error("Material copy insert did not return a row.");
      }

      return row;
    },
  };
}

function createMaterialConditions(
  queryInput: NormalizedMaterialListInput,
): SQL[] {
  const conditions: SQL[] = [];

  if (queryInput.profession !== null) {
    conditions.push(eq(material.profession, queryInput.profession));
  }

  if (queryInput.level !== null) {
    conditions.push(eq(material.level, queryInput.level));
  }

  if (queryInput.subject !== null) {
    conditions.push(eq(material.subject, queryInput.subject));
  }

  if (queryInput.status !== null) {
    conditions.push(eq(material.status, queryInput.status));
  }

  return conditions;
}

function createMaterialOrderBy(queryInput: NormalizedMaterialListInput): SQL {
  if (queryInput.sortBy === "updatedAt") {
    return queryInput.sortOrder === "asc"
      ? asc(material.updated_at)
      : desc(material.updated_at);
  }

  return queryInput.sortOrder === "asc"
    ? asc(material.created_at)
    : desc(material.created_at);
}

async function findMaterialByPublicId(
  database: RuntimeDatabase,
  publicId: string,
): Promise<MaterialAccessRow | null> {
  const [row] = await database
    .select()
    .from(material)
    .where(eq(material.public_id, publicId))
    .limit(1);

  return row ?? null;
}

async function resolveActorAdminId(
  database: RuntimeDatabase,
  context: ContentMutationContext | undefined,
): Promise<number> {
  if (context === undefined) {
    throw new Error("Content mutation requires an admin actor.");
  }

  const [row] = await database
    .select({ id: admin.id })
    .from(admin)
    .where(eq(admin.public_id, context.actorPublicId))
    .limit(1);

  if (row === undefined) {
    throw new Error("Content mutation admin actor does not exist.");
  }

  return row.id;
}

import { randomUUID } from "node:crypto";

import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  isNotNull,
  or,
  sql,
  type SQL,
} from "drizzle-orm";

import {
  admin,
  material,
  paper,
  paperQuestion,
  question,
  questionGroup,
} from "@/db/schema";
import type {
  MaterialStatus,
  PaperStatus,
  Profession,
  QuestionStatus,
  QuestionType,
  Subject,
} from "../models/paper";
import type {
  NormalizedCreateMaterialInput,
  NormalizedMaterialListInput,
  NormalizedUpdateMaterialInput,
} from "../validators/material";
import { appendContentMutationAuditLog } from "./content-mutation-audit";
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
  references?: MaterialReferenceRows;
};

export type MaterialQuestionReferenceRow = {
  question_public_id: string;
  question_type: QuestionType;
  status: QuestionStatus;
  updated_at: Date;
};

export type MaterialPaperReferenceRow = {
  paper_public_id: string;
  name: string;
  paper_status: PaperStatus;
  updated_at: Date;
};

export type MaterialPaperReferenceFactRow = MaterialPaperReferenceRow & {
  material_id: number;
};

export function mergeMaterialPaperReferenceRows(
  questionGroupRows: readonly MaterialPaperReferenceFactRow[],
  paperQuestionSnapshotRows: readonly MaterialPaperReferenceFactRow[],
): Map<number, MaterialPaperReferenceRow[]> {
  const referencesByMaterialId = new Map<
    number,
    Map<string, MaterialPaperReferenceRow>
  >();

  for (const row of [...questionGroupRows, ...paperQuestionSnapshotRows]) {
    const references =
      referencesByMaterialId.get(row.material_id) ??
      new Map<string, MaterialPaperReferenceRow>();
    references.set(row.paper_public_id, {
      paper_public_id: row.paper_public_id,
      name: row.name,
      paper_status: row.paper_status,
      updated_at: row.updated_at,
    });
    referencesByMaterialId.set(row.material_id, references);
  }

  return new Map(
    Array.from(referencesByMaterialId, ([materialId, references]) => [
      materialId,
      Array.from(references.values()).sort(
        (left, right) =>
          left.updated_at.getTime() - right.updated_at.getTime() ||
          left.paper_public_id.localeCompare(right.paper_public_id),
      ),
    ]),
  );
}

export type MaterialReferenceRows = {
  questions: MaterialQuestionReferenceRow[];
  papers: MaterialPaperReferenceRow[];
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
  ): Promise<MaterialAccessRow | null>;
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
        rows: await attachMaterialReferences(database, rows),
        total: totalRow?.value ?? 0,
      };
    },

    async createMaterial(input, context) {
      const database = getDatabase();
      const actorAdminId = await resolveActorAdminId(database, context);
      return database.transaction(async (transaction) => {
        const [row] = await transaction
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

        await appendContentMutationAuditLog(
          transaction as RuntimeDatabase,
          context,
          row.public_id,
        );

        return row;
      });
    },

    async findMaterialByPublicId(publicId) {
      const database = getDatabase();
      const row = await findMaterialByPublicId(database, publicId);

      if (row === null) {
        return null;
      }

      const [materialWithReferences] = await attachMaterialReferences(
        database,
        [row],
      );

      return materialWithReferences ?? null;
    },

    async updateMaterial(input, context) {
      const database = getDatabase();
      const actorAdminId = await resolveActorAdminId(database, context);
      return database.transaction(async (transaction) => {
        const [row] = await transaction
          .update(material)
          .set({
            content_rich_text: input.contentRichText,
            level: input.level,
            profession: input.profession,
            status: input.status,
            subject: input.subject,
            title: input.title,
            updated_at: sql`greatest(
              clock_timestamp(),
              ${material.updated_at} + interval '1 millisecond'
            )`,
            updated_by_admin_id: actorAdminId,
          })
          .where(
            and(
              eq(material.public_id, input.publicId),
              sql`date_trunc('milliseconds', ${material.updated_at}) = ${input.expectedUpdatedAt}`,
              eq(material.is_locked, false),
            ),
          )
          .returning();

        if (row === undefined) {
          return null;
        }

        await appendContentMutationAuditLog(
          transaction as RuntimeDatabase,
          context,
          row.public_id,
        );

        return row;
      });
    },

    async disableMaterial(publicId, context) {
      const database = getDatabase();
      const actorAdminId = await resolveActorAdminId(database, context);
      return database.transaction(async (transaction) => {
        const [row] = await transaction
          .update(material)
          .set({
            status: "disabled",
            updated_at: new Date(),
            updated_by_admin_id: actorAdminId,
          })
          .where(eq(material.public_id, publicId))
          .returning();

        if (row === undefined) {
          return null;
        }

        await appendContentMutationAuditLog(
          transaction as RuntimeDatabase,
          context,
          row.public_id,
        );

        return row;
      });
    },

    async copyMaterial(publicId, context) {
      const database = getDatabase();
      const actorAdminId = await resolveActorAdminId(database, context);
      return database.transaction(async (transaction) => {
        const scopedDatabase = transaction as RuntimeDatabase;
        const sourceMaterial = await findMaterialByPublicId(
          scopedDatabase,
          publicId,
        );

        if (sourceMaterial === null) {
          return null;
        }

        const [row] = await scopedDatabase
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

        await appendContentMutationAuditLog(
          scopedDatabase,
          context,
          row.public_id,
        );

        return row;
      });
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

  if (queryInput.keyword !== null) {
    conditions.push(
      or(
        ilike(material.title, `%${queryInput.keyword}%`),
        ilike(material.content_rich_text, `%${queryInput.keyword}%`),
      )!,
    );
  }

  if (queryInput.publicIds.length > 0) {
    conditions.push(inArray(material.public_id, queryInput.publicIds));
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

function createEmptyMaterialReferenceRows(): MaterialReferenceRows {
  return {
    questions: [],
    papers: [],
  };
}

async function attachMaterialReferences(
  database: RuntimeDatabase,
  rows: MaterialAccessRow[],
): Promise<MaterialAccessRow[]> {
  const materialIds = rows.map((row) => row.id);

  if (materialIds.length === 0) {
    return rows;
  }

  const referencesByMaterialId = await listMaterialReferencesByMaterialId(
    database,
    materialIds,
  );

  return rows.map((row) => ({
    ...row,
    references:
      referencesByMaterialId.get(row.id) ?? createEmptyMaterialReferenceRows(),
  }));
}

async function listMaterialReferencesByMaterialId(
  database: RuntimeDatabase,
  materialIds: number[],
): Promise<Map<number, MaterialReferenceRows>> {
  const referencesByMaterialId = new Map<number, MaterialReferenceRows>();
  const ensureReferences = (materialId: number): MaterialReferenceRows => {
    const existing = referencesByMaterialId.get(materialId);

    if (existing !== undefined) {
      return existing;
    }

    const references = createEmptyMaterialReferenceRows();
    referencesByMaterialId.set(materialId, references);

    return references;
  };

  const questionRows = await database
    .select({
      material_id: question.material_id,
      question_public_id: question.public_id,
      question_type: question.question_type,
      status: question.status,
      updated_at: question.updated_at,
    })
    .from(question)
    .where(inArray(question.material_id, materialIds))
    .orderBy(asc(question.updated_at));

  for (const row of questionRows) {
    if (row.material_id === null) {
      continue;
    }

    ensureReferences(row.material_id).questions.push({
      question_public_id: row.question_public_id,
      question_type: row.question_type,
      status: row.status,
      updated_at: row.updated_at,
    });
  }

  const questionGroupPaperRows = await database
    .select({
      material_id: questionGroup.material_id,
      paper_public_id: paper.public_id,
      name: paper.name,
      paper_status: paper.paper_status,
      updated_at: paper.updated_at,
    })
    .from(questionGroup)
    .innerJoin(paper, eq(paper.id, questionGroup.paper_id))
    .where(inArray(questionGroup.material_id, materialIds))
    .orderBy(asc(paper.updated_at));

  const snapshotMaterialPublicId = sql<string>`
    ${paperQuestion.material_snapshot} ->> 'materialPublicId'
  `;
  const paperQuestionSnapshotRows = await database
    .select({
      material_id: material.id,
      paper_public_id: paper.public_id,
      name: paper.name,
      paper_status: paper.paper_status,
      updated_at: paper.updated_at,
    })
    .from(paperQuestion)
    .innerJoin(paper, eq(paper.id, paperQuestion.paper_id))
    .innerJoin(material, eq(material.public_id, snapshotMaterialPublicId))
    .where(
      and(
        isNotNull(paperQuestion.material_snapshot),
        inArray(material.id, materialIds),
      ),
    )
    .orderBy(asc(paper.updated_at));

  const paperReferencesByMaterialId = mergeMaterialPaperReferenceRows(
    questionGroupPaperRows,
    paperQuestionSnapshotRows,
  );
  for (const [materialId, paperReferences] of paperReferencesByMaterialId) {
    ensureReferences(materialId).papers.push(...paperReferences);
  }

  return referencesByMaterialId;
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

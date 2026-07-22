import { randomUUID } from "node:crypto";

import {
  and,
  asc,
  count,
  countDistinct,
  desc,
  eq,
  ilike,
  inArray,
  or,
  sql,
  type SQL,
} from "drizzle-orm";

import {
  admin,
  knowledgeNode,
  material,
  paper,
  paperQuestion,
  question,
  questionKnowledgeNode,
  questionOption,
  questionTag,
  scoringPoint,
  tag,
} from "@/db/schema";
import type {
  FillBlankAnswer,
  MultiChoiceRule,
  Profession,
  QuestionDifficulty,
  QuestionStatus,
  QuestionType,
  ScoringMethod,
  Subject,
} from "../models/paper";
import type {
  NormalizedCreateQuestionInput,
  NormalizedQuestionDetailInput,
  NormalizedQuestionListInput,
  NormalizedUpdateQuestionInput,
} from "../validators/question";
import {
  appendContentMutationAuditLog,
  type ContentMutationContext,
} from "./content-mutation-audit";
import {
  enqueueKnowledgeRecommendationTask,
  supersedeKnowledgeRecommendationTasks,
} from "./knowledge-recommendation-runtime-repository";
import {
  createLazyRuntimeDatabaseGetter,
  type RuntimeDatabase,
  type RuntimeDatabaseOptions,
} from "./runtime-database";

export type { ContentMutationContext } from "./content-mutation-audit";

export type QuestionOptionAccessRow = {
  id: number;
  question_id: number;
  label: string;
  content_rich_text: string;
  is_correct: boolean;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
};

export type ScoringPointAccessRow = {
  id: number;
  question_id: number;
  description: string;
  score: string;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
};

export type QuestionAccessRow = {
  id: number;
  public_id: string;
  question_type: QuestionType;
  profession: Profession;
  level: number;
  subject: Subject;
  difficulty?: QuestionDifficulty | null;
  stem_rich_text: string;
  analysis_rich_text: string;
  standard_answer_rich_text: string;
  status: QuestionStatus;
  is_locked: boolean;
  locked_at: Date | null;
  multi_choice_rule: MultiChoiceRule;
  scoring_method: ScoringMethod;
  fill_blank_answers?: FillBlankAnswer[];
  material_id: number | null;
  material_public_id: string | null;
  question_options: QuestionOptionAccessRow[];
  scoring_points: ScoringPointAccessRow[];
  knowledge_node_public_ids: string[];
  parent_knowledge_node_public_ids?: string[];
  ancestor_knowledge_node_public_ids?: string[];
  tag_public_ids: string[];
  created_at: Date;
  updated_at: Date;
};

export type QuestionListResult = {
  rows: QuestionAccessRow[];
  total: number;
};

export type QuestionKnowledgeHierarchyRow = {
  id: number;
  public_id: string;
  knowledge_base_id: number;
  parent_knowledge_node_id: number | null;
  profession: Profession;
};

export type QuestionKnowledgeBindingHierarchyRow =
  QuestionKnowledgeHierarchyRow & {
    question_id: number;
    question_profession: Profession;
  };

export type QuestionKnowledgeMetadata = {
  knowledgeNodePublicIds: string[];
  parentKnowledgeNodePublicIds: string[];
  ancestorKnowledgeNodePublicIds: string[];
};

export class QuestionKnowledgeHierarchyIntegrityError extends Error {
  constructor() {
    super("Question knowledge hierarchy is not internally consistent.");
    this.name = "QuestionKnowledgeHierarchyIntegrityError";
  }
}

export function buildQuestionKnowledgeMetadata(
  directRows: readonly QuestionKnowledgeBindingHierarchyRow[],
  ancestorRows: readonly QuestionKnowledgeHierarchyRow[],
): Map<number, QuestionKnowledgeMetadata> {
  const hierarchyRowsById = new Map<number, QuestionKnowledgeHierarchyRow>();

  for (const row of [...directRows, ...ancestorRows]) {
    const existing = hierarchyRowsById.get(row.id);

    if (
      existing !== undefined &&
      (existing.public_id !== row.public_id ||
        existing.knowledge_base_id !== row.knowledge_base_id ||
        existing.parent_knowledge_node_id !== row.parent_knowledge_node_id ||
        existing.profession !== row.profession)
    ) {
      throw new QuestionKnowledgeHierarchyIntegrityError();
    }

    hierarchyRowsById.set(row.id, row);
  }

  const directRowsByQuestionId = new Map<
    number,
    QuestionKnowledgeBindingHierarchyRow[]
  >();

  for (const row of directRows) {
    directRowsByQuestionId.set(row.question_id, [
      ...(directRowsByQuestionId.get(row.question_id) ?? []),
      row,
    ]);
  }

  return new Map(
    [...directRowsByQuestionId.entries()].map(([questionId, rows]) => {
      const knowledgeNodePublicIds: string[] = [];
      const parentKnowledgeNodePublicIds: string[] = [];
      const ancestorKnowledgeNodePublicIds: string[] = [];
      const directPublicIds = new Set<string>();
      const [firstDirectRow] = rows;

      if (
        firstDirectRow === undefined ||
        rows.some(
          (row) =>
            row.knowledge_base_id !== firstDirectRow.knowledge_base_id ||
            row.profession !== firstDirectRow.profession ||
            row.profession !== row.question_profession,
        )
      ) {
        throw new QuestionKnowledgeHierarchyIntegrityError();
      }

      for (const directRow of [...rows].sort((left, right) =>
        left.public_id.localeCompare(right.public_id),
      )) {
        if (directPublicIds.has(directRow.public_id)) {
          throw new QuestionKnowledgeHierarchyIntegrityError();
        }

        directPublicIds.add(directRow.public_id);
        knowledgeNodePublicIds.push(directRow.public_id);
        const visitedIds = new Set<number>([directRow.id]);
        let parentId = directRow.parent_knowledge_node_id;
        let isDirectParent = true;

        while (parentId !== null) {
          if (visitedIds.has(parentId)) {
            throw new QuestionKnowledgeHierarchyIntegrityError();
          }

          const parentRow = hierarchyRowsById.get(parentId);

          if (
            parentRow === undefined ||
            parentRow.knowledge_base_id !== directRow.knowledge_base_id ||
            parentRow.profession !== directRow.profession
          ) {
            throw new QuestionKnowledgeHierarchyIntegrityError();
          }

          visitedIds.add(parentId);
          if (
            isDirectParent &&
            !parentKnowledgeNodePublicIds.includes(parentRow.public_id)
          ) {
            parentKnowledgeNodePublicIds.push(parentRow.public_id);
          }
          if (!ancestorKnowledgeNodePublicIds.includes(parentRow.public_id)) {
            ancestorKnowledgeNodePublicIds.push(parentRow.public_id);
          }
          isDirectParent = false;
          parentId = parentRow.parent_knowledge_node_id;
        }
      }

      return [
        questionId,
        {
          knowledgeNodePublicIds,
          parentKnowledgeNodePublicIds,
          ancestorKnowledgeNodePublicIds,
        },
      ];
    }),
  );
}

export type QuestionDetailAccessRow = QuestionAccessRow & {
  material_detail: {
    public_id: string;
    title: string;
    status: "available" | "disabled";
  } | null;
  knowledge_nodes: Array<{
    public_id: string;
    name: string;
    path_name: string;
    kn_status: "active" | "disabled";
  }>;
  tags: Array<{
    public_id: string;
    name: string;
  }>;
  paper_references: Array<{
    paper_public_id: string;
    name: string;
    paper_status: "draft" | "published" | "archived";
    updated_at: Date;
  }>;
  paper_reference_total: number;
  locking_paper_count: number;
};

export type AiPaperSourceQuestionListInput = {
  profession: Profession;
  level: number;
  subject: Subject;
  knowledgeNodePublicIds: readonly string[] | null;
  questionPublicIds: readonly string[] | null;
};

export type AiPaperQuestionSourceRepository = {
  listAvailableAiPaperSourceQuestions(
    input: AiPaperSourceQuestionListInput,
  ): Promise<QuestionAccessRow[]>;
};

export type UpdateQuestionInput = NormalizedUpdateQuestionInput & {
  publicId: string;
};

export type QuestionCreateOptions = {
  initialStatus?: QuestionStatus;
};

type QuestionBindingResource = "knowledge_node" | "material" | "tag";

export class QuestionBindingEligibilityError extends Error {
  constructor(resource: QuestionBindingResource) {
    super(`${resource} binding is missing or ineligible.`);
    this.name = "QuestionBindingEligibilityError";
  }
}

type QuestionMaterialBindingRow = {
  id: number;
  public_id: string;
  status: "available" | "disabled";
};

type QuestionKnowledgeNodeBindingRow = {
  id: number;
  public_id: string;
  kn_status: "active" | "disabled";
  is_recommendable: boolean;
};

export function requireEligibleQuestionMaterialId({
  preservedPublicId = null,
  requestedPublicId,
  row,
}: {
  preservedPublicId?: string | null;
  requestedPublicId: string;
  row: QuestionMaterialBindingRow | undefined;
}): number {
  if (
    row === undefined ||
    row.public_id !== requestedPublicId ||
    (row.status !== "available" && row.public_id !== preservedPublicId)
  ) {
    throw new QuestionBindingEligibilityError("material");
  }

  return row.id;
}

export function requireEligibleQuestionKnowledgeNodeIds({
  preservedPublicIds = [],
  requestedPublicIds,
  rows,
}: {
  preservedPublicIds?: readonly string[];
  requestedPublicIds: readonly string[];
  rows: readonly QuestionKnowledgeNodeBindingRow[];
}): number[] {
  const preservedPublicIdSet = new Set(preservedPublicIds);
  const rowByPublicId = new Map(rows.map((row) => [row.public_id, row]));

  return requestedPublicIds.map((publicId) => {
    const row = rowByPublicId.get(publicId);
    if (
      row === undefined ||
      ((row.kn_status !== "active" || !row.is_recommendable) &&
        !preservedPublicIdSet.has(publicId))
    ) {
      throw new QuestionBindingEligibilityError("knowledge_node");
    }

    return row.id;
  });
}

export type QuestionRepository = {
  listQuestions(
    query: NormalizedQuestionListInput,
  ): Promise<QuestionListResult>;
  createQuestion(
    input: NormalizedCreateQuestionInput,
    context?: ContentMutationContext,
    options?: QuestionCreateOptions,
  ): Promise<QuestionAccessRow>;
  findQuestionByPublicId(publicId: string): Promise<QuestionAccessRow | null>;
  findQuestionDetailByPublicId(
    publicId: string,
    query: NormalizedQuestionDetailInput,
  ): Promise<QuestionDetailAccessRow | null>;
  updateQuestion(
    input: UpdateQuestionInput,
    context?: ContentMutationContext,
  ): Promise<QuestionAccessRow | null>;
  disableQuestion(
    publicId: string,
    context?: ContentMutationContext,
  ): Promise<QuestionAccessRow | null>;
  copyQuestion(
    publicId: string,
    context?: ContentMutationContext,
  ): Promise<QuestionAccessRow | null>;
};

export function createPostgresQuestionRepository(
  options: RuntimeDatabaseOptions = {},
): QuestionRepository & AiPaperQuestionSourceRepository {
  const getDatabase = createLazyRuntimeDatabaseGetter(
    options,
    "DATABASE_URL is required for question runtime.",
  );

  return {
    async listQuestions(queryInput) {
      const database = getDatabase();
      const conditions = createQuestionConditions(queryInput);
      const rows = await database
        .select({
          id: question.id,
          public_id: question.public_id,
          question_type: question.question_type,
          profession: question.profession,
          level: question.level,
          subject: question.subject,
          stem_rich_text: question.stem_rich_text,
          analysis_rich_text: question.analysis_rich_text,
          standard_answer_rich_text: question.standard_answer_rich_text,
          status: question.status,
          is_locked: question.is_locked,
          locked_at: question.locked_at,
          multi_choice_rule: question.multi_choice_rule,
          scoring_method: question.scoring_method,
          fill_blank_answers: question.fill_blank_answers,
          material_id: question.material_id,
          material_public_id: material.public_id,
          created_at: question.created_at,
          updated_at: question.updated_at,
        })
        .from(question)
        .leftJoin(material, eq(material.id, question.material_id))
        .where(and(...conditions))
        .orderBy(createQuestionOrderBy(queryInput))
        .limit(queryInput.pageSize)
        .offset((queryInput.page - 1) * queryInput.pageSize);
      const [totalRow] = await database
        .select({ value: count() })
        .from(question)
        .where(and(...conditions));

      return {
        rows: await hydrateQuestions(database, rows),
        total: totalRow?.value ?? 0,
      };
    },

    async listAvailableAiPaperSourceQuestions(input) {
      return listAvailableAiPaperSourceQuestions(getDatabase(), input);
    },

    async createQuestion(input, context, options) {
      const database = getDatabase();
      const actorAdminId = await resolveActorAdminId(database, context);

      return database.transaction(async (transaction) => {
        const scopedDatabase = transaction as RuntimeDatabase;
        const materialId = await resolveMaterialId(
          scopedDatabase,
          input.materialPublicId,
        );
        const childBindingIds = await resolveQuestionChildBindingIds(
          scopedDatabase,
          input.knowledgeNodePublicIds,
          input.tagPublicIds,
        );
        const [questionRow] = await scopedDatabase
          .insert(question)
          .values({
            analysis_rich_text: input.analysisRichText,
            created_by_admin_id: actorAdminId,
            difficulty: input.difficulty ?? null,
            level: input.level,
            material_id: materialId,
            multi_choice_rule: input.multiChoiceRule,
            profession: input.profession,
            public_id: `question-${randomUUID()}`,
            question_type: input.questionType,
            scoring_method: input.scoringMethod,
            fill_blank_answers: input.fillBlankAnswers,
            status: options?.initialStatus ?? "available",
            standard_answer_rich_text: input.standardAnswerRichText,
            stem_rich_text: input.stemRichText,
            subject: input.subject,
            updated_by_admin_id: actorAdminId,
          })
          .returning({ id: question.id, public_id: question.public_id });

        if (questionRow === undefined) {
          throw new Error("Question insert did not return a row.");
        }

        await replaceQuestionChildren(
          scopedDatabase,
          questionRow.id,
          input.questionOptions,
          input.scoringPoints,
          childBindingIds,
        );

        const createdQuestion = await findQuestionByPublicId(
          scopedDatabase,
          questionRow.public_id,
        );

        if (createdQuestion === null) {
          throw new Error("Created question could not be loaded.");
        }

        await enqueueKnowledgeRecommendationTask(scopedDatabase, {
          questionId: createdQuestion.id,
          questionUpdatedAt: createdQuestion.updated_at,
          requestedByUserPublicId: null,
        });

        await appendContentMutationAuditLog(
          scopedDatabase,
          context,
          createdQuestion.public_id,
        );

        return createdQuestion;
      });
    },

    async findQuestionByPublicId(publicId) {
      return findQuestionByPublicId(getDatabase(), publicId);
    },
    async findQuestionDetailByPublicId(publicId, queryInput) {
      return findQuestionDetailByPublicId(getDatabase(), publicId, queryInput);
    },

    async updateQuestion(input, context) {
      const database = getDatabase();
      const actorAdminId = await resolveActorAdminId(database, context);

      return database.transaction(async (transaction) => {
        const scopedDatabase = transaction as RuntimeDatabase;
        const existingQuestion = await findQuestionByPublicId(
          scopedDatabase,
          input.publicId,
        );
        if (existingQuestion === null) {
          return null;
        }
        const materialId = await resolveMaterialId(
          scopedDatabase,
          input.materialPublicId,
          existingQuestion.material_public_id,
        );
        const childBindingIds = await resolveQuestionChildBindingIds(
          scopedDatabase,
          input.knowledgeNodePublicIds,
          input.tagPublicIds,
          existingQuestion.knowledge_node_public_ids,
        );
        const [updatedRow] = await scopedDatabase
          .update(question)
          .set({
            analysis_rich_text: input.analysisRichText,
            ...(input.difficulty === undefined
              ? {}
              : { difficulty: input.difficulty }),
            level: input.level,
            material_id: materialId,
            multi_choice_rule: input.multiChoiceRule,
            profession: input.profession,
            question_type: input.questionType,
            scoring_method: input.scoringMethod,
            fill_blank_answers: input.fillBlankAnswers,
            standard_answer_rich_text: input.standardAnswerRichText,
            status: input.status,
            stem_rich_text: input.stemRichText,
            subject: input.subject,
            updated_at: sql`greatest(
              clock_timestamp(),
              ${question.updated_at} + interval '1 millisecond'
            )`,
            updated_by_admin_id: actorAdminId,
          })
          .where(
            and(
              eq(question.public_id, input.publicId),
              sql`date_trunc('milliseconds', ${question.updated_at}) = ${input.expectedUpdatedAt}`,
              eq(question.is_locked, false),
            ),
          )
          .returning({ id: question.id });

        if (updatedRow === undefined) {
          return null;
        }

        const updatedQuestion = await findQuestionByPublicId(
          scopedDatabase,
          input.publicId,
        );

        if (updatedQuestion === null || updatedQuestion.id !== updatedRow.id) {
          throw new Error("Updated question could not be loaded.");
        }

        await replaceQuestionChildren(
          scopedDatabase,
          updatedQuestion.id,
          input.questionOptions,
          input.scoringPoints,
          childBindingIds,
        );

        const reloadedQuestion = await findQuestionByPublicId(
          scopedDatabase,
          input.publicId,
        );

        if (reloadedQuestion === null) {
          throw new Error("Updated question children could not be loaded.");
        }

        await enqueueKnowledgeRecommendationTask(scopedDatabase, {
          questionId: reloadedQuestion.id,
          questionUpdatedAt: reloadedQuestion.updated_at,
          requestedByUserPublicId: null,
        });

        await appendContentMutationAuditLog(
          scopedDatabase,
          context,
          reloadedQuestion.public_id,
        );

        return reloadedQuestion;
      });
    },

    async disableQuestion(publicId, context) {
      const database = getDatabase();
      const actorAdminId = await resolveActorAdminId(database, context);
      return database.transaction(async (transaction) => {
        const scopedDatabase = transaction as RuntimeDatabase;
        const [row] = await scopedDatabase
          .update(question)
          .set({
            status: "disabled",
            updated_at: new Date(),
            updated_by_admin_id: actorAdminId,
          })
          .where(eq(question.public_id, publicId))
          .returning({
            id: question.id,
            public_id: question.public_id,
          });

        if (row === undefined) {
          return null;
        }

        await supersedeKnowledgeRecommendationTasks(scopedDatabase, row.id);
        const disabledQuestion = await findQuestionByPublicId(
          scopedDatabase,
          row.public_id,
        );

        if (disabledQuestion === null) {
          throw new Error("Disabled question could not be loaded.");
        }

        await appendContentMutationAuditLog(
          scopedDatabase,
          context,
          disabledQuestion.public_id,
        );

        return disabledQuestion;
      });
    },

    async copyQuestion(publicId, context) {
      const database = getDatabase();
      const actorAdminId = await resolveActorAdminId(database, context);

      return database.transaction(async (transaction) => {
        const scopedDatabase = transaction as RuntimeDatabase;
        const sourceQuestion = await findQuestionByPublicId(
          scopedDatabase,
          publicId,
        );
        if (sourceQuestion === null) {
          return null;
        }
        const materialId = await resolveMaterialId(
          scopedDatabase,
          sourceQuestion.material_public_id,
          sourceQuestion.material_public_id,
        );
        const childBindingIds = await resolveQuestionChildBindingIds(
          scopedDatabase,
          sourceQuestion.knowledge_node_public_ids,
          sourceQuestion.tag_public_ids,
          sourceQuestion.knowledge_node_public_ids,
        );
        const [questionRow] = await scopedDatabase
          .insert(question)
          .values({
            analysis_rich_text: sourceQuestion.analysis_rich_text,
            created_by_admin_id: actorAdminId,
            difficulty: sourceQuestion.difficulty ?? null,
            is_locked: false,
            level: sourceQuestion.level,
            material_id: materialId,
            multi_choice_rule: sourceQuestion.multi_choice_rule,
            profession: sourceQuestion.profession,
            public_id: `question-${randomUUID()}`,
            question_type: sourceQuestion.question_type,
            scoring_method: sourceQuestion.scoring_method,
            fill_blank_answers: sourceQuestion.fill_blank_answers,
            standard_answer_rich_text: sourceQuestion.standard_answer_rich_text,
            status: "available",
            stem_rich_text: sourceQuestion.stem_rich_text,
            subject: sourceQuestion.subject,
            updated_by_admin_id: actorAdminId,
          })
          .returning({ public_id: question.public_id, id: question.id });

        if (questionRow === undefined) {
          throw new Error("Question copy insert did not return a row.");
        }

        await replaceQuestionChildren(
          scopedDatabase,
          questionRow.id,
          sourceQuestion.question_options.map((questionOptionRow) => ({
            label: questionOptionRow.label,
            contentRichText: questionOptionRow.content_rich_text,
            isCorrect: questionOptionRow.is_correct,
            sortOrder: questionOptionRow.sort_order,
          })),
          sourceQuestion.scoring_points.map((scoringPointRow) => ({
            description: scoringPointRow.description,
            score: scoringPointRow.score,
            sortOrder: scoringPointRow.sort_order,
          })),
          childBindingIds,
        );

        const copiedQuestion = await findQuestionByPublicId(
          scopedDatabase,
          questionRow.public_id,
        );

        if (copiedQuestion === null) {
          throw new Error("Copied question could not be loaded.");
        }

        await enqueueKnowledgeRecommendationTask(scopedDatabase, {
          questionId: copiedQuestion.id,
          questionUpdatedAt: copiedQuestion.updated_at,
          requestedByUserPublicId: null,
        });

        await appendContentMutationAuditLog(
          scopedDatabase,
          context,
          copiedQuestion.public_id,
        );

        return copiedQuestion;
      });
    },
  };
}

type QuestionBaseRow = Omit<
  QuestionAccessRow,
  | "question_options"
  | "scoring_points"
  | "knowledge_node_public_ids"
  | "parent_knowledge_node_public_ids"
  | "ancestor_knowledge_node_public_ids"
  | "tag_public_ids"
>;

function createQuestionBaseSelection() {
  return {
    id: question.id,
    public_id: question.public_id,
    question_type: question.question_type,
    profession: question.profession,
    level: question.level,
    subject: question.subject,
    difficulty: question.difficulty,
    stem_rich_text: question.stem_rich_text,
    analysis_rich_text: question.analysis_rich_text,
    standard_answer_rich_text: question.standard_answer_rich_text,
    status: question.status,
    is_locked: question.is_locked,
    locked_at: question.locked_at,
    multi_choice_rule: question.multi_choice_rule,
    scoring_method: question.scoring_method,
    fill_blank_answers: question.fill_blank_answers,
    material_id: question.material_id,
    material_public_id: material.public_id,
    created_at: question.created_at,
    updated_at: question.updated_at,
  };
}

async function listAvailableAiPaperSourceQuestions(
  database: RuntimeDatabase,
  input: AiPaperSourceQuestionListInput,
): Promise<QuestionAccessRow[]> {
  const questionPublicIds = normalizeOptionalPublicIds(input.questionPublicIds);
  const knowledgeNodePublicIds = normalizeOptionalPublicIds(
    input.knowledgeNodePublicIds,
  );

  if (
    (input.questionPublicIds !== null && questionPublicIds.length === 0) ||
    (input.knowledgeNodePublicIds !== null &&
      knowledgeNodePublicIds.length === 0)
  ) {
    return [];
  }

  const conditions: SQL[] = [
    eq(question.profession, input.profession),
    eq(question.level, input.level),
    eq(question.subject, input.subject),
    eq(question.status, "available"),
  ];

  if (questionPublicIds.length > 0) {
    conditions.push(inArray(question.public_id, questionPublicIds));
  }

  const knowledgeNodeCondition = createQuestionKnowledgeNodePublicIdsCondition(
    knowledgeNodePublicIds,
  );
  if (knowledgeNodeCondition !== null) {
    conditions.push(knowledgeNodeCondition);
  }

  const rows = await database
    .select(createQuestionBaseSelection())
    .from(question)
    .leftJoin(material, eq(material.id, question.material_id))
    .where(and(...conditions))
    .orderBy(desc(question.updated_at), asc(question.public_id));

  return hydrateQuestions(database, rows);
}

function normalizeOptionalPublicIds(
  publicIds: readonly string[] | null,
): string[] {
  return publicIds === null
    ? []
    : [
        ...new Set(
          publicIds
            .map((publicId) => publicId.trim())
            .filter((publicId) => publicId.length > 0),
        ),
      ];
}

function createQuestionConditions(
  queryInput: NormalizedQuestionListInput,
): SQL[] {
  const conditions: SQL[] = [];

  if (queryInput.profession !== null) {
    conditions.push(eq(question.profession, queryInput.profession));
  }

  if (queryInput.level !== null) {
    conditions.push(eq(question.level, queryInput.level));
  }

  if (queryInput.subject !== null) {
    conditions.push(eq(question.subject, queryInput.subject));
  }

  if (queryInput.questionType !== null) {
    conditions.push(eq(question.question_type, queryInput.questionType));
  }

  if (queryInput.status !== null) {
    conditions.push(eq(question.status, queryInput.status));
  }

  if (queryInput.keyword !== null) {
    conditions.push(
      or(
        ilike(question.public_id, `%${queryInput.keyword}%`),
        ilike(question.stem_rich_text, `%${queryInput.keyword}%`),
      )!,
    );
  }

  const knowledgeNodePublicIdCondition =
    createQuestionKnowledgeNodePublicIdCondition(
      queryInput.knowledgeNodePublicId,
    );
  const tagPublicIdCondition = createQuestionTagPublicIdCondition(
    queryInput.tagPublicId,
  );
  const materialPublicIdCondition = createQuestionMaterialPublicIdCondition(
    queryInput.materialPublicId,
  );

  if (knowledgeNodePublicIdCondition !== null) {
    conditions.push(knowledgeNodePublicIdCondition);
  }

  if (tagPublicIdCondition !== null) {
    conditions.push(tagPublicIdCondition);
  }

  if (materialPublicIdCondition !== null) {
    conditions.push(materialPublicIdCondition);
  }

  return conditions;
}

export function createQuestionMaterialPublicIdCondition(
  publicId: string | null | undefined,
): SQL | null {
  return publicId === null || publicId === undefined
    ? null
    : sql`${question.material_id} = (
        select ${material.id}
        from ${material}
        where ${material.public_id} = ${publicId}
      )`;
}

export function createQuestionKnowledgeNodePublicIdCondition(
  publicId: string | null,
): SQL | null {
  return publicId === null
    ? null
    : sql`exists (
        select 1
        from ${questionKnowledgeNode}
        inner join ${knowledgeNode}
          on ${knowledgeNode.id} = ${questionKnowledgeNode.knowledge_node_id}
        where ${questionKnowledgeNode.question_id} = ${question.id}
          and ${knowledgeNode.public_id} = ${publicId}
      )`;
}

export function createQuestionKnowledgeNodePublicIdsCondition(
  publicIds: readonly string[],
): SQL | null {
  return publicIds.length === 0
    ? null
    : sql`exists (
        select 1
        from ${questionKnowledgeNode}
        inner join ${knowledgeNode}
          on ${knowledgeNode.id} = ${questionKnowledgeNode.knowledge_node_id}
        where ${questionKnowledgeNode.question_id} = ${question.id}
          and ${inArray(knowledgeNode.public_id, [...publicIds])}
      )`;
}

export function createQuestionTagPublicIdCondition(
  publicId: string | null,
): SQL | null {
  return publicId === null
    ? null
    : sql`exists (
        select 1
        from ${questionTag}
        inner join ${tag}
          on ${tag.id} = ${questionTag.tag_id}
        where ${questionTag.question_id} = ${question.id}
          and ${tag.public_id} = ${publicId}
      )`;
}

function createQuestionOrderBy(queryInput: NormalizedQuestionListInput): SQL {
  if (queryInput.sortBy === "updatedAt") {
    return queryInput.sortOrder === "asc"
      ? asc(question.updated_at)
      : desc(question.updated_at);
  }

  return queryInput.sortOrder === "asc"
    ? asc(question.created_at)
    : desc(question.created_at);
}

async function findQuestionByPublicId(
  database: RuntimeDatabase,
  publicId: string,
): Promise<QuestionAccessRow | null> {
  const [row] = await database
    .select({
      id: question.id,
      public_id: question.public_id,
      question_type: question.question_type,
      profession: question.profession,
      level: question.level,
      subject: question.subject,
      stem_rich_text: question.stem_rich_text,
      analysis_rich_text: question.analysis_rich_text,
      standard_answer_rich_text: question.standard_answer_rich_text,
      status: question.status,
      is_locked: question.is_locked,
      locked_at: question.locked_at,
      multi_choice_rule: question.multi_choice_rule,
      scoring_method: question.scoring_method,
      fill_blank_answers: question.fill_blank_answers,
      material_id: question.material_id,
      material_public_id: material.public_id,
      created_at: question.created_at,
      updated_at: question.updated_at,
    })
    .from(question)
    .leftJoin(material, eq(material.id, question.material_id))
    .where(eq(question.public_id, publicId))
    .limit(1);

  if (row === undefined) {
    return null;
  }

  const [hydratedQuestion] = await hydrateQuestions(database, [row]);

  return hydratedQuestion ?? null;
}

async function findQuestionDetailByPublicId(
  database: RuntimeDatabase,
  publicId: string,
  queryInput: NormalizedQuestionDetailInput,
): Promise<QuestionDetailAccessRow | null> {
  const questionRow = await findQuestionByPublicId(database, publicId);

  if (questionRow === null) {
    return null;
  }

  const [
    materialDetail,
    knowledgeNodes,
    tags,
    paperReferenceTotals,
    paperReferences,
  ] = await Promise.all([
    questionRow.material_id === null
      ? Promise.resolve([])
      : database
          .select({
            public_id: material.public_id,
            title: material.title,
            status: material.status,
          })
          .from(material)
          .where(eq(material.id, questionRow.material_id))
          .limit(1),
    database
      .select({
        public_id: knowledgeNode.public_id,
        name: knowledgeNode.name,
        path_name: knowledgeNode.path_name,
        kn_status: knowledgeNode.kn_status,
      })
      .from(questionKnowledgeNode)
      .innerJoin(
        knowledgeNode,
        eq(knowledgeNode.id, questionKnowledgeNode.knowledge_node_id),
      )
      .where(eq(questionKnowledgeNode.question_id, questionRow.id))
      .orderBy(asc(knowledgeNode.path_name), asc(knowledgeNode.public_id)),
    database
      .select({ public_id: tag.public_id, name: tag.name })
      .from(questionTag)
      .innerJoin(tag, eq(tag.id, questionTag.tag_id))
      .where(eq(questionTag.question_id, questionRow.id))
      .orderBy(asc(tag.name), asc(tag.public_id)),
    database
      .select({
        total: countDistinct(paper.id),
        locking_count: countDistinct(
          sql`case when ${paper.paper_status} in ('published', 'archived') then ${paper.id} end`,
        ),
      })
      .from(paperQuestion)
      .innerJoin(paper, eq(paper.id, paperQuestion.paper_id))
      .where(eq(paperQuestion.question_id, questionRow.id)),
    database
      .select({
        paper_public_id: paper.public_id,
        name: paper.name,
        paper_status: paper.paper_status,
        updated_at: paper.updated_at,
      })
      .from(paperQuestion)
      .innerJoin(paper, eq(paper.id, paperQuestion.paper_id))
      .where(eq(paperQuestion.question_id, questionRow.id))
      .groupBy(
        paper.id,
        paper.public_id,
        paper.name,
        paper.paper_status,
        paper.updated_at,
      )
      .orderBy(desc(paper.updated_at), asc(paper.public_id))
      .limit(queryInput.pageSize)
      .offset((queryInput.page - 1) * queryInput.pageSize),
  ]);

  const totals = paperReferenceTotals[0];

  return {
    ...questionRow,
    material_detail: materialDetail[0] ?? null,
    knowledge_nodes: knowledgeNodes,
    tags,
    paper_references: paperReferences,
    paper_reference_total: Number(totals?.total ?? 0),
    locking_paper_count: Number(totals?.locking_count ?? 0),
  };
}

async function hydrateQuestions(
  database: RuntimeDatabase,
  rows: QuestionBaseRow[],
): Promise<QuestionAccessRow[]> {
  const questionIds = rows.map((row) => row.id);

  if (questionIds.length === 0) {
    return [];
  }

  const optionRows = await database
    .select()
    .from(questionOption)
    .where(inArray(questionOption.question_id, questionIds))
    .orderBy(asc(questionOption.sort_order));
  const scoringPointRows = await database
    .select()
    .from(scoringPoint)
    .where(inArray(scoringPoint.question_id, questionIds))
    .orderBy(asc(scoringPoint.sort_order));
  const knowledgeMetadataByQuestionId = await loadQuestionKnowledgeMetadata(
    database,
    questionIds,
  );
  const tagBindingRows = await database
    .select({
      question_id: questionTag.question_id,
      public_id: tag.public_id,
    })
    .from(questionTag)
    .innerJoin(tag, eq(tag.id, questionTag.tag_id))
    .where(inArray(questionTag.question_id, questionIds))
    .orderBy(asc(tag.public_id));

  return rows.map((row) => {
    const knowledgeMetadata = knowledgeMetadataByQuestionId.get(row.id) ?? {
      knowledgeNodePublicIds: [],
      parentKnowledgeNodePublicIds: [],
      ancestorKnowledgeNodePublicIds: [],
    };

    return {
      ...row,
      question_options: optionRows.filter(
        (questionOptionRow) => questionOptionRow.question_id === row.id,
      ),
      scoring_points: scoringPointRows.filter(
        (scoringPointRow) => scoringPointRow.question_id === row.id,
      ),
      knowledge_node_public_ids: knowledgeMetadata.knowledgeNodePublicIds,
      parent_knowledge_node_public_ids:
        knowledgeMetadata.parentKnowledgeNodePublicIds,
      ancestor_knowledge_node_public_ids:
        knowledgeMetadata.ancestorKnowledgeNodePublicIds,
      tag_public_ids: tagBindingRows
        .filter((bindingRow) => bindingRow.question_id === row.id)
        .map((bindingRow) => bindingRow.public_id),
    };
  });
}

export async function loadQuestionKnowledgeMetadata(
  database: RuntimeDatabase,
  questionIds: readonly number[],
): Promise<Map<number, QuestionKnowledgeMetadata>> {
  if (questionIds.length === 0) {
    return new Map();
  }

  const directRows = await database
    .select({
      question_id: questionKnowledgeNode.question_id,
      question_profession: question.profession,
      id: knowledgeNode.id,
      public_id: knowledgeNode.public_id,
      knowledge_base_id: knowledgeNode.knowledge_base_id,
      parent_knowledge_node_id: knowledgeNode.parent_knowledge_node_id,
      profession: knowledgeNode.profession,
    })
    .from(questionKnowledgeNode)
    .innerJoin(question, eq(question.id, questionKnowledgeNode.question_id))
    .innerJoin(
      knowledgeNode,
      eq(knowledgeNode.id, questionKnowledgeNode.knowledge_node_id),
    )
    .where(inArray(questionKnowledgeNode.question_id, questionIds))
    .orderBy(asc(knowledgeNode.public_id));
  const knownIds = new Set(directRows.map((row) => row.id));
  const ancestorRows: QuestionKnowledgeHierarchyRow[] = [];
  let pendingParentIds = [
    ...new Set(
      directRows.flatMap((row) =>
        row.parent_knowledge_node_id === null ||
        knownIds.has(row.parent_knowledge_node_id)
          ? []
          : [row.parent_knowledge_node_id],
      ),
    ),
  ];

  while (pendingParentIds.length > 0) {
    const rows = await database
      .select({
        id: knowledgeNode.id,
        public_id: knowledgeNode.public_id,
        knowledge_base_id: knowledgeNode.knowledge_base_id,
        parent_knowledge_node_id: knowledgeNode.parent_knowledge_node_id,
        profession: knowledgeNode.profession,
      })
      .from(knowledgeNode)
      .where(inArray(knowledgeNode.id, pendingParentIds))
      .orderBy(asc(knowledgeNode.public_id));

    if (rows.length === 0) {
      break;
    }

    for (const row of rows) {
      if (!knownIds.has(row.id)) {
        knownIds.add(row.id);
        ancestorRows.push(row);
      }
    }

    pendingParentIds = [
      ...new Set(
        rows.flatMap((row) =>
          row.parent_knowledge_node_id === null ||
          knownIds.has(row.parent_knowledge_node_id)
            ? []
            : [row.parent_knowledge_node_id],
        ),
      ),
    ];
  }

  return buildQuestionKnowledgeMetadata(directRows, ancestorRows);
}

type QuestionChildBindingIds = {
  knowledgeNodeIds: number[];
  tagIds: number[];
};

async function replaceQuestionChildren(
  database: RuntimeDatabase,
  questionId: number,
  questionOptions: NormalizedCreateQuestionInput["questionOptions"],
  scoringPoints: NormalizedCreateQuestionInput["scoringPoints"],
  childBindingIds: QuestionChildBindingIds,
): Promise<void> {
  await database
    .delete(questionOption)
    .where(eq(questionOption.question_id, questionId));
  await database
    .delete(scoringPoint)
    .where(eq(scoringPoint.question_id, questionId));
  await database
    .delete(questionKnowledgeNode)
    .where(eq(questionKnowledgeNode.question_id, questionId));
  await database
    .delete(questionTag)
    .where(eq(questionTag.question_id, questionId));

  if (questionOptions.length > 0) {
    await database.insert(questionOption).values(
      questionOptions.map((questionOptionInput) => ({
        content_rich_text: questionOptionInput.contentRichText,
        is_correct: questionOptionInput.isCorrect,
        label: questionOptionInput.label,
        question_id: questionId,
        sort_order: questionOptionInput.sortOrder,
      })),
    );
  }

  if (scoringPoints.length > 0) {
    await database.insert(scoringPoint).values(
      scoringPoints.map((point) => ({
        description: point.description,
        question_id: questionId,
        score: point.score,
        sort_order: point.sortOrder,
      })),
    );
  }

  if (childBindingIds.knowledgeNodeIds.length > 0) {
    await database.insert(questionKnowledgeNode).values(
      childBindingIds.knowledgeNodeIds.map((knowledgeNodeId) => ({
        knowledge_node_id: knowledgeNodeId,
        question_id: questionId,
      })),
    );
  }

  if (childBindingIds.tagIds.length > 0) {
    await database.insert(questionTag).values(
      childBindingIds.tagIds.map((tagId) => ({
        question_id: questionId,
        tag_id: tagId,
      })),
    );
  }
}

async function resolveQuestionChildBindingIds(
  database: RuntimeDatabase,
  knowledgeNodePublicIds: string[],
  tagPublicIds: string[],
  preservedKnowledgeNodePublicIds: readonly string[] = [],
): Promise<QuestionChildBindingIds> {
  const knowledgeNodeIds = await resolveKnowledgeNodeIds(
    database,
    knowledgeNodePublicIds,
    preservedKnowledgeNodePublicIds,
  );
  const tagIds = await resolveTagIds(database, tagPublicIds);

  return { knowledgeNodeIds, tagIds };
}

async function resolveMaterialId(
  database: RuntimeDatabase,
  publicId: string | null,
  preservedPublicId: string | null = null,
): Promise<number | null> {
  if (publicId === null) {
    return null;
  }

  const [row] = await database
    .select({
      id: material.id,
      public_id: material.public_id,
      status: material.status,
    })
    .from(material)
    .where(eq(material.public_id, publicId))
    .limit(1)
    .for("share");

  return requireEligibleQuestionMaterialId({
    preservedPublicId,
    requestedPublicId: publicId,
    row,
  });
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

async function resolveKnowledgeNodeIds(
  database: RuntimeDatabase,
  publicIds: string[],
  preservedPublicIds: readonly string[] = [],
): Promise<number[]> {
  if (publicIds.length === 0) {
    return [];
  }

  const uniquePublicIds = Array.from(new Set(publicIds));
  const rows = await database
    .select({
      id: knowledgeNode.id,
      public_id: knowledgeNode.public_id,
      kn_status: knowledgeNode.kn_status,
      is_recommendable: knowledgeNode.is_recommendable,
    })
    .from(knowledgeNode)
    .where(inArray(knowledgeNode.public_id, uniquePublicIds))
    .for("share");

  return requireEligibleQuestionKnowledgeNodeIds({
    preservedPublicIds,
    requestedPublicIds: uniquePublicIds,
    rows,
  });
}

async function resolveTagIds(
  database: RuntimeDatabase,
  publicIds: string[],
): Promise<number[]> {
  if (publicIds.length === 0) {
    return [];
  }

  const uniquePublicIds = Array.from(new Set(publicIds));
  const rows = await database
    .select({ id: tag.id, public_id: tag.public_id })
    .from(tag)
    .where(inArray(tag.public_id, uniquePublicIds))
    .for("share");

  assertAllBindingPublicIdsResolved(
    "tag",
    uniquePublicIds,
    rows.map((row) => row.public_id),
  );

  return uniquePublicIds.flatMap((publicId) =>
    rows.filter((row) => row.public_id === publicId).map((row) => row.id),
  );
}

function assertAllBindingPublicIdsResolved(
  resourceName: "knowledge_node" | "tag",
  expectedPublicIds: string[],
  resolvedPublicIds: string[],
): void {
  if (resolvedPublicIds.length === expectedPublicIds.length) {
    return;
  }

  throw new QuestionBindingEligibilityError(resourceName);
}

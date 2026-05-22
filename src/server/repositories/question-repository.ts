import { randomUUID } from "node:crypto";

import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  type SQL,
} from "drizzle-orm";

import {
  admin,
  material,
  question,
  questionOption,
  scoringPoint,
} from "@/db/schema";
import type {
  MultiChoiceRule,
  Profession,
  QuestionStatus,
  QuestionType,
  ScoringMethod,
  Subject,
} from "../models/paper";
import type {
  NormalizedCreateQuestionInput,
  NormalizedQuestionListInput,
  NormalizedUpdateQuestionInput,
} from "../validators/question";
import {
  createLazyRuntimeDatabaseGetter,
  type RuntimeDatabase,
  type RuntimeDatabaseOptions,
} from "./runtime-database";

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
  stem_rich_text: string;
  analysis_rich_text: string;
  standard_answer_rich_text: string;
  status: QuestionStatus;
  is_locked: boolean;
  locked_at: Date | null;
  multi_choice_rule: MultiChoiceRule;
  scoring_method: ScoringMethod;
  material_id: number | null;
  material_public_id: string | null;
  question_options: QuestionOptionAccessRow[];
  scoring_points: ScoringPointAccessRow[];
  created_at: Date;
  updated_at: Date;
};

export type QuestionListResult = {
  rows: QuestionAccessRow[];
  total: number;
};

export type UpdateQuestionInput = NormalizedUpdateQuestionInput & {
  publicId: string;
};

export type ContentMutationContext = {
  actorPublicId: string;
};

export type QuestionRepository = {
  listQuestions(
    query: NormalizedQuestionListInput,
  ): Promise<QuestionListResult>;
  createQuestion(
    input: NormalizedCreateQuestionInput,
    context?: ContentMutationContext,
  ): Promise<QuestionAccessRow>;
  findQuestionByPublicId(publicId: string): Promise<QuestionAccessRow | null>;
  updateQuestion(
    input: UpdateQuestionInput,
    context?: ContentMutationContext,
  ): Promise<QuestionAccessRow>;
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
): QuestionRepository {
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

    async createQuestion(input, context) {
      const database = getDatabase();
      const actorAdminId = await resolveActorAdminId(database, context);
      const materialId = await resolveMaterialId(
        database,
        input.materialPublicId,
      );

      return database.transaction(async (transaction) => {
        const [questionRow] = await transaction
          .insert(question)
          .values({
            analysis_rich_text: input.analysisRichText,
            created_by_admin_id: actorAdminId,
            level: input.level,
            material_id: materialId,
            multi_choice_rule: input.multiChoiceRule,
            profession: input.profession,
            public_id: `question-${randomUUID()}`,
            question_type: input.questionType,
            scoring_method: input.scoringMethod,
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
          transaction as RuntimeDatabase,
          questionRow.id,
          input.questionOptions,
          input.scoringPoints,
        );

        const createdQuestion = await findQuestionByPublicId(
          transaction as RuntimeDatabase,
          questionRow.public_id,
        );

        if (createdQuestion === null) {
          throw new Error("Created question could not be loaded.");
        }

        return createdQuestion;
      });
    },

    async findQuestionByPublicId(publicId) {
      return findQuestionByPublicId(getDatabase(), publicId);
    },

    async updateQuestion(input, context) {
      const database = getDatabase();
      const actorAdminId = await resolveActorAdminId(database, context);
      const materialId = await resolveMaterialId(
        database,
        input.materialPublicId,
      );

      return database.transaction(async (transaction) => {
        await transaction
          .update(question)
          .set({
            analysis_rich_text: input.analysisRichText,
            level: input.level,
            material_id: materialId,
            multi_choice_rule: input.multiChoiceRule,
            profession: input.profession,
            question_type: input.questionType,
            scoring_method: input.scoringMethod,
            standard_answer_rich_text: input.standardAnswerRichText,
            status: input.status,
            stem_rich_text: input.stemRichText,
            subject: input.subject,
            updated_at: new Date(),
            updated_by_admin_id: actorAdminId,
          })
          .where(eq(question.public_id, input.publicId));

        const updatedQuestion = await findQuestionByPublicId(
          transaction as RuntimeDatabase,
          input.publicId,
        );

        if (updatedQuestion === null) {
          throw new Error("Updated question could not be loaded.");
        }

        await replaceQuestionChildren(
          transaction as RuntimeDatabase,
          updatedQuestion.id,
          input.questionOptions,
          input.scoringPoints,
        );

        const reloadedQuestion = await findQuestionByPublicId(
          transaction as RuntimeDatabase,
          input.publicId,
        );

        if (reloadedQuestion === null) {
          throw new Error("Updated question children could not be loaded.");
        }

        return reloadedQuestion;
      });
    },

    async disableQuestion(publicId, context) {
      const database = getDatabase();
      const actorAdminId = await resolveActorAdminId(database, context);
      const [row] = await database
        .update(question)
        .set({
          status: "disabled",
          updated_at: new Date(),
          updated_by_admin_id: actorAdminId,
        })
        .where(eq(question.public_id, publicId))
        .returning({ public_id: question.public_id });

      return row === undefined
        ? null
        : findQuestionByPublicId(database, row.public_id);
    },

    async copyQuestion(publicId, context) {
      const database = getDatabase();
      const actorAdminId = await resolveActorAdminId(database, context);
      const sourceQuestion = await findQuestionByPublicId(database, publicId);

      if (sourceQuestion === null) {
        return null;
      }

      return database.transaction(async (transaction) => {
        const [questionRow] = await transaction
          .insert(question)
          .values({
            analysis_rich_text: sourceQuestion.analysis_rich_text,
            created_by_admin_id: actorAdminId,
            is_locked: false,
            level: sourceQuestion.level,
            material_id: sourceQuestion.material_id,
            multi_choice_rule: sourceQuestion.multi_choice_rule,
            profession: sourceQuestion.profession,
            public_id: `question-${randomUUID()}`,
            question_type: sourceQuestion.question_type,
            scoring_method: sourceQuestion.scoring_method,
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
          transaction as RuntimeDatabase,
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
        );

        const copiedQuestion = await findQuestionByPublicId(
          transaction as RuntimeDatabase,
          questionRow.public_id,
        );

        if (copiedQuestion === null) {
          throw new Error("Copied question could not be loaded.");
        }

        return copiedQuestion;
      });
    },
  };
}

type QuestionBaseRow = Omit<
  QuestionAccessRow,
  "question_options" | "scoring_points"
>;

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
    conditions.push(ilike(question.stem_rich_text, `%${queryInput.keyword}%`));
  }

  return conditions;
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

  return rows.map((row) => ({
    ...row,
    question_options: optionRows.filter(
      (questionOptionRow) => questionOptionRow.question_id === row.id,
    ),
    scoring_points: scoringPointRows.filter(
      (scoringPointRow) => scoringPointRow.question_id === row.id,
    ),
  }));
}

async function replaceQuestionChildren(
  database: RuntimeDatabase,
  questionId: number,
  questionOptions: NormalizedCreateQuestionInput["questionOptions"],
  scoringPoints: NormalizedCreateQuestionInput["scoringPoints"],
): Promise<void> {
  await database
    .delete(questionOption)
    .where(eq(questionOption.question_id, questionId));
  await database
    .delete(scoringPoint)
    .where(eq(scoringPoint.question_id, questionId));

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
}

async function resolveMaterialId(
  database: RuntimeDatabase,
  publicId: string | null,
): Promise<number | null> {
  if (publicId === null) {
    return null;
  }

  const [row] = await database
    .select({ id: material.id })
    .from(material)
    .where(eq(material.public_id, publicId))
    .limit(1);

  return row?.id ?? null;
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

import { randomUUID } from "node:crypto";

import { and, asc, count, desc, eq, inArray, type SQL } from "drizzle-orm";

import {
  admin,
  material,
  mockExam,
  paper,
  paperQuestion,
  paperScoringPoint,
  paperSection,
  practice,
  question,
  questionGroup,
  questionOption,
  scoringPoint,
} from "@/db/schema";
import type {
  MaterialSnapshotDto,
  QuestionSnapshotDto,
} from "../contracts/paper-draft-contract";
import type {
  MultiChoiceRule,
  PaperStatus,
  PaperType,
  Profession,
  QuestionStatus,
  QuestionType,
  ScoringMethod,
  Subject,
} from "../models/paper";
import type {
  NormalizedAddPaperQuestionInput,
  NormalizedCreatePaperInput,
  NormalizedPaperListInput,
  NormalizedUpdatePaperInput,
  NormalizedUpdatePaperQuestionInput,
} from "../validators/paper-draft";
import type { ContentMutationContext } from "./question-repository";
import {
  createLazyRuntimeDatabaseGetter,
  type RuntimeDatabase,
  type RuntimeDatabaseOptions,
} from "./runtime-database";

export type PaperScoringPointAccessRow = {
  source_scoring_point_id: number | null;
  description: string;
  score: string;
  sort_order: number;
};

export type PaperQuestionAccessRow = {
  id: number;
  public_id: string;
  source_question_public_id: string;
  paper_section_id: number;
  paper_section_sort_order?: number;
  question_group_id: number | null;
  question_group_sort_order?: number | null;
  question_snapshot: QuestionSnapshotDto;
  material_snapshot: MaterialSnapshotDto | null;
  score: string | null;
  sort_order: number;
  scoring_points: PaperScoringPointAccessRow[];
  created_at: Date;
  updated_at: Date;
};

export type PaperSectionAccessRow = {
  id: number;
  title: string;
  description: string | null;
  sort_order: number;
  total_score: string;
  paper_questions: PaperQuestionAccessRow[];
};

export type QuestionGroupAccessRow = {
  id: number;
  paper_section_id: number;
  material_public_id: string;
  material_snapshot: MaterialSnapshotDto;
  title: string;
  sort_order: number;
};

export type PaperDraftAccessRow = {
  id: number;
  public_id: string;
  name: string;
  profession: Profession;
  level: number;
  subject: Subject;
  paper_status: PaperStatus;
  paper_type: PaperType | null;
  year: number | null;
  source: string | null;
  duration_minute: number | null;
  total_score: string | null;
  published_at: Date | null;
  archived_at: Date | null;
  paper_sections: PaperSectionAccessRow[];
  question_groups: QuestionGroupAccessRow[];
  created_at: Date;
  updated_at: Date;
};

export type PaperDraftListResult = {
  rows: PaperDraftAccessRow[];
  total: number;
};

export type UpdatePaperInput = NormalizedUpdatePaperInput & {
  publicId: string;
};

export type AddPaperQuestionInput = NormalizedAddPaperQuestionInput & {
  paperPublicId: string;
};

export type UpdatePaperQuestionInput = NormalizedUpdatePaperQuestionInput & {
  paperPublicId: string;
  paperQuestionPublicId: string;
};

export type RemovePaperQuestionInput = {
  paperPublicId: string;
  paperQuestionPublicId: string;
};

export type PublishPaperInput = {
  paperPublicId: string;
  sourceQuestionPublicIds: string[];
  materialPublicIds: string[];
};

export type ArchivePaperInput = {
  paperPublicId: string;
};

export type DeletePaperInput = {
  paperPublicId: string;
};

export type CopyPaperInput = {
  sourcePaper: PaperDraftAccessRow;
};

export type PaperDraftRepository = {
  listPapers(query: NormalizedPaperListInput): Promise<PaperDraftListResult>;
  createPaper(
    input: NormalizedCreatePaperInput,
    context?: ContentMutationContext,
  ): Promise<PaperDraftAccessRow>;
  findPaperByPublicId(publicId: string): Promise<PaperDraftAccessRow | null>;
  updatePaper(
    input: UpdatePaperInput,
    context?: ContentMutationContext,
  ): Promise<PaperDraftAccessRow>;
  addQuestionToDraftPaper(
    input: AddPaperQuestionInput,
  ): Promise<PaperQuestionAccessRow | null>;
  updatePaperQuestion(
    input: UpdatePaperQuestionInput,
  ): Promise<PaperQuestionAccessRow | null>;
  removePaperQuestion(
    input: RemovePaperQuestionInput,
  ): Promise<PaperDraftAccessRow | null>;
  publishPaper(
    input: PublishPaperInput,
    context?: ContentMutationContext,
  ): Promise<PaperDraftAccessRow | null>;
  archivePaper(
    input: ArchivePaperInput,
    context?: ContentMutationContext,
  ): Promise<PaperDraftAccessRow | null>;
  deletePaper(input: DeletePaperInput): Promise<boolean>;
  copyPaper(
    input: CopyPaperInput,
    context?: ContentMutationContext,
  ): Promise<PaperDraftAccessRow | null>;
};

type PaperBaseRow = Omit<
  PaperDraftAccessRow,
  "paper_sections" | "question_groups"
>;

type SourceQuestionSnapshotRow = {
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
  multi_choice_rule: MultiChoiceRule;
  scoring_method: ScoringMethod;
  material_id: number | null;
  material_public_id: string | null;
  material_title: string | null;
  material_content_rich_text: string | null;
  material_profession: Profession | null;
  material_level: number | null;
  material_subject: Subject | null;
};

export function createPostgresPaperDraftRepository(
  options: RuntimeDatabaseOptions = {},
): PaperDraftRepository {
  const getDatabase = createLazyRuntimeDatabaseGetter(
    options,
    "DATABASE_URL is required for paper runtime.",
  );

  return {
    async listPapers(queryInput) {
      const database = getDatabase();
      const conditions = createPaperConditions(queryInput);
      const rows = await database
        .select()
        .from(paper)
        .where(and(...conditions))
        .orderBy(createPaperOrderBy(queryInput))
        .limit(queryInput.pageSize)
        .offset((queryInput.page - 1) * queryInput.pageSize);
      const [totalRow] = await database
        .select({ value: count() })
        .from(paper)
        .where(and(...conditions));

      return {
        rows: await hydratePapers(database, rows),
        total: totalRow?.value ?? 0,
      };
    },

    async createPaper(input, context) {
      const database = getDatabase();
      const actorAdminId = await resolveActorAdminId(database, context);
      const [row] = await database
        .insert(paper)
        .values({
          created_by_admin_id: actorAdminId,
          duration_minute: input.durationMinute,
          level: input.level,
          name: input.name,
          paper_type: input.paperType,
          profession: input.profession,
          public_id: `paper-${randomUUID()}`,
          source: input.source,
          subject: input.subject,
          total_score: input.totalScore,
          updated_by_admin_id: actorAdminId,
          year: input.year,
        })
        .returning({ public_id: paper.public_id });

      if (row === undefined) {
        throw new Error("Paper insert did not return a row.");
      }

      const createdPaper = await findPaperByPublicId(database, row.public_id);

      if (createdPaper === null) {
        throw new Error("Created paper could not be loaded.");
      }

      return createdPaper;
    },

    async findPaperByPublicId(publicId) {
      return findPaperByPublicId(getDatabase(), publicId);
    },

    async updatePaper(input, context) {
      const database = getDatabase();
      const actorAdminId = await resolveActorAdminId(database, context);
      const [row] = await database
        .update(paper)
        .set({
          duration_minute: input.durationMinute,
          level: input.level,
          name: input.name,
          paper_type: input.paperType,
          profession: input.profession,
          source: input.source,
          subject: input.subject,
          total_score: input.totalScore,
          updated_at: new Date(),
          updated_by_admin_id: actorAdminId,
          year: input.year,
        })
        .where(eq(paper.public_id, input.publicId))
        .returning({ public_id: paper.public_id });

      if (row === undefined) {
        throw new Error("Updated paper could not be loaded.");
      }

      const updatedPaper = await findPaperByPublicId(database, row.public_id);

      if (updatedPaper === null) {
        throw new Error("Updated paper could not be loaded.");
      }

      return updatedPaper;
    },

    async addQuestionToDraftPaper(input) {
      const database = getDatabase();
      const paperRow = await findPaperBaseByPublicId(
        database,
        input.paperPublicId,
      );
      const sourceQuestion = await findSourceQuestionByPublicId(
        database,
        input.questionPublicId,
      );

      if (
        paperRow === null ||
        sourceQuestion === null ||
        sourceQuestion.status !== "available" ||
        sourceQuestion.profession !== paperRow.profession ||
        sourceQuestion.level !== paperRow.level ||
        sourceQuestion.subject !== paperRow.subject
      ) {
        return null;
      }

      const questionSnapshot = await buildQuestionSnapshot(
        database,
        sourceQuestion,
      );
      const materialSnapshot = buildMaterialSnapshot(sourceQuestion);

      return database.transaction(async (transaction) => {
        const paperSectionId = await upsertPaperSection(
          transaction as RuntimeDatabase,
          paperRow.id,
          input.paperSection,
        );
        const questionGroupId =
          input.questionGroup === null
            ? null
            : await upsertQuestionGroup(
                transaction as RuntimeDatabase,
                paperRow.id,
                paperSectionId,
                input.questionGroup,
              );

        if (questionGroupId === undefined) {
          return null;
        }

        const [paperQuestionRow] = await transaction
          .insert(paperQuestion)
          .values({
            material_snapshot: materialSnapshot,
            paper_id: paperRow.id,
            paper_section_id: paperSectionId,
            public_id: `paper-question-${randomUUID()}`,
            question_group_id: questionGroupId,
            question_id: sourceQuestion.id,
            question_snapshot: questionSnapshot,
            score: input.score,
            sort_order: input.sortOrder,
          })
          .returning({ public_id: paperQuestion.public_id });

        if (paperQuestionRow === undefined) {
          throw new Error("Paper question insert did not return a row.");
        }

        const sourceScoringPoints = await transaction
          .select()
          .from(scoringPoint)
          .where(eq(scoringPoint.question_id, sourceQuestion.id))
          .orderBy(asc(scoringPoint.sort_order));

        await copySourceScoringPoints(
          transaction as RuntimeDatabase,
          paperQuestionRow.public_id,
          sourceScoringPoints.map((sourceScoringPoint) => ({
            description: sourceScoringPoint.description,
            score: sourceScoringPoint.score,
            sortOrder: sourceScoringPoint.sort_order,
            sourceScoringPointId: sourceScoringPoint.id,
          })),
        );
        await updatePaperSectionTotalScore(
          transaction as RuntimeDatabase,
          paperSectionId,
        );

        return findPaperQuestionByPublicId(
          transaction as RuntimeDatabase,
          paperQuestionRow.public_id,
        );
      });
    },

    async updatePaperQuestion(input) {
      const database = getDatabase();
      const existingPaperQuestion = await findPaperQuestionByPaperPublicIds(
        database,
        input.paperPublicId,
        input.paperQuestionPublicId,
      );

      if (existingPaperQuestion === null) {
        return null;
      }

      return database.transaction(async (transaction) => {
        await transaction
          .update(paperQuestion)
          .set({
            score: input.score,
            sort_order: input.sortOrder,
            updated_at: new Date(),
          })
          .where(eq(paperQuestion.public_id, input.paperQuestionPublicId));
        await updatePaperSectionTotalScore(
          transaction as RuntimeDatabase,
          existingPaperQuestion.paper_section_id,
        );
        await transaction
          .delete(paperScoringPoint)
          .where(
            eq(paperScoringPoint.paper_question_id, existingPaperQuestion.id),
          );

        if (input.scoringPoints.length > 0) {
          await transaction.insert(paperScoringPoint).values(
            input.scoringPoints.map((scoringPointInput) => ({
              description: scoringPointInput.description,
              paper_question_id: existingPaperQuestion.id,
              score: scoringPointInput.score,
              sort_order: scoringPointInput.sortOrder,
              source_scoring_point_id: null,
            })),
          );
        }

        return findPaperQuestionByPublicId(
          transaction as RuntimeDatabase,
          input.paperQuestionPublicId,
        );
      });
    },

    async removePaperQuestion(input) {
      const database = getDatabase();
      const existingPaperQuestion = await findPaperQuestionByPaperPublicIds(
        database,
        input.paperPublicId,
        input.paperQuestionPublicId,
      );

      if (existingPaperQuestion === null) {
        return null;
      }

      await database
        .delete(paperQuestion)
        .where(eq(paperQuestion.id, existingPaperQuestion.id));
      await updatePaperSectionTotalScore(
        database,
        existingPaperQuestion.paper_section_id,
      );

      return findPaperByPublicId(database, input.paperPublicId);
    },

    async publishPaper(input, context) {
      const database = getDatabase();
      const actorAdminId = await resolveActorAdminId(database, context);

      return database.transaction(async (transaction) => {
        await transaction
          .update(question)
          .set({
            is_locked: true,
            locked_at: new Date(),
            updated_at: new Date(),
          })
          .where(inArray(question.public_id, input.sourceQuestionPublicIds));

        if (input.materialPublicIds.length > 0) {
          await transaction
            .update(material)
            .set({
              is_locked: true,
              locked_at: new Date(),
              updated_at: new Date(),
            })
            .where(inArray(material.public_id, input.materialPublicIds));
        }

        const [row] = await transaction
          .update(paper)
          .set({
            archived_at: null,
            paper_status: "published",
            published_at: new Date(),
            updated_at: new Date(),
            updated_by_admin_id: actorAdminId,
          })
          .where(eq(paper.public_id, input.paperPublicId))
          .returning({ public_id: paper.public_id });

        if (row === undefined) {
          return null;
        }

        return findPaperByPublicId(
          transaction as RuntimeDatabase,
          row.public_id,
        );
      });
    },

    async archivePaper(input, context) {
      const database = getDatabase();
      const actorAdminId = await resolveActorAdminId(database, context);
      const [row] = await database
        .update(paper)
        .set({
          archived_at: new Date(),
          paper_status: "archived",
          updated_at: new Date(),
          updated_by_admin_id: actorAdminId,
        })
        .where(eq(paper.public_id, input.paperPublicId))
        .returning({ public_id: paper.public_id });

      return row === undefined
        ? null
        : findPaperByPublicId(database, row.public_id);
    },

    async deletePaper(input) {
      const database = getDatabase();
      const paperRow = await findPaperBaseByPublicId(
        database,
        input.paperPublicId,
      );

      if (paperRow === null) {
        return false;
      }

      const [practiceCount] = await database
        .select({ value: count() })
        .from(practice)
        .where(eq(practice.paper_id, paperRow.id));
      const [mockExamCount] = await database
        .select({ value: count() })
        .from(mockExam)
        .where(eq(mockExam.paper_id, paperRow.id));

      if ((practiceCount?.value ?? 0) > 0 || (mockExamCount?.value ?? 0) > 0) {
        return false;
      }

      const [deletedRow] = await database
        .delete(paper)
        .where(eq(paper.id, paperRow.id))
        .returning({ public_id: paper.public_id });

      return deletedRow !== undefined;
    },

    async copyPaper(input, context) {
      const database = getDatabase();
      const actorAdminId = await resolveActorAdminId(database, context);

      return database.transaction(async (transaction) => {
        const [paperRow] = await transaction
          .insert(paper)
          .values({
            created_by_admin_id: actorAdminId,
            duration_minute: input.sourcePaper.duration_minute,
            level: input.sourcePaper.level,
            name: `${input.sourcePaper.name}（副本）`,
            paper_status: "draft",
            paper_type: input.sourcePaper.paper_type,
            profession: input.sourcePaper.profession,
            public_id: `paper-${randomUUID()}`,
            source: input.sourcePaper.source,
            subject: input.sourcePaper.subject,
            total_score: input.sourcePaper.total_score,
            updated_by_admin_id: actorAdminId,
            year: input.sourcePaper.year,
          })
          .returning({ id: paper.id, public_id: paper.public_id });

        if (paperRow === undefined) {
          throw new Error("Paper copy insert did not return a row.");
        }

        const sectionIdBySourceId = new Map<number, number>();

        for (const sourceSection of input.sourcePaper.paper_sections) {
          const [sectionRow] = await transaction
            .insert(paperSection)
            .values({
              description: sourceSection.description,
              paper_id: paperRow.id,
              sort_order: sourceSection.sort_order,
              title: sourceSection.title,
              total_score: sourceSection.total_score,
            })
            .returning({
              id: paperSection.id,
            });

          if (sectionRow !== undefined) {
            sectionIdBySourceId.set(sourceSection.id, sectionRow.id);
          }
        }

        const questionGroupIdBySourceId = new Map<number, number>();

        for (const sourceGroup of input.sourcePaper.question_groups) {
          const targetSectionId = sectionIdBySourceId.get(
            sourceGroup.paper_section_id,
          );
          const materialId = await resolveMaterialId(
            transaction as RuntimeDatabase,
            sourceGroup.material_public_id,
          );

          if (targetSectionId === undefined || materialId === null) {
            continue;
          }

          const [groupRow] = await transaction
            .insert(questionGroup)
            .values({
              material_id: materialId,
              material_snapshot: sourceGroup.material_snapshot,
              paper_id: paperRow.id,
              paper_section_id: targetSectionId,
              sort_order: sourceGroup.sort_order,
              title: sourceGroup.title,
            })
            .returning({ id: questionGroup.id });

          if (groupRow !== undefined) {
            questionGroupIdBySourceId.set(sourceGroup.id, groupRow.id);
          }
        }

        for (const sourceSection of input.sourcePaper.paper_sections) {
          const targetSectionId = sectionIdBySourceId.get(sourceSection.id);

          if (targetSectionId === undefined) {
            continue;
          }

          for (const sourcePaperQuestion of sourceSection.paper_questions) {
            const sourceQuestion = await findSourceQuestionByPublicId(
              transaction as RuntimeDatabase,
              sourcePaperQuestion.source_question_public_id,
            );

            if (sourceQuestion === null) {
              return null;
            }

            const [newPaperQuestion] = await transaction
              .insert(paperQuestion)
              .values({
                material_snapshot: buildMaterialSnapshot(sourceQuestion),
                paper_id: paperRow.id,
                paper_section_id: targetSectionId,
                public_id: `paper-question-${randomUUID()}`,
                question_group_id:
                  sourcePaperQuestion.question_group_id === null
                    ? null
                    : (questionGroupIdBySourceId.get(
                        sourcePaperQuestion.question_group_id,
                      ) ?? null),
                question_id: sourceQuestion.id,
                question_snapshot: await buildQuestionSnapshot(
                  transaction as RuntimeDatabase,
                  sourceQuestion,
                ),
                score: sourcePaperQuestion.score,
                sort_order: sourcePaperQuestion.sort_order,
              })
              .returning({ id: paperQuestion.id });

            if (newPaperQuestion === undefined) {
              throw new Error(
                "Paper question copy insert did not return a row.",
              );
            }

            if (sourcePaperQuestion.scoring_points.length > 0) {
              await transaction.insert(paperScoringPoint).values(
                sourcePaperQuestion.scoring_points.map((scoringPointRow) => ({
                  description: scoringPointRow.description,
                  paper_question_id: newPaperQuestion.id,
                  score: scoringPointRow.score,
                  sort_order: scoringPointRow.sort_order,
                  source_scoring_point_id:
                    scoringPointRow.source_scoring_point_id,
                })),
              );
            }
          }
        }

        return findPaperByPublicId(
          transaction as RuntimeDatabase,
          paperRow.public_id,
        );
      });
    },
  };
}

function createPaperConditions(queryInput: NormalizedPaperListInput): SQL[] {
  const conditions: SQL[] = [];

  if (queryInput.profession !== null) {
    conditions.push(eq(paper.profession, queryInput.profession));
  }

  if (queryInput.level !== null) {
    conditions.push(eq(paper.level, queryInput.level));
  }

  if (queryInput.subject !== null) {
    conditions.push(eq(paper.subject, queryInput.subject));
  }

  if (queryInput.paperStatus !== null) {
    conditions.push(eq(paper.paper_status, queryInput.paperStatus));
  }

  return conditions;
}

function createPaperOrderBy(queryInput: NormalizedPaperListInput): SQL {
  if (queryInput.sortBy === "updatedAt") {
    return queryInput.sortOrder === "asc"
      ? asc(paper.updated_at)
      : desc(paper.updated_at);
  }

  return queryInput.sortOrder === "asc"
    ? asc(paper.created_at)
    : desc(paper.created_at);
}

async function findPaperBaseByPublicId(
  database: RuntimeDatabase,
  publicId: string,
): Promise<PaperBaseRow | null> {
  const [row] = await database
    .select()
    .from(paper)
    .where(eq(paper.public_id, publicId))
    .limit(1);

  return row ?? null;
}

async function findPaperByPublicId(
  database: RuntimeDatabase,
  publicId: string,
): Promise<PaperDraftAccessRow | null> {
  const row = await findPaperBaseByPublicId(database, publicId);

  if (row === null) {
    return null;
  }

  const [hydratedPaper] = await hydratePapers(database, [row]);

  return hydratedPaper ?? null;
}

async function hydratePapers(
  database: RuntimeDatabase,
  paperRows: PaperBaseRow[],
): Promise<PaperDraftAccessRow[]> {
  const paperIds = paperRows.map((paperRow) => paperRow.id);

  if (paperIds.length === 0) {
    return [];
  }

  const sectionRows = await database
    .select()
    .from(paperSection)
    .where(inArray(paperSection.paper_id, paperIds))
    .orderBy(asc(paperSection.sort_order));
  const groupRows = await database
    .select({
      id: questionGroup.id,
      material_public_id: material.public_id,
      material_snapshot: questionGroup.material_snapshot,
      paper_id: questionGroup.paper_id,
      paper_section_id: questionGroup.paper_section_id,
      sort_order: questionGroup.sort_order,
      title: questionGroup.title,
    })
    .from(questionGroup)
    .innerJoin(material, eq(material.id, questionGroup.material_id))
    .where(inArray(questionGroup.paper_id, paperIds))
    .orderBy(asc(questionGroup.sort_order));
  const paperQuestionRows = await database
    .select({
      created_at: paperQuestion.created_at,
      id: paperQuestion.id,
      material_snapshot: paperQuestion.material_snapshot,
      paper_id: paperQuestion.paper_id,
      paper_section_id: paperQuestion.paper_section_id,
      paper_section_sort_order: paperSection.sort_order,
      public_id: paperQuestion.public_id,
      question_group_id: paperQuestion.question_group_id,
      question_group_sort_order: questionGroup.sort_order,
      question_snapshot: paperQuestion.question_snapshot,
      score: paperQuestion.score,
      sort_order: paperQuestion.sort_order,
      source_question_public_id: question.public_id,
      updated_at: paperQuestion.updated_at,
    })
    .from(paperQuestion)
    .innerJoin(question, eq(question.id, paperQuestion.question_id))
    .innerJoin(
      paperSection,
      eq(paperSection.id, paperQuestion.paper_section_id),
    )
    .leftJoin(
      questionGroup,
      eq(questionGroup.id, paperQuestion.question_group_id),
    )
    .where(inArray(paperQuestion.paper_id, paperIds))
    .orderBy(asc(paperQuestion.sort_order));
  const paperQuestionIds = paperQuestionRows.map(
    (paperQuestionRow) => paperQuestionRow.id,
  );
  const scoringPointRows =
    paperQuestionIds.length === 0
      ? []
      : await database
          .select()
          .from(paperScoringPoint)
          .where(inArray(paperScoringPoint.paper_question_id, paperQuestionIds))
          .orderBy(asc(paperScoringPoint.sort_order));
  const paperQuestions = paperQuestionRows.map((paperQuestionRow) => ({
    id: paperQuestionRow.id,
    public_id: paperQuestionRow.public_id,
    source_question_public_id: paperQuestionRow.source_question_public_id,
    paper_section_id: paperQuestionRow.paper_section_id,
    paper_section_sort_order: paperQuestionRow.paper_section_sort_order,
    question_group_id: paperQuestionRow.question_group_id,
    question_group_sort_order: paperQuestionRow.question_group_sort_order,
    question_snapshot: asQuestionSnapshot(paperQuestionRow.question_snapshot),
    material_snapshot: asNullableMaterialSnapshot(
      paperQuestionRow.material_snapshot,
    ),
    score: paperQuestionRow.score,
    sort_order: paperQuestionRow.sort_order,
    scoring_points: scoringPointRows
      .filter(
        (scoringPointRow) =>
          scoringPointRow.paper_question_id === paperQuestionRow.id,
      )
      .map((scoringPointRow) => ({
        source_scoring_point_id: scoringPointRow.source_scoring_point_id,
        description: scoringPointRow.description,
        score: scoringPointRow.score,
        sort_order: scoringPointRow.sort_order,
      })),
    created_at: paperQuestionRow.created_at,
    updated_at: paperQuestionRow.updated_at,
  }));

  return paperRows.map((paperRow) => ({
    ...paperRow,
    paper_sections: sectionRows
      .filter((sectionRow) => sectionRow.paper_id === paperRow.id)
      .map((sectionRow) => ({
        id: sectionRow.id,
        title: sectionRow.title,
        description: sectionRow.description,
        sort_order: sectionRow.sort_order,
        total_score: sectionRow.total_score,
        paper_questions: paperQuestions.filter(
          (paperQuestionRow) =>
            paperQuestionRow.paper_section_id === sectionRow.id,
        ),
      })),
    question_groups: groupRows
      .filter((groupRow) => groupRow.paper_id === paperRow.id)
      .map((groupRow) => ({
        id: groupRow.id,
        paper_section_id: groupRow.paper_section_id,
        material_public_id: groupRow.material_public_id,
        material_snapshot: asMaterialSnapshot(groupRow.material_snapshot),
        title: groupRow.title,
        sort_order: groupRow.sort_order,
      })),
  }));
}

async function findSourceQuestionByPublicId(
  database: RuntimeDatabase,
  publicId: string,
): Promise<SourceQuestionSnapshotRow | null> {
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
      multi_choice_rule: question.multi_choice_rule,
      scoring_method: question.scoring_method,
      material_id: question.material_id,
      material_public_id: material.public_id,
      material_title: material.title,
      material_content_rich_text: material.content_rich_text,
      material_profession: material.profession,
      material_level: material.level,
      material_subject: material.subject,
    })
    .from(question)
    .leftJoin(material, eq(material.id, question.material_id))
    .where(eq(question.public_id, publicId))
    .limit(1);

  return row ?? null;
}

async function buildQuestionSnapshot(
  database: RuntimeDatabase,
  sourceQuestion: SourceQuestionSnapshotRow,
): Promise<QuestionSnapshotDto> {
  const optionRows = await database
    .select()
    .from(questionOption)
    .where(eq(questionOption.question_id, sourceQuestion.id))
    .orderBy(asc(questionOption.sort_order));

  return {
    questionPublicId: sourceQuestion.public_id,
    questionStatus: sourceQuestion.status,
    questionType: sourceQuestion.question_type,
    profession: sourceQuestion.profession,
    level: sourceQuestion.level,
    subject: sourceQuestion.subject,
    stemRichText: sourceQuestion.stem_rich_text,
    questionOptions: optionRows.map((optionRow) => ({
      label: optionRow.label,
      contentRichText: optionRow.content_rich_text,
      isCorrect: optionRow.is_correct,
      sortOrder: optionRow.sort_order,
    })),
    standardAnswerRichText: sourceQuestion.standard_answer_rich_text,
    analysisRichText: sourceQuestion.analysis_rich_text,
    multiChoiceRule: sourceQuestion.multi_choice_rule,
    scoringMethod: sourceQuestion.scoring_method,
  };
}

function buildMaterialSnapshot(
  sourceQuestion: SourceQuestionSnapshotRow,
): MaterialSnapshotDto | null {
  if (
    sourceQuestion.material_public_id === null ||
    sourceQuestion.material_title === null ||
    sourceQuestion.material_content_rich_text === null ||
    sourceQuestion.material_profession === null ||
    sourceQuestion.material_level === null ||
    sourceQuestion.material_subject === null
  ) {
    return null;
  }

  return {
    materialPublicId: sourceQuestion.material_public_id,
    title: sourceQuestion.material_title,
    contentRichText: sourceQuestion.material_content_rich_text,
    profession: sourceQuestion.material_profession,
    level: sourceQuestion.material_level,
    subject: sourceQuestion.material_subject,
  };
}

async function upsertPaperSection(
  database: RuntimeDatabase,
  paperId: number,
  input: NormalizedAddPaperQuestionInput["paperSection"],
): Promise<number> {
  const [existingSection] = await database
    .select({ id: paperSection.id })
    .from(paperSection)
    .where(
      and(
        eq(paperSection.paper_id, paperId),
        eq(paperSection.sort_order, input.sortOrder),
      ),
    )
    .limit(1);

  if (existingSection !== undefined) {
    await database
      .update(paperSection)
      .set({
        description: input.description,
        title: input.title,
        updated_at: new Date(),
      })
      .where(eq(paperSection.id, existingSection.id));

    return existingSection.id;
  }

  const [sectionRow] = await database
    .insert(paperSection)
    .values({
      description: input.description,
      paper_id: paperId,
      sort_order: input.sortOrder,
      title: input.title,
      total_score: "0.0",
    })
    .returning({ id: paperSection.id });

  if (sectionRow === undefined) {
    throw new Error("paper_section insert failed.");
  }

  return sectionRow.id;
}

async function upsertQuestionGroup(
  database: RuntimeDatabase,
  paperId: number,
  paperSectionId: number,
  input: NonNullable<NormalizedAddPaperQuestionInput["questionGroup"]>,
): Promise<number | undefined> {
  const materialId = await resolveMaterialId(database, input.materialPublicId);

  if (materialId === null) {
    return undefined;
  }

  const [existingGroup] = await database
    .select({ id: questionGroup.id })
    .from(questionGroup)
    .where(
      and(
        eq(questionGroup.paper_id, paperId),
        eq(questionGroup.paper_section_id, paperSectionId),
        eq(questionGroup.material_id, materialId),
        eq(questionGroup.sort_order, input.sortOrder),
      ),
    )
    .limit(1);

  if (existingGroup !== undefined) {
    await database
      .update(questionGroup)
      .set({
        title: input.title,
        updated_at: new Date(),
      })
      .where(eq(questionGroup.id, existingGroup.id));

    return existingGroup.id;
  }

  const materialRow = await findMaterialSnapshotById(database, materialId);

  if (materialRow === null) {
    return undefined;
  }

  const [groupRow] = await database
    .insert(questionGroup)
    .values({
      material_id: materialId,
      material_snapshot: materialRow,
      paper_id: paperId,
      paper_section_id: paperSectionId,
      sort_order: input.sortOrder,
      title: input.title,
    })
    .returning({ id: questionGroup.id });

  return groupRow?.id;
}

async function findMaterialSnapshotById(
  database: RuntimeDatabase,
  materialId: number,
): Promise<MaterialSnapshotDto | null> {
  const [row] = await database
    .select()
    .from(material)
    .where(eq(material.id, materialId))
    .limit(1);

  if (row === undefined) {
    return null;
  }

  return {
    materialPublicId: row.public_id,
    title: row.title,
    contentRichText: row.content_rich_text,
    profession: row.profession,
    level: row.level,
    subject: row.subject,
  };
}

async function resolveMaterialId(
  database: RuntimeDatabase,
  publicId: string,
): Promise<number | null> {
  const [row] = await database
    .select({ id: material.id })
    .from(material)
    .where(eq(material.public_id, publicId))
    .limit(1);

  return row?.id ?? null;
}

async function findPaperQuestionByPaperPublicIds(
  database: RuntimeDatabase,
  paperPublicId: string,
  paperQuestionPublicId: string,
): Promise<{ id: number; paper_section_id: number } | null> {
  const [row] = await database
    .select({
      id: paperQuestion.id,
      paper_section_id: paperQuestion.paper_section_id,
    })
    .from(paperQuestion)
    .innerJoin(paper, eq(paper.id, paperQuestion.paper_id))
    .where(
      and(
        eq(paper.public_id, paperPublicId),
        eq(paperQuestion.public_id, paperQuestionPublicId),
      ),
    )
    .limit(1);

  return row ?? null;
}

async function updatePaperSectionTotalScore(
  database: RuntimeDatabase,
  paperSectionId: number,
): Promise<void> {
  const rows = await database
    .select({ score: paperQuestion.score })
    .from(paperQuestion)
    .where(eq(paperQuestion.paper_section_id, paperSectionId));
  const totalScore = rows.reduce((scoreSum, row) => {
    const score = Number(row.score);

    return Number.isFinite(score) ? scoreSum + score : scoreSum;
  }, 0);

  await database
    .update(paperSection)
    .set({
      total_score: totalScore.toFixed(1),
      updated_at: new Date(),
    })
    .where(eq(paperSection.id, paperSectionId));
}

async function findPaperQuestionByPublicId(
  database: RuntimeDatabase,
  publicId: string,
): Promise<PaperQuestionAccessRow | null> {
  const [row] = await hydratePaperQuestionsByPublicId(database, [publicId]);

  return row ?? null;
}

async function hydratePaperQuestionsByPublicId(
  database: RuntimeDatabase,
  publicIds: string[],
): Promise<PaperQuestionAccessRow[]> {
  if (publicIds.length === 0) {
    return [];
  }

  const rows = await database
    .select({
      created_at: paperQuestion.created_at,
      id: paperQuestion.id,
      material_snapshot: paperQuestion.material_snapshot,
      paper_section_id: paperQuestion.paper_section_id,
      paper_section_sort_order: paperSection.sort_order,
      public_id: paperQuestion.public_id,
      question_group_id: paperQuestion.question_group_id,
      question_group_sort_order: questionGroup.sort_order,
      question_snapshot: paperQuestion.question_snapshot,
      score: paperQuestion.score,
      sort_order: paperQuestion.sort_order,
      source_question_public_id: question.public_id,
      updated_at: paperQuestion.updated_at,
    })
    .from(paperQuestion)
    .innerJoin(question, eq(question.id, paperQuestion.question_id))
    .innerJoin(
      paperSection,
      eq(paperSection.id, paperQuestion.paper_section_id),
    )
    .leftJoin(
      questionGroup,
      eq(questionGroup.id, paperQuestion.question_group_id),
    )
    .where(inArray(paperQuestion.public_id, publicIds));
  const scoringPointRows =
    rows.length === 0
      ? []
      : await database
          .select()
          .from(paperScoringPoint)
          .where(
            inArray(
              paperScoringPoint.paper_question_id,
              rows.map((row) => row.id),
            ),
          )
          .orderBy(asc(paperScoringPoint.sort_order));

  return rows.map((row) => ({
    id: row.id,
    public_id: row.public_id,
    source_question_public_id: row.source_question_public_id,
    paper_section_id: row.paper_section_id,
    paper_section_sort_order: row.paper_section_sort_order,
    question_group_id: row.question_group_id,
    question_group_sort_order: row.question_group_sort_order,
    question_snapshot: asQuestionSnapshot(row.question_snapshot),
    material_snapshot: asNullableMaterialSnapshot(row.material_snapshot),
    score: row.score,
    sort_order: row.sort_order,
    scoring_points: scoringPointRows
      .filter((scoringPointRow) => scoringPointRow.paper_question_id === row.id)
      .map((scoringPointRow) => ({
        source_scoring_point_id: scoringPointRow.source_scoring_point_id,
        description: scoringPointRow.description,
        score: scoringPointRow.score,
        sort_order: scoringPointRow.sort_order,
      })),
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));
}

type SourcePaperScoringPointInput = {
  sourceScoringPointId: number;
  description: string;
  score: string;
  sortOrder: number;
};

async function copySourceScoringPoints(
  database: RuntimeDatabase,
  paperQuestionPublicId: string,
  scoringPointInputs: SourcePaperScoringPointInput[],
): Promise<void> {
  if (scoringPointInputs.length === 0) {
    return;
  }

  const [paperQuestionRow] = await database
    .select({ id: paperQuestion.id })
    .from(paperQuestion)
    .where(eq(paperQuestion.public_id, paperQuestionPublicId))
    .limit(1);

  if (paperQuestionRow === undefined) {
    throw new Error("Paper question could not be loaded for scoring points.");
  }

  await database.insert(paperScoringPoint).values(
    scoringPointInputs.map((scoringPointInput) => ({
      description: scoringPointInput.description,
      paper_question_id: paperQuestionRow.id,
      score: scoringPointInput.score,
      sort_order: scoringPointInput.sortOrder,
      source_scoring_point_id: scoringPointInput.sourceScoringPointId,
    })),
  );
}

async function resolveActorAdminId(
  database: RuntimeDatabase,
  context: ContentMutationContext | undefined,
): Promise<number> {
  if (context === undefined) {
    throw new Error("Paper mutation requires an admin actor.");
  }

  const [row] = await database
    .select({ id: admin.id })
    .from(admin)
    .where(eq(admin.public_id, context.actorPublicId))
    .limit(1);

  if (row === undefined) {
    throw new Error("Paper mutation admin actor does not exist.");
  }

  return row.id;
}

function asQuestionSnapshot(value: unknown): QuestionSnapshotDto {
  return value as QuestionSnapshotDto;
}

function asMaterialSnapshot(value: unknown): MaterialSnapshotDto {
  return value as MaterialSnapshotDto;
}

function asNullableMaterialSnapshot(
  value: unknown,
): MaterialSnapshotDto | null {
  return value === null ? null : asMaterialSnapshot(value);
}

import { createHash, randomUUID } from "node:crypto";

import { and, asc, count, desc, eq, inArray, sql, type SQL } from "drizzle-orm";

import {
  admin,
  material,
  mockExam,
  paper,
  paperCommand,
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
  FillBlankAnswer,
  MultiChoiceRule,
  PaperGenerationMethod,
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
  NormalizedPaperSectionCommandInput,
  NormalizedQuestionGroupCommandInput,
  NormalizedUpdatePaperInput,
  NormalizedUpdatePaperQuestionInput,
} from "../validators/paper-draft";
import {
  appendContentMutationAuditLog,
  type ContentMutationContext,
} from "./content-mutation-audit";
import {
  createLazyRuntimeDatabaseGetter,
  type RuntimeDatabase,
  type RuntimeDatabaseOptions,
} from "./runtime-database";

export type PaperScoringPointAccessRow = {
  public_id: string;
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
  question_group_public_id?: string | null;
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
  public_id: string;
  title: string;
  description: string | null;
  sort_order: number;
  total_score: string;
  paper_questions: PaperQuestionAccessRow[];
};

export type QuestionGroupAccessRow = {
  id: number;
  public_id: string;
  paper_section_id: number;
  paper_section_public_id: string;
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
  month: number | null;
  source: string | null;
  source_region: string | null;
  source_organization: string | null;
  question_basis: string | null;
  generation_method: PaperGenerationMethod | null;
  duration_minute: number | null;
  total_score: string | null;
  revision: number;
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
  expectedRevision: number;
  paperPublicId: string;
  paperQuestionPublicId: string;
};

export type PaperSectionCommandInput = NormalizedPaperSectionCommandInput & {
  paperPublicId: string;
};

export type QuestionGroupCommandInput = NormalizedQuestionGroupCommandInput & {
  paperPublicId: string;
};

export type PublishPaperInput = {
  commandPublicId: string;
  expectedRevision: number;
  paperPublicId: string;
  sourceQuestionPublicIds: string[];
  materialPublicIds: string[];
};

export type ArchivePaperInput = {
  expectedRevision: number;
  paperPublicId: string;
};

export type DeletePaperInput = {
  expectedRevision: number;
  paperPublicId: string;
};

export type CopyPaperInput = {
  commandPublicId: string;
  expectedRevision: number;
  sourcePaperPublicId: string;
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
  ): Promise<PaperDraftAccessRow | null>;
  addQuestionToDraftPaper(
    input: AddPaperQuestionInput,
    context?: ContentMutationContext,
  ): Promise<PaperQuestionAccessRow | null>;
  updatePaperQuestion(
    input: UpdatePaperQuestionInput,
    context?: ContentMutationContext,
  ): Promise<PaperQuestionAccessRow | null>;
  removePaperQuestion(
    input: RemovePaperQuestionInput,
    context?: ContentMutationContext,
  ): Promise<PaperDraftAccessRow | null>;
  mutatePaperSections(
    input: PaperSectionCommandInput,
    context?: ContentMutationContext,
  ): Promise<PaperDraftAccessRow | null>;
  mutateQuestionGroups(
    input: QuestionGroupCommandInput,
    context?: ContentMutationContext,
  ): Promise<PaperDraftAccessRow | null>;
  publishPaper(
    input: PublishPaperInput,
    context?: ContentMutationContext,
  ): Promise<PaperDraftAccessRow | null>;
  archivePaper(
    input: ArchivePaperInput,
    context?: ContentMutationContext,
  ): Promise<PaperDraftAccessRow | null>;
  deletePaper(
    input: DeletePaperInput,
    context?: ContentMutationContext,
  ): Promise<boolean>;
  copyPaper(
    input: CopyPaperInput,
    context?: ContentMutationContext,
  ): Promise<PaperDraftAccessRow | null>;
};

export type PaperQuestionSectionMovePlan =
  | {
      kind: "paper_question";
      paperQuestionId: number;
      sourcePaperSectionId: number;
      targetPaperSectionId: number;
    }
  | {
      kind: "question_group";
      questionGroupId: number;
      sourcePaperSectionId: number;
      targetPaperSectionId: number;
    };

export function createPaperQuestionSectionMovePlan(input: {
  paperQuestionId: number;
  questionGroupId: number | null;
  sourcePaperSectionId: number;
  targetPaperSectionId: number;
}): PaperQuestionSectionMovePlan {
  return input.questionGroupId === null
    ? {
        kind: "paper_question",
        paperQuestionId: input.paperQuestionId,
        sourcePaperSectionId: input.sourcePaperSectionId,
        targetPaperSectionId: input.targetPaperSectionId,
      }
    : {
        kind: "question_group",
        questionGroupId: input.questionGroupId,
        sourcePaperSectionId: input.sourcePaperSectionId,
        targetPaperSectionId: input.targetPaperSectionId,
      };
}

export function isExactPublicIdOrder(
  actualPublicIds: string[],
  requestedPublicIds: string[],
): boolean {
  if (
    actualPublicIds.length !== requestedPublicIds.length ||
    new Set(requestedPublicIds).size !== requestedPublicIds.length
  ) {
    return false;
  }

  const actualSet = new Set(actualPublicIds);
  return requestedPublicIds.every((publicId) => actualSet.has(publicId));
}

export function createTwoPhaseSortOrderPlan(publicIds: string[]) {
  return publicIds.map((publicId, index) => ({
    publicId,
    temporarySortOrder: -(index + 1),
    finalSortOrder: index + 1,
  }));
}

export function isQuestionGroupMembershipCompatible(input: {
  paperId: number;
  paperSectionId: number;
  materialPublicId: string | null;
  groupPaperId: number;
  groupPaperSectionId: number;
  groupSectionOwnerPaperId: number;
  groupMaterialPublicId: string;
}): boolean {
  return (
    input.paperId === input.groupPaperId &&
    input.paperId === input.groupSectionOwnerPaperId &&
    input.paperSectionId === input.groupPaperSectionId &&
    input.materialPublicId !== null &&
    input.materialPublicId === input.groupMaterialPublicId
  );
}

type PaperCommandClaim =
  | { kind: "claimed"; id: number }
  | { kind: "replay"; resultPublicId: string }
  | { kind: "conflict" };

export class PaperCommandConflictError extends Error {
  constructor() {
    super("Paper command conflicts with an existing request.");
    this.name = "PaperCommandConflictError";
  }
}

class PaperMutationConflictError extends Error {
  constructor() {
    super("Paper aggregate mutation conflict.");
    this.name = "PaperMutationConflictError";
  }
}

function canonicalizePaperCommandPayload(input: unknown): unknown {
  if (Array.isArray(input)) {
    return input.map((item) => canonicalizePaperCommandPayload(item));
  }

  if (input instanceof Date) {
    return input.toJSON();
  }

  if (input !== null && typeof input === "object") {
    return Object.fromEntries(
      Object.entries(input)
        .filter(([, value]) => value !== undefined)
        .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
        .map(([key, value]) => [key, canonicalizePaperCommandPayload(value)]),
    );
  }

  return input;
}

export function createPaperCommandRequestHash(input: unknown): string {
  return createHash("sha256")
    .update(JSON.stringify(canonicalizePaperCommandPayload(input)))
    .digest("hex");
}

async function claimPaperCommand(
  database: RuntimeDatabase,
  input: {
    actorAdminId: number;
    commandKind: string;
    commandPublicId: string;
    paperId?: number | null;
    requestHash: string;
  },
): Promise<PaperCommandClaim> {
  const [inserted] = await database
    .insert(paperCommand)
    .values({
      actor_admin_id: input.actorAdminId,
      command_kind: input.commandKind,
      paper_id: input.paperId ?? null,
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
      request_hash: paperCommand.request_hash,
      result_public_id: paperCommand.result_public_id,
    })
    .from(paperCommand)
    .where(eq(paperCommand.public_id, input.commandPublicId))
    .limit(1);

  return existing !== undefined &&
    existing.actor_admin_id === input.actorAdminId &&
    existing.command_kind === input.commandKind &&
    existing.request_hash === input.requestHash &&
    existing.result_public_id !== null
    ? { kind: "replay", resultPublicId: existing.result_public_id }
    : { kind: "conflict" };
}

async function completePaperCommand(
  database: RuntimeDatabase,
  input: { commandId: number; paperId: number; resultPublicId: string },
): Promise<void> {
  await database
    .update(paperCommand)
    .set({
      paper_id: input.paperId,
      result_public_id: input.resultPublicId,
    })
    .where(eq(paperCommand.id, input.commandId));
}

async function releasePaperCommand(
  database: RuntimeDatabase,
  claim: PaperCommandClaim,
): Promise<void> {
  if (claim.kind === "claimed") {
    await database.delete(paperCommand).where(eq(paperCommand.id, claim.id));
  }
}

async function advancePaperRevision(
  database: RuntimeDatabase,
  input: {
    actorAdminId: number;
    expectedRevision: number;
    paperPublicId: string;
    requiredStatus: PaperStatus;
  },
): Promise<{
  id: number;
  publicId: string;
  revision: number;
  profession: Profession;
  level: number;
  subject: Subject;
} | null> {
  const [row] = await database
    .update(paper)
    .set({
      revision: sql`${paper.revision} + 1`,
      updated_at: new Date(),
      updated_by_admin_id: input.actorAdminId,
    })
    .where(
      and(
        eq(paper.public_id, input.paperPublicId),
        eq(paper.paper_status, input.requiredStatus),
        eq(paper.revision, input.expectedRevision),
      ),
    )
    .returning({
      id: paper.id,
      publicId: paper.public_id,
      revision: paper.revision,
      profession: paper.profession,
      level: paper.level,
      subject: paper.subject,
    });

  return row ?? null;
}

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
  fill_blank_answers?: FillBlankAnswer[];
  material_id: number | null;
};

type SourceQuestionLookupInput = {
  publicId: string;
  requiredStatus?: QuestionStatus;
};

const PAPER_ARCHIVE_TERMINATION_REASON = "paper_archived";

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
      const requestHash = createPaperCommandRequestHash(input);

      return database.transaction(async (transaction) => {
        const commandClaim = await claimPaperCommand(
          transaction as RuntimeDatabase,
          {
            actorAdminId,
            commandKind: "create",
            commandPublicId: input.commandPublicId,
            requestHash,
          },
        );

        if (commandClaim.kind === "replay") {
          const replayedPaper = await findPaperByPublicId(
            transaction as RuntimeDatabase,
            commandClaim.resultPublicId,
          );

          if (replayedPaper !== null) {
            await appendContentMutationAuditLog(
              transaction as RuntimeDatabase,
              context,
              replayedPaper.public_id,
            );
            return replayedPaper;
          }
        }
        if (commandClaim.kind !== "claimed") {
          throw new PaperCommandConflictError();
        }

        const [row] = await transaction
          .insert(paper)
          .values({
            created_by_admin_id: actorAdminId,
            duration_minute: input.durationMinute,
            generation_method: input.generationMethod,
            level: input.level,
            month: input.month,
            name: input.name,
            paper_type: input.paperType,
            profession: input.profession,
            public_id: `paper-${randomUUID()}`,
            question_basis: input.questionBasis,
            source: input.sourceDescription,
            source_organization: input.sourceOrganization,
            source_region: input.sourceRegion,
            subject: input.subject,
            total_score: input.totalScore,
            updated_by_admin_id: actorAdminId,
            year: input.year,
          })
          .returning({ id: paper.id, public_id: paper.public_id });

        if (row === undefined) {
          throw new Error("Paper insert did not return a row.");
        }

        await completePaperCommand(transaction as RuntimeDatabase, {
          commandId: commandClaim.id,
          paperId: row.id,
          resultPublicId: row.public_id,
        });

        const createdPaper = await findPaperByPublicId(
          transaction as RuntimeDatabase,
          row.public_id,
        );

        if (createdPaper === null) {
          throw new Error("Created paper could not be loaded.");
        }

        await appendContentMutationAuditLog(
          transaction as RuntimeDatabase,
          context,
          createdPaper.public_id,
        );

        return createdPaper;
      });
    },

    async findPaperByPublicId(publicId) {
      return findPaperByPublicId(getDatabase(), publicId);
    },

    async updatePaper(input, context) {
      const database = getDatabase();
      const actorAdminId = await resolveActorAdminId(database, context);
      return database.transaction(async (transaction) => {
        const scopedDatabase = transaction as RuntimeDatabase;
        const [row] = await transaction
          .update(paper)
          .set({
            duration_minute: input.durationMinute,
            generation_method: input.generationMethod,
            level: input.level,
            month: input.month,
            name: input.name,
            paper_type: input.paperType,
            profession: input.profession,
            question_basis: input.questionBasis,
            source: input.sourceDescription,
            source_organization: input.sourceOrganization,
            source_region: input.sourceRegion,
            subject: input.subject,
            total_score: input.totalScore,
            revision: sql`${paper.revision} + 1`,
            updated_at: new Date(),
            updated_by_admin_id: actorAdminId,
            year: input.year,
          })
          .where(
            and(
              eq(paper.public_id, input.publicId),
              eq(paper.paper_status, "draft"),
              eq(paper.revision, input.expectedRevision),
            ),
          )
          .returning({ public_id: paper.public_id });

        if (row === undefined) {
          return null;
        }

        const updatedPaper = await findPaperByPublicId(
          scopedDatabase,
          row.public_id,
        );

        if (updatedPaper === null) {
          throw new Error("Updated paper could not be loaded.");
        }

        await appendContentMutationAuditLog(
          scopedDatabase,
          context,
          updatedPaper.public_id,
        );

        return updatedPaper;
      });
    },

    async addQuestionToDraftPaper(input, context) {
      const database = getDatabase();
      const actorAdminId = await resolveActorAdminId(database, context);
      const requestHash = createPaperCommandRequestHash(input);

      try {
        return await database.transaction(async (transaction) => {
          const scopedDatabase = transaction as RuntimeDatabase;
          const paperRow = await findPaperBaseByPublicId(
            scopedDatabase,
            input.paperPublicId,
          );
          if (paperRow === null) {
            return null;
          }

          const commandClaim = await claimPaperCommand(scopedDatabase, {
            actorAdminId,
            commandKind: "add_question",
            commandPublicId: input.commandPublicId,
            paperId: paperRow.id,
            requestHash,
          });
          if (commandClaim.kind === "replay") {
            const replayedPaperQuestion = await findPaperQuestionByPublicId(
              scopedDatabase,
              commandClaim.resultPublicId,
            );

            if (replayedPaperQuestion !== null) {
              await appendContentMutationAuditLog(
                scopedDatabase,
                context,
                replayedPaperQuestion.public_id,
              );
            }

            return replayedPaperQuestion;
          }
          if (commandClaim.kind !== "claimed") {
            throw new PaperCommandConflictError();
          }

          const [questionCountRow] = await transaction
            .select({ value: count() })
            .from(paperQuestion)
            .where(eq(paperQuestion.paper_id, paperRow.id));
          if ((questionCountRow?.value ?? 0) >= 100) {
            await releasePaperCommand(scopedDatabase, commandClaim);
            return null;
          }

          const advancedPaper = await advancePaperRevision(scopedDatabase, {
            actorAdminId,
            expectedRevision: input.expectedRevision,
            paperPublicId: input.paperPublicId,
            requiredStatus: "draft",
          });
          if (advancedPaper === null) {
            await releasePaperCommand(scopedDatabase, commandClaim);
            return null;
          }

          const sourceQuestion = await findSourceQuestionByPublicId(
            scopedDatabase,
            {
              publicId: input.questionPublicId,
              requiredStatus: "available",
            },
          );
          if (
            sourceQuestion === null ||
            sourceQuestion.profession !== paperRow.profession ||
            sourceQuestion.level !== paperRow.level ||
            sourceQuestion.subject !== paperRow.subject
          ) {
            throw new PaperMutationConflictError();
          }

          const materialSnapshot =
            sourceQuestion.material_id === null
              ? null
              : await findMaterialSnapshotById(
                  scopedDatabase,
                  sourceQuestion.material_id,
                );
          if (
            sourceQuestion.material_id !== null &&
            materialSnapshot === null
          ) {
            throw new PaperMutationConflictError();
          }
          if (
            input.questionGroup !== null &&
            input.questionGroup.materialPublicId !==
              materialSnapshot?.materialPublicId
          ) {
            throw new PaperMutationConflictError();
          }

          const questionSnapshot = await buildQuestionSnapshot(
            scopedDatabase,
            sourceQuestion,
          );
          const paperSectionId = await upsertPaperSection(
            scopedDatabase,
            paperRow.id,
            input.paperSection,
          );
          const questionGroupId =
            input.questionGroup === null
              ? null
              : await resolveQuestionGroup(
                  scopedDatabase,
                  paperRow.id,
                  paperSectionId,
                  input.questionGroup,
                );

          if (questionGroupId === undefined) {
            throw new PaperMutationConflictError();
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
            scopedDatabase,
            paperQuestionRow.public_id,
            sourceScoringPoints.map((sourceScoringPoint) => ({
              description: sourceScoringPoint.description,
              score: sourceScoringPoint.score,
              sortOrder: sourceScoringPoint.sort_order,
              sourceScoringPointId: sourceScoringPoint.id,
            })),
          );
          await updatePaperSectionTotalScore(scopedDatabase, paperSectionId);

          await completePaperCommand(scopedDatabase, {
            commandId: commandClaim.id,
            paperId: advancedPaper.id,
            resultPublicId: paperQuestionRow.public_id,
          });

          const createdPaperQuestion = await requirePaperQuestionByPublicId(
            scopedDatabase,
            paperQuestionRow.public_id,
          );

          await appendContentMutationAuditLog(
            scopedDatabase,
            context,
            createdPaperQuestion.public_id,
          );

          return createdPaperQuestion;
        });
      } catch (error) {
        if (error instanceof PaperMutationConflictError) {
          return null;
        }
        throw error;
      }
    },

    async updatePaperQuestion(input, context) {
      const database = getDatabase();
      const actorAdminId = await resolveActorAdminId(database, context);

      return database.transaction(async (transaction) => {
        const scopedDatabase = transaction as RuntimeDatabase;
        const existingPaperQuestion = await findPaperQuestionByPaperPublicIds(
          scopedDatabase,
          input.paperPublicId,
          input.paperQuestionPublicId,
        );

        if (existingPaperQuestion === null) {
          return null;
        }

        const advancedPaper = await advancePaperRevision(scopedDatabase, {
          actorAdminId,
          expectedRevision: input.expectedRevision,
          paperPublicId: input.paperPublicId,
          requiredStatus: "draft",
        });
        if (advancedPaper === null) {
          return null;
        }

        const targetPaperSectionId =
          input.paperSection === null
            ? existingPaperQuestion.paper_section_id
            : await upsertPaperSection(
                scopedDatabase,
                existingPaperQuestion.paper_id,
                input.paperSection,
              );
        const movePlan = createPaperQuestionSectionMovePlan({
          paperQuestionId: existingPaperQuestion.id,
          questionGroupId: existingPaperQuestion.question_group_id,
          sourcePaperSectionId: existingPaperQuestion.paper_section_id,
          targetPaperSectionId,
        });

        if (
          movePlan.kind === "question_group" &&
          movePlan.sourcePaperSectionId !== movePlan.targetPaperSectionId
        ) {
          await transaction
            .update(questionGroup)
            .set({
              paper_section_id: movePlan.targetPaperSectionId,
              updated_at: new Date(),
            })
            .where(eq(questionGroup.id, movePlan.questionGroupId));
          await transaction
            .update(paperQuestion)
            .set({
              paper_section_id: movePlan.targetPaperSectionId,
              updated_at: new Date(),
            })
            .where(
              eq(paperQuestion.question_group_id, movePlan.questionGroupId),
            );
        }

        await transaction
          .update(paperQuestion)
          .set({
            paper_section_id: targetPaperSectionId,
            score: input.score,
            sort_order: input.sortOrder,
            updated_at: new Date(),
          })
          .where(eq(paperQuestion.public_id, input.paperQuestionPublicId));
        await updatePaperSectionTotalScore(
          scopedDatabase,
          existingPaperQuestion.paper_section_id,
        );
        if (targetPaperSectionId !== existingPaperQuestion.paper_section_id) {
          await updatePaperSectionTotalScore(
            scopedDatabase,
            targetPaperSectionId,
          );
        }
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

        const updatedPaperQuestion = await requirePaperQuestionByPublicId(
          scopedDatabase,
          input.paperQuestionPublicId,
        );

        await appendContentMutationAuditLog(
          scopedDatabase,
          context,
          updatedPaperQuestion.public_id,
        );

        return updatedPaperQuestion;
      });
    },

    async removePaperQuestion(input, context) {
      const database = getDatabase();
      const actorAdminId = await resolveActorAdminId(database, context);

      return database.transaction(async (transaction) => {
        const scopedDatabase = transaction as RuntimeDatabase;
        const existingPaperQuestion = await findPaperQuestionByPaperPublicIds(
          scopedDatabase,
          input.paperPublicId,
          input.paperQuestionPublicId,
        );

        if (existingPaperQuestion === null) {
          return null;
        }

        const advancedPaper = await advancePaperRevision(scopedDatabase, {
          actorAdminId,
          expectedRevision: input.expectedRevision,
          paperPublicId: input.paperPublicId,
          requiredStatus: "draft",
        });
        if (advancedPaper === null) {
          return null;
        }

        await transaction
          .delete(paperQuestion)
          .where(eq(paperQuestion.id, existingPaperQuestion.id));
        await updatePaperSectionTotalScore(
          scopedDatabase,
          existingPaperQuestion.paper_section_id,
        );

        const updatedPaper = await requirePaperByPublicId(
          scopedDatabase,
          input.paperPublicId,
        );

        await appendContentMutationAuditLog(
          scopedDatabase,
          context,
          input.paperQuestionPublicId,
        );

        return updatedPaper;
      });
    },

    async mutatePaperSections(input, context) {
      const database = getDatabase();
      const actorAdminId = await resolveActorAdminId(database, context);

      try {
        return await database.transaction(async (transaction) => {
          const scopedDatabase = transaction as RuntimeDatabase;
          const advancedPaper = await advancePaperRevision(scopedDatabase, {
            actorAdminId,
            expectedRevision: input.expectedRevision,
            paperPublicId: input.paperPublicId,
            requiredStatus: "draft",
          });
          if (advancedPaper === null) {
            return null;
          }

          if (input.action === "create") {
            const sectionRows = await listPaperSectionIdentityRows(
              scopedDatabase,
              advancedPaper.id,
            );
            if (input.sortOrder > sectionRows.length + 1) {
              throw new PaperMutationConflictError();
            }
            const [createdSection] = await transaction
              .insert(paperSection)
              .values({
                description: input.description,
                paper_id: advancedPaper.id,
                sort_order: -(sectionRows.length + 1),
                title: input.title,
                total_score: "0.0",
              })
              .returning({ publicId: paperSection.public_id });
            if (createdSection === undefined) {
              throw new PaperMutationConflictError();
            }
            const orderedPublicIds = sectionRows.map((row) => row.publicId);
            orderedPublicIds.splice(
              input.sortOrder - 1,
              0,
              createdSection.publicId,
            );
            await applyPaperSectionSortOrderPlan(
              scopedDatabase,
              advancedPaper.id,
              orderedPublicIds,
            );
          } else if (input.action === "update") {
            const [updatedSection] = await transaction
              .update(paperSection)
              .set({
                description: input.description,
                title: input.title,
                updated_at: new Date(),
              })
              .where(
                and(
                  eq(paperSection.paper_id, advancedPaper.id),
                  eq(paperSection.public_id, input.paperSectionPublicId),
                ),
              )
              .returning({ publicId: paperSection.public_id });
            if (updatedSection === undefined) {
              throw new PaperMutationConflictError();
            }
          } else if (input.action === "reorder") {
            const sectionRows = await listPaperSectionIdentityRows(
              scopedDatabase,
              advancedPaper.id,
            );
            if (
              !isExactPublicIdOrder(
                sectionRows.map((row) => row.publicId),
                input.paperSectionPublicIds,
              )
            ) {
              throw new PaperMutationConflictError();
            }
            await applyPaperSectionSortOrderPlan(
              scopedDatabase,
              advancedPaper.id,
              input.paperSectionPublicIds,
            );
          } else {
            const [sectionRow] = await transaction
              .select({ id: paperSection.id })
              .from(paperSection)
              .where(
                and(
                  eq(paperSection.paper_id, advancedPaper.id),
                  eq(paperSection.public_id, input.paperSectionPublicId),
                ),
              )
              .limit(1);
            if (sectionRow === undefined) {
              throw new PaperMutationConflictError();
            }
            const [groupCountRow] = await transaction
              .select({ value: count() })
              .from(questionGroup)
              .where(eq(questionGroup.paper_section_id, sectionRow.id));
            const [questionCountRow] = await transaction
              .select({ value: count() })
              .from(paperQuestion)
              .where(eq(paperQuestion.paper_section_id, sectionRow.id));
            if (
              (groupCountRow?.value ?? 0) !== 0 ||
              (questionCountRow?.value ?? 0) !== 0
            ) {
              throw new PaperMutationConflictError();
            }
            await transaction
              .delete(paperSection)
              .where(eq(paperSection.id, sectionRow.id));
            const remainingRows = await listPaperSectionIdentityRows(
              scopedDatabase,
              advancedPaper.id,
            );
            if (remainingRows.length > 0) {
              await applyPaperSectionSortOrderPlan(
                scopedDatabase,
                advancedPaper.id,
                remainingRows.map((row) => row.publicId),
              );
            }
          }

          const updatedPaper = await requirePaperByPublicId(
            scopedDatabase,
            input.paperPublicId,
          );
          await appendContentMutationAuditLog(
            scopedDatabase,
            context,
            input.paperPublicId,
          );
          return updatedPaper;
        });
      } catch (error) {
        if (error instanceof PaperMutationConflictError) {
          return null;
        }
        throw error;
      }
    },

    async mutateQuestionGroups(input, context) {
      const database = getDatabase();
      const actorAdminId = await resolveActorAdminId(database, context);

      try {
        return await database.transaction(async (transaction) => {
          const scopedDatabase = transaction as RuntimeDatabase;
          const advancedPaper = await advancePaperRevision(scopedDatabase, {
            actorAdminId,
            expectedRevision: input.expectedRevision,
            paperPublicId: input.paperPublicId,
            requiredStatus: "draft",
          });
          if (advancedPaper === null) {
            return null;
          }

          if (input.action === "create") {
            const sectionRow = await findPaperSectionIdentityRow(
              scopedDatabase,
              advancedPaper.id,
              input.paperSectionPublicId,
            );
            const materialId = await resolveMaterialId(
              scopedDatabase,
              input.materialPublicId,
            );
            const materialSnapshot =
              materialId === null
                ? null
                : await findMaterialSnapshotById(scopedDatabase, materialId);
            if (
              sectionRow === null ||
              materialId === null ||
              materialSnapshot === null ||
              materialSnapshot.profession !== advancedPaper.profession ||
              materialSnapshot.level !== advancedPaper.level ||
              materialSnapshot.subject !== advancedPaper.subject
            ) {
              throw new PaperMutationConflictError();
            }
            const groupRows = await listQuestionGroupIdentityRows(
              scopedDatabase,
              advancedPaper.id,
              sectionRow.id,
            );
            if (input.sortOrder > groupRows.length + 1) {
              throw new PaperMutationConflictError();
            }
            const [createdGroup] = await transaction
              .insert(questionGroup)
              .values({
                material_id: materialId,
                material_snapshot: materialSnapshot,
                paper_id: advancedPaper.id,
                paper_section_id: sectionRow.id,
                sort_order: -(groupRows.length + 1),
                title: input.title,
              })
              .returning({ publicId: questionGroup.public_id });
            if (createdGroup === undefined) {
              throw new PaperMutationConflictError();
            }
            const orderedPublicIds = groupRows.map((row) => row.publicId);
            orderedPublicIds.splice(
              input.sortOrder - 1,
              0,
              createdGroup.publicId,
            );
            await applyQuestionGroupSortOrderPlan(
              scopedDatabase,
              advancedPaper.id,
              sectionRow.id,
              orderedPublicIds,
            );
          } else if (input.action === "update") {
            const [updatedGroup] = await transaction
              .update(questionGroup)
              .set({ title: input.title, updated_at: new Date() })
              .where(
                and(
                  eq(questionGroup.paper_id, advancedPaper.id),
                  eq(questionGroup.public_id, input.questionGroupPublicId),
                  inArray(
                    questionGroup.paper_section_id,
                    transaction
                      .select({ id: paperSection.id })
                      .from(paperSection)
                      .where(eq(paperSection.paper_id, advancedPaper.id)),
                  ),
                ),
              )
              .returning({ publicId: questionGroup.public_id });
            if (updatedGroup === undefined) {
              throw new PaperMutationConflictError();
            }
          } else if (input.action === "reorder") {
            const sectionRow = await findPaperSectionIdentityRow(
              scopedDatabase,
              advancedPaper.id,
              input.paperSectionPublicId,
            );
            if (sectionRow === null) {
              throw new PaperMutationConflictError();
            }
            const groupRows = await listQuestionGroupIdentityRows(
              scopedDatabase,
              advancedPaper.id,
              sectionRow.id,
            );
            if (
              !isExactPublicIdOrder(
                groupRows.map((row) => row.publicId),
                input.questionGroupPublicIds,
              )
            ) {
              throw new PaperMutationConflictError();
            }
            await applyQuestionGroupSortOrderPlan(
              scopedDatabase,
              advancedPaper.id,
              sectionRow.id,
              input.questionGroupPublicIds,
            );
          } else if (input.action === "delete") {
            const [groupRow] = await transaction
              .select({
                id: questionGroup.id,
                paperSectionId: questionGroup.paper_section_id,
              })
              .from(questionGroup)
              .innerJoin(
                paperSection,
                eq(paperSection.id, questionGroup.paper_section_id),
              )
              .where(
                and(
                  eq(questionGroup.paper_id, advancedPaper.id),
                  eq(questionGroup.public_id, input.questionGroupPublicId),
                  eq(paperSection.paper_id, advancedPaper.id),
                ),
              )
              .limit(1);
            if (groupRow === undefined) {
              throw new PaperMutationConflictError();
            }
            const [questionCountRow] = await transaction
              .select({ value: count() })
              .from(paperQuestion)
              .where(eq(paperQuestion.question_group_id, groupRow.id));
            if ((questionCountRow?.value ?? 0) !== 0) {
              throw new PaperMutationConflictError();
            }
            await transaction
              .delete(questionGroup)
              .where(eq(questionGroup.id, groupRow.id));
            const remainingRows = await listQuestionGroupIdentityRows(
              scopedDatabase,
              advancedPaper.id,
              groupRow.paperSectionId,
            );
            if (remainingRows.length > 0) {
              await applyQuestionGroupSortOrderPlan(
                scopedDatabase,
                advancedPaper.id,
                groupRow.paperSectionId,
                remainingRows.map((row) => row.publicId),
              );
            }
          } else {
            const [paperQuestionRow] = await transaction
              .select({
                id: paperQuestion.id,
                paperId: paperQuestion.paper_id,
                paperSectionId: paperQuestion.paper_section_id,
                materialSnapshot: paperQuestion.material_snapshot,
              })
              .from(paperQuestion)
              .innerJoin(
                paperSection,
                eq(paperSection.id, paperQuestion.paper_section_id),
              )
              .where(
                and(
                  eq(paperQuestion.paper_id, advancedPaper.id),
                  eq(paperQuestion.public_id, input.paperQuestionPublicId),
                  eq(paperSection.paper_id, advancedPaper.id),
                ),
              )
              .limit(1);
            if (paperQuestionRow === undefined) {
              throw new PaperMutationConflictError();
            }

            let targetSectionId: number;
            let targetGroupId: number | null;
            if (input.questionGroupPublicId !== null) {
              const [groupRow] = await transaction
                .select({
                  id: questionGroup.id,
                  paperId: questionGroup.paper_id,
                  paperSectionId: questionGroup.paper_section_id,
                  sectionOwnerPaperId: paperSection.paper_id,
                  materialPublicId: material.public_id,
                })
                .from(questionGroup)
                .innerJoin(material, eq(material.id, questionGroup.material_id))
                .innerJoin(
                  paperSection,
                  eq(paperSection.id, questionGroup.paper_section_id),
                )
                .where(eq(questionGroup.public_id, input.questionGroupPublicId))
                .limit(1);
              const materialSnapshot = asNullableMaterialSnapshot(
                paperQuestionRow.materialSnapshot,
              );
              if (
                groupRow === undefined ||
                !isQuestionGroupMembershipCompatible({
                  paperId: paperQuestionRow.paperId,
                  paperSectionId: groupRow.paperSectionId,
                  materialPublicId: materialSnapshot?.materialPublicId ?? null,
                  groupPaperId: groupRow.paperId,
                  groupPaperSectionId: groupRow.paperSectionId,
                  groupSectionOwnerPaperId: groupRow.sectionOwnerPaperId,
                  groupMaterialPublicId: groupRow.materialPublicId,
                })
              ) {
                throw new PaperMutationConflictError();
              }
              targetSectionId = groupRow.paperSectionId;
              targetGroupId = groupRow.id;
            } else {
              const sectionRow = await findPaperSectionIdentityRow(
                scopedDatabase,
                advancedPaper.id,
                input.paperSectionPublicId as string,
              );
              if (sectionRow === null) {
                throw new PaperMutationConflictError();
              }
              targetSectionId = sectionRow.id;
              targetGroupId = null;
            }

            await transaction
              .update(paperQuestion)
              .set({
                paper_section_id: targetSectionId,
                question_group_id: targetGroupId,
                updated_at: new Date(),
              })
              .where(eq(paperQuestion.id, paperQuestionRow.id));
            await updatePaperSectionTotalScore(
              scopedDatabase,
              paperQuestionRow.paperSectionId,
            );
            if (targetSectionId !== paperQuestionRow.paperSectionId) {
              await updatePaperSectionTotalScore(
                scopedDatabase,
                targetSectionId,
              );
            }
          }

          const updatedPaper = await requirePaperByPublicId(
            scopedDatabase,
            input.paperPublicId,
          );
          await appendContentMutationAuditLog(
            scopedDatabase,
            context,
            input.paperPublicId,
          );
          return updatedPaper;
        });
      } catch (error) {
        if (error instanceof PaperMutationConflictError) {
          return null;
        }
        throw error;
      }
    },

    async publishPaper(input, context) {
      const database = getDatabase();
      const actorAdminId = await resolveActorAdminId(database, context);
      const requestHash = createPaperCommandRequestHash(input);

      return database.transaction(async (transaction) => {
        const scopedDatabase = transaction as RuntimeDatabase;
        const paperRow = await findPaperBaseByPublicId(
          scopedDatabase,
          input.paperPublicId,
        );
        if (paperRow === null) {
          return null;
        }

        const commandClaim = await claimPaperCommand(scopedDatabase, {
          actorAdminId,
          commandKind: "publish",
          commandPublicId: input.commandPublicId,
          paperId: paperRow.id,
          requestHash,
        });
        if (commandClaim.kind === "replay") {
          const replayedPaper = await findPaperByPublicId(
            scopedDatabase,
            commandClaim.resultPublicId,
          );

          if (replayedPaper !== null) {
            await appendContentMutationAuditLog(
              scopedDatabase,
              context,
              replayedPaper.public_id,
            );
          }

          return replayedPaper;
        }
        if (commandClaim.kind !== "claimed") {
          throw new PaperCommandConflictError();
        }

        const publishedAt = new Date();
        const [row] = await transaction
          .update(paper)
          .set({
            archived_at: null,
            paper_status: "published",
            published_at: publishedAt,
            revision: sql`${paper.revision} + 1`,
            updated_at: publishedAt,
            updated_by_admin_id: actorAdminId,
          })
          .where(
            and(
              eq(paper.public_id, input.paperPublicId),
              eq(paper.paper_status, "draft"),
              eq(paper.revision, input.expectedRevision),
            ),
          )
          .returning({ id: paper.id, public_id: paper.public_id });

        if (row === undefined) {
          await releasePaperCommand(scopedDatabase, commandClaim);
          return null;
        }

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

        await completePaperCommand(scopedDatabase, {
          commandId: commandClaim.id,
          paperId: row.id,
          resultPublicId: row.public_id,
        });

        const publishedPaper = await requirePaperByPublicId(
          scopedDatabase,
          row.public_id,
        );

        await appendContentMutationAuditLog(
          scopedDatabase,
          context,
          publishedPaper.public_id,
        );

        return publishedPaper;
      });
    },

    async archivePaper(input, context) {
      const database = getDatabase();
      const actorAdminId = await resolveActorAdminId(database, context);

      return database.transaction(async (transaction) => {
        const archivedAt = new Date();
        const [row] = await transaction
          .update(paper)
          .set({
            archived_at: archivedAt,
            paper_status: "archived",
            revision: sql`${paper.revision} + 1`,
            updated_at: archivedAt,
            updated_by_admin_id: actorAdminId,
          })
          .where(
            and(
              eq(paper.public_id, input.paperPublicId),
              eq(paper.paper_status, "published"),
              eq(paper.revision, input.expectedRevision),
            ),
          )
          .returning({ id: paper.id, public_id: paper.public_id });

        if (row === undefined) {
          return null;
        }

        await terminateUnfinishedPracticeForArchivedPaper(
          transaction as RuntimeDatabase,
          row.id,
          archivedAt,
        );
        await terminateUnfinishedMockExamForArchivedPaper(
          transaction as RuntimeDatabase,
          row.id,
          archivedAt,
        );

        const archivedPaper = await requirePaperByPublicId(
          transaction as RuntimeDatabase,
          row.public_id,
        );

        await appendContentMutationAuditLog(
          transaction as RuntimeDatabase,
          context,
          archivedPaper.public_id,
        );

        return archivedPaper;
      });
    },

    async deletePaper(input, context) {
      const database = getDatabase();
      return database.transaction(async (transaction) => {
        const scopedDatabase = transaction as RuntimeDatabase;
        const paperRow = await findPaperBaseByPublicId(
          scopedDatabase,
          input.paperPublicId,
        );

        if (paperRow === null) {
          return false;
        }

        const [practiceCount] = await transaction
          .select({ value: count() })
          .from(practice)
          .where(eq(practice.paper_id, paperRow.id));
        const [mockExamCount] = await transaction
          .select({ value: count() })
          .from(mockExam)
          .where(eq(mockExam.paper_id, paperRow.id));

        if (
          (practiceCount?.value ?? 0) > 0 ||
          (mockExamCount?.value ?? 0) > 0
        ) {
          return false;
        }

        const [deletedRow] = await transaction
          .delete(paper)
          .where(
            and(
              eq(paper.id, paperRow.id),
              eq(paper.paper_status, "draft"),
              eq(paper.revision, input.expectedRevision),
            ),
          )
          .returning({ public_id: paper.public_id });

        if (deletedRow === undefined) {
          return false;
        }

        await appendContentMutationAuditLog(
          scopedDatabase,
          context,
          deletedRow.public_id,
        );

        return true;
      });
    },

    async copyPaper(input, context) {
      const database = getDatabase();
      const actorAdminId = await resolveActorAdminId(database, context);
      const requestHash = createPaperCommandRequestHash(input);

      return database.transaction(async (transaction) => {
        const scopedDatabase = transaction as RuntimeDatabase;
        const commandClaim = await claimPaperCommand(scopedDatabase, {
          actorAdminId,
          commandKind: "copy",
          commandPublicId: input.commandPublicId,
          requestHash,
        });
        if (commandClaim.kind === "replay") {
          const replayedPaper = await findPaperByPublicId(
            scopedDatabase,
            commandClaim.resultPublicId,
          );

          if (replayedPaper !== null) {
            await appendContentMutationAuditLog(
              scopedDatabase,
              context,
              replayedPaper.public_id,
            );
          }

          return replayedPaper;
        }
        if (commandClaim.kind !== "claimed") {
          throw new PaperCommandConflictError();
        }

        const sourcePaper = await findCopySourcePaper(
          scopedDatabase,
          input.sourcePaperPublicId,
          input.expectedRevision,
        );
        if (sourcePaper === null) {
          await releasePaperCommand(scopedDatabase, commandClaim);
          return null;
        }

        const [paperRow] = await transaction
          .insert(paper)
          .values({
            created_by_admin_id: actorAdminId,
            duration_minute: sourcePaper.duration_minute,
            generation_method: sourcePaper.generation_method,
            level: sourcePaper.level,
            month: sourcePaper.month,
            name: `${sourcePaper.name}（副本）`,
            paper_status: "draft",
            paper_type: sourcePaper.paper_type,
            profession: sourcePaper.profession,
            public_id: `paper-${randomUUID()}`,
            question_basis: sourcePaper.question_basis,
            source: sourcePaper.source,
            source_organization: sourcePaper.source_organization,
            source_region: sourcePaper.source_region,
            subject: sourcePaper.subject,
            total_score: sourcePaper.total_score,
            updated_by_admin_id: actorAdminId,
            year: sourcePaper.year,
          })
          .returning({ id: paper.id, public_id: paper.public_id });

        if (paperRow === undefined) {
          throw new Error("Paper copy insert did not return a row.");
        }

        const sectionIdBySourceId = new Map<number, number>();

        for (const sourceSection of sourcePaper.paper_sections) {
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

          if (sectionRow === undefined) {
            throw new Error(
              "Paper copy section could not be resolved atomically.",
            );
          }

          sectionIdBySourceId.set(sourceSection.id, sectionRow.id);
        }

        const sourceQuestionByPublicId = new Map<
          string,
          SourceQuestionSnapshotRow
        >();
        const sourceQuestionPublicIds = [
          ...new Set(
            sourcePaper.paper_sections.flatMap((sourceSection) =>
              sourceSection.paper_questions.map(
                (sourcePaperQuestion) =>
                  sourcePaperQuestion.source_question_public_id,
              ),
            ),
          ),
        ].sort((left, right) => left.localeCompare(right));

        for (const sourceQuestionPublicId of sourceQuestionPublicIds) {
          const sourceQuestion = await findSourceQuestionByPublicId(
            transaction as RuntimeDatabase,
            { publicId: sourceQuestionPublicId },
          );

          if (sourceQuestion === null) {
            throw new Error(
              "Paper copy source question could not be resolved atomically.",
            );
          }
          sourceQuestionByPublicId.set(sourceQuestionPublicId, sourceQuestion);
        }

        const questionGroupIdBySourceId = new Map<number, number>();

        for (const sourceGroup of sourcePaper.question_groups) {
          const targetSectionId = sectionIdBySourceId.get(
            sourceGroup.paper_section_id,
          );
          const materialId = await resolveMaterialId(
            transaction as RuntimeDatabase,
            sourceGroup.material_public_id,
          );
          const materialSnapshot =
            materialId === null
              ? null
              : await findMaterialSnapshotById(
                  transaction as RuntimeDatabase,
                  materialId,
                );

          if (
            targetSectionId === undefined ||
            materialId === null ||
            materialSnapshot === null
          ) {
            throw new Error(
              "Paper copy group could not be resolved atomically.",
            );
          }

          const [groupRow] = await transaction
            .insert(questionGroup)
            .values({
              material_id: materialId,
              material_snapshot: materialSnapshot,
              paper_id: paperRow.id,
              paper_section_id: targetSectionId,
              sort_order: sourceGroup.sort_order,
              title: sourceGroup.title,
            })
            .returning({ id: questionGroup.id });

          if (groupRow === undefined) {
            throw new Error(
              "Paper copy group could not be resolved atomically.",
            );
          }

          questionGroupIdBySourceId.set(sourceGroup.id, groupRow.id);
        }

        for (const sourceSection of sourcePaper.paper_sections) {
          const targetSectionId = sectionIdBySourceId.get(sourceSection.id);

          if (targetSectionId === undefined) {
            throw new Error(
              "Paper copy section could not be resolved atomically.",
            );
          }

          for (const sourcePaperQuestion of sourceSection.paper_questions) {
            const sourceQuestion = sourceQuestionByPublicId.get(
              sourcePaperQuestion.source_question_public_id,
            );

            if (sourceQuestion === undefined) {
              throw new Error(
                "Paper copy source question could not be resolved atomically.",
              );
            }
            const materialSnapshot =
              sourceQuestion.material_id === null
                ? null
                : await findMaterialSnapshotById(
                    transaction as RuntimeDatabase,
                    sourceQuestion.material_id,
                  );
            if (
              sourceQuestion.material_id !== null &&
              materialSnapshot === null
            ) {
              throw new Error(
                "Paper copy source material could not be resolved atomically.",
              );
            }

            const sourceQuestionGroup =
              sourcePaperQuestion.question_group_id === null
                ? null
                : (sourcePaper.question_groups.find(
                    (questionGroupRow) =>
                      questionGroupRow.id ===
                      sourcePaperQuestion.question_group_id,
                  ) ?? null);
            const targetQuestionGroupId =
              sourcePaperQuestion.question_group_id === null
                ? null
                : questionGroupIdBySourceId.get(
                    sourcePaperQuestion.question_group_id,
                  );
            if (
              targetQuestionGroupId === undefined ||
              (sourceQuestionGroup !== null &&
                materialSnapshot?.materialPublicId !==
                  sourceQuestionGroup.material_public_id) ||
              (sourcePaperQuestion.question_group_id !== null &&
                sourceQuestionGroup === null)
            ) {
              throw new Error(
                "Paper copy group could not be resolved atomically.",
              );
            }

            const [newPaperQuestion] = await transaction
              .insert(paperQuestion)
              .values({
                material_snapshot: materialSnapshot,
                paper_id: paperRow.id,
                paper_section_id: targetSectionId,
                public_id: `paper-question-${randomUUID()}`,
                question_group_id: targetQuestionGroupId,
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

        await completePaperCommand(scopedDatabase, {
          commandId: commandClaim.id,
          paperId: paperRow.id,
          resultPublicId: paperRow.public_id,
        });

        const copiedPaper = await findPaperByPublicId(
          scopedDatabase,
          paperRow.public_id,
        );
        if (copiedPaper === null) {
          throw new Error("Paper copy could not be loaded atomically.");
        }

        await appendContentMutationAuditLog(
          scopedDatabase,
          context,
          copiedPaper.public_id,
        );

        return copiedPaper;
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

async function findCopySourcePaper(
  database: RuntimeDatabase,
  publicId: string,
  expectedRevision: number,
): Promise<PaperDraftAccessRow | null> {
  const [row] = await database
    .select()
    .from(paper)
    .where(
      and(
        eq(paper.public_id, publicId),
        eq(paper.revision, expectedRevision),
        inArray(paper.paper_status, ["published", "archived"]),
      ),
    )
    .limit(1)
    .for("share");

  if (row === undefined) {
    return null;
  }

  const [hydratedPaper] = await hydratePapers(database, [row]);

  return hydratedPaper ?? null;
}

async function requirePaperByPublicId(
  database: RuntimeDatabase,
  publicId: string,
): Promise<PaperDraftAccessRow> {
  const paperRow = await findPaperByPublicId(database, publicId);

  if (paperRow === null) {
    throw new Error("Mutated paper aggregate could not be loaded atomically.");
  }

  return paperRow;
}

async function requirePaperQuestionByPublicId(
  database: RuntimeDatabase,
  publicId: string,
): Promise<PaperQuestionAccessRow> {
  const paperQuestionRow = await findPaperQuestionByPublicId(
    database,
    publicId,
  );

  if (paperQuestionRow === null) {
    throw new Error("Mutated paper question could not be loaded atomically.");
  }

  return paperQuestionRow;
}

async function terminateUnfinishedPracticeForArchivedPaper(
  database: RuntimeDatabase,
  paperId: number,
  terminatedAt: Date,
): Promise<void> {
  await database
    .update(practice)
    .set({
      practice_status: "terminated",
      terminated_at: terminatedAt,
      termination_reason: PAPER_ARCHIVE_TERMINATION_REASON,
      updated_at: terminatedAt,
    })
    .where(
      and(
        eq(practice.paper_id, paperId),
        eq(practice.practice_status, "in_progress"),
      ),
    );
}

async function terminateUnfinishedMockExamForArchivedPaper(
  database: RuntimeDatabase,
  paperId: number,
  terminatedAt: Date,
): Promise<void> {
  await database
    .update(mockExam)
    .set({
      exam_status: "terminated",
      terminated_at: terminatedAt,
      termination_reason: PAPER_ARCHIVE_TERMINATION_REASON,
      updated_at: terminatedAt,
    })
    .where(
      and(
        eq(mockExam.paper_id, paperId),
        inArray(mockExam.exam_status, [
          "in_progress",
          "scoring",
          "scoring_partial_failed",
        ]),
      ),
    );
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
      public_id: questionGroup.public_id,
      material_public_id: material.public_id,
      material_snapshot: questionGroup.material_snapshot,
      paper_id: questionGroup.paper_id,
      paper_section_id: questionGroup.paper_section_id,
      paper_section_public_id: paperSection.public_id,
      sort_order: questionGroup.sort_order,
      title: questionGroup.title,
    })
    .from(questionGroup)
    .innerJoin(material, eq(material.id, questionGroup.material_id))
    .innerJoin(
      paperSection,
      eq(paperSection.id, questionGroup.paper_section_id),
    )
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
      question_group_public_id: questionGroup.public_id,
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
    question_group_public_id: paperQuestionRow.question_group_public_id,
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
        public_id: scoringPointRow.public_id,
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
        public_id: sectionRow.public_id,
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
        public_id: groupRow.public_id,
        paper_section_id: groupRow.paper_section_id,
        paper_section_public_id: groupRow.paper_section_public_id,
        material_public_id: groupRow.material_public_id,
        material_snapshot: asMaterialSnapshot(groupRow.material_snapshot),
        title: groupRow.title,
        sort_order: groupRow.sort_order,
      })),
  }));
}

async function findSourceQuestionByPublicId(
  database: RuntimeDatabase,
  input: SourceQuestionLookupInput,
): Promise<SourceQuestionSnapshotRow | null> {
  const conditions = [eq(question.public_id, input.publicId)];

  if (input.requiredStatus !== undefined) {
    conditions.push(eq(question.status, input.requiredStatus));
  }

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
      fill_blank_answers: question.fill_blank_answers,
      material_id: question.material_id,
    })
    .from(question)
    .where(and(...conditions))
    .limit(1)
    .for("share", { of: question });

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
    fillBlankAnswers: sourceQuestion.fill_blank_answers ?? [],
  };
}

type StructureIdentityRow = { id: number; publicId: string };

async function listPaperSectionIdentityRows(
  database: RuntimeDatabase,
  paperId: number,
): Promise<StructureIdentityRow[]> {
  return database
    .select({ id: paperSection.id, publicId: paperSection.public_id })
    .from(paperSection)
    .where(eq(paperSection.paper_id, paperId))
    .orderBy(asc(paperSection.sort_order));
}

async function findPaperSectionIdentityRow(
  database: RuntimeDatabase,
  paperId: number,
  publicId: string,
): Promise<StructureIdentityRow | null> {
  const [row] = await database
    .select({ id: paperSection.id, publicId: paperSection.public_id })
    .from(paperSection)
    .where(
      and(
        eq(paperSection.paper_id, paperId),
        eq(paperSection.public_id, publicId),
      ),
    )
    .limit(1);

  return row ?? null;
}

async function listQuestionGroupIdentityRows(
  database: RuntimeDatabase,
  paperId: number,
  paperSectionId: number,
): Promise<StructureIdentityRow[]> {
  return database
    .select({ id: questionGroup.id, publicId: questionGroup.public_id })
    .from(questionGroup)
    .where(
      and(
        eq(questionGroup.paper_id, paperId),
        eq(questionGroup.paper_section_id, paperSectionId),
      ),
    )
    .orderBy(asc(questionGroup.sort_order));
}

async function applyPaperSectionSortOrderPlan(
  database: RuntimeDatabase,
  paperId: number,
  publicIds: string[],
): Promise<void> {
  const plan = createTwoPhaseSortOrderPlan(publicIds);
  for (const item of plan) {
    await database
      .update(paperSection)
      .set({ sort_order: item.temporarySortOrder, updated_at: new Date() })
      .where(
        and(
          eq(paperSection.paper_id, paperId),
          eq(paperSection.public_id, item.publicId),
        ),
      );
  }
  for (const item of plan) {
    await database
      .update(paperSection)
      .set({ sort_order: item.finalSortOrder, updated_at: new Date() })
      .where(
        and(
          eq(paperSection.paper_id, paperId),
          eq(paperSection.public_id, item.publicId),
        ),
      );
  }
}

async function applyQuestionGroupSortOrderPlan(
  database: RuntimeDatabase,
  paperId: number,
  paperSectionId: number,
  publicIds: string[],
): Promise<void> {
  const plan = createTwoPhaseSortOrderPlan(publicIds);
  for (const item of plan) {
    await database
      .update(questionGroup)
      .set({ sort_order: item.temporarySortOrder, updated_at: new Date() })
      .where(
        and(
          eq(questionGroup.paper_id, paperId),
          eq(questionGroup.paper_section_id, paperSectionId),
          eq(questionGroup.public_id, item.publicId),
        ),
      );
  }
  for (const item of plan) {
    await database
      .update(questionGroup)
      .set({ sort_order: item.finalSortOrder, updated_at: new Date() })
      .where(
        and(
          eq(questionGroup.paper_id, paperId),
          eq(questionGroup.paper_section_id, paperSectionId),
          eq(questionGroup.public_id, item.publicId),
        ),
      );
  }
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

async function resolveQuestionGroup(
  database: RuntimeDatabase,
  paperId: number,
  paperSectionId: number,
  input: NonNullable<NormalizedAddPaperQuestionInput["questionGroup"]>,
): Promise<number | undefined> {
  const materialId = await resolveMaterialId(database, input.materialPublicId);

  if (materialId === null) {
    return undefined;
  }

  if (input.publicId !== null) {
    const [existingGroup] = await database
      .select({ id: questionGroup.id })
      .from(questionGroup)
      .where(
        and(
          eq(questionGroup.public_id, input.publicId),
          eq(questionGroup.paper_id, paperId),
          eq(questionGroup.paper_section_id, paperSectionId),
          eq(questionGroup.material_id, materialId),
          eq(questionGroup.sort_order, input.sortOrder),
          eq(questionGroup.title, input.title),
        ),
      )
      .limit(1);

    return existingGroup?.id;
  }

  const [occupiedSortOrder] = await database
    .select({ id: questionGroup.id })
    .from(questionGroup)
    .where(
      and(
        eq(questionGroup.paper_id, paperId),
        eq(questionGroup.paper_section_id, paperSectionId),
        eq(questionGroup.sort_order, input.sortOrder),
      ),
    )
    .limit(1);

  if (occupiedSortOrder !== undefined) {
    return undefined;
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
    .limit(1)
    .for("share");

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
): Promise<{
  id: number;
  paper_id: number;
  paper_section_id: number;
  question_group_id: number | null;
} | null> {
  const [row] = await database
    .select({
      id: paperQuestion.id,
      paper_id: paperQuestion.paper_id,
      paper_section_id: paperQuestion.paper_section_id,
      question_group_id: paperQuestion.question_group_id,
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
        public_id: scoringPointRow.public_id,
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

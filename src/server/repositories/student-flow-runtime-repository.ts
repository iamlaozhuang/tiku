import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  ilike,
  inArray,
  lte,
  or,
  sql,
  type SQL,
} from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import * as databaseSchema from "@/db/schema";
import type { AuthorizationType } from "../contracts/effective-authorization-contract";
import type { AnswerRecordStatus } from "../models/student-experience";
import type {
  ExamReportAnswerRecordRow,
  ExamReportAiScoringEvidenceRow,
  ExamReportRepository,
  ExamReportRow,
} from "./exam-report-repository";
import type {
  MockExamAnswerRecordRow,
  MockExamRepository,
  MockExamRow,
} from "./mock-exam-repository";
import type {
  PracticeAnswerRecordRow,
  PracticeRepository,
  PracticeRow,
} from "./practice-repository";
import { createRuntimeDatabaseForSchema } from "./runtime-database";
import { createOrgAuthCoversOrganizationCondition } from "./organization-scope-query";
import type {
  StudentPaperAuthorizationScopeRow,
  StudentPaperRepository,
  StudentPublishedPaperRow,
} from "./student-paper-repository";

type StudentFlowRuntimeDatabase = PostgresJsDatabase<typeof databaseSchema>;

export type StudentFlowRuntimeRepositoryOptions = {
  createDatabase?: () => StudentFlowRuntimeDatabase;
  now?: () => Date;
};

export type StudentFlowRuntimeRepositories = {
  studentPaperRepository: StudentPaperRepository;
  practiceRepository: PracticeRepository;
  mockExamRepository: MockExamRepository;
  examReportRepository: ExamReportRepository;
};

export class PaperStartConflictError extends Error {
  constructor() {
    super("Paper is no longer published.");
    this.name = "PaperStartConflictError";
  }
}

export class PaperSnapshotIntegrityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PaperSnapshotIntegrityError";
  }
}

const {
  aiScoringAttempt,
  aiScoringTask,
  answerRecord,
  examReport,
  mistakeBook,
  mockExam,
  mockExamDeadlineTask,
  employee,
  employeeOrgAuth,
  organization,
  orgAuth,
  paper,
  paperQuestion,
  paperScoringPoint,
  paperSection,
  personalAuth,
  practice,
  questionGroup,
  user,
} = databaseSchema;

export function createExamReportAuthorizationScopeCondition(
  scopes: StudentPaperAuthorizationScopeRow[],
): SQL | null {
  const scopeConditions = scopes.map((scope) =>
    and(
      eq(mockExam.profession, scope.profession),
      eq(mockExam.level, scope.level),
    ),
  );

  return scopeConditions.length === 0 ? null : or(...scopeConditions)!;
}

function createLazyDatabaseGetter(
  createDatabase: () => StudentFlowRuntimeDatabase,
): () => StudentFlowRuntimeDatabase {
  let cachedDatabase: StudentFlowRuntimeDatabase | undefined;

  return () => {
    cachedDatabase ??= createDatabase();

    return cachedDatabase;
  };
}

function getNow(options: StudentFlowRuntimeRepositoryOptions): Date {
  return options.now?.() ?? new Date();
}

function formatRepositoryScore(value: number): string {
  return value.toFixed(1);
}

function createLocalRuntimeDatabase(): StudentFlowRuntimeDatabase {
  return createRuntimeDatabaseForSchema(
    databaseSchema,
    "DATABASE_URL is required for student flow runtime.",
  );
}

export function createPostgresStudentFlowRepositories(
  options: StudentFlowRuntimeRepositoryOptions = {},
): StudentFlowRuntimeRepositories {
  const getDatabase = createLazyDatabaseGetter(
    options.createDatabase ?? createLocalRuntimeDatabase,
  );

  return {
    studentPaperRepository: createPostgresStudentPaperRepository(
      getDatabase,
      options,
    ),
    practiceRepository: createPostgresPracticeRepository(getDatabase, options),
    mockExamRepository: createPostgresMockExamRepository(getDatabase, options),
    examReportRepository: createPostgresExamReportRepository(
      getDatabase,
      options,
    ),
  };
}

function createPostgresStudentPaperRepository(
  getDatabase: () => StudentFlowRuntimeDatabase,
  options: StudentFlowRuntimeRepositoryOptions,
): StudentPaperRepository {
  return {
    async listEffectiveAuthorizationScopes(query) {
      return listEffectiveAuthorizationScopes(
        getDatabase(),
        query.userPublicId,
        getNow(options),
      );
    },
    async listPublishedPapers(query) {
      const database = getDatabase();
      const conditions = [
        eq(paper.paper_status, "published"),
        eq(paper.profession, query.profession),
        eq(paper.level, query.level),
      ];

      if (query.subject !== null) {
        conditions.push(eq(paper.subject, query.subject));
      }

      const orderBy =
        query.sortOrder === "asc"
          ? asc(paper.published_at)
          : desc(paper.published_at);
      const [totalRow] = await database
        .select({ value: count() })
        .from(paper)
        .where(and(...conditions));
      const rows = await database
        .select({
          public_id: paper.public_id,
          name: paper.name,
          profession: paper.profession,
          level: paper.level,
          subject: paper.subject,
          paper_type: paper.paper_type,
          duration_minute: paper.duration_minute,
          total_score: paper.total_score,
          published_at: paper.published_at,
        })
        .from(paper)
        .where(and(...conditions))
        .orderBy(orderBy)
        .limit(query.pageSize)
        .offset((query.page - 1) * query.pageSize);
      const questionCounts = await listQuestionCounts(
        database,
        rows.map((row) => row.public_id),
      );

      return {
        rows: rows.map((row) => ({
          ...row,
          question_count: questionCounts.get(row.public_id) ?? 0,
          paper_snapshot: {},
        })),
        total: totalRow?.value ?? 0,
      };
    },
    async findPublishedPaperByPublicId(query) {
      return findPublishedPaperByPublicId(getDatabase(), query.publicId);
    },
  };
}

function createPostgresPracticeRepository(
  getDatabase: () => StudentFlowRuntimeDatabase,
  options: StudentFlowRuntimeRepositoryOptions,
): PracticeRepository {
  return {
    async listEffectiveAuthorizationScopes(query) {
      return listEffectiveAuthorizationScopes(
        getDatabase(),
        query.userPublicId,
        getNow(options),
      );
    },
    async findPublishedPaperByPublicId(query) {
      const row = await findPublishedPaperByPublicId(
        getDatabase(),
        query.paperPublicId,
      );

      return row === null
        ? null
        : {
            public_id: row.public_id,
            profession: row.profession,
            level: row.level,
            subject: row.subject,
            paper_snapshot: row.paper_snapshot,
          };
    },
    async findActivePracticeByPaper(query) {
      const database = getDatabase();
      const userId = await findUserIdByPublicId(database, query.userPublicId);

      if (userId === null) {
        return null;
      }

      const [row] = await database
        .select()
        .from(practice)
        .where(
          and(
            eq(practice.user_id, userId),
            eq(practice.paper_public_id, query.paperPublicId),
            eq(practice.practice_status, "in_progress"),
          ),
        )
        .orderBy(
          sql`${practice.last_answered_at} desc nulls last`,
          desc(practice.updated_at),
          desc(practice.started_at),
        )
        .limit(1);

      return row === undefined ? null : mapPracticeRow(row);
    },
    async findPracticeByPublicId(query) {
      const database = getDatabase();
      const userId = await findUserIdByPublicId(database, query.userPublicId);

      if (userId === null) {
        return null;
      }

      const [row] = await database
        .select()
        .from(practice)
        .where(
          and(
            eq(practice.user_id, userId),
            eq(practice.public_id, query.publicId),
          ),
        )
        .limit(1);

      return row === undefined ? null : mapPracticeRow(row);
    },
    async createPractice(input) {
      const database = getDatabase();
      const userId = await getRequiredUserId(database, input.userPublicId);
      return database.transaction(async (transaction) => {
        const paperId = await getRequiredPublishedPaperIdForStart(
          transaction as StudentFlowRuntimeDatabase,
          input.paperPublicId,
        );
        const [row] = await transaction
          .insert(practice)
          .values({
            public_id: input.publicId,
            user_id: userId,
            paper_id: paperId,
            paper_public_id: input.paperPublicId,
            paper_snapshot: input.paperSnapshot,
            profession: input.profession,
            level: input.level,
            subject: input.subject,
            practice_status: "in_progress",
            started_at: input.startedAt,
            last_answered_at: null,
            expires_at: input.expiresAt,
            terminated_at: null,
            termination_reason: null,
          })
          .returning();

        if (row === undefined) {
          throw new Error("Practice insert did not return a row.");
        }

        return mapPracticeRow(row);
      });
    },
    async expirePractice(input) {
      await getDatabase()
        .update(practice)
        .set({
          practice_status: "expired",
          updated_at: input.expiredAt,
        })
        .where(eq(practice.public_id, input.publicId));
    },
    async terminatePractice(input) {
      const [row] = await getDatabase()
        .update(practice)
        .set({
          practice_status: "terminated",
          terminated_at: input.terminatedAt,
          termination_reason: input.terminationReason,
          updated_at: input.terminatedAt,
        })
        .where(eq(practice.public_id, input.publicId))
        .returning();

      return row === undefined ? null : mapPracticeRow(row);
    },
    async findAnswerRecordByPracticeAndQuestion(input) {
      const database = getDatabase();
      const userId = await findUserIdByPublicId(database, input.userPublicId);

      if (userId === null) {
        return null;
      }

      const [practiceRow] = await database
        .select({ id: practice.id })
        .from(practice)
        .where(eq(practice.public_id, input.practicePublicId))
        .limit(1);

      if (practiceRow === undefined) {
        return null;
      }

      const [row] = await database
        .select()
        .from(answerRecord)
        .where(
          and(
            eq(answerRecord.user_id, userId),
            eq(answerRecord.practice_id, practiceRow.id),
            eq(
              answerRecord.paper_question_public_id,
              input.paperQuestionPublicId,
            ),
          ),
        )
        .limit(1);

      return row === undefined ? null : mapPracticeAnswerRecordRow(row);
    },
    async listAnswerRecordsByPractice(input) {
      const database = getDatabase();
      const userId = await findUserIdByPublicId(database, input.userPublicId);

      if (userId === null) {
        return [];
      }

      const [practiceRow] = await database
        .select({ id: practice.id })
        .from(practice)
        .where(
          and(
            eq(practice.user_id, userId),
            eq(practice.public_id, input.practicePublicId),
          ),
        )
        .limit(1);

      if (practiceRow === undefined) {
        return [];
      }

      const rows = await database
        .select()
        .from(answerRecord)
        .where(
          and(
            eq(answerRecord.user_id, userId),
            eq(answerRecord.practice_id, practiceRow.id),
          ),
        )
        .orderBy(asc(answerRecord.answered_at));

      return rows.map(mapPracticeAnswerRecordRow);
    },
    async createPracticeAnswerRecord(input) {
      const database = getDatabase();
      const userId = await getRequiredUserId(database, input.userPublicId);
      const practiceLink = await getRequiredPracticeLink(
        database,
        input.practicePublicId,
      );
      const paperQuestionId = await getRequiredPaperQuestionId(
        database,
        input.paperQuestionPublicId,
      );
      const [row] = await database
        .insert(answerRecord)
        .values({
          public_id: input.publicId,
          user_id: userId,
          exam_mode: "practice",
          practice_id: practiceLink.id,
          mock_exam_id: null,
          paper_id: practiceLink.paper_id,
          paper_question_id: paperQuestionId,
          paper_question_public_id: input.paperQuestionPublicId,
          question_public_id: input.questionPublicId,
          question_snapshot: input.questionSnapshot,
          answer_snapshot: input.answerSnapshot,
          answer_record_status: input.answerRecordStatus,
          is_correct: input.isCorrect,
          score: input.score,
          max_score: input.maxScore,
          answered_at: input.answeredAt,
          submitted_at: input.submittedAt,
        })
        .returning();

      if (row === undefined) {
        throw new Error("Practice answer insert did not return a row.");
      }

      return mapPracticeAnswerRecordRow(row);
    },
    async updatePracticeLastAnsweredAt(input) {
      await getDatabase()
        .update(practice)
        .set({
          last_answered_at: input.lastAnsweredAt,
          updated_at: input.lastAnsweredAt,
        })
        .where(eq(practice.public_id, input.publicId));
    },
    async upsertMistakeBookFromWrongAnswer(input) {
      const database = getDatabase();
      const userId = await getRequiredUserId(database, input.userPublicId);
      const [existingRow] = await database
        .select({
          public_id: mistakeBook.public_id,
          wrong_count: mistakeBook.wrong_count,
        })
        .from(mistakeBook)
        .where(
          and(
            eq(mistakeBook.user_id, userId),
            eq(mistakeBook.question_public_id, input.questionPublicId),
          ),
        )
        .limit(1);

      if (existingRow !== undefined) {
        const [updatedRow] = await database
          .update(mistakeBook)
          .set({
            latest_answer_snapshot: input.latestAnswerSnapshot,
            latest_wrong_at: input.latestWrongAt,
            mistake_book_status: "unmastered",
            is_removed: false,
            wrong_count: existingRow.wrong_count + 1,
            updated_at: input.latestWrongAt,
          })
          .where(eq(mistakeBook.public_id, existingRow.public_id))
          .returning({ public_id: mistakeBook.public_id });

        return updatedRow ?? { public_id: existingRow.public_id };
      }

      const [row] = await database
        .insert(mistakeBook)
        .values({
          public_id: input.publicId,
          user_id: userId,
          question_public_id: input.questionPublicId,
          paper_question_public_id: input.paperQuestionPublicId,
          profession: input.profession,
          level: input.level,
          subject: input.subject,
          question_snapshot: input.questionSnapshot,
          latest_answer_snapshot: input.latestAnswerSnapshot,
          mistake_book_source: "wrong_answer",
          mistake_book_status: "unmastered",
          wrong_count: 1,
          is_favorite: false,
          is_removed: false,
          mastered_at: null,
          latest_wrong_at: input.latestWrongAt,
        })
        .returning({ public_id: mistakeBook.public_id });

      if (row === undefined) {
        throw new Error("Mistake book insert did not return a row.");
      }

      return row;
    },
    async upsertMistakeBookFromFavorite(input) {
      const database = getDatabase();
      const userId = await getRequiredUserId(database, input.userPublicId);
      const [existingRow] = await database
        .select({
          public_id: mistakeBook.public_id,
          mistake_book_status: mistakeBook.mistake_book_status,
        })
        .from(mistakeBook)
        .where(
          and(
            eq(mistakeBook.user_id, userId),
            eq(mistakeBook.question_public_id, input.questionPublicId),
          ),
        )
        .limit(1);

      if (existingRow !== undefined) {
        const nextStatus =
          existingRow.mistake_book_status === "removed"
            ? "unmastered"
            : existingRow.mistake_book_status;
        const [updatedRow] = await database
          .update(mistakeBook)
          .set({
            mistake_book_status: nextStatus,
            is_favorite: true,
            is_removed: false,
            updated_at: input.favoritedAt,
          })
          .where(eq(mistakeBook.public_id, existingRow.public_id))
          .returning({ public_id: mistakeBook.public_id });

        return updatedRow ?? { public_id: existingRow.public_id };
      }

      const [row] = await database
        .insert(mistakeBook)
        .values({
          public_id: input.publicId,
          user_id: userId,
          question_public_id: input.questionPublicId,
          paper_question_public_id: input.paperQuestionPublicId,
          profession: input.profession,
          level: input.level,
          subject: input.subject,
          question_snapshot: input.questionSnapshot,
          latest_answer_snapshot: input.latestAnswerSnapshot,
          mistake_book_source: "favorite",
          mistake_book_status: "unmastered",
          wrong_count: 0,
          is_favorite: true,
          is_removed: false,
          mastered_at: null,
          latest_wrong_at: null,
          created_at: input.favoritedAt,
          updated_at: input.favoritedAt,
        })
        .returning({ public_id: mistakeBook.public_id });

      if (row === undefined) {
        throw new Error("Mistake book favorite insert did not return a row.");
      }

      return row;
    },
  };
}

function createPostgresMockExamRepository(
  getDatabase: () => StudentFlowRuntimeDatabase,
  options: StudentFlowRuntimeRepositoryOptions,
): MockExamRepository {
  return {
    async listEffectiveAuthorizationScopes(query) {
      return listEffectiveAuthorizationScopes(
        getDatabase(),
        query.userPublicId,
        getNow(options),
      );
    },
    async findPublishedPaperByPublicId(query) {
      const row = await findPublishedPaperByPublicId(
        getDatabase(),
        query.paperPublicId,
      );

      return row === null
        ? null
        : {
            public_id: row.public_id,
            profession: row.profession,
            level: row.level,
            subject: row.subject,
            duration_minute: row.duration_minute,
            paper_snapshot: row.paper_snapshot,
          };
    },
    async findActiveMockExamByPaper(query) {
      const database = getDatabase();
      const userId = await findUserIdByPublicId(database, query.userPublicId);

      if (userId === null) {
        return null;
      }

      const [row] = await database
        .select()
        .from(mockExam)
        .where(
          and(
            eq(mockExam.user_id, userId),
            eq(mockExam.paper_public_id, query.paperPublicId),
            eq(mockExam.exam_status, "in_progress"),
          ),
        )
        .limit(1);

      return row === undefined
        ? null
        : mapMockExamRow(row, await countMockExamAnswers(database, row.id));
    },
    async findMockExamByPublicId(query) {
      const row = await findOwnedMockExamRow(
        getDatabase(),
        query.userPublicId,
        query.publicId,
      );

      return row;
    },
    async createMockExam(input) {
      const database = getDatabase();
      const userId = await getRequiredUserId(database, input.userPublicId);
      return database.transaction(async (transaction) => {
        const paperId = await getRequiredPublishedPaperIdForStart(
          transaction as StudentFlowRuntimeDatabase,
          input.paperPublicId,
        );
        const [row] = await transaction
          .insert(mockExam)
          .values({
            public_id: input.publicId,
            user_id: userId,
            paper_id: paperId,
            paper_public_id: input.paperPublicId,
            paper_snapshot: input.paperSnapshot,
            profession: input.profession,
            level: input.level,
            subject: input.subject,
            exam_status: "in_progress",
            started_at: input.startedAt,
            submitted_at: null,
            server_deadline_at: input.serverDeadlineAt,
            duration_minute: input.durationMinute,
            terminated_at: null,
            termination_reason: null,
            objective_score: null,
            subjective_score: null,
            total_score: null,
          })
          .returning();

        if (row === undefined) {
          throw new Error("Mock exam insert did not return a row.");
        }

        if (
          input.serverDeadlineAt !== null &&
          input.deadlineTaskPublicId !== null
        ) {
          await transaction.insert(mockExamDeadlineTask).values({
            public_id: input.deadlineTaskPublicId,
            mock_exam_id: row.id,
            task_status: "pending",
            scheduled_at: input.serverDeadlineAt,
            attempt_count: 0,
            max_attempt_count: 5,
            claimed_at: null,
            lease_expires_at: null,
            worker_public_id: null,
            failure_message_digest: null,
            completed_at: null,
          });
        }

        return mapMockExamRow(row, 0);
      });
    },
    async saveMockExamAnswerRecord(input) {
      const database = getDatabase();
      const userId = await getRequiredUserId(database, input.userPublicId);
      const clientSavedAt =
        input.answerSnapshot.savedFromClientAt === null
          ? null
          : new Date(input.answerSnapshot.savedFromClientAt);

      try {
        return await database.transaction(async (transaction) => {
          const mockExamLink = await findWritableMockExamLink(
            transaction as StudentFlowRuntimeDatabase,
            userId,
            input.mockExamPublicId,
          );

          if (mockExamLink === null) {
            return { status: "not_writable" as const, answerRecord: null };
          }

          const paperQuestionId = await getRequiredPaperQuestionId(
            transaction as StudentFlowRuntimeDatabase,
            input.paperQuestionPublicId,
          );
          const [operationOwner] = await transaction
            .select()
            .from(answerRecord)
            .where(
              and(
                eq(answerRecord.mock_exam_id, mockExamLink.id),
                eq(answerRecord.client_operation_id, input.operationId),
              ),
            )
            .limit(1);

          if (operationOwner !== undefined) {
            return operationOwner.paper_question_public_id ===
              input.paperQuestionPublicId
              ? {
                  status: "replayed" as const,
                  answerRecord: mapMockExamAnswerRecordRow(operationOwner),
                }
              : {
                  status: "operation_conflict" as const,
                  answerRecord: null,
                };
          }

          const answerScopeCondition = and(
            eq(answerRecord.user_id, userId),
            eq(answerRecord.mock_exam_id, mockExamLink.id),
            eq(
              answerRecord.paper_question_public_id,
              input.paperQuestionPublicId,
            ),
          );
          const [existingRow] = await transaction
            .select()
            .from(answerRecord)
            .where(answerScopeCondition)
            .limit(1)
            .for("update");

          if (existingRow !== undefined) {
            if (existingRow.client_operation_id === input.operationId) {
              return {
                status: "replayed" as const,
                answerRecord: mapMockExamAnswerRecordRow(existingRow),
              };
            }

            if (existingRow.answer_revision !== input.expectedRevision) {
              return {
                status: "stale" as const,
                answerRecord: mapMockExamAnswerRecordRow(existingRow),
              };
            }

            const [updatedRow] = await transaction
              .update(answerRecord)
              .set({
                answer_snapshot: input.answerSnapshot,
                answer_revision: input.expectedRevision + 1,
                client_operation_id: input.operationId,
                client_saved_at: clientSavedAt,
                answer_record_status: input.answerRecordStatus,
                answered_at: input.answeredAt,
                updated_at: input.answeredAt,
              })
              .where(
                and(
                  eq(answerRecord.id, existingRow.id),
                  eq(answerRecord.answer_revision, input.expectedRevision),
                ),
              )
              .returning();

            return updatedRow === undefined
              ? {
                  status: "stale" as const,
                  answerRecord: mapMockExamAnswerRecordRow(existingRow),
                }
              : {
                  status: "saved" as const,
                  answerRecord: mapMockExamAnswerRecordRow(updatedRow),
                };
          }

          if (input.expectedRevision !== 0) {
            return { status: "stale" as const, answerRecord: null };
          }

          const [insertedRow] = await transaction
            .insert(answerRecord)
            .values({
              public_id: input.publicId,
              user_id: userId,
              exam_mode: "mock_exam",
              practice_id: null,
              mock_exam_id: mockExamLink.id,
              paper_id: mockExamLink.paper_id,
              paper_question_id: paperQuestionId,
              paper_question_public_id: input.paperQuestionPublicId,
              question_public_id: input.questionPublicId,
              question_snapshot: input.questionSnapshot,
              answer_snapshot: input.answerSnapshot,
              answer_revision: 1,
              client_operation_id: input.operationId,
              client_saved_at: clientSavedAt,
              answer_record_status: input.answerRecordStatus,
              is_correct: input.isCorrect,
              score: input.score,
              max_score: input.maxScore,
              answered_at: input.answeredAt,
              submitted_at: null,
            })
            .onConflictDoNothing()
            .returning();

          if (insertedRow !== undefined) {
            return {
              status: "saved" as const,
              answerRecord: mapMockExamAnswerRecordRow(insertedRow),
            };
          }

          const [concurrentRow] = await transaction
            .select()
            .from(answerRecord)
            .where(answerScopeCondition)
            .limit(1);

          if (concurrentRow === undefined) {
            return {
              status: "operation_conflict" as const,
              answerRecord: null,
            };
          }

          return {
            status:
              concurrentRow.client_operation_id === input.operationId
                ? ("replayed" as const)
                : ("stale" as const),
            answerRecord: mapMockExamAnswerRecordRow(concurrentRow),
          };
        });
      } catch (error) {
        if (isAnswerOperationIdConflict(error)) {
          return { status: "operation_conflict" as const, answerRecord: null };
        }

        throw error;
      }
    },
    async listMockExamAnswerRecords(query) {
      return listMockExamAnswerRecords(
        getDatabase(),
        query.userPublicId,
        query.mockExamPublicId,
      );
    },
    async supplementMissingMockExamAnswers(input) {
      const database = getDatabase();

      return database.transaction(async (transaction) => {
        const userId = await findUserIdByPublicId(
          transaction as StudentFlowRuntimeDatabase,
          input.userPublicId,
        );

        if (userId === null) {
          return null;
        }

        const [ownedMockExam] = await transaction
          .select()
          .from(mockExam)
          .where(
            and(
              eq(mockExam.user_id, userId),
              eq(mockExam.public_id, input.mockExamPublicId),
              inArray(mockExam.exam_status, [
                "completed",
                "scoring",
                "scoring_partial_failed",
              ]),
            ),
          )
          .limit(1)
          .for("update");

        if (ownedMockExam === undefined) {
          return null;
        }

        let supplementedCount = 0;

        for (const supplementalAnswer of input.answers) {
          const paperQuestionId = await getRequiredPaperQuestionId(
            transaction as StudentFlowRuntimeDatabase,
            supplementalAnswer.paperQuestionPublicId,
          );
          const [insertedAnswer] = await transaction
            .insert(answerRecord)
            .values({
              public_id: supplementalAnswer.publicId,
              user_id: userId,
              exam_mode: "mock_exam",
              practice_id: null,
              mock_exam_id: ownedMockExam.id,
              paper_id: ownedMockExam.paper_id,
              paper_question_id: paperQuestionId,
              paper_question_public_id:
                supplementalAnswer.paperQuestionPublicId,
              question_public_id: supplementalAnswer.questionPublicId,
              question_snapshot: supplementalAnswer.questionSnapshot,
              answer_snapshot: supplementalAnswer.answerSnapshot,
              answer_revision: 1,
              client_operation_id: supplementalAnswer.operationId,
              client_saved_at: supplementalAnswer.clientSavedAt,
              answer_record_status: supplementalAnswer.answerRecordStatus,
              is_correct: supplementalAnswer.isCorrect,
              score: supplementalAnswer.score,
              max_score: supplementalAnswer.maxScore,
              answered_at: input.supplementedAt,
              submitted_at: input.supplementedAt,
              created_at: input.supplementedAt,
              updated_at: input.supplementedAt,
            })
            .onConflictDoNothing()
            .returning();

          if (insertedAnswer === undefined) {
            const [existingAnswer] = await transaction
              .select({
                paper_question_public_id: answerRecord.paper_question_public_id,
              })
              .from(answerRecord)
              .where(
                and(
                  eq(answerRecord.mock_exam_id, ownedMockExam.id),
                  eq(
                    answerRecord.paper_question_public_id,
                    supplementalAnswer.paperQuestionPublicId,
                  ),
                ),
              )
              .limit(1);

            if (existingAnswer === undefined) {
              throw new Error(
                "Supplemental answer operation id conflicts with another question.",
              );
            }

            continue;
          }

          supplementedCount += 1;

          if (supplementalAnswer.aiScoringTask !== null) {
            const task = supplementalAnswer.aiScoringTask;

            if (
              task.answerRecordPublicId !== insertedAnswer.public_id ||
              task.mockExamPublicId !== ownedMockExam.public_id ||
              task.actorPublicId !== input.userPublicId
            ) {
              throw new Error(
                "Supplemental AI scoring task answer scope is invalid.",
              );
            }

            await transaction.insert(aiScoringTask).values({
              public_id: task.publicId,
              answer_record_id: insertedAnswer.id,
              mock_exam_public_id: task.mockExamPublicId,
              actor_public_id: task.actorPublicId,
              idempotency_key_hash: task.idempotencyKeyHash,
              task_status: "pending",
              attempt_count: 0,
              max_attempt_count: task.maxAttemptCount,
              timeout_second: task.timeoutSecond,
              model_config_snapshot: task.modelConfigSnapshot,
              prompt_template_key: task.promptTemplateKey,
              prompt_template_version: task.promptTemplateVersion,
              prompt_template_hash: task.promptTemplateHash,
              input_snapshot: task.inputSnapshot,
              authorization_snapshot: task.authorizationSnapshot,
              rag_snapshot: task.ragSnapshot,
              result_snapshot: null,
              ai_call_log_id: null,
              failure_code: null,
              failure_message_digest: null,
              scheduled_at: task.scheduledAt,
              claimed_at: null,
              lease_expires_at: null,
              worker_public_id: null,
              completed_at: null,
              created_at: input.supplementedAt,
              updated_at: input.supplementedAt,
            });
          }
        }

        const answerRows = await transaction
          .select()
          .from(answerRecord)
          .where(
            and(
              eq(answerRecord.user_id, userId),
              eq(answerRecord.mock_exam_id, ownedMockExam.id),
            ),
          )
          .orderBy(asc(answerRecord.created_at));
        const objectiveScore = answerRows
          .filter((row) => row.is_correct !== null)
          .reduce((total, row) => total + Number(row.score ?? 0), 0);
        const subjectiveRows = answerRows.filter(
          (row) => row.is_correct === null,
        );
        const hasPendingSubjective = subjectiveRows.some((row) =>
          ["saved", "submitted"].includes(row.answer_record_status),
        );
        const hasFailedSubjective = subjectiveRows.some(
          (row) => row.answer_record_status === "scoring_failed",
        );
        const subjectiveScore =
          subjectiveRows.length === 0 ||
          hasPendingSubjective ||
          hasFailedSubjective
            ? null
            : subjectiveRows.reduce(
                (total, row) => total + Number(row.score ?? 0),
                0,
              );
        const examStatus = hasPendingSubjective
          ? ("scoring" as const)
          : hasFailedSubjective
            ? ("scoring_partial_failed" as const)
            : ("completed" as const);
        const [updatedMockExam] = await transaction
          .update(mockExam)
          .set({
            exam_status: examStatus,
            objective_score: formatRepositoryScore(objectiveScore),
            subjective_score:
              subjectiveScore === null
                ? null
                : formatRepositoryScore(subjectiveScore),
            total_score: formatRepositoryScore(
              objectiveScore + (subjectiveScore ?? 0),
            ),
            updated_at: input.supplementedAt,
          })
          .where(
            and(
              eq(mockExam.id, ownedMockExam.id),
              inArray(mockExam.exam_status, [
                "completed",
                "scoring",
                "scoring_partial_failed",
              ]),
            ),
          )
          .returning();

        if (updatedMockExam === undefined) {
          throw new Error("Terminal mock exam changed during supplementation.");
        }

        const reportAnswerRecords = await listMockExamAnswerRecords(
          transaction as StudentFlowRuntimeDatabase,
          input.userPublicId,
          input.mockExamPublicId,
        );

        return {
          mockExam: mapMockExamRow(updatedMockExam, answerRows.length),
          answerRecords: reportAnswerRecords,
          supplementedCount,
          skippedExistingCount: input.answers.length - supplementedCount,
        };
      });
    },
    async rebuildExistingExamReport(input) {
      const database = getDatabase();
      const userId = await findUserIdByPublicId(database, input.userPublicId);

      if (userId === null) {
        return null;
      }

      const [ownedMockExam] = await database
        .select({ id: mockExam.id })
        .from(mockExam)
        .where(
          and(
            eq(mockExam.user_id, userId),
            eq(mockExam.public_id, input.mockExamPublicId),
          ),
        )
        .limit(1);

      if (ownedMockExam === undefined) {
        return null;
      }

      if (!input.hasChanges) {
        const [existingReport] = await database
          .select({
            public_id: examReport.public_id,
            report_revision: examReport.report_revision,
          })
          .from(examReport)
          .where(
            and(
              eq(examReport.user_id, userId),
              eq(examReport.mock_exam_id, ownedMockExam.id),
            ),
          )
          .limit(1);

        return existingReport === undefined
          ? null
          : {
              publicId: existingReport.public_id,
              reportRevision: existingReport.report_revision,
            };
      }

      const [rebuiltReport] = await database
        .update(examReport)
        .set({
          report_snapshot: input.reportSnapshot,
          report_revision: sql`${examReport.report_revision} + 1`,
          exam_status: input.examStatus,
          objective_score: input.objectiveScore,
          subjective_score: input.subjectiveScore,
          total_score: input.totalScore,
          generated_at: input.rebuiltAt,
          updated_at: input.rebuiltAt,
        })
        .where(
          and(
            eq(examReport.user_id, userId),
            eq(examReport.mock_exam_id, ownedMockExam.id),
          ),
        )
        .returning({
          public_id: examReport.public_id,
          report_revision: examReport.report_revision,
        });

      return rebuiltReport === undefined
        ? null
        : {
            publicId: rebuiltReport.public_id,
            reportRevision: rebuiltReport.report_revision,
          };
    },
    async submitMockExam(input) {
      const database = getDatabase();
      return database.transaction(async (transaction) => {
        const [row] = await transaction
          .update(mockExam)
          .set({
            exam_status: input.examStatus,
            submitted_at: input.submittedAt,
            objective_score: input.objectiveScore,
            subjective_score: input.subjectiveScore,
            total_score: input.totalScore,
            updated_at: input.submittedAt,
          })
          .where(
            and(
              eq(mockExam.public_id, input.publicId),
              eq(mockExam.exam_status, "in_progress"),
            ),
          )
          .returning();

        if (row === undefined) {
          return null;
        }

        await transaction
          .update(mockExamDeadlineTask)
          .set({
            task_status: "completed",
            lease_expires_at: null,
            worker_public_id: null,
            failure_message_digest: null,
            completed_at: input.submittedAt,
            updated_at: input.submittedAt,
          })
          .where(eq(mockExamDeadlineTask.mock_exam_id, row.id));

        await Promise.all(
          input.answerRecordResults.map((answerRecordResult) =>
            transaction
              .update(answerRecord)
              .set({
                answer_record_status: answerRecordResult.answerRecordStatus,
                is_correct: answerRecordResult.isCorrect,
                score: answerRecordResult.score,
                submitted_at: answerRecordResult.submittedAt,
                updated_at: answerRecordResult.submittedAt,
              })
              .where(
                and(
                  eq(answerRecord.mock_exam_id, row.id),
                  eq(
                    answerRecord.paper_question_public_id,
                    answerRecordResult.paperQuestionPublicId,
                  ),
                ),
              ),
          ),
        );

        if (input.aiScoringTasks.length > 0) {
          if (
            input.aiScoringTasks.some(
              (task) => task.mockExamPublicId !== input.publicId,
            )
          ) {
            throw new Error("AI scoring task mock_exam scope mismatch.");
          }

          const answerRecordPublicIds = input.aiScoringTasks.map(
            (task) => task.answerRecordPublicId,
          );
          const answerRecordLinks = await transaction
            .select({
              id: answerRecord.id,
              public_id: answerRecord.public_id,
            })
            .from(answerRecord)
            .where(
              and(
                eq(answerRecord.mock_exam_id, row.id),
                inArray(answerRecord.public_id, answerRecordPublicIds),
              ),
            );
          const answerRecordIdByPublicId = new Map(
            answerRecordLinks.map((link) => [link.public_id, link.id]),
          );

          if (
            new Set(answerRecordPublicIds).size !==
              input.aiScoringTasks.length ||
            answerRecordLinks.length !== input.aiScoringTasks.length
          ) {
            throw new Error("AI scoring task answer_record scope is invalid.");
          }

          await transaction
            .insert(aiScoringTask)
            .values(
              input.aiScoringTasks.map((task) => ({
                public_id: task.publicId,
                answer_record_id: answerRecordIdByPublicId.get(
                  task.answerRecordPublicId,
                )!,
                mock_exam_public_id: task.mockExamPublicId,
                actor_public_id: task.actorPublicId,
                idempotency_key_hash: task.idempotencyKeyHash,
                task_status: "pending" as const,
                attempt_count: 0,
                max_attempt_count: task.maxAttemptCount,
                timeout_second: task.timeoutSecond,
                model_config_snapshot: task.modelConfigSnapshot,
                prompt_template_key: task.promptTemplateKey,
                prompt_template_version: task.promptTemplateVersion,
                prompt_template_hash: task.promptTemplateHash,
                input_snapshot: task.inputSnapshot,
                authorization_snapshot: task.authorizationSnapshot,
                rag_snapshot: task.ragSnapshot,
                result_snapshot: null,
                ai_call_log_id: null,
                failure_code: null,
                failure_message_digest: null,
                scheduled_at: task.scheduledAt,
                claimed_at: null,
                lease_expires_at: null,
                worker_public_id: null,
                completed_at: null,
              })),
            )
            .onConflictDoNothing({
              target: [
                aiScoringTask.answer_record_id,
                aiScoringTask.idempotency_key_hash,
              ],
            });
        }

        return mapMockExamRow(
          row,
          await countMockExamAnswers(
            transaction as StudentFlowRuntimeDatabase,
            row.id,
          ),
        );
      });
    },
    async applyMockExamScoringResults(input) {
      const database = getDatabase();
      const [row] = await database
        .update(mockExam)
        .set({
          exam_status: input.examStatus,
          objective_score: input.objectiveScore,
          subjective_score: input.subjectiveScore,
          total_score: input.totalScore,
          updated_at: input.scoredAt,
        })
        .where(eq(mockExam.public_id, input.publicId))
        .returning();

      if (row !== undefined) {
        await Promise.all(
          input.answerRecordResults.map((answerRecordResult) =>
            database
              .update(answerRecord)
              .set({
                answer_record_status: answerRecordResult.answerRecordStatus,
                is_correct: answerRecordResult.isCorrect,
                score: answerRecordResult.score,
                updated_at: input.scoredAt,
              })
              .where(
                and(
                  eq(answerRecord.mock_exam_id, row.id),
                  eq(
                    answerRecord.paper_question_public_id,
                    answerRecordResult.paperQuestionPublicId,
                  ),
                ),
              ),
          ),
        );
      }

      return row === undefined
        ? null
        : mapMockExamRow(row, await countMockExamAnswers(database, row.id));
    },
    async retryFailedAiScoringTasks(input) {
      const database = getDatabase();
      const userId = await findUserIdByPublicId(database, input.userPublicId);

      if (userId === null) {
        return null;
      }

      return database.transaction(async (transaction) => {
        const [ownedMockExam] = await transaction
          .select()
          .from(mockExam)
          .where(
            and(
              eq(mockExam.public_id, input.mockExamPublicId),
              eq(mockExam.user_id, userId),
            ),
          )
          .for("update")
          .limit(1);

        if (ownedMockExam === undefined) {
          return null;
        }

        if (ownedMockExam.exam_status !== "scoring_partial_failed") {
          return {
            mockExam: mapMockExamRow(
              ownedMockExam,
              await countMockExamAnswers(
                transaction as StudentFlowRuntimeDatabase,
                ownedMockExam.id,
              ),
            ),
            retriedCount: 0,
            failedCount: 0,
          };
        }

        const failedTasks = await transaction
          .select({
            id: aiScoringTask.id,
            answer_record_id: aiScoringTask.answer_record_id,
            attempt_count: aiScoringTask.attempt_count,
            max_attempt_count: aiScoringTask.max_attempt_count,
          })
          .from(aiScoringTask)
          .innerJoin(
            answerRecord,
            eq(answerRecord.id, aiScoringTask.answer_record_id),
          )
          .where(
            and(
              eq(aiScoringTask.mock_exam_public_id, input.mockExamPublicId),
              eq(aiScoringTask.actor_public_id, input.userPublicId),
              eq(aiScoringTask.task_status, "failed"),
              eq(answerRecord.mock_exam_id, ownedMockExam.id),
              eq(answerRecord.user_id, userId),
              eq(answerRecord.answer_record_status, "scoring_failed"),
            ),
          )
          .orderBy(asc(aiScoringTask.id))
          .for("update");
        const retryableTasks = failedTasks.filter(
          (task) => task.attempt_count < task.max_attempt_count,
        );

        if (retryableTasks.length === 0) {
          return {
            mockExam: mapMockExamRow(
              ownedMockExam,
              await countMockExamAnswers(
                transaction as StudentFlowRuntimeDatabase,
                ownedMockExam.id,
              ),
            ),
            retriedCount: 0,
            failedCount: failedTasks.length,
          };
        }

        const retryableTaskIds = retryableTasks.map((task) => task.id);
        const retryableAnswerRecordIds = retryableTasks.map(
          (task) => task.answer_record_id,
        );

        await transaction
          .update(aiScoringTask)
          .set({
            task_status: "pending",
            failure_code: null,
            failure_message_digest: null,
            scheduled_at: input.retriedAt,
            claimed_at: null,
            lease_expires_at: null,
            worker_public_id: null,
            completed_at: null,
            updated_at: input.retriedAt,
          })
          .where(inArray(aiScoringTask.id, retryableTaskIds));
        await transaction
          .update(answerRecord)
          .set({
            answer_record_status: "submitted",
            score: null,
            updated_at: input.retriedAt,
          })
          .where(inArray(answerRecord.id, retryableAnswerRecordIds));
        const [updatedMockExam] = await transaction
          .update(mockExam)
          .set({
            exam_status: "scoring",
            updated_at: input.retriedAt,
          })
          .where(eq(mockExam.id, ownedMockExam.id))
          .returning();

        if (updatedMockExam === undefined) {
          throw new Error("Mock exam scoring retry lost its owner row.");
        }

        return {
          mockExam: mapMockExamRow(
            updatedMockExam,
            await countMockExamAnswers(
              transaction as StudentFlowRuntimeDatabase,
              updatedMockExam.id,
            ),
          ),
          retriedCount: retryableTasks.length,
          failedCount: failedTasks.length - retryableTasks.length,
        };
      });
    },
    async terminateMockExam(input) {
      const database = getDatabase();

      return database.transaction(async (transaction) => {
        const [row] = await transaction
          .update(mockExam)
          .set({
            exam_status: "terminated",
            terminated_at: input.terminatedAt,
            termination_reason: input.terminationReason,
            updated_at: input.terminatedAt,
          })
          .where(
            and(
              eq(mockExam.public_id, input.publicId),
              eq(mockExam.exam_status, "in_progress"),
            ),
          )
          .returning();

        if (row === undefined) {
          return null;
        }

        await transaction
          .update(mockExamDeadlineTask)
          .set({
            task_status: "cancelled",
            lease_expires_at: null,
            worker_public_id: null,
            failure_message_digest: null,
            completed_at: input.terminatedAt,
            updated_at: input.terminatedAt,
          })
          .where(eq(mockExamDeadlineTask.mock_exam_id, row.id));

        return mapMockExamRow(
          row,
          await countMockExamAnswers(
            transaction as StudentFlowRuntimeDatabase,
            row.id,
          ),
        );
      });
    },
  };
}

function createPostgresExamReportRepository(
  getDatabase: () => StudentFlowRuntimeDatabase,
  options: StudentFlowRuntimeRepositoryOptions,
): ExamReportRepository {
  return {
    async listEffectiveAuthorizationScopes(query) {
      return listEffectiveAuthorizationScopes(
        getDatabase(),
        query.userPublicId,
        getNow(options),
      );
    },
    async listExamReports(query) {
      const database = getDatabase();
      const now = getNow(options);

      return database.transaction(
        async (transaction) => {
          const snapshotDatabase = transaction as StudentFlowRuntimeDatabase;
          const userId = await findUserIdByPublicId(
            snapshotDatabase,
            query.userPublicId,
          );

          if (userId === null) {
            return { rows: [], total: 0 };
          }

          const scopes = await listEffectiveAuthorizationScopes(
            snapshotDatabase,
            query.userPublicId,
            now,
          );
          const authorizationCondition =
            createExamReportAuthorizationScopeCondition(scopes);

          if (authorizationCondition === null) {
            return { rows: [], total: 0 };
          }

          const conditions: SQL[] = [
            eq(mockExam.user_id, userId),
            authorizationCondition,
          ];

          if (query.status !== null) {
            conditions.push(eq(mockExam.exam_status, query.status));
          } else {
            conditions.push(
              inArray(mockExam.exam_status, [
                "scoring",
                "scoring_partial_failed",
                "completed",
                "terminated",
              ]),
            );
          }

          if (query.search !== null) {
            conditions.push(or(ilike(paper.name, `%${query.search}%`))!);
          }

          const rows = await snapshotDatabase
            .select({
              report: examReport,
              attempt: mockExam,
              mock_exam_public_id: mockExam.public_id,
              paper_name: paper.name,
            })
            .from(mockExam)
            .leftJoin(examReport, eq(examReport.mock_exam_id, mockExam.id))
            .innerJoin(paper, eq(paper.id, mockExam.paper_id))
            .where(and(...conditions))
            .orderBy(
              query.sortOrder === "asc"
                ? asc(mockExam.started_at)
                : desc(mockExam.started_at),
              query.sortOrder === "asc" ? asc(mockExam.id) : desc(mockExam.id),
            )
            .limit(query.pageSize)
            .offset((query.page - 1) * query.pageSize);
          const [totalRow] = await snapshotDatabase
            .select({ value: count() })
            .from(mockExam)
            .innerJoin(paper, eq(paper.id, mockExam.paper_id))
            .where(and(...conditions));

          return {
            rows: rows.map((row) =>
              mapExamReportListRow(row.report, row.attempt, row.paper_name),
            ),
            total: totalRow?.value ?? 0,
          };
        },
        {
          isolationLevel: "repeatable read",
          accessMode: "read only",
        },
      );
    },
    async findExamReportByPublicId(query) {
      const database = getDatabase();
      const userId = await findUserIdByPublicId(database, query.userPublicId);

      if (userId === null) {
        return null;
      }

      const [row] = await database
        .select({
          report: examReport,
          mock_exam_public_id: mockExam.public_id,
          mock_exam_started_at: mockExam.started_at,
          paper_name: paper.name,
        })
        .from(examReport)
        .innerJoin(mockExam, eq(mockExam.id, examReport.mock_exam_id))
        .innerJoin(paper, eq(paper.id, examReport.paper_id))
        .where(
          and(
            eq(examReport.user_id, userId),
            eq(examReport.public_id, query.publicId),
          ),
        )
        .limit(1);

      return row === undefined
        ? null
        : mapExamReportRow(
            row.report,
            row.mock_exam_public_id,
            row.paper_name,
            row.mock_exam_started_at,
          );
    },
    async findExamReportByMockExamPublicId(query) {
      const database = getDatabase();
      const userId = await findUserIdByPublicId(database, query.userPublicId);

      if (userId === null) {
        return null;
      }

      const [row] = await database
        .select({
          report: examReport,
          mock_exam_public_id: mockExam.public_id,
          mock_exam_started_at: mockExam.started_at,
          paper_name: paper.name,
        })
        .from(examReport)
        .innerJoin(mockExam, eq(mockExam.id, examReport.mock_exam_id))
        .innerJoin(paper, eq(paper.id, examReport.paper_id))
        .where(
          and(
            eq(examReport.user_id, userId),
            eq(mockExam.public_id, query.mockExamPublicId),
          ),
        )
        .limit(1);

      return row === undefined
        ? null
        : mapExamReportRow(
            row.report,
            row.mock_exam_public_id,
            row.paper_name,
            row.mock_exam_started_at,
          );
    },
    async findSubmittedMockExamByPublicId(query) {
      const row = await findOwnedMockExamTableRow(
        getDatabase(),
        query.userPublicId,
        query.mockExamPublicId,
      );

      return row === null
        ? null
        : {
            public_id: row.public_id,
            paper_public_id: row.paper_public_id,
            paper_snapshot: asRecord(row.paper_snapshot),
            profession: row.profession,
            level: row.level,
            subject: row.subject,
            exam_status: row.exam_status,
            started_at: row.started_at,
            submitted_at: row.submitted_at,
            objective_score: row.objective_score,
            subjective_score: row.subjective_score,
            total_score: row.total_score,
          };
    },
    async listMockExamAnswerRecords(query) {
      return listMockExamAnswerRecords(
        getDatabase(),
        query.userPublicId,
        query.mockExamPublicId,
      );
    },
    async createExamReport(input) {
      const database = getDatabase();
      const userId = await getRequiredUserId(database, input.userPublicId);
      const ownedMockExam = await findOwnedMockExamTableRow(
        database,
        input.userPublicId,
        input.mockExamPublicId,
      );

      if (
        ownedMockExam === null ||
        ownedMockExam.paper_public_id !== input.paperPublicId
      ) {
        throw new Error("Exam report mock_exam scope is invalid.");
      }

      const [row] = await database
        .insert(examReport)
        .values({
          public_id: input.publicId,
          user_id: userId,
          mock_exam_id: ownedMockExam.id,
          paper_id: ownedMockExam.paper_id,
          paper_public_id: input.paperPublicId,
          report_snapshot: input.reportSnapshot,
          exam_status: input.examStatus,
          profession: input.profession,
          level: input.level,
          subject: input.subject,
          objective_score: input.objectiveScore,
          subjective_score: input.subjectiveScore,
          total_score: input.totalScore,
          duration_second: input.durationSecond,
          learning_suggestion_snapshot: input.learningSuggestionSnapshot,
          generated_at: input.generatedAt,
        })
        .onConflictDoNothing({ target: examReport.mock_exam_id })
        .returning();

      const persistedRow =
        row ??
        (
          await database
            .select()
            .from(examReport)
            .where(
              and(
                eq(examReport.user_id, userId),
                eq(examReport.mock_exam_id, ownedMockExam.id),
              ),
            )
            .limit(1)
        )[0];

      if (persistedRow === undefined) {
        throw new Error("Exam report insert did not return a row.");
      }

      return mapExamReportRow(
        persistedRow,
        input.mockExamPublicId,
        input.paperName,
        ownedMockExam.started_at,
      );
    },
    async rebuildExamReport(input) {
      const database = getDatabase();
      const userId = await getRequiredUserId(database, input.userPublicId);
      const ownedMockExam = await findOwnedMockExamTableRow(
        database,
        input.userPublicId,
        input.mockExamPublicId,
      );

      if (
        ownedMockExam === null ||
        ownedMockExam.paper_public_id !== input.paperPublicId
      ) {
        throw new Error("Exam report mock_exam scope is invalid.");
      }

      const changedReportCondition = or(
        sql`${examReport.report_snapshot} is distinct from ${JSON.stringify(input.reportSnapshot)}::jsonb`,
        sql`${examReport.exam_status} is distinct from ${input.examStatus}::exam_status`,
        sql`${examReport.objective_score} is distinct from ${input.objectiveScore}::numeric`,
        sql`${examReport.subjective_score} is distinct from ${input.subjectiveScore}::numeric`,
        sql`${examReport.total_score} is distinct from ${input.totalScore}::numeric`,
        sql`${examReport.duration_second} is distinct from ${input.durationSecond}`,
        sql`${examReport.learning_suggestion_snapshot} is not null`,
      );
      const [rebuiltRow] = await database
        .update(examReport)
        .set({
          report_snapshot: input.reportSnapshot,
          report_revision: sql`${examReport.report_revision} + 1`,
          exam_status: input.examStatus,
          objective_score: input.objectiveScore,
          subjective_score: input.subjectiveScore,
          total_score: input.totalScore,
          duration_second: input.durationSecond,
          learning_suggestion_snapshot: null,
          generated_at: input.generatedAt,
          updated_at: input.generatedAt,
        })
        .where(
          and(
            eq(examReport.user_id, userId),
            eq(examReport.public_id, input.publicId),
            eq(examReport.mock_exam_id, ownedMockExam.id),
            changedReportCondition,
          ),
        )
        .returning();
      const persistedRow =
        rebuiltRow ??
        (
          await database
            .select()
            .from(examReport)
            .where(
              and(
                eq(examReport.user_id, userId),
                eq(examReport.public_id, input.publicId),
                eq(examReport.mock_exam_id, ownedMockExam.id),
              ),
            )
            .limit(1)
        )[0];

      if (persistedRow === undefined) {
        throw new Error("Exam report rebuild lost its owned report.");
      }

      return mapExamReportRow(
        persistedRow,
        input.mockExamPublicId,
        input.paperName,
        ownedMockExam.started_at,
      );
    },
    async updateExamReportLearningSuggestionSnapshot(input) {
      const database = getDatabase();
      const userId = await findUserIdByPublicId(database, input.userPublicId);

      if (userId === null) {
        return;
      }

      await database
        .update(examReport)
        .set({
          learning_suggestion_snapshot: input.learningSuggestionSnapshot,
          updated_at: getNow(options),
        })
        .where(
          and(
            eq(examReport.user_id, userId),
            eq(examReport.public_id, input.publicId),
          ),
        );
    },
  };
}

async function listEffectiveAuthorizationScopes(
  database: StudentFlowRuntimeDatabase,
  userPublicId: string,
  now: Date,
): Promise<StudentPaperAuthorizationScopeRow[]> {
  const personalAuthRows = await database
    .select({
      profession: personalAuth.profession,
      level: personalAuth.level,
      expires_at: personalAuth.expires_at,
    })
    .from(personalAuth)
    .innerJoin(user, eq(user.id, personalAuth.user_id))
    .where(
      and(
        eq(user.public_id, userPublicId),
        eq(user.status, "active"),
        eq(personalAuth.status, "active"),
        lte(personalAuth.starts_at, now),
        gt(personalAuth.expires_at, now),
      ),
    )
    .orderBy(asc(personalAuth.expires_at));

  const orgAuthRows = await database
    .select({
      profession: orgAuth.profession,
      level: orgAuth.level,
      expires_at: orgAuth.expires_at,
    })
    .from(employee)
    .innerJoin(user, eq(user.id, employee.user_id))
    .innerJoin(organization, eq(organization.id, employee.organization_id))
    .innerJoin(employeeOrgAuth, eq(employeeOrgAuth.employee_id, employee.id))
    .innerJoin(orgAuth, eq(orgAuth.id, employeeOrgAuth.org_auth_id))
    .where(
      and(
        eq(user.public_id, userPublicId),
        eq(user.user_type, "employee"),
        eq(user.status, "active"),
        eq(organization.status, "active"),
        eq(orgAuth.status, "active"),
        createOrgAuthCoversOrganizationCondition({
          authScopeType: orgAuth.auth_scope_type,
          orgAuthId: orgAuth.id,
          organizationId: organization.id,
          purchaserOrganizationId: orgAuth.purchaser_organization_id,
        }),
        lte(orgAuth.starts_at, now),
        gt(orgAuth.expires_at, now),
      ),
    )
    .orderBy(asc(orgAuth.expires_at));

  return [
    ...personalAuthRows.map((row) => ({
      profession: row.profession,
      level: row.level,
      authorization_types: ["personal_auth"] satisfies AuthorizationType[],
      expires_at: row.expires_at,
    })),
    ...orgAuthRows.map((row) => ({
      profession: row.profession,
      level: row.level,
      authorization_types: ["org_auth"] satisfies AuthorizationType[],
      expires_at: row.expires_at,
    })),
  ];
}

async function findPublishedPaperByPublicId(
  database: StudentFlowRuntimeDatabase,
  publicId: string,
): Promise<StudentPublishedPaperRow | null> {
  const [row] = await database
    .select()
    .from(paper)
    .where(
      and(eq(paper.public_id, publicId), eq(paper.paper_status, "published")),
    )
    .limit(1);

  if (row === undefined) {
    return null;
  }

  return {
    public_id: row.public_id,
    name: row.name,
    profession: row.profession,
    level: row.level,
    subject: row.subject,
    paper_type: row.paper_type,
    duration_minute: row.duration_minute,
    total_score: row.total_score,
    published_at: row.published_at,
    question_count: await countPaperQuestions(database, row.public_id),
    paper_snapshot: await buildPaperSnapshot(database, row),
  };
}

async function buildPaperSnapshot(
  database: StudentFlowRuntimeDatabase,
  paperRow: typeof paper.$inferSelect,
): Promise<Record<string, unknown>> {
  const sectionRows = await database
    .select()
    .from(paperSection)
    .where(eq(paperSection.paper_id, paperRow.id))
    .orderBy(asc(paperSection.sort_order));

  if (sectionRows.length === 0) {
    return {
      snapshotVersion: 2,
      publicId: paperRow.public_id,
      name: paperRow.name,
      profession: paperRow.profession,
      level: paperRow.level,
      subject: paperRow.subject,
      revision: paperRow.revision,
      paperSections: [],
    };
  }

  const questionRows = await database
    .select()
    .from(paperQuestion)
    .where(
      inArray(
        paperQuestion.paper_section_id,
        sectionRows.map((row) => row.id),
      ),
    )
    .orderBy(asc(paperQuestion.sort_order));
  const questionsBySectionId = new Map<number, typeof questionRows>();
  const questionIds = questionRows.map((row) => row.id);
  const scoringPointRows =
    questionIds.length === 0
      ? []
      : await database
          .select()
          .from(paperScoringPoint)
          .where(inArray(paperScoringPoint.paper_question_id, questionIds))
          .orderBy(asc(paperScoringPoint.sort_order));
  const scoringPointsByQuestionId = new Map<
    number,
    (typeof scoringPointRows)[number][]
  >();
  const questionGroupRows = await database
    .select({
      id: questionGroup.id,
      public_id: questionGroup.public_id,
      paper_section_id: questionGroup.paper_section_id,
      title: questionGroup.title,
      sort_order: questionGroup.sort_order,
      material_snapshot: questionGroup.material_snapshot,
    })
    .from(questionGroup)
    .where(eq(questionGroup.paper_id, paperRow.id))
    .orderBy(asc(questionGroup.sort_order));
  const questionGroupById = new Map(
    questionGroupRows.map((questionGroupRow) => [
      questionGroupRow.id,
      questionGroupRow,
    ]),
  );

  for (const scoringPointRow of scoringPointRows) {
    const rows =
      scoringPointsByQuestionId.get(scoringPointRow.paper_question_id) ?? [];
    scoringPointsByQuestionId.set(scoringPointRow.paper_question_id, [
      ...rows,
      scoringPointRow,
    ]);
  }

  for (const questionRow of questionRows) {
    if (questionRow.question_group_id !== null) {
      const questionGroupRow = questionGroupById.get(
        questionRow.question_group_id,
      );

      if (
        questionGroupRow === undefined ||
        questionGroupRow.paper_section_id !== questionRow.paper_section_id
      ) {
        throw new PaperSnapshotIntegrityError(
          "Paper question group is missing canonical public identity.",
        );
      }
    }

    const rows = questionsBySectionId.get(questionRow.paper_section_id) ?? [];
    questionsBySectionId.set(questionRow.paper_section_id, [
      ...rows,
      questionRow,
    ]);
  }

  return {
    snapshotVersion: 2,
    publicId: paperRow.public_id,
    name: paperRow.name,
    profession: paperRow.profession,
    level: paperRow.level,
    subject: paperRow.subject,
    revision: paperRow.revision,
    durationMinute: paperRow.duration_minute,
    totalScore: paperRow.total_score,
    paperSections: sectionRows.map((sectionRow) => {
      const sectionQuestionRows = questionsBySectionId.get(sectionRow.id) ?? [];
      const sectionQuestionGroupRows = questionGroupRows.filter(
        (questionGroupRow) =>
          questionGroupRow.paper_section_id === sectionRow.id,
      );

      return {
        publicId: sectionRow.public_id,
        title: sectionRow.title,
        description: sectionRow.description,
        sortOrder: sectionRow.sort_order,
        totalScore: sectionRow.total_score,
        paperQuestions: sectionQuestionRows
          .filter((questionRow) => questionRow.question_group_id === null)
          .map((questionRow) =>
            mapPaperQuestionSnapshot(
              questionRow,
              scoringPointsByQuestionId.get(questionRow.id) ?? [],
              questionRow.material_snapshot === null
                ? null
                : asRecord(questionRow.material_snapshot),
            ),
          ),
        questionGroups: sectionQuestionGroupRows.map((questionGroupRow) => {
          const groupQuestionRows = sectionQuestionRows.filter(
            (questionRow) =>
              questionRow.question_group_id === questionGroupRow.id,
          );

          if (groupQuestionRows.length === 0) {
            throw new PaperSnapshotIntegrityError(
              "Published paper contains an empty question group.",
            );
          }

          return {
            publicId: questionGroupRow.public_id,
            title: questionGroupRow.title,
            sortOrder: questionGroupRow.sort_order,
            totalScore: formatPaperSnapshotTotalScore(groupQuestionRows),
            materialSnapshot: asRecord(questionGroupRow.material_snapshot),
            paperQuestions: groupQuestionRows.map((questionRow) =>
              mapPaperQuestionSnapshot(
                questionRow,
                scoringPointsByQuestionId.get(questionRow.id) ?? [],
                null,
              ),
            ),
          };
        }),
      };
    }),
  };
}

function formatPaperSnapshotTotalScore(
  questionRows: (typeof paperQuestion.$inferSelect)[],
): string {
  return questionRows
    .reduce((totalScore, questionRow) => {
      const score = Number(questionRow.score ?? "");

      if (!Number.isFinite(score) || score <= 0) {
        throw new PaperSnapshotIntegrityError(
          "Paper question snapshot is missing a positive score.",
        );
      }

      return totalScore + score;
    }, 0)
    .toFixed(1);
}

function mapPaperQuestionSnapshot(
  row: typeof paperQuestion.$inferSelect,
  scoringPointRows: (typeof paperScoringPoint.$inferSelect)[],
  materialSnapshot: Record<string, unknown> | null,
): Record<string, unknown> {
  const snapshot = asRecord(row.question_snapshot);
  const questionPublicId = getStringField(snapshot, "questionPublicId");
  const score = row.score;
  const numericScore = Number(score ?? "");

  if (questionPublicId === null) {
    throw new PaperSnapshotIntegrityError(
      "Paper question snapshot is missing canonical question identity.",
    );
  }

  if (score === null || !Number.isFinite(numericScore) || numericScore <= 0) {
    throw new PaperSnapshotIntegrityError(
      "Paper question snapshot is missing a positive score.",
    );
  }

  const standardAnswerLabels = Array.isArray(snapshot.standardAnswerLabels)
    ? snapshot.standardAnswerLabels
    : Array.isArray(snapshot.standardAnswer)
      ? snapshot.standardAnswer
      : [];

  return {
    ...snapshot,
    paperQuestionPublicId: row.public_id,
    questionPublicId,
    questionType: getStringField(snapshot, "questionType"),
    sortOrder: row.sort_order,
    score,
    scoringPoints: scoringPointRows.map((scoringPointRow) => ({
      scoringPointPublicId: scoringPointRow.public_id,
      description: scoringPointRow.description,
      score: scoringPointRow.score,
      sortOrder: scoringPointRow.sort_order,
    })),
    standardAnswerLabels: standardAnswerLabels.filter(
      (label): label is string => typeof label === "string",
    ),
    standardAnswerRichText:
      getStringField(snapshot, "standardAnswerRichText") ??
      standardAnswerLabels.join(","),
    analysisRichText:
      getStringField(snapshot, "analysisRichText") ??
      getStringField(snapshot, "analysis"),
    materialSnapshot,
  };
}

async function listQuestionCounts(
  database: StudentFlowRuntimeDatabase,
  paperPublicIds: string[],
): Promise<Map<string, number>> {
  if (paperPublicIds.length === 0) {
    return new Map();
  }

  const rows = await database
    .select({
      public_id: paper.public_id,
      value: count(paperQuestion.id),
    })
    .from(paper)
    .leftJoin(paperQuestion, eq(paperQuestion.paper_id, paper.id))
    .where(inArray(paper.public_id, paperPublicIds))
    .groupBy(paper.public_id);

  return new Map(rows.map((row) => [row.public_id, row.value]));
}

async function countPaperQuestions(
  database: StudentFlowRuntimeDatabase,
  paperPublicId: string,
): Promise<number> {
  return (
    (await listQuestionCounts(database, [paperPublicId])).get(paperPublicId) ??
    0
  );
}

async function findUserIdByPublicId(
  database: StudentFlowRuntimeDatabase,
  publicId: string,
): Promise<number | null> {
  const [row] = await database
    .select({ id: user.id })
    .from(user)
    .where(and(eq(user.public_id, publicId), eq(user.status, "active")))
    .limit(1);

  return row?.id ?? null;
}

async function getRequiredUserId(
  database: StudentFlowRuntimeDatabase,
  publicId: string,
): Promise<number> {
  const userId = await findUserIdByPublicId(database, publicId);

  if (userId === null) {
    throw new Error("Active student user does not exist.");
  }

  return userId;
}

async function getRequiredPublishedPaperIdForStart(
  database: StudentFlowRuntimeDatabase,
  publicId: string,
): Promise<number> {
  const [row] = await database
    .select({ id: paper.id })
    .from(paper)
    .where(
      and(eq(paper.public_id, publicId), eq(paper.paper_status, "published")),
    )
    .limit(1)
    .for("share");

  if (row === undefined) {
    throw new PaperStartConflictError();
  }

  return row.id;
}

async function getRequiredPaperQuestionId(
  database: StudentFlowRuntimeDatabase,
  publicId: string,
): Promise<number> {
  const [row] = await database
    .select({ id: paperQuestion.id })
    .from(paperQuestion)
    .where(eq(paperQuestion.public_id, publicId))
    .limit(1);

  if (row === undefined) {
    throw new Error("Paper question does not exist.");
  }

  return row.id;
}

async function getRequiredPracticeLink(
  database: StudentFlowRuntimeDatabase,
  publicId: string,
): Promise<{ id: number; paper_id: number }> {
  const [row] = await database
    .select({ id: practice.id, paper_id: practice.paper_id })
    .from(practice)
    .where(eq(practice.public_id, publicId))
    .limit(1);

  if (row === undefined) {
    throw new Error("Practice does not exist.");
  }

  return row;
}

function isAnswerOperationIdConflict(error: unknown): boolean {
  let currentError: unknown = error;

  for (let depth = 0; depth < 4; depth += 1) {
    if (typeof currentError !== "object" || currentError === null) {
      return false;
    }

    const errorRecord = currentError as {
      code?: unknown;
      constraint?: unknown;
      cause?: unknown;
    };

    if (
      errorRecord.code === "23505" &&
      errorRecord.constraint ===
        "udx_answer_record_mock_exam_id_client_operation_id"
    ) {
      return true;
    }

    currentError = errorRecord.cause;
  }

  return false;
}

async function findWritableMockExamLink(
  database: StudentFlowRuntimeDatabase,
  userId: number,
  publicId: string,
): Promise<{ id: number; paper_id: number; started_at: Date } | null> {
  const [row] = await database
    .select({
      id: mockExam.id,
      paper_id: mockExam.paper_id,
      started_at: mockExam.started_at,
    })
    .from(mockExam)
    .where(
      and(
        eq(mockExam.user_id, userId),
        eq(mockExam.public_id, publicId),
        eq(mockExam.exam_status, "in_progress"),
      ),
    )
    .limit(1)
    .for("update");

  return row ?? null;
}

async function findOwnedMockExamTableRow(
  database: StudentFlowRuntimeDatabase,
  userPublicId: string,
  publicId: string,
): Promise<typeof mockExam.$inferSelect | null> {
  const userId = await findUserIdByPublicId(database, userPublicId);

  if (userId === null) {
    return null;
  }

  const [row] = await database
    .select()
    .from(mockExam)
    .where(and(eq(mockExam.user_id, userId), eq(mockExam.public_id, publicId)))
    .limit(1);

  return row ?? null;
}

async function findOwnedMockExamRow(
  database: StudentFlowRuntimeDatabase,
  userPublicId: string,
  publicId: string,
): Promise<MockExamRow | null> {
  const row = await findOwnedMockExamTableRow(database, userPublicId, publicId);

  return row === null
    ? null
    : mapMockExamRow(row, await countMockExamAnswers(database, row.id));
}

async function countMockExamAnswers(
  database: StudentFlowRuntimeDatabase,
  mockExamId: number,
): Promise<number> {
  const [row] = await database
    .select({ value: count() })
    .from(answerRecord)
    .where(eq(answerRecord.mock_exam_id, mockExamId));

  return row?.value ?? 0;
}

async function listMockExamAnswerRecords(
  database: StudentFlowRuntimeDatabase,
  userPublicId: string,
  mockExamPublicId: string,
): Promise<MockExamAnswerRecordRow[] & ExamReportAnswerRecordRow[]> {
  const userId = await findUserIdByPublicId(database, userPublicId);

  if (userId === null) {
    return [];
  }

  const [mockExamRow] = await database
    .select({ id: mockExam.id })
    .from(mockExam)
    .where(eq(mockExam.public_id, mockExamPublicId))
    .limit(1);

  if (mockExamRow === undefined) {
    return [];
  }

  const rows = await database
    .select()
    .from(answerRecord)
    .where(
      and(
        eq(answerRecord.user_id, userId),
        eq(answerRecord.mock_exam_id, mockExamRow.id),
      ),
    )
    .orderBy(asc(answerRecord.created_at));

  const scoringEvidenceRows =
    rows.length === 0
      ? []
      : await database
          .select({
            answer_record_id: aiScoringTask.answer_record_id,
            task_public_id: aiScoringTask.public_id,
            task_status: aiScoringTask.task_status,
            attempt_number: aiScoringTask.attempt_count,
            attempt_status: aiScoringAttempt.status,
            model_config_snapshot: aiScoringTask.model_config_snapshot,
            prompt_template_key: aiScoringTask.prompt_template_key,
            prompt_template_version: aiScoringTask.prompt_template_version,
            prompt_template_hash: aiScoringTask.prompt_template_hash,
            result_snapshot: aiScoringTask.result_snapshot,
          })
          .from(aiScoringTask)
          .leftJoin(
            aiScoringAttempt,
            and(
              eq(
                aiScoringAttempt.answer_record_id,
                aiScoringTask.answer_record_id,
              ),
              eq(aiScoringAttempt.attempt_number, aiScoringTask.attempt_count),
            ),
          )
          .where(
            inArray(
              aiScoringTask.answer_record_id,
              rows.map((row) => row.id),
            ),
          );
  const scoringEvidenceByAnswerRecordId = new Map<
    number,
    ExamReportAiScoringEvidenceRow
  >(
    scoringEvidenceRows.map((row) => [
      row.answer_record_id,
      {
        taskPublicId: row.task_public_id,
        taskStatus: row.task_status,
        attemptNumber: row.attempt_number,
        attemptStatus: row.attempt_status,
        modelConfigSnapshot: asRecord(row.model_config_snapshot),
        promptTemplateKey: row.prompt_template_key,
        promptTemplateVersion: row.prompt_template_version,
        promptTemplateHash: row.prompt_template_hash,
        resultSnapshot:
          row.result_snapshot === null ? null : asRecord(row.result_snapshot),
      },
    ]),
  );

  return rows.map((row) =>
    mapMockExamAnswerRecordRow(
      row,
      scoringEvidenceByAnswerRecordId.get(row.id) ?? null,
    ),
  ) as MockExamAnswerRecordRow[] & ExamReportAnswerRecordRow[];
}

function mapPracticeRow(row: typeof practice.$inferSelect): PracticeRow {
  return {
    id: row.id,
    public_id: row.public_id,
    paper_public_id: row.paper_public_id,
    profession: row.profession,
    level: row.level,
    subject: row.subject,
    practice_status: row.practice_status,
    started_at: row.started_at,
    last_answered_at: row.last_answered_at,
    expires_at: row.expires_at,
    paper_snapshot: asRecord(row.paper_snapshot),
  };
}

function mapPracticeAnswerRecordRow(
  row: typeof answerRecord.$inferSelect,
): PracticeAnswerRecordRow {
  return {
    public_id: row.public_id,
    exam_mode: "practice",
    paper_question_public_id: row.paper_question_public_id,
    question_public_id: row.question_public_id,
    answer_snapshot: asPracticeAnswerSnapshot(row.answer_snapshot),
    answer_record_status: row.answer_record_status,
    is_correct: row.is_correct,
    score: row.score,
    max_score: row.max_score,
    answered_at: row.answered_at,
    submitted_at: row.submitted_at,
  };
}

function mapMockExamRow(
  row: typeof mockExam.$inferSelect,
  answeredCount: number,
): MockExamRow {
  return {
    id: row.id,
    public_id: row.public_id,
    paper_public_id: row.paper_public_id,
    profession: row.profession,
    level: row.level,
    subject: row.subject,
    exam_status: row.exam_status,
    started_at: row.started_at,
    submitted_at: row.submitted_at,
    server_deadline_at: row.server_deadline_at,
    duration_minute: row.duration_minute,
    terminated_at: row.terminated_at,
    termination_reason: row.termination_reason,
    objective_score: row.objective_score,
    subjective_score: row.subjective_score,
    total_score: row.total_score,
    paper_snapshot: asRecord(row.paper_snapshot),
    answered_count: answeredCount,
  };
}

function mapMockExamAnswerRecordRow(
  row: typeof answerRecord.$inferSelect,
  aiScoringEvidence: ExamReportAiScoringEvidenceRow | null = null,
): MockExamAnswerRecordRow & ExamReportAnswerRecordRow {
  return {
    public_id: row.public_id,
    exam_mode: "mock_exam",
    paper_question_public_id: row.paper_question_public_id,
    question_public_id: row.question_public_id,
    question_snapshot: asRecord(row.question_snapshot),
    answer_snapshot: asMockExamAnswerSnapshot(row.answer_snapshot),
    ai_scoring_evidence: aiScoringEvidence,
    answer_revision: row.answer_revision,
    client_operation_id: row.client_operation_id,
    client_saved_at: row.client_saved_at,
    answer_record_status: row.answer_record_status as AnswerRecordStatus,
    is_correct: row.is_correct,
    score: row.score,
    max_score: row.max_score,
    answered_at: row.answered_at,
    submitted_at: row.submitted_at,
  };
}

function mapExamReportListRow(
  row: typeof examReport.$inferSelect | null,
  attempt: typeof mockExam.$inferSelect,
  paperName: string,
): ExamReportRow {
  if (row !== null) {
    return mapExamReportRow(
      row,
      attempt.public_id,
      paperName,
      attempt.started_at,
    );
  }

  return {
    id: attempt.id,
    public_id: attempt.public_id,
    exam_report_public_id: null,
    mock_exam_public_id: attempt.public_id,
    paper_public_id: attempt.paper_public_id,
    paper_name: paperName,
    profession: attempt.profession,
    level: attempt.level,
    subject: attempt.subject,
    exam_status: attempt.exam_status,
    objective_score: attempt.objective_score,
    subjective_score: attempt.subjective_score,
    total_score: attempt.total_score,
    duration_second: calculateMockExamRecordDurationSecond(attempt),
    report_snapshot: {},
    learning_suggestion_snapshot: null,
    generated_at: getMockExamRecordGeneratedAt(attempt),
    started_at: attempt.started_at,
    created_at: attempt.created_at,
    updated_at: attempt.updated_at,
  };
}

function mapExamReportRow(
  row: typeof examReport.$inferSelect,
  mockExamPublicId: string,
  paperName: string,
  startedAt: Date,
): ExamReportRow {
  return {
    id: row.id,
    public_id: row.public_id,
    exam_report_public_id: row.public_id,
    mock_exam_public_id: mockExamPublicId,
    paper_public_id: row.paper_public_id,
    paper_name: paperName,
    profession: row.profession,
    level: row.level,
    subject: row.subject,
    exam_status: row.exam_status,
    objective_score: row.objective_score,
    subjective_score: row.subjective_score,
    total_score: row.total_score,
    duration_second: row.duration_second,
    report_snapshot: asRecord(row.report_snapshot),
    learning_suggestion_snapshot:
      row.learning_suggestion_snapshot === null
        ? null
        : asRecord(row.learning_suggestion_snapshot),
    generated_at: row.generated_at,
    started_at: startedAt,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function getMockExamRecordGeneratedAt(row: typeof mockExam.$inferSelect): Date {
  return row.submitted_at ?? row.terminated_at ?? row.started_at;
}

function calculateMockExamRecordDurationSecond(
  row: typeof mockExam.$inferSelect,
): number {
  const endedAt = row.submitted_at ?? row.terminated_at;

  if (endedAt === null) {
    return 0;
  }

  return Math.max(
    0,
    Math.floor((endedAt.getTime() - row.started_at.getTime()) / 1000),
  );
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};
}

function asPracticeAnswerSnapshot(value: unknown) {
  const record = asRecord(value);

  return {
    selectedLabels: getStringArray(record.selectedLabels),
    textAnswer: getNullableString(record.textAnswer),
    savedFromClientAt: getNullableString(record.savedFromClientAt),
  };
}

function asMockExamAnswerSnapshot(value: unknown) {
  const record = asRecord(value);

  return {
    selectedLabels: getStringArray(record.selectedLabels),
    textAnswer: getNullableString(record.textAnswer),
    savedFromClientAt: getNullableString(record.savedFromClientAt),
  };
}

function getStringField(
  value: Record<string, unknown>,
  key: string,
): string | null {
  return getNullableString(value[key]);
}

function getNullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function getStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

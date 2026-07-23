import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  ilike,
  inArray,
  isNull,
  lte,
  or,
  sql,
  type SQL,
} from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import * as databaseSchema from "@/db/schema";
import { listPublishedPaperSnapshotQuestionEntries } from "@/lib/published-paper-snapshot";
import type { AuthorizationType } from "../contracts/effective-authorization-contract";
import type { AnswerRecordStatus } from "../models/student-experience";
import type {
  ExamReportAnswerRecordRow,
  ExamReportAiScoringEvidenceRow,
  ExamReportMockExamRow,
  ExamReportRepository,
  ExamReportRow,
} from "./exam-report-repository";
import {
  buildExamReportSnapshot,
  calculateDurationSecond,
  getPaperName,
  lockExamReportScoringFinalization,
} from "./exam-report-repository";
import type {
  MockExamAnswerRecordRow,
  MockExamRepository,
  MockExamRow,
} from "./mock-exam-repository";
import type {
  AnswerSessionAuthorizationLineage,
  PracticeAuthorizationScopeRow,
  PracticeAnswerRecordRow,
  PracticeAnswerResumeRow,
  PracticeRepository,
  PracticeRow,
} from "./practice-repository";
import {
  ActiveAnswerSessionClaimConflictError,
  AuthorizationStartConflictError,
} from "./practice-repository";
import { createRuntimeDatabaseForSchema } from "./runtime-database";
import {
  createOrgAuthCoversOrganizationCondition,
  lockOrganizationScopeMutation,
} from "./organization-scope-query";
import type {
  StudentPaperAuthorizationScopeRow,
  StudentPaperRepository,
  StudentPublishedPaperRow,
} from "./student-paper-repository";

type StudentFlowRuntimeDatabase = PostgresJsDatabase<typeof databaseSchema>;

const ACTIVE_ANSWER_SESSION_CLAIM_LOCK_NAMESPACE = 200115;
const PRACTICE_ANSWER_ATTEMPT_LOCK_NAMESPACE = 200127;

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
        const transactionalDatabase = transaction as StudentFlowRuntimeDatabase;
        await validateAndLockAuthorizationLineageForStart(
          transactionalDatabase,
          input.userPublicId,
          input.profession,
          input.level,
          input.startedAt,
          input.authorizationLineage,
        );
        const paperId = await getRequiredPublishedPaperIdForStart(
          transactionalDatabase,
          input.paperPublicId,
        );
        await lockActiveAnswerSessionClaim(
          transactionalDatabase,
          "practice",
          userId,
          paperId,
        );
        const activeRows = await transaction
          .select()
          .from(practice)
          .where(
            and(
              eq(practice.user_id, userId),
              eq(practice.paper_id, paperId),
              eq(practice.practice_status, "in_progress"),
            ),
          )
          .for("update");

        if (activeRows.length > 1) {
          throw new ActiveAnswerSessionClaimConflictError();
        }

        const activeRow = activeRows[0];

        if (activeRow !== undefined) {
          if (!isCompatiblePracticeClaim(activeRow, input)) {
            throw new ActiveAnswerSessionClaimConflictError();
          }

          if (activeRow.public_id !== input.replaceActivePublicId) {
            return mapPracticeRow(activeRow);
          }

          const [expiredRow] = await transaction
            .update(practice)
            .set({
              practice_status: "expired",
              updated_at: input.startedAt,
            })
            .where(
              and(
                eq(practice.id, activeRow.id),
                eq(practice.practice_status, "in_progress"),
              ),
            )
            .returning({ id: practice.id });

          if (expiredRow === undefined) {
            throw new ActiveAnswerSessionClaimConflictError();
          }
        } else if (input.replaceActivePublicId !== null) {
          throw new ActiveAnswerSessionClaimConflictError();
        }

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
            authorization_source:
              input.authorizationLineage.authorizationSource,
            authorization_public_id:
              input.authorizationLineage.authorizationPublicId,
            authorization_organization_public_id:
              input.authorizationLineage.organizationPublicId,
            quota_owner_type: input.authorizationLineage.quotaOwnerType,
            quota_owner_public_id:
              input.authorizationLineage.quotaOwnerPublicId,
          })
          .onConflictDoNothing()
          .returning();

        if (row !== undefined) {
          return mapPracticeRow(row);
        }

        const concurrentActiveRows = await transaction
          .select()
          .from(practice)
          .where(
            and(
              eq(practice.user_id, userId),
              eq(practice.paper_id, paperId),
              eq(practice.practice_status, "in_progress"),
            ),
          )
          .for("update");

        if (
          concurrentActiveRows.length !== 1 ||
          !isCompatiblePracticeClaim(concurrentActiveRows[0]!, input)
        ) {
          throw new ActiveAnswerSessionClaimConflictError();
        }

        return mapPracticeRow(concurrentActiveRows[0]!);
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
        .select({
          answer_record: answerRecord,
          mistake_book_public_id: mistakeBook.public_id,
        })
        .from(answerRecord)
        .leftJoin(
          mistakeBook,
          and(
            eq(mistakeBook.user_id, userId),
            eq(mistakeBook.question_public_id, answerRecord.question_public_id),
          ),
        )
        .where(
          and(
            eq(answerRecord.user_id, userId),
            eq(answerRecord.practice_id, practiceRow.id),
          ),
        )
        .orderBy(asc(answerRecord.answered_at), asc(answerRecord.public_id));

      return rows.map(
        (row): PracticeAnswerResumeRow => ({
          ...mapPracticeAnswerRecordRow(row.answer_record),
          mistake_book_public_id: row.mistake_book_public_id,
        }),
      );
    },
    async submitPracticeAnswer(input) {
      const database = getDatabase();
      const userId = await getRequiredUserId(database, input.userPublicId);

      return database.transaction(async (transaction) => {
        const transactionalDatabase = transaction as StudentFlowRuntimeDatabase;

        if (input.authorizationLineage === null) {
          await lockOrganizationScopeMutation(transactionalDatabase);
          const scopes = await listEffectiveAuthorizationScopes(
            transactionalDatabase,
            input.userPublicId,
            input.answeredAt,
          );

          if (
            !scopes.some(
              (scope) =>
                scope.profession === input.profession &&
                scope.level === input.level &&
                scope.expires_at > input.answeredAt,
            )
          ) {
            return { status: "authoritative_state_conflict" as const };
          }
        } else {
          try {
            await validateAndLockAuthorizationLineageForStart(
              transactionalDatabase,
              input.userPublicId,
              input.profession,
              input.level,
              input.answeredAt,
              input.authorizationLineage,
            );
          } catch (error) {
            if (error instanceof AuthorizationStartConflictError) {
              return { status: "authoritative_state_conflict" as const };
            }
            throw error;
          }
        }

        const practiceRows = await transaction
          .select()
          .from(practice)
          .where(
            and(
              eq(practice.user_id, userId),
              eq(practice.public_id, input.practicePublicId),
              eq(practice.practice_status, "in_progress"),
            ),
          )
          .for("update");

        if (practiceRows.length !== 1) {
          return { status: "authoritative_state_conflict" as const };
        }

        const practiceRow = practiceRows[0]!;
        const hasExpectedLineage =
          input.authorizationLineage === null
            ? hasLegacyAuthorizationLineage(practiceRow)
            : hasCompatibleAuthorizationLineage(
                practiceRow,
                input.authorizationLineage,
              );

        if (
          practiceRow.expires_at <= input.answeredAt ||
          practiceRow.profession !== input.profession ||
          practiceRow.level !== input.level ||
          practiceRow.subject !== input.subject ||
          !hasExpectedLineage ||
          JSON.stringify(canonicalizeJson(practiceRow.paper_snapshot)) !==
            JSON.stringify(canonicalizeJson(input.expectedPracticeSnapshot))
        ) {
          return { status: "authoritative_state_conflict" as const };
        }

        const questionEntries = listPublishedPaperSnapshotQuestionEntries(
          asRecord(practiceRow.paper_snapshot),
        ).filter(
          ({ paperQuestion: candidate }) =>
            candidate.paperQuestionPublicId === input.paperQuestionPublicId,
        );

        if (questionEntries.length !== 1) {
          return { status: "authoritative_state_conflict" as const };
        }

        const questionSnapshot = questionEntries[0]!.paperQuestion;
        const authoritativeMaxAttemptCount =
          questionSnapshot.scoringMethod === "auto_match"
            ? 1
            : questionSnapshot.scoringMethod === "ai_scoring"
              ? 2
              : null;

        if (
          authoritativeMaxAttemptCount !== input.maxAttemptCount ||
          questionSnapshot.questionPublicId !== input.questionPublicId ||
          JSON.stringify(canonicalizeJson(questionSnapshot)) !==
            JSON.stringify(canonicalizeJson(input.questionSnapshot))
        ) {
          return { status: "authoritative_state_conflict" as const };
        }

        const isCoherentPreparedAnswer =
          input.maxAttemptCount === 1
            ? input.answerRecordStatus === "scored" &&
              input.isCorrect !== null &&
              input.score !== null
            : input.answerRecordStatus === "submitted" &&
              input.isCorrect === null &&
              input.score === null;
        const requiresMistakeBook =
          input.maxAttemptCount === 1 && input.isCorrect === false;

        if (
          !isCoherentPreparedAnswer ||
          (input.mistakeBook !== null) !== requiresMistakeBook
        ) {
          return { status: "authoritative_state_conflict" as const };
        }

        await lockPracticeAnswerAttempt(
          transactionalDatabase,
          practiceRow.id,
          input.paperQuestionPublicId,
        );

        const attemptRows = await transaction
          .select({
            exam_mode: answerRecord.exam_mode,
            practice_id: answerRecord.practice_id,
            mock_exam_id: answerRecord.mock_exam_id,
            paper_id: answerRecord.paper_id,
            paper_question_public_id: answerRecord.paper_question_public_id,
            question_public_id: answerRecord.question_public_id,
            practice_attempt_number: answerRecord.practice_attempt_number,
            practice_max_attempt_count: answerRecord.practice_max_attempt_count,
          })
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
          .for("update");

        const legacyAttemptRows = attemptRows.filter(
          (row) =>
            row.practice_attempt_number === null &&
            row.practice_max_attempt_count === null,
        );
        const numberedAttemptRows = attemptRows.filter(
          (row) =>
            row.practice_attempt_number !== null &&
            row.practice_max_attempt_count !== null,
        );
        const hasCoherentAttemptIdentity = attemptRows.every(
          (row) =>
            row.exam_mode === "practice" &&
            row.practice_id === practiceRow.id &&
            row.mock_exam_id === null &&
            row.paper_id === practiceRow.paper_id &&
            row.paper_question_public_id === input.paperQuestionPublicId &&
            row.question_public_id === input.questionPublicId,
        );

        if (
          !hasCoherentAttemptIdentity ||
          legacyAttemptRows.length + numberedAttemptRows.length !==
            attemptRows.length ||
          (legacyAttemptRows.length > 0 && numberedAttemptRows.length > 0) ||
          legacyAttemptRows.length > 1
        ) {
          return { status: "authoritative_state_conflict" as const };
        }

        if (legacyAttemptRows.length === 1) {
          return {
            status:
              input.maxAttemptCount === 1
                ? ("objective_already_answered" as const)
                : ("authoritative_state_conflict" as const),
          };
        }

        const attemptNumbers = numberedAttemptRows
          .map((row) => row.practice_attempt_number!)
          .sort((left, right) => left - right);
        const hasCoherentNumberedHistory = numberedAttemptRows.every(
          (row) =>
            row.practice_max_attempt_count === input.maxAttemptCount &&
            Number.isSafeInteger(row.practice_attempt_number) &&
            row.practice_attempt_number! >= 1 &&
            row.practice_attempt_number! <= input.maxAttemptCount,
        );

        if (
          !hasCoherentNumberedHistory ||
          attemptNumbers.some(
            (attemptNumber, index) => attemptNumber !== index + 1,
          )
        ) {
          return { status: "authoritative_state_conflict" as const };
        }

        if (attemptNumbers.length >= input.maxAttemptCount) {
          return {
            status:
              input.maxAttemptCount === 1
                ? ("objective_already_answered" as const)
                : ("subjective_retry_exhausted" as const),
          };
        }

        const paperQuestionId = await getRequiredPaperQuestionId(
          transactionalDatabase,
          input.paperQuestionPublicId,
          practiceRow.paper_id,
        );
        const [answerRow] = await transaction
          .insert(answerRecord)
          .values({
            public_id: input.publicId,
            user_id: userId,
            exam_mode: "practice",
            practice_id: practiceRow.id,
            mock_exam_id: null,
            paper_id: practiceRow.paper_id,
            paper_question_id: paperQuestionId,
            paper_question_public_id: input.paperQuestionPublicId,
            question_public_id: input.questionPublicId,
            question_snapshot: input.questionSnapshot,
            answer_snapshot: input.answerSnapshot,
            answer_record_status: input.answerRecordStatus,
            is_correct: input.isCorrect,
            score: input.score,
            max_score: input.maxScore,
            practice_attempt_number: attemptNumbers.length + 1,
            practice_max_attempt_count: input.maxAttemptCount,
            answered_at: input.answeredAt,
            submitted_at: input.submittedAt,
          })
          .returning();

        if (answerRow === undefined) {
          throw new Error("Practice answer insert did not return a row.");
        }

        const [updatedPractice] = await transaction
          .update(practice)
          .set({
            last_answered_at: sql`greatest(coalesce(${practice.last_answered_at}, ${input.answeredAt}), ${input.answeredAt})`,
            updated_at: sql`greatest(${practice.updated_at}, ${input.answeredAt})`,
          })
          .where(
            and(
              eq(practice.id, practiceRow.id),
              eq(practice.practice_status, "in_progress"),
            ),
          )
          .returning({ id: practice.id });

        if (updatedPractice === undefined) {
          throw new Error("Practice progress update did not affect one row.");
        }

        let mistakeBookPublicId: string | null = null;

        if (input.mistakeBook !== null) {
          const mistakeInput = input.mistakeBook;

          if (
            mistakeInput.userPublicId !== input.userPublicId ||
            mistakeInput.questionPublicId !== input.questionPublicId ||
            mistakeInput.paperQuestionPublicId !==
              input.paperQuestionPublicId ||
            mistakeInput.profession !== input.profession ||
            mistakeInput.level !== input.level ||
            mistakeInput.subject !== input.subject ||
            mistakeInput.latestWrongAt.getTime() !==
              input.answeredAt.getTime() ||
            JSON.stringify(canonicalizeJson(mistakeInput.questionSnapshot)) !==
              JSON.stringify(canonicalizeJson(input.questionSnapshot)) ||
            JSON.stringify(
              canonicalizeJson(mistakeInput.latestAnswerSnapshot),
            ) !== JSON.stringify(canonicalizeJson(input.answerSnapshot))
          ) {
            throw new Error(
              "Mistake book input conflicts with answer identity.",
            );
          }

          const [mistakeRow] = await transaction
            .insert(mistakeBook)
            .values({
              public_id: mistakeInput.publicId,
              user_id: userId,
              question_public_id: mistakeInput.questionPublicId,
              paper_question_public_id: mistakeInput.paperQuestionPublicId,
              profession: mistakeInput.profession,
              level: mistakeInput.level,
              subject: mistakeInput.subject,
              question_snapshot: mistakeInput.questionSnapshot,
              latest_answer_snapshot: mistakeInput.latestAnswerSnapshot,
              mistake_book_source: "wrong_answer",
              mistake_book_status: "unmastered",
              wrong_count: 1,
              is_favorite: false,
              is_removed: false,
              mastered_at: null,
              latest_wrong_at: mistakeInput.latestWrongAt,
              updated_at: mistakeInput.latestWrongAt,
            })
            .onConflictDoUpdate({
              target: [mistakeBook.user_id, mistakeBook.question_public_id],
              set: {
                latest_answer_snapshot: mistakeInput.latestAnswerSnapshot,
                mistake_book_status: "unmastered",
                wrong_count: sql`${mistakeBook.wrong_count} + 1`,
                is_removed: false,
                mastered_at: null,
                latest_wrong_at: mistakeInput.latestWrongAt,
                updated_at: mistakeInput.latestWrongAt,
              },
            })
            .returning({ public_id: mistakeBook.public_id });

          if (mistakeRow === undefined) {
            throw new Error("Mistake book upsert did not return a row.");
          }
          mistakeBookPublicId = mistakeRow.public_id;
        }

        return {
          status: "created" as const,
          answerRecord: mapPracticeAnswerRecordRow(answerRow),
          mistakeBookPublicId,
        };
      });
    },
    async upsertMistakeBookFromFavorite(input) {
      const database = getDatabase();
      const userId = await getRequiredUserId(database, input.userPublicId);
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
        .onConflictDoUpdate({
          target: [mistakeBook.user_id, mistakeBook.question_public_id],
          set: {
            mistake_book_status: sql`case when ${mistakeBook.mistake_book_status} = 'removed' then 'unmastered'::mistake_book_status else ${mistakeBook.mistake_book_status} end`,
            is_favorite: true,
            is_removed: false,
            updated_at: input.favoritedAt,
          },
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
        const transactionalDatabase = transaction as StudentFlowRuntimeDatabase;
        await validateAndLockAuthorizationLineageForStart(
          transactionalDatabase,
          input.userPublicId,
          input.profession,
          input.level,
          input.startedAt,
          input.authorizationLineage,
        );
        const paperId = await getRequiredPublishedPaperIdForStart(
          transactionalDatabase,
          input.paperPublicId,
        );
        await lockActiveAnswerSessionClaim(
          transactionalDatabase,
          "mock_exam",
          userId,
          paperId,
        );
        const activeRows = await transaction
          .select()
          .from(mockExam)
          .where(
            and(
              eq(mockExam.user_id, userId),
              eq(mockExam.paper_id, paperId),
              eq(mockExam.exam_status, "in_progress"),
            ),
          )
          .for("update");

        if (activeRows.length > 1) {
          throw new ActiveAnswerSessionClaimConflictError();
        }

        const activeRow = activeRows[0];

        if (activeRow !== undefined) {
          if (!isCompatibleMockExamClaim(activeRow, input)) {
            throw new ActiveAnswerSessionClaimConflictError();
          }

          if (activeRow.public_id !== input.replaceActivePublicId) {
            return mapMockExamRow(
              activeRow,
              await countMockExamAnswers(transactionalDatabase, activeRow.id),
            );
          }

          const [terminatedRow] = await transaction
            .update(mockExam)
            .set({
              exam_status: "terminated",
              terminated_at: input.startedAt,
              termination_reason: "stale_empty_snapshot",
              updated_at: input.startedAt,
            })
            .where(
              and(
                eq(mockExam.id, activeRow.id),
                eq(mockExam.exam_status, "in_progress"),
              ),
            )
            .returning({ id: mockExam.id });

          if (terminatedRow === undefined) {
            throw new ActiveAnswerSessionClaimConflictError();
          }

          await transaction
            .update(mockExamDeadlineTask)
            .set({
              task_status: "cancelled",
              lease_expires_at: null,
              worker_public_id: null,
              completed_at: input.startedAt,
              updated_at: input.startedAt,
            })
            .where(eq(mockExamDeadlineTask.mock_exam_id, activeRow.id));
        } else if (input.replaceActivePublicId !== null) {
          throw new ActiveAnswerSessionClaimConflictError();
        }

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
            authorization_source:
              input.authorizationLineage.authorizationSource,
            authorization_public_id:
              input.authorizationLineage.authorizationPublicId,
            authorization_organization_public_id:
              input.authorizationLineage.organizationPublicId,
            quota_owner_type: input.authorizationLineage.quotaOwnerType,
            quota_owner_public_id:
              input.authorizationLineage.quotaOwnerPublicId,
          })
          .onConflictDoNothing()
          .returning();

        if (row === undefined) {
          const concurrentActiveRows = await transaction
            .select()
            .from(mockExam)
            .where(
              and(
                eq(mockExam.user_id, userId),
                eq(mockExam.paper_id, paperId),
                eq(mockExam.exam_status, "in_progress"),
              ),
            )
            .for("update");

          if (
            concurrentActiveRows.length !== 1 ||
            !isCompatibleMockExamClaim(concurrentActiveRows[0]!, input)
          ) {
            throw new ActiveAnswerSessionClaimConflictError();
          }

          return mapMockExamRow(
            concurrentActiveRows[0]!,
            await countMockExamAnswers(
              transactionalDatabase,
              concurrentActiveRows[0]!.id,
            ),
          );
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
              eq(mockExam.public_id, input.publicId),
              eq(mockExam.user_id, userId),
            ),
          )
          .for("update");

        if (ownedMockExam === undefined) {
          return null;
        }

        if (
          ["completed", "scoring", "scoring_partial_failed"].includes(
            ownedMockExam.exam_status,
          )
        ) {
          return mapMockExamRow(
            ownedMockExam,
            await countMockExamAnswers(
              transaction as StudentFlowRuntimeDatabase,
              ownedMockExam.id,
            ),
          );
        }

        if (ownedMockExam.exam_status !== "in_progress") {
          return null;
        }

        const currentAnswerRows = await transaction
          .select()
          .from(answerRecord)
          .where(eq(answerRecord.mock_exam_id, ownedMockExam.id))
          .for("update");
        const answerByPublicId = new Map(
          currentAnswerRows.map((row) => [row.public_id, row]),
        );
        const resultPublicIds = input.answerRecordResults.map(
          (result) => result.answerRecordPublicId,
        );
        const resultPaperQuestionPublicIds = input.answerRecordResults.map(
          (result) => result.paperQuestionPublicId,
        );

        if (
          currentAnswerRows.length !== input.answerRecordResults.length ||
          answerByPublicId.size !== currentAnswerRows.length ||
          new Set(resultPublicIds).size !== resultPublicIds.length ||
          new Set(resultPaperQuestionPublicIds).size !==
            resultPaperQuestionPublicIds.length
        ) {
          throw new Error("Mock exam answer set cardinality is invalid.");
        }

        for (const result of input.answerRecordResults) {
          const current = answerByPublicId.get(result.answerRecordPublicId);
          if (
            current === undefined ||
            current.user_id !== userId ||
            current.exam_mode !== "mock_exam" ||
            current.practice_id !== null ||
            current.mock_exam_id !== ownedMockExam.id ||
            current.paper_question_public_id !== result.paperQuestionPublicId ||
            current.answer_revision !== result.expectedRevision ||
            current.answer_record_status !==
              result.expectedAnswerRecordStatus ||
            current.submitted_at !== null ||
            current.is_correct !== null ||
            current.score !== null
          ) {
            throw new Error("Mock exam answer identity or revision is stale.");
          }

          if (
            (result.answerRecordStatus === "submitted" &&
              (result.isCorrect !== null || result.score !== null)) ||
            (result.answerRecordStatus === "scored" && result.score === null) ||
            !["submitted", "scored"].includes(result.answerRecordStatus)
          ) {
            throw new Error("Mock exam answer result state is invalid.");
          }
        }

        const submittedAnswerPublicIds = input.answerRecordResults
          .filter((result) => result.answerRecordStatus === "submitted")
          .map((result) => result.answerRecordPublicId);
        const taskAnswerPublicIds = input.aiScoringTasks.map(
          (task) => task.answerRecordPublicId,
        );
        const taskPublicIds = input.aiScoringTasks.map((task) => task.publicId);
        const taskIdempotencyHashes = input.aiScoringTasks.map(
          (task) => task.idempotencyKeyHash,
        );
        const sortedSubmittedAnswerPublicIds = [
          ...submittedAnswerPublicIds,
        ].sort();
        const sortedTaskAnswerPublicIds = [...taskAnswerPublicIds].sort();
        if (
          JSON.stringify(sortedSubmittedAnswerPublicIds) !==
            JSON.stringify(sortedTaskAnswerPublicIds) ||
          new Set(taskAnswerPublicIds).size !== taskAnswerPublicIds.length ||
          new Set(taskPublicIds).size !== taskPublicIds.length ||
          new Set(taskIdempotencyHashes).size !==
            taskIdempotencyHashes.length ||
          input.aiScoringTasks.some(
            (task) =>
              task.mockExamPublicId !== input.publicId ||
              task.actorPublicId !== input.userPublicId ||
              !answerByPublicId.has(task.answerRecordPublicId),
          )
        ) {
          throw new Error("AI scoring task set is inconsistent.");
        }

        const derivedExamStatus =
          input.aiScoringTasks.length > 0 ? "scoring" : "completed";
        if (
          input.examStatus !== derivedExamStatus ||
          (derivedExamStatus === "scoring" && input.subjectiveScore !== null)
        ) {
          throw new Error("Mock exam terminal status is inconsistent.");
        }

        const deadlineRows = await transaction
          .select()
          .from(mockExamDeadlineTask)
          .where(eq(mockExamDeadlineTask.mock_exam_id, ownedMockExam.id))
          .for("update");
        if (
          (ownedMockExam.server_deadline_at === null &&
            deadlineRows.length !== 0) ||
          (ownedMockExam.server_deadline_at !== null &&
            deadlineRows.length !== 1)
        ) {
          throw new Error("Mock exam deadline task cardinality is invalid.");
        }

        const deadlineTask = deadlineRows[0];
        if (deadlineTask !== undefined) {
          if (deadlineTask.task_status === "pending") {
            if (
              deadlineTask.claimed_at !== null ||
              deadlineTask.lease_expires_at !== null ||
              deadlineTask.worker_public_id !== null
            ) {
              throw new Error("Pending deadline task has an invalid lease.");
            }
          } else if (deadlineTask.task_status === "running") {
            if (
              deadlineTask.claimed_at === null ||
              deadlineTask.lease_expires_at === null ||
              deadlineTask.worker_public_id === null ||
              deadlineTask.lease_expires_at <= input.submittedAt
            ) {
              throw new Error("Running deadline task lease is invalid.");
            }
          } else {
            throw new Error("Mock exam deadline task state is invalid.");
          }
        }

        for (const result of input.answerRecordResults) {
          const updatedAnswerRows = await transaction
            .update(answerRecord)
            .set({
              answer_revision: result.expectedRevision + 1,
              answer_record_status: result.answerRecordStatus,
              is_correct: result.isCorrect,
              score: result.score,
              submitted_at: result.submittedAt,
              updated_at: result.submittedAt,
            })
            .where(
              and(
                eq(answerRecord.public_id, result.answerRecordPublicId),
                eq(answerRecord.mock_exam_id, ownedMockExam.id),
                eq(
                  answerRecord.paper_question_public_id,
                  result.paperQuestionPublicId,
                ),
                eq(answerRecord.answer_revision, result.expectedRevision),
                eq(
                  answerRecord.answer_record_status,
                  result.expectedAnswerRecordStatus,
                ),
              ),
            )
            .returning({ public_id: answerRecord.public_id });
          if (
            updatedAnswerRows.length !== 1 ||
            updatedAnswerRows[0]!.public_id !== result.answerRecordPublicId
          ) {
            throw new Error("Mock exam answer CAS failed.");
          }
        }

        if (input.aiScoringTasks.length > 0) {
          const answerRecordIdByPublicId = new Map(
            currentAnswerRows.map((row) => [row.public_id, row.id]),
          );
          const insertedTaskRows = await transaction
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
            .returning({
              public_id: aiScoringTask.public_id,
              answer_record_id: aiScoringTask.answer_record_id,
              idempotency_key_hash: aiScoringTask.idempotency_key_hash,
            });
          if (
            insertedTaskRows.length !== input.aiScoringTasks.length ||
            insertedTaskRows.some((insertedTask) => {
              const expected = input.aiScoringTasks.find(
                (task) => task.publicId === insertedTask.public_id,
              );
              return (
                expected === undefined ||
                answerRecordIdByPublicId.get(expected.answerRecordPublicId) !==
                  insertedTask.answer_record_id ||
                expected.idempotencyKeyHash !==
                  insertedTask.idempotency_key_hash
              );
            })
          ) {
            throw new Error("AI scoring task insert cardinality is invalid.");
          }
        }

        if (deadlineTask?.task_status === "pending") {
          const completedDeadlineTasks = await transaction
            .update(mockExamDeadlineTask)
            .set({
              task_status: "completed",
              failure_message_digest: null,
              completed_at: input.submittedAt,
              updated_at: input.submittedAt,
            })
            .where(
              and(
                eq(mockExamDeadlineTask.id, deadlineTask.id),
                eq(mockExamDeadlineTask.mock_exam_id, ownedMockExam.id),
                eq(mockExamDeadlineTask.task_status, "pending"),
              ),
            )
            .returning({ id: mockExamDeadlineTask.id });
          if (completedDeadlineTasks.length !== 1) {
            throw new Error("Mock exam deadline task CAS failed.");
          }
        }

        const transitionedRows = await transaction
          .update(mockExam)
          .set({
            exam_status: derivedExamStatus,
            submitted_at: input.submittedAt,
            objective_score: input.objectiveScore,
            subjective_score: input.subjectiveScore,
            total_score: input.totalScore,
            updated_at: input.submittedAt,
          })
          .where(
            and(
              eq(mockExam.id, ownedMockExam.id),
              eq(mockExam.user_id, userId),
              eq(mockExam.exam_status, "in_progress"),
            ),
          )
          .returning();
        if (transitionedRows.length !== 1) {
          throw new Error("Mock exam submit CAS failed.");
        }

        return mapMockExamRow(transitionedRows[0]!, currentAnswerRows.length);
      });
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

      return database.transaction(async (transaction) => {
        await lockExamReportScoringFinalization(
          transaction,
          input.mockExamPublicId,
        );
        const userId = await getRequiredUserId(transaction, input.userPublicId);
        const ownedMockExam = await findOwnedMockExamTableRow(
          transaction,
          input.userPublicId,
          input.mockExamPublicId,
        );

        if (
          ownedMockExam === null ||
          !["completed", "scoring_partial_failed"].includes(
            ownedMockExam.exam_status,
          )
        ) {
          throw new Error("Exam report mock_exam scope is invalid.");
        }

        const answerRecords = await listMockExamAnswerRecords(
          transaction,
          input.userPublicId,
          input.mockExamPublicId,
        );
        const reportSnapshot = buildExamReportSnapshot(
          mapExamReportMockExamRow(ownedMockExam),
          answerRecords,
        );
        const insertedRows = await transaction
          .insert(examReport)
          .values({
            public_id: input.publicId,
            user_id: userId,
            mock_exam_id: ownedMockExam.id,
            paper_id: ownedMockExam.paper_id,
            paper_public_id: ownedMockExam.paper_public_id,
            report_snapshot: reportSnapshot,
            exam_status: ownedMockExam.exam_status,
            profession: ownedMockExam.profession,
            level: ownedMockExam.level,
            subject: ownedMockExam.subject,
            objective_score: ownedMockExam.objective_score,
            subjective_score: ownedMockExam.subjective_score,
            total_score: ownedMockExam.total_score,
            duration_second: calculateDurationSecond(
              mapExamReportMockExamRow(ownedMockExam),
            ),
            learning_suggestion_snapshot: null,
            learning_suggestion_status:
              ownedMockExam.exam_status === "completed" ? "pending" : null,
            learning_suggestion_attempt_count:
              ownedMockExam.exam_status === "completed" ? 0 : null,
            learning_suggestion_input_digest: null,
            learning_suggestion_claimed_at: null,
            learning_suggestion_completed_at: null,
            learning_suggestion_failure_category: null,
            generated_at: input.generatedAt,
          })
          .onConflictDoNothing({ target: examReport.mock_exam_id })
          .returning();
        const existingRows = await transaction
          .select()
          .from(examReport)
          .where(
            and(
              eq(examReport.user_id, userId),
              eq(examReport.mock_exam_id, ownedMockExam.id),
            ),
          );

        if (
          insertedRows.length > 1 ||
          existingRows.length !== 1 ||
          (insertedRows.length === 1 &&
            existingRows[0]?.public_id !== input.publicId)
        ) {
          throw new Error("Exam report insert cardinality is invalid.");
        }

        return mapExamReportRow(
          existingRows[0],
          input.mockExamPublicId,
          getPaperName(ownedMockExam.paper_snapshot as Record<string, unknown>),
          ownedMockExam.started_at,
        );
      });
    },
    async rebuildExamReport(input) {
      const database = getDatabase();

      return database.transaction(async (transaction) => {
        await lockExamReportScoringFinalization(
          transaction,
          input.mockExamPublicId,
        );
        const userId = await getRequiredUserId(transaction, input.userPublicId);
        const ownedMockExam = await findOwnedMockExamTableRow(
          transaction,
          input.userPublicId,
          input.mockExamPublicId,
        );

        if (
          ownedMockExam === null ||
          !["completed", "scoring_partial_failed"].includes(
            ownedMockExam.exam_status,
          )
        ) {
          throw new Error("Exam report mock_exam scope is invalid.");
        }

        const existingRows = await transaction
          .select()
          .from(examReport)
          .where(
            and(
              eq(examReport.user_id, userId),
              eq(examReport.public_id, input.publicId),
              eq(examReport.mock_exam_id, ownedMockExam.id),
            ),
          );

        if (existingRows.length !== 1) {
          throw new Error("Exam report rebuild cardinality is invalid.");
        }

        if (
          existingRows[0]?.exam_status === "completed" &&
          ownedMockExam.exam_status !== "completed"
        ) {
          throw new Error("Completed exam report cannot regress.");
        }

        const answerRecords = await listMockExamAnswerRecords(
          transaction,
          input.userPublicId,
          input.mockExamPublicId,
        );
        const mockExamProjection = mapExamReportMockExamRow(ownedMockExam);
        const reportSnapshot = buildExamReportSnapshot(
          mockExamProjection,
          answerRecords,
        );
        const durationSecond = calculateDurationSecond(mockExamProjection);
        const changedReportCondition = or(
          sql`${examReport.report_snapshot} is distinct from ${JSON.stringify(reportSnapshot)}::jsonb`,
          sql`${examReport.exam_status} is distinct from ${ownedMockExam.exam_status}::exam_status`,
          sql`${examReport.objective_score} is distinct from ${ownedMockExam.objective_score}::numeric`,
          sql`${examReport.subjective_score} is distinct from ${ownedMockExam.subjective_score}::numeric`,
          sql`${examReport.total_score} is distinct from ${ownedMockExam.total_score}::numeric`,
          sql`${examReport.duration_second} is distinct from ${durationSecond}`,
        );
        const rebuiltRows = await transaction
          .update(examReport)
          .set({
            report_snapshot: reportSnapshot,
            report_revision: sql`${examReport.report_revision} + 1`,
            exam_status: ownedMockExam.exam_status,
            objective_score: ownedMockExam.objective_score,
            subjective_score: ownedMockExam.subjective_score,
            total_score: ownedMockExam.total_score,
            duration_second: durationSecond,
            learning_suggestion_snapshot: null,
            learning_suggestion_status:
              ownedMockExam.exam_status === "completed" ? "pending" : null,
            learning_suggestion_attempt_count:
              ownedMockExam.exam_status === "completed" ? 0 : null,
            learning_suggestion_input_digest: null,
            learning_suggestion_claimed_at: null,
            learning_suggestion_completed_at: null,
            learning_suggestion_failure_category: null,
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

        if (rebuiltRows.length > 1) {
          throw new Error("Exam report rebuild updated multiple rows.");
        }

        const persistedRow = rebuiltRows[0] ?? existingRows[0];

        return mapExamReportRow(
          persistedRow,
          input.mockExamPublicId,
          getPaperName(ownedMockExam.paper_snapshot as Record<string, unknown>),
          ownedMockExam.started_at,
        );
      });
    },
    async claimExamReportLearningSuggestion(input) {
      const database = getDatabase();
      const userId = await findUserIdByPublicId(database, input.userPublicId);

      if (userId === null) {
        throw new Error("Exam report learning suggestion user is unavailable.");
      }

      return database.transaction(async (transaction) => {
        const claimableCondition =
          input.claimMode === "automatic"
            ? and(
                eq(examReport.learning_suggestion_status, "pending"),
                eq(examReport.learning_suggestion_attempt_count, 0),
                isNull(examReport.learning_suggestion_input_digest),
              )
            : or(
                and(
                  eq(examReport.learning_suggestion_status, "pending"),
                  eq(examReport.learning_suggestion_attempt_count, 0),
                  isNull(examReport.learning_suggestion_input_digest),
                  lte(examReport.updated_at, input.pendingRecoveryBefore),
                ),
                and(
                  eq(examReport.learning_suggestion_status, "failed"),
                  sql`${examReport.learning_suggestion_attempt_count} < 3`,
                  eq(
                    examReport.learning_suggestion_input_digest,
                    input.inputDigest,
                  ),
                  sql`${examReport.learning_suggestion_failure_category} in ('configuration_unavailable', 'provider_failed', 'timeout')`,
                ),
                and(
                  eq(examReport.learning_suggestion_status, "running"),
                  sql`${examReport.learning_suggestion_attempt_count} < 3`,
                  eq(
                    examReport.learning_suggestion_input_digest,
                    input.inputDigest,
                  ),
                  lte(
                    examReport.learning_suggestion_claimed_at,
                    input.staleRunningBefore,
                  ),
                ),
              );
        const claimedRows = await transaction
          .update(examReport)
          .set({
            learning_suggestion_status: "running",
            learning_suggestion_attempt_count: sql`${examReport.learning_suggestion_attempt_count} + 1`,
            learning_suggestion_input_digest: input.inputDigest,
            learning_suggestion_claimed_at: input.claimedAt,
            learning_suggestion_completed_at: null,
            learning_suggestion_failure_category: null,
            learning_suggestion_snapshot: null,
            updated_at: input.claimedAt,
          })
          .where(
            and(
              eq(examReport.user_id, userId),
              eq(examReport.public_id, input.publicId),
              eq(examReport.exam_status, "completed"),
              eq(examReport.report_revision, input.expectedReportRevision),
              claimableCondition,
            ),
          )
          .returning({
            reportRevision: examReport.report_revision,
            attemptCount: examReport.learning_suggestion_attempt_count,
            inputDigest: examReport.learning_suggestion_input_digest,
            claimedAt: examReport.learning_suggestion_claimed_at,
          });

        if (claimedRows.length > 1) {
          throw new Error(
            "Exam report learning suggestion claim cardinality is invalid.",
          );
        }
        const claimed = claimedRows[0];
        if (
          claimed === undefined ||
          claimed.attemptCount === null ||
          claimed.inputDigest === null ||
          claimed.claimedAt === null
        ) {
          return null;
        }
        return {
          userPublicId: input.userPublicId,
          publicId: input.publicId,
          reportRevision: claimed.reportRevision,
          attemptCount: claimed.attemptCount,
          inputDigest: claimed.inputDigest,
          claimedAt: claimed.claimedAt,
        };
      });
    },
    async finalizeExamReportLearningSuggestion(input) {
      const database = getDatabase();
      const userId = await findUserIdByPublicId(database, input.userPublicId);
      if (userId === null) {
        throw new Error("Exam report learning suggestion user is unavailable.");
      }
      const updatedRows = await database
        .update(examReport)
        .set({
          learning_suggestion_status: "succeeded",
          learning_suggestion_snapshot: input.learningSuggestionSnapshot,
          learning_suggestion_completed_at: input.completedAt,
          learning_suggestion_failure_category: null,
          updated_at: input.completedAt,
        })
        .where(
          and(
            eq(examReport.user_id, userId),
            eq(examReport.public_id, input.publicId),
            eq(examReport.report_revision, input.reportRevision),
            eq(examReport.learning_suggestion_status, "running"),
            eq(
              examReport.learning_suggestion_attempt_count,
              input.attemptCount,
            ),
            eq(examReport.learning_suggestion_input_digest, input.inputDigest),
            eq(examReport.learning_suggestion_claimed_at, input.claimedAt),
          ),
        )
        .returning({ id: examReport.id });
      if (updatedRows.length !== 1) {
        throw new Error("Exam report learning suggestion finalize conflict.");
      }
    },
    async failExamReportLearningSuggestion(input) {
      const database = getDatabase();
      const userId = await findUserIdByPublicId(database, input.userPublicId);
      if (userId === null) {
        throw new Error("Exam report learning suggestion user is unavailable.");
      }
      const updatedRows = await database
        .update(examReport)
        .set({
          learning_suggestion_status: "failed",
          learning_suggestion_snapshot: null,
          learning_suggestion_completed_at: input.completedAt,
          learning_suggestion_failure_category: input.failureCategory,
          updated_at: input.completedAt,
        })
        .where(
          and(
            eq(examReport.user_id, userId),
            eq(examReport.public_id, input.publicId),
            eq(examReport.report_revision, input.reportRevision),
            eq(examReport.learning_suggestion_status, "running"),
            eq(
              examReport.learning_suggestion_attempt_count,
              input.attemptCount,
            ),
            eq(examReport.learning_suggestion_input_digest, input.inputDigest),
            eq(examReport.learning_suggestion_claimed_at, input.claimedAt),
          ),
        )
        .returning({ id: examReport.id });
      if (updatedRows.length !== 1) {
        throw new Error("Exam report learning suggestion failure conflict.");
      }
    },
    async failPendingExamReportLearningSuggestionInput(input) {
      const database = getDatabase();
      const userId = await findUserIdByPublicId(database, input.userPublicId);
      if (userId === null) {
        throw new Error("Exam report learning suggestion user is unavailable.");
      }
      const updatedRows = await database
        .update(examReport)
        .set({
          learning_suggestion_status: "failed",
          learning_suggestion_attempt_count: 0,
          learning_suggestion_input_digest: null,
          learning_suggestion_claimed_at: null,
          learning_suggestion_completed_at: input.completedAt,
          learning_suggestion_failure_category: "input_unavailable",
          learning_suggestion_snapshot: null,
          updated_at: input.completedAt,
        })
        .where(
          and(
            eq(examReport.user_id, userId),
            eq(examReport.public_id, input.publicId),
            eq(examReport.report_revision, input.expectedReportRevision),
            eq(examReport.learning_suggestion_status, "pending"),
            eq(examReport.learning_suggestion_attempt_count, 0),
          ),
        )
        .returning({ id: examReport.id });
      if (updatedRows.length !== 1) {
        throw new Error(
          "Exam report learning suggestion input failure conflict.",
        );
      }
    },
  };
}

async function lockActiveAnswerSessionClaim(
  database: StudentFlowRuntimeDatabase,
  mode: "practice" | "mock_exam",
  userId: number,
  paperId: number,
): Promise<void> {
  const claimIdentity = `${mode}:${userId}:${paperId}`;

  await database.execute(
    sql`select pg_advisory_xact_lock(${ACTIVE_ANSWER_SESSION_CLAIM_LOCK_NAMESPACE}, hashtext(${claimIdentity}))`,
  );
}

async function lockPracticeAnswerAttempt(
  database: StudentFlowRuntimeDatabase,
  practiceId: number,
  paperQuestionPublicId: string,
): Promise<void> {
  const attemptIdentity = `${practiceId}:${paperQuestionPublicId}`;

  await database.execute(
    sql`select pg_advisory_xact_lock(${PRACTICE_ANSWER_ATTEMPT_LOCK_NAMESPACE}, hashtext(${attemptIdentity}))`,
  );
}

function canonicalizeJson(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(canonicalizeJson);
  }

  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
        .map(([key, entryValue]) => [key, canonicalizeJson(entryValue)]),
    );
  }

  return value;
}

function hasCompatibleAuthorizationLineage(
  row: {
    authorization_source: string | null;
    authorization_public_id: string | null;
    authorization_organization_public_id: string | null;
    quota_owner_type: string | null;
    quota_owner_public_id: string | null;
  },
  lineage: AnswerSessionAuthorizationLineage,
): boolean {
  if (row.authorization_source === null) {
    return (
      row.authorization_public_id === null &&
      row.authorization_organization_public_id === null &&
      row.quota_owner_type === null &&
      row.quota_owner_public_id === null
    );
  }

  return (
    row.authorization_source === lineage.authorizationSource &&
    row.authorization_public_id === lineage.authorizationPublicId &&
    row.authorization_organization_public_id === lineage.organizationPublicId &&
    row.quota_owner_type === lineage.quotaOwnerType &&
    row.quota_owner_public_id === lineage.quotaOwnerPublicId
  );
}

function hasLegacyAuthorizationLineage(row: {
  authorization_source: string | null;
  authorization_public_id: string | null;
  authorization_organization_public_id: string | null;
  quota_owner_type: string | null;
  quota_owner_public_id: string | null;
}): boolean {
  return (
    row.authorization_source === null &&
    row.authorization_public_id === null &&
    row.authorization_organization_public_id === null &&
    row.quota_owner_type === null &&
    row.quota_owner_public_id === null
  );
}

function isCompatiblePracticeClaim(
  row: typeof practice.$inferSelect,
  input: Parameters<PracticeRepository["createPractice"]>[0],
): boolean {
  return (
    row.paper_public_id === input.paperPublicId &&
    row.profession === input.profession &&
    row.level === input.level &&
    row.subject === input.subject &&
    hasCompatibleAuthorizationLineage(row, input.authorizationLineage) &&
    (row.public_id === input.replaceActivePublicId ||
      JSON.stringify(canonicalizeJson(row.paper_snapshot)) ===
        JSON.stringify(canonicalizeJson(input.paperSnapshot)))
  );
}

function isCompatibleMockExamClaim(
  row: typeof mockExam.$inferSelect,
  input: Parameters<MockExamRepository["createMockExam"]>[0],
): boolean {
  return (
    row.paper_public_id === input.paperPublicId &&
    row.profession === input.profession &&
    row.level === input.level &&
    row.subject === input.subject &&
    row.duration_minute === input.durationMinute &&
    hasCompatibleAuthorizationLineage(row, input.authorizationLineage) &&
    (row.public_id === input.replaceActivePublicId ||
      JSON.stringify(canonicalizeJson(row.paper_snapshot)) ===
        JSON.stringify(canonicalizeJson(input.paperSnapshot)))
  );
}

async function validateAndLockAuthorizationLineageForStart(
  database: StudentFlowRuntimeDatabase,
  userPublicId: string,
  profession: PracticeRow["profession"],
  level: number,
  startedAt: Date,
  lineage: AnswerSessionAuthorizationLineage,
): Promise<void> {
  await lockOrganizationScopeMutation(database);

  if (lineage.authorizationSource === "personal_auth") {
    const rows = await database
      .select({
        authorization_public_id: personalAuth.public_id,
        user_public_id: user.public_id,
      })
      .from(personalAuth)
      .innerJoin(user, eq(user.id, personalAuth.user_id))
      .where(
        and(
          eq(personalAuth.public_id, lineage.authorizationPublicId),
          eq(user.public_id, userPublicId),
          eq(user.status, "active"),
          eq(personalAuth.status, "active"),
          eq(personalAuth.profession, profession),
          eq(personalAuth.level, level),
          lte(personalAuth.starts_at, startedAt),
          gt(personalAuth.expires_at, startedAt),
        ),
      )
      .limit(2)
      .for("update");

    if (
      rows.length !== 1 ||
      lineage.organizationPublicId !== null ||
      lineage.quotaOwnerType !== "personal" ||
      lineage.quotaOwnerPublicId !== rows[0]?.user_public_id
    ) {
      throw new AuthorizationStartConflictError();
    }
    return;
  }

  const rows = await database
    .select({
      authorization_public_id: orgAuth.public_id,
      organization_public_id: organization.public_id,
    })
    .from(employee)
    .innerJoin(user, eq(user.id, employee.user_id))
    .innerJoin(organization, eq(organization.id, employee.organization_id))
    .innerJoin(employeeOrgAuth, eq(employeeOrgAuth.employee_id, employee.id))
    .innerJoin(orgAuth, eq(orgAuth.id, employeeOrgAuth.org_auth_id))
    .where(
      and(
        eq(orgAuth.public_id, lineage.authorizationPublicId),
        eq(user.public_id, userPublicId),
        eq(user.user_type, "employee"),
        eq(user.status, "active"),
        eq(organization.status, "active"),
        eq(orgAuth.status, "active"),
        eq(orgAuth.profession, profession),
        eq(orgAuth.level, level),
        createOrgAuthCoversOrganizationCondition({
          authScopeType: orgAuth.auth_scope_type,
          orgAuthId: orgAuth.id,
          organizationId: organization.id,
          purchaserOrganizationId: orgAuth.purchaser_organization_id,
        }),
        lte(orgAuth.starts_at, startedAt),
        gt(orgAuth.expires_at, startedAt),
      ),
    )
    .limit(2)
    .for("update");

  if (
    rows.length !== 1 ||
    lineage.organizationPublicId !== rows[0]?.organization_public_id ||
    lineage.quotaOwnerType !== "organization" ||
    lineage.quotaOwnerPublicId !== rows[0]?.organization_public_id
  ) {
    throw new AuthorizationStartConflictError();
  }
}

async function listEffectiveAuthorizationScopes(
  database: StudentFlowRuntimeDatabase,
  userPublicId: string,
  now: Date,
): Promise<PracticeAuthorizationScopeRow[]> {
  const personalAuthRows = await database
    .select({
      authorization_public_id: personalAuth.public_id,
      user_public_id: user.public_id,
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
      authorization_public_id: orgAuth.public_id,
      organization_public_id: organization.public_id,
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
      authorization_source: "personal_auth" as const,
      authorization_public_id: row.authorization_public_id,
      organization_public_id: null,
      quota_owner_type: "personal" as const,
      quota_owner_public_id: row.user_public_id,
    })),
    ...orgAuthRows.map((row) => ({
      profession: row.profession,
      level: row.level,
      authorization_types: ["org_auth"] satisfies AuthorizationType[],
      expires_at: row.expires_at,
      authorization_source: "org_auth" as const,
      authorization_public_id: row.authorization_public_id,
      organization_public_id: row.organization_public_id,
      quota_owner_type: "organization" as const,
      quota_owner_public_id: row.organization_public_id,
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
  expectedPaperId?: number,
): Promise<number> {
  const [row] = await database
    .select({ id: paperQuestion.id })
    .from(paperQuestion)
    .where(
      expectedPaperId === undefined
        ? eq(paperQuestion.public_id, publicId)
        : and(
            eq(paperQuestion.public_id, publicId),
            eq(paperQuestion.paper_id, expectedPaperId),
          ),
    )
    .limit(1);

  if (row === undefined) {
    throw new Error("Paper question does not exist.");
  }

  return row.id;
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

function mapExamReportMockExamRow(
  row: typeof mockExam.$inferSelect,
): ExamReportMockExamRow {
  return {
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

  const mockExamRows = await database
    .select({ id: mockExam.id })
    .from(mockExam)
    .where(
      and(
        eq(mockExam.public_id, mockExamPublicId),
        eq(mockExam.user_id, userId),
      ),
    );

  if (mockExamRows.length === 0) {
    return [];
  }

  if (mockExamRows.length !== 1) {
    throw new Error("Mock exam report projection cardinality is invalid.");
  }

  const mockExamRow = mockExamRows[0]!;

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
  >();

  for (const row of scoringEvidenceRows) {
    if (scoringEvidenceByAnswerRecordId.has(row.answer_record_id)) {
      throw new Error("AI scoring evidence cardinality is invalid.");
    }

    scoringEvidenceByAnswerRecordId.set(row.answer_record_id, {
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
    });
  }

  const mappedRows = rows.map((row) =>
    mapMockExamAnswerRecordRow(
      row,
      scoringEvidenceByAnswerRecordId.get(row.id) ?? null,
    ),
  ) as MockExamAnswerRecordRow[] & ExamReportAnswerRecordRow[];

  for (const row of mappedRows) {
    if (row.is_correct === null && row.ai_scoring_evidence === null) {
      throw new Error("Subjective answer is missing durable scoring evidence.");
    }

    if (row.is_correct !== null && row.ai_scoring_evidence !== null) {
      throw new Error("Objective answer cannot own AI scoring evidence.");
    }
  }

  return mappedRows;
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
    authorization_source: asAuthorizationSource(row.authorization_source),
    authorization_public_id: row.authorization_public_id,
    authorization_organization_public_id:
      row.authorization_organization_public_id,
    quota_owner_type: asQuotaOwnerType(row.quota_owner_type),
    quota_owner_public_id: row.quota_owner_public_id,
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
    practice_attempt_number: row.practice_attempt_number,
    practice_max_attempt_count: row.practice_max_attempt_count,
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
    authorization_source: asAuthorizationSource(row.authorization_source),
    authorization_public_id: row.authorization_public_id,
    authorization_organization_public_id:
      row.authorization_organization_public_id,
    quota_owner_type: asQuotaOwnerType(row.quota_owner_type),
    quota_owner_public_id: row.quota_owner_public_id,
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
    report_revision: null,
    report_snapshot: {},
    learning_suggestion_snapshot: null,
    learning_suggestion_status: null,
    learning_suggestion_attempt_count: null,
    learning_suggestion_input_digest: null,
    learning_suggestion_claimed_at: null,
    learning_suggestion_completed_at: null,
    learning_suggestion_failure_category: null,
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
  const learningSuggestionFailureCategory =
    row.learning_suggestion_failure_category;
  if (
    learningSuggestionFailureCategory !== null &&
    ![
      "configuration_unavailable",
      "input_unavailable",
      "provider_failed",
      "timeout",
    ].includes(learningSuggestionFailureCategory)
  ) {
    throw new Error(
      "Exam report learning suggestion failure category is invalid.",
    );
  }
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
    report_revision: row.report_revision,
    report_snapshot: asRecord(row.report_snapshot),
    learning_suggestion_snapshot:
      row.learning_suggestion_snapshot === null
        ? null
        : asRecord(row.learning_suggestion_snapshot),
    learning_suggestion_status: row.learning_suggestion_status,
    learning_suggestion_attempt_count: row.learning_suggestion_attempt_count,
    learning_suggestion_input_digest: row.learning_suggestion_input_digest,
    learning_suggestion_claimed_at: row.learning_suggestion_claimed_at,
    learning_suggestion_completed_at: row.learning_suggestion_completed_at,
    learning_suggestion_failure_category:
      learningSuggestionFailureCategory as ExamReportRow["learning_suggestion_failure_category"],
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

function asAuthorizationSource(value: string | null): AuthorizationType | null {
  if (value === null) {
    return null;
  }
  if (value === "personal_auth" || value === "org_auth") {
    return value;
  }
  throw new Error("Stored authorization source is invalid.");
}

function asQuotaOwnerType(
  value: string | null,
): "personal" | "organization" | null {
  if (value === null) {
    return null;
  }
  if (value === "personal" || value === "organization") {
    return value;
  }
  throw new Error("Stored quota owner type is invalid.");
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

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

const {
  answerRecord,
  examReport,
  mistakeBook,
  mockExam,
  employee,
  employeeOrgAuth,
  organization,
  orgAuth,
  paper,
  paperQuestion,
  paperSection,
  personalAuth,
  practice,
  user,
} = databaseSchema;

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
      const paperId = await getRequiredPaperId(database, input.paperPublicId);
      const [row] = await database
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
      const paperId = await getRequiredPaperId(database, input.paperPublicId);
      const [row] = await database
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

      return mapMockExamRow(row, 0);
    },
    async saveMockExamAnswerRecord(input) {
      const database = getDatabase();
      const userId = await getRequiredUserId(database, input.userPublicId);
      const mockExamLink = await getRequiredMockExamLink(
        database,
        input.mockExamPublicId,
      );
      const paperQuestionId = await getRequiredPaperQuestionId(
        database,
        input.paperQuestionPublicId,
      );
      const [existingRow] = await database
        .select({ public_id: answerRecord.public_id })
        .from(answerRecord)
        .where(
          and(
            eq(answerRecord.user_id, userId),
            eq(answerRecord.mock_exam_id, mockExamLink.id),
            eq(
              answerRecord.paper_question_public_id,
              input.paperQuestionPublicId,
            ),
          ),
        )
        .limit(1);

      if (existingRow !== undefined) {
        const [row] = await database
          .update(answerRecord)
          .set({
            answer_snapshot: input.answerSnapshot,
            answer_record_status: input.answerRecordStatus,
            answered_at: input.answeredAt,
            updated_at: input.answeredAt,
          })
          .where(eq(answerRecord.public_id, existingRow.public_id))
          .returning();

        if (row !== undefined) {
          return mapMockExamAnswerRecordRow(row);
        }
      }

      const [row] = await database
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
          answer_record_status: input.answerRecordStatus,
          is_correct: input.isCorrect,
          score: input.score,
          max_score: input.maxScore,
          answered_at: input.answeredAt,
          submitted_at: null,
        })
        .returning();

      if (row === undefined) {
        throw new Error("Mock exam answer insert did not return a row.");
      }

      return mapMockExamAnswerRecordRow(row);
    },
    async listMockExamAnswerRecords(query) {
      return listMockExamAnswerRecords(
        getDatabase(),
        query.userPublicId,
        query.mockExamPublicId,
      );
    },
    async submitMockExam(input) {
      const database = getDatabase();
      const [row] = await database
        .update(mockExam)
        .set({
          exam_status: input.examStatus,
          submitted_at: input.submittedAt,
          objective_score: input.objectiveScore,
          subjective_score: input.subjectiveScore,
          total_score: input.totalScore,
          updated_at: input.submittedAt,
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
      }

      return row === undefined
        ? null
        : mapMockExamRow(row, await countMockExamAnswers(database, row.id));
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
    async terminateMockExam(input) {
      const [row] = await getDatabase()
        .update(mockExam)
        .set({
          exam_status: "terminated",
          terminated_at: input.terminatedAt,
          termination_reason: input.terminationReason,
          updated_at: input.terminatedAt,
        })
        .where(eq(mockExam.public_id, input.publicId))
        .returning();

      return row === undefined
        ? null
        : mapMockExamRow(
            row,
            await countMockExamAnswers(getDatabase(), row.id),
          );
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
      const userId = await findUserIdByPublicId(database, query.userPublicId);

      if (userId === null) {
        return { rows: [], total: 0 };
      }

      const conditions: SQL[] = [eq(mockExam.user_id, userId)];

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

      const rows = await database
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
        )
        .limit(query.pageSize)
        .offset((query.page - 1) * query.pageSize);
      const [totalRow] = await database
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
      const mockExamLink = await getRequiredMockExamLink(
        database,
        input.mockExamPublicId,
      );
      const paperId = await getRequiredPaperId(database, input.paperPublicId);
      const [row] = await database
        .insert(examReport)
        .values({
          public_id: input.publicId,
          user_id: userId,
          mock_exam_id: mockExamLink.id,
          paper_id: paperId,
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
        .returning();

      if (row === undefined) {
        throw new Error("Exam report insert did not return a row.");
      }

      return mapExamReportRow(
        row,
        input.mockExamPublicId,
        input.paperName,
        mockExamLink.started_at,
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
      publicId: paperRow.public_id,
      name: paperRow.name,
      profession: paperRow.profession,
      level: paperRow.level,
      subject: paperRow.subject,
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

  for (const questionRow of questionRows) {
    const rows = questionsBySectionId.get(questionRow.paper_section_id) ?? [];
    questionsBySectionId.set(questionRow.paper_section_id, [
      ...rows,
      questionRow,
    ]);
  }

  return {
    publicId: paperRow.public_id,
    name: paperRow.name,
    profession: paperRow.profession,
    level: paperRow.level,
    subject: paperRow.subject,
    durationMinute: paperRow.duration_minute,
    totalScore: paperRow.total_score,
    paperSections: sectionRows.map((sectionRow) => ({
      title: sectionRow.title,
      description: sectionRow.description,
      sortOrder: sectionRow.sort_order,
      totalScore: sectionRow.total_score,
      paperQuestions: (questionsBySectionId.get(sectionRow.id) ?? []).map(
        mapPaperQuestionSnapshot,
      ),
    })),
  };
}

function mapPaperQuestionSnapshot(
  row: typeof paperQuestion.$inferSelect,
): Record<string, unknown> {
  const snapshot = asRecord(row.question_snapshot);
  const standardAnswerLabels = Array.isArray(snapshot.standardAnswerLabels)
    ? snapshot.standardAnswerLabels
    : Array.isArray(snapshot.standardAnswer)
      ? snapshot.standardAnswer
      : [];

  return {
    ...snapshot,
    paperQuestionPublicId: row.public_id,
    questionPublicId:
      getStringField(snapshot, "questionPublicId") ?? row.public_id,
    questionType: getStringField(snapshot, "questionType"),
    score: row.score ?? "0.0",
    standardAnswerLabels: standardAnswerLabels.filter(
      (label): label is string => typeof label === "string",
    ),
    standardAnswerRichText:
      getStringField(snapshot, "standardAnswerRichText") ??
      standardAnswerLabels.join(","),
    analysisRichText:
      getStringField(snapshot, "analysisRichText") ??
      getStringField(snapshot, "analysis"),
    materialSnapshot: row.material_snapshot,
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

async function getRequiredPaperId(
  database: StudentFlowRuntimeDatabase,
  publicId: string,
): Promise<number> {
  const [row] = await database
    .select({ id: paper.id })
    .from(paper)
    .where(eq(paper.public_id, publicId))
    .limit(1);

  if (row === undefined) {
    throw new Error("Paper does not exist.");
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

async function getRequiredMockExamLink(
  database: StudentFlowRuntimeDatabase,
  publicId: string,
): Promise<{ id: number; paper_id: number; started_at: Date }> {
  const [row] = await database
    .select({
      id: mockExam.id,
      paper_id: mockExam.paper_id,
      started_at: mockExam.started_at,
    })
    .from(mockExam)
    .where(eq(mockExam.public_id, publicId))
    .limit(1);

  if (row === undefined) {
    throw new Error("Mock exam does not exist.");
  }

  return row;
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

  return rows.map((row) =>
    mapMockExamAnswerRecordRow(row),
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
): MockExamAnswerRecordRow & ExamReportAnswerRecordRow {
  return {
    public_id: row.public_id,
    exam_mode: "mock_exam",
    paper_question_public_id: row.paper_question_public_id,
    question_public_id: row.question_public_id,
    question_snapshot: asRecord(row.question_snapshot),
    answer_snapshot: asMockExamAnswerSnapshot(row.answer_snapshot),
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

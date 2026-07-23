import { relations, sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { professionEnum, user } from "./auth";
import { paper, paperQuestion, subjectEnum } from "./paper";

const idColumn = () =>
  bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey();

const timestampColumn = (name: string) =>
  timestamp(name, { withTimezone: true }).notNull();

const nullableTimestampColumn = (name: string) =>
  timestamp(name, { withTimezone: true });

const createdAtColumn = () => timestampColumn("created_at").defaultNow();

const updatedAtColumn = () => timestampColumn("updated_at").defaultNow();

const userIdColumn = (name: string) =>
  bigint(name, { mode: "number" })
    .notNull()
    .references(() => user.id, { onDelete: "restrict" });

const paperIdColumn = (name: string) =>
  bigint(name, { mode: "number" })
    .notNull()
    .references(() => paper.id, { onDelete: "restrict" });

const paperQuestionIdColumn = (name: string) =>
  bigint(name, { mode: "number" })
    .notNull()
    .references(() => paperQuestion.id, { onDelete: "restrict" });

const scoreColumn = (name: string) => numeric(name, { precision: 8, scale: 1 });

export const examModeValues = ["practice", "mock_exam"] as const;
export const examStatusValues = [
  "in_progress",
  "scoring",
  "scoring_partial_failed",
  "completed",
  "terminated",
] as const;
export const practiceStatusValues = [
  "in_progress",
  "completed",
  "expired",
  "terminated",
] as const;
export const answerRecordStatusValues = [
  "draft",
  "saved",
  "submitted",
  "scored",
  "scoring_failed",
] as const;
export const mistakeBookSourceValues = ["wrong_answer", "favorite"] as const;
export const mistakeBookStatusValues = [
  "unmastered",
  "mastered",
  "removed",
] as const;
export const mockExamDeadlineTaskStatusValues = [
  "pending",
  "running",
  "completed",
  "failed",
  "cancelled",
] as const;

export const examModeEnum = pgEnum("exam_mode", examModeValues);
export const examStatusEnum = pgEnum("exam_status", examStatusValues);
export const practiceStatusEnum = pgEnum(
  "practice_status",
  practiceStatusValues,
);
export const answerRecordStatusEnum = pgEnum(
  "answer_record_status",
  answerRecordStatusValues,
);
export const mistakeBookSourceEnum = pgEnum(
  "mistake_book_source",
  mistakeBookSourceValues,
);
export const mistakeBookStatusEnum = pgEnum(
  "mistake_book_status",
  mistakeBookStatusValues,
);
export const mockExamDeadlineTaskStatusEnum = pgEnum(
  "mock_exam_deadline_task_status",
  mockExamDeadlineTaskStatusValues,
);

export const practice = pgTable(
  "practice",
  {
    id: idColumn(),
    public_id: text("public_id").notNull(),
    user_id: userIdColumn("user_id"),
    paper_id: paperIdColumn("paper_id"),
    paper_public_id: text("paper_public_id").notNull(),
    paper_snapshot: jsonb("paper_snapshot").notNull(),
    profession: professionEnum("profession").notNull(),
    level: integer("level").notNull(),
    subject: subjectEnum("subject").notNull(),
    practice_status: practiceStatusEnum("practice_status")
      .default("in_progress")
      .notNull(),
    started_at: timestampColumn("started_at"),
    last_answered_at: nullableTimestampColumn("last_answered_at"),
    expires_at: timestampColumn("expires_at"),
    terminated_at: nullableTimestampColumn("terminated_at"),
    termination_reason: text("termination_reason"),
    authorization_source: text("authorization_source"),
    authorization_public_id: text("authorization_public_id"),
    authorization_organization_public_id: text(
      "authorization_organization_public_id",
    ),
    quota_owner_type: text("quota_owner_type"),
    quota_owner_public_id: text("quota_owner_public_id"),
    created_at: createdAtColumn(),
    updated_at: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex("udx_practice_public_id").on(table.public_id),
    uniqueIndex("udx_practice_user_id_paper_id_active")
      .on(table.user_id, table.paper_id)
      .where(sql`${table.practice_status} = 'in_progress'`),
    index("idx_practice_user_id").on(table.user_id),
    index("idx_practice_paper_id").on(table.paper_id),
    index("idx_practice_user_id_paper_id_practice_status").on(
      table.user_id,
      table.paper_id,
      table.practice_status,
    ),
    index("idx_practice_expires_at").on(table.expires_at),
    index("idx_practice_authorization_source_public_id").on(
      table.authorization_source,
      table.authorization_public_id,
    ),
    index("idx_practice_authorization_organization_public_id").on(
      table.authorization_organization_public_id,
    ),
    check(
      "chk_practice_authorization_lineage_completeness",
      sql`(${table.authorization_source} is null and ${table.authorization_public_id} is null and ${table.authorization_organization_public_id} is null and ${table.quota_owner_type} is null and ${table.quota_owner_public_id} is null) or (${table.authorization_source} is not null and ${table.authorization_public_id} is not null and ${table.quota_owner_type} is not null and ${table.quota_owner_public_id} is not null)`,
    ),
    check(
      "chk_practice_authorization_lineage_source",
      sql`${table.authorization_source} is null or (${table.authorization_source} = 'personal_auth' and ${table.authorization_organization_public_id} is null and ${table.quota_owner_type} = 'personal') or (${table.authorization_source} = 'org_auth' and ${table.authorization_organization_public_id} is not null and ${table.quota_owner_type} = 'organization')`,
    ),
  ],
);

export const mockExam = pgTable(
  "mock_exam",
  {
    id: idColumn(),
    public_id: text("public_id").notNull(),
    user_id: userIdColumn("user_id"),
    paper_id: paperIdColumn("paper_id"),
    paper_public_id: text("paper_public_id").notNull(),
    paper_snapshot: jsonb("paper_snapshot").notNull(),
    profession: professionEnum("profession").notNull(),
    level: integer("level").notNull(),
    subject: subjectEnum("subject").notNull(),
    exam_status: examStatusEnum("exam_status").default("in_progress").notNull(),
    started_at: timestampColumn("started_at"),
    submitted_at: nullableTimestampColumn("submitted_at"),
    server_deadline_at: nullableTimestampColumn("server_deadline_at"),
    duration_minute: integer("duration_minute"),
    terminated_at: nullableTimestampColumn("terminated_at"),
    termination_reason: text("termination_reason"),
    objective_score: scoreColumn("objective_score"),
    subjective_score: scoreColumn("subjective_score"),
    total_score: scoreColumn("total_score"),
    authorization_source: text("authorization_source"),
    authorization_public_id: text("authorization_public_id"),
    authorization_organization_public_id: text(
      "authorization_organization_public_id",
    ),
    quota_owner_type: text("quota_owner_type"),
    quota_owner_public_id: text("quota_owner_public_id"),
    created_at: createdAtColumn(),
    updated_at: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex("udx_mock_exam_public_id").on(table.public_id),
    uniqueIndex("udx_mock_exam_user_id_paper_id_active")
      .on(table.user_id, table.paper_id)
      .where(sql`${table.exam_status} = 'in_progress'`),
    index("idx_mock_exam_user_id").on(table.user_id),
    index("idx_mock_exam_paper_id").on(table.paper_id),
    index("idx_mock_exam_exam_status").on(table.exam_status),
    index("idx_mock_exam_started_at").on(table.started_at),
    index("idx_mock_exam_server_deadline_at").on(table.server_deadline_at),
    index("idx_mock_exam_authorization_source_public_id").on(
      table.authorization_source,
      table.authorization_public_id,
    ),
    index("idx_mock_exam_authorization_organization_public_id").on(
      table.authorization_organization_public_id,
    ),
    check(
      "chk_mock_exam_authorization_lineage_completeness",
      sql`(${table.authorization_source} is null and ${table.authorization_public_id} is null and ${table.authorization_organization_public_id} is null and ${table.quota_owner_type} is null and ${table.quota_owner_public_id} is null) or (${table.authorization_source} is not null and ${table.authorization_public_id} is not null and ${table.quota_owner_type} is not null and ${table.quota_owner_public_id} is not null)`,
    ),
    check(
      "chk_mock_exam_authorization_lineage_source",
      sql`${table.authorization_source} is null or (${table.authorization_source} = 'personal_auth' and ${table.authorization_organization_public_id} is null and ${table.quota_owner_type} = 'personal') or (${table.authorization_source} = 'org_auth' and ${table.authorization_organization_public_id} is not null and ${table.quota_owner_type} = 'organization')`,
    ),
  ],
);

export const mockExamDeadlineTask = pgTable(
  "mock_exam_deadline_task",
  {
    id: idColumn(),
    public_id: text("public_id").notNull(),
    mock_exam_id: bigint("mock_exam_id", { mode: "number" })
      .notNull()
      .references(() => mockExam.id, { onDelete: "restrict" }),
    task_status: mockExamDeadlineTaskStatusEnum("task_status")
      .default("pending")
      .notNull(),
    scheduled_at: timestampColumn("scheduled_at"),
    attempt_count: integer("attempt_count").default(0).notNull(),
    max_attempt_count: integer("max_attempt_count").default(5).notNull(),
    claimed_at: nullableTimestampColumn("claimed_at"),
    lease_expires_at: nullableTimestampColumn("lease_expires_at"),
    worker_public_id: text("worker_public_id"),
    failure_message_digest: text("failure_message_digest"),
    completed_at: nullableTimestampColumn("completed_at"),
    created_at: createdAtColumn(),
    updated_at: updatedAtColumn(),
  },
  (table) => [
    check(
      "chk_mock_exam_deadline_task_attempt_count",
      sql`${table.attempt_count} >= 0 and ${table.attempt_count} <= ${table.max_attempt_count}`,
    ),
    check(
      "chk_mock_exam_deadline_task_max_attempt_count",
      sql`${table.max_attempt_count} > 0`,
    ),
    uniqueIndex("udx_mock_exam_deadline_task_public_id").on(table.public_id),
    uniqueIndex("udx_mock_exam_deadline_task_mock_exam_id").on(
      table.mock_exam_id,
    ),
    index("idx_mock_exam_deadline_task_task_status_scheduled_at").on(
      table.task_status,
      table.scheduled_at,
    ),
    index("idx_mock_exam_deadline_task_lease_expires_at").on(
      table.lease_expires_at,
    ),
  ],
);

export const answerRecord = pgTable(
  "answer_record",
  {
    id: idColumn(),
    public_id: text("public_id").notNull(),
    user_id: userIdColumn("user_id"),
    exam_mode: examModeEnum("exam_mode").notNull(),
    practice_id: bigint("practice_id", { mode: "number" }).references(
      () => practice.id,
      { onDelete: "cascade" },
    ),
    mock_exam_id: bigint("mock_exam_id", { mode: "number" }).references(
      () => mockExam.id,
      { onDelete: "cascade" },
    ),
    paper_id: paperIdColumn("paper_id"),
    paper_question_id: paperQuestionIdColumn("paper_question_id"),
    paper_question_public_id: text("paper_question_public_id").notNull(),
    question_public_id: text("question_public_id").notNull(),
    question_snapshot: jsonb("question_snapshot").notNull(),
    answer_snapshot: jsonb("answer_snapshot").notNull(),
    answer_revision: integer("answer_revision").default(1).notNull(),
    client_operation_id: text("client_operation_id"),
    client_saved_at: nullableTimestampColumn("client_saved_at"),
    answer_record_status: answerRecordStatusEnum("answer_record_status")
      .default("draft")
      .notNull(),
    is_correct: boolean("is_correct"),
    score: scoreColumn("score"),
    max_score: scoreColumn("max_score").notNull(),
    answered_at: nullableTimestampColumn("answered_at"),
    submitted_at: nullableTimestampColumn("submitted_at"),
    created_at: createdAtColumn(),
    updated_at: updatedAtColumn(),
  },
  (table) => [
    check(
      "chk_answer_record_answer_revision",
      sql`${table.answer_revision} > 0`,
    ),
    uniqueIndex("udx_answer_record_public_id").on(table.public_id),
    uniqueIndex("udx_answer_record_mock_exam_id_client_operation_id")
      .on(table.mock_exam_id, table.client_operation_id)
      .where(sql`${table.client_operation_id} is not null`),
    uniqueIndex("udx_answer_record_mock_exam_id_paper_question_public_id")
      .on(table.mock_exam_id, table.paper_question_public_id)
      .where(sql`${table.mock_exam_id} is not null`),
    index("idx_answer_record_user_id").on(table.user_id),
    index("idx_answer_record_practice_id").on(table.practice_id),
    index("idx_answer_record_mock_exam_id").on(table.mock_exam_id),
    index("idx_answer_record_paper_question_id").on(table.paper_question_id),
    index("idx_answer_record_exam_mode").on(table.exam_mode),
  ],
);

export const examReport = pgTable(
  "exam_report",
  {
    id: idColumn(),
    public_id: text("public_id").notNull(),
    user_id: userIdColumn("user_id"),
    mock_exam_id: bigint("mock_exam_id", { mode: "number" })
      .notNull()
      .references(() => mockExam.id, { onDelete: "restrict" }),
    paper_id: paperIdColumn("paper_id"),
    paper_public_id: text("paper_public_id").notNull(),
    report_snapshot: jsonb("report_snapshot").notNull(),
    report_revision: integer("report_revision").default(1).notNull(),
    exam_status: examStatusEnum("exam_status").notNull(),
    profession: professionEnum("profession").notNull(),
    level: integer("level").notNull(),
    subject: subjectEnum("subject").notNull(),
    objective_score: scoreColumn("objective_score"),
    subjective_score: scoreColumn("subjective_score"),
    total_score: scoreColumn("total_score"),
    duration_second: integer("duration_second").notNull(),
    learning_suggestion_snapshot: jsonb("learning_suggestion_snapshot"),
    generated_at: timestampColumn("generated_at"),
    created_at: createdAtColumn(),
    updated_at: updatedAtColumn(),
  },
  (table) => [
    check("chk_exam_report_report_revision", sql`${table.report_revision} > 0`),
    uniqueIndex("udx_exam_report_public_id").on(table.public_id),
    uniqueIndex("udx_exam_report_mock_exam_id").on(table.mock_exam_id),
    index("idx_exam_report_user_id").on(table.user_id),
    index("idx_exam_report_paper_id").on(table.paper_id),
    index("idx_exam_report_generated_at").on(table.generated_at),
    index("idx_exam_report_exam_status").on(table.exam_status),
  ],
);

export const mistakeBook = pgTable(
  "mistake_book",
  {
    id: idColumn(),
    public_id: text("public_id").notNull(),
    user_id: userIdColumn("user_id"),
    question_public_id: text("question_public_id").notNull(),
    paper_question_public_id: text("paper_question_public_id").notNull(),
    profession: professionEnum("profession").notNull(),
    level: integer("level").notNull(),
    subject: subjectEnum("subject").notNull(),
    question_snapshot: jsonb("question_snapshot").notNull(),
    latest_answer_snapshot: jsonb("latest_answer_snapshot").notNull(),
    mistake_book_source: mistakeBookSourceEnum("mistake_book_source")
      .default("wrong_answer")
      .notNull(),
    mistake_book_status: mistakeBookStatusEnum("mistake_book_status")
      .default("unmastered")
      .notNull(),
    wrong_count: integer("wrong_count").default(1).notNull(),
    is_favorite: boolean("is_favorite").default(false).notNull(),
    is_removed: boolean("is_removed").default(false).notNull(),
    mastered_at: nullableTimestampColumn("mastered_at"),
    latest_wrong_at: nullableTimestampColumn("latest_wrong_at"),
    created_at: createdAtColumn(),
    updated_at: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex("udx_mistake_book_public_id").on(table.public_id),
    index("idx_mistake_book_user_id").on(table.user_id),
    index("idx_mistake_book_question_public_id").on(table.question_public_id),
    index("idx_mistake_book_profession_level_subject").on(
      table.profession,
      table.level,
      table.subject,
    ),
    index("idx_mistake_book_latest_wrong_at").on(table.latest_wrong_at),
    index("idx_mistake_book_mistake_book_status").on(table.mistake_book_status),
  ],
);

export const practiceRelations = relations(practice, ({ many, one }) => ({
  answerRecords: many(answerRecord),
  paper: one(paper, {
    fields: [practice.paper_id],
    references: [paper.id],
  }),
  user: one(user, {
    fields: [practice.user_id],
    references: [user.id],
  }),
}));

export const mockExamRelations = relations(mockExam, ({ many, one }) => ({
  answerRecords: many(answerRecord),
  deadlineTask: one(mockExamDeadlineTask),
  examReport: one(examReport),
  paper: one(paper, {
    fields: [mockExam.paper_id],
    references: [paper.id],
  }),
  user: one(user, {
    fields: [mockExam.user_id],
    references: [user.id],
  }),
}));

export const mockExamDeadlineTaskRelations = relations(
  mockExamDeadlineTask,
  ({ one }) => ({
    mockExam: one(mockExam, {
      fields: [mockExamDeadlineTask.mock_exam_id],
      references: [mockExam.id],
    }),
  }),
);

export const answerRecordRelations = relations(answerRecord, ({ one }) => ({
  mockExam: one(mockExam, {
    fields: [answerRecord.mock_exam_id],
    references: [mockExam.id],
  }),
  paper: one(paper, {
    fields: [answerRecord.paper_id],
    references: [paper.id],
  }),
  paperQuestion: one(paperQuestion, {
    fields: [answerRecord.paper_question_id],
    references: [paperQuestion.id],
  }),
  practice: one(practice, {
    fields: [answerRecord.practice_id],
    references: [practice.id],
  }),
  user: one(user, {
    fields: [answerRecord.user_id],
    references: [user.id],
  }),
}));

export const examReportRelations = relations(examReport, ({ one }) => ({
  mockExam: one(mockExam, {
    fields: [examReport.mock_exam_id],
    references: [mockExam.id],
  }),
  paper: one(paper, {
    fields: [examReport.paper_id],
    references: [paper.id],
  }),
  user: one(user, {
    fields: [examReport.user_id],
    references: [user.id],
  }),
}));

export const mistakeBookRelations = relations(mistakeBook, ({ one }) => ({
  user: one(user, {
    fields: [mistakeBook.user_id],
    references: [user.id],
  }),
}));

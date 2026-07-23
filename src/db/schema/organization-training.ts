import {
  bigint,
  check,
  foreignKey,
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
import { sql } from "drizzle-orm";

import {
  aiCallLog,
  aiScoringTaskStatusEnum,
  evidenceStatusEnum,
} from "./ai-rag";
import { employee, orgAuth, organization, professionEnum } from "./auth";
import { subjectEnum } from "./paper";

const idColumn = () =>
  bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey();

const timestampColumn = (name: string) =>
  timestamp(name, { withTimezone: true }).notNull();

const nullableTimestampColumn = (name: string) =>
  timestamp(name, { withTimezone: true });

const createdAtColumn = () => timestampColumn("created_at").defaultNow();

const updatedAtColumn = () => timestampColumn("updated_at").defaultNow();

const scoreColumn = (name: string) => numeric(name, { precision: 8, scale: 1 });

export const organizationTrainingVersionStatusValues = [
  "published",
  "taken_down",
] as const;

export const organizationTrainingVersionStatusEnum = pgEnum(
  "organization_training_version_status",
  organizationTrainingVersionStatusValues,
);

export const organizationTrainingDraftStatusValues = [
  "draft",
  "consumed",
  "discarded",
] as const;

export const organizationTrainingDraftStatusEnum = pgEnum(
  "organization_training_draft_status",
  organizationTrainingDraftStatusValues,
);

export const organizationTrainingAnswerStatusValues = [
  "in_progress",
  "scoring",
  "submitted",
  "scoring_failed",
  "read_only",
] as const;

export const organizationTrainingAnswerStatusEnum = pgEnum(
  "organization_training_answer_status",
  organizationTrainingAnswerStatusValues,
);

export const organizationTrainingValidationStatusValues = [
  "valid",
  "invalid",
  "needs_review",
] as const;

export const organizationTrainingValidationStatusEnum = pgEnum(
  "organization_training_validation_status",
  organizationTrainingValidationStatusValues,
);

export const organizationTrainingRetentionStatusValues = [
  "active",
  "expired_hidden",
] as const;

export const organizationTrainingRetentionStatusEnum = pgEnum(
  "organization_training_retention_status",
  organizationTrainingRetentionStatusValues,
);

export const organizationTrainingSourceContextTypeValues = [
  "paper",
  "mock_exam",
  "organization_ai_result",
] as const;

export const organizationTrainingSourceContextTypeEnum = pgEnum(
  "organization_training_source_context_type",
  organizationTrainingSourceContextTypeValues,
);

export const organizationTrainingSourceContextRedactionStatusValues = [
  "metadata_only",
] as const;

export const organizationTrainingSourceContextRedactionStatusEnum = pgEnum(
  "organization_training_source_context_redaction_status",
  organizationTrainingSourceContextRedactionStatusValues,
);

export type OrganizationTrainingPublishScopeSnapshotValue = {
  organizationPublicIds: string[];
  capturedAt: string;
};

export type OrganizationTrainingQuestionTypeSummaryValue = {
  singleChoice: number;
  multiChoice: number;
  trueFalse: number;
  shortAnswer: number;
};

export type OrganizationTrainingAnswerOrganizationSnapshotValue = {
  organizationPublicId: string;
  organizationName: string;
  capturedAt: string;
};

export type OrganizationTrainingQuestionOptionSnapshotValue = {
  publicId: string;
  label: string;
  content: string;
};

export type OrganizationTrainingQuestionSnapshotValue = {
  publicId: string;
  sequenceNumber: number;
  questionType:
    | "single_choice"
    | "multi_choice"
    | "true_false"
    | "short_answer";
  paperSectionKey?: string;
  paperSectionTitle?: string;
  paperSectionSortOrder?: number;
  questionSortOrder?: number;
  materialTitle: string | null;
  materialContent: string | null;
  stem: string;
  options: OrganizationTrainingQuestionOptionSnapshotValue[];
  score: number;
  standardAnswer: string;
  analysisSummary: string;
  evidenceStatus: "sufficient" | "weak" | "none";
  citationCount: number;
};

export type OrganizationTrainingAnswerItemSnapshotValue = {
  questionPublicId: string;
  selectedOptionPublicIds: string[];
  textAnswer: string | null;
};

export type OrganizationTrainingScoringPointResultSnapshotValue = {
  label: string;
  score: number;
  maxScore: number;
  reason: string;
};

export type OrganizationTrainingQuestionResultSnapshotValue = {
  questionPublicId: string;
  score: number;
  maxScore: number;
  standardAnswer: string | null;
  analysis: string | null;
  scoringPointResults: OrganizationTrainingScoringPointResultSnapshotValue[];
};

export type OrganizationTrainingScoringTaskSnapshotValue = Record<
  string,
  unknown
>;

export type OrganizationTrainingSourceContextFormalUsagePolicyValue = {
  createFormalPaper: false;
  createMockExam: false;
  exposeQuestionBody: false;
  exposeStandardAnswer: false;
  exposeAnalysis: false;
  exposeProviderPayload: false;
};

export const organizationTrainingDraft = pgTable(
  "organization_training_draft",
  {
    id: idColumn(),
    public_id: text("public_id").notNull(),
    draft_status: organizationTrainingDraftStatusEnum("draft_status")
      .default("draft")
      .notNull(),
    revision: integer("revision").default(1).notNull(),
    source_task_public_id: text("source_task_public_id"),
    source_version_public_id: text("source_version_public_id"),
    organization_id: bigint("organization_id", { mode: "number" }).notNull(),
    organization_public_id: text("organization_public_id").notNull(),
    org_auth_id: bigint("org_auth_id", { mode: "number" }).notNull(),
    authorization_source: text("authorization_source")
      .default("org_auth")
      .notNull(),
    authorization_public_id: text("authorization_public_id").notNull(),
    owner_type: text("owner_type").default("organization").notNull(),
    owner_public_id: text("owner_public_id").notNull(),
    quota_owner_type: text("quota_owner_type")
      .default("organization")
      .notNull(),
    quota_owner_public_id: text("quota_owner_public_id").notNull(),
    profession: professionEnum("profession").notNull(),
    level: integer("level").notNull(),
    subject: subjectEnum("subject").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    question_count: integer("question_count").notNull(),
    total_score: scoreColumn("total_score").notNull(),
    question_type_summary: jsonb("question_type_summary")
      .$type<OrganizationTrainingQuestionTypeSummaryValue>()
      .notNull(),
    question_snapshot: jsonb("question_snapshot")
      .$type<OrganizationTrainingQuestionSnapshotValue[]>()
      .default([])
      .notNull(),
    last_operation_id: text("last_operation_id"),
    last_payload_digest: text("last_payload_digest"),
    evidence_status: evidenceStatusEnum("evidence_status")
      .default("none")
      .notNull(),
    validation_status: organizationTrainingValidationStatusEnum(
      "validation_status",
    )
      .default("needs_review")
      .notNull(),
    retention_status: organizationTrainingRetentionStatusEnum(
      "retention_status",
    )
      .default("active")
      .notNull(),
    created_at: createdAtColumn(),
    updated_at: updatedAtColumn(),
    expires_at: nullableTimestampColumn("expires_at"),
    consumed_at: nullableTimestampColumn("consumed_at"),
    discarded_at: nullableTimestampColumn("discarded_at"),
  },
  (table) => [
    foreignKey({
      columns: [table.organization_id],
      foreignColumns: [organization.id],
      name: "fk_organization_training_draft_organization",
    }).onDelete("restrict"),
    foreignKey({
      columns: [table.org_auth_id],
      foreignColumns: [orgAuth.id],
      name: "fk_organization_training_draft_org_auth",
    }).onDelete("restrict"),
    uniqueIndex("udx_organization_training_draft_public_id").on(
      table.public_id,
    ),
    index("idx_organization_training_draft_organization_id").on(
      table.organization_id,
    ),
    index("idx_organization_training_draft_org_auth_id").on(table.org_auth_id),
    index("idx_organization_training_draft_scope").on(
      table.profession,
      table.level,
      table.subject,
    ),
    index("idx_organization_training_draft_retention").on(
      table.retention_status,
      table.expires_at,
    ),
    index("idx_organization_training_draft_status").on(table.draft_status),
    index("idx_organization_training_draft_source_task").on(
      table.source_task_public_id,
    ),
    index("idx_organization_training_draft_source_version").on(
      table.source_version_public_id,
    ),
  ],
);

export const organizationTrainingSourceContext = pgTable(
  "organization_training_source_context",
  {
    id: idColumn(),
    public_id: text("public_id").notNull(),
    organization_training_draft_id: bigint("organization_training_draft_id", {
      mode: "number",
    }).notNull(),
    organization_training_draft_public_id: text(
      "organization_training_draft_public_id",
    ).notNull(),
    organization_id: bigint("organization_id", { mode: "number" }).notNull(),
    organization_public_id: text("organization_public_id").notNull(),
    org_auth_id: bigint("org_auth_id", { mode: "number" }).notNull(),
    authorization_source: text("authorization_source")
      .default("org_auth")
      .notNull(),
    authorization_public_id: text("authorization_public_id").notNull(),
    source_type:
      organizationTrainingSourceContextTypeEnum("source_type").notNull(),
    source_public_id: text("source_public_id").notNull(),
    title: text("title").notNull(),
    profession: professionEnum("profession").notNull(),
    level: integer("level").notNull(),
    subject: subjectEnum("subject").notNull(),
    question_count: integer("question_count").notNull(),
    total_score: scoreColumn("total_score").notNull(),
    source_status: text("source_status").notNull(),
    redaction_status: organizationTrainingSourceContextRedactionStatusEnum(
      "redaction_status",
    )
      .default("metadata_only")
      .notNull(),
    formal_usage_policy: jsonb("formal_usage_policy")
      .$type<OrganizationTrainingSourceContextFormalUsagePolicyValue>()
      .notNull(),
    created_at: createdAtColumn(),
    updated_at: updatedAtColumn(),
  },
  (table) => [
    foreignKey({
      columns: [table.organization_training_draft_id],
      foreignColumns: [organizationTrainingDraft.id],
      name: "fk_organization_training_source_context_draft",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.organization_id],
      foreignColumns: [organization.id],
      name: "fk_organization_training_source_context_organization",
    }).onDelete("restrict"),
    foreignKey({
      columns: [table.org_auth_id],
      foreignColumns: [orgAuth.id],
      name: "fk_organization_training_source_context_org_auth",
    }).onDelete("restrict"),
    uniqueIndex("udx_organization_training_source_context_public_id").on(
      table.public_id,
    ),
    uniqueIndex("udx_organization_training_source_context_draft_source").on(
      table.organization_training_draft_id,
      table.source_type,
      table.source_public_id,
    ),
    index("idx_organization_training_source_context_draft_id").on(
      table.organization_training_draft_id,
    ),
    index("idx_organization_training_source_context_organization_id").on(
      table.organization_id,
    ),
    index("idx_organization_training_source_context_org_auth_id").on(
      table.org_auth_id,
    ),
    index("idx_organization_training_source_context_source").on(
      table.source_type,
      table.source_public_id,
    ),
  ],
);

export const organizationTrainingVersion = pgTable(
  "organization_training_version",
  {
    id: idColumn(),
    public_id: text("public_id").notNull(),
    organization_training_draft_id: bigint("organization_training_draft_id", {
      mode: "number",
    }),
    draft_public_id: text("draft_public_id").notNull(),
    publish_operation_id: text("publish_operation_id"),
    publish_payload_digest: text("publish_payload_digest"),
    version_number: integer("version_number").notNull(),
    organization_id: bigint("organization_id", { mode: "number" }).notNull(),
    organization_public_id: text("organization_public_id").notNull(),
    org_auth_id: bigint("org_auth_id", { mode: "number" }).notNull(),
    authorization_source: text("authorization_source")
      .default("org_auth")
      .notNull(),
    authorization_public_id: text("authorization_public_id").notNull(),
    owner_type: text("owner_type").default("organization").notNull(),
    owner_public_id: text("owner_public_id").notNull(),
    quota_owner_type: text("quota_owner_type")
      .default("organization")
      .notNull(),
    quota_owner_public_id: text("quota_owner_public_id").notNull(),
    publish_scope_snapshot: jsonb("publish_scope_snapshot")
      .$type<OrganizationTrainingPublishScopeSnapshotValue>()
      .notNull(),
    recipient_snapshot_schema_version: integer(
      "recipient_snapshot_schema_version",
    ),
    recipient_snapshot_captured_at: nullableTimestampColumn(
      "recipient_snapshot_captured_at",
    ),
    recipient_snapshot_count: integer("recipient_snapshot_count"),
    recipient_snapshot_digest: text("recipient_snapshot_digest"),
    profession: professionEnum("profession").notNull(),
    level: integer("level").notNull(),
    subject: subjectEnum("subject").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    question_count: integer("question_count").notNull(),
    total_score: scoreColumn("total_score").notNull(),
    question_type_summary: jsonb("question_type_summary")
      .$type<OrganizationTrainingQuestionTypeSummaryValue>()
      .notNull(),
    question_snapshot: jsonb("question_snapshot")
      .$type<OrganizationTrainingQuestionSnapshotValue[]>()
      .default([])
      .notNull(),
    version_status: organizationTrainingVersionStatusEnum("version_status")
      .default("published")
      .notNull(),
    published_at: timestampColumn("published_at"),
    answer_deadline_at: nullableTimestampColumn("answer_deadline_at"),
    taken_down_at: nullableTimestampColumn("taken_down_at"),
    takedown_reason: text("takedown_reason"),
    created_at: createdAtColumn(),
    updated_at: updatedAtColumn(),
  },
  (table) => [
    foreignKey({
      columns: [table.organization_training_draft_id],
      foreignColumns: [organizationTrainingDraft.id],
      name: "fk_organization_training_version_draft",
    }).onDelete("restrict"),
    foreignKey({
      columns: [table.organization_id],
      foreignColumns: [organization.id],
      name: "fk_organization_training_version_organization",
    }).onDelete("restrict"),
    foreignKey({
      columns: [table.org_auth_id],
      foreignColumns: [orgAuth.id],
      name: "fk_organization_training_version_org_auth",
    }).onDelete("restrict"),
    uniqueIndex("udx_organization_training_version_public_id").on(
      table.public_id,
    ),
    uniqueIndex("udx_organization_training_version_draft_version").on(
      table.draft_public_id,
      table.version_number,
    ),
    uniqueIndex("udx_organization_training_version_draft_id").on(
      table.organization_training_draft_id,
    ),
    index("idx_organization_training_version_organization_id").on(
      table.organization_id,
    ),
    index("idx_organization_training_version_org_auth_id").on(
      table.org_auth_id,
    ),
    index("idx_organization_training_version_org_published_at").on(
      table.organization_public_id,
      table.published_at,
    ),
    index("idx_organization_training_version_version_status").on(
      table.version_status,
    ),
    index("idx_organization_training_version_answer_deadline").on(
      table.answer_deadline_at,
    ),
    index("idx_organization_training_version_profession_level_subject").on(
      table.profession,
      table.level,
      table.subject,
    ),
    check(
      "chk_organization_training_version_recipient_snapshot",
      sql`(
        ${table.recipient_snapshot_schema_version} is null
        and ${table.recipient_snapshot_captured_at} is null
        and ${table.recipient_snapshot_count} is null
        and ${table.recipient_snapshot_digest} is null
      ) or (
        ${table.recipient_snapshot_schema_version} = 1
        and ${table.recipient_snapshot_captured_at} is not null
        and ${table.recipient_snapshot_count} is not null
        and ${table.recipient_snapshot_count} >= 0
        and ${table.recipient_snapshot_digest} ~ '^[0-9a-f]{64}$'
      )`,
    ),
  ],
);

export const organizationTrainingVersionRecipient = pgTable(
  "organization_training_version_recipient",
  {
    id: idColumn(),
    organization_training_version_id: bigint(
      "organization_training_version_id",
      { mode: "number" },
    ).notNull(),
    employee_public_id: text("employee_public_id").notNull(),
    organization_public_id: text("organization_public_id").notNull(),
    authorization_public_id: text("authorization_public_id").notNull(),
    created_at: createdAtColumn(),
  },
  (table) => [
    foreignKey({
      columns: [table.organization_training_version_id],
      foreignColumns: [organizationTrainingVersion.id],
      name: "fk_organization_training_version_recipient_version",
    }).onDelete("restrict"),
    uniqueIndex(
      "udx_organization_training_version_recipient_version_employee",
    ).on(table.organization_training_version_id, table.employee_public_id),
    index("idx_organization_training_version_recipient_version_id").on(
      table.organization_training_version_id,
    ),
    index("idx_organization_training_version_recipient_org_employee").on(
      table.organization_public_id,
      table.employee_public_id,
    ),
  ],
);

export const organizationTrainingAnswer = pgTable(
  "organization_training_answer",
  {
    id: idColumn(),
    public_id: text("public_id").notNull(),
    organization_training_version_id: bigint(
      "organization_training_version_id",
      {
        mode: "number",
      },
    ).notNull(),
    organization_training_version_public_id: text(
      "organization_training_version_public_id",
    ).notNull(),
    employee_id: bigint("employee_id", { mode: "number" }).notNull(),
    employee_public_id: text("employee_public_id").notNull(),
    organization_id: bigint("organization_id", { mode: "number" }).notNull(),
    organization_public_id: text("organization_public_id").notNull(),
    organization_training_answer_status: organizationTrainingAnswerStatusEnum(
      "organization_training_answer_status",
    )
      .default("in_progress")
      .notNull(),
    revision: integer("revision").default(1).notNull(),
    last_operation_id: text("last_operation_id"),
    last_payload_digest: text("last_payload_digest"),
    submit_operation_id: text("submit_operation_id"),
    submit_payload_digest: text("submit_payload_digest"),
    score: scoreColumn("score"),
    total_score: scoreColumn("total_score").notNull(),
    submitted_at: nullableTimestampColumn("submitted_at"),
    answer_organization_snapshot: jsonb("answer_organization_snapshot")
      .$type<OrganizationTrainingAnswerOrganizationSnapshotValue>()
      .notNull(),
    answer_item_snapshot: jsonb("answer_item_snapshot")
      .$type<OrganizationTrainingAnswerItemSnapshotValue[]>()
      .default([])
      .notNull(),
    question_result_snapshot: jsonb("question_result_snapshot")
      .$type<OrganizationTrainingQuestionResultSnapshotValue[]>()
      .default([])
      .notNull(),
    created_at: createdAtColumn(),
    updated_at: updatedAtColumn(),
  },
  (table) => [
    foreignKey({
      columns: [table.organization_training_version_id],
      foreignColumns: [organizationTrainingVersion.id],
      name: "fk_organization_training_answer_version",
    }).onDelete("restrict"),
    foreignKey({
      columns: [table.employee_id],
      foreignColumns: [employee.id],
      name: "fk_organization_training_answer_employee",
    }).onDelete("restrict"),
    foreignKey({
      columns: [table.organization_id],
      foreignColumns: [organization.id],
      name: "fk_organization_training_answer_organization",
    }).onDelete("restrict"),
    uniqueIndex("udx_organization_training_answer_public_id").on(
      table.public_id,
    ),
    uniqueIndex("udx_organization_training_answer_version_employee").on(
      table.organization_training_version_id,
      table.employee_id,
    ),
    index("idx_organization_training_answer_version_id").on(
      table.organization_training_version_id,
    ),
    index("idx_organization_training_answer_employee_id").on(table.employee_id),
    index("idx_organization_training_answer_org_submitted_at").on(
      table.organization_id,
      table.submitted_at,
    ),
    index("idx_organization_training_answer_status_submitted_at").on(
      table.organization_training_answer_status,
      table.submitted_at,
    ),
  ],
);

export const organizationTrainingScoringTask = pgTable(
  "organization_training_scoring_task",
  {
    id: idColumn(),
    public_id: text("public_id").notNull(),
    organization_training_answer_id: bigint("organization_training_answer_id", {
      mode: "number",
    }).notNull(),
    idempotency_key_hash: text("idempotency_key_hash").notNull(),
    task_status: aiScoringTaskStatusEnum("task_status")
      .default("pending")
      .notNull(),
    attempt_count: integer("attempt_count").default(0).notNull(),
    max_attempt_count: integer("max_attempt_count").default(3).notNull(),
    timeout_second: integer("timeout_second").default(60).notNull(),
    model_config_snapshot: jsonb("model_config_snapshot")
      .$type<OrganizationTrainingScoringTaskSnapshotValue>()
      .notNull(),
    prompt_template_key: text("prompt_template_key").notNull(),
    prompt_template_version: integer("prompt_template_version").notNull(),
    prompt_template_hash: text("prompt_template_hash").notNull(),
    input_snapshot: jsonb("input_snapshot")
      .$type<OrganizationTrainingScoringTaskSnapshotValue>()
      .notNull(),
    authorization_snapshot: jsonb("authorization_snapshot")
      .$type<OrganizationTrainingScoringTaskSnapshotValue>()
      .notNull(),
    rag_snapshot:
      jsonb(
        "rag_snapshot",
      ).$type<OrganizationTrainingScoringTaskSnapshotValue>(),
    result_snapshot:
      jsonb(
        "result_snapshot",
      ).$type<OrganizationTrainingScoringTaskSnapshotValue>(),
    ai_call_log_id: bigint("ai_call_log_id", { mode: "number" }),
    failure_code: text("failure_code"),
    failure_message_digest: text("failure_message_digest"),
    scheduled_at: timestampColumn("scheduled_at").defaultNow(),
    claimed_at: nullableTimestampColumn("claimed_at"),
    lease_expires_at: nullableTimestampColumn("lease_expires_at"),
    worker_public_id: text("worker_public_id"),
    completed_at: nullableTimestampColumn("completed_at"),
    created_at: createdAtColumn(),
    updated_at: updatedAtColumn(),
  },
  (table) => [
    foreignKey({
      columns: [table.organization_training_answer_id],
      foreignColumns: [organizationTrainingAnswer.id],
      name: "fk_organization_training_scoring_task_answer",
    }).onDelete("restrict"),
    foreignKey({
      columns: [table.ai_call_log_id],
      foreignColumns: [aiCallLog.id],
      name: "fk_organization_training_scoring_task_ai_call_log",
    }).onDelete("set null"),
    check(
      "chk_organization_training_scoring_task_attempt_count",
      sql`${table.attempt_count} >= 0 and ${table.attempt_count} <= ${table.max_attempt_count}`,
    ),
    check(
      "chk_organization_training_scoring_task_max_attempt_count",
      sql`${table.max_attempt_count} = 3`,
    ),
    check(
      "chk_organization_training_scoring_task_timeout_second",
      sql`${table.timeout_second} = 60`,
    ),
    uniqueIndex("udx_organization_training_scoring_task_public_id").on(
      table.public_id,
    ),
    uniqueIndex("udx_organization_training_scoring_task_answer_id").on(
      table.organization_training_answer_id,
    ),
    index("idx_organization_training_scoring_task_status_scheduled_at").on(
      table.task_status,
      table.scheduled_at,
    ),
    index("idx_organization_training_scoring_task_lease_expires_at").on(
      table.lease_expires_at,
    ),
  ],
);

import {
  bigint,
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

import { evidenceStatusEnum } from "./ai-rag";
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

export const organizationTrainingAnswerStatusValues = [
  "in_progress",
  "submitted",
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
    draft_public_id: text("draft_public_id").notNull(),
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

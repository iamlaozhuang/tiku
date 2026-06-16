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

import { orgAuth, organization, professionEnum } from "./auth";
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
    version_status: organizationTrainingVersionStatusEnum("version_status")
      .default("published")
      .notNull(),
    published_at: timestampColumn("published_at"),
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
    index("idx_organization_training_version_profession_level_subject").on(
      table.profession,
      table.level,
      table.subject,
    ),
  ],
);

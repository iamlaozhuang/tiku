import { relations, sql } from "drizzle-orm";
import {
  bigint,
  boolean,
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

import { admin, professionEnum } from "./auth";
import { knowledgeNode } from "./ai-rag";

export type PaperTableName = "paper";
export const paperTableName: PaperTableName = "paper";

const idColumn = () =>
  bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey();

const timestampColumn = (name: string) =>
  timestamp(name, { withTimezone: true }).notNull();

const nullableTimestampColumn = (name: string) =>
  timestamp(name, { withTimezone: true });

const createdAtColumn = () => timestampColumn("created_at").defaultNow();

const updatedAtColumn = () => timestampColumn("updated_at").defaultNow();

const adminIdColumn = (name: string) =>
  bigint(name, { mode: "number" })
    .notNull()
    .references(() => admin.id, { onDelete: "restrict" });

const scoreColumn = (name: string) => numeric(name, { precision: 8, scale: 1 });

export type FillBlankAnswerValue = {
  blankKey: string;
  standardAnswers: string[];
  score: string;
  sortOrder: number;
};

export const subjectValues = ["theory", "skill"] as const;
export const questionTypeValues = [
  "single_choice",
  "multi_choice",
  "true_false",
  "fill_blank",
  "short_answer",
  "case_analysis",
  "calculation",
] as const;
export const questionStatusValues = ["available", "disabled"] as const;
export const materialStatusValues = ["available", "disabled"] as const;
export const paperStatusValues = ["draft", "published", "archived"] as const;
export const multiChoiceRuleValues = [
  "all_correct_only",
  "partial_credit",
] as const;
export const scoringMethodValues = ["auto_match", "ai_scoring"] as const;
export const paperTypeValues = ["past_paper", "mock_paper"] as const;
export const paperAttachmentUsageValues = [
  "paper_source",
  "answer_analysis",
  "answer_sheet",
  "other",
] as const;
export const paperAssetUploadOperationStatusValues = [
  "pending",
  "file_stored",
  "completed",
  "failed",
] as const;
export const contentImageUploadOperationStatusValues = [
  "pending",
  "file_stored",
  "completed",
  "failed",
] as const;

export const subjectEnum = pgEnum("subject", subjectValues);
export const questionTypeEnum = pgEnum("question_type", questionTypeValues);
export const questionStatusEnum = pgEnum(
  "question_status",
  questionStatusValues,
);
export const materialStatusEnum = pgEnum(
  "material_status",
  materialStatusValues,
);
export const paperStatusEnum = pgEnum("paper_status", paperStatusValues);
export const multiChoiceRuleEnum = pgEnum(
  "multi_choice_rule",
  multiChoiceRuleValues,
);
export const scoringMethodEnum = pgEnum("scoring_method", scoringMethodValues);
export const paperTypeEnum = pgEnum("paper_type", paperTypeValues);
export const paperAttachmentUsageEnum = pgEnum(
  "paper_attachment_usage",
  paperAttachmentUsageValues,
);
export const paperAssetUploadOperationStatusEnum = pgEnum(
  "paper_asset_upload_operation_status",
  paperAssetUploadOperationStatusValues,
);
export const contentImageUploadOperationStatusEnum = pgEnum(
  "content_image_upload_operation_status",
  contentImageUploadOperationStatusValues,
);

export const material = pgTable(
  "material",
  {
    id: idColumn(),
    public_id: text("public_id").notNull(),
    title: text("title").notNull(),
    content_rich_text: text("content_rich_text").notNull(),
    profession: professionEnum("profession").notNull(),
    level: integer("level").notNull(),
    subject: subjectEnum("subject").notNull(),
    status: materialStatusEnum("status").default("available").notNull(),
    is_locked: boolean("is_locked").default(false).notNull(),
    locked_at: nullableTimestampColumn("locked_at"),
    created_by_admin_id: adminIdColumn("created_by_admin_id"),
    updated_by_admin_id: adminIdColumn("updated_by_admin_id"),
    created_at: createdAtColumn(),
    updated_at: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex("udx_material_public_id").on(table.public_id),
    index("idx_material_profession_level_subject").on(
      table.profession,
      table.level,
      table.subject,
    ),
    index("idx_material_status").on(table.status),
    index("idx_material_is_locked").on(table.is_locked),
  ],
);

export const question = pgTable(
  "question",
  {
    id: idColumn(),
    public_id: text("public_id").notNull(),
    question_type: questionTypeEnum("question_type").notNull(),
    profession: professionEnum("profession").notNull(),
    level: integer("level").notNull(),
    subject: subjectEnum("subject").notNull(),
    stem_rich_text: text("stem_rich_text").notNull(),
    analysis_rich_text: text("analysis_rich_text").notNull(),
    standard_answer_rich_text: text("standard_answer_rich_text").notNull(),
    status: questionStatusEnum("status").default("available").notNull(),
    is_locked: boolean("is_locked").default(false).notNull(),
    locked_at: nullableTimestampColumn("locked_at"),
    multi_choice_rule: multiChoiceRuleEnum("multi_choice_rule")
      .default("all_correct_only")
      .notNull(),
    scoring_method: scoringMethodEnum("scoring_method")
      .default("auto_match")
      .notNull(),
    fill_blank_answers: jsonb("fill_blank_answers")
      .$type<FillBlankAnswerValue[]>()
      .default([])
      .notNull(),
    material_id: bigint("material_id", { mode: "number" }).references(
      () => material.id,
      { onDelete: "restrict" },
    ),
    created_by_admin_id: adminIdColumn("created_by_admin_id"),
    updated_by_admin_id: adminIdColumn("updated_by_admin_id"),
    created_at: createdAtColumn(),
    updated_at: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex("udx_question_public_id").on(table.public_id),
    index("idx_question_profession_level_subject").on(
      table.profession,
      table.level,
      table.subject,
    ),
    index("idx_question_question_type").on(table.question_type),
    index("idx_question_status").on(table.status),
    index("idx_question_material_id").on(table.material_id),
    index("idx_question_is_locked").on(table.is_locked),
  ],
);

export const questionOption = pgTable(
  "question_option",
  {
    id: idColumn(),
    question_id: bigint("question_id", { mode: "number" })
      .notNull()
      .references(() => question.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    content_rich_text: text("content_rich_text").notNull(),
    is_correct: boolean("is_correct").default(false).notNull(),
    sort_order: integer("sort_order").notNull(),
    created_at: createdAtColumn(),
    updated_at: updatedAtColumn(),
  },
  (table) => [
    index("idx_question_option_question_id").on(table.question_id),
    index("idx_question_option_sort_order").on(table.sort_order),
  ],
);

export const scoringPoint = pgTable(
  "scoring_point",
  {
    id: idColumn(),
    question_id: bigint("question_id", { mode: "number" })
      .notNull()
      .references(() => question.id, { onDelete: "cascade" }),
    description: text("description").notNull(),
    score: scoreColumn("score").notNull(),
    sort_order: integer("sort_order").notNull(),
    created_at: createdAtColumn(),
    updated_at: updatedAtColumn(),
  },
  (table) => [
    index("idx_scoring_point_question_id").on(table.question_id),
    index("idx_scoring_point_sort_order").on(table.sort_order),
  ],
);

export const tag = pgTable(
  "tag",
  {
    id: idColumn(),
    public_id: text("public_id").notNull(),
    name: text("name").notNull(),
    created_at: createdAtColumn(),
    updated_at: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex("udx_tag_public_id").on(table.public_id),
    uniqueIndex("udx_tag_name").on(table.name),
  ],
);

export const questionKnowledgeNode = pgTable(
  "question_knowledge_node",
  {
    id: idColumn(),
    question_id: bigint("question_id", { mode: "number" })
      .notNull()
      .references(() => question.id, { onDelete: "cascade" }),
    knowledge_node_id: bigint("knowledge_node_id", { mode: "number" })
      .notNull()
      .references(() => knowledgeNode.id, { onDelete: "restrict" }),
    created_at: createdAtColumn(),
  },
  (table) => [
    uniqueIndex("udx_question_knowledge_node_question_id_knowledge_node_id").on(
      table.question_id,
      table.knowledge_node_id,
    ),
    index("idx_question_knowledge_node_question_id").on(table.question_id),
    index("idx_question_knowledge_node_knowledge_node_id").on(
      table.knowledge_node_id,
    ),
  ],
);

export const questionTag = pgTable(
  "question_tag",
  {
    id: idColumn(),
    question_id: bigint("question_id", { mode: "number" })
      .notNull()
      .references(() => question.id, { onDelete: "cascade" }),
    tag_id: bigint("tag_id", { mode: "number" })
      .notNull()
      .references(() => tag.id, { onDelete: "restrict" }),
    created_at: createdAtColumn(),
  },
  (table) => [
    uniqueIndex("udx_question_tag_question_id_tag_id").on(
      table.question_id,
      table.tag_id,
    ),
    index("idx_question_tag_question_id").on(table.question_id),
    index("idx_question_tag_tag_id").on(table.tag_id),
  ],
);

export const paper = pgTable(
  paperTableName,
  {
    id: idColumn(),
    public_id: text("public_id").notNull(),
    name: text("name").notNull(),
    profession: professionEnum("profession").notNull(),
    level: integer("level").notNull(),
    subject: subjectEnum("subject").notNull(),
    paper_status: paperStatusEnum("paper_status").default("draft").notNull(),
    paper_type: paperTypeEnum("paper_type"),
    year: integer("year"),
    source: text("source"),
    duration_minute: integer("duration_minute"),
    total_score: scoreColumn("total_score"),
    revision: integer("revision").default(1).notNull(),
    published_at: nullableTimestampColumn("published_at"),
    archived_at: nullableTimestampColumn("archived_at"),
    created_by_admin_id: adminIdColumn("created_by_admin_id"),
    updated_by_admin_id: adminIdColumn("updated_by_admin_id"),
    created_at: createdAtColumn(),
    updated_at: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex("udx_paper_public_id").on(table.public_id),
    index("idx_paper_profession_level_subject").on(
      table.profession,
      table.level,
      table.subject,
    ),
    index("idx_paper_paper_status").on(table.paper_status),
    index("idx_paper_published_at").on(table.published_at),
    index("idx_paper_updated_at").on(table.updated_at),
  ],
);

export const paperSection = pgTable(
  "paper_section",
  {
    id: idColumn(),
    paper_id: bigint("paper_id", { mode: "number" })
      .notNull()
      .references(() => paper.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    sort_order: integer("sort_order").notNull(),
    total_score: scoreColumn("total_score").default("0").notNull(),
    created_at: createdAtColumn(),
    updated_at: updatedAtColumn(),
  },
  (table) => [
    index("idx_paper_section_paper_id").on(table.paper_id),
    index("idx_paper_section_sort_order").on(table.sort_order),
  ],
);

export const questionGroup = pgTable(
  "question_group",
  {
    id: idColumn(),
    public_id: text("public_id")
      .default(sql`'qgroup_' || replace(gen_random_uuid()::text, '-', '')`)
      .notNull(),
    paper_id: bigint("paper_id", { mode: "number" })
      .notNull()
      .references(() => paper.id, { onDelete: "cascade" }),
    paper_section_id: bigint("paper_section_id", { mode: "number" })
      .notNull()
      .references(() => paperSection.id, { onDelete: "cascade" }),
    material_id: bigint("material_id", { mode: "number" })
      .notNull()
      .references(() => material.id, { onDelete: "restrict" }),
    material_snapshot: jsonb("material_snapshot").notNull(),
    title: text("title").notNull(),
    sort_order: integer("sort_order").notNull(),
    created_at: createdAtColumn(),
    updated_at: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex("udx_question_group_public_id").on(table.public_id),
    index("idx_question_group_paper_id").on(table.paper_id),
    index("idx_question_group_paper_section_id").on(table.paper_section_id),
    index("idx_question_group_material_id").on(table.material_id),
    index("idx_question_group_sort_order").on(table.sort_order),
  ],
);

export const paperQuestion = pgTable(
  "paper_question",
  {
    id: idColumn(),
    public_id: text("public_id").notNull(),
    paper_id: bigint("paper_id", { mode: "number" })
      .notNull()
      .references(() => paper.id, { onDelete: "cascade" }),
    paper_section_id: bigint("paper_section_id", { mode: "number" })
      .notNull()
      .references(() => paperSection.id, { onDelete: "cascade" }),
    question_group_id: bigint("question_group_id", {
      mode: "number",
    }).references(() => questionGroup.id, { onDelete: "set null" }),
    question_id: bigint("question_id", { mode: "number" })
      .notNull()
      .references(() => question.id, { onDelete: "restrict" }),
    question_snapshot: jsonb("question_snapshot").notNull(),
    material_snapshot: jsonb("material_snapshot"),
    score: scoreColumn("score"),
    sort_order: integer("sort_order").notNull(),
    created_at: createdAtColumn(),
    updated_at: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex("udx_paper_question_public_id").on(table.public_id),
    index("idx_paper_question_paper_id").on(table.paper_id),
    index("idx_paper_question_paper_section_id").on(table.paper_section_id),
    index("idx_paper_question_question_group_id").on(table.question_group_id),
    index("idx_paper_question_question_id").on(table.question_id),
    index("idx_paper_question_sort_order").on(table.sort_order),
  ],
);

export const paperScoringPoint = pgTable(
  "paper_scoring_point",
  {
    id: idColumn(),
    public_id: text("public_id")
      .default(sql`'psp_' || replace(gen_random_uuid()::text, '-', '')`)
      .notNull(),
    paper_question_id: bigint("paper_question_id", { mode: "number" })
      .notNull()
      .references(() => paperQuestion.id, { onDelete: "cascade" }),
    source_scoring_point_id: bigint("source_scoring_point_id", {
      mode: "number",
    }).references(() => scoringPoint.id, { onDelete: "set null" }),
    description: text("description").notNull(),
    score: scoreColumn("score").notNull(),
    sort_order: integer("sort_order").notNull(),
    created_at: createdAtColumn(),
    updated_at: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex("udx_paper_scoring_point_public_id").on(table.public_id),
    index("idx_paper_scoring_point_paper_question_id").on(
      table.paper_question_id,
    ),
    index("idx_paper_scoring_point_source_scoring_point_id").on(
      table.source_scoring_point_id,
    ),
    index("idx_paper_scoring_point_sort_order").on(table.sort_order),
  ],
);

export const paperCommand = pgTable(
  "paper_command",
  {
    id: idColumn(),
    public_id: text("public_id").notNull(),
    actor_admin_id: adminIdColumn("actor_admin_id"),
    paper_id: bigint("paper_id", { mode: "number" }).references(
      () => paper.id,
      { onDelete: "set null" },
    ),
    command_kind: text("command_kind").notNull(),
    request_hash: text("request_hash").notNull(),
    result_public_id: text("result_public_id"),
    created_at: createdAtColumn(),
  },
  (table) => [
    uniqueIndex("udx_paper_command_public_id").on(table.public_id),
    index("idx_paper_command_actor_admin_id_command_kind").on(
      table.actor_admin_id,
      table.command_kind,
    ),
    index("idx_paper_command_paper_id").on(table.paper_id),
  ],
);

export const paperAsset = pgTable(
  "paper_asset",
  {
    id: idColumn(),
    public_id: text("public_id").notNull(),
    paper_id: bigint("paper_id", { mode: "number" })
      .notNull()
      .references(() => paper.id, { onDelete: "cascade" }),
    paper_attachment_usage: paperAttachmentUsageEnum(
      "paper_attachment_usage",
    ).notNull(),
    file_name: text("file_name").notNull(),
    object_key: text("object_key").notNull(),
    content_type: text("content_type").notNull(),
    file_size_byte: bigint("file_size_byte", { mode: "number" }).notNull(),
    file_hash: text("file_hash").notNull(),
    created_by_admin_id: adminIdColumn("created_by_admin_id"),
    created_at: createdAtColumn(),
  },
  (table) => [
    uniqueIndex("udx_paper_asset_public_id").on(table.public_id),
    index("idx_paper_asset_paper_id").on(table.paper_id),
    index("idx_paper_asset_paper_attachment_usage").on(
      table.paper_attachment_usage,
    ),
    index("idx_paper_asset_file_hash").on(table.file_hash),
  ],
);

export const paperAssetUploadOperation = pgTable(
  "paper_asset_upload_operation",
  {
    id: idColumn(),
    public_id: text("public_id").notNull(),
    actor_admin_id: adminIdColumn("actor_admin_id"),
    paper_id: bigint("paper_id", { mode: "number" })
      .notNull()
      .references(() => paper.id, { onDelete: "cascade" }),
    paper_asset_id: bigint("paper_asset_id", { mode: "number" }).references(
      () => paperAsset.id,
      { onDelete: "set null" },
    ),
    paper_asset_public_id: text("paper_asset_public_id").notNull(),
    idempotency_key_hash: text("idempotency_key_hash").notNull(),
    request_fingerprint: text("request_fingerprint").notNull(),
    paper_attachment_usage: paperAttachmentUsageEnum(
      "paper_attachment_usage",
    ).notNull(),
    file_name: text("file_name").notNull(),
    object_key: text("object_key").notNull(),
    content_type: text("content_type").notNull(),
    file_size_byte: bigint("file_size_byte", { mode: "number" }).notNull(),
    file_hash: text("file_hash").notNull(),
    operation_status: paperAssetUploadOperationStatusEnum("operation_status")
      .default("pending")
      .notNull(),
    last_failure_message_digest: text("last_failure_message_digest"),
    file_stored_at: nullableTimestampColumn("file_stored_at"),
    completed_at: nullableTimestampColumn("completed_at"),
    created_at: createdAtColumn(),
    updated_at: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex("udx_paper_asset_upload_operation_public_id").on(
      table.public_id,
    ),
    uniqueIndex("udx_paper_asset_upload_operation_idempotency_key_hash").on(
      table.idempotency_key_hash,
    ),
    uniqueIndex("udx_paper_asset_upload_operation_paper_asset_public_id").on(
      table.paper_asset_public_id,
    ),
    uniqueIndex("udx_paper_asset_upload_operation_paper_asset_id").on(
      table.paper_asset_id,
    ),
    index("idx_paper_asset_upload_operation_status_updated_at").on(
      table.operation_status,
      table.updated_at,
    ),
  ],
);

export const contentImage = pgTable(
  "content_image",
  {
    id: idColumn(),
    public_id: text("public_id").notNull(),
    profession: professionEnum("profession").notNull(),
    object_key: text("object_key").notNull(),
    content_type: text("content_type").notNull(),
    file_size_byte: bigint("file_size_byte", { mode: "number" }).notNull(),
    file_hash: text("file_hash").notNull(),
    created_by_admin_id: adminIdColumn("created_by_admin_id"),
    created_at: createdAtColumn(),
  },
  (table) => [
    uniqueIndex("udx_content_image_public_id").on(table.public_id),
    index("idx_content_image_file_hash").on(table.file_hash),
  ],
);

export const contentImageUploadOperation = pgTable(
  "content_image_upload_operation",
  {
    id: idColumn(),
    public_id: text("public_id").notNull(),
    actor_admin_id: adminIdColumn("actor_admin_id"),
    content_image_id: bigint("content_image_id", { mode: "number" }).references(
      () => contentImage.id,
      { onDelete: "set null" },
    ),
    content_image_public_id: text("content_image_public_id").notNull(),
    idempotency_key_hash: text("idempotency_key_hash").notNull(),
    request_fingerprint: text("request_fingerprint").notNull(),
    profession: professionEnum("profession").notNull(),
    object_key: text("object_key").notNull(),
    content_type: text("content_type").notNull(),
    file_size_byte: bigint("file_size_byte", { mode: "number" }).notNull(),
    file_hash: text("file_hash").notNull(),
    operation_status: contentImageUploadOperationStatusEnum("operation_status")
      .default("pending")
      .notNull(),
    last_failure_message_digest: text("last_failure_message_digest"),
    file_stored_at: nullableTimestampColumn("file_stored_at"),
    completed_at: nullableTimestampColumn("completed_at"),
    created_at: createdAtColumn(),
    updated_at: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex("udx_content_image_upload_operation_public_id").on(
      table.public_id,
    ),
    uniqueIndex("udx_content_image_upload_operation_idempotency_key_hash").on(
      table.idempotency_key_hash,
    ),
    uniqueIndex(
      "udx_content_image_upload_operation_content_image_public_id",
    ).on(table.content_image_public_id),
    uniqueIndex("udx_content_image_upload_operation_content_image_id").on(
      table.content_image_id,
    ),
    index("idx_content_image_upload_operation_status_updated_at").on(
      table.operation_status,
      table.updated_at,
    ),
  ],
);

export const materialRelations = relations(material, ({ many, one }) => ({
  createdByAdmin: one(admin, {
    fields: [material.created_by_admin_id],
    references: [admin.id],
    relationName: "materialCreatedByAdmin",
  }),
  questions: many(question),
  questionGroups: many(questionGroup),
  updatedByAdmin: one(admin, {
    fields: [material.updated_by_admin_id],
    references: [admin.id],
    relationName: "materialUpdatedByAdmin",
  }),
}));

export const questionRelations = relations(question, ({ many, one }) => ({
  createdByAdmin: one(admin, {
    fields: [question.created_by_admin_id],
    references: [admin.id],
    relationName: "questionCreatedByAdmin",
  }),
  material: one(material, {
    fields: [question.material_id],
    references: [material.id],
  }),
  paperQuestions: many(paperQuestion),
  questionKnowledgeNodes: many(questionKnowledgeNode),
  questionOptions: many(questionOption),
  scoringPoints: many(scoringPoint),
  questionTags: many(questionTag),
  updatedByAdmin: one(admin, {
    fields: [question.updated_by_admin_id],
    references: [admin.id],
    relationName: "questionUpdatedByAdmin",
  }),
}));

export const tagRelations = relations(tag, ({ many }) => ({
  questionTags: many(questionTag),
}));

export const questionKnowledgeNodeRelations = relations(
  questionKnowledgeNode,
  ({ one }) => ({
    knowledgeNode: one(knowledgeNode, {
      fields: [questionKnowledgeNode.knowledge_node_id],
      references: [knowledgeNode.id],
    }),
    question: one(question, {
      fields: [questionKnowledgeNode.question_id],
      references: [question.id],
    }),
  }),
);

export const questionTagRelations = relations(questionTag, ({ one }) => ({
  question: one(question, {
    fields: [questionTag.question_id],
    references: [question.id],
  }),
  tag: one(tag, {
    fields: [questionTag.tag_id],
    references: [tag.id],
  }),
}));

export const questionOptionRelations = relations(questionOption, ({ one }) => ({
  question: one(question, {
    fields: [questionOption.question_id],
    references: [question.id],
  }),
}));

export const scoringPointRelations = relations(
  scoringPoint,
  ({ many, one }) => ({
    paperScoringPoints: many(paperScoringPoint),
    question: one(question, {
      fields: [scoringPoint.question_id],
      references: [question.id],
    }),
  }),
);

export const paperRelations = relations(paper, ({ many, one }) => ({
  createdByAdmin: one(admin, {
    fields: [paper.created_by_admin_id],
    references: [admin.id],
    relationName: "paperCreatedByAdmin",
  }),
  paperAssets: many(paperAsset),
  paperCommands: many(paperCommand),
  paperQuestions: many(paperQuestion),
  paperSections: many(paperSection),
  questionGroups: many(questionGroup),
  updatedByAdmin: one(admin, {
    fields: [paper.updated_by_admin_id],
    references: [admin.id],
    relationName: "paperUpdatedByAdmin",
  }),
}));

export const paperCommandRelations = relations(paperCommand, ({ one }) => ({
  actorAdmin: one(admin, {
    fields: [paperCommand.actor_admin_id],
    references: [admin.id],
  }),
  paper: one(paper, {
    fields: [paperCommand.paper_id],
    references: [paper.id],
  }),
}));

export const paperSectionRelations = relations(
  paperSection,
  ({ many, one }) => ({
    paper: one(paper, {
      fields: [paperSection.paper_id],
      references: [paper.id],
    }),
    paperQuestions: many(paperQuestion),
    questionGroups: many(questionGroup),
  }),
);

export const questionGroupRelations = relations(
  questionGroup,
  ({ many, one }) => ({
    material: one(material, {
      fields: [questionGroup.material_id],
      references: [material.id],
    }),
    paper: one(paper, {
      fields: [questionGroup.paper_id],
      references: [paper.id],
    }),
    paperQuestions: many(paperQuestion),
    paperSection: one(paperSection, {
      fields: [questionGroup.paper_section_id],
      references: [paperSection.id],
    }),
  }),
);

export const paperQuestionRelations = relations(
  paperQuestion,
  ({ many, one }) => ({
    paper: one(paper, {
      fields: [paperQuestion.paper_id],
      references: [paper.id],
    }),
    paperScoringPoints: many(paperScoringPoint),
    paperSection: one(paperSection, {
      fields: [paperQuestion.paper_section_id],
      references: [paperSection.id],
    }),
    question: one(question, {
      fields: [paperQuestion.question_id],
      references: [question.id],
    }),
    questionGroup: one(questionGroup, {
      fields: [paperQuestion.question_group_id],
      references: [questionGroup.id],
    }),
  }),
);

export const paperScoringPointRelations = relations(
  paperScoringPoint,
  ({ one }) => ({
    paperQuestion: one(paperQuestion, {
      fields: [paperScoringPoint.paper_question_id],
      references: [paperQuestion.id],
    }),
    sourceScoringPoint: one(scoringPoint, {
      fields: [paperScoringPoint.source_scoring_point_id],
      references: [scoringPoint.id],
    }),
  }),
);

export const paperAssetRelations = relations(paperAsset, ({ one }) => ({
  createdByAdmin: one(admin, {
    fields: [paperAsset.created_by_admin_id],
    references: [admin.id],
    relationName: "paperAssetCreatedByAdmin",
  }),
  paper: one(paper, {
    fields: [paperAsset.paper_id],
    references: [paper.id],
  }),
}));

import {
  bigint,
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

import { professionEnum } from "./auth";

const idColumn = () =>
  bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey();

const timestampColumn = (name: string) =>
  timestamp(name, { withTimezone: true }).notNull();

const nullableTimestampColumn = (name: string) =>
  timestamp(name, { withTimezone: true });

const createdAtColumn = () => timestampColumn("created_at").defaultNow();

const updatedAtColumn = () => timestampColumn("updated_at").defaultNow();

export const aiFuncTypeValues = [
  "scoring",
  "explanation",
  "hint",
  "kn_recommendation",
  "learning_suggestion",
] as const;

export const aiFuncTypeEnum = pgEnum("ai_func_type", aiFuncTypeValues);

export const aiCallStatusValues = ["success", "failed"] as const;

export const aiCallStatusEnum = pgEnum("ai_call_status", aiCallStatusValues);

export const aiScoringAttemptStatusValues = [
  "pending",
  "running",
  "succeeded",
  "failed",
  "timeout",
  "cancelled",
] as const;

export const aiScoringAttemptStatusEnum = pgEnum(
  "ai_scoring_attempt_status",
  aiScoringAttemptStatusValues,
);

export const resourceTypeValues = [
  "textbook",
  "courseware",
  "knowledge_doc",
  "lecture_note",
  "other",
] as const;

export const resourceTypeEnum = pgEnum("resource_type", resourceTypeValues);

export const resourceStatusValues = [
  "uploaded",
  "converting",
  "conversion_failed",
  "draft",
  "published",
  "indexing",
  "index_failed",
  "rag_ready",
  "disabled",
] as const;

export const resourceStatusEnum = pgEnum(
  "resource_status",
  resourceStatusValues,
);

export const knStatusValues = ["active", "disabled"] as const;

export const knStatusEnum = pgEnum("kn_status", knStatusValues);

export const modelProvider = pgTable(
  "model_provider",
  {
    id: idColumn(),
    public_id: text("public_id").notNull(),
    provider_key: text("provider_key").notNull(),
    display_name: text("display_name").notNull(),
    api_key_secret_ref: text("api_key_secret_ref"),
    api_key_last_four: text("api_key_last_four"),
    base_url: text("base_url"),
    secret_status: text("secret_status").default("not_configured").notNull(),
    last_rotated_at: nullableTimestampColumn("last_rotated_at"),
    provider_metadata: jsonb("provider_metadata"),
    is_enabled: boolean("is_enabled").default(false).notNull(),
    created_at: createdAtColumn(),
    updated_at: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex("udx_model_provider_public_id").on(table.public_id),
    uniqueIndex("udx_model_provider_provider_key").on(table.provider_key),
    index("idx_model_provider_is_enabled").on(table.is_enabled),
    index("idx_model_provider_secret_status").on(table.secret_status),
  ],
);

export const modelConfig = pgTable(
  "model_config",
  {
    id: idColumn(),
    public_id: text("public_id").notNull(),
    model_provider_id: bigint("model_provider_id", { mode: "number" })
      .notNull()
      .references(() => modelProvider.id, { onDelete: "restrict" }),
    ai_func_type: aiFuncTypeEnum("ai_func_type").notNull(),
    model_name: text("model_name").notNull(),
    display_name: text("display_name").notNull(),
    model_alias: text("model_alias"),
    config_version: integer("config_version").notNull(),
    status: text("status").default("disabled").notNull(),
    is_enabled: boolean("is_enabled").default(false).notNull(),
    timeout_second: integer("timeout_second").notNull(),
    max_retry_count: integer("max_retry_count").default(0).notNull(),
    fallback_priority: integer("fallback_priority").default(0).notNull(),
    snapshot_policy: text("snapshot_policy")
      .default("redacted_metadata")
      .notNull(),
    fallback_model_config_id: bigint("fallback_model_config_id", {
      mode: "number",
    }).references((): AnyPgColumn => modelConfig.id, { onDelete: "set null" }),
    created_at: createdAtColumn(),
    updated_at: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex("udx_model_config_public_id").on(table.public_id),
    index("idx_model_config_model_provider_id").on(table.model_provider_id),
    index("idx_model_config_ai_func_type_is_enabled").on(
      table.ai_func_type,
      table.is_enabled,
    ),
    index("idx_model_config_ai_func_type_fallback_priority").on(
      table.ai_func_type,
      table.fallback_priority,
    ),
    index("idx_model_config_fallback_model_config_id").on(
      table.fallback_model_config_id,
    ),
  ],
);

export const promptTemplate = pgTable(
  "prompt_template",
  {
    id: idColumn(),
    public_id: text("public_id").notNull(),
    prompt_template_key: text("prompt_template_key").notNull(),
    ai_func_type: aiFuncTypeEnum("ai_func_type").notNull(),
    version: integer("version").notNull(),
    status: text("status").default("draft").notNull(),
    title: text("title"),
    description: text("description"),
    template_content: text("template_content").notNull(),
    template_hash: text("template_hash").notNull(),
    body_digest: text("body_digest"),
    body_preview_masked: text("body_preview_masked"),
    is_active: boolean("is_active").default(false).notNull(),
    created_at: createdAtColumn(),
    updated_at: updatedAtColumn(),
    archived_at: nullableTimestampColumn("archived_at"),
    disabled_at: nullableTimestampColumn("disabled_at"),
  },
  (table) => [
    uniqueIndex("udx_prompt_template_public_id").on(table.public_id),
    uniqueIndex("udx_prompt_template_key_version").on(
      table.prompt_template_key,
      table.version,
    ),
    index("idx_prompt_template_ai_func_type_is_active").on(
      table.ai_func_type,
      table.is_active,
    ),
    index("idx_prompt_template_status").on(table.status),
  ],
);

export const aiCallLog = pgTable(
  "ai_call_log",
  {
    id: idColumn(),
    public_id: text("public_id").notNull(),
    user_public_id: text("user_public_id"),
    answer_record_public_id: text("answer_record_public_id"),
    mock_exam_public_id: text("mock_exam_public_id"),
    question_public_id: text("question_public_id"),
    ai_func_type: aiFuncTypeEnum("ai_func_type").notNull(),
    call_status: aiCallStatusEnum("call_status").notNull(),
    model_config_id: bigint("model_config_id", { mode: "number" })
      .notNull()
      .references(() => modelConfig.id, { onDelete: "restrict" }),
    prompt_template_id: bigint("prompt_template_id", { mode: "number" })
      .notNull()
      .references(() => promptTemplate.id, { onDelete: "restrict" }),
    model_config_snapshot: jsonb("model_config_snapshot").notNull(),
    prompt_template_key: text("prompt_template_key").notNull(),
    prompt_template_version: integer("prompt_template_version").notNull(),
    request_redacted_snapshot: jsonb("request_redacted_snapshot").notNull(),
    response_redacted_snapshot: jsonb("response_redacted_snapshot"),
    error_redacted_snapshot: jsonb("error_redacted_snapshot"),
    citation_redacted_snapshot: jsonb("citation_redacted_snapshot"),
    prompt_token_count: integer("prompt_token_count"),
    completion_token_count: integer("completion_token_count"),
    total_token_count: integer("total_token_count"),
    latency_ms: integer("latency_ms"),
    started_at: timestampColumn("started_at"),
    completed_at: nullableTimestampColumn("completed_at"),
    created_at: createdAtColumn(),
  },
  (table) => [
    uniqueIndex("udx_ai_call_log_public_id").on(table.public_id),
    index("idx_ai_call_log_user_public_id").on(table.user_public_id),
    index("idx_ai_call_log_answer_record_public_id").on(
      table.answer_record_public_id,
    ),
    index("idx_ai_call_log_model_config_id").on(table.model_config_id),
    index("idx_ai_call_log_ai_func_type_call_status").on(
      table.ai_func_type,
      table.call_status,
    ),
    index("idx_ai_call_log_started_at").on(table.started_at),
  ],
);

export const aiScoringAttempt = pgTable(
  "ai_scoring_attempt",
  {
    id: idColumn(),
    answer_record_id: bigint("answer_record_id", { mode: "number" }).notNull(),
    attempt_number: integer("attempt_number").notNull(),
    ai_call_log_id: bigint("ai_call_log_id", {
      mode: "number",
    }).references(() => aiCallLog.id, { onDelete: "set null" }),
    status: aiScoringAttemptStatusEnum("status").notNull(),
    failure_code: text("failure_code"),
    failure_message_digest: text("failure_message_digest"),
    scheduled_at: timestampColumn("scheduled_at"),
    started_at: nullableTimestampColumn("started_at"),
    finished_at: nullableTimestampColumn("finished_at"),
    retry_after_at: nullableTimestampColumn("retry_after_at"),
    attempt_snapshot: jsonb("attempt_snapshot").notNull(),
    created_at: createdAtColumn(),
    updated_at: updatedAtColumn(),
  },
  (table) => [
    index("idx_ai_scoring_attempt_answer_record_id").on(table.answer_record_id),
    index("idx_ai_scoring_attempt_status").on(table.status),
    index("idx_ai_scoring_attempt_retry_after_at").on(table.retry_after_at),
    uniqueIndex("udx_ai_scoring_attempt_answer_record_id_attempt_number").on(
      table.answer_record_id,
      table.attempt_number,
    ),
  ],
);

export const knowledgeBase = pgTable(
  "knowledge_base",
  {
    id: idColumn(),
    public_id: text("public_id").notNull(),
    profession: professionEnum("profession").notNull(),
    display_name: text("display_name").notNull(),
    description: text("description"),
    is_enabled: boolean("is_enabled").default(true).notNull(),
    created_at: createdAtColumn(),
    updated_at: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex("udx_knowledge_base_public_id").on(table.public_id),
    uniqueIndex("udx_knowledge_base_profession").on(table.profession),
    index("idx_knowledge_base_is_enabled").on(table.is_enabled),
  ],
);

export const resource = pgTable(
  "resource",
  {
    id: idColumn(),
    public_id: text("public_id").notNull(),
    knowledge_base_id: bigint("knowledge_base_id", { mode: "number" })
      .notNull()
      .references(() => knowledgeBase.id, { onDelete: "restrict" }),
    resource_type: resourceTypeEnum("resource_type").notNull(),
    resource_status: resourceStatusEnum("resource_status")
      .default("uploaded")
      .notNull(),
    title: text("title").notNull(),
    original_file_name: text("original_file_name"),
    object_storage_path: text("object_storage_path"),
    content_hash: text("content_hash"),
    file_size_byte: integer("file_size_byte"),
    profession: professionEnum("profession").notNull(),
    level: integer("level"),
    markdown_content: text("markdown_content"),
    markdown_content_hash: text("markdown_content_hash"),
    conversion_error_message: text("conversion_error_message"),
    indexing_error_message: text("indexing_error_message"),
    is_vector_stale: boolean("is_vector_stale").default(false).notNull(),
    published_at: nullableTimestampColumn("published_at"),
    disabled_at: nullableTimestampColumn("disabled_at"),
    created_at: createdAtColumn(),
    updated_at: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex("udx_resource_public_id").on(table.public_id),
    index("idx_resource_knowledge_base_id").on(table.knowledge_base_id),
    index("idx_resource_profession_level_resource_status").on(
      table.profession,
      table.level,
      table.resource_status,
    ),
    index("idx_resource_resource_status").on(table.resource_status),
    index("idx_resource_content_hash").on(table.content_hash),
  ],
);

export const knowledgeNode = pgTable(
  "knowledge_node",
  {
    id: idColumn(),
    public_id: text("public_id").notNull(),
    knowledge_base_id: bigint("knowledge_base_id", { mode: "number" })
      .notNull()
      .references(() => knowledgeBase.id, { onDelete: "restrict" }),
    parent_knowledge_node_id: bigint("parent_knowledge_node_id", {
      mode: "number",
    }).references((): AnyPgColumn => knowledgeNode.id, {
      onDelete: "restrict",
    }),
    profession: professionEnum("profession").notNull(),
    level_list: jsonb("level_list").notNull(),
    name: text("name").notNull(),
    path_name: text("path_name").notNull(),
    depth: integer("depth").notNull(),
    sort_order: integer("sort_order").notNull(),
    kn_status: knStatusEnum("kn_status").default("active").notNull(),
    is_recommendable: boolean("is_recommendable").default(true).notNull(),
    created_at: createdAtColumn(),
    updated_at: updatedAtColumn(),
    disabled_at: nullableTimestampColumn("disabled_at"),
  },
  (table) => [
    uniqueIndex("udx_knowledge_node_public_id").on(table.public_id),
    index("idx_knowledge_node_knowledge_base_id").on(table.knowledge_base_id),
    index("idx_knowledge_node_parent_knowledge_node_id").on(
      table.parent_knowledge_node_id,
    ),
    index("idx_knowledge_node_profession_kn_status").on(
      table.profession,
      table.kn_status,
    ),
    index("idx_knowledge_node_sort_order").on(table.sort_order),
  ],
);

export const knowledgeNodeResource = pgTable(
  "knowledge_node_resource",
  {
    id: idColumn(),
    knowledge_node_id: bigint("knowledge_node_id", { mode: "number" })
      .notNull()
      .references(() => knowledgeNode.id, { onDelete: "restrict" }),
    resource_id: bigint("resource_id", { mode: "number" })
      .notNull()
      .references(() => resource.id, { onDelete: "restrict" }),
    created_at: createdAtColumn(),
  },
  (table) => [
    uniqueIndex("udx_knowledge_node_resource_knowledge_node_id_resource_id").on(
      table.knowledge_node_id,
      table.resource_id,
    ),
    index("idx_knowledge_node_resource_knowledge_node_id").on(
      table.knowledge_node_id,
    ),
    index("idx_knowledge_node_resource_resource_id").on(table.resource_id),
  ],
);

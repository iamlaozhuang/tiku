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
    is_enabled: boolean("is_enabled").default(false).notNull(),
    created_at: createdAtColumn(),
    updated_at: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex("udx_model_provider_public_id").on(table.public_id),
    uniqueIndex("udx_model_provider_provider_key").on(table.provider_key),
    index("idx_model_provider_is_enabled").on(table.is_enabled),
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
    config_version: integer("config_version").notNull(),
    is_enabled: boolean("is_enabled").default(false).notNull(),
    timeout_second: integer("timeout_second").notNull(),
    max_retry_count: integer("max_retry_count").default(0).notNull(),
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
    template_content: text("template_content").notNull(),
    template_hash: text("template_hash").notNull(),
    is_active: boolean("is_active").default(false).notNull(),
    created_at: createdAtColumn(),
    updated_at: updatedAtColumn(),
    archived_at: nullableTimestampColumn("archived_at"),
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

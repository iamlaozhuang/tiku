import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
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
  vector,
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

// Avoid importing student-experience here because paper -> ai-rag already owns a schema dependency.
const answerRecordReference = pgTable("answer_record", {
  id: bigint("id", { mode: "number" }).primaryKey(),
});

// Avoid importing paper here because paper -> ai-rag already owns a schema dependency.
const questionReference = pgTable("question", {
  id: bigint("id", { mode: "number" }).primaryKey(),
});

export const aiFuncTypeValues = [
  "scoring",
  "explanation",
  "hint",
  "kn_recommendation",
  "learning_suggestion",
  "ai_question_generation",
  "ai_paper_generation",
] as const;

export const aiFuncTypeEnum = pgEnum("ai_func_type", aiFuncTypeValues);

export const aiCallStatusValues = ["success", "failed"] as const;

export const aiCallStatusDatabaseValues = [
  "running",
  ...aiCallStatusValues,
] as const;

export const aiCallStatusEnum = pgEnum(
  "ai_call_status",
  aiCallStatusDatabaseValues,
);

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

export const aiScoringTaskStatusValues = [
  "pending",
  "running",
  "succeeded",
  "failed",
  "cancelled",
] as const;

export const aiScoringTaskStatusEnum = pgEnum(
  "ai_scoring_task_status",
  aiScoringTaskStatusValues,
);

export const aiGenerationTaskTypeValues = [
  "ai_question_generation",
  "ai_paper_generation",
  "organization_training_generation",
] as const;

export const aiGenerationTaskTypeEnum = pgEnum(
  "ai_generation_task_type",
  aiGenerationTaskTypeValues,
);

export const aiGenerationTaskStatusValues = [
  "pending",
  "running",
  "succeeded",
  "failed",
  "cancelled",
] as const;

export const aiGenerationTaskStatusEnum = pgEnum(
  "ai_generation_task_status",
  aiGenerationTaskStatusValues,
);

export const personalAiGenerationResultStatusValues = [
  "draft",
  "discarded",
] as const;

export const personalAiGenerationResultStatusEnum = pgEnum(
  "personal_ai_generation_result_status",
  personalAiGenerationResultStatusValues,
);

export const adminAiGenerationResultStatusValues = [
  "draft",
  "discarded",
] as const;

export const adminAiGenerationResultStatusEnum = pgEnum(
  "admin_ai_generation_result_status",
  adminAiGenerationResultStatusValues,
);

export const aiGenerationTaskFailureCategoryValues = [
  "system_error",
  "provider_temporary_error",
  "network_error",
  "rate_limited",
  "rag_temporary_error",
  "running_timeout",
  "invalid_input",
  "authorization_missing",
  "authorization_invalid",
  "edition_not_allowed",
  "quota_insufficient",
  "scope_forbidden",
  "configuration_missing",
  "production_enablement_blocked",
] as const;

export const aiGenerationTaskFailureCategoryEnum = pgEnum(
  "ai_generation_task_failure_category",
  aiGenerationTaskFailureCategoryValues,
);

export const evidenceStatusValues = ["sufficient", "weak", "none"] as const;

export const evidenceStatusEnum = pgEnum(
  "evidence_status",
  evidenceStatusValues,
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

export const resourceUploadOperationStatusValues = [
  "pending",
  "file_stored",
  "completed",
  "failed",
] as const;

export const resourceUploadOperationStatusEnum = pgEnum(
  "resource_upload_operation_status",
  resourceUploadOperationStatusValues,
);

export const resourceCleanupJobStatusValues = [
  "pending",
  "processing",
  "failed",
  "completed",
  "cancelled",
] as const;

export const resourceCleanupJobStatusEnum = pgEnum(
  "resource_cleanup_job_status",
  resourceCleanupJobStatusValues,
);

export const knStatusValues = ["active", "disabled"] as const;

export const knStatusEnum = pgEnum("kn_status", knStatusValues);

export const resourceIndexGenerationStatusValues = [
  "pending",
  "indexing",
  "ready",
  "failed",
  "superseded",
] as const;

export const resourceIndexGenerationStatusEnum = pgEnum(
  "resource_index_generation_status",
  resourceIndexGenerationStatusValues,
);

export const knRecommendationTaskStatusValues = [
  "pending",
  "running",
  "succeeded",
  "failed",
  "superseded",
] as const;

export const knRecommendationTaskStatusEnum = pgEnum(
  "kn_recommendation_task_status",
  knRecommendationTaskStatusValues,
);

export const knRecommendationReviewStatusValues = [
  "pending",
  "confirmed",
  "ignored",
] as const;

export const knRecommendationReviewStatusEnum = pgEnum(
  "kn_recommendation_review_status",
  knRecommendationReviewStatusValues,
);

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
    pricing_version: text("pricing_version"),
    input_token_price_cny_per_million: numeric(
      "input_token_price_cny_per_million",
      { precision: 18, scale: 6 },
    ),
    output_token_price_cny_per_million: numeric(
      "output_token_price_cny_per_million",
      { precision: 18, scale: 6 },
    ),
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
    check(
      "model_config_pricing_tuple_check",
      sql`(
        ${table.pricing_version} is null
        and ${table.input_token_price_cny_per_million} is null
        and ${table.output_token_price_cny_per_million} is null
      ) or (
        ${table.pricing_version} is not null
        and ${table.input_token_price_cny_per_million} is not null
        and ${table.output_token_price_cny_per_million} is not null
        and ${table.input_token_price_cny_per_million} >= 0
        and ${table.output_token_price_cny_per_million} >= 0
      )`,
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
    organization_public_id: text("organization_public_id"),
    profession: professionEnum("profession"),
    level: integer("level"),
    answer_record_public_id: text("answer_record_public_id"),
    mock_exam_public_id: text("mock_exam_public_id"),
    question_public_id: text("question_public_id"),
    ai_func_type: aiFuncTypeEnum("ai_func_type").notNull(),
    call_status: aiCallStatusEnum("call_status")
      .$type<(typeof aiCallStatusValues)[number]>()
      .notNull(),
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
    estimated_cost_cny: numeric("estimated_cost_cny", {
      precision: 18,
      scale: 6,
    }),
    latency_ms: integer("latency_ms"),
    observation_schema_version: integer("observation_schema_version"),
    token_count_source: text("token_count_source"),
    token_estimation_method: text("token_estimation_method"),
    latency_source: text("latency_source"),
    started_at: timestampColumn("started_at"),
    completed_at: nullableTimestampColumn("completed_at"),
    created_at: createdAtColumn(),
  },
  (table) => [
    uniqueIndex("udx_ai_call_log_public_id").on(table.public_id),
    index("idx_ai_call_log_user_public_id").on(table.user_public_id),
    index("idx_ai_call_log_organization_public_id").on(
      table.organization_public_id,
    ),
    index("idx_ai_call_log_profession_level").on(table.profession, table.level),
    index("idx_ai_call_log_answer_record_public_id").on(
      table.answer_record_public_id,
    ),
    index("idx_ai_call_log_model_config_id").on(table.model_config_id),
    index("idx_ai_call_log_ai_func_type_call_status").on(
      table.ai_func_type,
      table.call_status,
    ),
    index("idx_ai_call_log_started_at").on(table.started_at),
    check(
      "chk_ai_call_log_observation_v1",
      sql`(
        ${table.observation_schema_version} is null
        and ${table.token_count_source} is null
        and ${table.token_estimation_method} is null
        and ${table.latency_source} is null
      ) or (
        ${table.observation_schema_version} is not null
        and ${table.observation_schema_version} = 1
        and ${table.token_count_source} is not null
        and ${table.latency_source} is not null
        and (
          (
            ${table.token_count_source} = 'unavailable'
            and ${table.token_estimation_method} is null
            and ${table.prompt_token_count} is null
            and ${table.completion_token_count} is null
            and ${table.total_token_count} is null
            and ${table.estimated_cost_cny} is null
          ) or (
            ${table.token_count_source} = 'provider_reported'
            and ${table.token_estimation_method} is null
            and ${table.prompt_token_count} is not null
            and ${table.completion_token_count} is not null
            and ${table.total_token_count} is not null
            and ${table.prompt_token_count} between 0 and 2147483647
            and ${table.completion_token_count} between 0 and 2147483647
            and ${table.total_token_count} between 0 and 2147483647
            and ${table.total_token_count} = ${table.prompt_token_count} + ${table.completion_token_count}
          ) or (
            ${table.token_count_source} = 'estimated'
            and ${table.token_estimation_method} is not null
            and ${table.token_estimation_method} = 'canonical_json_unicode_code_point_ceiling_v1'
            and ${table.prompt_token_count} is not null
            and ${table.completion_token_count} is not null
            and ${table.total_token_count} is not null
            and ${table.prompt_token_count} between 0 and 2147483647
            and ${table.completion_token_count} between 0 and 2147483647
            and ${table.total_token_count} between 0 and 2147483647
            and ${table.total_token_count} = ${table.prompt_token_count} + ${table.completion_token_count}
          )
        )
        and (
          (${table.latency_source} = 'unavailable' and ${table.latency_ms} is null)
          or (
            ${table.latency_source} in ('provider_reported', 'client_observed')
            and ${table.latency_ms} is not null
            and ${table.latency_ms} between 0 and 2147483647
          )
        )
      )`,
    ),
  ],
);

export const aiScoringTask = pgTable(
  "ai_scoring_task",
  {
    id: idColumn(),
    public_id: text("public_id").notNull(),
    answer_record_id: bigint("answer_record_id", { mode: "number" }).notNull(),
    mock_exam_public_id: text("mock_exam_public_id").notNull(),
    actor_public_id: text("actor_public_id").notNull(),
    idempotency_key_hash: text("idempotency_key_hash").notNull(),
    task_status: aiScoringTaskStatusEnum("task_status")
      .default("pending")
      .notNull(),
    attempt_count: integer("attempt_count").default(0).notNull(),
    max_attempt_count: integer("max_attempt_count").default(3).notNull(),
    timeout_second: integer("timeout_second").default(60).notNull(),
    model_config_snapshot: jsonb("model_config_snapshot").notNull(),
    prompt_template_key: text("prompt_template_key").notNull(),
    prompt_template_version: integer("prompt_template_version").notNull(),
    prompt_template_hash: text("prompt_template_hash").notNull(),
    input_snapshot: jsonb("input_snapshot").notNull(),
    authorization_snapshot: jsonb("authorization_snapshot").notNull(),
    rag_snapshot: jsonb("rag_snapshot"),
    result_snapshot: jsonb("result_snapshot"),
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
      columns: [table.answer_record_id],
      foreignColumns: [answerRecordReference.id],
      name: "fk_ai_scoring_task_answer_record",
    }).onDelete("restrict"),
    foreignKey({
      columns: [table.ai_call_log_id],
      foreignColumns: [aiCallLog.id],
      name: "fk_ai_scoring_task_ai_call_log",
    }).onDelete("set null"),
    check(
      "chk_ai_scoring_task_attempt_count",
      sql`${table.attempt_count} >= 0 and ${table.attempt_count} <= ${table.max_attempt_count}`,
    ),
    check(
      "chk_ai_scoring_task_max_attempt_count",
      sql`${table.max_attempt_count} = 3`,
    ),
    check(
      "chk_ai_scoring_task_timeout_second",
      sql`${table.timeout_second} = 60`,
    ),
    uniqueIndex("udx_ai_scoring_task_public_id").on(table.public_id),
    uniqueIndex("udx_ai_scoring_task_answer_record_id").on(
      table.answer_record_id,
    ),
    uniqueIndex("udx_ai_scoring_task_answer_record_id_idempotency_key_hash").on(
      table.answer_record_id,
      table.idempotency_key_hash,
    ),
    index("idx_ai_scoring_task_answer_record_id").on(table.answer_record_id),
    index("idx_ai_scoring_task_task_status_scheduled_at").on(
      table.task_status,
      table.scheduled_at,
    ),
    index("idx_ai_scoring_task_lease_expires_at").on(table.lease_expires_at),
    index("idx_ai_scoring_task_mock_exam_public_id_task_status").on(
      table.mock_exam_public_id,
      table.task_status,
    ),
  ],
);

export const aiScoringAttempt = pgTable(
  "ai_scoring_attempt",
  {
    id: idColumn(),
    answer_record_id: bigint("answer_record_id", { mode: "number" })
      .notNull()
      .references(() => answerRecordReference.id, { onDelete: "cascade" }),
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

export const aiGenerationTask = pgTable(
  "ai_generation_task",
  {
    id: idColumn(),
    public_id: text("public_id").notNull(),
    request_public_id: text("request_public_id").notNull(),
    task_type: aiGenerationTaskTypeEnum("task_type").notNull(),
    ai_func_type: aiFuncTypeEnum("ai_func_type"),
    authorization_public_id: text("authorization_public_id").notNull(),
    actor_public_id: text("actor_public_id").notNull(),
    owner_type: text("owner_type").notNull(),
    owner_public_id: text("owner_public_id").notNull(),
    organization_public_id: text("organization_public_id"),
    quota_owner_type: text("quota_owner_type").notNull(),
    quota_owner_public_id: text("quota_owner_public_id").notNull(),
    effective_edition: text("effective_edition").notNull(),
    question_public_id: text("question_public_id"),
    answer_record_public_id: text("answer_record_public_id"),
    paper_public_id: text("paper_public_id"),
    mock_exam_public_id: text("mock_exam_public_id"),
    idempotency_key_hash: text("idempotency_key_hash").notNull(),
    generation_snapshot_version: integer("generation_snapshot_version"),
    generation_input_snapshot: jsonb("generation_input_snapshot"),
    generation_constraint_snapshot: jsonb("generation_constraint_snapshot"),
    generation_snapshot_digest: text("generation_snapshot_digest"),
    task_status: aiGenerationTaskStatusEnum("task_status")
      .default("pending")
      .notNull(),
    retry_count: integer("retry_count").default(0).notNull(),
    failure_category: aiGenerationTaskFailureCategoryEnum("failure_category"),
    result_public_id: text("result_public_id"),
    evidence_status: evidenceStatusEnum("evidence_status")
      .default("none")
      .notNull(),
    citation_count: integer("citation_count").default(0).notNull(),
    is_authorization_active: boolean("is_authorization_active")
      .default(false)
      .notNull(),
    is_scope_allowed: boolean("is_scope_allowed").default(false).notNull(),
    is_quota_available: boolean("is_quota_available").default(false).notNull(),
    is_runtime_config_ready: boolean("is_runtime_config_ready")
      .default(false)
      .notNull(),
    ai_call_log_id: bigint("ai_call_log_id", {
      mode: "number",
    }).references(() => aiCallLog.id, { onDelete: "set null" }),
    ai_call_log_public_id: text("ai_call_log_public_id"),
    requested_at: timestampColumn("requested_at").defaultNow(),
    started_at: nullableTimestampColumn("started_at"),
    finished_at: nullableTimestampColumn("finished_at"),
    created_at: createdAtColumn(),
    updated_at: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex("udx_ai_generation_task_public_id").on(table.public_id),
    uniqueIndex("udx_ai_generation_task_request_public_id").on(
      table.request_public_id,
    ),
    uniqueIndex(
      "udx_ai_generation_task_owner_public_id_idempotency_key_hash",
    ).on(table.owner_public_id, table.idempotency_key_hash),
    index("idx_ai_generation_task_owner_public_id_requested_at").on(
      table.owner_public_id,
      table.requested_at,
    ),
    index("idx_ai_generation_task_owner_public_id_task_status").on(
      table.owner_public_id,
      table.task_status,
    ),
    index("idx_ai_generation_task_ai_call_log_id").on(table.ai_call_log_id),
    check(
      "chk_ai_generation_task_snapshot_completeness",
      sql`(
        (${table.generation_snapshot_version} is null and ${table.generation_input_snapshot} is null and ${table.generation_constraint_snapshot} is null and ${table.generation_snapshot_digest} is null)
        or
        (${table.generation_snapshot_version} = 1 and ${table.generation_input_snapshot} is not null and ${table.generation_constraint_snapshot} is not null and ${table.generation_snapshot_digest} is not null)
      )`,
    ),
    check(
      "chk_ai_generation_task_snapshot_digest",
      sql`${table.generation_snapshot_digest} is null or ${table.generation_snapshot_digest} ~ '^sha256:[0-9a-f]{64}$'`,
    ),
  ],
);

export const adminAiGenerationTaskMetadata = pgTable(
  "admin_ai_generation_task_metadata",
  {
    id: idColumn(),
    public_id: text("public_id").notNull(),
    ai_generation_task_id: bigint("ai_generation_task_id", {
      mode: "number",
    }).notNull(),
    task_public_id: text("task_public_id").notNull(),
    request_public_id: text("request_public_id").notNull(),
    workspace: text("workspace").notNull(),
    generation_kind: text("generation_kind").notNull(),
    authorization_source: text("authorization_source").notNull(),
    result_kind: text("result_kind").notNull(),
    content_visibility: text("content_visibility").notNull(),
    runtime_status: text("runtime_status").notNull(),
    runtime_bridge_status: text("runtime_bridge_status").notNull(),
    provider_call_executed: boolean("provider_call_executed")
      .default(false)
      .notNull(),
    env_secret_accessed: boolean("env_secret_accessed")
      .default(false)
      .notNull(),
    provider_configuration_read: boolean("provider_configuration_read")
      .default(false)
      .notNull(),
    cost_calibration_executed: boolean("cost_calibration_executed")
      .default(false)
      .notNull(),
    question_write_status: text("question_write_status").notNull(),
    paper_write_status: text("paper_write_status").notNull(),
    source_question_public_id: text("source_question_public_id"),
    source_paper_public_id: text("source_paper_public_id"),
    redaction_status: text("redaction_status").notNull(),
    created_at: createdAtColumn(),
    updated_at: updatedAtColumn(),
  },
  (table) => [
    foreignKey({
      columns: [table.ai_generation_task_id],
      foreignColumns: [aiGenerationTask.id],
      name: "fk_admin_ai_generation_task_metadata_task",
    }).onDelete("restrict"),
    uniqueIndex("udx_admin_ai_generation_task_metadata_public_id").on(
      table.public_id,
    ),
    uniqueIndex(
      "udx_admin_ai_generation_task_metadata_ai_generation_task_id",
    ).on(table.ai_generation_task_id),
    uniqueIndex("udx_admin_ai_generation_task_metadata_task_public_id").on(
      table.task_public_id,
    ),
    index("idx_admin_ai_generation_task_metadata_workspace_generation_kind").on(
      table.workspace,
      table.generation_kind,
    ),
    index("idx_admin_ai_generation_task_metadata_runtime_bridge_status").on(
      table.runtime_bridge_status,
    ),
    index("idx_admin_ai_generation_task_metadata_request_public_id").on(
      table.request_public_id,
    ),
  ],
);

export const adminAiGenerationResult = pgTable(
  "admin_ai_generation_result",
  {
    id: idColumn(),
    public_id: text("public_id").notNull(),
    ai_generation_task_id: bigint("ai_generation_task_id", {
      mode: "number",
    }).notNull(),
    task_public_id: text("task_public_id").notNull(),
    request_public_id: text("request_public_id").notNull(),
    workspace: text("workspace").notNull(),
    generation_kind: text("generation_kind").notNull(),
    owner_type: text("owner_type").notNull(),
    owner_public_id: text("owner_public_id").notNull(),
    organization_public_id: text("organization_public_id"),
    task_type: aiGenerationTaskTypeEnum("task_type").notNull(),
    result_status: adminAiGenerationResultStatusEnum("result_status")
      .default("draft")
      .notNull(),
    content_redacted_snapshot: jsonb("content_redacted_snapshot").notNull(),
    content_digest: text("content_digest").notNull(),
    content_preview_masked: text("content_preview_masked").notNull(),
    citation_redacted_snapshot: jsonb("citation_redacted_snapshot"),
    evidence_status: evidenceStatusEnum("evidence_status")
      .default("none")
      .notNull(),
    citation_count: integer("citation_count").default(0).notNull(),
    ai_call_log_public_id: text("ai_call_log_public_id"),
    source_question_public_id: text("source_question_public_id"),
    source_paper_public_id: text("source_paper_public_id"),
    is_formal_adoption_blocked: boolean("is_formal_adoption_blocked")
      .default(true)
      .notNull(),
    current_review_draft_public_id: text("current_review_draft_public_id"),
    current_review_draft_revision: integer("current_review_draft_revision"),
    current_review_draft_digest: text("current_review_draft_digest"),
    created_at: createdAtColumn(),
    updated_at: updatedAtColumn(),
  },
  (table) => [
    foreignKey({
      columns: [table.ai_generation_task_id],
      foreignColumns: [aiGenerationTask.id],
      name: "fk_admin_ai_generation_result_task",
    }).onDelete("restrict"),
    uniqueIndex("udx_admin_ai_generation_result_public_id").on(table.public_id),
    uniqueIndex("udx_admin_ai_generation_result_ai_generation_task_id").on(
      table.ai_generation_task_id,
    ),
    index("idx_admin_ai_generation_result_workspace_owner_created_at").on(
      table.workspace,
      table.owner_type,
      table.owner_public_id,
      table.created_at,
    ),
    index("idx_admin_ai_generation_result_task_public_id").on(
      table.task_public_id,
    ),
    index("idx_admin_ai_generation_result_result_status").on(
      table.result_status,
    ),
    index("idx_admin_ai_generation_result_organization_public_id").on(
      table.organization_public_id,
    ),
    check(
      "chk_admin_ai_generation_result_review_draft_coherence",
      sql`(
        (${table.current_review_draft_public_id} is null and ${table.current_review_draft_revision} is null and ${table.current_review_draft_digest} is null)
        or
        (${table.current_review_draft_public_id} is not null and ${table.current_review_draft_revision} >= 0 and ${table.current_review_draft_digest} ~ '^sha256:[0-9a-f]{64}$')
      )`,
    ),
  ],
);

export const adminAiGenerationReviewDraft = pgTable(
  "admin_ai_generation_review_draft",
  {
    id: idColumn(),
    public_id: text("public_id").notNull(),
    admin_ai_generation_result_id: bigint("admin_ai_generation_result_id", {
      mode: "number",
    }).notNull(),
    source_result_public_id: text("source_result_public_id").notNull(),
    source_task_public_id: text("source_task_public_id").notNull(),
    target_type: text("target_type").notNull(),
    revision_number: integer("revision_number").notNull(),
    revision_origin: text("revision_origin").notNull(),
    predecessor_public_id: text("predecessor_public_id"),
    predecessor_digest: text("predecessor_digest"),
    source_content_digest: text("source_content_digest").notNull(),
    draft_snapshot: jsonb("draft_snapshot").notNull(),
    draft_digest: text("draft_digest").notNull(),
    editor_public_id: text("editor_public_id"),
    created_at: createdAtColumn(),
  },
  (table) => [
    foreignKey({
      columns: [table.admin_ai_generation_result_id],
      foreignColumns: [adminAiGenerationResult.id],
      name: "fk_admin_ai_generation_review_draft_result",
    }).onDelete("restrict"),
    uniqueIndex("udx_admin_ai_generation_review_draft_public_id").on(
      table.public_id,
    ),
    uniqueIndex("udx_admin_ai_generation_review_draft_result_revision").on(
      table.admin_ai_generation_result_id,
      table.revision_number,
    ),
    index("idx_admin_ai_generation_review_draft_source_result").on(
      table.source_result_public_id,
      table.revision_number,
    ),
    check(
      "chk_admin_ai_generation_review_draft_identity",
      sql`(
        ${table.revision_number} >= 0
        and ${table.target_type} in ('question', 'paper')
        and ${table.revision_origin} in ('generated_result', 'review_edit')
        and jsonb_typeof(${table.draft_snapshot}) = 'object'
        and ${table.source_content_digest} ~ '^sha256:[0-9a-f]{64}$'
        and ${table.draft_digest} ~ '^sha256:[0-9a-f]{64}$'
      )`,
    ),
    check(
      "chk_admin_ai_generation_review_draft_predecessor",
      sql`(
        (${table.revision_number} = 0 and ${table.predecessor_public_id} is null and ${table.predecessor_digest} is null)
        or
        (${table.revision_number} > 0 and ${table.predecessor_public_id} is not null and ${table.predecessor_digest} ~ '^sha256:[0-9a-f]{64}$')
      )`,
    ),
    check(
      "chk_admin_ai_generation_review_draft_origin",
      sql`(
        (${table.revision_origin} = 'generated_result' and ${table.revision_number} = 0 and ${table.editor_public_id} is null)
        or
        (${table.revision_origin} = 'review_edit' and ${table.editor_public_id} is not null)
      )`,
    ),
  ],
);

export const adminAiGenerationFormalAdoption = pgTable(
  "admin_ai_generation_formal_adoption",
  {
    id: idColumn(),
    public_id: text("public_id").notNull(),
    source_result_public_id: text("source_result_public_id").notNull(),
    source_task_public_id: text("source_task_public_id").notNull(),
    source_request_public_id: text("source_request_public_id").notNull(),
    workspace: text("workspace").notNull(),
    generation_kind: text("generation_kind").notNull(),
    owner_type: text("owner_type").notNull(),
    owner_public_id: text("owner_public_id").notNull(),
    organization_public_id: text("organization_public_id"),
    target_type: text("target_type").notNull(),
    target_domain: text("target_domain").notNull(),
    review_status: text("review_status").notNull(),
    formal_target_write_status: text("formal_target_write_status").notNull(),
    formal_question_public_id: text("formal_question_public_id"),
    formal_paper_public_id: text("formal_paper_public_id"),
    reviewer_public_id: text("reviewer_public_id").notNull(),
    reviewed_at: timestampColumn("reviewed_at"),
    content_digest: text("content_digest").notNull(),
    content_preview_masked: text("content_preview_masked").notNull(),
    evidence_status: evidenceStatusEnum("evidence_status")
      .default("none")
      .notNull(),
    citation_count: integer("citation_count").default(0).notNull(),
    ai_call_log_public_id: text("ai_call_log_public_id"),
    knowledge_node_candidate_snapshot: jsonb(
      "knowledge_node_candidate_snapshot",
    ),
    knowledge_node_candidate_digest: text("knowledge_node_candidate_digest"),
    knowledge_node_resolution_snapshot: jsonb(
      "knowledge_node_resolution_snapshot",
    ),
    knowledge_node_resolution_digest: text("knowledge_node_resolution_digest"),
    review_draft_public_id: text("review_draft_public_id"),
    review_draft_revision: integer("review_draft_revision"),
    review_draft_digest: text("review_draft_digest"),
    created_at: createdAtColumn(),
    updated_at: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex("udx_admin_ai_generation_formal_adoption_public_id").on(
      table.public_id,
    ),
    uniqueIndex("udx_admin_ai_generation_formal_adoption_source_target").on(
      table.source_result_public_id,
      table.target_type,
      table.target_domain,
    ),
    index("idx_admin_ai_generation_formal_adoption_source_result").on(
      table.source_result_public_id,
    ),
    index("idx_admin_ai_generation_formal_adoption_reviewer").on(
      table.reviewer_public_id,
    ),
    index("idx_admin_ai_generation_formal_adoption_write_status").on(
      table.formal_target_write_status,
    ),
    index("idx_admin_ai_generation_formal_adoption_created_at").on(
      table.created_at,
    ),
    check(
      "chk_admin_ai_formal_adoption_kn_resolution_coherence",
      sql`(
        (${table.knowledge_node_candidate_snapshot} is null and ${table.knowledge_node_candidate_digest} is null and ${table.knowledge_node_resolution_snapshot} is null and ${table.knowledge_node_resolution_digest} is null)
        or
        (${table.knowledge_node_candidate_snapshot} is not null and jsonb_typeof(${table.knowledge_node_candidate_snapshot}) = 'object' and ${table.knowledge_node_candidate_digest} is not null and ${table.knowledge_node_resolution_snapshot} is not null and jsonb_typeof(${table.knowledge_node_resolution_snapshot}) = 'object' and ${table.knowledge_node_resolution_digest} is not null)
      )`,
    ),
    check(
      "chk_admin_ai_formal_adoption_kn_digest_format",
      sql`(
        (${table.knowledge_node_candidate_digest} is null or ${table.knowledge_node_candidate_digest} ~ '^sha256:[0-9a-f]{64}$')
        and
        (${table.knowledge_node_resolution_digest} is null or ${table.knowledge_node_resolution_digest} ~ '^sha256:[0-9a-f]{64}$')
      )`,
    ),
    check(
      "chk_admin_ai_formal_adoption_review_draft_coherence",
      sql`(
        (${table.review_draft_public_id} is null and ${table.review_draft_revision} is null and ${table.review_draft_digest} is null)
        or
        (${table.review_draft_public_id} is not null and ${table.review_draft_revision} >= 0 and ${table.review_draft_digest} ~ '^sha256:[0-9a-f]{64}$')
      )`,
    ),
  ],
);

export const personalAiGenerationResult = pgTable(
  "personal_ai_generation_result",
  {
    id: idColumn(),
    public_id: text("public_id").notNull(),
    ai_generation_task_id: bigint("ai_generation_task_id", {
      mode: "number",
    }).notNull(),
    task_public_id: text("task_public_id").notNull(),
    request_public_id: text("request_public_id").notNull(),
    owner_public_id: text("owner_public_id").notNull(),
    task_type: aiGenerationTaskTypeEnum("task_type").notNull(),
    result_status: personalAiGenerationResultStatusEnum("result_status")
      .default("draft")
      .notNull(),
    content_redacted_snapshot: jsonb("content_redacted_snapshot").notNull(),
    content_digest: text("content_digest").notNull(),
    content_preview_masked: text("content_preview_masked").notNull(),
    question_draft_schema_version: text("question_draft_schema_version"),
    question_draft_snapshot: jsonb("question_draft_snapshot"),
    question_draft_digest: text("question_draft_digest"),
    paper_question_snapshot_schema_version: text(
      "paper_question_snapshot_schema_version",
    ),
    paper_question_snapshot: jsonb("paper_question_snapshot"),
    paper_question_snapshot_digest: text("paper_question_snapshot_digest"),
    citation_redacted_snapshot: jsonb("citation_redacted_snapshot"),
    evidence_status: evidenceStatusEnum("evidence_status")
      .default("none")
      .notNull(),
    citation_count: integer("citation_count").default(0).notNull(),
    ai_call_log_public_id: text("ai_call_log_public_id"),
    is_formal_adoption_blocked: boolean("is_formal_adoption_blocked")
      .default(true)
      .notNull(),
    created_at: createdAtColumn(),
    updated_at: updatedAtColumn(),
  },
  (table) => [
    check(
      "personal_ai_generation_result_question_draft_snapshot_coherence_check",
      sql`((${table.question_draft_schema_version} is null) and (${table.question_draft_snapshot} is null) and (${table.question_draft_digest} is null)) or ((${table.question_draft_schema_version} = 'question_draft_v1') and (jsonb_typeof(${table.question_draft_snapshot}) = 'object') and (${table.question_draft_digest} ~ '^[a-f0-9]{64}$'))`,
    ),
    check(
      "personal_ai_generation_result_question_draft_task_type_check",
      sql`((${table.task_type} = 'ai_question_generation') and (((${table.question_draft_schema_version} is null) and (${table.question_draft_snapshot} is null) and (${table.question_draft_digest} is null)) or ((${table.question_draft_schema_version} is not null) and (${table.question_draft_snapshot} is not null) and (${table.question_draft_digest} is not null)))) or ((${table.task_type} <> 'ai_question_generation') and (${table.question_draft_schema_version} is null) and (${table.question_draft_snapshot} is null) and (${table.question_draft_digest} is null))`,
    ),
    check(
      "personal_ai_generation_result_paper_question_snapshot_coherence_check",
      sql`((${table.paper_question_snapshot_schema_version} is null) and (${table.paper_question_snapshot} is null) and (${table.paper_question_snapshot_digest} is null)) or ((${table.paper_question_snapshot_schema_version} = 'paper_question_snapshot_v1') and (jsonb_typeof(${table.paper_question_snapshot}) = 'object') and (${table.paper_question_snapshot_digest} ~ '^[a-f0-9]{64}$'))`,
    ),
    check(
      "personal_ai_generation_result_paper_question_snapshot_task_type_check",
      sql`((${table.task_type} = 'ai_paper_generation') and (((${table.paper_question_snapshot_schema_version} is null) and (${table.paper_question_snapshot} is null) and (${table.paper_question_snapshot_digest} is null)) or ((${table.paper_question_snapshot_schema_version} is not null) and (${table.paper_question_snapshot} is not null) and (${table.paper_question_snapshot_digest} is not null)))) or ((${table.task_type} <> 'ai_paper_generation') and (${table.paper_question_snapshot_schema_version} is null) and (${table.paper_question_snapshot} is null) and (${table.paper_question_snapshot_digest} is null))`,
    ),
    foreignKey({
      columns: [table.ai_generation_task_id],
      foreignColumns: [aiGenerationTask.id],
      name: "fk_personal_ai_generation_result_task",
    }).onDelete("restrict"),
    uniqueIndex("udx_personal_ai_generation_result_public_id").on(
      table.public_id,
    ),
    uniqueIndex("udx_personal_ai_generation_result_ai_generation_task_id").on(
      table.ai_generation_task_id,
    ),
    index("idx_personal_ai_generation_result_owner_public_id_created_at").on(
      table.owner_public_id,
      table.created_at,
    ),
    index("idx_personal_ai_generation_result_task_public_id").on(
      table.task_public_id,
    ),
    index("idx_personal_ai_generation_result_result_status").on(
      table.result_status,
    ),
  ],
);

export const personalAiLearningSession = pgTable(
  "personal_ai_learning_session",
  {
    id: idColumn(),
    public_id: text("public_id").notNull(),
    personal_ai_generation_result_id: bigint(
      "personal_ai_generation_result_id",
      {
        mode: "number",
      },
    ).notNull(),
    source_result_public_id: text("source_result_public_id").notNull(),
    source_task_public_id: text("source_task_public_id").notNull(),
    content_domain: text("content_domain").notNull(),
    owner_type: text("owner_type").notNull(),
    owner_public_id: text("owner_public_id").notNull(),
    actor_public_id: text("actor_public_id").notNull(),
    evidence_status: evidenceStatusEnum("evidence_status")
      .default("none")
      .notNull(),
    citation_count: integer("citation_count").default(0).notNull(),
    question_count: integer("question_count").default(0).notNull(),
    question_snapshot: jsonb("question_snapshot").notNull(),
    formal_write_boundary: jsonb("formal_write_boundary").notNull(),
    created_at: createdAtColumn(),
    updated_at: updatedAtColumn(),
  },
  (table) => [
    foreignKey({
      columns: [table.personal_ai_generation_result_id],
      foreignColumns: [personalAiGenerationResult.id],
      name: "fk_personal_ai_learning_session_result",
    }).onDelete("restrict"),
    uniqueIndex("udx_personal_ai_learning_session_public_id").on(
      table.public_id,
    ),
    index("idx_personal_ai_learning_session_actor_created_at").on(
      table.actor_public_id,
      table.created_at,
    ),
    index("idx_personal_ai_learning_session_owner_created_at").on(
      table.owner_public_id,
      table.created_at,
    ),
    index("idx_personal_ai_learning_session_source_result").on(
      table.source_result_public_id,
    ),
  ],
);

export const personalAiLearningAnswerFeedback = pgTable(
  "personal_ai_learning_answer_feedback",
  {
    id: idColumn(),
    public_id: text("public_id").notNull(),
    personal_ai_learning_session_id: bigint("personal_ai_learning_session_id", {
      mode: "number",
    }).notNull(),
    learning_session_public_id: text("learning_session_public_id").notNull(),
    session_question_public_id: text("session_question_public_id").notNull(),
    actor_public_id: text("actor_public_id").notNull(),
    feedback_status: text("feedback_status").notNull(),
    selected_option_labels: jsonb("selected_option_labels").notNull(),
    text_answer: text("text_answer"),
    is_correct: boolean("is_correct"),
    score: text("score"),
    max_score: text("max_score"),
    answer_feedback_snapshot: jsonb("answer_feedback_snapshot").notNull(),
    formal_write_boundary: jsonb("formal_write_boundary").notNull(),
    submitted_at: timestampColumn("submitted_at"),
    created_at: createdAtColumn(),
    updated_at: updatedAtColumn(),
  },
  (table) => [
    foreignKey({
      columns: [table.personal_ai_learning_session_id],
      foreignColumns: [personalAiLearningSession.id],
      name: "fk_personal_ai_learning_feedback_session",
    }).onDelete("cascade"),
    uniqueIndex("udx_personal_ai_learning_answer_feedback_public_id").on(
      table.public_id,
    ),
    uniqueIndex("udx_personal_ai_learning_answer_feedback_session_question").on(
      table.learning_session_public_id,
      table.session_question_public_id,
    ),
    index("idx_personal_ai_learning_answer_feedback_session").on(
      table.learning_session_public_id,
    ),
    index("idx_personal_ai_learning_answer_feedback_actor_submitted_at").on(
      table.actor_public_id,
      table.submitted_at,
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
    uniqueIndex("udx_knowledge_base_id_profession").on(
      table.id,
      table.profession,
    ),
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
    level_list: integer("level_list").array(),
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
    uniqueIndex("udx_resource_id_knowledge_base_id_profession").on(
      table.id,
      table.knowledge_base_id,
      table.profession,
    ),
    foreignKey({
      columns: [table.knowledge_base_id, table.profession],
      foreignColumns: [knowledgeBase.id, knowledgeBase.profession],
      name: "fk_resource_knowledge_base_scope",
    }).onDelete("restrict"),
    index("idx_resource_knowledge_base_id").on(table.knowledge_base_id),
    index("idx_resource_profession_level_resource_status").on(
      table.profession,
      table.level,
      table.resource_status,
    ),
    index("idx_resource_level_list").using("gin", table.level_list),
    index("idx_resource_resource_status").on(table.resource_status),
    index("idx_resource_content_hash").on(table.content_hash),
  ],
);

export const resourceUploadOperation = pgTable(
  "resource_upload_operation",
  {
    id: idColumn(),
    public_id: text("public_id").notNull(),
    actor_public_id: text("actor_public_id").notNull(),
    idempotency_key_hash: text("idempotency_key_hash").notNull(),
    request_fingerprint: text("request_fingerprint").notNull(),
    resource_public_id: text("resource_public_id").notNull(),
    object_storage_path: text("object_storage_path").notNull(),
    file_hash: text("file_hash").notNull(),
    file_size_byte: integer("file_size_byte").notNull(),
    operation_status: resourceUploadOperationStatusEnum("operation_status")
      .default("pending")
      .notNull(),
    resource_id: bigint("resource_id", { mode: "number" }).references(
      () => resource.id,
      { onDelete: "restrict" },
    ),
    last_failure_message_digest: text("last_failure_message_digest"),
    file_stored_at: nullableTimestampColumn("file_stored_at"),
    completed_at: nullableTimestampColumn("completed_at"),
    created_at: createdAtColumn(),
    updated_at: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex("udx_resource_upload_operation_public_id").on(table.public_id),
    uniqueIndex("udx_resource_upload_operation_idempotency_key_hash").on(
      table.idempotency_key_hash,
    ),
    uniqueIndex("udx_resource_upload_operation_resource_public_id").on(
      table.resource_public_id,
    ),
    uniqueIndex("udx_resource_upload_operation_resource_id").on(
      table.resource_id,
    ),
    index("idx_resource_upload_operation_status_updated_at").on(
      table.operation_status,
      table.updated_at,
    ),
  ],
);

export const resourceCleanupJob = pgTable(
  "resource_cleanup_job",
  {
    id: idColumn(),
    public_id: text("public_id").notNull(),
    source_resource_public_id: text("source_resource_public_id").notNull(),
    profession: professionEnum("profession").notNull(),
    object_storage_path: text("object_storage_path").notNull(),
    original_file_name: text("original_file_name").notNull(),
    file_size_byte: integer("file_size_byte").notNull(),
    content_hash: text("content_hash").notNull(),
    cleanup_status: resourceCleanupJobStatusEnum("cleanup_status")
      .default("pending")
      .notNull(),
    attempt_count: integer("attempt_count").default(0).notNull(),
    last_failure_message_digest: text("last_failure_message_digest"),
    claimed_at: nullableTimestampColumn("claimed_at"),
    completed_at: nullableTimestampColumn("completed_at"),
    created_at: createdAtColumn(),
    updated_at: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex("udx_resource_cleanup_job_public_id").on(table.public_id),
    uniqueIndex("udx_resource_cleanup_job_source_resource_public_id").on(
      table.source_resource_public_id,
    ),
    index("idx_resource_cleanup_job_object_storage_path").on(
      table.object_storage_path,
    ),
    index("idx_resource_cleanup_job_status_updated_at").on(
      table.cleanup_status,
      table.updated_at,
    ),
    check(
      "chk_resource_cleanup_job_attempt_count_nonnegative",
      sql`${table.attempt_count} >= 0`,
    ),
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
    uniqueIndex("udx_knowledge_node_id_knowledge_base_id_profession").on(
      table.id,
      table.knowledge_base_id,
      table.profession,
    ),
    foreignKey({
      columns: [table.knowledge_base_id, table.profession],
      foreignColumns: [knowledgeBase.id, knowledgeBase.profession],
      name: "fk_knowledge_node_knowledge_base_scope",
    }).onDelete("restrict"),
    foreignKey({
      columns: [
        table.parent_knowledge_node_id,
        table.knowledge_base_id,
        table.profession,
      ],
      foreignColumns: [table.id, table.knowledge_base_id, table.profession],
      name: "fk_knowledge_node_parent_scope",
    }).onDelete("restrict"),
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

export const resourceIndexGeneration = pgTable(
  "resource_index_generation",
  {
    id: idColumn(),
    public_id: text("public_id").notNull(),
    request_public_id: text("request_public_id").notNull(),
    resource_id: bigint("resource_id", { mode: "number" })
      .notNull()
      .references(() => resource.id, { onDelete: "restrict" }),
    source_content_hash: text("source_content_hash").notNull(),
    generation_status: resourceIndexGenerationStatusEnum("generation_status")
      .default("pending")
      .notNull(),
    embedding_model_config_id: bigint("embedding_model_config_id", {
      mode: "number",
    }).references(() => modelConfig.id, { onDelete: "restrict" }),
    embedding_dimension: integer("embedding_dimension"),
    chunk_count: integer("chunk_count").default(0).notNull(),
    is_active: boolean("is_active").default(false).notNull(),
    failure_message_digest: text("failure_message_digest"),
    started_at: nullableTimestampColumn("started_at"),
    completed_at: nullableTimestampColumn("completed_at"),
    created_at: createdAtColumn(),
    updated_at: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex("udx_resource_index_generation_public_id").on(table.public_id),
    uniqueIndex("udx_resource_index_generation_request_public_id").on(
      table.request_public_id,
    ),
    uniqueIndex("udx_resource_index_generation_id_resource_id").on(
      table.id,
      table.resource_id,
    ),
    uniqueIndex("udx_resource_index_generation_active_resource")
      .on(table.resource_id)
      .where(sql`${table.is_active} = true`),
    index("idx_resource_index_generation_resource_status").on(
      table.resource_id,
      table.generation_status,
    ),
    index("idx_resource_index_generation_model_config_id").on(
      table.embedding_model_config_id,
    ),
  ],
);

export const resourceChunk = pgTable(
  "resource_chunk",
  {
    id: idColumn(),
    public_id: text("public_id").notNull(),
    resource_index_generation_id: bigint("resource_index_generation_id", {
      mode: "number",
    }).notNull(),
    resource_id: bigint("resource_id", { mode: "number" })
      .notNull()
      .references(() => resource.id, { onDelete: "restrict" }),
    chunk_index: integer("chunk_index").notNull(),
    heading_path: jsonb("heading_path").notNull(),
    content: text("content").notNull(),
    content_hash: text("content_hash").notNull(),
    keyword_token_list: jsonb("keyword_token_list").notNull(),
    embedding: vector("embedding", { dimensions: 1536 }),
    created_at: createdAtColumn(),
  },
  (table) => [
    uniqueIndex("udx_resource_chunk_public_id").on(table.public_id),
    uniqueIndex("udx_resource_chunk_generation_chunk_index").on(
      table.resource_index_generation_id,
      table.chunk_index,
    ),
    foreignKey({
      columns: [table.resource_index_generation_id, table.resource_id],
      foreignColumns: [
        resourceIndexGeneration.id,
        resourceIndexGeneration.resource_id,
      ],
      name: "fk_resource_chunk_generation_resource",
    }).onDelete("cascade"),
    index("idx_resource_chunk_resource_id").on(table.resource_id),
    index("idx_resource_chunk_keyword_token_list").using(
      "gin",
      table.keyword_token_list,
    ),
    index("idx_resource_chunk_embedding_cosine").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops"),
    ),
  ],
);

export const knRecommendationTask = pgTable(
  "kn_recommendation_task",
  {
    id: idColumn(),
    public_id: text("public_id").notNull(),
    request_public_id: text("request_public_id").notNull(),
    question_id: bigint("question_id", { mode: "number" })
      .notNull()
      .references(() => questionReference.id, { onDelete: "restrict" }),
    question_revision_at: timestamp("question_revision_at", {
      withTimezone: true,
    }).notNull(),
    task_status: knRecommendationTaskStatusEnum("task_status")
      .default("pending")
      .notNull(),
    evidence_status: evidenceStatusEnum("evidence_status"),
    model_config_id: bigint("model_config_id", { mode: "number" }).references(
      () => modelConfig.id,
      { onDelete: "restrict" },
    ),
    prompt_template_id: bigint("prompt_template_id", {
      mode: "number",
    }).references(() => promptTemplate.id, { onDelete: "restrict" }),
    requested_by_user_public_id: text("requested_by_user_public_id"),
    failure_code: text("failure_code"),
    started_at: nullableTimestampColumn("started_at"),
    completed_at: nullableTimestampColumn("completed_at"),
    created_at: createdAtColumn(),
    updated_at: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex("udx_kn_recommendation_task_public_id").on(table.public_id),
    uniqueIndex("udx_kn_recommendation_task_request_public_id").on(
      table.request_public_id,
    ),
    uniqueIndex("udx_kn_recommendation_task_question_revision").on(
      table.question_id,
      table.question_revision_at,
    ),
    index("idx_kn_recommendation_task_status_created_at").on(
      table.task_status,
      table.created_at,
    ),
    index("idx_kn_recommendation_task_model_config_id").on(
      table.model_config_id,
    ),
  ],
);

export const knRecommendationCandidate = pgTable(
  "kn_recommendation_candidate",
  {
    id: idColumn(),
    public_id: text("public_id").notNull(),
    kn_recommendation_task_id: bigint("kn_recommendation_task_id", {
      mode: "number",
    })
      .notNull()
      .references(() => knRecommendationTask.id, { onDelete: "cascade" }),
    knowledge_node_id: bigint("knowledge_node_id", { mode: "number" })
      .notNull()
      .references(() => knowledgeNode.id, { onDelete: "restrict" }),
    rank: integer("rank").notNull(),
    confidence_basis_point: integer("confidence_basis_point").notNull(),
    reason_summary: text("reason_summary").notNull(),
    citation_snapshot: jsonb("citation_snapshot").notNull(),
    review_status: knRecommendationReviewStatusEnum("review_status")
      .default("pending")
      .notNull(),
    reviewed_by_user_public_id: text("reviewed_by_user_public_id"),
    reviewed_at: nullableTimestampColumn("reviewed_at"),
    created_at: createdAtColumn(),
    updated_at: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex("udx_kn_recommendation_candidate_public_id").on(
      table.public_id,
    ),
    uniqueIndex("udx_kn_recommendation_candidate_task_node").on(
      table.kn_recommendation_task_id,
      table.knowledge_node_id,
    ),
    uniqueIndex("udx_kn_recommendation_candidate_task_rank").on(
      table.kn_recommendation_task_id,
      table.rank,
    ),
    index("idx_kn_recommendation_candidate_review_status").on(
      table.review_status,
    ),
  ],
);

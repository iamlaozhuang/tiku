import {
  bigint,
  boolean,
  foreignKey,
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

// Avoid importing student-experience here because paper -> ai-rag already owns a schema dependency.
const answerRecordReference = pgTable("answer_record", {
  id: bigint("id", { mode: "number" }).primaryKey(),
});

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

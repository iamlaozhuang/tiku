import { getTableName } from "drizzle-orm";
import { getTableConfig } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";

import * as aiRagSchema from "./ai-rag";
import {
  aiCallLog,
  aiCallStatusValues,
  aiFuncTypeEnum,
  aiFuncTypeValues,
  aiScoringAttempt,
  aiScoringAttemptStatusValues,
  aiScoringTask,
  aiScoringTaskStatusValues,
  knowledgeBase,
  knowledgeNode,
  knowledgeNodeResource,
  knStatusValues,
  modelConfig,
  modelProvider,
  promptTemplate,
  resource,
  resourceStatusValues,
  resourceTypeValues,
} from "./ai-rag";

function getColumnNames(table: Parameters<typeof getTableConfig>[0]): string[] {
  return getTableConfig(table).columns.map((column) => column.name);
}

function getColumnConfig(
  table: Parameters<typeof getTableConfig>[0],
  columnName: string,
) {
  return getTableConfig(table).columns.find(
    (column) => column.name === columnName,
  );
}

function getIndexNames(table: Parameters<typeof getTableConfig>[0]): string[] {
  return getTableConfig(table).indexes.flatMap((schemaIndex) =>
    schemaIndex.config.name ? [schemaIndex.config.name] : [],
  );
}

function getForeignKeyNames(
  table: Parameters<typeof getTableConfig>[0],
): string[] {
  return getTableConfig(table).foreignKeys.map((foreignKey) =>
    foreignKey.getName(),
  );
}

describe("AI/RAG model config and prompt template schema baseline", () => {
  it("defines the approved Phase 5 table names", () => {
    expect([
      getTableName(modelProvider),
      getTableName(modelConfig),
      getTableName(promptTemplate),
      getTableName(aiCallLog),
      getTableName(aiScoringAttempt),
      getTableName(aiScoringTask),
      getTableName(knowledgeBase),
      getTableName(resource),
      getTableName(knowledgeNode),
      getTableName(knowledgeNodeResource),
    ]).toEqual([
      "model_provider",
      "model_config",
      "prompt_template",
      "ai_call_log",
      "ai_scoring_attempt",
      "ai_scoring_task",
      "knowledge_base",
      "resource",
      "knowledge_node",
      "knowledge_node_resource",
    ]);
  });

  it("registers AI call status enum values from the glossary", () => {
    expect(aiCallStatusValues).toEqual(["success", "failed"]);
  });

  it("registers AI scoring attempt status values for retry persistence", () => {
    expect(aiScoringAttemptStatusValues).toEqual([
      "pending",
      "running",
      "succeeded",
      "failed",
      "timeout",
      "cancelled",
    ]);
  });

  it("registers durable AI scoring task lifecycle values", () => {
    expect(aiScoringTaskStatusValues).toEqual([
      "pending",
      "running",
      "succeeded",
      "failed",
      "cancelled",
    ]);
  });

  it("registers RAG resource and knowledge enum values from the glossary", () => {
    expect(resourceTypeValues).toEqual([
      "textbook",
      "courseware",
      "knowledge_doc",
      "lecture_note",
      "other",
    ]);
    expect(resourceStatusValues).toEqual([
      "uploaded",
      "converting",
      "conversion_failed",
      "draft",
      "published",
      "indexing",
      "index_failed",
      "rag_ready",
      "disabled",
    ]);
    expect(knStatusValues).toEqual(["active", "disabled"]);
  });

  it("registers the AI function type enum values from the glossary", () => {
    expect(aiFuncTypeValues).toEqual([
      "scoring",
      "explanation",
      "hint",
      "kn_recommendation",
      "learning_suggestion",
    ]);
  });

  it("keeps provider credentials behind redaction-safe metadata", () => {
    expect(getColumnNames(modelProvider)).toEqual(
      expect.arrayContaining([
        "id",
        "public_id",
        "provider_key",
        "display_name",
        "api_key_secret_ref",
        "api_key_last_four",
        "base_url",
        "secret_status",
        "last_rotated_at",
        "provider_metadata",
        "is_enabled",
        "created_at",
        "updated_at",
      ]),
    );
    expect(getIndexNames(modelProvider)).toEqual(
      expect.arrayContaining([
        "udx_model_provider_public_id",
        "udx_model_provider_provider_key",
        "idx_model_provider_is_enabled",
        "idx_model_provider_secret_status",
      ]),
    );
  });

  it("keeps model config versioned and snapshot-ready", () => {
    expect(getColumnNames(modelConfig)).toEqual(
      expect.arrayContaining([
        "id",
        "public_id",
        "model_provider_id",
        "ai_func_type",
        "model_name",
        "display_name",
        "model_alias",
        "config_version",
        "status",
        "is_enabled",
        "timeout_second",
        "max_retry_count",
        "fallback_priority",
        "snapshot_policy",
        "fallback_model_config_id",
        "created_at",
        "updated_at",
      ]),
    );
    expect(getIndexNames(modelConfig)).toEqual(
      expect.arrayContaining([
        "udx_model_config_public_id",
        "idx_model_config_model_provider_id",
        "idx_model_config_ai_func_type_is_enabled",
        "idx_model_config_ai_func_type_fallback_priority",
        "idx_model_config_fallback_model_config_id",
      ]),
    );
  });

  it("stores prompt templates by key, function type, and version", () => {
    expect(getColumnNames(promptTemplate)).toEqual(
      expect.arrayContaining([
        "id",
        "public_id",
        "prompt_template_key",
        "ai_func_type",
        "version",
        "status",
        "title",
        "description",
        "template_content",
        "template_hash",
        "body_digest",
        "body_preview_masked",
        "is_active",
        "created_at",
        "updated_at",
        "disabled_at",
      ]),
    );
    expect(getIndexNames(promptTemplate)).toEqual(
      expect.arrayContaining([
        "udx_prompt_template_public_id",
        "udx_prompt_template_key_version",
        "idx_prompt_template_ai_func_type_is_active",
        "idx_prompt_template_status",
      ]),
    );
  });

  it("stores AI call logs with redacted payload snapshots only", () => {
    expect(getColumnNames(aiCallLog)).toEqual(
      expect.arrayContaining([
        "id",
        "public_id",
        "user_public_id",
        "answer_record_public_id",
        "mock_exam_public_id",
        "question_public_id",
        "ai_func_type",
        "call_status",
        "model_config_id",
        "prompt_template_id",
        "model_config_snapshot",
        "prompt_template_key",
        "prompt_template_version",
        "request_redacted_snapshot",
        "response_redacted_snapshot",
        "error_redacted_snapshot",
        "citation_redacted_snapshot",
        "prompt_token_count",
        "completion_token_count",
        "total_token_count",
        "latency_ms",
        "started_at",
        "completed_at",
        "created_at",
      ]),
    );
    expect(getIndexNames(aiCallLog)).toEqual(
      expect.arrayContaining([
        "udx_ai_call_log_public_id",
        "idx_ai_call_log_user_public_id",
        "idx_ai_call_log_answer_record_public_id",
        "idx_ai_call_log_model_config_id",
        "idx_ai_call_log_ai_func_type_call_status",
        "idx_ai_call_log_started_at",
      ]),
    );
  });

  it("stores AI scoring retry attempts separately from answer records", () => {
    expect(getColumnNames(aiScoringAttempt)).toEqual(
      expect.arrayContaining([
        "id",
        "answer_record_id",
        "attempt_number",
        "ai_call_log_id",
        "status",
        "failure_code",
        "failure_message_digest",
        "scheduled_at",
        "started_at",
        "finished_at",
        "retry_after_at",
        "attempt_snapshot",
        "created_at",
        "updated_at",
      ]),
    );
    expect(getIndexNames(aiScoringAttempt)).toEqual(
      expect.arrayContaining([
        "idx_ai_scoring_attempt_answer_record_id",
        "idx_ai_scoring_attempt_status",
        "idx_ai_scoring_attempt_retry_after_at",
        "udx_ai_scoring_attempt_answer_record_id_attempt_number",
      ]),
    );
  });

  it("stores an immutable FIFO AI scoring task separately from attempts", () => {
    expect(getColumnNames(aiScoringTask)).toEqual(
      expect.arrayContaining([
        "id",
        "public_id",
        "answer_record_id",
        "mock_exam_public_id",
        "actor_public_id",
        "idempotency_key_hash",
        "task_status",
        "attempt_count",
        "max_attempt_count",
        "timeout_second",
        "model_config_snapshot",
        "prompt_template_key",
        "prompt_template_version",
        "prompt_template_hash",
        "input_snapshot",
        "authorization_snapshot",
        "rag_snapshot",
        "result_snapshot",
        "ai_call_log_id",
        "failure_code",
        "failure_message_digest",
        "scheduled_at",
        "claimed_at",
        "lease_expires_at",
        "worker_public_id",
        "completed_at",
        "created_at",
        "updated_at",
      ]),
    );
    expect(getColumnNames(aiScoringTask)).not.toEqual(
      expect.arrayContaining([
        "api_key",
        "api_key_secret_ref",
        "raw_prompt",
        "provider_request_payload",
        "provider_response_payload",
      ]),
    );
    expect(getIndexNames(aiScoringTask)).toEqual(
      expect.arrayContaining([
        "udx_ai_scoring_task_public_id",
        "udx_ai_scoring_task_answer_record_id",
        "udx_ai_scoring_task_answer_record_id_idempotency_key_hash",
        "idx_ai_scoring_task_answer_record_id",
        "idx_ai_scoring_task_task_status_scheduled_at",
        "idx_ai_scoring_task_lease_expires_at",
        "idx_ai_scoring_task_mock_exam_public_id_task_status",
      ]),
    );
    expect(
      [
        ...getIndexNames(aiScoringTask),
        ...getForeignKeyNames(aiScoringTask),
      ].every((databaseObjectName) => databaseObjectName.length <= 63),
    ).toBe(true);
  });

  it("stores knowledge base rows by public identifier and profession", () => {
    expect(getColumnNames(knowledgeBase)).toEqual(
      expect.arrayContaining([
        "id",
        "public_id",
        "profession",
        "display_name",
        "description",
        "is_enabled",
        "created_at",
        "updated_at",
      ]),
    );
    expect(getIndexNames(knowledgeBase)).toEqual(
      expect.arrayContaining([
        "udx_knowledge_base_public_id",
        "udx_knowledge_base_profession",
        "idx_knowledge_base_is_enabled",
      ]),
    );
  });

  it("stores RAG resources without vector columns or migration-only state", () => {
    expect(getColumnNames(resource)).toEqual(
      expect.arrayContaining([
        "id",
        "public_id",
        "knowledge_base_id",
        "resource_type",
        "resource_status",
        "title",
        "original_file_name",
        "object_storage_path",
        "content_hash",
        "file_size_byte",
        "profession",
        "level",
        "markdown_content",
        "markdown_content_hash",
        "conversion_error_message",
        "indexing_error_message",
        "is_vector_stale",
        "published_at",
        "disabled_at",
        "created_at",
        "updated_at",
      ]),
    );
    expect(getColumnNames(resource)).not.toEqual(
      expect.arrayContaining(["embedding", "vector"]),
    );
    expect(getIndexNames(resource)).toEqual(
      expect.arrayContaining([
        "udx_resource_public_id",
        "idx_resource_knowledge_base_id",
        "idx_resource_profession_level_resource_status",
        "idx_resource_resource_status",
        "idx_resource_content_hash",
      ]),
    );
  });

  it("stores knowledge nodes with hierarchy metadata and no delete-oriented flag", () => {
    expect(getColumnNames(knowledgeNode)).toEqual(
      expect.arrayContaining([
        "id",
        "public_id",
        "knowledge_base_id",
        "parent_knowledge_node_id",
        "profession",
        "level_list",
        "name",
        "path_name",
        "depth",
        "sort_order",
        "kn_status",
        "is_recommendable",
        "created_at",
        "updated_at",
        "disabled_at",
      ]),
    );
    expect(getColumnNames(knowledgeNode)).not.toContain("deleted_at");
    expect(getIndexNames(knowledgeNode)).toEqual(
      expect.arrayContaining([
        "udx_knowledge_node_public_id",
        "idx_knowledge_node_knowledge_base_id",
        "idx_knowledge_node_parent_knowledge_node_id",
        "idx_knowledge_node_profession_kn_status",
        "idx_knowledge_node_sort_order",
      ]),
    );
  });

  it("links resources to knowledge nodes with alphabetic association naming", () => {
    expect(getColumnNames(knowledgeNodeResource)).toEqual(
      expect.arrayContaining([
        "id",
        "knowledge_node_id",
        "resource_id",
        "created_at",
      ]),
    );
    expect(getIndexNames(knowledgeNodeResource)).toEqual(
      expect.arrayContaining([
        "udx_knowledge_node_resource_knowledge_node_id_resource_id",
        "idx_knowledge_node_resource_knowledge_node_id",
        "idx_knowledge_node_resource_resource_id",
      ]),
    );
  });
});

describe("personal learning AI task persistence schema", () => {
  const schemaExports = aiRagSchema as Record<string, unknown>;
  const aiGenerationTask = schemaExports.aiGenerationTask as Parameters<
    typeof getTableConfig
  >[0];

  it("registers AI generation task enum values for personal history persistence", () => {
    expect(schemaExports.aiGenerationTaskTypeValues).toEqual([
      "ai_question_generation",
      "ai_paper_generation",
      "organization_training_generation",
    ]);
    expect(schemaExports.aiGenerationTaskStatusValues).toEqual([
      "pending",
      "running",
      "succeeded",
      "failed",
      "cancelled",
    ]);
    expect(schemaExports.aiGenerationTaskFailureCategoryValues).toEqual([
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
    ]);
    expect(schemaExports.evidenceStatusValues).toEqual([
      "sufficient",
      "weak",
      "none",
    ]);
  });

  it("defines a redacted personal AI generation task table with public ids only", () => {
    expect(aiGenerationTask).toBeDefined();
    expect(getTableName(aiGenerationTask)).toBe("ai_generation_task");
    expect(getColumnNames(aiGenerationTask)).toEqual(
      expect.arrayContaining([
        "id",
        "public_id",
        "request_public_id",
        "task_type",
        "ai_func_type",
        "authorization_public_id",
        "actor_public_id",
        "owner_type",
        "owner_public_id",
        "organization_public_id",
        "quota_owner_type",
        "quota_owner_public_id",
        "effective_edition",
        "question_public_id",
        "answer_record_public_id",
        "paper_public_id",
        "mock_exam_public_id",
        "idempotency_key_hash",
        "task_status",
        "retry_count",
        "failure_category",
        "result_public_id",
        "evidence_status",
        "citation_count",
        "ai_call_log_id",
        "ai_call_log_public_id",
        "requested_at",
        "started_at",
        "finished_at",
        "created_at",
        "updated_at",
      ]),
    );
    expect(getColumnNames(aiGenerationTask)).not.toEqual(
      expect.arrayContaining([
        "prompt",
        "prompt_text",
        "provider_payload",
        "raw_answer",
        "raw_generated_content",
        "generated_content",
        "question_id",
        "paper_id",
        "practice_id",
        "mock_exam_id",
        "exam_report_id",
        "mistake_book_id",
      ]),
    );
  });

  it("adds naming-compliant indexes and ai_call_log linkage for personal task history", () => {
    expect(getIndexNames(aiGenerationTask)).toEqual(
      expect.arrayContaining([
        "udx_ai_generation_task_public_id",
        "udx_ai_generation_task_request_public_id",
        "udx_ai_generation_task_owner_public_id_idempotency_key_hash",
        "idx_ai_generation_task_owner_public_id_requested_at",
        "idx_ai_generation_task_owner_public_id_task_status",
        "idx_ai_generation_task_ai_call_log_id",
      ]),
    );
    expect(getForeignKeyNames(aiGenerationTask)).toEqual(
      expect.arrayContaining([
        "ai_generation_task_ai_call_log_id_ai_call_log_id_fk",
      ]),
    );
  });

  it("keeps personal task status values separate from scoring attempt status values", () => {
    expect(aiFuncTypeEnum).toBeDefined();
    expect(schemaExports.aiGenerationTaskStatusValues).not.toEqual(
      aiScoringAttemptStatusValues,
    );
  });
});

describe("admin AI generation task persistence schema", () => {
  const schemaExports = aiRagSchema as Record<string, unknown>;
  const aiGenerationTask = schemaExports.aiGenerationTask as Parameters<
    typeof getTableConfig
  >[0];
  const adminAiGenerationTaskMetadata =
    schemaExports.adminAiGenerationTaskMetadata as
      | Parameters<typeof getTableConfig>[0]
      | undefined;

  it("keeps shared lifecycle fields nullable for non-lossy admin AI generation tasks", () => {
    expect(getColumnConfig(aiGenerationTask, "ai_func_type")?.notNull).toBe(
      false,
    );
    expect(
      getColumnConfig(aiGenerationTask, "question_public_id")?.notNull,
    ).toBe(false);
  });

  it("defines an admin metadata companion table linked to ai_generation_task", () => {
    expect(adminAiGenerationTaskMetadata).toBeDefined();

    if (adminAiGenerationTaskMetadata === undefined) {
      return;
    }

    expect(getTableName(adminAiGenerationTaskMetadata)).toBe(
      "admin_ai_generation_task_metadata",
    );
    expect(getColumnNames(adminAiGenerationTaskMetadata)).toEqual(
      expect.arrayContaining([
        "id",
        "public_id",
        "ai_generation_task_id",
        "task_public_id",
        "request_public_id",
        "workspace",
        "generation_kind",
        "authorization_source",
        "result_kind",
        "content_visibility",
        "runtime_status",
        "runtime_bridge_status",
        "provider_call_executed",
        "env_secret_accessed",
        "provider_configuration_read",
        "cost_calibration_executed",
        "question_write_status",
        "paper_write_status",
        "source_question_public_id",
        "source_paper_public_id",
        "redaction_status",
        "created_at",
        "updated_at",
      ]),
    );
    expect(getForeignKeyNames(adminAiGenerationTaskMetadata)).toEqual(
      expect.arrayContaining(["fk_admin_ai_generation_task_metadata_task"]),
    );
  });

  it("indexes admin metadata by task, route, runtime bridge, and request references", () => {
    expect(adminAiGenerationTaskMetadata).toBeDefined();

    if (adminAiGenerationTaskMetadata === undefined) {
      return;
    }

    expect(getIndexNames(adminAiGenerationTaskMetadata)).toEqual(
      expect.arrayContaining([
        "udx_admin_ai_generation_task_metadata_public_id",
        "udx_admin_ai_generation_task_metadata_ai_generation_task_id",
        "udx_admin_ai_generation_task_metadata_task_public_id",
        "idx_admin_ai_generation_task_metadata_workspace_generation_kind",
        "idx_admin_ai_generation_task_metadata_runtime_bridge_status",
        "idx_admin_ai_generation_task_metadata_request_public_id",
      ]),
    );
    expect(
      getIndexNames(adminAiGenerationTaskMetadata).every(
        (indexName) => indexName.length <= 63,
      ),
    ).toBe(true);
  });
});

describe("personal learning AI generated content result schema", () => {
  const schemaExports = aiRagSchema as Record<string, unknown>;
  const personalAiGenerationResult =
    schemaExports.personalAiGenerationResult as
      | Parameters<typeof getTableConfig>[0]
      | undefined;

  it("registers draft-only result status values", () => {
    expect(schemaExports.personalAiGenerationResultStatusValues).toEqual([
      "draft",
      "discarded",
    ]);
  });

  it("defines a separate generated result table instead of expanding ai_generation_task", () => {
    expect(personalAiGenerationResult).toBeDefined();

    if (personalAiGenerationResult === undefined) {
      return;
    }

    expect(getTableName(personalAiGenerationResult)).toBe(
      "personal_ai_generation_result",
    );
    expect(getColumnNames(personalAiGenerationResult)).toEqual(
      expect.arrayContaining([
        "id",
        "public_id",
        "ai_generation_task_id",
        "task_public_id",
        "request_public_id",
        "owner_public_id",
        "task_type",
        "result_status",
        "content_redacted_snapshot",
        "content_digest",
        "content_preview_masked",
        "citation_redacted_snapshot",
        "evidence_status",
        "citation_count",
        "ai_call_log_public_id",
        "is_formal_adoption_blocked",
        "created_at",
        "updated_at",
      ]),
    );
  });

  it("keeps generated content candidates away from provider and formal-domain columns", () => {
    expect(personalAiGenerationResult).toBeDefined();

    if (personalAiGenerationResult === undefined) {
      return;
    }

    expect(getColumnNames(personalAiGenerationResult)).not.toEqual(
      expect.arrayContaining([
        "prompt",
        "prompt_text",
        "provider_payload",
        "raw_generated_content",
        "generated_content",
        "question_id",
        "paper_id",
        "practice_id",
        "mock_exam_id",
        "exam_report_id",
        "mistake_book_id",
        "adopted_question_id",
        "adopted_paper_id",
      ]),
    );
  });

  it("adds public-id indexes and a task foreign key for result lookup", () => {
    expect(personalAiGenerationResult).toBeDefined();

    if (personalAiGenerationResult === undefined) {
      return;
    }

    expect(getIndexNames(personalAiGenerationResult)).toEqual(
      expect.arrayContaining([
        "udx_personal_ai_generation_result_public_id",
        "udx_personal_ai_generation_result_ai_generation_task_id",
        "idx_personal_ai_generation_result_owner_public_id_created_at",
        "idx_personal_ai_generation_result_task_public_id",
        "idx_personal_ai_generation_result_result_status",
      ]),
    );
    const foreignKeyNames = getForeignKeyNames(personalAiGenerationResult);

    expect(foreignKeyNames).toEqual(
      expect.arrayContaining(["fk_personal_ai_generation_result_task"]),
    );
    expect(foreignKeyNames).not.toContain(
      "personal_ai_generation_result_ai_generation_task_id_ai_generation_task_id_fk",
    );
    expect(
      foreignKeyNames.every((foreignKeyName) => foreignKeyName.length <= 63),
    ).toBe(true);
  });
});

describe("personal AI learning session persistence schema", () => {
  const schemaExports = aiRagSchema as Record<string, unknown>;
  const personalAiLearningSession = schemaExports.personalAiLearningSession as
    | Parameters<typeof getTableConfig>[0]
    | undefined;
  const personalAiLearningAnswerFeedback =
    schemaExports.personalAiLearningAnswerFeedback as
      | Parameters<typeof getTableConfig>[0]
      | undefined;

  it("defines learner AI session and answer feedback tables separate from formal learning tables", () => {
    expect(personalAiLearningSession).toBeDefined();
    expect(personalAiLearningAnswerFeedback).toBeDefined();

    if (
      personalAiLearningSession === undefined ||
      personalAiLearningAnswerFeedback === undefined
    ) {
      return;
    }

    expect(getTableName(personalAiLearningSession)).toBe(
      "personal_ai_learning_session",
    );
    expect(getTableName(personalAiLearningAnswerFeedback)).toBe(
      "personal_ai_learning_answer_feedback",
    );
    expect(getColumnNames(personalAiLearningSession)).toEqual(
      expect.arrayContaining([
        "id",
        "public_id",
        "personal_ai_generation_result_id",
        "source_result_public_id",
        "source_task_public_id",
        "content_domain",
        "owner_type",
        "owner_public_id",
        "actor_public_id",
        "evidence_status",
        "citation_count",
        "question_count",
        "question_snapshot",
        "formal_write_boundary",
        "created_at",
        "updated_at",
      ]),
    );
    expect(getColumnNames(personalAiLearningAnswerFeedback)).toEqual(
      expect.arrayContaining([
        "id",
        "public_id",
        "personal_ai_learning_session_id",
        "learning_session_public_id",
        "session_question_public_id",
        "actor_public_id",
        "feedback_status",
        "selected_option_labels",
        "text_answer",
        "is_correct",
        "score",
        "max_score",
        "answer_feedback_snapshot",
        "formal_write_boundary",
        "submitted_at",
        "created_at",
        "updated_at",
      ]),
    );
  });

  it("keeps learner AI persistence away from formal and provider payload columns", () => {
    expect(personalAiLearningSession).toBeDefined();
    expect(personalAiLearningAnswerFeedback).toBeDefined();

    if (
      personalAiLearningSession === undefined ||
      personalAiLearningAnswerFeedback === undefined
    ) {
      return;
    }

    const forbiddenColumns = [
      "practice_id",
      "answer_record_id",
      "mock_exam_id",
      "exam_report_id",
      "mistake_book_id",
      "prompt",
      "provider_payload",
      "raw_ai_input",
      "raw_ai_output",
    ];

    expect(getColumnNames(personalAiLearningSession)).not.toEqual(
      expect.arrayContaining(forbiddenColumns),
    );
    expect(getColumnNames(personalAiLearningAnswerFeedback)).not.toEqual(
      expect.arrayContaining(forbiddenColumns),
    );
  });

  it("adds public-id indexes and bounded foreign keys for learner AI session lookup", () => {
    expect(personalAiLearningSession).toBeDefined();
    expect(personalAiLearningAnswerFeedback).toBeDefined();

    if (
      personalAiLearningSession === undefined ||
      personalAiLearningAnswerFeedback === undefined
    ) {
      return;
    }

    expect(getIndexNames(personalAiLearningSession)).toEqual(
      expect.arrayContaining([
        "udx_personal_ai_learning_session_public_id",
        "idx_personal_ai_learning_session_actor_created_at",
        "idx_personal_ai_learning_session_owner_created_at",
        "idx_personal_ai_learning_session_source_result",
      ]),
    );
    expect(getIndexNames(personalAiLearningAnswerFeedback)).toEqual(
      expect.arrayContaining([
        "udx_personal_ai_learning_answer_feedback_public_id",
        "udx_personal_ai_learning_answer_feedback_session_question",
        "idx_personal_ai_learning_answer_feedback_session",
        "idx_personal_ai_learning_answer_feedback_actor_submitted_at",
      ]),
    );
    expect(getForeignKeyNames(personalAiLearningSession)).toEqual(
      expect.arrayContaining(["fk_personal_ai_learning_session_result"]),
    );
    expect(getForeignKeyNames(personalAiLearningAnswerFeedback)).toEqual(
      expect.arrayContaining(["fk_personal_ai_learning_feedback_session"]),
    );
    expect(
      [
        ...getForeignKeyNames(personalAiLearningSession),
        ...getForeignKeyNames(personalAiLearningAnswerFeedback),
      ].every((foreignKeyName) => foreignKeyName.length <= 63),
    ).toBe(true);
  });
});

describe("admin AI generated content result schema", () => {
  const schemaExports = aiRagSchema as Record<string, unknown>;
  const adminAiGenerationResult = schemaExports.adminAiGenerationResult as
    | Parameters<typeof getTableConfig>[0]
    | undefined;

  it("registers backend admin draft-only result status values", () => {
    expect(schemaExports.adminAiGenerationResultStatusValues).toEqual([
      "draft",
      "discarded",
    ]);
  });

  it("defines a separate backend admin generated result companion table", () => {
    expect(adminAiGenerationResult).toBeDefined();

    if (adminAiGenerationResult === undefined) {
      return;
    }

    expect(getTableName(adminAiGenerationResult)).toBe(
      "admin_ai_generation_result",
    );
    expect(getColumnNames(adminAiGenerationResult)).toEqual(
      expect.arrayContaining([
        "id",
        "public_id",
        "ai_generation_task_id",
        "task_public_id",
        "request_public_id",
        "workspace",
        "generation_kind",
        "owner_type",
        "owner_public_id",
        "organization_public_id",
        "task_type",
        "result_status",
        "content_redacted_snapshot",
        "content_digest",
        "content_preview_masked",
        "citation_redacted_snapshot",
        "evidence_status",
        "citation_count",
        "ai_call_log_public_id",
        "source_question_public_id",
        "source_paper_public_id",
        "is_formal_adoption_blocked",
        "created_at",
        "updated_at",
      ]),
    );
  });

  it("keeps backend admin result storage away from raw provider and formal-domain columns", () => {
    expect(adminAiGenerationResult).toBeDefined();

    if (adminAiGenerationResult === undefined) {
      return;
    }

    expect(getColumnNames(adminAiGenerationResult)).not.toEqual(
      expect.arrayContaining([
        "prompt",
        "prompt_text",
        "provider_payload",
        "raw_generated_content",
        "generated_content",
        "question_id",
        "paper_id",
        "adopted_question_id",
        "adopted_paper_id",
      ]),
    );
  });

  it("adds scoped indexes and a task foreign key for backend admin result lookup", () => {
    expect(adminAiGenerationResult).toBeDefined();

    if (adminAiGenerationResult === undefined) {
      return;
    }

    expect(getIndexNames(adminAiGenerationResult)).toEqual(
      expect.arrayContaining([
        "udx_admin_ai_generation_result_public_id",
        "udx_admin_ai_generation_result_ai_generation_task_id",
        "idx_admin_ai_generation_result_workspace_owner_created_at",
        "idx_admin_ai_generation_result_task_public_id",
        "idx_admin_ai_generation_result_result_status",
        "idx_admin_ai_generation_result_organization_public_id",
      ]),
    );
    const foreignKeyNames = getForeignKeyNames(adminAiGenerationResult);

    expect(foreignKeyNames).toEqual(
      expect.arrayContaining(["fk_admin_ai_generation_result_task"]),
    );
    expect(
      [...getIndexNames(adminAiGenerationResult), ...foreignKeyNames].every(
        (databaseObjectName) => databaseObjectName.length <= 63,
      ),
    ).toBe(true);
  });
});

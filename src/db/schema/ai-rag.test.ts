import { getTableName } from "drizzle-orm";
import { getTableConfig } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";

import {
  aiCallLog,
  aiCallStatusValues,
  aiFuncTypeValues,
  modelConfig,
  modelProvider,
  promptTemplate,
} from "./ai-rag";

function getColumnNames(table: Parameters<typeof getTableConfig>[0]): string[] {
  return getTableConfig(table).columns.map((column) => column.name);
}

function getIndexNames(table: Parameters<typeof getTableConfig>[0]): string[] {
  return getTableConfig(table).indexes.flatMap((schemaIndex) =>
    schemaIndex.config.name ? [schemaIndex.config.name] : [],
  );
}

describe("AI/RAG model config and prompt template schema baseline", () => {
  it("defines the approved Phase 5 table names", () => {
    expect([
      getTableName(modelProvider),
      getTableName(modelConfig),
      getTableName(promptTemplate),
      getTableName(aiCallLog),
    ]).toEqual([
      "model_provider",
      "model_config",
      "prompt_template",
      "ai_call_log",
    ]);
  });

  it("registers AI call status enum values from the glossary", () => {
    expect(aiCallStatusValues).toEqual(["success", "failed"]);
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
        "config_version",
        "is_enabled",
        "timeout_second",
        "max_retry_count",
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
        "template_content",
        "template_hash",
        "is_active",
        "created_at",
        "updated_at",
      ]),
    );
    expect(getIndexNames(promptTemplate)).toEqual(
      expect.arrayContaining([
        "udx_prompt_template_public_id",
        "udx_prompt_template_key_version",
        "idx_prompt_template_ai_func_type_is_active",
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
});

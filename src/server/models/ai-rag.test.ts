import { describe, expect, it } from "vitest";

import {
  aiFuncTypeValues,
  createModelConfigSnapshot,
  type ModelConfigRow,
  type ModelProviderRow,
  type PromptTemplateRow,
} from "./ai-rag";

const createdAt = new Date("2026-05-20T08:00:00.000Z");

describe("AI/RAG domain models", () => {
  it("exports AI function types from the schema boundary", () => {
    expect(aiFuncTypeValues).toEqual([
      "scoring",
      "explanation",
      "hint",
      "kn_recommendation",
      "learning_suggestion",
    ]);
  });

  it("keeps provider, config, and template rows in snake_case storage shape", () => {
    const providerRow = {
      id: 1,
      public_id: "model_provider_public_id",
      provider_key: "qwen",
      display_name: "Qwen",
      api_key_secret_ref: "secret://model-provider/qwen",
      api_key_last_four: "1234",
      base_url: null,
      is_enabled: true,
      created_at: createdAt,
      updated_at: createdAt,
    } satisfies ModelProviderRow;

    const configRow = {
      id: 2,
      public_id: "model_config_public_id",
      model_provider_id: 1,
      ai_func_type: "scoring",
      model_name: "qwen-max",
      display_name: "Qwen Max Scoring",
      config_version: 3,
      is_enabled: true,
      timeout_second: 60,
      max_retry_count: 0,
      fallback_model_config_id: null,
      created_at: createdAt,
      updated_at: createdAt,
    } satisfies ModelConfigRow;

    const templateRow = {
      id: 3,
      public_id: "prompt_template_public_id",
      prompt_template_key: "ai_scoring_v1",
      ai_func_type: "scoring",
      version: 1,
      template_content: "Score the answer with rubric.",
      template_hash: "hash",
      is_active: true,
      created_at: createdAt,
      updated_at: createdAt,
      archived_at: null,
    } satisfies PromptTemplateRow;

    expect(providerRow).not.toHaveProperty("publicId");
    expect(configRow).not.toHaveProperty("modelProviderId");
    expect(templateRow).not.toHaveProperty("promptTemplateKey");
  });

  it("creates redaction-safe model config snapshots without provider secrets", () => {
    const snapshot = createModelConfigSnapshot({
      providerPublicId: "model_provider_public_id",
      providerKey: "qwen",
      providerDisplayName: "Qwen",
      modelConfigPublicId: "model_config_public_id",
      aiFuncType: "scoring",
      modelName: "qwen-max",
      displayName: "Qwen Max Scoring",
      configVersion: 3,
      timeoutSecond: 60,
      maxRetryCount: 0,
      fallbackModelConfigPublicId: null,
      promptTemplateKey: "ai_scoring_v1",
      promptTemplateVersion: 1,
    });

    expect(snapshot).toEqual({
      providerPublicId: "model_provider_public_id",
      providerKey: "qwen",
      providerDisplayName: "Qwen",
      modelConfigPublicId: "model_config_public_id",
      aiFuncType: "scoring",
      modelName: "qwen-max",
      displayName: "Qwen Max Scoring",
      configVersion: 3,
      timeoutSecond: 60,
      maxRetryCount: 0,
      fallbackModelConfigPublicId: null,
      promptTemplateKey: "ai_scoring_v1",
      promptTemplateVersion: 1,
    });
    expect(snapshot).not.toHaveProperty("apiKeySecretRef");
    expect(snapshot).not.toHaveProperty("apiKeyLastFour");
  });
});

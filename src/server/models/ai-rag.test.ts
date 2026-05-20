import { describe, expect, it } from "vitest";

import {
  aiCallStatusValues,
  aiFuncTypeValues,
  createAiCallLogRedactedSnapshots,
  createModelConfigSnapshot,
  type AiCallLogRow,
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

  it("exports AI call statuses from the schema boundary", () => {
    expect(aiCallStatusValues).toEqual(["success", "failed"]);
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

  it("keeps AI call log rows in snake_case storage shape", () => {
    const callLogRow = {
      id: 10,
      public_id: "ai_call_log_public_id",
      user_public_id: "user_public_id",
      answer_record_public_id: "answer_record_public_id",
      mock_exam_public_id: "mock_exam_public_id",
      question_public_id: "question_public_id",
      ai_func_type: "scoring",
      call_status: "success",
      model_config_id: 2,
      prompt_template_id: 3,
      model_config_snapshot: createModelConfigSnapshot({
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
      }),
      prompt_template_key: "ai_scoring_v1",
      prompt_template_version: 1,
      request_redacted_snapshot: { prompt: { redactionStatus: "redacted" } },
      response_redacted_snapshot: {
        modelOutput: { redactionStatus: "redacted" },
      },
      error_redacted_snapshot: null,
      citation_redacted_snapshot: { citations: [] },
      prompt_token_count: 100,
      completion_token_count: 20,
      total_token_count: 120,
      latency_ms: 800,
      started_at: createdAt,
      completed_at: createdAt,
      created_at: createdAt,
    } satisfies AiCallLogRow;

    expect(callLogRow).not.toHaveProperty("publicId");
    expect(callLogRow).not.toHaveProperty("callStatus");
    expect(callLogRow).not.toHaveProperty("modelConfigSnapshot");
  });

  it("redacts prompts, answers, model outputs, citations, and provider payload secrets", () => {
    const snapshots = createAiCallLogRedactedSnapshots({
      prompt: "prompt raw text 6e416b9a",
      userAnswer: "student answer raw text 31d38488",
      modelOutput: "model output raw text f831e674",
      citations: [
        {
          resourceTitle: "internal training handbook",
          chunkText: "citation raw text 2a2dc9a1",
        },
      ],
      providerRequestPayload: {
        headers: {
          authorization: "Bearer provider-token-4f36183b",
          "x-request-id": "request-safe-id",
        },
        body: {
          model: "qwen-max",
          messages: [{ content: "prompt raw text 6e416b9a" }],
        },
      },
      providerResponsePayload: {
        id: "provider-response-id",
        output: "model output raw text f831e674",
      },
      providerErrorPayload: {
        message: "provider failed after student answer raw text 31d38488",
        apiKey: "sk-provider-secret-9f2c210d",
      },
    });

    const serializedSnapshots = JSON.stringify(snapshots);

    expect(serializedSnapshots).not.toContain("prompt raw text 6e416b9a");
    expect(serializedSnapshots).not.toContain(
      "student answer raw text 31d38488",
    );
    expect(serializedSnapshots).not.toContain("model output raw text f831e674");
    expect(serializedSnapshots).not.toContain("citation raw text 2a2dc9a1");
    expect(serializedSnapshots).not.toContain("provider-token-4f36183b");
    expect(serializedSnapshots).not.toContain("sk-provider-secret-9f2c210d");
    expect(serializedSnapshots).toContain("request-safe-id");
    expect(snapshots.prompt.redactionStatus).toBe("redacted");
    expect(snapshots.userAnswer.redactionStatus).toBe("redacted");
    expect(snapshots.modelOutput.redactionStatus).toBe("redacted");
    expect(snapshots.providerErrorPayload).toMatchObject({
      message: { redactionStatus: "redacted" },
      apiKey: { redactionStatus: "redacted" },
    });
  });
});

import { describe, expect, it } from "vitest";

import {
  normalizeModelConfigInput,
  normalizeModelProviderInput,
  normalizePromptTemplateInput,
} from "./ai-rag";

describe("AI/RAG model config and prompt template validators", () => {
  it("normalizes provider input without retaining raw API keys", () => {
    expect(
      normalizeModelProviderInput({
        providerKey: " qwen ",
        displayName: " 通义千问 ",
        apiKey: " sk-test-123456 ",
        baseUrl: "",
        isEnabled: true,
      }),
    ).toEqual({
      providerKey: "qwen",
      displayName: "通义千问",
      apiKeyLastFour: "3456",
      baseUrl: null,
      isEnabled: true,
    });
  });

  it("rejects scoring fallback while allowing explanation fallback", () => {
    expect(
      normalizeModelConfigInput({
        modelProviderPublicId: "provider_public_id",
        aiFuncType: "scoring",
        modelName: "qwen-max",
        displayName: "Qwen Max Scoring",
        configVersion: 1,
        timeoutSecond: 60,
        maxRetryCount: 0,
        fallbackModelConfigPublicId: "fallback_public_id",
        isEnabled: true,
      }),
    ).toBeNull();

    expect(
      normalizeModelConfigInput({
        modelProviderPublicId: "provider_public_id",
        aiFuncType: "explanation",
        modelName: "qwen-plus",
        displayName: "Qwen Plus Explanation",
        configVersion: 1,
        timeoutSecond: 20,
        maxRetryCount: 2,
        fallbackModelConfigPublicId: "fallback_public_id",
        isEnabled: true,
      }),
    ).toEqual({
      modelProviderPublicId: "provider_public_id",
      aiFuncType: "explanation",
      modelName: "qwen-plus",
      displayName: "Qwen Plus Explanation",
      configVersion: 1,
      timeoutSecond: 20,
      maxRetryCount: 2,
      fallbackModelConfigPublicId: "fallback_public_id",
      isEnabled: true,
    });
  });

  it("normalizes prompt template input with a versioned key", () => {
    expect(
      normalizePromptTemplateInput({
        promptTemplateKey: " ai_hint_v1 ",
        aiFuncType: "hint",
        version: 1,
        templateContent: " Give a hint without revealing the answer. ",
        templateHash: " hash-value ",
        isActive: true,
      }),
    ).toEqual({
      promptTemplateKey: "ai_hint_v1",
      aiFuncType: "hint",
      version: 1,
      templateContent: "Give a hint without revealing the answer.",
      templateHash: "hash-value",
      isActive: true,
    });
  });
});

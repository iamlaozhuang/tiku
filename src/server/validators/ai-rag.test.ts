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
        displayName: " Qwen ",
        apiKey: " sk-test-123456 ",
        baseUrl: "",
        isEnabled: true,
      }),
    ).toEqual({
      providerKey: "qwen",
      displayName: "Qwen",
      apiKeyLastFour: "3456",
      secretStatus: "configured",
      maskedSecret: "****3456",
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
        fallbackPriority: 0,
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
        fallbackPriority: 0,
      }),
    ).toEqual({
      modelProviderPublicId: "provider_public_id",
      aiFuncType: "explanation",
      modelName: "qwen-plus",
      modelAlias: "qwen-plus",
      displayName: "Qwen Plus Explanation",
      configVersion: 1,
      timeoutSecond: 20,
      maxRetryCount: 2,
      fallbackModelConfigPublicId: "fallback_public_id",
      isEnabled: true,
      status: "enabled",
      fallbackPriority: 0,
      snapshotPolicy: "redacted_metadata",
    });
  });

  it("normalizes prompt template metadata with a versioned key", () => {
    expect(
      normalizePromptTemplateInput({
        promptTemplateKey: " ai_hint_v1 ",
        aiFuncType: "hint",
        version: 1,
        title: " Hint ",
        description: " Metadata only ",
        bodyDigest: " hash-value ",
        bodyPreviewMasked: "Give a hint [redacted].",
        isActive: true,
      }),
    ).toEqual({
      promptTemplateKey: "ai_hint_v1",
      aiFuncType: "hint",
      version: 1,
      title: "Hint",
      description: "Metadata only",
      bodyDigest: "hash-value",
      bodyPreviewMasked: "Give a hint [redacted].",
      status: "active",
      isActive: true,
    });
  });
});

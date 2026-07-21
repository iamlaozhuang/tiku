import { describe, expect, it } from "vitest";

import {
  normalizeModelConfigInput,
  normalizeModelConfigFallbackOrderInput,
  normalizeModelProviderInput,
  normalizePromptTemplateInput,
} from "./ai-rag";

describe("AI/RAG model config and prompt template validators", () => {
  it("preserves a write-only provider secret only for the service handoff", () => {
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
      secretValue: "sk-test-123456",
      hasSecretUpdate: true,
      apiKeyLastFour: "3456",
      baseUrl: null,
      isEnabled: true,
    });
  });

  it("distinguishes an omitted secret update from an explicit secret", () => {
    expect(
      normalizeModelProviderInput({
        providerKey: "qwen",
        displayName: "Qwen",
        isEnabled: false,
      }),
    ).toMatchObject({
      secretValue: null,
      hasSecretUpdate: false,
      apiKeyLastFour: null,
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
      pricingVersion: null,
      inputTokenPriceCnyPerMillion: null,
      outputTokenPriceCnyPerMillion: null,
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

  it("rejects oversized fallback reorder payloads before repository work", () => {
    const validItems = Array.from({ length: 100 }, (_, index) => ({
      publicId: `model-config-public-${String(index + 1).padStart(3, "0")}`,
      fallbackPriority: index,
    }));

    expect(
      normalizeModelConfigFallbackOrderInput({ items: validItems }),
    ).toEqual({
      items: validItems,
    });
    expect(
      normalizeModelConfigFallbackOrderInput({
        items: [
          ...validItems,
          {
            publicId: "model-config-public-101",
            fallbackPriority: 100,
          },
        ],
      }),
    ).toBeNull();
  });

  it("rejects duplicate model configs and duplicate priorities before reorder mutation", () => {
    expect(
      normalizeModelConfigFallbackOrderInput({
        items: [
          { publicId: "model-config-public-001", fallbackPriority: 10 },
          { publicId: "model-config-public-001", fallbackPriority: 20 },
        ],
      }),
    ).toBeNull();
    expect(
      normalizeModelConfigFallbackOrderInput({
        items: [
          { publicId: "model-config-public-001", fallbackPriority: 10 },
          { publicId: "model-config-public-002", fallbackPriority: 10 },
        ],
      }),
    ).toBeNull();
  });
});

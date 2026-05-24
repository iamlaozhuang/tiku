import { describe, expect, it } from "vitest";

import {
  createLocalModelConfigRuntimeCatalog,
  createModelConfigRuntimeResolver,
} from "@/server/services/model-config-runtime";

describe("phase 11 model_config fallback runtime", () => {
  it("selects the enabled primary model_config and active prompt_template snapshot", () => {
    const resolver = createModelConfigRuntimeResolver(
      createLocalModelConfigRuntimeCatalog(),
    );

    const selection = resolver.resolve({
      aiFuncType: "learning_suggestion",
      allowFallback: true,
    });

    expect(selection).toMatchObject({
      status: "selected",
      selectionReason: "primary",
      modelConfigSnapshot: {
        modelConfigPublicId: "model-config-dev-learning-suggestion",
        aiFuncType: "learning_suggestion",
        fallbackModelConfigPublicId:
          "model-config-dev-learning-suggestion-fallback",
        promptTemplateKey: "dev_learning_suggestion",
        promptTemplateVersion: 1,
      },
      promptTemplate: {
        promptTemplateKey: "dev_learning_suggestion",
        version: 1,
        templateHash: "dev-learning-suggestion-template-v1",
      },
    });
    expect(JSON.stringify(selection)).not.toContain("apiKey");
    expect(JSON.stringify(selection)).not.toContain("secret");
    expect(JSON.stringify(selection)).not.toContain("Authorization");
  });

  it("falls back only to an enabled model_config with the same ai_func_type", () => {
    const catalog = createLocalModelConfigRuntimeCatalog({
      overrides: {
        "model-config-dev-ai-explanation": { isEnabled: false },
        "model-config-dev-ai-explanation-fallback": { isEnabled: true },
        "model-config-dev-ai-hint": { isEnabled: true },
      },
    });
    const resolver = createModelConfigRuntimeResolver(catalog);

    const selection = resolver.resolve({
      aiFuncType: "explanation",
      allowFallback: true,
    });

    expect(selection).toMatchObject({
      status: "selected",
      selectionReason: "fallback",
      fallbackFromModelConfigPublicId: "model-config-dev-ai-explanation",
      modelConfigSnapshot: {
        modelConfigPublicId: "model-config-dev-ai-explanation-fallback",
        aiFuncType: "explanation",
        promptTemplateKey: "dev_ai_explanation_v1",
        promptTemplateVersion: 1,
      },
    });
  });

  it("does not auto-fallback for ai_scoring even when fallback is requested", () => {
    const resolver = createModelConfigRuntimeResolver(
      createLocalModelConfigRuntimeCatalog({
        overrides: {
          "model-config-dev-ai-scoring": {
            isEnabled: false,
            fallbackModelConfigPublicId: "model-config-dev-ai-scoring-fallback",
          },
          "model-config-dev-ai-scoring-fallback": { isEnabled: true },
        },
      }),
    );

    const selection = resolver.resolve({
      aiFuncType: "scoring",
      allowFallback: true,
    });

    expect(selection).toEqual({
      status: "unavailable",
      reason: "fallback_not_allowed_for_ai_func_type",
      primaryModelConfigPublicId: "model-config-dev-ai-scoring",
    });
  });

  it("ignores enabled fallback candidates with mismatched ai_func_type", () => {
    const resolver = createModelConfigRuntimeResolver(
      createLocalModelConfigRuntimeCatalog({
        overrides: {
          "model-config-dev-ai-explanation": {
            isEnabled: false,
            fallbackModelConfigPublicId: "model-config-dev-ai-hint",
          },
          "model-config-dev-ai-hint": { isEnabled: true },
        },
      }),
    );

    const selection = resolver.resolve({
      aiFuncType: "explanation",
      allowFallback: true,
    });

    expect(selection).toEqual({
      status: "unavailable",
      reason: "fallback_ai_func_type_mismatch",
      primaryModelConfigPublicId: "model-config-dev-ai-explanation",
      fallbackModelConfigPublicId: "model-config-dev-ai-hint",
    });
  });
});

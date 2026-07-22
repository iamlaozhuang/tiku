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
      allowFixture: true,
    });

    expect(selection).toMatchObject({
      status: "selected",
      selectionReason: "primary",
      modelConfigSnapshot: {
        modelConfigPublicId: "model-config-dev-learning-suggestion",
        aiFuncType: "learning_suggestion",
        fallbackModelConfigPublicId:
          "model-config-dev-learning-suggestion-fallback",
        promptTemplateKey: "learning_suggestion_v1",
        promptTemplateVersion: 1,
      },
      promptTemplate: {
        promptTemplateKey: "learning_suggestion_v1",
        version: 1,
        templateHash: "learning_suggestion_v1_baseline",
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
      allowFixture: true,
    });

    expect(selection).toMatchObject({
      status: "selected",
      selectionReason: "fallback",
      fallbackFromModelConfigPublicId: "model-config-dev-ai-explanation",
      modelConfigSnapshot: {
        modelConfigPublicId: "model-config-dev-ai-explanation-fallback",
        aiFuncType: "explanation",
        promptTemplateKey: "ai_explanation_v1",
        promptTemplateVersion: 1,
      },
    });
  });

  it("freezes the enabled primary and valid fallback as one immutable attempt plan", () => {
    const catalog = createLocalModelConfigRuntimeCatalog({
      overrides: {
        "model-config-dev-ai-explanation": { isEnabled: true },
        "model-config-dev-ai-explanation-fallback": { isEnabled: true },
      },
    });
    const resolver = createModelConfigRuntimeResolver(catalog);

    const plan = resolver.resolveAttemptPlan({
      aiFuncType: "explanation",
      allowFallback: true,
      allowFixture: true,
    });

    expect(plan).toMatchObject({
      status: "planned",
      attempts: [
        {
          selectionReason: "primary",
          modelConfigSnapshot: {
            modelConfigPublicId: "model-config-dev-ai-explanation",
          },
        },
        {
          selectionReason: "fallback",
          fallbackFromModelConfigPublicId: "model-config-dev-ai-explanation",
          modelConfigSnapshot: {
            modelConfigPublicId: "model-config-dev-ai-explanation-fallback",
          },
        },
      ],
    });
    expect(plan.status === "planned" ? plan.attempts : []).toHaveLength(2);

    const fallbackRecord = catalog.records.find(
      (record) =>
        record.modelConfigSnapshot.modelConfigPublicId ===
        "model-config-dev-ai-explanation-fallback",
    );

    if (fallbackRecord === undefined || plan.status !== "planned") {
      throw new Error("Expected the fallback attempt to be planned.");
    }

    fallbackRecord.modelConfigSnapshot.modelName = "changed-after-plan";
    expect(plan.attempts[1]?.modelConfigSnapshot.modelName).toBe(
      "mock-ai-explanation-fallback",
    );
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
      allowFixture: true,
    });

    expect(selection).toEqual({
      status: "unavailable",
      reason: "fallback_not_allowed_for_ai_func_type",
      primaryModelConfigPublicId: "model-config-dev-ai-scoring",
    });
  });

  it("does not create runtime attempt fallback outside explanation and hint", () => {
    const resolver = createModelConfigRuntimeResolver(
      createLocalModelConfigRuntimeCatalog({
        overrides: {
          "model-config-dev-learning-suggestion": { isEnabled: true },
          "model-config-dev-learning-suggestion-fallback": {
            isEnabled: true,
          },
        },
      }),
    );

    const plan = resolver.resolveAttemptPlan({
      aiFuncType: "learning_suggestion",
      allowFallback: true,
      allowFixture: true,
    });

    expect(plan.status === "planned" ? plan.attempts : []).toHaveLength(1);
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
      allowFixture: true,
    });

    expect(selection).toEqual({
      status: "unavailable",
      reason: "fallback_ai_func_type_mismatch",
      primaryModelConfigPublicId: "model-config-dev-ai-explanation",
      fallbackModelConfigPublicId: "model-config-dev-ai-hint",
    });
  });

  it("keeps an enabled primary as the only attempt when its configured fallback is invalid", () => {
    const resolver = createModelConfigRuntimeResolver(
      createLocalModelConfigRuntimeCatalog({
        overrides: {
          "model-config-dev-ai-explanation": {
            isEnabled: true,
            fallbackModelConfigPublicId: "model-config-dev-ai-hint",
          },
          "model-config-dev-ai-hint": { isEnabled: true },
        },
      }),
    );

    const plan = resolver.resolveAttemptPlan({
      aiFuncType: "explanation",
      allowFallback: true,
      allowFixture: true,
    });

    expect(plan).toMatchObject({
      status: "planned",
      attempts: [
        {
          selectionReason: "primary",
          modelConfigSnapshot: {
            modelConfigPublicId: "model-config-dev-ai-explanation",
          },
        },
      ],
    });
    expect(plan.status === "planned" ? plan.attempts : []).toHaveLength(1);
  });
});

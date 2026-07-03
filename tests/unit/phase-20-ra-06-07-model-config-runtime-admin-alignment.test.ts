import { describe, expect, it } from "vitest";

import type {
  ModelConfigSummaryDto,
  PromptTemplateSummaryDto,
} from "@/server/contracts/admin-ai-audit-log-ops-contract";
import {
  attachModelConfigRuntimeAlignment,
  createModelConfigRuntimeResolver,
  createPersistedModelConfigRuntimeCatalog,
} from "@/server/services/model-config-runtime";

const promptTemplates: PromptTemplateSummaryDto[] = [
  {
    publicId: "prompt-template-admin-explanation",
    promptTemplateKey: "ai_explanation_admin_v2",
    aiFuncType: "ai_explanation",
    version: 2,
    title: "Explanation template",
    description: null,
    bodyDigest: "sha256-explanation-template",
    bodyPreviewMasked: "[redacted]",
    bodyFullText: null,
    canViewFullText: false,
    requiredVariables: ["question"],
    registrationSource: "runtime_registry",
    catalogGapStatus: "registered",
    status: "active",
    isActive: true,
    updatedAt: "2026-05-31T00:00:00.000Z",
  },
];

function createModelConfig(
  overrides: Partial<ModelConfigSummaryDto>,
): ModelConfigSummaryDto {
  return {
    publicId: "model-config-admin-explanation-primary",
    providerPublicId: "model-provider-admin-local",
    providerDisplayName: "Admin Local Provider",
    providerKey: "local_mock",
    modelName: "admin-explanation-primary",
    modelAlias: "admin-explanation-primary",
    displayName: "Admin explanation primary",
    aiFuncType: "ai_explanation",
    apiKeyDisplay: "****0000",
    secretStatus: "configured",
    maskedSecret: "****0000",
    fallbackModelConfigPublicId: "model-config-admin-explanation-fallback",
    isEnabled: true,
    status: "enabled",
    fallbackPriority: 10,
    snapshotPolicy: "redacted_metadata",
    configVersion: 2,
    timeoutSecond: 8,
    maxRetryCount: 1,
    updatedAt: "2026-05-31T00:00:00.000Z",
    ...overrides,
  };
}

describe("phase 20 RA-06-07 model_config runtime admin alignment", () => {
  it("adds redaction-safe runtime selection metadata to admin model_config rows", () => {
    const alignedModelConfigs = attachModelConfigRuntimeAlignment({
      modelConfigs: [
        createModelConfig({}),
        createModelConfig({
          publicId: "model-config-admin-explanation-fallback",
          modelName: "admin-explanation-fallback",
          modelAlias: "admin-explanation-fallback",
          displayName: "Admin explanation fallback",
          fallbackModelConfigPublicId: null,
          fallbackPriority: 20,
        }),
      ],
      promptTemplates,
    });

    expect(alignedModelConfigs[0]).toMatchObject({
      runtimeAlignment: {
        isRuntimeSelected: true,
        selectionReason: "primary",
        selectedModelConfigPublicId: "model-config-admin-explanation-primary",
        fallbackFromModelConfigPublicId: null,
        unavailableReason: null,
        promptTemplateKey: "ai_explanation_admin_v2",
        promptTemplateVersion: 2,
        providerMode: "local_mock",
      },
    });
    expect(alignedModelConfigs[1]).toMatchObject({
      runtimeAlignment: {
        isRuntimeSelected: false,
        selectedModelConfigPublicId: "model-config-admin-explanation-primary",
      },
    });
    expect(
      JSON.stringify(alignedModelConfigs[0]?.runtimeAlignment),
    ).not.toContain("apiKey");
    expect(
      JSON.stringify(alignedModelConfigs[0]?.runtimeAlignment),
    ).not.toContain("****0000");
    expect(
      JSON.stringify(alignedModelConfigs[0]?.runtimeAlignment),
    ).not.toContain("bodyPreviewMasked");
  });

  it("reflects admin enable and disable state in persisted runtime selection", () => {
    const modelConfigs = [
      createModelConfig({
        isEnabled: false,
        status: "disabled",
      }),
      createModelConfig({
        publicId: "model-config-admin-explanation-fallback",
        modelName: "admin-explanation-fallback",
        modelAlias: "admin-explanation-fallback",
        displayName: "Admin explanation fallback",
        fallbackModelConfigPublicId: null,
        fallbackPriority: 20,
      }),
    ];
    const catalog = createPersistedModelConfigRuntimeCatalog({
      modelConfigs,
      promptTemplates,
    });
    const selection = createModelConfigRuntimeResolver(catalog).resolve({
      aiFuncType: "explanation",
      allowFallback: true,
    });

    expect(selection).toMatchObject({
      status: "selected",
      selectionReason: "fallback",
      fallbackFromModelConfigPublicId: "model-config-admin-explanation-primary",
      modelConfigSnapshot: {
        modelConfigPublicId: "model-config-admin-explanation-fallback",
        providerKey: "local_mock",
        promptTemplateKey: "ai_explanation_admin_v2",
      },
    });

    const alignedModelConfigs = attachModelConfigRuntimeAlignment({
      modelConfigs,
      promptTemplates,
    });

    expect(alignedModelConfigs[1]).toMatchObject({
      runtimeAlignment: {
        isRuntimeSelected: true,
        selectionReason: "fallback",
        selectedModelConfigPublicId: "model-config-admin-explanation-fallback",
        fallbackFromModelConfigPublicId:
          "model-config-admin-explanation-primary",
      },
    });
  });
});

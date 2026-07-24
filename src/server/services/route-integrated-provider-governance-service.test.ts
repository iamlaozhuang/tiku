import { describe, expect, it } from "vitest";

import {
  promptTemplateDefinitions,
  promptTemplateKeysByFuncType as activePromptTemplateKeyByAiFuncType,
} from "@/ai/prompts/templates";
import { createModelConfigSnapshot } from "../models/ai-rag";
import type { ModelConfigRuntimeCatalog } from "./model-config-runtime";
import {
  createRouteIntegratedAiCallLogInput,
  createRouteIntegratedAiCallLogReservation,
  resolveRouteIntegratedProviderGovernanceContext,
} from "./route-integrated-provider-governance-service";

const generationPromptTemplates = promptTemplateDefinitions.filter(
  (definition) =>
    definition.promptTemplateKey ===
    activePromptTemplateKeyByAiFuncType.ai_question_generation,
);
if (generationPromptTemplates.length !== 1) {
  throw new Error(
    "Expected exactly one active question generation prompt definition.",
  );
}
const generationPromptTemplate = generationPromptTemplates[0];
if (generationPromptTemplate === undefined) {
  throw new Error("Missing active question generation prompt definition.");
}
const generationPromptTemplateHash = generationPromptTemplate.templateHash;
const paperPromptTemplates = promptTemplateDefinitions.filter(
  (definition) =>
    definition.promptTemplateKey ===
    activePromptTemplateKeyByAiFuncType.ai_paper_generation,
);
if (
  paperPromptTemplates.length !== 1 ||
  paperPromptTemplates[0] === undefined
) {
  throw new Error(
    "Expected exactly one active paper generation prompt definition.",
  );
}
const paperPromptTemplate = paperPromptTemplates[0];

function createCatalog(
  overrides: Partial<ModelConfigRuntimeCatalog["records"][number]> = {},
): ModelConfigRuntimeCatalog {
  return {
    records: [
      {
        modelConfigSnapshot: createModelConfigSnapshot({
          providerPublicId: "model-provider-qwen-public-001",
          providerKey: "alibaba_qwen",
          providerDisplayName: "Alibaba Qwen",
          modelConfigPublicId: "model-config-question-public-001",
          aiFuncType: "ai_question_generation",
          modelName: "qwen3.7-max",
          displayName: "Qwen Question Generation",
          configVersion: 3,
          pricingVersion: "qwen-price-v1",
          inputTokenPriceCnyPerMillion: "1.250000",
          outputTokenPriceCnyPerMillion: "5.000000",
          timeoutSecond: 60,
          maxRetryCount: 0,
          fallbackModelConfigPublicId: null,
          promptTemplateKey: generationPromptTemplate.promptTemplateKey,
          promptTemplateVersion: generationPromptTemplate.version,
        }),
        promptTemplate: {
          promptTemplateKey: generationPromptTemplate.promptTemplateKey,
          version: generationPromptTemplate.version,
          templateHash: generationPromptTemplateHash,
        },
        isEnabled: true,
        priority: 0,
        executionMode: "governed_provider",
        ...overrides,
      },
    ],
  };
}

function createPaperCatalog(
  promptTemplate = {
    promptTemplateKey: paperPromptTemplate.promptTemplateKey,
    version: paperPromptTemplate.version,
    templateHash: paperPromptTemplate.templateHash,
  },
): ModelConfigRuntimeCatalog {
  return {
    records: [
      {
        modelConfigSnapshot: createModelConfigSnapshot({
          providerPublicId: "model-provider-qwen-public-001",
          providerKey: "alibaba_qwen",
          providerDisplayName: "Alibaba Qwen",
          modelConfigPublicId: "model-config-paper-public-001",
          aiFuncType: "ai_paper_generation",
          modelName: "qwen3.7-max",
          displayName: "Qwen Paper Generation",
          configVersion: 3,
          pricingVersion: "qwen-price-v1",
          inputTokenPriceCnyPerMillion: "1.250000",
          outputTokenPriceCnyPerMillion: "5.000000",
          timeoutSecond: 60,
          maxRetryCount: 0,
          fallbackModelConfigPublicId: null,
          promptTemplateKey: promptTemplate.promptTemplateKey,
          promptTemplateVersion: promptTemplate.version,
        }),
        promptTemplate,
        isEnabled: true,
        priority: 0,
        executionMode: "governed_provider",
      },
    ],
  };
}

describe("route-integrated Provider governance service", () => {
  it("selects only an enabled model bound to the exact versioned project prompt", () => {
    const context = resolveRouteIntegratedProviderGovernanceContext({
      taskType: "ai_question_generation",
      catalog: createCatalog(),
    });

    expect(context).toMatchObject({
      modelConfigSnapshot: {
        modelConfigPublicId: "model-config-question-public-001",
        aiFuncType: "ai_question_generation",
        promptTemplateKey: generationPromptTemplate.promptTemplateKey,
        promptTemplateVersion: generationPromptTemplate.version,
      },
      promptTemplate: {
        promptTemplateKey: generationPromptTemplate.promptTemplateKey,
        aiFuncType: "ai_question_generation",
        version: generationPromptTemplate.version,
        templateHash: generationPromptTemplateHash,
      },
    });
  });

  it("selects paper v2 and rejects the preserved inactive paper v1 provenance", () => {
    expect(
      resolveRouteIntegratedProviderGovernanceContext({
        taskType: "ai_paper_generation",
        catalog: createPaperCatalog(),
      }),
    ).toMatchObject({
      promptTemplate: {
        promptTemplateKey: "ai_paper_generation_v2",
        version: 2,
      },
    });

    const legacyPaperPrompt = promptTemplateDefinitions.find(
      (definition) => definition.promptTemplateKey === "ai_paper_generation_v1",
    );
    expect(legacyPaperPrompt?.isActive).toBe(false);
    if (legacyPaperPrompt === undefined) {
      throw new Error("Missing preserved paper v1 prompt definition.");
    }
    expect(
      resolveRouteIntegratedProviderGovernanceContext({
        taskType: "ai_paper_generation",
        catalog: createPaperCatalog({
          promptTemplateKey: legacyPaperPrompt.promptTemplateKey,
          version: legacyPaperPrompt.version,
          templateHash: legacyPaperPrompt.templateHash,
        }),
      }),
    ).toBeNull();
  });

  it("fails closed for disabled, ambiguous, wrong-type, wrong-version, or wrong-hash governance bindings", () => {
    expect(
      resolveRouteIntegratedProviderGovernanceContext({
        taskType: "ai_question_generation",
        catalog: createCatalog({ isEnabled: false }),
      }),
    ).toBeNull();
    expect(
      resolveRouteIntegratedProviderGovernanceContext({
        taskType: "ai_question_generation",
        catalog: createCatalog({
          promptTemplate: {
            promptTemplateKey: generationPromptTemplate.promptTemplateKey,
            version: generationPromptTemplate.version,
            templateHash: "stale-or-unregistered-hash",
          },
        }),
      }),
    ).toBeNull();
    const duplicateCatalog = createCatalog();
    duplicateCatalog.records.push({
      ...duplicateCatalog.records[0],
      modelConfigSnapshot: createModelConfigSnapshot({
        ...duplicateCatalog.records[0].modelConfigSnapshot,
        modelConfigPublicId: "model-config-question-public-duplicate",
      }),
    });
    expect(
      resolveRouteIntegratedProviderGovernanceContext({
        taskType: "ai_question_generation",
        catalog: duplicateCatalog,
      }),
    ).toBeNull();
    expect(
      resolveRouteIntegratedProviderGovernanceContext({
        taskType: "ai_question_generation",
        catalog: createCatalog({
          promptTemplate: {
            promptTemplateKey: "ai_paper_generation_v1",
            version: 1,
            templateHash: generationPromptTemplateHash,
          },
        }),
      }),
    ).toBeNull();
    expect(
      resolveRouteIntegratedProviderGovernanceContext({
        taskType: "ai_question_generation",
        catalog: createCatalog({
          promptTemplate: {
            promptTemplateKey: generationPromptTemplate.promptTemplateKey,
            version: generationPromptTemplate.version + 1,
            templateHash: generationPromptTemplateHash,
          },
        }),
      }),
    ).toBeNull();
  });

  it("creates redacted success and failure log inputs without prompt, chunks, output, payload, or errors", () => {
    const governanceContext = resolveRouteIntegratedProviderGovernanceContext({
      taskType: "ai_question_generation",
      catalog: createCatalog(),
    });
    expect(governanceContext).not.toBeNull();
    if (governanceContext === null) {
      throw new Error("expected governed question generation context");
    }

    const logInput = createRouteIntegratedAiCallLogInput({
      requestContext: {
        actorPublicId: "user-public-001",
        ownerType: "personal",
        ownerPublicId: "user-public-001",
        organizationPublicId: "organization-public-001",
        taskPublicId: "task-public-001",
        taskType: "ai_question_generation",
        questionPublicId: null,
        generationParameters: {
          profession: "marketing",
          level: 3,
          subject: "theory",
          knowledgeNode: null,
          knowledgeNodeMode: "balanced",
          knowledgeNodePublicIds: [],
          includeDescendants: false,
          knowledgeNodeSupplement: null,
          sourcePreference: null,
          questionType: "single_choice",
          questionCount: 5,
          difficulty: "medium",
          learningObjective: null,
        },
      },
      governanceContext,
      groundingSummary: {
        evidenceStatus: "sufficient",
        citationCount: 2,
      },
      executionSummary: {
        requestCount: 1,
        resultStatus: "pass",
        failureCategory: null,
        durationMs: 321,
        usageSummary: {
          inputTokenCount: 120,
          outputTokenCount: 40,
          totalTokenCount: 160,
        },
        providerErrorSummary: null,
        redactionStatus: "redacted",
      },
      startedAt: new Date("2026-07-22T12:00:00.000Z"),
      completedAt: new Date("2026-07-22T12:00:00.321Z"),
    });

    expect(logInput).toMatchObject({
      userPublicId: "user-public-001",
      organizationPublicId: "organization-public-001",
      profession: "marketing",
      level: 3,
      aiFuncType: "ai_question_generation",
      callStatus: "success",
      promptTemplateKey: generationPromptTemplate.promptTemplateKey,
      promptTemplateVersion: generationPromptTemplate.version,
      promptTokenCount: 120,
      completionTokenCount: 40,
      totalTokenCount: 160,
      latencyMs: 321,
      requestRedactedSnapshot: {
        taskPublicId: "task-public-001",
        taskType: "ai_question_generation",
        promptTemplateHash: generationPromptTemplateHash,
        redactionStatus: "redacted",
      },
      responseRedactedSnapshot: {
        resultStatus: "pass",
        redactionStatus: "redacted",
      },
      errorRedactedSnapshot: null,
      citationRedactedSnapshot: {
        evidenceStatus: "sufficient",
        citationCount: 2,
        redactionStatus: "redacted",
      },
    });
    const serialized = JSON.stringify(logInput);
    for (const forbidden of [
      "chunkText",
      "rawPrompt",
      "providerPayload",
      "providerResponse",
      "credential",
      "stack",
    ]) {
      expect(serialized).not.toContain(forbidden);
    }

    const preCallFailureLogInput = createRouteIntegratedAiCallLogInput({
      requestContext: {
        actorPublicId: "user-public-001",
        ownerType: "organization",
        ownerPublicId: "organization-public-001",
        organizationPublicId: "organization-public-001",
        taskPublicId: "task-public-001",
        taskType: "ai_question_generation",
        questionPublicId: null,
        generationParameters: {
          profession: "marketing",
          level: 3,
          subject: "theory",
          knowledgeNode: null,
          knowledgeNodeMode: "balanced",
          knowledgeNodePublicIds: [],
          includeDescendants: false,
          knowledgeNodeSupplement: null,
          sourcePreference: null,
          questionType: "single_choice",
          questionCount: 5,
          difficulty: "medium",
          learningObjective: null,
        },
      },
      governanceContext,
      groundingSummary: {
        evidenceStatus: "none",
        citationCount: 0,
      },
      executionSummary: {
        requestCount: 0,
        resultStatus: "fail",
        failureCategory: "missing_provider_credential",
        durationMs: 0,
        usageSummary: null,
        providerErrorSummary: null,
        redactionStatus: "redacted",
      },
      startedAt: new Date("2026-07-22T12:00:00.000Z"),
      completedAt: new Date("2026-07-22T12:00:00.000Z"),
    });

    expect(preCallFailureLogInput.observation).toMatchObject({
      tokenSource: "unavailable",
      latencySource: "unavailable",
      latencyMs: null,
    });
  });

  it("reserves one deterministic running log identity for the exact database attempt before Provider execution", () => {
    const governanceContext = resolveRouteIntegratedProviderGovernanceContext({
      taskType: "ai_question_generation",
      catalog: createCatalog(),
    });
    expect(governanceContext).not.toBeNull();
    if (governanceContext === null) {
      throw new Error("expected governed question generation context");
    }

    const requestContext = {
      actorPublicId: "user-public-001",
      ownerType: "personal" as const,
      ownerPublicId: "user-public-001",
      organizationPublicId: null,
      taskPublicId: "task-public-001",
      taskType: "ai_question_generation" as const,
      questionPublicId: null,
      generationParameters: null,
    };
    const attempt = {
      taskPublicId: "task-public-001",
      retryCount: 1,
      startedAt: new Date("2026-07-22T12:00:00.123Z"),
    };
    const input = {
      requestContext,
      governanceContext,
      groundingSummary: {
        evidenceStatus: "sufficient" as const,
        citationCount: 2,
      },
      attempt,
      startedAt: new Date("2026-07-22T12:00:01.000Z"),
    };
    const first = createRouteIntegratedAiCallLogReservation(input);
    const replay = createRouteIntegratedAiCallLogReservation(input);

    expect(first.publicId).toMatch(/^ai-call-log-generation-[a-f0-9]{64}$/u);
    expect(replay.publicId).toBe(first.publicId);
    expect(first).toMatchObject({
      callStatus: "running",
      completedAt: null,
      estimatedCostCny: null,
      promptTokenCount: null,
      completionTokenCount: null,
      totalTokenCount: null,
      requestRedactedSnapshot: {
        taskPublicId: "task-public-001",
        taskType: "ai_question_generation",
        promptTemplateHash: generationPromptTemplateHash,
        redactionStatus: "redacted",
      },
    });
  });
});

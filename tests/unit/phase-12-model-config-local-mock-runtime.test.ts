import { describe, expect, it } from "vitest";

import { createModelConfigSnapshot } from "@/server/models/ai-rag";
import { createAiMockProviderRuntime } from "@/server/services/ai-mock-provider-runtime";
import {
  createLocalModelConfigRuntimeCatalog,
  createModelConfigRuntimeResolver,
  createRedactedModelConfigRuntimeSnapshot,
} from "@/server/services/model-config-runtime";

describe("phase 12 local mock model config runtime", () => {
  it("resolves local deterministic provider metadata without secrets", () => {
    const resolver = createModelConfigRuntimeResolver(
      createLocalModelConfigRuntimeCatalog(),
    );

    const selection = resolver.resolve({
      aiFuncType: "kn_recommendation",
      allowFallback: true,
      allowFixture: true,
    });

    expect(selection).toMatchObject({
      status: "selected",
      selectionReason: "primary",
      redactedModelConfigMetadata: {
        modelConfigPublicId: "model-config-dev-kn-recommendation",
        providerPublicId: "model-provider-dev-local",
        providerKey: "local_deterministic",
        aiFuncType: "kn_recommendation",
        promptTemplateKey: "kn_recommendation_v1",
        promptTemplateVersion: 1,
        snapshotPolicy: "redacted_metadata",
        providerMode: "local_fixture",
      },
    });
    expect(JSON.stringify(selection)).not.toContain("secret");
    expect(JSON.stringify(selection)).not.toContain("apiKey");
  });

  it("adds redaction-safe model config metadata to mock ai call logs", async () => {
    const appendedInputs: unknown[] = [];
    const rawPrompt = "prompt-fixture";
    const rawAnswer = "answer-fixture";
    const rawProviderPayload = "payload-fixture";
    const modelConfigSnapshot = createModelConfigSnapshot({
      providerPublicId: "model-provider-dev-mock",
      providerKey: "mock",
      providerDisplayName: "Local Mock AI",
      modelConfigPublicId: "model-config-dev-learning-suggestion",
      aiFuncType: "learning_suggestion",
      modelName: "mock-learning-suggestion",
      displayName: "Local mock learning suggestion",
      configVersion: 1,
      timeoutSecond: 5,
      maxRetryCount: 0,
      fallbackModelConfigPublicId:
        "model-config-dev-learning-suggestion-fallback",
      promptTemplateKey: "learning_suggestion_v1",
      promptTemplateVersion: 1,
    });
    const runtime = createAiMockProviderRuntime({
      provider: {
        async generateLearningSuggestion() {
          return {
            learningSuggestion: "Use the local mock explanation.",
            providerRequestPayload: { payload: rawProviderPayload },
            providerResponsePayload: { payload: rawProviderPayload },
            promptTokenCount: 1,
            completionTokenCount: 1,
            totalTokenCount: 2,
            latencyMs: 3,
          };
        },
      },
      aiCallLogRepository: {
        async appendAiCallLog(input) {
          appendedInputs.push(input);

          return {
            publicId: "ai-call-log-public-local-mock",
            userPublicId: input.userPublicId,
            organizationPublicId: null,
            profession: null,
            level: null,
            aiFuncType: input.aiFuncType,
            callStatus: input.callStatus,
            providerDisplayName: input.modelConfigSnapshot.providerDisplayName,
            modelAlias: input.modelConfigSnapshot.modelName,
            promptSummary: "redacted prompt snapshot",
            outputSummary: "redacted model output snapshot",
            promptTokenCount: input.promptTokenCount,
            completionTokenCount: input.completionTokenCount,
            totalTokenCount: input.totalTokenCount,
            estimatedCostCny: "0.00",
            latencyMs: input.latencyMs,
            startedAt: input.startedAt.toISOString(),
            completedAt: input.completedAt?.toISOString() ?? null,
          };
        },
      },
      now: () => new Date("2026-05-26T00:00:00.000Z"),
    });

    await runtime.generateLearningSuggestion({
      userPublicId: "user-public-001",
      answerRecordPublicId: "answer-record-public-001",
      mockExamPublicId: null,
      questionPublicId: "question-public-001",
      rawPrompt,
      rawAnswer,
      modelConfigSnapshot,
      promptTemplate: {
        promptTemplateKey: "learning_suggestion_v1",
        version: 1,
        templateHash: "learning_suggestion_v1_baseline",
      },
    });

    expect(appendedInputs).toHaveLength(1);
    expect(appendedInputs[0]).toMatchObject({
      requestRedactedSnapshot: {
        modelConfig: createRedactedModelConfigRuntimeSnapshot(
          modelConfigSnapshot,
          "local_fixture",
        ),
      },
    });
    expect(JSON.stringify(appendedInputs)).not.toContain(rawPrompt);
    expect(JSON.stringify(appendedInputs)).not.toContain(rawAnswer);
    expect(JSON.stringify(appendedInputs)).not.toContain(rawProviderPayload);
    expect(JSON.stringify(appendedInputs)).not.toContain("apiKey");
  });
});

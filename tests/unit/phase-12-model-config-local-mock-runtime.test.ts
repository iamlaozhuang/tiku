import { describe, expect, it } from "vitest";

import { createModelConfigSnapshot } from "@/server/models/ai-rag";
import { createAiMockProviderRuntime } from "@/server/services/ai-mock-provider-runtime";
import type { LearningSuggestionInput } from "@/server/services/learning-suggestion-input";
import {
  createLocalModelConfigRuntimeCatalog,
  createModelConfigRuntimeResolver,
  createRedactedModelConfigRuntimeSnapshot,
} from "@/server/services/model-config-runtime";

const learningSuggestionInputPreimage = {
  schemaVersion: 1 as const,
  reportPublicId: "exam-report-public-001",
  reportRevision: 1,
  variables: {
    examReport: {
      profession: "monopoly",
      level: 3,
      subject: "theory",
      examStatus: "completed" as const,
      objectiveScore: "1.0",
      subjectiveScore: "0.0",
      totalScore: "1.0",
      durationSecond: 60,
    },
    answerRecordSummary: {
      questionCount: 1,
      wrongQuestionCount: 0,
      questionTypeSummaries: [],
      paperSectionSummaries: [],
      errorSummaries: [],
    },
    knowledgeNodeSnapshot: {
      status: "available" as const,
      weaknesses: [],
    },
  },
};
const learningSuggestionInput: LearningSuggestionInput = {
  ...learningSuggestionInputPreimage,
  inputDigest: createHash("sha256")
    .update(JSON.stringify(learningSuggestionInputPreimage))
    .digest("hex"),
};

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
    const providerInputs: unknown[] = [];
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
        async generateLearningSuggestion(input) {
          providerInputs.push(input);
          return {
            learningSuggestion: "Use the local mock explanation.",
            providerRequestPayload: { payload: rawProviderPayload },
            providerResponsePayload: { payload: rawProviderPayload },
            promptTokenCount: 1,
            completionTokenCount: 1,
            totalTokenCount: 2,
            latencyMs: 3,
            observation: {
              schemaVersion: 1,
              tokenSource: "estimated",
              tokenEstimationMethod:
                "canonical_json_unicode_code_point_ceiling_v1",
              promptTokenCount: 1,
              completionTokenCount: 1,
              totalTokenCount: 2,
              latencySource: "client_observed",
              latencyMs: 3,
            },
          };
        },
      },
      aiCallLogRepository: {
        async appendAiCallLog(input) {
          appendedInputs.push(input);
          if (input.observation === undefined) {
            throw new Error("Current observation is required.");
          }

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
            observationSchemaVersion: input.observation.schemaVersion,
            tokenCountSource: input.observation.tokenSource,
            tokenEstimationMethod: input.observation.tokenEstimationMethod,
            latencySource: input.observation.latencySource,
            startedAt: input.startedAt.toISOString(),
            completedAt: input.completedAt?.toISOString() ?? null,
          };
        },
      },
      now: () => new Date("2026-05-26T00:00:00.000Z"),
    });

    await runtime.generateLearningSuggestion({
      userPublicId: "user-public-001",
      mockExamPublicId: null,
      learningSuggestionInput,
      modelConfigSnapshot,
      promptTemplate: {
        promptTemplateKey: "learning_suggestion_v1",
        version: 1,
        templateHash: "learning_suggestion_v1_baseline",
      },
      hardTimeoutMs: 30_000,
    });

    expect(appendedInputs).toHaveLength(1);
    expect(providerInputs).toHaveLength(1);
    expect(providerInputs[0]).toMatchObject({
      rawAnswer: "",
      modelConfigSnapshot: {
        aiFuncType: "learning_suggestion",
      },
      promptTemplate: {
        promptTemplateKey: "learning_suggestion_v1",
      },
    });
    const providerInput = providerInputs[0];
    if (
      typeof providerInput !== "object" ||
      providerInput === null ||
      !("rawPrompt" in providerInput) ||
      typeof providerInput.rawPrompt !== "string"
    ) {
      throw new Error("Provider input was not captured.");
    }
    const providerVariables: unknown = JSON.parse(providerInput.rawPrompt);
    if (typeof providerVariables !== "object" || providerVariables === null) {
      throw new Error("Provider variables were not an object.");
    }
    expect(Object.keys(providerVariables)).toEqual([
      "examReport",
      "answerRecordSummary",
      "knowledgeNodeSnapshot",
    ]);
    expect(JSON.stringify(providerVariables)).not.toContain("PublicId");
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
import { createHash } from "node:crypto";

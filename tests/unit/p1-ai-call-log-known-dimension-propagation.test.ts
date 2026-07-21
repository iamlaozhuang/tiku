import { describe, expect, it } from "vitest";

import type { AppendAiCallLogInput } from "@/server/repositories/admin-ai-audit-log-runtime-repository";
import { createPersistedModelConfigRuntimeCatalog } from "@/server/services/model-config-runtime";
import { createGovernedMistakeBookAiExplanationRuntime } from "@/server/services/student-mistake-book-runtime";

describe("P1 F-0038 AI call log known dimension propagation", () => {
  it("copies authoritative mistake-book profession and level into the append input", async () => {
    const appended: AppendAiCallLogInput[] = [];
    const runtime = createGovernedMistakeBookAiExplanationRuntime({
      aiCallLogRepository: {
        async appendAiCallLog(input) {
          appended.push(input);

          return {
            publicId: "ai-call-log-public-001",
            userPublicId: input.userPublicId,
            organizationPublicId: input.organizationPublicId ?? null,
            profession: input.profession ?? null,
            level: input.level ?? null,
            aiFuncType: input.aiFuncType,
            callStatus: input.callStatus,
            providerDisplayName: input.modelConfigSnapshot.providerDisplayName,
            modelAlias: input.modelConfigSnapshot.modelName,
            promptSummary: "redacted prompt",
            outputSummary: "redacted output",
            promptTokenCount: input.promptTokenCount,
            completionTokenCount: input.completionTokenCount,
            totalTokenCount: input.totalTokenCount,
            estimatedCostCny: null,
            latencyMs: input.latencyMs,
            startedAt: input.startedAt.toISOString(),
            completedAt: input.completedAt?.toISOString() ?? null,
          };
        },
      },
      modelConfigRuntimeCatalog: createPersistedModelConfigRuntimeCatalog({
        modelConfigs: [
          {
            publicId: "model-config-explanation-001",
            providerPublicId: "model-provider-001",
            providerDisplayName: "Governed test provider",
            providerKey: "governed_test",
            modelName: "governed-explanation-model",
            modelAlias: "governed-explanation-model",
            displayName: "Governed explanation model",
            aiFuncType: "ai_explanation",
            apiKeyDisplay: null,
            secretStatus: "not_configured",
            maskedSecret: null,
            fallbackModelConfigPublicId: null,
            isEnabled: true,
            status: "enabled",
            fallbackPriority: 0,
            snapshotPolicy: "redacted_metadata",
            configVersion: 1,
            pricingVersion: null,
            inputTokenPriceCnyPerMillion: null,
            outputTokenPriceCnyPerMillion: null,
            timeoutSecond: 5,
            maxRetryCount: 0,
            updatedAt: "2026-07-21T00:00:00.000Z",
          },
        ],
        promptTemplates: [],
      }),
      explanationRunner: async () => ({
        explanationText: "Safe explanation",
        keyPoints: ["Key point"],
        learningSuggestion: null,
        providerRequestPayload: null,
        providerResponsePayload: null,
      }),
      ragRetrievalRuntime: {
        async retrieveForAiExplanation() {
          return {
            evidenceStatus: "none",
            citations: [],
            evidenceSummary: {
              evidenceStatus: "none",
              citationCount: 0,
              resourcePublicIds: [],
              chunkPublicIds: [],
              generationPublicIds: [],
              chunkIndexes: [],
              textHashes: [],
              queryHash: "dimension-propagation-test",
              maxScore: null,
              retrievalMode: "fusion_sort",
            },
          };
        },
      },
    });

    await runtime.generateObjectiveExplanation({
      userPublicId: "user-public-001",
      organizationPublicId: "organization-public-001",
      mistakeBookPublicId: "mistake-book-public-001",
      questionPublicId: "question-public-001",
      paperQuestionPublicId: "paper-question-public-001",
      questionSnapshot: {
        profession: "logistics",
        level: "4",
        stemRichText: "Question text",
      },
      learnerAnswer: "Learner answer",
      standardAnswer: "Standard answer",
      analysis: null,
      isCorrect: false,
      triggerReason: "manual_request",
    });

    expect(appended).toHaveLength(1);
    expect(appended[0]).toMatchObject({
      organizationPublicId: "organization-public-001",
      profession: "logistics",
      level: 4,
    });
  });
});

import { describe, expect, it } from "vitest";

import {
  createModelConfigRuntimeResolver,
  createPersistedModelConfigRuntimeCatalog,
} from "@/server/services/model-config-runtime";
import { createDefaultAiScoringRuntime } from "@/server/services/student-flow-runtime";

describe("phase 20 RA-04-07 persisted model_config runtime selection", () => {
  const persistedCatalog = createPersistedModelConfigRuntimeCatalog({
    modelConfigs: [
      {
        publicId: "model-config-admin-scoring",
        providerPublicId: "model-provider-admin-local",
        providerDisplayName: "Admin Local Provider",
        providerKey: "local_mock",
        modelName: "admin-managed-scoring-model",
        modelAlias: "admin-managed-scoring-model",
        displayName: "Admin managed scoring",
        aiFuncType: "ai_scoring",
        apiKeyDisplay: "****0000",
        secretStatus: "configured",
        maskedSecret: "****0000",
        fallbackModelConfigPublicId: null,
        isEnabled: true,
        status: "enabled",
        fallbackPriority: 3,
        snapshotPolicy: "redacted_metadata",
        configVersion: 7,
        timeoutSecond: 11,
        maxRetryCount: 2,
        updatedAt: "2026-05-31T00:00:00.000Z",
      },
    ],
    promptTemplates: [
      {
        publicId: "prompt-template-admin-scoring",
        promptTemplateKey: "ai_scoring_admin_v7",
        aiFuncType: "ai_scoring",
        version: 7,
        title: "Admin scoring template",
        description: null,
        bodyDigest: "sha256-admin-scoring-template",
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
    ],
  });

  it("selects admin-managed persisted model_config records for local runtime metadata", () => {
    const selection = createModelConfigRuntimeResolver(
      persistedCatalog,
    ).resolve({
      aiFuncType: "scoring",
      allowFallback: false,
    });

    expect(selection).toMatchObject({
      status: "selected",
      selectionReason: "primary",
      modelConfigSnapshot: {
        providerPublicId: "model-provider-admin-local",
        providerKey: "local_mock",
        providerDisplayName: "Admin Local Provider",
        modelConfigPublicId: "model-config-admin-scoring",
        aiFuncType: "scoring",
        modelName: "admin-managed-scoring-model",
        displayName: "Admin managed scoring",
        configVersion: 7,
        timeoutSecond: 11,
        maxRetryCount: 2,
        promptTemplateKey: "ai_scoring_admin_v7",
        promptTemplateVersion: 7,
      },
      promptTemplate: {
        promptTemplateKey: "ai_scoring_admin_v7",
        version: 7,
        templateHash: "sha256-admin-scoring-template",
      },
    });
    expect(JSON.stringify(selection)).not.toContain("apiKey");
    expect(JSON.stringify(selection)).not.toContain("****0000");
    expect(JSON.stringify(selection)).not.toContain("bodyPreviewMasked");
  });

  it("uses persisted model_config loader for default local ai scoring runtime", async () => {
    const appendedAiCallLogs: unknown[] = [];
    const appendedAiScoringAttempts: unknown[] = [];
    const runtime = createDefaultAiScoringRuntime(
      undefined,
      {
        async retrieveForAiScoring() {
          return {
            evidenceStatus: "none",
            citations: [],
            evidenceSummary: {
              evidenceStatus: "none",
              citationCount: 0,
              resourcePublicIds: [],
              chunkPublicIds: [],
              chunkIndexes: [],
              textHashes: [],
              queryHash: "local-test-query",
              maxScore: null,
              retrievalMode: "fusion_sort",
            },
          };
        },
      },
      async () => persistedCatalog,
      {
        async appendAiCallLog(input) {
          appendedAiCallLogs.push(input);

          return {
            publicId: "ai-call-log-public-admin-config",
            userPublicId: input.userPublicId,
            organizationPublicId: null,
            profession: null,
            level: null,
            aiFuncType: input.aiFuncType,
            callStatus: input.callStatus,
            providerDisplayName: input.modelConfigSnapshot.providerDisplayName,
            modelAlias: input.modelConfigSnapshot.modelName,
            promptSummary: "redacted prompt snapshot",
            outputSummary: "redacted output snapshot",
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
      {
        async appendAiScoringAttempt(input) {
          appendedAiScoringAttempts.push(input);

          return {
            answerRecordPublicId: input.answerRecordPublicId,
            attemptNumber: 1,
            status: input.status,
          };
        },
      },
    );

    const result = await runtime.scoreSubjectiveAnswer({
      userPublicId: "user-public-001",
      mockExamPublicId: "mock-exam-public-001",
      answerRecordPublicId: "answer-record-public-001",
      paperQuestionPublicId: "paper-question-public-001",
      questionPublicId: "question-public-001",
      questionSnapshot: { profession: "marketing", level: 3 },
      answerSnapshot: {
        selectedLabels: [],
        textAnswer: "local answer",
        savedFromClientAt: "2026-05-31T00:00:00.000Z",
      },
      questionText: "Explain the compliance step.",
      standardAnswer: "Mention the compliance step.",
      studentAnswer: "The compliance step is included.",
      maxScore: "5.0",
      scoringPoints: [
        {
          scoringPointPublicId: "scoring-point-public-001",
          label: "Completeness",
          maxScore: 5,
        },
      ],
    });

    expect(result.scoringSnapshot).toMatchObject({
      modelConfigPublicId: "model-config-admin-scoring",
      modelName: "admin-managed-scoring-model",
      promptTemplateKey: "ai_scoring_admin_v7",
      promptTemplateVersion: 7,
    });
    expect(appendedAiCallLogs).toHaveLength(1);
    expect(appendedAiScoringAttempts).toHaveLength(1);
    expect(appendedAiCallLogs[0]).toMatchObject({
      modelConfigSnapshot: {
        modelConfigPublicId: "model-config-admin-scoring",
        modelName: "admin-managed-scoring-model",
      },
    });
    expect(appendedAiScoringAttempts[0]).toMatchObject({
      answerRecordPublicId: "answer-record-public-001",
      aiCallLogPublicId: "ai-call-log-public-admin-config",
      status: "succeeded",
      failureCode: null,
      failureMessageDigest: null,
      attemptSnapshot: {
        modelConfigPublicId: "model-config-admin-scoring",
        promptTemplateKey: "ai_scoring_admin_v7",
        promptTemplateVersion: 7,
        scoringStatus: "scored",
      },
    });
    expect(JSON.stringify(appendedAiScoringAttempts[0])).not.toContain(
      "The compliance step is included.",
    );
  });
});

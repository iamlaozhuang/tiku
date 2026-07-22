import { describe, expect, it, vi } from "vitest";

import { createModelConfigSnapshot } from "../models/ai-rag";
import {
  AiExplanationHintRunnerError,
  createAiExplanationHintService,
  type AiExplanationContext,
  type AiExplanationRunner,
  type AiHintContext,
  type AiHintRunner,
} from "./ai-explanation-hint-service";

const explanationModelConfigSnapshot = createModelConfigSnapshot({
  providerPublicId: "model_provider_public_123",
  providerKey: "baseline_provider",
  providerDisplayName: "Baseline Provider",
  modelConfigPublicId: "model_config_public_explanation",
  aiFuncType: "explanation",
  modelName: "baseline-explanation-model",
  displayName: "Baseline explanation model",
  configVersion: 2,
  timeoutSecond: 60,
  maxRetryCount: 1,
  fallbackModelConfigPublicId: "model_config_public_explanation_fallback",
  promptTemplateKey: "ai_explanation_v1",
  promptTemplateVersion: 1,
});

const hintModelConfigSnapshot = createModelConfigSnapshot({
  providerPublicId: "model_provider_public_123",
  providerKey: "baseline_provider",
  providerDisplayName: "Baseline Provider",
  modelConfigPublicId: "model_config_public_hint",
  aiFuncType: "hint",
  modelName: "baseline-hint-model",
  displayName: "Baseline hint model",
  configVersion: 4,
  timeoutSecond: 60,
  maxRetryCount: 1,
  fallbackModelConfigPublicId: "model_config_public_hint_fallback",
  promptTemplateKey: "ai_hint_v1",
  promptTemplateVersion: 1,
});

const explanationFallbackModelConfigSnapshot = createModelConfigSnapshot({
  providerPublicId: "model_provider_public_fallback",
  providerKey: "fallback_provider",
  providerDisplayName: "Fallback Provider",
  modelConfigPublicId: "model_config_public_explanation_fallback",
  aiFuncType: "explanation",
  modelName: "fallback-explanation-model",
  displayName: "Fallback explanation model",
  configVersion: 3,
  timeoutSecond: 30,
  maxRetryCount: 0,
  fallbackModelConfigPublicId: null,
  promptTemplateKey: "ai_explanation_fallback_v1",
  promptTemplateVersion: 2,
});

const hintFallbackModelConfigSnapshot = createModelConfigSnapshot({
  providerPublicId: "model_provider_public_fallback",
  providerKey: "fallback_provider",
  providerDisplayName: "Fallback Provider",
  modelConfigPublicId: "model_config_public_hint_fallback",
  aiFuncType: "hint",
  modelName: "fallback-hint-model",
  displayName: "Fallback hint model",
  configVersion: 5,
  timeoutSecond: 30,
  maxRetryCount: 0,
  fallbackModelConfigPublicId: null,
  promptTemplateKey: "ai_hint_fallback_v1",
  promptTemplateVersion: 2,
});

const ragRetrievalResult = {
  evidenceStatus: "sufficient" as const,
  citations: [
    {
      chunkPublicId: "chunk_public_123",
      generationPublicId: "resource-index-generation-public-123",
      resourcePublicId: "resource_public_123",
      resourceTitle: "专卖教材",
      headingPath: ["行政处罚", "裁量要求"],
      chunkIndex: 2,
      chunkText: "裁量应当事实清楚、证据充分。",
      textHash: "chunk_hash_123",
      score: 0.91,
    },
  ],
  evidenceSummary: {
    evidenceStatus: "sufficient" as const,
    citationCount: 1,
    resourcePublicIds: ["resource_public_123"],
    chunkPublicIds: ["chunk_public_123"],
    generationPublicIds: ["resource-index-generation-public-123"],
    chunkIndexes: [2],
    textHashes: ["chunk_hash_123"],
    queryHash: "query_hash_123",
    maxScore: 0.91,
    retrievalMode: "fusion_sort" as const,
  },
};

const explanationContext: AiExplanationContext = {
  userPublicId: "user_public_123",
  practicePublicId: "practice_public_123",
  answerRecordPublicId: "answer_record_public_123",
  questionPublicId: "question_public_123",
  questionText: "烟草专卖行政处罚裁量应满足哪些基本要求？",
  standardAnswer: "应当事实清楚、证据充分、裁量适当。",
  analysis: "本题考查行政处罚裁量的基础要求。",
  learnerAnswer: "只要处罚适当即可。",
  isCorrect: false,
  triggerReason: "wrong_answer_auto",
  modelConfigSnapshot: explanationModelConfigSnapshot,
  promptTemplate: {
    promptTemplateKey: "ai_explanation_v1",
    version: 1,
    templateHash: "ai_explanation_v1_baseline",
  },
  ragRetrievalResult,
};

const hintContext: AiHintContext = {
  userPublicId: "user_public_123",
  practicePublicId: "practice_public_123",
  answerRecordPublicId: "answer_record_public_456",
  questionPublicId: "question_public_subjective",
  questionText: "说明烟草专卖行政处罚裁量的基本要求。",
  standardAnswer: "应当事实清楚、证据充分、裁量适当。",
  studentAnswer: "需要处罚适当。",
  scoringPointLabels: ["事实清楚", "证据充分", "裁量适当"],
  modelConfigSnapshot: hintModelConfigSnapshot,
  promptTemplate: {
    promptTemplateKey: "ai_hint_v1",
    version: 1,
    templateHash: "ai_hint_v1_baseline",
  },
  ragRetrievalResult,
};

function createExplanationRunner(
  result: Awaited<ReturnType<AiExplanationRunner>>,
): AiExplanationRunner {
  return vi.fn(async () => result);
}

function createHintRunner(
  result: Awaited<ReturnType<AiHintRunner>>,
): AiHintRunner {
  return vi.fn(async () => result);
}

function expectNoSensitiveMarkerLeaks(
  serializedValue: string,
  markers: string[],
): void {
  expect(markers.map((marker) => serializedValue.includes(marker))).toEqual(
    markers.map(() => false),
  );
}

describe("ai explanation and hint service", () => {
  it("generates automatic explanation for a wrong objective answer and locks snapshots", async () => {
    const explanationRunner = createExplanationRunner({
      explanationText: "答错原因是忽略了事实清楚与证据充分。",
      keyPoints: ["事实清楚", "证据充分", "裁量适当"],
      learningSuggestion: "复习行政处罚裁量要求。",
      providerRequestPayload: {
        prompt: "raw prompt must be redacted",
        learnerAnswer: explanationContext.learnerAnswer,
      },
      providerResponsePayload: {
        output: "raw explanation output must be redacted",
      },
    });
    const hintRunner = createHintRunner({
      hintText: "should not be called",
      improvementDirections: [],
      providerRequestPayload: null,
      providerResponsePayload: null,
    });
    const service = createAiExplanationHintService({
      explanationRunner,
      hintRunner,
    });

    const result =
      await service.generateObjectiveExplanation(explanationContext);

    expect(explanationRunner).toHaveBeenCalledWith(
      expect.objectContaining({
        triggerReason: "wrong_answer_auto",
        modelConfigSnapshot: explanationModelConfigSnapshot,
        promptTemplate: explanationContext.promptTemplate,
        ragRetrievalResult,
      }),
    );
    expect(hintRunner).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      explanationStatus: "explained",
      explanationText: "答错原因是忽略了事实清楚与证据充分。",
      keyPoints: ["事实清楚", "证据充分", "裁量适当"],
      learningSuggestion: "复习行政处罚裁量要求。",
      insufficientEvidenceMessage: null,
      modelConfigSnapshot: explanationModelConfigSnapshot,
      promptTemplateKey: "ai_explanation_v1",
      promptTemplateVersion: 1,
      evidenceStatus: "sufficient",
      citations: ragRetrievalResult.citations,
      aiCallLogDraft: {
        callStatus: "success",
      },
    });
    expect(result.aiCallLogDraft?.requestRedactedSnapshot).toMatchObject({
      prompt: {
        redactionStatus: "redacted",
        reason: "prompt",
      },
      userAnswer: {
        redactionStatus: "redacted",
        reason: "user_answer",
      },
    });
    expect(result.aiCallLogDraft?.responseRedactedSnapshot).toMatchObject({
      modelOutput: {
        redactionStatus: "redacted",
        reason: "model_output",
      },
    });
    expect(JSON.stringify(result.aiCallLogDraft)).not.toContain(
      explanationContext.learnerAnswer,
    );
    expect(JSON.stringify(result.aiCallLogDraft)).not.toContain(
      "raw explanation output must be redacted",
    );
    expect(JSON.stringify(result.aiCallLogDraft)).not.toContain(
      "裁量应当事实清楚",
    );
  });

  it("supports manual explanation requests for correct objective answers", async () => {
    const explanationRunner = createExplanationRunner({
      explanationText: "答对后可继续理解裁量边界。",
      keyPoints: ["裁量适当"],
      learningSuggestion: null,
      providerRequestPayload: null,
      providerResponsePayload: null,
    });
    const service = createAiExplanationHintService({
      explanationRunner,
      hintRunner: createHintRunner({
        hintText: "should not be called",
        improvementDirections: [],
        providerRequestPayload: null,
        providerResponsePayload: null,
      }),
    });

    const result = await service.generateObjectiveExplanation({
      ...explanationContext,
      learnerAnswer: explanationContext.standardAnswer,
      isCorrect: true,
      triggerReason: "manual_request",
    });

    expect(result.explanationStatus).toBe("explained");
    expect(explanationRunner).toHaveBeenCalledWith(
      expect.objectContaining({
        isCorrect: true,
        triggerReason: "manual_request",
      }),
    );
  });

  it("does not fabricate citations when RAG evidence is weak or none", async () => {
    const explanationRunner = createExplanationRunner({
      explanationText: "依据不足时只给通用讲解。",
      keyPoints: [],
      learningSuggestion: "建议稍后重试或查看老师解析。",
      providerRequestPayload: null,
      providerResponsePayload: null,
    });
    const service = createAiExplanationHintService({
      explanationRunner,
      hintRunner: createHintRunner({
        hintText: "should not be called",
        improvementDirections: [],
        providerRequestPayload: null,
        providerResponsePayload: null,
      }),
    });

    const result = await service.generateObjectiveExplanation({
      ...explanationContext,
      ragRetrievalResult: {
        ...ragRetrievalResult,
        evidenceStatus: "weak",
        citations: [],
        evidenceSummary: {
          ...ragRetrievalResult.evidenceSummary,
          evidenceStatus: "weak",
          citationCount: 0,
          resourcePublicIds: [],
          chunkPublicIds: [],
          generationPublicIds: [],
          chunkIndexes: [],
          textHashes: [],
          maxScore: 0.42,
        },
      },
    });

    expect(result.evidenceStatus).toBe("weak");
    expect(result.citations).toEqual([]);
    expect(result.insufficientEvidenceMessage).toBe(
      "RAG evidence is insufficient; no citation is attached.",
    );
  });

  it("returns non-blocking unavailable explanation result when the runner fails", async () => {
    const sensitiveContext = {
      ...explanationContext,
      questionText: "explanation sensitive question marker 2f4d",
      standardAnswer: "explanation sensitive standard answer marker 45e9",
      analysis: "explanation sensitive analysis marker c9a1",
      learnerAnswer: "explanation sensitive learner answer marker 676b",
    };
    const providerErrorMarker = "provider explanation error marker 7e38";
    const explanationRunner: AiExplanationRunner = vi.fn(async () => {
      throw new Error(providerErrorMarker);
    });
    const service = createAiExplanationHintService({
      explanationRunner,
      hintRunner: createHintRunner({
        hintText: "should not be called",
        improvementDirections: [],
        providerRequestPayload: null,
        providerResponsePayload: null,
      }),
    });

    const result = await service.generateObjectiveExplanation(sensitiveContext);
    const serializedCallLogDraft = JSON.stringify(result.aiCallLogDraft);

    expect(result).toMatchObject({
      explanationStatus: "explanation_unavailable",
      explanationText: "AI explanation is temporarily unavailable.",
      citations: [],
      aiCallLogDraft: {
        callStatus: "failed",
      },
    });
    expect(result.aiCallLogDraft?.requestRedactedSnapshot).toMatchObject({
      prompt: {
        redactionStatus: "redacted",
        reason: "prompt",
      },
      userAnswer: {
        redactionStatus: "redacted",
        reason: "user_answer",
      },
      requestContext: {
        redactionStatus: "redacted",
        reason: "user_answer",
      },
      providerRequestPayload: {
        requestBody: {
          redactionStatus: "redacted",
          reason: "provider_payload",
        },
      },
    });
    expect(result.aiCallLogDraft?.responseRedactedSnapshot).toBeNull();
    expect(result.aiCallLogDraft?.errorRedactedSnapshot).toMatchObject({
      providerErrorPayload: {
        errorBody: {
          redactionStatus: "redacted",
          reason: "provider_payload",
        },
      },
    });
    expectNoSensitiveMarkerLeaks(serializedCallLogDraft, [
      sensitiveContext.questionText,
      sensitiveContext.standardAnswer,
      sensitiveContext.analysis,
      sensitiveContext.learnerAnswer,
      providerErrorMarker,
    ]);
  });

  it("tries one frozen fallback after a retryable primary failure and returns both attempt logs", async () => {
    const explanationRunner: AiExplanationRunner = vi.fn(async (input) => {
      if (
        input.modelConfigSnapshot.modelConfigPublicId ===
        explanationModelConfigSnapshot.modelConfigPublicId
      ) {
        throw new AiExplanationHintRunnerError("rate_limited");
      }

      return {
        explanationText: "备用模型讲解",
        keyPoints: ["备用模型要点"],
        learningSuggestion: null,
        providerRequestPayload: { provider: "fallback" },
        providerResponsePayload: { output: "fallback output" },
      };
    });
    const service = createAiExplanationHintService({
      explanationRunner,
      hintRunner: createHintRunner({
        hintText: "should not be called",
        improvementDirections: [],
        providerRequestPayload: null,
        providerResponsePayload: null,
      }),
    });

    const result = await service.generateObjectiveExplanation({
      ...explanationContext,
      fallbackAttempt: {
        modelConfigSnapshot: explanationFallbackModelConfigSnapshot,
        promptTemplate: {
          promptTemplateKey: "ai_explanation_fallback_v1",
          version: 2,
          templateHash: "ai_explanation_fallback_v1_hash",
        },
      },
    });

    expect(explanationRunner).toHaveBeenCalledTimes(2);
    expect(result).toMatchObject({
      explanationStatus: "explained",
      explanationText: "备用模型讲解",
      modelConfigSnapshot: explanationFallbackModelConfigSnapshot,
      promptTemplateKey: "ai_explanation_fallback_v1",
      promptTemplateVersion: 2,
      aiCallLogDrafts: [
        {
          callStatus: "failed",
          modelConfigSnapshot: explanationModelConfigSnapshot,
        },
        {
          callStatus: "success",
          modelConfigSnapshot: explanationFallbackModelConfigSnapshot,
        },
      ],
    });
  });

  it("does not fallback for a non-retryable provider client error", async () => {
    const explanationRunner: AiExplanationRunner = vi.fn(async () => {
      throw new AiExplanationHintRunnerError("client_error");
    });
    const service = createAiExplanationHintService({
      explanationRunner,
      hintRunner: createHintRunner({
        hintText: "should not be called",
        improvementDirections: [],
        providerRequestPayload: null,
        providerResponsePayload: null,
      }),
    });

    const result = await service.generateObjectiveExplanation({
      ...explanationContext,
      fallbackAttempt: {
        modelConfigSnapshot: explanationFallbackModelConfigSnapshot,
        promptTemplate: {
          promptTemplateKey: "ai_explanation_fallback_v1",
          version: 2,
          templateHash: "ai_explanation_fallback_v1_hash",
        },
      },
    });

    expect(explanationRunner).toHaveBeenCalledTimes(1);
    expect(result.explanationStatus).toBe("explanation_unavailable");
    expect(result.aiCallLogDrafts).toHaveLength(1);
  });

  it("never executes a mismatched fallback snapshot supplied by a caller", async () => {
    const explanationRunner: AiExplanationRunner = vi.fn(async () => {
      throw new AiExplanationHintRunnerError("timeout");
    });
    const service = createAiExplanationHintService({
      explanationRunner,
      hintRunner: createHintRunner({
        hintText: "should not be called",
        improvementDirections: [],
        providerRequestPayload: null,
        providerResponsePayload: null,
      }),
    });

    const result = await service.generateObjectiveExplanation({
      ...explanationContext,
      fallbackAttempt: {
        modelConfigSnapshot: hintFallbackModelConfigSnapshot,
        promptTemplate: {
          promptTemplateKey: "ai_hint_fallback_v1",
          version: 2,
          templateHash: "ai_hint_fallback_v1_hash",
        },
      },
    });

    expect(explanationRunner).toHaveBeenCalledTimes(1);
    expect(result.explanationStatus).toBe("explanation_unavailable");
    expect(result.aiCallLogDrafts).toHaveLength(1);
  });

  it("returns unavailable with two failed logs when both permitted attempts fail", async () => {
    const explanationRunner: AiExplanationRunner = vi.fn(async () => {
      throw new AiExplanationHintRunnerError("provider_unavailable");
    });
    const service = createAiExplanationHintService({
      explanationRunner,
      hintRunner: createHintRunner({
        hintText: "should not be called",
        improvementDirections: [],
        providerRequestPayload: null,
        providerResponsePayload: null,
      }),
    });

    const result = await service.generateObjectiveExplanation({
      ...explanationContext,
      fallbackAttempt: {
        modelConfigSnapshot: explanationFallbackModelConfigSnapshot,
        promptTemplate: {
          promptTemplateKey: "ai_explanation_fallback_v1",
          version: 2,
          templateHash: "ai_explanation_fallback_v1_hash",
        },
      },
    });

    expect(explanationRunner).toHaveBeenCalledTimes(2);
    expect(result.explanationStatus).toBe("explanation_unavailable");
    expect(result.aiCallLogDrafts.map((draft) => draft.callStatus)).toEqual([
      "failed",
      "failed",
    ]);
    expect(
      result.aiCallLogDrafts.map(
        (draft) => draft.modelConfigSnapshot.modelConfigPublicId,
      ),
    ).toEqual([
      "model_config_public_explanation",
      "model_config_public_explanation_fallback",
    ]);
  });

  it.each([
    ["rate limit", Object.assign(new Error("limited"), { status: 429 }), 2],
    ["provider 5xx", Object.assign(new Error("down"), { status: 503 }), 2],
    [
      "abort timeout",
      Object.assign(new Error("aborted"), { name: "AbortError" }),
      2,
    ],
    [
      "network reset",
      Object.assign(new Error("reset"), { code: "ECONNRESET" }),
      2,
    ],
    ["client 4xx", Object.assign(new Error("bad request"), { status: 400 }), 1],
    ["unknown error", new Error("unknown"), 1],
  ])(
    "classifies %s fallback eligibility fail closed",
    async (_name, error, calls) => {
      const explanationRunner: AiExplanationRunner = vi
        .fn()
        .mockRejectedValueOnce(error)
        .mockResolvedValue({
          explanationText: "fallback explanation",
          keyPoints: [],
          learningSuggestion: null,
          providerRequestPayload: null,
          providerResponsePayload: null,
        });
      const service = createAiExplanationHintService({
        explanationRunner,
        hintRunner: createHintRunner({
          hintText: "should not be called",
          improvementDirections: [],
          providerRequestPayload: null,
          providerResponsePayload: null,
        }),
      });

      const result = await service.generateObjectiveExplanation({
        ...explanationContext,
        fallbackAttempt: {
          modelConfigSnapshot: explanationFallbackModelConfigSnapshot,
          promptTemplate: {
            promptTemplateKey: "ai_explanation_fallback_v1",
            version: 2,
            templateHash: "ai_explanation_fallback_v1_hash",
          },
        },
      });

      expect(explanationRunner).toHaveBeenCalledTimes(calls);
      expect(result.explanationStatus).toBe(
        calls === 2 ? "explained" : "explanation_unavailable",
      );
    },
  );

  it("generates subjective hints without directly revealing the standard answer", async () => {
    const hintRunner = createHintRunner({
      hintText:
        "不要只写“应当事实清楚、证据充分、裁量适当。”，请补充每个要求的判断依据。",
      improvementDirections: ["补充事实基础", "说明证据要求"],
      providerRequestPayload: {
        prompt: "raw hint prompt must be redacted",
        studentAnswer: hintContext.studentAnswer,
      },
      providerResponsePayload: {
        output: "raw hint output must be redacted",
      },
    });
    const service = createAiExplanationHintService({
      explanationRunner: createExplanationRunner({
        explanationText: "should not be called",
        keyPoints: [],
        learningSuggestion: null,
        providerRequestPayload: null,
        providerResponsePayload: null,
      }),
      hintRunner,
    });

    const result = await service.generateSubjectiveHint(hintContext);

    expect(result).toMatchObject({
      hintStatus: "hinted",
      improvementDirections: ["补充事实基础", "说明证据要求"],
      modelConfigSnapshot: hintModelConfigSnapshot,
      promptTemplateKey: "ai_hint_v1",
      promptTemplateVersion: 1,
      evidenceStatus: "sufficient",
      citations: ragRetrievalResult.citations,
      aiCallLogDraft: {
        callStatus: "success",
      },
    });
    expect(result.hintText).not.toContain(hintContext.standardAnswer);
    expect(JSON.stringify(result.aiCallLogDraft)).not.toContain(
      hintContext.studentAnswer,
    );
    expect(JSON.stringify(result.aiCallLogDraft)).not.toContain(
      "raw hint output must be redacted",
    );
  });

  it("fails closed before fallback when the primary attempt log cannot persist", async () => {
    const explanationRunner: AiExplanationRunner = vi.fn(async () => {
      throw new AiExplanationHintRunnerError("timeout");
    });
    const service = createAiExplanationHintService({
      explanationRunner,
      hintRunner: createHintRunner({
        hintText: "should not be called",
        improvementDirections: [],
        providerRequestPayload: null,
        providerResponsePayload: null,
      }),
      async onAttemptComplete() {
        throw new Error("raw database failure");
      },
    });

    await expect(
      service.generateObjectiveExplanation({
        ...explanationContext,
        fallbackAttempt: {
          modelConfigSnapshot: explanationFallbackModelConfigSnapshot,
          promptTemplate: {
            promptTemplateKey: "ai_explanation_fallback_v1",
            version: 2,
            templateHash: "ai_explanation_fallback_v1_hash",
          },
        },
      }),
    ).rejects.toThrow("attempt log persistence failed");
    expect(explanationRunner).toHaveBeenCalledTimes(1);
  });

  it("returns non-blocking unavailable hint result when the runner fails", async () => {
    const sensitiveContext = {
      ...hintContext,
      questionText: "hint sensitive question marker 4a1c",
      standardAnswer: "hint sensitive standard answer marker d8c0",
      studentAnswer: "hint sensitive student answer marker b907",
    };
    const providerErrorMarker = "provider hint error marker 90fb";
    const hintRunner: AiHintRunner = vi.fn(async () => {
      throw new Error(providerErrorMarker);
    });
    const service = createAiExplanationHintService({
      explanationRunner: createExplanationRunner({
        explanationText: "should not be called",
        keyPoints: [],
        learningSuggestion: null,
        providerRequestPayload: null,
        providerResponsePayload: null,
      }),
      hintRunner,
    });

    const result = await service.generateSubjectiveHint(sensitiveContext);
    const serializedCallLogDraft = JSON.stringify(result.aiCallLogDraft);

    expect(result).toMatchObject({
      hintStatus: "hint_unavailable",
      hintText: "AI hint is temporarily unavailable.",
      citations: [],
      aiCallLogDraft: {
        callStatus: "failed",
      },
    });
    expect(result.aiCallLogDraft?.requestRedactedSnapshot).toMatchObject({
      prompt: {
        redactionStatus: "redacted",
        reason: "prompt",
      },
      userAnswer: {
        redactionStatus: "redacted",
        reason: "user_answer",
      },
      requestContext: {
        redactionStatus: "redacted",
        reason: "user_answer",
      },
      providerRequestPayload: {
        requestBody: {
          redactionStatus: "redacted",
          reason: "provider_payload",
        },
      },
    });
    expect(result.aiCallLogDraft?.responseRedactedSnapshot).toBeNull();
    expect(result.aiCallLogDraft?.errorRedactedSnapshot).toMatchObject({
      providerErrorPayload: {
        errorBody: {
          redactionStatus: "redacted",
          reason: "provider_payload",
        },
      },
    });
    expectNoSensitiveMarkerLeaks(serializedCallLogDraft, [
      sensitiveContext.questionText,
      sensitiveContext.standardAnswer,
      sensitiveContext.studentAnswer,
      providerErrorMarker,
    ]);
  });

  it("uses the fallback hint snapshot after explicit output validation failure", async () => {
    const hintRunner: AiHintRunner = vi.fn(async (input) => {
      if (
        input.modelConfigSnapshot.modelConfigPublicId ===
        hintModelConfigSnapshot.modelConfigPublicId
      ) {
        throw new AiExplanationHintRunnerError("invalid_output");
      }

      return {
        hintText: "先补充事实基础，再检查证据链。",
        improvementDirections: ["补充事实基础", "检查证据链"],
        providerRequestPayload: null,
        providerResponsePayload: null,
      };
    });
    const service = createAiExplanationHintService({
      explanationRunner: createExplanationRunner({
        explanationText: "should not be called",
        keyPoints: [],
        learningSuggestion: null,
        providerRequestPayload: null,
        providerResponsePayload: null,
      }),
      hintRunner,
    });

    const result = await service.generateSubjectiveHint({
      ...hintContext,
      fallbackAttempt: {
        modelConfigSnapshot: hintFallbackModelConfigSnapshot,
        promptTemplate: {
          promptTemplateKey: "ai_hint_fallback_v1",
          version: 2,
          templateHash: "ai_hint_fallback_v1_hash",
        },
      },
    });

    expect(hintRunner).toHaveBeenCalledTimes(2);
    expect(result).toMatchObject({
      hintStatus: "hinted",
      modelConfigSnapshot: hintFallbackModelConfigSnapshot,
      aiCallLogDrafts: [
        {
          callStatus: "failed",
          modelConfigSnapshot: hintModelConfigSnapshot,
        },
        {
          callStatus: "success",
          modelConfigSnapshot: hintFallbackModelConfigSnapshot,
        },
      ],
    });
  });
});

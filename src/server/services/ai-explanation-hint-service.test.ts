import { describe, expect, it, vi } from "vitest";

import { createModelConfigSnapshot } from "../models/ai-rag";
import {
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

const ragRetrievalResult = {
  evidenceStatus: "sufficient" as const,
  citations: [
    {
      chunkPublicId: "chunk_public_123",
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
    const explanationRunner: AiExplanationRunner = vi.fn(async () => {
      throw new Error("provider timeout with raw learner answer");
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

    const result =
      await service.generateObjectiveExplanation(explanationContext);

    expect(result).toMatchObject({
      explanationStatus: "explanation_unavailable",
      explanationText: "AI explanation is temporarily unavailable.",
      citations: [],
      aiCallLogDraft: {
        callStatus: "failed",
      },
    });
    expect(JSON.stringify(result.aiCallLogDraft)).not.toContain(
      "provider timeout with raw learner answer",
    );
  });

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

  it("returns non-blocking unavailable hint result when the runner fails", async () => {
    const hintRunner: AiHintRunner = vi.fn(async () => {
      throw new Error("provider failed with raw standard answer");
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
      hintStatus: "hint_unavailable",
      hintText: "AI hint is temporarily unavailable.",
      citations: [],
      aiCallLogDraft: {
        callStatus: "failed",
      },
    });
    expect(JSON.stringify(result.aiCallLogDraft)).not.toContain(
      hintContext.standardAnswer,
    );
  });
});

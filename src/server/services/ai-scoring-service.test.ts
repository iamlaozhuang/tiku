import { describe, expect, it, vi } from "vitest";

import { createModelConfigSnapshot } from "../models/ai-rag";
import {
  createAiScoringService,
  type AiScoringContext,
  type AiScoringRunner,
  type ExistingAiScoringResult,
} from "./ai-scoring-service";

const modelConfigSnapshot = createModelConfigSnapshot({
  providerPublicId: "model_provider_public_123",
  providerKey: "baseline_provider",
  providerDisplayName: "Baseline Provider",
  modelConfigPublicId: "model_config_public_123",
  aiFuncType: "scoring",
  modelName: "baseline-scoring-model",
  displayName: "Baseline scoring model",
  configVersion: 3,
  timeoutSecond: 60,
  maxRetryCount: 3,
  fallbackModelConfigPublicId: null,
  promptTemplateKey: "ai_scoring_v1",
  promptTemplateVersion: 1,
});

const context: AiScoringContext = {
  userPublicId: "user_public_123",
  mockExamPublicId: "mock_exam_public_123",
  answerRecordPublicId: "answer_record_public_123",
  questionPublicId: "question_public_123",
  questionText: "说明烟草专卖行政处罚裁量的基本要求。",
  standardAnswer: "应当事实清楚、证据充分、裁量适当。",
  studentAnswer: "需要事实清楚，证据充分，并且处罚幅度适当。",
  maxScore: 5,
  scoringPoints: [
    {
      scoringPointPublicId: "scoring_point_public_1",
      label: "事实清楚",
      maxScore: 2,
    },
    {
      scoringPointPublicId: "scoring_point_public_2",
      label: "证据充分",
      maxScore: 2,
    },
    {
      scoringPointPublicId: "scoring_point_public_3",
      label: "裁量适当",
      maxScore: 1,
    },
  ],
  modelConfigSnapshot,
  promptTemplate: {
    promptTemplateKey: "ai_scoring_v1",
    version: 1,
    templateHash: "ai_scoring_v1_baseline",
  },
  ragRetrievalResult: {
    evidenceStatus: "sufficient",
    citations: [
      {
        chunkPublicId: "chunk_public_123",
        resourcePublicId: "resource_public_123",
        resourceTitle: "专卖教材",
        headingPath: ["行政处罚"],
        chunkIndex: 2,
        chunkText: "裁量应当事实清楚、证据充分。",
        textHash: "chunk_hash_123",
        score: 0.91,
      },
    ],
    evidenceSummary: {
      evidenceStatus: "sufficient",
      citationCount: 1,
      resourcePublicIds: ["resource_public_123"],
      chunkPublicIds: ["chunk_public_123"],
      chunkIndexes: [2],
      textHashes: ["chunk_hash_123"],
      queryHash: "query_hash_123",
      maxScore: 0.91,
      retrievalMode: "fusion_sort",
    },
  },
};

function createRunner(
  result: Awaited<ReturnType<AiScoringRunner>>,
): AiScoringRunner {
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

describe("ai scoring service", () => {
  it("returns zero for unanswered subjective answers without calling the runner", async () => {
    const runner = createRunner({
      scoringPoints: [],
      overallComment: "should not be called",
      improvementSuggestion: "should not be called",
      providerRequestPayload: null,
      providerResponsePayload: null,
    });
    const service = createAiScoringService({ runner });

    const result = await service.scoreSubjectiveAnswer({
      ...context,
      studentAnswer: "  ",
      ragRetrievalResult: {
        ...context.ragRetrievalResult,
        evidenceStatus: "none",
        citations: [],
        evidenceSummary: {
          ...context.ragRetrievalResult.evidenceSummary,
          evidenceStatus: "none",
          citationCount: 0,
          resourcePublicIds: [],
          chunkPublicIds: [],
          chunkIndexes: [],
          textHashes: [],
          maxScore: null,
        },
      },
    });

    expect(runner).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      scoringStatus: "scored",
      totalScore: 0,
      maxScore: 5,
      modelConfigSnapshot,
      promptTemplateKey: "ai_scoring_v1",
      promptTemplateVersion: 1,
      citations: [],
      aiCallLogDraft: {
        callStatus: "success",
      },
    });
  });

  it("returns an existing successful result without repeated scoring", async () => {
    const existingResult: ExistingAiScoringResult = {
      scoringStatus: "scored",
      totalScore: 4,
      maxScore: 5,
      retryCount: 1,
      scoringPoints: [],
      overallComment: "Existing fixed result.",
      improvementSuggestion: null,
      modelConfigSnapshot,
      promptTemplateKey: "ai_scoring_v1",
      promptTemplateVersion: 1,
      evidenceStatus: "sufficient",
      citations: [],
      aiCallLogDraft: null,
      aiScoringAttemptDraft: null,
    };
    const runner = createRunner({
      scoringPoints: [],
      overallComment: "should not be called",
      improvementSuggestion: null,
      providerRequestPayload: null,
      providerResponsePayload: null,
    });
    const service = createAiScoringService({ runner });

    await expect(
      service.scoreSubjectiveAnswer({
        ...context,
        existingResult,
      }),
    ).resolves.toEqual(existingResult);
    expect(runner).not.toHaveBeenCalled();
  });

  it("rounds scoring points to 0.5 and caps total score by question max score", async () => {
    const runner = createRunner({
      scoringPoints: [
        {
          scoringPointPublicId: "scoring_point_public_1",
          isHit: true,
          score: 1.74,
          reason: "提到事实清楚。",
        },
        {
          scoringPointPublicId: "scoring_point_public_2",
          isHit: true,
          score: 2.4,
          reason: "提到证据充分。",
        },
        {
          scoringPointPublicId: "scoring_point_public_3",
          isHit: true,
          score: 1.2,
          reason: "提到裁量适当。",
        },
      ],
      overallComment: "答案覆盖主要评分点。",
      improvementSuggestion: "补充法律依据。",
      providerRequestPayload: {
        prompt: "raw prompt must be redacted",
        answer: "raw answer must be redacted",
      },
      providerResponsePayload: {
        output: "raw model output must be redacted",
      },
    });
    const service = createAiScoringService({ runner });

    const result = await service.scoreSubjectiveAnswer({
      ...context,
      maxScore: 4,
    });

    expect(result).toMatchObject({
      scoringStatus: "scored",
      totalScore: 4,
      maxScore: 4,
      scoringPoints: [
        {
          scoringPointPublicId: "scoring_point_public_1",
          isHit: true,
          score: 1.5,
        },
        {
          scoringPointPublicId: "scoring_point_public_2",
          isHit: true,
          score: 2,
        },
        {
          scoringPointPublicId: "scoring_point_public_3",
          isHit: true,
          score: 1,
        },
      ],
      modelConfigSnapshot,
      promptTemplateVersion: 1,
      evidenceStatus: "sufficient",
    });
    expect(result.totalScore).toBeLessThanOrEqual(context.maxScore);
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
      context.studentAnswer,
    );
    expect(JSON.stringify(result.aiCallLogDraft)).not.toContain(
      "raw model output must be redacted",
    );
  });

  it("does not fabricate citations when RAG evidence is weak or none", async () => {
    const runner = createRunner({
      scoringPoints: [
        {
          scoringPointPublicId: "scoring_point_public_1",
          isHit: true,
          score: 2,
          reason: "提到事实清楚。",
        },
      ],
      overallComment: "依据不足，仅按评分点给出基线评分。",
      improvementSuggestion: null,
      providerRequestPayload: null,
      providerResponsePayload: null,
    });
    const service = createAiScoringService({ runner });

    const result = await service.scoreSubjectiveAnswer({
      ...context,
      ragRetrievalResult: {
        ...context.ragRetrievalResult,
        evidenceStatus: "weak",
        citations: [],
        evidenceSummary: {
          ...context.ragRetrievalResult.evidenceSummary,
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
    expect(result.aiCallLogDraft?.citationRedactedSnapshot).toMatchObject({
      citations: [],
      evidenceSummary: {
        evidenceStatus: "weak",
        citationCount: 0,
      },
    });
  });

  it("marks failed scoring attempts and stops after the retry limit", async () => {
    const failingRunner: AiScoringRunner = vi.fn(async () => {
      throw new Error("provider timeout with raw answer detail");
    });
    const service = createAiScoringService({ runner: failingRunner });

    await expect(
      service.scoreSubjectiveAnswer({
        ...context,
        retryCount: 2,
      }),
    ).resolves.toMatchObject({
      scoringStatus: "scoring_failed",
      retryCount: 3,
      aiCallLogDraft: {
        callStatus: "failed",
      },
      aiScoringAttemptDraft: {
        status: "failed",
        failureCode: "scoring_runner_failed",
        attemptSnapshot: {
          answerRecordPublicId: "answer_record_public_123",
          scoringStatus: "scoring_failed",
        },
      },
    });

    await expect(
      service.scoreSubjectiveAnswer({
        ...context,
        retryCount: 3,
      }),
    ).resolves.toMatchObject({
      scoringStatus: "retry_limit_reached",
      retryCount: 3,
      aiCallLogDraft: null,
      aiScoringAttemptDraft: null,
    });
    expect(failingRunner).toHaveBeenCalledTimes(1);
  });

  it("creates redaction-safe attempt drafts without raw prompt, answer, or provider payload", async () => {
    const sensitiveContext = {
      ...context,
      questionText: "scoring sensitive question marker 4c7d",
      standardAnswer: "scoring sensitive standard answer marker c351",
      studentAnswer: "scoring sensitive student answer marker a8f2",
    };
    const providerErrorMarker = "provider scoring error marker 19ba";
    const failingRunner: AiScoringRunner = vi.fn(async () => {
      throw new Error(providerErrorMarker);
    });
    const service = createAiScoringService({ runner: failingRunner });
    const result = await service.scoreSubjectiveAnswer(sensitiveContext);
    const serializedDraft = JSON.stringify(result.aiScoringAttemptDraft);
    const serializedCallLogDraft = JSON.stringify(result.aiCallLogDraft);

    expect(result.aiScoringAttemptDraft).toMatchObject({
      status: "failed",
      failureCode: "scoring_runner_failed",
      failureMessageDigest: expect.stringMatching(/^[a-f0-9]{64}$/u),
      attemptSnapshot: {
        answerRecordPublicId: "answer_record_public_123",
        mockExamPublicId: "mock_exam_public_123",
        questionPublicId: "question_public_123",
        modelConfigPublicId: "model_config_public_123",
        promptTemplateKey: "ai_scoring_v1",
        promptTemplateVersion: 1,
        scoringStatus: "scoring_failed",
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
    expectNoSensitiveMarkerLeaks(serializedDraft, [
      sensitiveContext.questionText,
      sensitiveContext.standardAnswer,
      sensitiveContext.studentAnswer,
      providerErrorMarker,
    ]);
    expectNoSensitiveMarkerLeaks(serializedCallLogDraft, [
      sensitiveContext.questionText,
      sensitiveContext.standardAnswer,
      sensitiveContext.studentAnswer,
      providerErrorMarker,
    ]);
  });

  it("rejects scoring fallback model configs to preserve scoring consistency", async () => {
    const runner = createRunner({
      scoringPoints: [],
      overallComment: "should not be called",
      improvementSuggestion: null,
      providerRequestPayload: null,
      providerResponsePayload: null,
    });
    const service = createAiScoringService({ runner });

    await expect(
      service.scoreSubjectiveAnswer({
        ...context,
        modelConfigSnapshot: {
          ...modelConfigSnapshot,
          fallbackModelConfigPublicId: "model_config_public_fallback",
        },
      }),
    ).resolves.toMatchObject({
      scoringStatus: "scoring_failed",
      failureReason: "scoring_fallback_not_allowed",
      retryCount: 1,
    });
    expect(runner).not.toHaveBeenCalled();
  });
});

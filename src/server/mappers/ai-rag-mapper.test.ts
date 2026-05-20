import { describe, expect, it } from "vitest";

import { createModelConfigSnapshot, type AiCallLogRow } from "../models/ai-rag";
import { mapAiCallLogToApi } from "./ai-rag-mapper";

const startedAt = new Date("2026-05-20T08:00:00.000Z");
const completedAt = new Date("2026-05-20T08:00:01.000Z");

describe("AI/RAG API mappers", () => {
  it("maps AI call log rows to camelCase DTOs without numeric ids", () => {
    const aiCallLog = {
      id: 100,
      public_id: "ai_call_log_public_id",
      user_public_id: "user_public_id",
      answer_record_public_id: "answer_record_public_id",
      mock_exam_public_id: "mock_exam_public_id",
      question_public_id: "question_public_id",
      ai_func_type: "scoring",
      call_status: "failed",
      model_config_id: 2,
      prompt_template_id: 3,
      model_config_snapshot: createModelConfigSnapshot({
        providerPublicId: "model_provider_public_id",
        providerKey: "qwen",
        providerDisplayName: "Qwen",
        modelConfigPublicId: "model_config_public_id",
        aiFuncType: "scoring",
        modelName: "qwen-max",
        displayName: "Qwen Max Scoring",
        configVersion: 3,
        timeoutSecond: 60,
        maxRetryCount: 0,
        fallbackModelConfigPublicId: null,
        promptTemplateKey: "ai_scoring_v1",
        promptTemplateVersion: 1,
      }),
      prompt_template_key: "ai_scoring_v1",
      prompt_template_version: 1,
      request_redacted_snapshot: { prompt: { redactionStatus: "redacted" } },
      response_redacted_snapshot: null,
      error_redacted_snapshot: { message: { redactionStatus: "redacted" } },
      citation_redacted_snapshot: { citations: [] },
      prompt_token_count: 100,
      completion_token_count: null,
      total_token_count: null,
      latency_ms: 1000,
      started_at: startedAt,
      completed_at: completedAt,
      created_at: startedAt,
    } satisfies AiCallLogRow;

    const dto = mapAiCallLogToApi(aiCallLog);

    expect(dto).toEqual({
      publicId: "ai_call_log_public_id",
      userPublicId: "user_public_id",
      answerRecordPublicId: "answer_record_public_id",
      mockExamPublicId: "mock_exam_public_id",
      questionPublicId: "question_public_id",
      aiFuncType: "scoring",
      callStatus: "failed",
      modelConfigSnapshot: aiCallLog.model_config_snapshot,
      promptTemplateKey: "ai_scoring_v1",
      promptTemplateVersion: 1,
      requestRedactedSnapshot: aiCallLog.request_redacted_snapshot,
      responseRedactedSnapshot: null,
      errorRedactedSnapshot: aiCallLog.error_redacted_snapshot,
      citationRedactedSnapshot: aiCallLog.citation_redacted_snapshot,
      promptTokenCount: 100,
      completionTokenCount: null,
      totalTokenCount: null,
      latencyMs: 1000,
      startedAt: "2026-05-20T08:00:00.000Z",
      completedAt: "2026-05-20T08:00:01.000Z",
      createdAt: "2026-05-20T08:00:00.000Z",
    });
    expect(dto).not.toHaveProperty("id");
    expect(dto).not.toHaveProperty("modelConfigId");
    expect(dto).not.toHaveProperty("promptTemplateId");
  });
});

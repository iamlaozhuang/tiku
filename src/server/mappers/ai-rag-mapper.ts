import type { AiCallLogDto } from "../contracts/ai-rag-contract";
import type { AiCallLogRow } from "../models/ai-rag";

export function mapAiCallLogToApi(aiCallLog: AiCallLogRow): AiCallLogDto {
  return {
    publicId: aiCallLog.public_id,
    userPublicId: aiCallLog.user_public_id,
    answerRecordPublicId: aiCallLog.answer_record_public_id,
    mockExamPublicId: aiCallLog.mock_exam_public_id,
    questionPublicId: aiCallLog.question_public_id,
    aiFuncType: aiCallLog.ai_func_type,
    callStatus: aiCallLog.call_status,
    modelConfigSnapshot: aiCallLog.model_config_snapshot,
    promptTemplateKey: aiCallLog.prompt_template_key,
    promptTemplateVersion: aiCallLog.prompt_template_version,
    requestRedactedSnapshot: aiCallLog.request_redacted_snapshot,
    responseRedactedSnapshot: aiCallLog.response_redacted_snapshot,
    errorRedactedSnapshot: aiCallLog.error_redacted_snapshot,
    citationRedactedSnapshot: aiCallLog.citation_redacted_snapshot,
    promptTokenCount: aiCallLog.prompt_token_count,
    completionTokenCount: aiCallLog.completion_token_count,
    totalTokenCount: aiCallLog.total_token_count,
    latencyMs: aiCallLog.latency_ms,
    startedAt: aiCallLog.started_at.toISOString(),
    completedAt: aiCallLog.completed_at?.toISOString() ?? null,
    createdAt: aiCallLog.created_at.toISOString(),
  };
}

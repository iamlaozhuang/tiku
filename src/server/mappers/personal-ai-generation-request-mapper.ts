import type { PersonalAiGenerationRequestHistoryItemDto } from "../contracts/personal-ai-generation-request-history-contract";
import type { AiGenerationTaskStatus } from "../models/ai-generation-task";
import type { EvidenceStatus } from "../models/ai-rag";

export type PersonalAiGenerationRequestPersistenceRow = {
  public_id: string;
  request_public_id: string;
  task_status: AiGenerationTaskStatus;
  requested_at: Date;
  result_public_id: string | null;
  evidence_status: EvidenceStatus;
  citation_count: number;
  ai_call_log_public_id: string | null;
  owner_public_id?: string;
  idempotency_key_hash?: string;
};

export function mapPersonalAiGenerationRequestRowToHistoryDto(
  row: PersonalAiGenerationRequestPersistenceRow,
): PersonalAiGenerationRequestHistoryItemDto {
  return {
    requestPublicId: row.request_public_id,
    taskPublicId: row.public_id,
    status: row.task_status,
    requestedAt: row.requested_at.toISOString(),
    resultPublicId: row.result_public_id,
    evidenceStatus: row.evidence_status,
    citationCount: row.citation_count,
    aiCallLogPublicId: row.ai_call_log_public_id,
    redactionStatus: "redacted",
  };
}

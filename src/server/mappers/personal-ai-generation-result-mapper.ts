import type { PersonalAiGenerationResultDto } from "../contracts/personal-ai-generation-result-persistence-contract";
import type { AiGenerationTaskType } from "../models/ai-generation-task";
import type { EvidenceStatus, RedactedJsonObject } from "../models/ai-rag";
import type { PersonalAiGenerationResultStatus } from "../models/personal-ai-generation-result";

export type PersonalAiGenerationResultPersistenceRow = {
  id?: number;
  public_id: string;
  ai_generation_task_id: number;
  task_public_id: string;
  request_public_id: string;
  owner_public_id: string;
  task_type: Exclude<AiGenerationTaskType, "organization_training_generation">;
  result_status: PersonalAiGenerationResultStatus;
  content_redacted_snapshot: RedactedJsonObject;
  content_digest: string;
  content_preview_masked: string;
  citation_redacted_snapshot: RedactedJsonObject | null;
  evidence_status: EvidenceStatus;
  citation_count: number;
  ai_call_log_public_id: string | null;
  is_formal_adoption_blocked: boolean;
  created_at: Date;
  updated_at: Date;
};

export function mapPersonalAiGenerationResultRowToDto(
  row: PersonalAiGenerationResultPersistenceRow,
): PersonalAiGenerationResultDto {
  return {
    resultPublicId: row.public_id,
    taskPublicId: row.task_public_id,
    requestPublicId: row.request_public_id,
    taskType: row.task_type,
    status: row.result_status,
    persistedAt: row.created_at.toISOString(),
    contentReference: {
      contentDigest: row.content_digest,
      contentPreviewMasked: row.content_preview_masked,
      contentVisibility: "redacted_snapshot",
      redactionStatus: "redacted",
    },
    evidenceReference: {
      evidenceStatus: row.evidence_status,
      citationCount: row.citation_count,
      aiCallLogPublicId: row.ai_call_log_public_id,
      redactionStatus: "redacted",
    },
    formalAdoption: {
      isBlocked: true,
      status: "blocked",
    },
  };
}

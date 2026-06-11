import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type { AiGenerationTaskLogEvidenceReferenceDto } from "../contracts/ai-generation-task-log-evidence-reference-contract";
import {
  createAiGenerationTaskLogEvidenceReferenceItem,
  type AiGenerationTaskLogEvidenceReferenceInput,
} from "../models/ai-generation-task-log-evidence-reference";
import { normalizeAiGenerationTaskLogEvidenceReferenceInput } from "../validators/ai-generation-task-log-evidence-reference";

const INVALID_AI_GENERATION_TASK_LOG_EVIDENCE_REFERENCE_INPUT_CODE = 400013;

function mapAiGenerationTaskLogEvidenceReferenceToDto(
  input: AiGenerationTaskLogEvidenceReferenceInput,
): AiGenerationTaskLogEvidenceReferenceDto {
  return {
    runtimeStatus: "local_contract_only",
    taskPublicId: input.taskPublicId,
    taskType: input.taskType,
    status: input.status,
    failureCategory: input.failureCategory,
    resultReference: {
      publicId: input.resultPublicId,
      visibility: "summary_only",
      redactionStatus: "redacted",
      evidenceStatus: input.evidenceStatus,
    },
    evidenceReferences: {
      auditLog: createAiGenerationTaskLogEvidenceReferenceItem(
        "audit_log",
        input.auditLogPublicId,
        input.auditLogRetentionDay,
      ),
      aiCallLog: createAiGenerationTaskLogEvidenceReferenceItem(
        "ai_call_log",
        input.aiCallLogPublicId,
        input.aiCallLogRetentionDay,
      ),
    },
  };
}

export function buildAiGenerationTaskLogEvidenceReferenceReadModel(
  input: unknown,
): ApiResponse<AiGenerationTaskLogEvidenceReferenceDto | null> {
  const aiGenerationTaskLogEvidenceReferenceInput =
    normalizeAiGenerationTaskLogEvidenceReferenceInput(input);

  if (!aiGenerationTaskLogEvidenceReferenceInput.success) {
    return createErrorResponse(
      INVALID_AI_GENERATION_TASK_LOG_EVIDENCE_REFERENCE_INPUT_CODE,
      aiGenerationTaskLogEvidenceReferenceInput.message,
    );
  }

  return createSuccessResponse(
    mapAiGenerationTaskLogEvidenceReferenceToDto(
      aiGenerationTaskLogEvidenceReferenceInput.value,
    ),
  );
}

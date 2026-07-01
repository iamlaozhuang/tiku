import type {
  AiGenerationTaskStatus,
  AiGenerationTaskType,
} from "./ai-generation-task";
import type { EvidenceStatus } from "./ai-rag";

export type PersonalAiGenerationRequestHistoryRedactionStatus = "redacted";

export type PersonalAiGenerationRequestHistoryInput = {
  requestPublicId: string;
  taskPublicId: string;
  taskType: Exclude<AiGenerationTaskType, "organization_training_generation">;
  status: AiGenerationTaskStatus;
  requestedAt: string;
  resultPublicId: string | null;
  evidenceStatus: EvidenceStatus;
  citationCount: number;
  aiCallLogPublicId: string | null;
};

export function comparePersonalAiGenerationRequestHistoryInput(
  leftInput: PersonalAiGenerationRequestHistoryInput,
  rightInput: PersonalAiGenerationRequestHistoryInput,
): number {
  const requestedAtComparison = rightInput.requestedAt.localeCompare(
    leftInput.requestedAt,
  );

  return requestedAtComparison === 0
    ? leftInput.requestPublicId.localeCompare(rightInput.requestPublicId)
    : requestedAtComparison;
}

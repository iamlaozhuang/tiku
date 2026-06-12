import type {
  AiGenerationTaskFailureCategory,
  AiGenerationTaskStatus,
} from "./ai-generation-task";
import type { EvidenceStatus } from "./ai-rag";
import type { PersonalAiGenerationResultReferenceTaskType } from "./personal-ai-generation-result-reference";

export type PersonalAiGenerationAiCallLogReferenceRuntimeStatus =
  "local_contract_only";

export type PersonalAiGenerationAiCallLogReferenceStatus = "redacted_reference";

export type PersonalAiGenerationAiCallLogRawContentStatus = "not_stored";

export type PersonalAiGenerationAiCallLogReferenceInput = {
  taskPublicId: string;
  taskType: PersonalAiGenerationResultReferenceTaskType;
  status: AiGenerationTaskStatus;
  failureCategory: AiGenerationTaskFailureCategory | null;
  resultPublicId: string | null;
  evidenceStatus: EvidenceStatus;
  citationCount: number;
  aiCallLogPublicId: string | null;
};

export function resolvePersonalAiGenerationAiCallLogRawContentStatus(): PersonalAiGenerationAiCallLogRawContentStatus {
  return "not_stored";
}

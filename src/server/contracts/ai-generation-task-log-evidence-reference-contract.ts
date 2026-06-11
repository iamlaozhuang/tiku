import type {
  AiGenerationTaskFailureCategory,
  AiGenerationTaskStatus,
  AiGenerationTaskType,
} from "../models/ai-generation-task";
import type {
  AiGenerationTaskLogEvidenceRedactionStatus,
  AiGenerationTaskLogEvidenceReferenceItem,
  AiGenerationTaskLogEvidenceRuntimeStatus,
  AiGenerationTaskLogEvidenceVisibility,
} from "../models/ai-generation-task-log-evidence-reference";
import type { EvidenceStatus } from "../models/ai-rag";

export type AiGenerationTaskLogEvidenceResultReferenceDto = {
  publicId: string | null;
  visibility: AiGenerationTaskLogEvidenceVisibility;
  redactionStatus: AiGenerationTaskLogEvidenceRedactionStatus;
  evidenceStatus: EvidenceStatus;
};

export type AiGenerationTaskLogEvidenceReferencesDto = {
  auditLog: AiGenerationTaskLogEvidenceReferenceItem;
  aiCallLog: AiGenerationTaskLogEvidenceReferenceItem;
};

export type AiGenerationTaskLogEvidenceReferenceDto = {
  runtimeStatus: AiGenerationTaskLogEvidenceRuntimeStatus;
  taskPublicId: string;
  taskType: AiGenerationTaskType;
  status: AiGenerationTaskStatus;
  failureCategory: AiGenerationTaskFailureCategory | null;
  resultReference: AiGenerationTaskLogEvidenceResultReferenceDto;
  evidenceReferences: AiGenerationTaskLogEvidenceReferencesDto;
};

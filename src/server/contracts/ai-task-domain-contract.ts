import type { AiFuncType } from "../models/ai-rag";
import type {
  AiTaskDomainRuntimeStatus,
  AiTaskDomainStatus,
} from "../models/ai-task-domain";

export type AiTaskDomainContextDto = {
  questionPublicId: string;
  answerRecordPublicId: string | null;
  paperPublicId: string | null;
  mockExamPublicId: string | null;
};

export type AiTaskDomainEvidenceReferencesDto = {
  auditLogPublicId: string | null;
  aiCallLogPublicId: string | null;
  redactionStatus: "redacted";
};

export type AiTaskDomainDto = {
  userPublicId: string;
  authorizationPublicId: string;
  aiFuncType: AiFuncType;
  runtimeStatus: AiTaskDomainRuntimeStatus;
  taskStatus: AiTaskDomainStatus;
  taskContext: AiTaskDomainContextDto;
  evidenceReferences: AiTaskDomainEvidenceReferencesDto;
};

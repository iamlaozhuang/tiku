import type { AiFuncType } from "../models/ai-rag";
import type { AiTaskDomainRuntimeStatus } from "../models/ai-task-domain";

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
  taskContext: AiTaskDomainContextDto;
  evidenceReferences: AiTaskDomainEvidenceReferencesDto;
};

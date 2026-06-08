import type { AiFuncType } from "./ai-rag";

export type AiTaskDomainRuntimeStatus = "local_contract_only";

export type AiTaskDomainInput = {
  userPublicId: string;
  authorizationPublicId: string;
  aiFuncType: AiFuncType;
  questionPublicId: string;
  answerRecordPublicId: string | null;
  paperPublicId: string | null;
  mockExamPublicId: string | null;
  auditLogPublicId: string | null;
  aiCallLogPublicId: string | null;
};

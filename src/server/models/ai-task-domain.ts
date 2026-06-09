import type { AiFuncType } from "./ai-rag";

export type AiTaskDomainRuntimeStatus = "local_contract_only";

export const aiTaskDomainStatusValues = [
  "pending",
  "running",
  "succeeded",
  "failed",
  "timeout",
  "cancelled",
] as const;

export type AiTaskDomainStatus = (typeof aiTaskDomainStatusValues)[number];

export type AiTaskDomainInput = {
  userPublicId: string;
  authorizationPublicId: string;
  aiFuncType: AiFuncType;
  taskStatus: AiTaskDomainStatus;
  questionPublicId: string;
  answerRecordPublicId: string | null;
  paperPublicId: string | null;
  mockExamPublicId: string | null;
  auditLogPublicId: string | null;
  aiCallLogPublicId: string | null;
};

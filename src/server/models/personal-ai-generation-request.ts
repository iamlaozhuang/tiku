import type { AiFuncType } from "./ai-rag";

export type PersonalAiGenerationFuncType = Exclude<AiFuncType, "scoring">;

export type PersonalAiGenerationRuntimeStatus = "local_contract_only";

export type PersonalAiGenerationRequestInput = {
  userPublicId: string;
  authorizationPublicId: string;
  aiFuncType: PersonalAiGenerationFuncType;
  questionPublicId: string;
  answerRecordPublicId: string | null;
  paperPublicId: string | null;
  mockExamPublicId: string | null;
  redeemCodePublicId: string | null;
  auditLogPublicId: string | null;
  aiCallLogPublicId: string | null;
};

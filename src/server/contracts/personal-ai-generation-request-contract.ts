import type {
  PersonalAiGenerationFuncType,
  PersonalAiGenerationRuntimeStatus,
} from "../models/personal-ai-generation-request";

export type PersonalAiGenerationRequestDto = {
  userPublicId: string;
  authorizationPublicId: string;
  aiFuncType: PersonalAiGenerationFuncType;
  runtimeStatus: PersonalAiGenerationRuntimeStatus;
  generationContext: {
    questionPublicId: string;
    answerRecordPublicId: string | null;
    paperPublicId: string | null;
    mockExamPublicId: string | null;
  };
  redeemCodeReference: {
    publicId: string | null;
    redactionStatus: "redacted";
  };
  evidenceReferences: {
    auditLogPublicId: string | null;
    aiCallLogPublicId: string | null;
    redactionStatus: "redacted";
  };
};

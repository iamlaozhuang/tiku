import type {
  PersonalAiGenerationFuncType,
  PersonalAiGenerationRequestContextSelection,
  PersonalAiGenerationRuntimeStatus,
} from "../models/personal-ai-generation-request";

export type PersonalAiGenerationRequestContextDto = {
  userPublicId: string;
  authorizationBoundary: {
    authorizationSource: "personal_auth";
    authorizationPublicId: string;
    ownerType: "personal";
    quotaOwnerType: "personal";
  };
  aiFuncType: PersonalAiGenerationFuncType;
  runtimeStatus: PersonalAiGenerationRuntimeStatus;
  selectedContext: PersonalAiGenerationRequestContextSelection;
  redactionStatus: "redacted";
};

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
    selectedContext: PersonalAiGenerationRequestContextSelection;
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

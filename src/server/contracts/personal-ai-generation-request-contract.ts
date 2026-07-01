import type {
  PersonalAiGenerationFuncType,
  PersonalAiGenerationRequestContextSelection,
  PersonalAiGenerationRuntimeStatus,
} from "../models/personal-ai-generation-request";
import type {
  AiGenerationTaskRequestAuthorizationSource,
  AiGenerationTaskRequestOwnerType,
} from "../models/ai-generation-task-request";
import type { AiGenerationRouteIntegratedGenerationParameters } from "./route-integrated-provider-execution-contract";

export type PersonalAiGenerationRequestContextDto = {
  userPublicId: string;
  authorizationBoundary: {
    authorizationSource: AiGenerationTaskRequestAuthorizationSource;
    authorizationPublicId: string;
    ownerType: AiGenerationTaskRequestOwnerType;
    ownerPublicId: string;
    organizationPublicId: string | null;
    quotaOwnerType: AiGenerationTaskRequestOwnerType;
    quotaOwnerPublicId: string;
  };
  aiFuncType: PersonalAiGenerationFuncType;
  runtimeStatus: PersonalAiGenerationRuntimeStatus;
  selectedContext: PersonalAiGenerationRequestContextSelection;
  contextReferences: {
    paperPublicId: string | null;
    mockExamPublicId: string | null;
    redactionStatus: "redacted";
  };
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
  generationParameters: AiGenerationRouteIntegratedGenerationParameters | null;
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

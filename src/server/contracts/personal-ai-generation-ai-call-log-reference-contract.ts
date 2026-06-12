import type {
  AiGenerationTaskFailureCategory,
  AiGenerationTaskStatus,
} from "../models/ai-generation-task";
import type { EvidenceStatus } from "../models/ai-rag";
import type {
  PersonalAiGenerationAiCallLogRawContentStatus,
  PersonalAiGenerationAiCallLogReferenceRuntimeStatus,
  PersonalAiGenerationAiCallLogReferenceStatus,
} from "../models/personal-ai-generation-ai-call-log-reference";
import type {
  PersonalAiGenerationResultContentVisibility,
  PersonalAiGenerationResultReferenceRedactionStatus,
  PersonalAiGenerationResultReferenceTaskType,
} from "../models/personal-ai-generation-result-reference";

export type PersonalAiGenerationAiCallLogReferenceDto = {
  runtimeStatus: PersonalAiGenerationAiCallLogReferenceRuntimeStatus;
  taskPublicId: string;
  taskType: PersonalAiGenerationResultReferenceTaskType;
  status: AiGenerationTaskStatus;
  failureCategory: AiGenerationTaskFailureCategory | null;
  referenceStatus: PersonalAiGenerationAiCallLogReferenceStatus;
  aiCallLogReference: {
    publicId: string | null;
    contentVisibility: PersonalAiGenerationResultContentVisibility;
    redactionStatus: PersonalAiGenerationResultReferenceRedactionStatus;
    rawPromptStatus: PersonalAiGenerationAiCallLogRawContentStatus;
    rawGeneratedContentStatus: PersonalAiGenerationAiCallLogRawContentStatus;
    providerPayloadStatus: PersonalAiGenerationAiCallLogRawContentStatus;
  };
  resultReference: {
    resultPublicId: string | null;
    contentVisibility: PersonalAiGenerationResultContentVisibility;
    redactionStatus: PersonalAiGenerationResultReferenceRedactionStatus;
    evidenceStatus: EvidenceStatus;
    citationCount: number;
    rawGeneratedContentStatus: PersonalAiGenerationAiCallLogRawContentStatus;
  };
};

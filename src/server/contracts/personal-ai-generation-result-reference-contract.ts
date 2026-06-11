import type {
  AiGenerationTaskFailureCategory,
  AiGenerationTaskStatus,
} from "../models/ai-generation-task";
import type {
  PersonalAiGenerationResultContentVisibility,
  PersonalAiGenerationResultReferenceRedactionStatus,
  PersonalAiGenerationResultReferenceRuntimeStatus,
  PersonalAiGenerationResultReferenceTaskType,
} from "../models/personal-ai-generation-result-reference";
import type { EvidenceStatus } from "../models/ai-rag";

export type PersonalAiGenerationResultReferenceDto = {
  runtimeStatus: PersonalAiGenerationResultReferenceRuntimeStatus;
  taskPublicId: string;
  taskType: PersonalAiGenerationResultReferenceTaskType;
  status: AiGenerationTaskStatus;
  failureCategory: AiGenerationTaskFailureCategory | null;
  resultReference: {
    resultPublicId: string | null;
    contentVisibility: PersonalAiGenerationResultContentVisibility;
    redactionStatus: PersonalAiGenerationResultReferenceRedactionStatus;
    evidenceStatus: EvidenceStatus;
    citationCount: number;
  };
  aiCallLogReference: {
    aiCallLogPublicId: string | null;
    contentVisibility: PersonalAiGenerationResultContentVisibility;
    redactionStatus: PersonalAiGenerationResultReferenceRedactionStatus;
  };
};

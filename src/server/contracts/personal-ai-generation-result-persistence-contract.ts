import type {
  PersonalAiGenerationResultContentVisibility,
  PersonalAiGenerationResultFormalAdoptionStatus,
  PersonalAiGenerationResultRedactionStatus,
  PersonalAiGenerationResultStatus,
  PersonalAiGenerationResultTaskType,
} from "../models/personal-ai-generation-result";
import type { EvidenceStatus } from "../models/ai-rag";

export type PersonalAiGenerationResultDto = {
  resultPublicId: string;
  taskPublicId: string;
  requestPublicId: string;
  taskType: PersonalAiGenerationResultTaskType;
  status: PersonalAiGenerationResultStatus;
  persistedAt: string;
  contentReference: {
    contentDigest: string;
    contentPreviewMasked: string;
    contentVisibility: PersonalAiGenerationResultContentVisibility;
    redactionStatus: PersonalAiGenerationResultRedactionStatus;
  };
  evidenceReference: {
    evidenceStatus: EvidenceStatus;
    citationCount: number;
    aiCallLogPublicId: string | null;
    redactionStatus: PersonalAiGenerationResultRedactionStatus;
  };
  formalAdoption: {
    isBlocked: true;
    status: PersonalAiGenerationResultFormalAdoptionStatus;
  };
};

export type PersonalAiGenerationResultPersistenceDto = {
  persistenceStatus: "created" | "reused";
  result: PersonalAiGenerationResultDto;
};

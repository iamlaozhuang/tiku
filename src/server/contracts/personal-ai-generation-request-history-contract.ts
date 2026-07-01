import type {
  AiGenerationTaskStatus,
  AiGenerationTaskType,
} from "../models/ai-generation-task";
import type { EvidenceStatus } from "../models/ai-rag";
import type { PersonalAiGenerationRequestHistoryRedactionStatus } from "../models/personal-ai-generation-request-history";

export type PersonalAiGenerationRequestHistoryItemDto = {
  requestPublicId: string;
  taskPublicId: string;
  taskType: Exclude<AiGenerationTaskType, "organization_training_generation">;
  status: AiGenerationTaskStatus;
  requestedAt: string;
  resultPublicId: string | null;
  evidenceStatus: EvidenceStatus;
  citationCount: number;
  aiCallLogPublicId: string | null;
  redactionStatus: PersonalAiGenerationRequestHistoryRedactionStatus;
};

export type PersonalAiGenerationRequestHistoryDto =
  PersonalAiGenerationRequestHistoryItemDto[];

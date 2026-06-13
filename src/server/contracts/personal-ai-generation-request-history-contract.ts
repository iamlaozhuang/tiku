import type { AiGenerationTaskStatus } from "../models/ai-generation-task";
import type { EvidenceStatus } from "../models/ai-rag";
import type { PersonalAiGenerationRequestHistoryRedactionStatus } from "../models/personal-ai-generation-request-history";

export type PersonalAiGenerationRequestHistoryItemDto = {
  requestPublicId: string;
  taskPublicId: string;
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

import type {
  AiGenerationTaskStatus,
  AiGenerationTaskType,
} from "../models/ai-generation-task";
import type { EvidenceStatus } from "../models/ai-rag";
import type { PersonalAiGenerationRequestHistoryRedactionStatus } from "../models/personal-ai-generation-request-history";
import type { AiGenerationTaskRequestAuthorizationSource } from "../models/ai-generation-task-request";
import type { AiGenerationRouteIntegratedGenerationParameters } from "./route-integrated-provider-execution-contract";

export type PersonalAiGenerationRequestHistoryGenerationSnapshot =
  | {
      status: "available";
      schemaVersion: 1;
      generationParameters: AiGenerationRouteIntegratedGenerationParameters;
      constraints: {
        authorizationSource: Extract<
          AiGenerationTaskRequestAuthorizationSource,
          "personal_auth" | "org_auth"
        >;
        effectiveEdition: string;
        profession: AiGenerationRouteIntegratedGenerationParameters["profession"];
        level: AiGenerationRouteIntegratedGenerationParameters["level"];
        redactionStatus: "redacted";
      };
    }
  | {
      status: "unavailable";
      reason: "legacy_snapshot_unavailable";
    };

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
  generationSnapshot?: PersonalAiGenerationRequestHistoryGenerationSnapshot;
  redactionStatus: PersonalAiGenerationRequestHistoryRedactionStatus;
};

export type PersonalAiGenerationRequestHistoryDto =
  PersonalAiGenerationRequestHistoryItemDto[];

import type {
  AiGenerationTaskFailureCategory,
  AiGenerationTaskStatus,
  AiGenerationTaskType,
} from "../models/ai-generation-task";
import type {
  AiGenerationTaskRequestAuthorizationSource,
  AiGenerationTaskRequestDecision,
  AiGenerationTaskRequestOwnerType,
  AiGenerationTaskRequestRuntimeStatus,
  AiGenerationTaskResultContentVisibility,
  AiGenerationTaskResultKind,
} from "../models/ai-generation-task-request";
import type { EvidenceStatus } from "../models/ai-rag";

export type AiGenerationTaskResultReferenceDto = {
  resultKind: AiGenerationTaskResultKind;
  resultPublicId: string | null;
  contentVisibility: AiGenerationTaskResultContentVisibility;
  redactionStatus: "redacted";
  evidenceStatus: EvidenceStatus;
  citationCount: number;
};

export type AiGenerationTaskRequestPolicyDto = {
  runtimeStatus: AiGenerationTaskRequestRuntimeStatus;
  decision: AiGenerationTaskRequestDecision;
  taskPublicId: string;
  taskType: AiGenerationTaskType;
  initialStatus: AiGenerationTaskStatus | null;
  blockedFailureCategory: AiGenerationTaskFailureCategory | null;
  authorizationSource: AiGenerationTaskRequestAuthorizationSource;
  authorizationPublicId: string;
  actorPublicId: string;
  ownerType: AiGenerationTaskRequestOwnerType;
  ownerPublicId: string;
  organizationPublicId: string | null;
  quotaOwnerType: AiGenerationTaskRequestOwnerType;
  quotaOwnerPublicId: string;
  idempotency: {
    keyHash: string;
    reuseTaskPublicId: string | null;
  };
  resultReference: AiGenerationTaskResultReferenceDto;
  evidenceReferences: {
    auditLogPublicId: string | null;
    aiCallLogPublicId: string | null;
    redactionStatus: "redacted";
  };
};

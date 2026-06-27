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
    isFormalAdoptionBlocked: boolean;
    redactionStatus: PersonalAiGenerationResultReferenceRedactionStatus;
    evidenceStatus: EvidenceStatus;
    citationCount: number;
  };
  aiCallLogReference: {
    aiCallLogPublicId: string | null;
    contentVisibility: PersonalAiGenerationResultContentVisibility;
    redactionStatus: PersonalAiGenerationResultReferenceRedactionStatus;
  };
  privateUseBoundary: PersonalAiGenerationPrivateUseBoundaryDto;
};

export type PersonalAiGenerationPrivateUseBoundaryDto = {
  generatedResultScope: "learner_private";
  resultHistoryStatus: "available";
  privatePracticeAttemptSourceStatus: "allowed_as_private_practice_attempt_source";
  privatePaperAttemptSourceStatus: "allowed_as_private_paper_attempt_source";
  organizationPrivateAdoptionStatus: "blocked_without_organization_admin_task";
  platformFormalDraftStatus: "blocked_requires_content_admin_review";
  publishStatus: "blocked_requires_fresh_publish_task";
  studentVisibleStatus: "blocked";
  redactionStatus: "redacted";
};

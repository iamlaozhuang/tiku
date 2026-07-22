import type {
  AiPaperPlanAndSelectContainerDto,
  AiPaperPlanAndSelectInsufficiencyDto,
} from "./ai-paper-plan-and-select-contract";
import type {
  PersonalAiGenerationResultContentVisibility,
  PersonalAiGenerationResultFormalAdoptionStatus,
  PersonalAiGenerationResultRedactionStatus,
  PersonalAiGenerationResultStatus,
  PersonalAiGenerationResultTaskType,
} from "../models/personal-ai-generation-result";
import type { EvidenceStatus } from "../models/ai-rag";
import type { AiGenerationRouteIntegratedQuestionDraftSummary } from "./route-integrated-provider-execution-contract";

export type PersonalAiGenerationQuestionDraftSnapshotDto = {
  schemaVersion: "question_draft_v1";
  kind: "question_set";
  taskPublicId: string;
  ownerPublicId: string;
  taskType: "ai_question_generation";
  requestedQuestionCount: number;
  questions: AiGenerationRouteIntegratedQuestionDraftSummary[];
};

export type PersonalAiGenerationPrivateQuestionDraftSnapshotDto = {
  schemaVersion: "question_draft_v1";
  snapshot: PersonalAiGenerationQuestionDraftSnapshotDto;
  digest: string;
};

export type PersonalAiGenerationResultPaperAssemblySnapshotDto = {
  status: "assembled" | "insufficient";
  sourceDiagnostics: {
    role: "personal_advanced_student" | "org_advanced_employee";
    platformQuestionCount: number;
    enterpriseQuestionCount: number;
    enterpriseSourceStatus: "not_applicable" | "resolved" | "not_resolved";
  };
  container: AiPaperPlanAndSelectContainerDto;
  insufficiency: AiPaperPlanAndSelectInsufficiencyDto | null;
  redactionStatus: "redacted";
};

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
  paperAssembly: PersonalAiGenerationResultPaperAssemblySnapshotDto | null;
};

export type PersonalAiGenerationResultPersistenceDto = {
  persistenceStatus: "created" | "reused";
  result: PersonalAiGenerationResultDto;
};

import type {
  AdminAiGenerationResultContentVisibility,
  AdminAiGenerationResultFormalAdoptionStatus,
  AdminAiGenerationResultOwnerType,
  AdminAiGenerationResultPersistenceInput,
  AdminAiGenerationResultRedactionStatus,
  AdminAiGenerationResultStatus,
  AdminAiGenerationResultTaskType,
} from "../models/admin-ai-generation-result";
import type { EvidenceStatus, RedactedJsonObject } from "../models/ai-rag";
import type {
  AdminAiGenerationKind,
  AdminAiGenerationWorkspace,
} from "./admin-ai-generation-local-contract";
import type { AdminAiGenerationFormalReviewedDraftPayload } from "./admin-ai-generation-formal-draft-adapter-contract";
import type {
  OrganizationTrainingAdminPaperSectionDetailDto,
  OrganizationTrainingAdminQuestionDetailDto,
} from "./organization-training-contract";
import type {
  AiPaperMatchQuality,
  AiPaperSelectedQuestionDto,
} from "./ai-paper-plan-and-select-contract";

export type AdminAiGenerationOrganizationTrainingQuestionDraftPayload = {
  questions: OrganizationTrainingAdminQuestionDetailDto[];
};

export type AdminAiGenerationOrganizationTrainingPaperAssemblySectionPayload = {
  sectionKey: string;
  title: string;
  questionType: OrganizationTrainingAdminPaperSectionDetailDto["questionType"];
  targetQuestionCount: number;
  selectedQuestionCount: number;
  selectedQuestions: AiPaperSelectedQuestionDto[];
};

export type AdminAiGenerationOrganizationTrainingPaperDraftPayload = {
  paperTitle: string;
  requestedQuestionCount: number;
  selectedQuestionCount: number;
  sourceComposition: {
    platformFormalQuestionCount: number;
    enterpriseTrainingSnapshotCount: number;
  };
  matchQuality: AiPaperMatchQuality;
  assemblySections?: AdminAiGenerationOrganizationTrainingPaperAssemblySectionPayload[];
  paperSections?: OrganizationTrainingAdminPaperSectionDetailDto[];
  questions?: OrganizationTrainingAdminQuestionDetailDto[];
  redactionStatus: "admin_safe_detail";
};

export type CreateAdminAiGenerationResultInput =
  AdminAiGenerationResultPersistenceInput;

export type AdminAiGenerationResultPersistenceRow = {
  id?: number;
  public_id: string;
  ai_generation_task_id: number;
  task_public_id: string;
  request_public_id: string;
  workspace: AdminAiGenerationWorkspace;
  generation_kind: AdminAiGenerationKind;
  owner_type: AdminAiGenerationResultOwnerType;
  owner_public_id: string;
  organization_public_id: string | null;
  task_type: AdminAiGenerationResultTaskType;
  result_status: AdminAiGenerationResultStatus;
  content_redacted_snapshot: RedactedJsonObject;
  content_digest: string;
  content_preview_masked: string;
  citation_redacted_snapshot: RedactedJsonObject | null;
  evidence_status: EvidenceStatus;
  citation_count: number;
  ai_call_log_public_id: string | null;
  source_question_public_id: string | null;
  source_paper_public_id: string | null;
  is_formal_adoption_blocked: boolean;
  created_at: Date;
  updated_at: Date;
};

export type AdminAiGenerationResultTaskRow = {
  id: number;
  public_id: string;
  request_public_id: string;
  workspace: AdminAiGenerationWorkspace;
  owner_type: AdminAiGenerationResultOwnerType;
  owner_public_id: string;
  organization_public_id: string | null;
  task_type: AdminAiGenerationResultTaskType;
};

export type AdminAiGenerationResultHistoryQuery = {
  workspace: AdminAiGenerationWorkspace;
  ownerType: AdminAiGenerationResultOwnerType;
  ownerPublicId: string;
  generationKind: AdminAiGenerationKind;
  page: number;
  pageSize: number;
  limit?: number;
  offset: number;
};

export type FindAdminAiGenerationResultByTaskQuery = {
  workspace: AdminAiGenerationWorkspace;
  ownerType: AdminAiGenerationResultOwnerType;
  ownerPublicId: string;
  taskPublicId: string;
};

export type InsertAdminAiGenerationDraftResultInput =
  CreateAdminAiGenerationResultInput & {
    aiGenerationTaskId: number;
    requestPublicId: string;
    resultStatus: Extract<AdminAiGenerationResultStatus, "draft">;
    isFormalAdoptionBlocked: true;
  };

export type AttachAdminAiGenerationResultToTaskInput =
  FindAdminAiGenerationResultByTaskQuery & {
    resultPublicId: string;
    evidenceStatus: EvidenceStatus;
    citationCount: number;
    aiCallLogPublicId: string | null;
  };

export type AdminAiGenerationResultDto = {
  resultPublicId: string;
  taskPublicId: string;
  requestPublicId: string;
  workspace: AdminAiGenerationWorkspace;
  generationKind: AdminAiGenerationKind;
  ownerType: AdminAiGenerationResultOwnerType;
  ownerPublicId: string;
  organizationPublicId: string | null;
  taskType: AdminAiGenerationResultTaskType;
  status: AdminAiGenerationResultStatus;
  persistedAt: string;
  contentReference: {
    contentDigest: string;
    contentPreviewMasked: string;
    contentVisibility: AdminAiGenerationResultContentVisibility;
    reviewedDraft: AdminAiGenerationFormalReviewedDraftPayload | null;
    organizationTrainingDraft: AdminAiGenerationOrganizationTrainingQuestionDraftPayload | null;
    organizationTrainingPaperDraft: AdminAiGenerationOrganizationTrainingPaperDraftPayload | null;
    redactionStatus: AdminAiGenerationResultRedactionStatus;
  };
  evidenceReference: {
    evidenceStatus: EvidenceStatus;
    citationCount: number;
    aiCallLogPublicId: string | null;
    redactionStatus: AdminAiGenerationResultRedactionStatus;
  };
  sourceReference: {
    sourceQuestionPublicId: string | null;
    sourcePaperPublicId: string | null;
  };
  formalAdoption: {
    isBlocked: true;
    status: AdminAiGenerationResultFormalAdoptionStatus;
  };
};

export type AdminAiGenerationResultPersistenceResult = {
  persistenceStatus: "created" | "reused";
  result: AdminAiGenerationResultDto;
};

export type AdminAiGenerationResultPersistenceGateway = {
  listResultRows(
    query: Required<AdminAiGenerationResultHistoryQuery>,
  ): Promise<AdminAiGenerationResultPersistenceRow[]>;
  findResultByTaskPublicId(
    query: FindAdminAiGenerationResultByTaskQuery,
  ): Promise<AdminAiGenerationResultPersistenceRow | null>;
  findTaskByPublicId(
    query: FindAdminAiGenerationResultByTaskQuery,
  ): Promise<AdminAiGenerationResultTaskRow | null>;
  insertDraftResult(
    input: InsertAdminAiGenerationDraftResultInput,
  ): Promise<AdminAiGenerationResultPersistenceRow | null>;
  attachResultToTask(
    input: AttachAdminAiGenerationResultToTaskInput,
  ): Promise<void>;
};

export type AdminAiGenerationResultPersistenceRepository = {
  listDraftResults(
    query: AdminAiGenerationResultHistoryQuery,
  ): Promise<AdminAiGenerationResultDto[]>;
  findDraftResultByTaskPublicId(
    query: FindAdminAiGenerationResultByTaskQuery,
  ): Promise<AdminAiGenerationResultDto | null>;
  createOrReuseDraftResult(
    input: CreateAdminAiGenerationResultInput,
  ): Promise<AdminAiGenerationResultPersistenceResult>;
};

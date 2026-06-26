import type { EvidenceStatus } from "../models/ai-rag";
import type {
  AdminAiGenerationFormalAdoptionCommandInput,
  AdminAiGenerationFormalAdoptionReviewDecision,
  AdminAiGenerationFormalAdoptionReviewStatus,
  AdminAiGenerationFormalAdoptionSourceResult,
  AdminAiGenerationFormalAdoptionTargetDomain,
  AdminAiGenerationFormalAdoptionTargetType,
  AdminAiGenerationFormalTargetWriteStatus,
} from "../models/admin-ai-generation-formal-adoption";
import type {
  AdminAiGenerationKind,
  AdminAiGenerationWorkspace,
} from "./admin-ai-generation-local-contract";
import type { AdminAiGenerationResultOwnerType } from "../models/admin-ai-generation-result";

export type CreateAdminAiGenerationFormalAdoptionInput =
  AdminAiGenerationFormalAdoptionCommandInput;

export type FindAdminAiGenerationFormalAdoptionQuery = {
  sourceResultPublicId: string;
  targetType: AdminAiGenerationFormalAdoptionTargetType;
  targetDomain: AdminAiGenerationFormalAdoptionTargetDomain;
};

export type InsertAdminAiGenerationFormalAdoptionInput = {
  adoptionPublicId: string;
  sourceResultPublicId: string;
  sourceTaskPublicId: string;
  sourceRequestPublicId: string;
  workspace: AdminAiGenerationWorkspace;
  generationKind: AdminAiGenerationKind;
  ownerType: AdminAiGenerationResultOwnerType;
  ownerPublicId: string;
  organizationPublicId: string | null;
  targetType: AdminAiGenerationFormalAdoptionTargetType;
  targetDomain: AdminAiGenerationFormalAdoptionTargetDomain;
  reviewStatus: AdminAiGenerationFormalAdoptionReviewStatus;
  formalTargetWriteStatus: AdminAiGenerationFormalTargetWriteStatus;
  formalQuestionPublicId: string | null;
  formalPaperPublicId: string | null;
  reviewerPublicId: string;
  reviewedAt: Date;
  contentDigest: string;
  contentPreviewMasked: string;
  evidenceStatus: EvidenceStatus;
  citationCount: number;
  aiCallLogPublicId: string | null;
  createdAt: Date;
};

export type AdminAiGenerationFormalAdoptionRow = {
  adoption_public_id: string;
  source_result_public_id: string;
  source_task_public_id: string;
  source_request_public_id: string;
  workspace: AdminAiGenerationWorkspace;
  generation_kind: AdminAiGenerationKind;
  owner_type: AdminAiGenerationResultOwnerType;
  owner_public_id: string;
  organization_public_id: string | null;
  target_type: AdminAiGenerationFormalAdoptionTargetType;
  target_domain: AdminAiGenerationFormalAdoptionTargetDomain;
  review_status: AdminAiGenerationFormalAdoptionReviewStatus;
  formal_target_write_status: AdminAiGenerationFormalTargetWriteStatus;
  formal_question_public_id: string | null;
  formal_paper_public_id: string | null;
  reviewer_public_id: string;
  reviewed_at: Date;
  content_digest: string;
  content_preview_masked: string;
  evidence_status: EvidenceStatus;
  citation_count: number;
  ai_call_log_public_id: string | null;
  created_at: Date;
};

export type AdminAiGenerationFormalAdoptionDto = {
  adoptionPublicId: string;
  sourceReference: {
    resultPublicId: string;
    taskPublicId: string;
    requestPublicId: string;
    workspace: AdminAiGenerationWorkspace;
    generationKind: AdminAiGenerationKind;
    ownerType: AdminAiGenerationResultOwnerType;
    ownerPublicId: string;
    organizationPublicId: string | null;
  };
  targetReference: {
    targetType: AdminAiGenerationFormalAdoptionTargetType;
    targetDomain: AdminAiGenerationFormalAdoptionTargetDomain;
    formalTargetWriteStatus: AdminAiGenerationFormalTargetWriteStatus;
    formalQuestionPublicId: string | null;
    formalPaperPublicId: string | null;
  };
  review: {
    reviewStatus: AdminAiGenerationFormalAdoptionReviewStatus;
    reviewDecision: AdminAiGenerationFormalAdoptionReviewDecision;
    reviewerPublicId: string;
    reviewedAt: string;
  };
  sourceSummary: {
    contentDigest: string;
    contentPreviewMasked: string;
    evidenceStatus: EvidenceStatus;
    citationCount: number;
    aiCallLogPublicId: string | null;
    redactionStatus: "redacted";
  };
  audit: {
    actionType: "admin_ai_generation_result.formal_adoption.approve";
    targetResourceType: "admin_ai_generation_result";
    targetPublicId: string;
    redactionStatus: "redacted";
  };
  redactionStatus: "redacted";
};

export type AdminAiGenerationFormalAdoptionResult = {
  persistenceStatus: "created" | "reused";
  adoption: AdminAiGenerationFormalAdoptionDto;
};

export type AdminAiGenerationFormalAdoptionGateway = {
  findAdoptionBySourceResult(
    query: FindAdminAiGenerationFormalAdoptionQuery,
  ): Promise<AdminAiGenerationFormalAdoptionRow | null>;
  findSourceResultForAdoption(
    resultPublicId: string,
  ): Promise<AdminAiGenerationFormalAdoptionSourceResult | null>;
  insertAdoptionRecord(
    input: InsertAdminAiGenerationFormalAdoptionInput,
  ): Promise<AdminAiGenerationFormalAdoptionRow | null>;
};

export type AdminAiGenerationFormalAdoptionRepository = {
  createOrReuseFormalAdoption(
    input: CreateAdminAiGenerationFormalAdoptionInput,
  ): Promise<AdminAiGenerationFormalAdoptionResult>;
};

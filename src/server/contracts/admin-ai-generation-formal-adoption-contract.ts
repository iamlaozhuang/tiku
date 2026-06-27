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
import type {
  AdminAiGenerationResultOwnerType,
  AdminAiGenerationResultStatus,
  AdminAiGenerationResultTaskType,
} from "../models/admin-ai-generation-result";

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

export type MarkAdminAiGenerationFormalDraftCreatedInput = {
  adoptionPublicId: string;
  targetType: AdminAiGenerationFormalAdoptionTargetType;
  formalQuestionPublicId: string | null;
  formalPaperPublicId: string | null;
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

export type AdminAiGenerationFormalAdoptionReviewTraceabilityDto = {
  traceabilityStatus: "single_result_traceable";
  sourceGeneratedResultPublicId: string;
  validationStatus: "validated_for_formal_adoption";
  reviewStatus: AdminAiGenerationFormalAdoptionReviewStatus;
  reviewDecision: AdminAiGenerationFormalAdoptionReviewDecision;
  reviewerPublicId: string;
  reviewedAt: string;
  adoptAction: {
    actionStatus: "executed";
    actionType: "admin_ai_generation_result.formal_adoption.approve";
    actorPublicId: string;
    actionAt: string;
    formalTargetWriteStatus: AdminAiGenerationFormalTargetWriteStatus;
    formalQuestionPublicId: string | null;
    formalPaperPublicId: string | null;
  };
  rejectAction: {
    actionStatus: "not_executed";
    actorPublicId: null;
    actionAt: null;
  };
  directPublishStatus: "blocked_requires_fresh_publish_task";
  auditSummary: {
    actionType: "admin_ai_generation_result.formal_adoption.approve";
    targetResourceType: "admin_ai_generation_result";
    targetPublicId: string;
    redactionStatus: "redacted";
  };
  redactionStatus: "redacted";
};

export type AdminAiGenerationReviewBatchSelectionBlockedReason =
  | "blocked_non_content_workspace"
  | "blocked_unsafe_owner_scope"
  | "blocked_result_not_draft"
  | "blocked_formal_adoption_not_blocked"
  | "blocked_target_type_mismatch";

export type AdminAiGenerationReviewBatchSelectionSource = {
  resultPublicId: string;
  taskPublicId: string;
  requestPublicId: string;
  workspace: AdminAiGenerationWorkspace;
  generationKind: AdminAiGenerationKind;
  ownerType: AdminAiGenerationResultOwnerType;
  ownerPublicId: string;
  organizationPublicId: string | null;
  taskType: AdminAiGenerationResultTaskType;
  resultStatus: AdminAiGenerationResultStatus;
  isFormalAdoptionBlocked: boolean;
  contentDigest: string;
  contentPreviewMasked: string;
  evidenceStatus: EvidenceStatus;
  citationCount: number;
  generatedAt: string;
};

export type AdminAiGenerationReviewBatchSelectionCandidateDto = {
  resultPublicId: string;
  taskPublicId: string;
  requestPublicId: string;
  generationKind: AdminAiGenerationKind;
  validationStatus: "eligible" | "blocked";
  blockedReason: AdminAiGenerationReviewBatchSelectionBlockedReason | null;
  selectionState: "available" | "selected" | "blocked";
  contentPreviewMasked: string;
  contentDigest: string;
  evidenceStatus: EvidenceStatus;
  citationCount: number;
  generatedAt: string;
  formalTargetWriteStatus: "blocked_without_follow_up_task";
  batchAdoptionMutationStatus: "not_executed";
  redactionStatus: "redacted";
};

export type AdminAiGenerationReviewBatchSelectionPreviewInput = {
  candidates: readonly AdminAiGenerationReviewBatchSelectionSource[];
  selectedResultPublicIds: readonly string[];
  targetType: AdminAiGenerationFormalAdoptionTargetType;
};

export type AdminAiGenerationReviewBatchSelectionPreviewDto = {
  previewStatus:
    | "ready"
    | "empty"
    | "blocked_no_eligible_candidate"
    | "blocked_by_invalid_selection";
  targetType: AdminAiGenerationFormalAdoptionTargetType;
  selectionMode: "manual_batch_preview";
  batchAdoptionMutationStatus: "not_executed";
  validationState: {
    candidateCount: number;
    eligibleCount: number;
    blockedCount: number;
    selectedCount: number;
    invalidSelectedCount: number;
    previewOnly: true;
  };
  candidates: AdminAiGenerationReviewBatchSelectionCandidateDto[];
  redactionStatus: "redacted";
};

export type AdminAiGenerationReviewResultDiffStatus =
  | "ready"
  | "blocked_missing_adopted_draft";

export type AdminAiGenerationReviewResultDiffFieldKey =
  | "question"
  | "standard_answer"
  | "analysis"
  | "scoring_point"
  | "citation";

export type AdminAiGenerationReviewResultDiffChangeStatus =
  | "changed"
  | "unchanged"
  | "generated_result_only"
  | "adopted_draft_only";

export type AdminAiGenerationReviewResultDiffSegmentSource = {
  contentDigest: string;
  contentPreviewMasked: string;
};

export type AdminAiGenerationReviewResultDiffSegmentDto =
  AdminAiGenerationReviewResultDiffSegmentSource & {
    redactionStatus: "redacted";
  };

export type AdminAiGenerationReviewResultDiffFieldSource = {
  fieldKey: AdminAiGenerationReviewResultDiffFieldKey;
  generatedResultDigest: string | null;
  generatedResultPreviewMasked: string | null;
  adoptedDraftDigest: string | null;
  adoptedDraftPreviewMasked: string | null;
};

export type AdminAiGenerationReviewResultDiffFieldDto = {
  fieldKey: AdminAiGenerationReviewResultDiffFieldKey;
  changeStatus: AdminAiGenerationReviewResultDiffChangeStatus;
  generatedResult: AdminAiGenerationReviewResultDiffSegmentDto | null;
  adoptedDraft: AdminAiGenerationReviewResultDiffSegmentDto | null;
  redactionStatus: "redacted";
};

export type AdminAiGenerationReviewResultDiffGeneratedResultSource = {
  contentDigest: string;
  contentPreviewMasked: string;
  evidenceStatus: EvidenceStatus;
  citationCount: number;
  aiCallLogPublicId: string | null;
  redactionStatus: "redacted";
};

export type AdminAiGenerationReviewResultDiffAdoptedDraftSource = {
  draftPublicId: string;
  contentDigest: string;
  contentPreviewMasked: string;
  evidenceStatus: EvidenceStatus;
  citationCount: number;
  redactionStatus: "redacted";
};

export type AdminAiGenerationReviewResultDiffSource = {
  resultPublicId: string;
  adoptionPublicId: string;
  taskPublicId: string;
  requestPublicId: string;
  targetType: AdminAiGenerationFormalAdoptionTargetType;
  targetDomain: AdminAiGenerationFormalAdoptionTargetDomain;
  formalTargetWriteStatus: AdminAiGenerationFormalTargetWriteStatus;
  formalQuestionPublicId: string | null;
  formalPaperPublicId: string | null;
  reviewerPublicId: string;
  reviewedAt: string;
  generatedResult: AdminAiGenerationReviewResultDiffGeneratedResultSource;
  adoptedDraft: AdminAiGenerationReviewResultDiffAdoptedDraftSource | null;
  fields: readonly AdminAiGenerationReviewResultDiffFieldSource[];
  redactionStatus: "redacted";
};

export type AdminAiGenerationReviewResultDiffDto = {
  diffStatus: AdminAiGenerationReviewResultDiffStatus;
  resultPublicId: string;
  adoptionPublicId: string;
  taskPublicId: string;
  requestPublicId: string;
  target: {
    targetType: AdminAiGenerationFormalAdoptionTargetType;
    targetDomain: AdminAiGenerationFormalAdoptionTargetDomain;
    formalTargetWriteStatus: AdminAiGenerationFormalTargetWriteStatus;
    formalQuestionPublicId: string | null;
    formalPaperPublicId: string | null;
  };
  sourceSummary: AdminAiGenerationReviewResultDiffGeneratedResultSource;
  adoptedDraftSummary: AdminAiGenerationReviewResultDiffAdoptedDraftSource | null;
  diffSummary: {
    fieldCount: number;
    changedCount: number;
    unchangedCount: number;
    generatedResultOnlyCount: number;
    adoptedDraftOnlyCount: number;
  };
  fields: AdminAiGenerationReviewResultDiffFieldDto[];
  readBoundary: {
    readOnly: true;
    rawPromptExposed: false;
    rawGeneratedOutputExposed: false;
    providerPayloadExposed: false;
    mutationStatus: "not_executed";
    publishStatus: "not_executed";
    redactionStatus: "redacted";
  };
  reviewedBy: {
    reviewerPublicId: string;
    reviewedAt: string;
  };
  redactionStatus: "redacted";
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
  reviewTraceability: AdminAiGenerationFormalAdoptionReviewTraceabilityDto;
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
  updateFormalDraftMetadata(
    input: MarkAdminAiGenerationFormalDraftCreatedInput,
  ): Promise<AdminAiGenerationFormalAdoptionRow | null>;
};

export type AdminAiGenerationFormalAdoptionRepository = {
  createOrReuseFormalAdoption(
    input: CreateAdminAiGenerationFormalAdoptionInput,
  ): Promise<AdminAiGenerationFormalAdoptionResult>;
  markFormalDraftCreated(
    input: MarkAdminAiGenerationFormalDraftCreatedInput,
  ): Promise<AdminAiGenerationFormalAdoptionResult>;
};

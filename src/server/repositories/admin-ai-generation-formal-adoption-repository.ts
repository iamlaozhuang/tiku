import type {
  AdminAiGenerationFormalAdoptionAuditActionType,
  AdminAiGenerationFormalAdoptionDto,
  AdminAiGenerationFormalAdoptionGateway,
  AdminAiGenerationFormalAdoptionRepository,
  AdminAiGenerationFormalAdoptionResult,
  AdminAiGenerationFormalAdoptionReviewTraceabilityDto,
  AdminAiGenerationFormalAdoptionRow,
  CreateAdminAiGenerationFormalAdoptionInput,
  FindAdminAiGenerationFormalAdoptionQuery,
  InsertAdminAiGenerationFormalAdoptionInput,
  MarkAdminAiGenerationFormalDraftCreatedInput,
} from "../contracts/admin-ai-generation-formal-adoption-contract";
import {
  canAdoptAdminAiGenerationPlatformFormalContent,
  resolveAdminAiGenerationTaskTypeForFormalTarget,
  type AdminAiGenerationFormalAdoptionReviewDecision,
  type AdminAiGenerationFormalAdoptionReviewStatus,
  type AdminAiGenerationFormalAdoptionSourceResult,
} from "../models/admin-ai-generation-formal-adoption";

const platformFormalContentTargetDomain = "platform_formal_content";
const formalTargetWriteStatus = "blocked_without_follow_up_task";
const formalAdoptionApproveAuditActionType =
  "admin_ai_generation_result.formal_adoption.approve";
const formalAdoptionRejectAuditActionType =
  "admin_ai_generation_result.formal_adoption.reject";

export function createAdminAiGenerationFormalAdoptionRepository(
  gateway: AdminAiGenerationFormalAdoptionGateway,
): AdminAiGenerationFormalAdoptionRepository {
  return {
    async createOrReuseFormalAdoption(input) {
      assertConfirmedAdoptionInput(input);

      const sourceResult = await gateway.findSourceResultForAdoption(
        input.resultPublicId,
      );

      if (sourceResult === null) {
        throw new Error("admin AI generation result was not found");
      }

      assertSourceResultEligibleForPlatformFormalAdoption(sourceResult, input);

      const query = createAdoptionLookupQuery(input);
      const existingRow = await gateway.findAdoptionBySourceResult(query);

      if (existingRow !== null) {
        return createFormalAdoptionResponse("reused", existingRow);
      }

      const insertedRow = await gateway.insertAdoptionRecord(
        createInsertAdoptionRecordInput(input, sourceResult),
      );
      const resolvedRow =
        insertedRow ?? (await gateway.findAdoptionBySourceResult(query));

      if (resolvedRow === null) {
        throw new Error(
          "admin AI generation formal adoption persistence failed",
        );
      }

      return createFormalAdoptionResponse(
        insertedRow === null ? "reused" : "created",
        resolvedRow,
      );
    },
    async markFormalDraftCreated(input) {
      assertFormalDraftCreatedInput(input);

      const updatedRow = await gateway.updateFormalDraftMetadata(input);

      if (updatedRow === null) {
        throw new Error(
          "admin AI generation formal adoption draft metadata update failed",
        );
      }

      return createFormalAdoptionResponse("reused", updatedRow);
    },
  };
}

function assertConfirmedAdoptionInput(
  input: CreateAdminAiGenerationFormalAdoptionInput,
): void {
  if (input.reviewerConfirmed !== true) {
    throw new Error("explicit formal adoption review confirmation is required");
  }

  if (
    input.reviewDecision !== "approved" &&
    input.reviewDecision !== "rejected"
  ) {
    throw new Error(
      "admin AI generation formal adoption review decision is unsupported",
    );
  }
}

function assertSourceResultEligibleForPlatformFormalAdoption(
  sourceResult: AdminAiGenerationFormalAdoptionSourceResult,
  input: CreateAdminAiGenerationFormalAdoptionInput,
): void {
  if (sourceResult.workspace === "organization") {
    throw new Error(
      "organization AI generation formal adoption requires a separate organization-scoped task",
    );
  }

  if (
    sourceResult.workspace !== "content" ||
    sourceResult.ownerType !== "platform" ||
    sourceResult.organizationPublicId !== null
  ) {
    throw new Error("unsafe admin AI generation formal adoption source scope");
  }

  if (!canAdoptAdminAiGenerationPlatformFormalContent(input.actor)) {
    throw new Error("admin AI generation formal adoption reviewer denied");
  }

  if (
    sourceResult.resultStatus !== "draft" ||
    !sourceResult.isFormalAdoptionBlocked
  ) {
    throw new Error("admin AI generation result is not eligible for adoption");
  }

  if (
    sourceResult.generationKind !== input.targetType ||
    sourceResult.taskType !==
      resolveAdminAiGenerationTaskTypeForFormalTarget(input.targetType)
  ) {
    throw new Error("admin AI generation result target type mismatch");
  }
}

function createAdoptionLookupQuery(
  input: Pick<
    CreateAdminAiGenerationFormalAdoptionInput,
    "resultPublicId" | "targetType"
  >,
): FindAdminAiGenerationFormalAdoptionQuery {
  return {
    sourceResultPublicId: input.resultPublicId,
    targetType: input.targetType,
    targetDomain: platformFormalContentTargetDomain,
  };
}

function createInsertAdoptionRecordInput(
  input: CreateAdminAiGenerationFormalAdoptionInput,
  sourceResult: AdminAiGenerationFormalAdoptionSourceResult,
): InsertAdminAiGenerationFormalAdoptionInput {
  return {
    adoptionPublicId: input.adoptionPublicId,
    sourceResultPublicId: sourceResult.resultPublicId,
    sourceTaskPublicId: sourceResult.taskPublicId,
    sourceRequestPublicId: sourceResult.requestPublicId,
    workspace: sourceResult.workspace,
    generationKind: sourceResult.generationKind,
    ownerType: sourceResult.ownerType,
    ownerPublicId: sourceResult.ownerPublicId,
    organizationPublicId: sourceResult.organizationPublicId,
    targetType: input.targetType,
    targetDomain: platformFormalContentTargetDomain,
    reviewStatus: createFormalAdoptionReviewStatus(input.reviewDecision),
    formalTargetWriteStatus,
    formalQuestionPublicId: null,
    formalPaperPublicId: null,
    reviewerPublicId: input.actor.publicId,
    reviewedAt: input.reviewedAt,
    contentDigest: sourceResult.contentDigest,
    contentPreviewMasked: sourceResult.contentPreviewMasked,
    evidenceStatus: sourceResult.evidenceStatus,
    citationCount: sourceResult.citationCount,
    aiCallLogPublicId: sourceResult.aiCallLogPublicId,
    createdAt: input.reviewedAt,
  };
}

function createFormalAdoptionReviewStatus(
  reviewDecision: AdminAiGenerationFormalAdoptionReviewDecision,
): AdminAiGenerationFormalAdoptionReviewStatus {
  return reviewDecision === "approved"
    ? "approved_for_formal_adoption"
    : "rejected";
}

function assertFormalDraftCreatedInput(
  input: MarkAdminAiGenerationFormalDraftCreatedInput,
): void {
  if (
    input.targetType === "question" &&
    (input.formalQuestionPublicId === null ||
      input.formalPaperPublicId !== null)
  ) {
    throw new Error("admin AI generation formal question draft id required");
  }

  if (
    input.targetType === "paper" &&
    (input.formalPaperPublicId === null ||
      input.formalQuestionPublicId !== null)
  ) {
    throw new Error("admin AI generation formal paper draft id required");
  }
}

function createFormalAdoptionResponse(
  persistenceStatus: AdminAiGenerationFormalAdoptionResult["persistenceStatus"],
  row: AdminAiGenerationFormalAdoptionRow,
): AdminAiGenerationFormalAdoptionResult {
  return {
    persistenceStatus,
    adoption: mapAdminAiGenerationFormalAdoptionRowToDto(row),
  };
}

function mapAdminAiGenerationFormalAdoptionRowToDto(
  row: AdminAiGenerationFormalAdoptionRow,
): AdminAiGenerationFormalAdoptionDto {
  assertFormalTargetWriteSafe(row);

  return {
    adoptionPublicId: row.adoption_public_id,
    sourceReference: {
      resultPublicId: row.source_result_public_id,
      taskPublicId: row.source_task_public_id,
      requestPublicId: row.source_request_public_id,
      workspace: row.workspace,
      generationKind: row.generation_kind,
      ownerType: row.owner_type,
      ownerPublicId: row.owner_public_id,
      organizationPublicId: row.organization_public_id,
    },
    targetReference: {
      targetType: row.target_type,
      targetDomain: row.target_domain,
      formalTargetWriteStatus: row.formal_target_write_status,
      formalQuestionPublicId: row.formal_question_public_id,
      formalPaperPublicId: row.formal_paper_public_id,
    },
    review: {
      reviewStatus: row.review_status,
      reviewDecision: createFormalAdoptionReviewDecision(row),
      reviewerPublicId: row.reviewer_public_id,
      reviewedAt: row.reviewed_at.toISOString(),
    },
    sourceSummary: {
      contentDigest: row.content_digest,
      contentPreviewMasked: row.content_preview_masked,
      evidenceStatus: row.evidence_status,
      citationCount: row.citation_count,
      aiCallLogPublicId: row.ai_call_log_public_id,
      redactionStatus: "redacted",
    },
    audit: createFormalAdoptionAuditSummary(row),
    reviewTraceability: createFormalAdoptionReviewTraceability(row),
    redactionStatus: "redacted",
  };
}

function createFormalAdoptionReviewTraceability(
  row: AdminAiGenerationFormalAdoptionRow,
): AdminAiGenerationFormalAdoptionReviewTraceabilityDto {
  const reviewedAt = row.reviewed_at.toISOString();
  const reviewDecision = createFormalAdoptionReviewDecision(row);

  return {
    traceabilityStatus: "single_result_traceable",
    sourceGeneratedResultPublicId: row.source_result_public_id,
    validationStatus: "validated_for_formal_adoption",
    reviewStatus: row.review_status,
    reviewDecision,
    reviewerPublicId: row.reviewer_public_id,
    reviewedAt,
    adoptAction:
      reviewDecision === "approved"
        ? {
            actionStatus: "executed",
            actionType: formalAdoptionApproveAuditActionType,
            actorPublicId: row.reviewer_public_id,
            actionAt: reviewedAt,
            formalTargetWriteStatus: row.formal_target_write_status,
            formalQuestionPublicId: row.formal_question_public_id,
            formalPaperPublicId: row.formal_paper_public_id,
          }
        : {
            actionStatus: "not_executed",
            actionType: null,
            actorPublicId: null,
            actionAt: null,
            formalTargetWriteStatus,
            formalQuestionPublicId: null,
            formalPaperPublicId: null,
          },
    rejectAction:
      reviewDecision === "rejected"
        ? {
            actionStatus: "executed",
            actionType: formalAdoptionRejectAuditActionType,
            actorPublicId: row.reviewer_public_id,
            actionAt: reviewedAt,
          }
        : {
            actionStatus: "not_executed",
            actorPublicId: null,
            actionAt: null,
          },
    directPublishStatus: "blocked_requires_fresh_publish_task",
    auditSummary: createFormalAdoptionAuditSummary(row),
    redactionStatus: "redacted",
  };
}

function createFormalAdoptionAuditSummary(
  row: AdminAiGenerationFormalAdoptionRow,
): AdminAiGenerationFormalAdoptionDto["audit"] {
  return {
    actionType: createFormalAdoptionAuditActionType(row),
    targetResourceType: "admin_ai_generation_result",
    targetPublicId: row.source_result_public_id,
    redactionStatus: "redacted",
  };
}

function createFormalAdoptionReviewDecision(
  row: Pick<AdminAiGenerationFormalAdoptionRow, "review_status">,
): AdminAiGenerationFormalAdoptionReviewDecision {
  return row.review_status === "rejected" ? "rejected" : "approved";
}

function createFormalAdoptionAuditActionType(
  row: Pick<AdminAiGenerationFormalAdoptionRow, "review_status">,
): AdminAiGenerationFormalAdoptionAuditActionType {
  return createFormalAdoptionReviewDecision(row) === "approved"
    ? formalAdoptionApproveAuditActionType
    : formalAdoptionRejectAuditActionType;
}

function assertFormalTargetWriteSafe(
  row: AdminAiGenerationFormalAdoptionRow,
): void {
  if (
    row.review_status === "rejected" &&
    row.formal_target_write_status === formalTargetWriteStatus &&
    row.formal_question_public_id === null &&
    row.formal_paper_public_id === null
  ) {
    return;
  }

  if (row.review_status === "rejected") {
    throw new Error("admin AI generation formal rejection cannot write draft");
  }

  if (
    row.formal_target_write_status === formalTargetWriteStatus &&
    row.formal_question_public_id === null &&
    row.formal_paper_public_id === null
  ) {
    return;
  }

  if (
    row.formal_target_write_status === "draft_created" &&
    row.target_type === "question" &&
    row.formal_question_public_id !== null &&
    row.formal_paper_public_id === null
  ) {
    return;
  }

  if (
    row.formal_target_write_status === "draft_created" &&
    row.target_type === "paper" &&
    row.formal_question_public_id === null &&
    row.formal_paper_public_id !== null
  ) {
    return;
  }

  throw new Error("admin AI generation formal target write is not approved");
}

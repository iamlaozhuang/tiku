import type {
  AdminAiGenerationFormalAdoptionDto,
  AdminAiGenerationFormalAdoptionGateway,
  AdminAiGenerationFormalAdoptionRepository,
  AdminAiGenerationFormalAdoptionResult,
  AdminAiGenerationFormalAdoptionRow,
  CreateAdminAiGenerationFormalAdoptionInput,
  FindAdminAiGenerationFormalAdoptionQuery,
  InsertAdminAiGenerationFormalAdoptionInput,
} from "../contracts/admin-ai-generation-formal-adoption-contract";
import {
  canAdoptAdminAiGenerationPlatformFormalContent,
  resolveAdminAiGenerationTaskTypeForFormalTarget,
  type AdminAiGenerationFormalAdoptionSourceResult,
} from "../models/admin-ai-generation-formal-adoption";

const platformFormalContentTargetDomain = "platform_formal_content";
const formalAdoptionReviewStatus = "approved_for_formal_adoption";
const formalTargetWriteStatus = "blocked_without_follow_up_task";

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
  };
}

function assertConfirmedAdoptionInput(
  input: CreateAdminAiGenerationFormalAdoptionInput,
): void {
  if (input.reviewerConfirmed !== true) {
    throw new Error("explicit formal adoption review confirmation is required");
  }

  if (input.reviewDecision !== "approved") {
    throw new Error("admin AI generation formal adoption requires approval");
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
    reviewStatus: formalAdoptionReviewStatus,
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
  assertFormalTargetWriteStillBlocked(row);

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
      reviewDecision: "approved",
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
    audit: {
      actionType: "admin_ai_generation_result.formal_adoption.approve",
      targetResourceType: "admin_ai_generation_result",
      targetPublicId: row.source_result_public_id,
      redactionStatus: "redacted",
    },
    redactionStatus: "redacted",
  };
}

function assertFormalTargetWriteStillBlocked(
  row: AdminAiGenerationFormalAdoptionRow,
): void {
  if (
    row.formal_target_write_status !== formalTargetWriteStatus ||
    row.formal_question_public_id !== null ||
    row.formal_paper_public_id !== null
  ) {
    throw new Error("admin AI generation formal target write is not approved");
  }
}

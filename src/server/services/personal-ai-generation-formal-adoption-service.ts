import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import {
  PERSONAL_AI_GENERATION_FORMAL_ADOPTION_ERROR_CODES,
  type PersonalAiGenerationFormalAdoptionReviewDto,
} from "../contracts/personal-ai-generation-formal-adoption-contract";
import {
  canReviewPersonalAiGenerationFormalAdoption,
  type PersonalAiGenerationFormalAdoptionReviewDecision,
  type PersonalAiGenerationFormalAdoptionReviewInput,
  type PersonalAiGenerationFormalAdoptionReviewStatus,
  type PersonalAiGenerationFormalAdoptionSourceResult,
} from "../models/personal-ai-generation-formal-adoption";
import type {
  PersonalAiGenerationFormalAdoptionAuditRepository,
  PersonalAiGenerationFormalAdoptionRepository,
} from "../repositories/personal-ai-generation-formal-adoption-repository";
import {
  FORMAL_ADOPTION_REVIEW_CONFIRMATION_REQUIRED_MESSAGE,
  isFormalAdoptionReviewConfirmationMissing,
  normalizePersonalAiGenerationFormalAdoptionReviewInput,
} from "../validators/personal-ai-generation-formal-adoption";

export type PersonalAiGenerationFormalAdoptionService = {
  reviewFormalAdoption(
    input: unknown,
  ): Promise<ApiResponse<PersonalAiGenerationFormalAdoptionReviewDto | null>>;
};

export type PersonalAiGenerationFormalAdoptionServiceRepositories = {
  adoptionRepository: PersonalAiGenerationFormalAdoptionRepository;
  auditLogRepository: PersonalAiGenerationFormalAdoptionAuditRepository;
};

const formalAdoptionReviewMetadataSummary =
  "redacted formal adoption review metadata";

export function createPersonalAiGenerationFormalAdoptionService(
  repositories: PersonalAiGenerationFormalAdoptionServiceRepositories,
): PersonalAiGenerationFormalAdoptionService {
  return {
    async reviewFormalAdoption(input) {
      if (isFormalAdoptionReviewConfirmationMissing(input)) {
        return createErrorResponse(
          PERSONAL_AI_GENERATION_FORMAL_ADOPTION_ERROR_CODES.invalidInput,
          FORMAL_ADOPTION_REVIEW_CONFIRMATION_REQUIRED_MESSAGE,
        );
      }

      const normalizedInput =
        normalizePersonalAiGenerationFormalAdoptionReviewInput(input);

      if (!normalizedInput.success) {
        return createErrorResponse(
          PERSONAL_AI_GENERATION_FORMAL_ADOPTION_ERROR_CODES.invalidInput,
          normalizedInput.message,
        );
      }

      if (
        !canReviewPersonalAiGenerationFormalAdoption(
          normalizedInput.value.actor,
        )
      ) {
        return createErrorResponse(
          PERSONAL_AI_GENERATION_FORMAL_ADOPTION_ERROR_CODES.adminPermissionDenied,
          "Admin permission denied.",
        );
      }

      const sourceResult =
        await repositories.adoptionRepository.findDraftResultForReview(
          normalizedInput.value.resultPublicId,
        );

      if (sourceResult === null) {
        return createErrorResponse(
          PERSONAL_AI_GENERATION_FORMAL_ADOPTION_ERROR_CODES.resultNotFound,
          "Personal AI generation result does not exist.",
        );
      }

      if (!isFormalAdoptionReviewEligible(sourceResult)) {
        return createErrorResponse(
          PERSONAL_AI_GENERATION_FORMAL_ADOPTION_ERROR_CODES.resultNotEligible,
          "Personal AI generation result is not eligible for formal adoption review.",
        );
      }

      const actionType = createFormalAdoptionReviewActionType(
        normalizedInput.value.reviewDecision,
      );

      await repositories.auditLogRepository.appendAuditLog({
        actorPublicId: normalizedInput.value.actor.publicId,
        actorRole: normalizedInput.value.actor.roles[0],
        actionType,
        targetResourceType: "personal_ai_generation_result",
        targetPublicId: sourceResult.resultPublicId,
        resultStatus: "success",
        metadataSummary: formalAdoptionReviewMetadataSummary,
        requestIp: null,
      });

      return createSuccessResponse(
        createFormalAdoptionReviewDto({
          input: normalizedInput.value,
          sourceResult,
          actionType,
        }),
      );
    },
  };
}

function isFormalAdoptionReviewEligible(
  sourceResult: PersonalAiGenerationFormalAdoptionSourceResult,
): boolean {
  return (
    sourceResult.resultStatus === "draft" &&
    sourceResult.isFormalAdoptionBlocked
  );
}

function createFormalAdoptionReviewActionType(
  reviewDecision: PersonalAiGenerationFormalAdoptionReviewDecision,
): string {
  return reviewDecision === "approved"
    ? "personal_ai_generation_result.formal_adoption_review.approve"
    : "personal_ai_generation_result.formal_adoption_review.reject";
}

function createFormalAdoptionReviewStatus(
  reviewDecision: PersonalAiGenerationFormalAdoptionReviewDecision,
): PersonalAiGenerationFormalAdoptionReviewStatus {
  return reviewDecision === "approved"
    ? "approved_for_manual_adoption"
    : "rejected";
}

function createFormalAdoptionReviewDto(input: {
  input: PersonalAiGenerationFormalAdoptionReviewInput;
  sourceResult: PersonalAiGenerationFormalAdoptionSourceResult;
  actionType: string;
}): PersonalAiGenerationFormalAdoptionReviewDto {
  return {
    adoptionReview: {
      sourceResultPublicId: input.sourceResult.resultPublicId,
      sourceTaskPublicId: input.sourceResult.taskPublicId,
      sourceOwnerPublicId: input.sourceResult.ownerPublicId,
      targetType: input.input.targetType,
      reviewDecision: input.input.reviewDecision,
      reviewStatus: createFormalAdoptionReviewStatus(
        input.input.reviewDecision,
      ),
      formalTargetWriteStatus: "blocked_without_follow_up_task",
      reviewerPublicId: input.input.actor.publicId,
      reviewedAt: input.input.reviewedAt.toISOString(),
      sourceReference: {
        contentDigest: input.sourceResult.contentDigest,
        contentPreviewMasked: input.sourceResult.contentPreviewMasked,
        evidenceStatus: input.sourceResult.evidenceStatus,
        citationCount: input.sourceResult.citationCount,
        aiCallLogPublicId: input.sourceResult.aiCallLogPublicId,
        redactionStatus: "redacted",
      },
      audit: {
        actionType: input.actionType,
        targetResourceType: "personal_ai_generation_result",
        targetPublicId: input.sourceResult.resultPublicId,
        redactionStatus: "redacted",
      },
    },
  };
}

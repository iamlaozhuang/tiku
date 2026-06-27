import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type {
  PersonalAiGenerationPrivateUseBoundaryDto,
  PersonalAiGenerationResultReferenceDto,
} from "../contracts/personal-ai-generation-result-reference-contract";
import type { PersonalAiGenerationResultReferenceInput } from "../models/personal-ai-generation-result-reference";
import { normalizePersonalAiGenerationResultReferenceInput } from "../validators/personal-ai-generation-result-reference";

const INVALID_PERSONAL_AI_GENERATION_RESULT_REFERENCE_INPUT_CODE = 400014;

function createPersonalAiGenerationPrivateUseBoundary(): PersonalAiGenerationPrivateUseBoundaryDto {
  return {
    generatedResultScope: "learner_private",
    resultHistoryStatus: "available",
    privatePracticeAttemptSourceStatus:
      "allowed_as_private_practice_attempt_source",
    privatePaperAttemptSourceStatus: "allowed_as_private_paper_attempt_source",
    organizationPrivateAdoptionStatus:
      "blocked_without_organization_admin_task",
    platformFormalDraftStatus: "blocked_requires_content_admin_review",
    publishStatus: "blocked_requires_fresh_publish_task",
    studentVisibleStatus: "blocked",
    redactionStatus: "redacted",
  };
}

function mapPersonalAiGenerationResultReferenceToDto(
  input: PersonalAiGenerationResultReferenceInput,
): PersonalAiGenerationResultReferenceDto {
  return {
    runtimeStatus: "local_contract_only",
    taskPublicId: input.taskPublicId,
    taskType: input.taskType,
    status: input.status,
    failureCategory: input.failureCategory,
    resultReference: {
      resultPublicId: input.resultPublicId,
      contentVisibility: "summary_only",
      isFormalAdoptionBlocked: true,
      redactionStatus: "redacted",
      evidenceStatus: input.evidenceStatus,
      citationCount: input.citationCount,
    },
    aiCallLogReference: {
      aiCallLogPublicId: input.aiCallLogPublicId,
      contentVisibility: "summary_only",
      redactionStatus: "redacted",
    },
    privateUseBoundary: createPersonalAiGenerationPrivateUseBoundary(),
  };
}

export function buildPersonalAiGenerationResultReferenceReadModel(
  input: unknown,
): ApiResponse<PersonalAiGenerationResultReferenceDto | null> {
  const personalAiGenerationResultReferenceInput =
    normalizePersonalAiGenerationResultReferenceInput(input);

  if (!personalAiGenerationResultReferenceInput.success) {
    return createErrorResponse(
      INVALID_PERSONAL_AI_GENERATION_RESULT_REFERENCE_INPUT_CODE,
      personalAiGenerationResultReferenceInput.message,
    );
  }

  return createSuccessResponse(
    mapPersonalAiGenerationResultReferenceToDto(
      personalAiGenerationResultReferenceInput.value,
    ),
  );
}

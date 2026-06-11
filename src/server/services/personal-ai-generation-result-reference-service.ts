import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type { PersonalAiGenerationResultReferenceDto } from "../contracts/personal-ai-generation-result-reference-contract";
import type { PersonalAiGenerationResultReferenceInput } from "../models/personal-ai-generation-result-reference";
import { normalizePersonalAiGenerationResultReferenceInput } from "../validators/personal-ai-generation-result-reference";

const INVALID_PERSONAL_AI_GENERATION_RESULT_REFERENCE_INPUT_CODE = 400014;

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
      redactionStatus: "redacted",
      evidenceStatus: input.evidenceStatus,
      citationCount: input.citationCount,
    },
    aiCallLogReference: {
      aiCallLogPublicId: input.aiCallLogPublicId,
      contentVisibility: "summary_only",
      redactionStatus: "redacted",
    },
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

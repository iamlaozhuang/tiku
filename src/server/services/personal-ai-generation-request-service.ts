import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type { PersonalAiGenerationRequestDto } from "../contracts/personal-ai-generation-request-contract";
import {
  resolvePersonalAiGenerationRequestContextSelection,
  type PersonalAiGenerationRequestInput,
} from "../models/personal-ai-generation-request";
import { normalizePersonalAiGenerationRequestInput } from "../validators/personal-ai-generation-request";

const INVALID_PERSONAL_AI_GENERATION_REQUEST_INPUT_CODE = 400011;

function mapPersonalAiGenerationRequestToDto(
  input: PersonalAiGenerationRequestInput,
): PersonalAiGenerationRequestDto {
  const selectedContext =
    resolvePersonalAiGenerationRequestContextSelection(input);

  return {
    userPublicId: input.userPublicId,
    authorizationPublicId: input.authorizationPublicId,
    aiFuncType: input.aiFuncType,
    runtimeStatus: "local_contract_only",
    generationContext: {
      questionPublicId: input.questionPublicId,
      answerRecordPublicId: input.answerRecordPublicId,
      paperPublicId: input.paperPublicId,
      mockExamPublicId: input.mockExamPublicId,
      selectedContext,
    },
    generationParameters: input.generationParameters,
    redeemCodeReference: {
      publicId: input.redeemCodePublicId,
      redactionStatus: "redacted",
    },
    evidenceReferences: {
      auditLogPublicId: input.auditLogPublicId,
      aiCallLogPublicId: input.aiCallLogPublicId,
      redactionStatus: "redacted",
    },
  };
}

export function buildPersonalAiGenerationRequestReadModel(
  input: unknown,
): ApiResponse<PersonalAiGenerationRequestDto | null> {
  const personalAiGenerationRequestInput =
    normalizePersonalAiGenerationRequestInput(input);

  if (!personalAiGenerationRequestInput.success) {
    return createErrorResponse(
      INVALID_PERSONAL_AI_GENERATION_REQUEST_INPUT_CODE,
      personalAiGenerationRequestInput.message,
    );
  }

  return createSuccessResponse(
    mapPersonalAiGenerationRequestToDto(personalAiGenerationRequestInput.value),
  );
}

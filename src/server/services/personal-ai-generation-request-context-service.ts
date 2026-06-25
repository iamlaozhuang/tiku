import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type { PersonalAiGenerationRequestContextDto } from "../contracts/personal-ai-generation-request-contract";
import { resolvePersonalAiGenerationRequestContextSelection } from "../models/personal-ai-generation-request";
import { normalizePersonalAiGenerationRequestInput } from "../validators/personal-ai-generation-request";

const INVALID_PERSONAL_AI_GENERATION_REQUEST_CONTEXT_INPUT_CODE = 400011;

export function buildPersonalAiGenerationRequestContextReadModel(
  input: unknown,
): ApiResponse<PersonalAiGenerationRequestContextDto | null> {
  const personalAiGenerationRequestInput =
    normalizePersonalAiGenerationRequestInput(input);

  if (!personalAiGenerationRequestInput.success) {
    return createErrorResponse(
      INVALID_PERSONAL_AI_GENERATION_REQUEST_CONTEXT_INPUT_CODE,
      personalAiGenerationRequestInput.message,
    );
  }

  const requestInput = personalAiGenerationRequestInput.value;

  return createSuccessResponse({
    userPublicId: requestInput.userPublicId,
    authorizationBoundary: {
      authorizationSource: requestInput.authorizationSource,
      authorizationPublicId: requestInput.authorizationPublicId,
      ownerType: requestInput.ownerType,
      ownerPublicId: requestInput.ownerPublicId,
      organizationPublicId: requestInput.organizationPublicId,
      quotaOwnerType: requestInput.quotaOwnerType,
      quotaOwnerPublicId: requestInput.quotaOwnerPublicId,
    },
    aiFuncType: requestInput.aiFuncType,
    runtimeStatus: "local_contract_only",
    selectedContext:
      resolvePersonalAiGenerationRequestContextSelection(requestInput),
    contextReferences: {
      paperPublicId: requestInput.paperPublicId,
      mockExamPublicId: requestInput.mockExamPublicId,
      redactionStatus: "redacted",
    },
    redactionStatus: "redacted",
  });
}

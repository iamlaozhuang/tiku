import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type {
  AdminAiGenerationFormalAdoptionResult,
  AdminAiGenerationFormalAdoptionRepository,
} from "../contracts/admin-ai-generation-formal-adoption-contract";
import { canAdoptAdminAiGenerationPlatformFormalContent } from "../models/admin-ai-generation-formal-adoption";
import {
  ADMIN_AI_GENERATION_FORMAL_ADOPTION_CONFIRMATION_REQUIRED_MESSAGE,
  isAdminAiGenerationFormalAdoptionConfirmationMissing,
  normalizeAdminAiGenerationFormalAdoptionInput,
} from "../validators/admin-ai-generation-formal-adoption";

export type AdminAiGenerationFormalAdoptionService = {
  approveFormalAdoption(
    input: unknown,
  ): Promise<ApiResponse<AdminAiGenerationFormalAdoptionResult | null>>;
};

export type AdminAiGenerationFormalAdoptionServiceRepositories = {
  adoptionRepository: AdminAiGenerationFormalAdoptionRepository;
};

export const ADMIN_AI_GENERATION_FORMAL_ADOPTION_ERROR_CODES = {
  invalidInput: 400014,
  permissionDenied: 403012,
  resultNotFound: 404014,
  resultNotEligible: 409014,
  persistenceFailed: 500014,
} as const;

export const ADMIN_AI_GENERATION_FORMAL_ADOPTION_PERMISSION_DENIED_MESSAGE =
  "Admin AI generation formal adoption is not available for this role.";

export function createAdminAiGenerationFormalAdoptionService(
  repositories: AdminAiGenerationFormalAdoptionServiceRepositories,
): AdminAiGenerationFormalAdoptionService {
  return {
    async approveFormalAdoption(input) {
      if (isAdminAiGenerationFormalAdoptionConfirmationMissing(input)) {
        return createErrorResponse(
          ADMIN_AI_GENERATION_FORMAL_ADOPTION_ERROR_CODES.invalidInput,
          ADMIN_AI_GENERATION_FORMAL_ADOPTION_CONFIRMATION_REQUIRED_MESSAGE,
        );
      }

      const normalizedInput =
        normalizeAdminAiGenerationFormalAdoptionInput(input);

      if (!normalizedInput.success) {
        return createErrorResponse(
          ADMIN_AI_GENERATION_FORMAL_ADOPTION_ERROR_CODES.invalidInput,
          normalizedInput.message,
        );
      }

      if (
        !canAdoptAdminAiGenerationPlatformFormalContent(
          normalizedInput.value.actor,
        )
      ) {
        return createErrorResponse(
          ADMIN_AI_GENERATION_FORMAL_ADOPTION_ERROR_CODES.permissionDenied,
          ADMIN_AI_GENERATION_FORMAL_ADOPTION_PERMISSION_DENIED_MESSAGE,
        );
      }

      try {
        return createSuccessResponse(
          await repositories.adoptionRepository.createOrReuseFormalAdoption(
            normalizedInput.value,
          ),
        );
      } catch (error) {
        return mapFormalAdoptionRepositoryError(error);
      }
    },
  };
}

function mapFormalAdoptionRepositoryError(error: unknown): ApiResponse<null> {
  const message = error instanceof Error ? error.message : "";

  if (message.includes("was not found")) {
    return createErrorResponse(
      ADMIN_AI_GENERATION_FORMAL_ADOPTION_ERROR_CODES.resultNotFound,
      "Admin AI generation result does not exist.",
    );
  }

  if (
    message.includes("organization AI generation formal adoption") ||
    message.includes("unsafe admin AI generation formal adoption source scope")
  ) {
    return createErrorResponse(
      ADMIN_AI_GENERATION_FORMAL_ADOPTION_ERROR_CODES.permissionDenied,
      ADMIN_AI_GENERATION_FORMAL_ADOPTION_PERMISSION_DENIED_MESSAGE,
    );
  }

  if (
    message.includes("not eligible") ||
    message.includes("target type mismatch")
  ) {
    return createErrorResponse(
      ADMIN_AI_GENERATION_FORMAL_ADOPTION_ERROR_CODES.resultNotEligible,
      "Admin AI generation result is not eligible for formal adoption.",
    );
  }

  if (
    message.includes("confirmation is required") ||
    message.includes("requires approval")
  ) {
    return createErrorResponse(
      ADMIN_AI_GENERATION_FORMAL_ADOPTION_ERROR_CODES.invalidInput,
      "Invalid admin AI generation formal adoption input.",
    );
  }

  return createErrorResponse(
    ADMIN_AI_GENERATION_FORMAL_ADOPTION_ERROR_CODES.persistenceFailed,
    "Admin AI generation formal adoption persistence failed.",
  );
}

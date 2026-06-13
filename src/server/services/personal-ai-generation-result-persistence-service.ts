import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type { PersonalAiGenerationResultPersistenceDto } from "../contracts/personal-ai-generation-result-persistence-contract";
import type { PersonalAiGenerationResultRepository } from "../repositories/personal-ai-generation-result-repository";
import { normalizePersonalAiGenerationResultPersistenceInput } from "../validators/personal-ai-generation-result-persistence";

const FORMAL_GENERATED_CONTENT_ADOPTION_NOT_APPROVED_CODE = 400015;
const INVALID_PERSONAL_AI_GENERATION_RESULT_PERSISTENCE_INPUT_CODE = 400016;

export type PersonalAiGenerationResultPersistenceService = {
  persistDraftResult(
    input: unknown,
  ): Promise<ApiResponse<PersonalAiGenerationResultPersistenceDto | null>>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function createPersonalAiGenerationResultPersistenceService(
  repository: PersonalAiGenerationResultRepository,
): PersonalAiGenerationResultPersistenceService {
  return {
    async persistDraftResult(input) {
      if (isRecord(input) && input.formalAdoptionRequested === true) {
        return createErrorResponse(
          FORMAL_GENERATED_CONTENT_ADOPTION_NOT_APPROVED_CODE,
          "Formal generated content adoption is not approved.",
        );
      }

      const normalizedInput =
        normalizePersonalAiGenerationResultPersistenceInput(input);

      if (!normalizedInput.success) {
        return createErrorResponse(
          INVALID_PERSONAL_AI_GENERATION_RESULT_PERSISTENCE_INPUT_CODE,
          normalizedInput.message,
        );
      }

      return createSuccessResponse(
        await repository.createOrReuseDraftResult(normalizedInput.value),
      );
    },
  };
}

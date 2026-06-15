import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type { PersonalAiGenerationResultHistoryDto } from "../contracts/personal-ai-generation-result-history-contract";
import type { PersonalAiGenerationResultDto } from "../contracts/personal-ai-generation-result-persistence-contract";
import {
  comparePersonalAiGenerationResultHistoryItem,
  type PersonalAiGenerationResultHistoryQuery,
} from "../models/personal-ai-generation-result-history";
import type { PersonalAiGenerationResultRepository } from "../repositories/personal-ai-generation-result-repository";
import { normalizePersonalAiGenerationResultHistoryQuery } from "../validators/personal-ai-generation-result-history";

const INVALID_PERSONAL_AI_GENERATION_RESULT_HISTORY_INPUT_CODE = 400044;
const RESULT_HISTORY_UNAVAILABLE_CODE = 500019;
const RESULT_HISTORY_UNAVAILABLE_MESSAGE =
  "Personal AI generation result history is temporarily unavailable.";

type PersonalAiGenerationResultHistoryRepository = Pick<
  PersonalAiGenerationResultRepository,
  "listDraftResults"
>;

export type PersonalAiGenerationResultHistoryService = {
  listDraftResultHistory(
    input: unknown,
  ): Promise<ApiResponse<PersonalAiGenerationResultHistoryDto | null>>;
};

function mapPersonalAiGenerationResultHistoryItem(
  result: PersonalAiGenerationResultDto,
): PersonalAiGenerationResultDto {
  return {
    resultPublicId: result.resultPublicId,
    taskPublicId: result.taskPublicId,
    requestPublicId: result.requestPublicId,
    taskType: result.taskType,
    status: result.status,
    persistedAt: result.persistedAt,
    contentReference: {
      contentDigest: result.contentReference.contentDigest,
      contentPreviewMasked: result.contentReference.contentPreviewMasked,
      contentVisibility: "redacted_snapshot",
      redactionStatus: "redacted",
    },
    evidenceReference: {
      evidenceStatus: result.evidenceReference.evidenceStatus,
      citationCount: result.evidenceReference.citationCount,
      aiCallLogPublicId: result.evidenceReference.aiCallLogPublicId,
      redactionStatus: "redacted",
    },
    formalAdoption: {
      isBlocked: true,
      status: "blocked",
    },
  };
}

function buildPersonalAiGenerationResultHistoryDto(
  results: PersonalAiGenerationResultDto[],
): PersonalAiGenerationResultHistoryDto {
  return {
    runtimeStatus: "local_contract_only",
    contentVisibility: "redacted_snapshot",
    redactionStatus: "redacted",
    formalAdoptionWriteStatus: "blocked_without_follow_up_task",
    results: [...results]
      .sort(comparePersonalAiGenerationResultHistoryItem)
      .map(mapPersonalAiGenerationResultHistoryItem),
  };
}

async function listDraftResults(
  repository: PersonalAiGenerationResultHistoryRepository,
  query: PersonalAiGenerationResultHistoryQuery,
): Promise<PersonalAiGenerationResultDto[]> {
  return repository.listDraftResults({
    ownerPublicId: query.ownerPublicId,
    limit: query.limit,
  });
}

export function createPersonalAiGenerationResultHistoryService(
  repository: PersonalAiGenerationResultHistoryRepository,
): PersonalAiGenerationResultHistoryService {
  return {
    async listDraftResultHistory(input) {
      const normalizedQuery =
        normalizePersonalAiGenerationResultHistoryQuery(input);

      if (!normalizedQuery.success) {
        return createErrorResponse(
          INVALID_PERSONAL_AI_GENERATION_RESULT_HISTORY_INPUT_CODE,
          normalizedQuery.message,
        );
      }

      try {
        return createSuccessResponse(
          buildPersonalAiGenerationResultHistoryDto(
            await listDraftResults(repository, normalizedQuery.value),
          ),
        );
      } catch {
        return createErrorResponse(
          RESULT_HISTORY_UNAVAILABLE_CODE,
          RESULT_HISTORY_UNAVAILABLE_MESSAGE,
        );
      }
    },
  };
}

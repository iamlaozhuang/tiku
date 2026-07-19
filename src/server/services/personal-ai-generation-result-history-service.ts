import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
  type ApiPagination,
  type ApiResponse,
} from "../contracts/api-response";
import type {
  PersonalAiGenerationResultDetailDto,
  PersonalAiGenerationResultHistoryDto,
} from "../contracts/personal-ai-generation-result-history-contract";
import type { PersonalAiGenerationResultDto } from "../contracts/personal-ai-generation-result-persistence-contract";
import type { PersonalAiGenerationPrivateUseBoundaryDto } from "../contracts/personal-ai-generation-result-reference-contract";
import {
  comparePersonalAiGenerationResultHistoryItem,
  type PersonalAiGenerationResultDetailQuery,
  type PersonalAiGenerationResultHistoryQuery,
} from "../models/personal-ai-generation-result-history";
import type {
  PersonalAiGenerationResultRepository,
  PersonalAiGenerationResultSelectedAuthorizationLookupRepository,
} from "../repositories/personal-ai-generation-result-repository";
import {
  normalizePersonalAiGenerationResultDetailQuery,
  normalizePersonalAiGenerationResultHistoryQuery,
} from "../validators/personal-ai-generation-result-history";

const INVALID_PERSONAL_AI_GENERATION_RESULT_HISTORY_INPUT_CODE = 400044;
const INVALID_PERSONAL_AI_GENERATION_RESULT_DETAIL_INPUT_CODE = 400045;
const RESULT_DETAIL_NOT_FOUND_CODE = 404045;
const RESULT_DETAIL_NOT_FOUND_MESSAGE =
  "Personal AI generation result detail was not found.";
const RESULT_HISTORY_UNAVAILABLE_CODE = 500019;
const RESULT_HISTORY_UNAVAILABLE_MESSAGE =
  "Personal AI generation result history is temporarily unavailable.";
const RESULT_DETAIL_UNAVAILABLE_CODE = 500020;
const RESULT_DETAIL_UNAVAILABLE_MESSAGE =
  "Personal AI generation result detail is temporarily unavailable.";

export type PersonalAiGenerationResultHistoryRepositoryPort = Pick<
  PersonalAiGenerationResultRepository,
  "countDraftResults" | "listDraftResults"
> &
  Pick<
    PersonalAiGenerationResultSelectedAuthorizationLookupRepository,
    "findDraftResultByPublicId"
  >;

export type PersonalAiGenerationResultHistoryService = {
  listDraftResultHistory(
    input: unknown,
  ): Promise<ApiResponse<PersonalAiGenerationResultHistoryDto | null>>;
  getDraftResultDetail(
    input: unknown,
  ): Promise<ApiResponse<PersonalAiGenerationResultDetailDto | null>>;
};

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
    paperAssembly: result.paperAssembly,
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
    privateUseBoundary: createPersonalAiGenerationPrivateUseBoundary(),
    results: [...results]
      .sort(comparePersonalAiGenerationResultHistoryItem)
      .map(mapPersonalAiGenerationResultHistoryItem),
  };
}

function buildPersonalAiGenerationResultDetailDto(
  result: PersonalAiGenerationResultDto,
): PersonalAiGenerationResultDetailDto {
  return {
    runtimeStatus: "local_contract_only",
    contentVisibility: "redacted_snapshot",
    redactionStatus: "redacted",
    formalAdoptionWriteStatus: "blocked_without_follow_up_task",
    privateUseBoundary: createPersonalAiGenerationPrivateUseBoundary(),
    result: mapPersonalAiGenerationResultHistoryItem(result),
  };
}

async function listDraftResults(
  repository: PersonalAiGenerationResultHistoryRepositoryPort,
  query: PersonalAiGenerationResultHistoryQuery,
): Promise<PersonalAiGenerationResultDto[]> {
  return repository.listDraftResults({
    authorizationPublicId: query.authorizationPublicId,
    ownerType: query.ownerType,
    ownerPublicId: query.ownerPublicId,
    ...(query.actorPublicId === undefined
      ? {}
      : { actorPublicId: query.actorPublicId }),
    taskType: query.taskType,
    page: query.page,
    pageSize: query.pageSize,
    limit: query.limit,
    offset: query.offset,
  });
}

async function findDraftResultDetail(
  repository: PersonalAiGenerationResultHistoryRepositoryPort,
  query: PersonalAiGenerationResultDetailQuery,
): Promise<PersonalAiGenerationResultDto | null> {
  return repository.findDraftResultByPublicId({
    authorizationPublicId: query.authorizationPublicId,
    ownerType: query.ownerType,
    ownerPublicId: query.ownerPublicId,
    actorPublicId: query.actorPublicId ?? query.ownerPublicId,
    resultPublicId: query.resultPublicId,
  });
}

export function createPersonalAiGenerationResultHistoryService(
  repository: PersonalAiGenerationResultHistoryRepositoryPort,
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
        const results = await listDraftResults(
          repository,
          normalizedQuery.value,
        );
        const total =
          repository.countDraftResults === undefined
            ? results.length
            : await repository.countDraftResults({
                authorizationPublicId:
                  normalizedQuery.value.authorizationPublicId,
                ownerType: normalizedQuery.value.ownerType,
                ownerPublicId: normalizedQuery.value.ownerPublicId,
                ...(normalizedQuery.value.actorPublicId === undefined
                  ? {}
                  : { actorPublicId: normalizedQuery.value.actorPublicId }),
                taskType: normalizedQuery.value.taskType,
              });
        const page = normalizedQuery.value.page ?? 1;
        const pageSize =
          normalizedQuery.value.pageSize ?? normalizedQuery.value.limit ?? 10;

        return createPaginatedResponse(
          buildPersonalAiGenerationResultHistoryDto(results),
          {
            page,
            pageSize,
            total,
            sortBy: "persistedAt",
            sortOrder: "desc",
          } satisfies ApiPagination,
        );
      } catch {
        return createErrorResponse(
          RESULT_HISTORY_UNAVAILABLE_CODE,
          RESULT_HISTORY_UNAVAILABLE_MESSAGE,
        );
      }
    },
    async getDraftResultDetail(input) {
      const normalizedQuery =
        normalizePersonalAiGenerationResultDetailQuery(input);

      if (!normalizedQuery.success) {
        return createErrorResponse(
          INVALID_PERSONAL_AI_GENERATION_RESULT_DETAIL_INPUT_CODE,
          normalizedQuery.message,
        );
      }

      try {
        const draftResult = await findDraftResultDetail(
          repository,
          normalizedQuery.value,
        );

        return draftResult === null
          ? createErrorResponse(
              RESULT_DETAIL_NOT_FOUND_CODE,
              RESULT_DETAIL_NOT_FOUND_MESSAGE,
            )
          : createSuccessResponse(
              buildPersonalAiGenerationResultDetailDto(draftResult),
            );
      } catch {
        return createErrorResponse(
          RESULT_DETAIL_UNAVAILABLE_CODE,
          RESULT_DETAIL_UNAVAILABLE_MESSAGE,
        );
      }
    },
  };
}

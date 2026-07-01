import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type {
  PersonalAiGenerationRequestHistoryDto,
  PersonalAiGenerationRequestHistoryItemDto,
} from "../contracts/personal-ai-generation-request-history-contract";
import {
  comparePersonalAiGenerationRequestHistoryInput,
  type PersonalAiGenerationRequestHistoryInput,
} from "../models/personal-ai-generation-request-history";
import { normalizePersonalAiGenerationRequestHistoryInput } from "../validators/personal-ai-generation-request-history";

const INVALID_PERSONAL_AI_GENERATION_REQUEST_HISTORY_INPUT_CODE = 400016;

function mapPersonalAiGenerationRequestHistoryToDto(
  input: PersonalAiGenerationRequestHistoryInput,
): PersonalAiGenerationRequestHistoryItemDto {
  return {
    requestPublicId: input.requestPublicId,
    taskPublicId: input.taskPublicId,
    taskType: input.taskType,
    status: input.status,
    requestedAt: input.requestedAt,
    resultPublicId: input.resultPublicId,
    evidenceStatus: input.evidenceStatus,
    citationCount: input.citationCount,
    aiCallLogPublicId: input.aiCallLogPublicId,
    redactionStatus: "redacted",
  };
}

export function buildPersonalAiGenerationRequestHistoryReadModel(
  input: unknown,
): ApiResponse<PersonalAiGenerationRequestHistoryDto | null> {
  const historyInput = normalizePersonalAiGenerationRequestHistoryInput(input);

  if (!historyInput.success) {
    return createErrorResponse(
      INVALID_PERSONAL_AI_GENERATION_REQUEST_HISTORY_INPUT_CODE,
      historyInput.message,
    );
  }

  return createSuccessResponse(
    [...historyInput.value]
      .sort(comparePersonalAiGenerationRequestHistoryInput)
      .map(mapPersonalAiGenerationRequestHistoryToDto),
  );
}

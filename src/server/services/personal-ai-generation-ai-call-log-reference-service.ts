import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type { PersonalAiGenerationAiCallLogReferenceDto } from "../contracts/personal-ai-generation-ai-call-log-reference-contract";
import type { EvidenceStatus } from "../models/ai-rag";
import {
  resolvePersonalAiGenerationAiCallLogRawContentStatus,
  type PersonalAiGenerationAiCallLogReferenceInput,
} from "../models/personal-ai-generation-ai-call-log-reference";
import { normalizePersonalAiGenerationAiCallLogReferenceInput } from "../validators/personal-ai-generation-ai-call-log-reference";

const INVALID_PERSONAL_AI_GENERATION_AI_CALL_LOG_REFERENCE_INPUT_CODE = 400043;

function resolveResultPublicId(
  input: PersonalAiGenerationAiCallLogReferenceInput,
): string | null {
  return input.status === "succeeded" ? input.resultPublicId : null;
}

function resolveResultEvidenceStatus(
  input: PersonalAiGenerationAiCallLogReferenceInput,
): EvidenceStatus {
  return input.status === "succeeded" ? input.evidenceStatus : "none";
}

function resolveResultCitationCount(
  input: PersonalAiGenerationAiCallLogReferenceInput,
): number {
  return input.status === "succeeded" ? input.citationCount : 0;
}

function mapPersonalAiGenerationAiCallLogReferenceToDto(
  input: PersonalAiGenerationAiCallLogReferenceInput,
): PersonalAiGenerationAiCallLogReferenceDto {
  const rawContentStatus =
    resolvePersonalAiGenerationAiCallLogRawContentStatus();

  return {
    runtimeStatus: "local_contract_only",
    taskPublicId: input.taskPublicId,
    taskType: input.taskType,
    status: input.status,
    failureCategory: input.failureCategory,
    referenceStatus: "redacted_reference",
    aiCallLogReference: {
      publicId: input.aiCallLogPublicId,
      contentVisibility: "summary_only",
      redactionStatus: "redacted",
      rawPromptStatus: rawContentStatus,
      rawGeneratedContentStatus: rawContentStatus,
      providerPayloadStatus: rawContentStatus,
    },
    resultReference: {
      resultPublicId: resolveResultPublicId(input),
      contentVisibility: "summary_only",
      redactionStatus: "redacted",
      evidenceStatus: resolveResultEvidenceStatus(input),
      citationCount: resolveResultCitationCount(input),
      rawGeneratedContentStatus: rawContentStatus,
    },
  };
}

export function buildPersonalAiGenerationAiCallLogReferenceReadModel(
  input: unknown,
): ApiResponse<PersonalAiGenerationAiCallLogReferenceDto | null> {
  const personalAiGenerationAiCallLogReferenceInput =
    normalizePersonalAiGenerationAiCallLogReferenceInput(input);

  if (!personalAiGenerationAiCallLogReferenceInput.success) {
    return createErrorResponse(
      INVALID_PERSONAL_AI_GENERATION_AI_CALL_LOG_REFERENCE_INPUT_CODE,
      personalAiGenerationAiCallLogReferenceInput.message,
    );
  }

  return createSuccessResponse(
    mapPersonalAiGenerationAiCallLogReferenceToDto(
      personalAiGenerationAiCallLogReferenceInput.value,
    ),
  );
}

import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type { AiGenerationTaskRequestPolicyDto } from "../contracts/ai-generation-task-request-contract";
import type { PersonalAiGenerationRequestFlowDto } from "../contracts/personal-ai-generation-request-flow-contract";
import type { AiGenerationTaskStatus } from "../models/ai-generation-task";
import {
  resolvePersonalAiGenerationRequestFlowStatus,
  type PersonalAiGenerationRequestFlowStatus,
} from "../models/personal-ai-generation-request-flow";
import {
  isPersonalAiGenerationResultReferenceTaskType,
  type PersonalAiGenerationResultReferenceInput,
} from "../models/personal-ai-generation-result-reference";
import { normalizePersonalAiGenerationRequestFlowInput } from "../validators/personal-ai-generation-request-flow";
import { buildAiGenerationTaskRequestPolicyReadModel } from "./ai-generation-task-request-service";
import { buildPersonalAiGenerationRequestReadModel } from "./personal-ai-generation-request-service";
import { buildPersonalAiGenerationResultReferenceReadModel } from "./personal-ai-generation-result-reference-service";

const INVALID_PERSONAL_AI_GENERATION_REQUEST_FLOW_INPUT_CODE = 400015;

const INVALID_PERSONAL_AI_GENERATION_REQUEST_FLOW_INPUT_MESSAGE =
  "Invalid personal AI generation request flow input.";

function resolveResultReferenceStatus(
  taskRequest: AiGenerationTaskRequestPolicyDto,
): AiGenerationTaskStatus {
  return taskRequest.initialStatus ?? "failed";
}

function resolveResultPublicId(
  flowStatus: PersonalAiGenerationRequestFlowStatus,
  taskRequest: AiGenerationTaskRequestPolicyDto,
): string | null {
  if (flowStatus === "blocked") {
    return null;
  }

  return taskRequest.resultReference.resultPublicId;
}

function mapTaskRequestToResultReferenceInput(
  taskRequest: AiGenerationTaskRequestPolicyDto,
  flowStatus: PersonalAiGenerationRequestFlowStatus,
): PersonalAiGenerationResultReferenceInput | null {
  if (!isPersonalAiGenerationResultReferenceTaskType(taskRequest.taskType)) {
    return null;
  }

  return {
    taskPublicId: taskRequest.taskPublicId,
    taskType: taskRequest.taskType,
    status: resolveResultReferenceStatus(taskRequest),
    failureCategory: taskRequest.blockedFailureCategory,
    resultPublicId: resolveResultPublicId(flowStatus, taskRequest),
    evidenceStatus: taskRequest.resultReference.evidenceStatus,
    citationCount: taskRequest.resultReference.citationCount,
    aiCallLogPublicId: taskRequest.evidenceReferences.aiCallLogPublicId,
  };
}

function createInvalidRequestFlowResponse(): ApiResponse<null> {
  return createErrorResponse(
    INVALID_PERSONAL_AI_GENERATION_REQUEST_FLOW_INPUT_CODE,
    INVALID_PERSONAL_AI_GENERATION_REQUEST_FLOW_INPUT_MESSAGE,
  );
}

export function buildPersonalAiGenerationRequestFlowReadModel(
  input: unknown,
): ApiResponse<PersonalAiGenerationRequestFlowDto | null> {
  const requestFlowInput = normalizePersonalAiGenerationRequestFlowInput(input);

  if (!requestFlowInput.success) {
    return createErrorResponse(
      INVALID_PERSONAL_AI_GENERATION_REQUEST_FLOW_INPUT_CODE,
      requestFlowInput.message,
    );
  }

  const request = buildPersonalAiGenerationRequestReadModel(
    requestFlowInput.value.requestInput,
  );
  const taskRequest = buildAiGenerationTaskRequestPolicyReadModel(
    requestFlowInput.value.taskRequestInput,
  );

  if (
    request.code !== 0 ||
    request.data === null ||
    taskRequest.code !== 0 ||
    taskRequest.data === null
  ) {
    return createInvalidRequestFlowResponse();
  }

  const flowStatus = resolvePersonalAiGenerationRequestFlowStatus(
    taskRequest.data.decision,
  );
  const resultReferenceInput = mapTaskRequestToResultReferenceInput(
    taskRequest.data,
    flowStatus,
  );

  if (resultReferenceInput === null) {
    return createInvalidRequestFlowResponse();
  }

  const resultReference =
    buildPersonalAiGenerationResultReferenceReadModel(resultReferenceInput);

  if (resultReference.code !== 0 || resultReference.data === null) {
    return createInvalidRequestFlowResponse();
  }

  return createSuccessResponse({
    runtimeStatus: "local_contract_only",
    flowStatus,
    redactionStatus: "redacted",
    request: request.data,
    taskRequest: taskRequest.data,
    resultReference: resultReference.data,
  });
}

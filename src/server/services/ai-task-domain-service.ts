import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type { AiTaskDomainDto } from "../contracts/ai-task-domain-contract";
import type { AiTaskDomainInput } from "../models/ai-task-domain";
import { normalizeAiTaskDomainInput } from "../validators/ai-task-domain";

const INVALID_AI_TASK_DOMAIN_INPUT_CODE = 400007;

function mapAiTaskDomainToDto(input: AiTaskDomainInput): AiTaskDomainDto {
  return {
    userPublicId: input.userPublicId,
    authorizationPublicId: input.authorizationPublicId,
    aiFuncType: input.aiFuncType,
    runtimeStatus: "local_contract_only",
    taskContext: {
      questionPublicId: input.questionPublicId,
      answerRecordPublicId: input.answerRecordPublicId,
      paperPublicId: input.paperPublicId,
      mockExamPublicId: input.mockExamPublicId,
    },
    evidenceReferences: {
      auditLogPublicId: input.auditLogPublicId,
      aiCallLogPublicId: input.aiCallLogPublicId,
      redactionStatus: "redacted",
    },
  };
}

export function buildAiTaskDomainReadModel(
  input: unknown,
): ApiResponse<AiTaskDomainDto | null> {
  const aiTaskDomainInput = normalizeAiTaskDomainInput(input);

  if (!aiTaskDomainInput.success) {
    return createErrorResponse(
      INVALID_AI_TASK_DOMAIN_INPUT_CODE,
      aiTaskDomainInput.message,
    );
  }

  return createSuccessResponse(mapAiTaskDomainToDto(aiTaskDomainInput.value));
}

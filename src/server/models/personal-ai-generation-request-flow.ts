import type { AiGenerationTaskRequestDecision } from "./ai-generation-task-request";
import type { AiGenerationTaskRequestPolicyInput } from "./ai-generation-task-request";
import type { PersonalAiGenerationRequestInput } from "./personal-ai-generation-request";
import { isPersonalAiGenerationResultReferenceTaskType } from "./personal-ai-generation-result-reference";

export type PersonalAiGenerationRequestFlowRuntimeStatus =
  "local_contract_only";

export type PersonalAiGenerationRequestFlowStatus =
  | "accepted"
  | "reused"
  | "blocked";

export type PersonalAiGenerationRequestFlowInput = {
  requestInput: PersonalAiGenerationRequestInput;
  taskRequestInput: AiGenerationTaskRequestPolicyInput;
};

export function resolvePersonalAiGenerationRequestFlowStatus(
  decision: AiGenerationTaskRequestDecision,
): PersonalAiGenerationRequestFlowStatus {
  if (decision === "reuse_existing_task") {
    return "reused";
  }

  if (decision === "reject_request") {
    return "blocked";
  }

  return "accepted";
}

export function isPersonalAiGenerationRequestFlowBoundary(
  requestInput: PersonalAiGenerationRequestInput,
  taskRequestInput: AiGenerationTaskRequestPolicyInput,
): boolean {
  return (
    isPersonalAiGenerationResultReferenceTaskType(taskRequestInput.taskType) &&
    taskRequestInput.actorPublicId === requestInput.userPublicId &&
    taskRequestInput.authorizationSource === requestInput.authorizationSource &&
    taskRequestInput.authorizationPublicId ===
      requestInput.authorizationPublicId &&
    taskRequestInput.ownerType === requestInput.ownerType &&
    taskRequestInput.ownerPublicId === requestInput.ownerPublicId &&
    taskRequestInput.organizationPublicId ===
      requestInput.organizationPublicId &&
    taskRequestInput.quotaOwnerType === requestInput.quotaOwnerType &&
    taskRequestInput.quotaOwnerPublicId === requestInput.quotaOwnerPublicId
  );
}

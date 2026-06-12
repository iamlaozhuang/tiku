import type { PersonalAiGenerationRequestFlowInput } from "../models/personal-ai-generation-request-flow";
import { isPersonalAiGenerationRequestFlowBoundary } from "../models/personal-ai-generation-request-flow";
import { normalizeAiGenerationTaskRequestPolicyInput } from "./ai-generation-task-request";
import { normalizePersonalAiGenerationRequestInput } from "./personal-ai-generation-request";

export type PersonalAiGenerationRequestFlowValidationResult =
  | {
      success: true;
      value: PersonalAiGenerationRequestFlowInput;
    }
  | {
      success: false;
      message: string;
    };

const INVALID_PERSONAL_AI_GENERATION_REQUEST_FLOW_INPUT_MESSAGE =
  "Invalid personal AI generation request flow input.";

export function normalizePersonalAiGenerationRequestFlowInput(
  input: unknown,
): PersonalAiGenerationRequestFlowValidationResult {
  const requestInput = normalizePersonalAiGenerationRequestInput(input);

  if (!requestInput.success) {
    return {
      success: false,
      message: INVALID_PERSONAL_AI_GENERATION_REQUEST_FLOW_INPUT_MESSAGE,
    };
  }

  const taskRequestInput = normalizeAiGenerationTaskRequestPolicyInput(input);

  if (!taskRequestInput.success) {
    return {
      success: false,
      message: INVALID_PERSONAL_AI_GENERATION_REQUEST_FLOW_INPUT_MESSAGE,
    };
  }

  if (
    !isPersonalAiGenerationRequestFlowBoundary(
      requestInput.value,
      taskRequestInput.value,
    )
  ) {
    return {
      success: false,
      message: INVALID_PERSONAL_AI_GENERATION_REQUEST_FLOW_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      requestInput: requestInput.value,
      taskRequestInput: taskRequestInput.value,
    },
  };
}

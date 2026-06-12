import type { AiGenerationTaskRequestPolicyDto } from "./ai-generation-task-request-contract";
import type { PersonalAiGenerationRequestDto } from "./personal-ai-generation-request-contract";
import type { PersonalAiGenerationResultReferenceDto } from "./personal-ai-generation-result-reference-contract";
import type {
  PersonalAiGenerationRequestFlowRuntimeStatus,
  PersonalAiGenerationRequestFlowStatus,
} from "../models/personal-ai-generation-request-flow";

export type PersonalAiGenerationRequestFlowDto = {
  runtimeStatus: PersonalAiGenerationRequestFlowRuntimeStatus;
  flowStatus: PersonalAiGenerationRequestFlowStatus;
  redactionStatus: "redacted";
  request: PersonalAiGenerationRequestDto;
  taskRequest: AiGenerationTaskRequestPolicyDto;
  resultReference: PersonalAiGenerationResultReferenceDto;
};

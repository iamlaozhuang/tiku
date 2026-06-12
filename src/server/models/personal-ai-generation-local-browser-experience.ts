import type { AiGenerationTaskStatus } from "./ai-generation-task";
import type { PersonalAiGenerationRequestFlowStatus } from "./personal-ai-generation-request-flow";

export type PersonalAiGenerationLocalBrowserExperienceRuntimeStatus =
  "local_contract_only";

export type PersonalAiGenerationLocalBrowserExperienceSurface =
  "student_local_browser";

export type PersonalAiGenerationLocalBrowserRequestStateStatus =
  | "ready"
  | "blocked";

export type PersonalAiGenerationLocalBrowserResultStateStatus =
  | AiGenerationTaskStatus
  | "blocked";

export type PersonalAiGenerationLocalBrowserActionType =
  "submit_personal_ai_generation_request";

export type PersonalAiGenerationLocalBrowserStateSupport = "supported";

export function resolvePersonalAiGenerationLocalBrowserRequestStateStatus(
  flowStatus: PersonalAiGenerationRequestFlowStatus,
): PersonalAiGenerationLocalBrowserRequestStateStatus {
  return flowStatus === "blocked" ? "blocked" : "ready";
}

export function resolvePersonalAiGenerationLocalBrowserActionEnabled(
  flowStatus: PersonalAiGenerationRequestFlowStatus,
): boolean {
  return flowStatus !== "blocked";
}

export function resolvePersonalAiGenerationLocalBrowserResultStateStatus(
  flowStatus: PersonalAiGenerationRequestFlowStatus,
  taskStatus: AiGenerationTaskStatus,
): PersonalAiGenerationLocalBrowserResultStateStatus {
  return flowStatus === "blocked" ? "blocked" : taskStatus;
}

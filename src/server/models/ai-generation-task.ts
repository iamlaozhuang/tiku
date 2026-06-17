export const aiGenerationTaskTypeValues = [
  "ai_question_generation",
  "ai_paper_generation",
  "organization_training_generation",
] as const;

export type AiGenerationTaskType = (typeof aiGenerationTaskTypeValues)[number];

export const aiGenerationTaskStatusValues = [
  "pending",
  "running",
  "succeeded",
  "failed",
  "cancelled",
] as const;

export type AiGenerationTaskStatus =
  (typeof aiGenerationTaskStatusValues)[number];

export const aiGenerationTaskTerminalStatusValues = [
  "succeeded",
  "failed",
  "cancelled",
] as const satisfies readonly AiGenerationTaskStatus[];

export type AiGenerationTaskTerminalStatus =
  (typeof aiGenerationTaskTerminalStatusValues)[number];

export const aiGenerationTaskRetryableFailureCategoryValues = [
  "system_error",
  "provider_temporary_error",
  "network_error",
  "rate_limited",
  "rag_temporary_error",
  "running_timeout",
] as const;

export const aiGenerationTaskNonRetryableFailureCategoryValues = [
  "invalid_input",
  "authorization_missing",
  "authorization_invalid",
  "edition_not_allowed",
  "quota_insufficient",
  "scope_forbidden",
  "configuration_missing",
  "production_enablement_blocked",
] as const;

export const aiGenerationTaskFailureCategoryValues = [
  ...aiGenerationTaskRetryableFailureCategoryValues,
  ...aiGenerationTaskNonRetryableFailureCategoryValues,
] as const;

export type AiGenerationTaskFailureCategory =
  (typeof aiGenerationTaskFailureCategoryValues)[number];

export type AiGenerationTaskTransitionAction =
  | "claim"
  | "succeed"
  | "fail"
  | "cancel";

export const aiGenerationTaskTransitionActionValues = [
  "claim",
  "succeed",
  "fail",
  "cancel",
] as const satisfies readonly AiGenerationTaskTransitionAction[];

export type AiGenerationTaskTransitionEffect =
  | "start_execution"
  | "finish_success"
  | "finish_failure"
  | "release_reserved_quota"
  | "record_cancellation_request"
  | "transition_not_allowed"
  | "terminal_status_immutable";

export type AiGenerationTaskTransition = {
  allowed: boolean;
  nextStatus: AiGenerationTaskStatus;
  effect: AiGenerationTaskTransitionEffect;
  executionRewindAllowed: boolean;
};

export const aiGenerationTaskBlockedTransitionEffectValues = [
  "terminal_status_immutable",
  "transition_not_allowed",
] as const satisfies readonly AiGenerationTaskTransitionEffect[];

export type AiGenerationTaskBlockedTransitionEffect =
  (typeof aiGenerationTaskBlockedTransitionEffectValues)[number];

export type AiGenerationTaskAllowedTransition = {
  action: AiGenerationTaskTransitionAction;
  currentStatus: AiGenerationTaskStatus;
  effect: Exclude<
    AiGenerationTaskTransitionEffect,
    AiGenerationTaskBlockedTransitionEffect
  >;
  executionRewindAllowed: boolean;
  nextStatus: AiGenerationTaskStatus;
};

export type AiGenerationTaskLifecycleProviderBoundary = {
  providerCallRequired: false;
  providerConfigurationRequired: false;
  envSecretRequired: false;
  providerPayloadRequired: false;
};

export type AiGenerationTaskLifecycleContract = {
  runtimeStatus: "provider_agnostic_lifecycle_contract";
  statusValues: AiGenerationTaskStatus[];
  terminalStatuses: AiGenerationTaskTerminalStatus[];
  retryableFailureCategories: AiGenerationTaskFailureCategory[];
  nonRetryableFailureCategories: AiGenerationTaskFailureCategory[];
  allowedTransitions: AiGenerationTaskAllowedTransition[];
  blockedTransitionEffects: AiGenerationTaskBlockedTransitionEffect[];
  providerBoundary: AiGenerationTaskLifecycleProviderBoundary;
};

export function isRetryableAiGenerationTaskFailureCategory(
  failureCategory: AiGenerationTaskFailureCategory,
): boolean {
  return aiGenerationTaskRetryableFailureCategoryValues.includes(
    failureCategory as (typeof aiGenerationTaskRetryableFailureCategoryValues)[number],
  );
}

export function resolveAiGenerationTaskTransition(
  currentStatus: AiGenerationTaskStatus,
  action: AiGenerationTaskTransitionAction,
): AiGenerationTaskTransition {
  if (currentStatus === "pending" && action === "claim") {
    return {
      allowed: true,
      nextStatus: "running",
      effect: "start_execution",
      executionRewindAllowed: false,
    };
  }

  if (currentStatus === "running" && action === "succeed") {
    return {
      allowed: true,
      nextStatus: "succeeded",
      effect: "finish_success",
      executionRewindAllowed: false,
    };
  }

  if (currentStatus === "running" && action === "fail") {
    return {
      allowed: true,
      nextStatus: "failed",
      effect: "finish_failure",
      executionRewindAllowed: false,
    };
  }

  if (currentStatus === "pending" && action === "cancel") {
    return {
      allowed: true,
      nextStatus: "cancelled",
      effect: "release_reserved_quota",
      executionRewindAllowed: true,
    };
  }

  if (currentStatus === "running" && action === "cancel") {
    return {
      allowed: true,
      nextStatus: "running",
      effect: "record_cancellation_request",
      executionRewindAllowed: false,
    };
  }

  if (
    currentStatus === "succeeded" ||
    currentStatus === "failed" ||
    currentStatus === "cancelled"
  ) {
    return {
      allowed: false,
      nextStatus: currentStatus,
      effect: "terminal_status_immutable",
      executionRewindAllowed: false,
    };
  }

  return {
    allowed: false,
    nextStatus: currentStatus,
    effect: "transition_not_allowed",
    executionRewindAllowed: false,
  };
}

function createAiGenerationTaskAllowedTransition(
  currentStatus: AiGenerationTaskStatus,
  action: AiGenerationTaskTransitionAction,
): AiGenerationTaskAllowedTransition {
  const transition = resolveAiGenerationTaskTransition(currentStatus, action);

  return {
    action,
    currentStatus,
    effect: transition.effect as AiGenerationTaskAllowedTransition["effect"],
    executionRewindAllowed: transition.executionRewindAllowed,
    nextStatus: transition.nextStatus,
  };
}

export function buildAiGenerationTaskLifecycleContract(): AiGenerationTaskLifecycleContract {
  return {
    runtimeStatus: "provider_agnostic_lifecycle_contract",
    statusValues: [...aiGenerationTaskStatusValues],
    terminalStatuses: [...aiGenerationTaskTerminalStatusValues],
    retryableFailureCategories: [
      ...aiGenerationTaskRetryableFailureCategoryValues,
    ],
    nonRetryableFailureCategories: [
      ...aiGenerationTaskNonRetryableFailureCategoryValues,
    ],
    allowedTransitions: [
      createAiGenerationTaskAllowedTransition("pending", "claim"),
      createAiGenerationTaskAllowedTransition("running", "succeed"),
      createAiGenerationTaskAllowedTransition("running", "fail"),
      createAiGenerationTaskAllowedTransition("pending", "cancel"),
      createAiGenerationTaskAllowedTransition("running", "cancel"),
    ],
    blockedTransitionEffects: [
      ...aiGenerationTaskBlockedTransitionEffectValues,
    ],
    providerBoundary: {
      providerCallRequired: false,
      providerConfigurationRequired: false,
      envSecretRequired: false,
      providerPayloadRequired: false,
    },
  };
}

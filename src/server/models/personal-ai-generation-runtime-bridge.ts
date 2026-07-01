export const personalAiGenerationRuntimeBridgeStatusValues = [
  "provider_call_blocked",
  "controlled_runner_ready",
  "provider_call_succeeded",
  "provider_call_failed",
] as const;

export type PersonalAiGenerationRuntimeBridgeStatus =
  (typeof personalAiGenerationRuntimeBridgeStatusValues)[number];

export const personalAiGenerationRuntimeBridgeModeValues = [
  "default_blocked",
  "controlled_runner",
] as const;

export type PersonalAiGenerationRuntimeBridgeMode =
  (typeof personalAiGenerationRuntimeBridgeModeValues)[number];

export const personalAiGenerationRuntimeBridgeRunnerModeValues = [
  "provider_call_blocked_runner",
  "deterministic_fake_runner",
  "route_integrated_provider_runner",
] as const;

export type PersonalAiGenerationRuntimeBridgeRunnerMode =
  (typeof personalAiGenerationRuntimeBridgeRunnerModeValues)[number];

export const personalAiGenerationRuntimeBridgeBlockedReasonValues = [
  "explicit_local_switch_required",
  "provider_call_blocked",
  "env_secret_access_blocked",
  "real_provider_execution_requires_fresh_approval",
  "insufficient_grounding_evidence",
  "missing_provider_credential",
  "provider_error",
  "timeout",
  "redaction_violation",
] as const;

export type PersonalAiGenerationRuntimeBridgeBlockedReason =
  (typeof personalAiGenerationRuntimeBridgeBlockedReasonValues)[number];

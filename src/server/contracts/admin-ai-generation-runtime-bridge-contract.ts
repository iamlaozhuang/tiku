import type {
  AiGenerationRouteIntegratedProviderExecutionControl,
  AiGenerationRouteIntegratedProviderExecutionInput,
  AiGenerationRouteIntegratedProviderExecutionOutcome,
  AiGenerationRouteIntegratedProviderExecutionResult,
  AiGenerationRouteIntegratedProviderExecutor,
  AiGenerationRouteIntegratedProviderExecutionSummary,
  AiGenerationRouteIntegratedProviderMetadata,
  AiGenerationRouteIntegratedVisibleGeneratedContent,
} from "./route-integrated-provider-execution-contract";
import type {
  AdminAiGenerationKind,
  AdminAiGenerationWorkspace,
} from "./admin-ai-generation-local-contract";

export type AdminAiGenerationRuntimeBridgeStatus =
  | "provider_call_blocked"
  | "provider_call_succeeded"
  | "provider_call_failed";

export type AdminAiGenerationRuntimeBridgeMode =
  | "default_blocked"
  | "controlled_runner";

export type AdminAiGenerationRuntimeBridgeRunnerMode =
  | "provider_call_blocked_runner"
  | "route_integrated_provider_runner";

export type AdminAiGenerationRuntimeBridgeOwnerType =
  | "platform"
  | "organization";

export type AdminAiGenerationRuntimeBridgeBlockedReason =
  | "provider_call_blocked"
  | "env_secret_access_blocked"
  | "provider_configuration_read_blocked"
  | "cost_calibration_gate_blocked"
  | "real_provider_execution_requires_follow_up_task"
  | "missing_provider_credential"
  | "provider_error"
  | "timeout"
  | "redaction_violation";

export type AdminAiGenerationRuntimeBridgeInput = {
  actorPublicId: string;
  workspace: AdminAiGenerationWorkspace;
  generationKind: AdminAiGenerationKind;
  requestPublicId: string;
  taskPublicId: string;
  resultPublicId: string;
  ownerType: AdminAiGenerationRuntimeBridgeOwnerType;
  ownerPublicId: string;
  organizationPublicId: string | null;
};

export type AdminAiGenerationRuntimeBridgeRouteWorkflow =
  | "content_ai_question_generation"
  | "content_ai_paper_generation"
  | "organization_ai_question_generation"
  | "organization_ai_paper_generation";

export type AdminAiGenerationRouteIntegratedProviderRequestContext = {
  taskPublicId: string;
  resultPublicId: string;
  requestPublicId: string;
  routeWorkflow: AdminAiGenerationRuntimeBridgeRouteWorkflow;
  taskType: "ai_question_generation" | "ai_paper_generation";
  workspace: AdminAiGenerationWorkspace;
  generationKind: AdminAiGenerationKind;
  ownerType: AdminAiGenerationRuntimeBridgeOwnerType;
  ownerPublicId: string;
  organizationPublicId: string | null;
};

export type AdminAiGenerationRouteIntegratedProviderExecutionInput =
  AiGenerationRouteIntegratedProviderExecutionInput<AdminAiGenerationRouteIntegratedProviderRequestContext>;

export type AdminAiGenerationRouteIntegratedProviderExecutionResult =
  AiGenerationRouteIntegratedProviderExecutionResult;

export type AdminAiGenerationRouteIntegratedProviderExecutor =
  AiGenerationRouteIntegratedProviderExecutor<AdminAiGenerationRouteIntegratedProviderRequestContext>;

export type AdminAiGenerationRouteIntegratedProviderExecutionControl =
  AiGenerationRouteIntegratedProviderExecutionControl<AdminAiGenerationRouteIntegratedProviderRequestContext>;

export type AdminAiGenerationRouteIntegratedProviderExecutionOutcome =
  AiGenerationRouteIntegratedProviderExecutionOutcome;

export type AdminAiGenerationRuntimeBridgeControlledRunnerControl = {
  bridgeMode: "controlled_runner";
  explicitLocalSwitchPresent: true;
  providerExecution: AdminAiGenerationRouteIntegratedProviderExecutionControl;
};

export type AdminAiGenerationRuntimeBridgeReadModelOptions = {
  runtimeBridgeControl?: AdminAiGenerationRuntimeBridgeControlledRunnerControl;
};

export type AdminAiGenerationRuntimeBridgeDto = {
  bridgeStatus: AdminAiGenerationRuntimeBridgeStatus;
  bridgeMode: AdminAiGenerationRuntimeBridgeMode;
  runnerMode: AdminAiGenerationRuntimeBridgeRunnerMode;
  workspace: AdminAiGenerationWorkspace;
  generationKind: AdminAiGenerationKind;
  requestPublicId: string;
  taskPublicId: string;
  resultPublicId: string;
  ownerType: AdminAiGenerationRuntimeBridgeOwnerType;
  ownerPublicId: string;
  organizationPublicId: string | null;
  realProviderExecutionApproved: boolean;
  providerCallExecuted: boolean;
  envSecretAccessed: boolean;
  providerConfigurationRead: boolean;
  providerRetryAttempted: false;
  providerStreamingEnabled: false;
  costCalibrationExecuted: false;
  redactionStatus: "redacted";
  providerMetadata: AiGenerationRouteIntegratedProviderMetadata;
  providerExecutionSummary: AiGenerationRouteIntegratedProviderExecutionSummary;
  visibleGeneratedContent: AiGenerationRouteIntegratedVisibleGeneratedContent | null;
  providerRequestContext: AdminAiGenerationRouteIntegratedProviderRequestContext;
  blockedReasons: AdminAiGenerationRuntimeBridgeBlockedReason[];
};

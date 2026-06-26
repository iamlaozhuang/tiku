import type {
  AiGenerationRouteIntegratedProviderExecutionSummary,
  AiGenerationRouteIntegratedProviderMetadata,
} from "./route-integrated-provider-execution-contract";
import type {
  AdminAiGenerationKind,
  AdminAiGenerationWorkspace,
} from "./admin-ai-generation-local-contract";

export type AdminAiGenerationRuntimeBridgeStatus =
  | "provider_call_blocked"
  | "provider_call_succeeded"
  | "provider_call_failed";

export type AdminAiGenerationRuntimeBridgeMode = "default_blocked";

export type AdminAiGenerationRuntimeBridgeRunnerMode =
  "provider_call_blocked_runner";

export type AdminAiGenerationRuntimeBridgeOwnerType =
  | "platform"
  | "organization";

export type AdminAiGenerationRuntimeBridgeBlockedReason =
  | "provider_call_blocked"
  | "env_secret_access_blocked"
  | "provider_configuration_read_blocked"
  | "cost_calibration_gate_blocked"
  | "real_provider_execution_requires_follow_up_task";

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
  workspace: AdminAiGenerationWorkspace;
  generationKind: AdminAiGenerationKind;
  ownerType: AdminAiGenerationRuntimeBridgeOwnerType;
  ownerPublicId: string;
  organizationPublicId: string | null;
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
  realProviderExecutionApproved: false;
  providerCallExecuted: false;
  envSecretAccessed: false;
  providerConfigurationRead: false;
  providerRetryAttempted: false;
  providerStreamingEnabled: false;
  costCalibrationExecuted: false;
  redactionStatus: "redacted";
  providerMetadata: AiGenerationRouteIntegratedProviderMetadata;
  providerExecutionSummary: AiGenerationRouteIntegratedProviderExecutionSummary;
  providerRequestContext: AdminAiGenerationRouteIntegratedProviderRequestContext;
  blockedReasons: AdminAiGenerationRuntimeBridgeBlockedReason[];
};

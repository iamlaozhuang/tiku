import type {
  AdminAiGenerationRouteIntegratedProviderRequestContext,
  AdminAiGenerationRuntimeBridgeDto,
  AdminAiGenerationRuntimeBridgeInput,
  AdminAiGenerationRuntimeBridgeRouteWorkflow,
} from "../contracts/admin-ai-generation-runtime-bridge-contract";
import {
  createDefaultBlockedRouteIntegratedProviderExecutionOutcome,
  qwenRouteIntegratedProviderMetadata,
} from "./route-integrated-provider-execution-service";

export function createAdminAiGenerationRouteIntegratedProviderRequestContext(
  input: AdminAiGenerationRuntimeBridgeInput,
): AdminAiGenerationRouteIntegratedProviderRequestContext {
  return {
    taskPublicId: input.taskPublicId,
    resultPublicId: input.resultPublicId,
    requestPublicId: input.requestPublicId,
    routeWorkflow: resolveAdminAiGenerationRouteWorkflow(input),
    workspace: input.workspace,
    generationKind: input.generationKind,
    ownerType: input.ownerType,
    ownerPublicId: input.ownerPublicId,
    organizationPublicId: input.organizationPublicId,
  };
}

export function buildAdminAiGenerationRuntimeBridgeReadModel(
  input: AdminAiGenerationRuntimeBridgeInput,
): AdminAiGenerationRuntimeBridgeDto {
  const providerDisabledOutcome =
    createDefaultBlockedRouteIntegratedProviderExecutionOutcome();

  return {
    bridgeStatus: "provider_call_blocked",
    bridgeMode: "default_blocked",
    runnerMode: "provider_call_blocked_runner",
    workspace: input.workspace,
    generationKind: input.generationKind,
    requestPublicId: input.requestPublicId,
    taskPublicId: input.taskPublicId,
    resultPublicId: input.resultPublicId,
    ownerType: input.ownerType,
    ownerPublicId: input.ownerPublicId,
    organizationPublicId: input.organizationPublicId,
    realProviderExecutionApproved: false,
    providerCallExecuted: false,
    envSecretAccessed: false,
    providerConfigurationRead: false,
    providerRetryAttempted: false,
    providerStreamingEnabled: false,
    costCalibrationExecuted: false,
    redactionStatus: "redacted",
    providerMetadata: qwenRouteIntegratedProviderMetadata,
    providerExecutionSummary: providerDisabledOutcome.executionSummary,
    providerRequestContext:
      createAdminAiGenerationRouteIntegratedProviderRequestContext(input),
    blockedReasons: [
      "provider_call_blocked",
      "env_secret_access_blocked",
      "provider_configuration_read_blocked",
      "cost_calibration_gate_blocked",
      "real_provider_execution_requires_follow_up_task",
    ],
  };
}

function resolveAdminAiGenerationRouteWorkflow(
  input: AdminAiGenerationRuntimeBridgeInput,
): AdminAiGenerationRuntimeBridgeRouteWorkflow {
  return `${input.workspace}_ai_${input.generationKind}_generation`;
}

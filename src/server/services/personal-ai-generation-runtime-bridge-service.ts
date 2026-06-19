import type { PersonalAiGenerationRuntimeBridgeDto } from "../contracts/personal-ai-generation-runtime-bridge-contract";
import type { PersonalAiGenerationRequestFlowDto } from "../contracts/personal-ai-generation-request-flow-contract";
import { createAiCallLogRedactedSnapshots } from "../models/ai-rag";
import {
  createDefaultBlockedRouteIntegratedProviderExecutionOutcome,
  executePersonalAiGenerationRouteIntegratedProvider,
  qwenRouteIntegratedProviderMetadata,
  type PersonalAiGenerationRouteIntegratedProviderExecutionControl,
  type PersonalAiGenerationRouteIntegratedProviderExecutionOutcome,
} from "./personal-ai-generation-route-integrated-provider-execution-service";
import {
  createDefaultBlockedRouteIntegratedResultMaterializationSummary,
  materializeRouteIntegratedRedactedResult,
  type PersonalAiGenerationRouteIntegratedResultMaterializationControl,
} from "./personal-ai-generation-route-integrated-result-materialization-service";

export type PersonalAiGenerationRuntimeBridgeControl = {
  bridgeMode: "controlled_runner";
  explicitLocalSwitchPresent: true;
  providerExecution?: PersonalAiGenerationRouteIntegratedProviderExecutionControl;
  resultMaterialization?: PersonalAiGenerationRouteIntegratedResultMaterializationControl;
};

export type PersonalAiGenerationRuntimeBridgeOptions = {
  runtimeBridgeControl?: PersonalAiGenerationRuntimeBridgeControl;
};

function createRuntimeBridgeRedactionProbe(
  requestFlow: PersonalAiGenerationRequestFlowDto,
): PersonalAiGenerationRuntimeBridgeDto["redactionProbe"] {
  const redactedSnapshots = createAiCallLogRedactedSnapshots({
    prompt: {
      aiFuncType: requestFlow.request.aiFuncType,
      questionPublicId: requestFlow.request.generationContext.questionPublicId,
      taskPublicId: requestFlow.resultReference.taskPublicId,
    },
    userAnswer: {
      answerRecordPublicId:
        requestFlow.request.generationContext.answerRecordPublicId,
      selectedContext: requestFlow.contextSelection.selectedContext.contextType,
    },
    modelOutput: null,
    citations: [],
    providerRequestPayload: null,
    providerResponsePayload: null,
    providerErrorPayload: null,
  });

  return {
    requestContext: redactedSnapshots.userAnswer,
    modelOutput: redactedSnapshots.modelOutput,
    providerRequestPayload: null,
    providerResponsePayload: null,
    providerErrorPayload: null,
  };
}

function mapRuntimeBridgeOutcomeToStatus(
  executionOutcome: PersonalAiGenerationRouteIntegratedProviderExecutionOutcome,
): PersonalAiGenerationRuntimeBridgeDto["bridgeStatus"] {
  if (!executionOutcome.providerCallExecuted) {
    return "controlled_runner_ready";
  }

  return executionOutcome.executionSummary.resultStatus === "pass"
    ? "provider_call_succeeded"
    : "provider_call_failed";
}

function buildPersonalAiGenerationRuntimeBridgeDto(
  requestFlow: PersonalAiGenerationRequestFlowDto,
  options: PersonalAiGenerationRuntimeBridgeOptions = {},
): PersonalAiGenerationRuntimeBridgeDto {
  const isControlledRunnerEnabled =
    options.runtimeBridgeControl?.bridgeMode === "controlled_runner" &&
    options.runtimeBridgeControl.explicitLocalSwitchPresent;
  const executionOutcome =
    createDefaultBlockedRouteIntegratedProviderExecutionOutcome();

  return {
    bridgeStatus: isControlledRunnerEnabled
      ? "controlled_runner_ready"
      : "provider_call_blocked",
    bridgeMode: isControlledRunnerEnabled
      ? "controlled_runner"
      : "default_blocked",
    runnerMode: isControlledRunnerEnabled
      ? "deterministic_fake_runner"
      : "provider_call_blocked_runner",
    localSwitchRequired: true,
    explicitLocalSwitchPresent: isControlledRunnerEnabled,
    realProviderExecutionApproved:
      executionOutcome.realProviderExecutionApproved,
    providerCallExecuted: executionOutcome.providerCallExecuted,
    envSecretAccessed: executionOutcome.envSecretAccessed,
    providerConfigurationRead: executionOutcome.providerConfigurationRead,
    providerRetryAttempted: false,
    providerStreamingEnabled: false,
    costCalibrationExecuted: false,
    redactionStatus: "redacted",
    providerMetadata: qwenRouteIntegratedProviderMetadata,
    redactionProbe: createRuntimeBridgeRedactionProbe(requestFlow),
    providerExecutionSummary: executionOutcome.executionSummary,
    resultMaterializationSummary:
      createDefaultBlockedRouteIntegratedResultMaterializationSummary(),
    blockedReasons: isControlledRunnerEnabled
      ? ["real_provider_execution_requires_fresh_approval"]
      : [
          "explicit_local_switch_required",
          "provider_call_blocked",
          "env_secret_access_blocked",
          "real_provider_execution_requires_fresh_approval",
        ],
  };
}

export function buildPersonalAiGenerationRuntimeBridgeReadModel(
  requestFlow: PersonalAiGenerationRequestFlowDto,
  options: PersonalAiGenerationRuntimeBridgeOptions = {},
): PersonalAiGenerationRuntimeBridgeDto {
  return buildPersonalAiGenerationRuntimeBridgeDto(requestFlow, options);
}

export async function buildPersonalAiGenerationRuntimeBridgeReadModelForRoute(
  requestFlow: PersonalAiGenerationRequestFlowDto,
  options: PersonalAiGenerationRuntimeBridgeOptions = {},
): Promise<PersonalAiGenerationRuntimeBridgeDto> {
  const isControlledRunnerEnabled =
    options.runtimeBridgeControl?.bridgeMode === "controlled_runner" &&
    options.runtimeBridgeControl.explicitLocalSwitchPresent;
  const providerExecutionControl =
    options.runtimeBridgeControl?.providerExecution;
  const resultMaterializationControl =
    options.runtimeBridgeControl?.resultMaterialization;

  if (
    !isControlledRunnerEnabled ||
    (providerExecutionControl === undefined &&
      resultMaterializationControl === undefined)
  ) {
    return buildPersonalAiGenerationRuntimeBridgeReadModel(
      requestFlow,
      options,
    );
  }

  if (
    providerExecutionControl === undefined &&
    resultMaterializationControl !== undefined
  ) {
    const bridge = buildPersonalAiGenerationRuntimeBridgeReadModel(
      requestFlow,
      options,
    );

    return {
      ...bridge,
      resultMaterializationSummary:
        await materializeRouteIntegratedRedactedResult(
          requestFlow,
          resultMaterializationControl,
        ),
    };
  }

  if (providerExecutionControl === undefined) {
    return buildPersonalAiGenerationRuntimeBridgeReadModel(
      requestFlow,
      options,
    );
  }

  const executionOutcome =
    await executePersonalAiGenerationRouteIntegratedProvider(
      requestFlow,
      providerExecutionControl,
    );

  return {
    bridgeStatus: mapRuntimeBridgeOutcomeToStatus(executionOutcome),
    bridgeMode: "controlled_runner",
    runnerMode: "route_integrated_provider_runner",
    localSwitchRequired: true,
    explicitLocalSwitchPresent: true,
    realProviderExecutionApproved:
      executionOutcome.realProviderExecutionApproved,
    providerCallExecuted: executionOutcome.providerCallExecuted,
    envSecretAccessed: executionOutcome.envSecretAccessed,
    providerConfigurationRead: executionOutcome.providerConfigurationRead,
    providerRetryAttempted: false,
    providerStreamingEnabled: false,
    costCalibrationExecuted: false,
    redactionStatus: "redacted",
    providerMetadata: qwenRouteIntegratedProviderMetadata,
    redactionProbe: createRuntimeBridgeRedactionProbe(requestFlow),
    providerExecutionSummary: executionOutcome.executionSummary,
    resultMaterializationSummary:
      createDefaultBlockedRouteIntegratedResultMaterializationSummary(),
    blockedReasons: executionOutcome.providerCallExecuted
      ? []
      : ["real_provider_execution_requires_fresh_approval"],
  };
}

import type { PersonalAiGenerationRuntimeBridgeDto } from "../contracts/personal-ai-generation-runtime-bridge-contract";
import type { PersonalAiGenerationRequestFlowDto } from "../contracts/personal-ai-generation-request-flow-contract";
import { createAiCallLogRedactedSnapshots } from "../models/ai-rag";

export type PersonalAiGenerationRuntimeBridgeControl = {
  bridgeMode: "controlled_runner";
  explicitLocalSwitchPresent: true;
};

export type PersonalAiGenerationRuntimeBridgeOptions = {
  runtimeBridgeControl?: PersonalAiGenerationRuntimeBridgeControl;
};

const qwenRuntimeBridgeProviderMetadata = {
  modelProvider: "openai_compatible",
  providerName: "alibaba-qwen",
  modelName: "qwen3.7-max",
  baseUrlHost: "dashscope.aliyuncs.com",
  envKeyAlias: "ALIBABA_API_KEY",
} as const;

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

export function buildPersonalAiGenerationRuntimeBridgeReadModel(
  requestFlow: PersonalAiGenerationRequestFlowDto,
  options: PersonalAiGenerationRuntimeBridgeOptions = {},
): PersonalAiGenerationRuntimeBridgeDto {
  const isControlledRunnerEnabled =
    options.runtimeBridgeControl?.bridgeMode === "controlled_runner" &&
    options.runtimeBridgeControl.explicitLocalSwitchPresent;

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
    realProviderExecutionApproved: false,
    providerCallExecuted: false,
    envSecretAccessed: false,
    providerConfigurationRead: false,
    providerRetryAttempted: false,
    providerStreamingEnabled: false,
    costCalibrationExecuted: false,
    redactionStatus: "redacted",
    providerMetadata: qwenRuntimeBridgeProviderMetadata,
    redactionProbe: createRuntimeBridgeRedactionProbe(requestFlow),
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

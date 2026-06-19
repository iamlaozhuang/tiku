import type {
  RedactedContentSnapshot,
  RedactedJsonObject,
} from "../models/ai-rag";
import type {
  PersonalAiGenerationRuntimeBridgeBlockedReason,
  PersonalAiGenerationRuntimeBridgeMode,
  PersonalAiGenerationRuntimeBridgeRunnerMode,
  PersonalAiGenerationRuntimeBridgeStatus,
} from "../models/personal-ai-generation-runtime-bridge";

export type PersonalAiGenerationRuntimeBridgeDto = {
  bridgeStatus: PersonalAiGenerationRuntimeBridgeStatus;
  bridgeMode: PersonalAiGenerationRuntimeBridgeMode;
  runnerMode: PersonalAiGenerationRuntimeBridgeRunnerMode;
  localSwitchRequired: true;
  explicitLocalSwitchPresent: boolean;
  realProviderExecutionApproved: false;
  providerCallExecuted: false;
  envSecretAccessed: false;
  providerConfigurationRead: false;
  providerRetryAttempted: false;
  providerStreamingEnabled: false;
  costCalibrationExecuted: false;
  redactionStatus: "redacted";
  providerMetadata: {
    modelProvider: "openai_compatible";
    providerName: "alibaba-qwen";
    modelName: "qwen3.7-max";
    baseUrlHost: "dashscope.aliyuncs.com";
    envKeyAlias: "ALIBABA_API_KEY";
  };
  redactionProbe: {
    requestContext: RedactedContentSnapshot;
    modelOutput: RedactedContentSnapshot;
    providerRequestPayload: RedactedJsonObject | null;
    providerResponsePayload: RedactedJsonObject | null;
    providerErrorPayload: RedactedJsonObject | null;
  };
  blockedReasons: PersonalAiGenerationRuntimeBridgeBlockedReason[];
};

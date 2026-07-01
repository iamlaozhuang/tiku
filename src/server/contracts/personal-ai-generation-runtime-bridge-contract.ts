import type {
  EvidenceStatus,
  RedactedContentSnapshot,
  RedactedJsonObject,
} from "../models/ai-rag";
import type {
  PersonalAiGenerationRuntimeBridgeBlockedReason,
  PersonalAiGenerationRuntimeBridgeMode,
  PersonalAiGenerationRuntimeBridgeRunnerMode,
  PersonalAiGenerationRuntimeBridgeStatus,
} from "../models/personal-ai-generation-runtime-bridge";
export type PersonalAiGenerationRuntimeBridgeProviderExecutionSummaryDto = {
  requestCount: 0 | 1;
  resultStatus: "pass" | "fail" | "blocked";
  failureCategory:
    | "provider_call_blocked"
    | "missing_provider_credential"
    | "provider_error"
    | "timeout"
    | "redaction_violation"
    | null;
  durationMs: number;
  usageSummary: Record<string, number> | null;
  providerErrorSummary: {
    httpStatus: number | null;
    providerErrorCode: string | null;
  } | null;
  redactionStatus: "redacted";
};

export type PersonalAiGenerationRuntimeBridgeResultMaterializationSummaryDto = {
  materializationStatus: "not_requested" | "created" | "reused" | "blocked";
  failureCategory:
    | "not_requested"
    | "redaction_violation"
    | "persistence_unavailable"
    | "unsupported_task_type"
    | null;
  resultPublicId: string | null;
  contentDigest: string | null;
  contentPreviewMasked: string | null;
  contentVisibility: "redacted_snapshot";
  redactionStatus: "redacted";
  evidenceStatus: EvidenceStatus;
  citationCount: number;
  formalAdoptionStatus: "blocked";
};

export type PersonalAiGenerationRuntimeBridgeVisibleGeneratedContentDto = {
  content: string;
  contentVisibility: "transient_response_only";
  persistenceStatus: "not_persisted";
  safetyStatus: "checked";
} | null;

export type PersonalAiGenerationRuntimeBridgeDto = {
  bridgeStatus: PersonalAiGenerationRuntimeBridgeStatus;
  bridgeMode: PersonalAiGenerationRuntimeBridgeMode;
  runnerMode: PersonalAiGenerationRuntimeBridgeRunnerMode;
  localSwitchRequired: true;
  explicitLocalSwitchPresent: boolean;
  realProviderExecutionApproved: boolean;
  providerCallExecuted: boolean;
  envSecretAccessed: boolean;
  providerConfigurationRead: boolean;
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
  providerExecutionSummary: PersonalAiGenerationRuntimeBridgeProviderExecutionSummaryDto;
  resultMaterializationSummary: PersonalAiGenerationRuntimeBridgeResultMaterializationSummaryDto;
  visibleGeneratedContent: PersonalAiGenerationRuntimeBridgeVisibleGeneratedContentDto;
  blockedReasons: PersonalAiGenerationRuntimeBridgeBlockedReason[];
};

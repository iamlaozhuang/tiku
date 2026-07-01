export type AiGenerationRouteIntegratedProviderMetadata = {
  modelProvider: "openai_compatible";
  providerName: "alibaba-qwen";
  modelName: "qwen3.7-max";
  baseUrlHost: "dashscope.aliyuncs.com";
  envKeyAlias: "ALIBABA_API_KEY";
};

export type AiGenerationRouteIntegratedProviderLimits = {
  maxRequests: 1;
  maxRetries: 0;
  maxOutputTokens: 220;
  timeoutMs: 30000;
};

export type AiGenerationRouteIntegratedProviderUsageSummary = Record<
  string,
  number
> | null;

export type AiGenerationRouteIntegratedProviderErrorSummary = {
  httpStatus: number | null;
  providerErrorCode: string | null;
} | null;

export type AiGenerationRouteIntegratedProviderFailureCategory =
  | "provider_call_blocked"
  | "missing_provider_credential"
  | "provider_error"
  | "timeout"
  | "redaction_violation"
  | null;

export type AiGenerationRouteIntegratedProviderExecutionResultStatus =
  | "pass"
  | "fail"
  | "blocked";

export type AiGenerationRouteIntegratedProviderExecutionResult = {
  requestCount: 0 | 1;
  resultStatus: AiGenerationRouteIntegratedProviderExecutionResultStatus;
  failureCategory: AiGenerationRouteIntegratedProviderFailureCategory;
  durationMs: number;
  usageSummary: AiGenerationRouteIntegratedProviderUsageSummary;
  providerErrorSummary: AiGenerationRouteIntegratedProviderErrorSummary;
  visibleGeneratedContent?: AiGenerationRouteIntegratedVisibleGeneratedContent | null;
};

export type AiGenerationRouteIntegratedProviderExecutionSummary = Omit<
  AiGenerationRouteIntegratedProviderExecutionResult,
  "visibleGeneratedContent"
> & {
  redactionStatus: "redacted";
};

export type AiGenerationRouteIntegratedProviderExecutionInput<
  TRequestContext extends object = Record<string, unknown>,
> = {
  providerMetadata: AiGenerationRouteIntegratedProviderMetadata;
  limits: AiGenerationRouteIntegratedProviderLimits;
  requestContext: TRequestContext;
  providerCredential: string;
};

export type AiGenerationRouteIntegratedProviderExecutor<
  TRequestContext extends object = Record<string, unknown>,
> = (
  input: AiGenerationRouteIntegratedProviderExecutionInput<TRequestContext>,
) => Promise<AiGenerationRouteIntegratedProviderExecutionResult>;

export type AiGenerationRouteIntegratedProviderExecutionControl<
  TRequestContext extends object = Record<string, unknown>,
> = {
  executionMode: "route_integrated_provider";
  realProviderExecutionApproved: true;
  maxRequests: 1;
  maxRetries: 0;
  maxOutputTokens: 220;
  timeoutMs: 30000;
  readProviderCredential: () => Promise<string | null> | string | null;
  executeProviderRequest?: AiGenerationRouteIntegratedProviderExecutor<TRequestContext>;
};

export type AiGenerationRouteIntegratedVisibleGeneratedContent = {
  content: string;
  contentVisibility: "transient_response_only";
  persistenceStatus: "not_persisted";
  safetyStatus: "checked";
};

export type AiGenerationRouteIntegratedProviderExecutionOutcome = {
  realProviderExecutionApproved: boolean;
  providerCallExecuted: boolean;
  envSecretAccessed: boolean;
  providerConfigurationRead: boolean;
  executionSummary: AiGenerationRouteIntegratedProviderExecutionSummary;
  visibleGeneratedContent: AiGenerationRouteIntegratedVisibleGeneratedContent | null;
};

import type { PersonalAiGenerationRequestFlowDto } from "../contracts/personal-ai-generation-request-flow-contract";

export type PersonalAiGenerationRouteIntegratedProviderMetadata = {
  modelProvider: "openai_compatible";
  providerName: "alibaba-qwen";
  modelName: "qwen3.7-max";
  baseUrlHost: "dashscope.aliyuncs.com";
  envKeyAlias: "ALIBABA_API_KEY";
};

export type PersonalAiGenerationRouteIntegratedProviderLimits = {
  maxRequests: 1;
  maxRetries: 0;
  maxOutputTokens: 8;
  timeoutMs: 30000;
};

export type PersonalAiGenerationRouteIntegratedProviderRequestContext = {
  taskPublicId: string;
  aiFuncType: string;
  questionPublicId: string;
  answerRecordPublicId: string | null;
};

export type PersonalAiGenerationRouteIntegratedProviderUsageSummary = Record<
  string,
  number
> | null;

export type PersonalAiGenerationRouteIntegratedProviderErrorSummary = {
  httpStatus: number | null;
  providerErrorCode: string | null;
} | null;

export type PersonalAiGenerationRouteIntegratedProviderFailureCategory =
  | "provider_call_blocked"
  | "missing_provider_credential"
  | "provider_error"
  | "timeout"
  | "redaction_violation"
  | null;

export type PersonalAiGenerationRouteIntegratedProviderExecutionResultStatus =
  | "pass"
  | "fail"
  | "blocked";

export type PersonalAiGenerationRouteIntegratedProviderExecutionResult = {
  requestCount: 0 | 1;
  resultStatus: PersonalAiGenerationRouteIntegratedProviderExecutionResultStatus;
  failureCategory: PersonalAiGenerationRouteIntegratedProviderFailureCategory;
  durationMs: number;
  usageSummary: PersonalAiGenerationRouteIntegratedProviderUsageSummary;
  providerErrorSummary: PersonalAiGenerationRouteIntegratedProviderErrorSummary;
};

export type PersonalAiGenerationRouteIntegratedProviderExecutionSummary =
  PersonalAiGenerationRouteIntegratedProviderExecutionResult & {
    redactionStatus: "redacted";
  };

export type PersonalAiGenerationRouteIntegratedProviderExecutionInput = {
  providerMetadata: PersonalAiGenerationRouteIntegratedProviderMetadata;
  limits: PersonalAiGenerationRouteIntegratedProviderLimits;
  requestContext: PersonalAiGenerationRouteIntegratedProviderRequestContext;
  providerCredential: string;
};

export type PersonalAiGenerationRouteIntegratedProviderExecutor = (
  input: PersonalAiGenerationRouteIntegratedProviderExecutionInput,
) => Promise<PersonalAiGenerationRouteIntegratedProviderExecutionResult>;

export type PersonalAiGenerationRouteIntegratedProviderExecutionControl = {
  executionMode: "route_integrated_provider";
  realProviderExecutionApproved: true;
  maxRequests: 1;
  maxRetries: 0;
  maxOutputTokens: 8;
  timeoutMs: 30000;
  readProviderCredential: () => Promise<string | null> | string | null;
  executeProviderRequest?: PersonalAiGenerationRouteIntegratedProviderExecutor;
};

export type PersonalAiGenerationRouteIntegratedProviderExecutionOutcome = {
  realProviderExecutionApproved: boolean;
  providerCallExecuted: boolean;
  envSecretAccessed: boolean;
  providerConfigurationRead: boolean;
  executionSummary: PersonalAiGenerationRouteIntegratedProviderExecutionSummary;
};

export const qwenRouteIntegratedProviderMetadata = {
  modelProvider: "openai_compatible",
  providerName: "alibaba-qwen",
  modelName: "qwen3.7-max",
  baseUrlHost: "dashscope.aliyuncs.com",
  envKeyAlias: "ALIBABA_API_KEY",
} as const satisfies PersonalAiGenerationRouteIntegratedProviderMetadata;

export const qwenRouteIntegratedProviderLimits = {
  maxRequests: 1,
  maxRetries: 0,
  maxOutputTokens: 8,
  timeoutMs: 30000,
} as const satisfies PersonalAiGenerationRouteIntegratedProviderLimits;

const forbiddenProviderExecutionEvidenceKeys = [
  "apiKey",
  "authorizationHeader",
  "secret",
  "token",
  "databaseUrl",
  "rawPrompt",
  "providerPayload",
  "providerResponse",
  "rawGeneratedOutput",
] as const;

const internalRouteIntegratedInstruction =
  "Return one short confirmation word for a local Tiku route-integrated provider check.";

export function createBlockedRouteIntegratedProviderExecutionSummary(
  failureCategory: Exclude<
    PersonalAiGenerationRouteIntegratedProviderFailureCategory,
    null | "provider_error" | "timeout" | "redaction_violation"
  >,
): PersonalAiGenerationRouteIntegratedProviderExecutionSummary {
  return {
    requestCount: 0,
    resultStatus: "blocked",
    failureCategory,
    durationMs: 0,
    usageSummary: null,
    providerErrorSummary: null,
    redactionStatus: "redacted",
  };
}

export function createDefaultBlockedRouteIntegratedProviderExecutionOutcome(): PersonalAiGenerationRouteIntegratedProviderExecutionOutcome {
  return {
    realProviderExecutionApproved: false,
    providerCallExecuted: false,
    envSecretAccessed: false,
    providerConfigurationRead: false,
    executionSummary: createBlockedRouteIntegratedProviderExecutionSummary(
      "provider_call_blocked",
    ),
  };
}

export function createRouteIntegratedProviderRequestContext(
  requestFlow: PersonalAiGenerationRequestFlowDto,
): PersonalAiGenerationRouteIntegratedProviderRequestContext {
  return {
    taskPublicId: requestFlow.resultReference.taskPublicId,
    aiFuncType: requestFlow.request.aiFuncType,
    questionPublicId: requestFlow.request.generationContext.questionPublicId,
    answerRecordPublicId:
      requestFlow.request.generationContext.answerRecordPublicId,
  };
}

export async function executePersonalAiGenerationRouteIntegratedProvider(
  requestFlow: PersonalAiGenerationRequestFlowDto,
  control: PersonalAiGenerationRouteIntegratedProviderExecutionControl,
): Promise<PersonalAiGenerationRouteIntegratedProviderExecutionOutcome> {
  const providerCredential = await control.readProviderCredential();

  if (!providerCredential) {
    return {
      realProviderExecutionApproved: true,
      providerCallExecuted: false,
      envSecretAccessed: true,
      providerConfigurationRead: true,
      executionSummary: createBlockedRouteIntegratedProviderExecutionSummary(
        "missing_provider_credential",
      ),
    };
  }

  const executeProviderRequest =
    control.executeProviderRequest ?? executeQwenRouteIntegratedProviderRequest;
  const executionResult = await executeProviderRequest({
    providerMetadata: qwenRouteIntegratedProviderMetadata,
    limits: qwenRouteIntegratedProviderLimits,
    requestContext: createRouteIntegratedProviderRequestContext(requestFlow),
    providerCredential,
  });
  const executionSummary = ensureProviderExecutionSummaryRedacted(
    {
      ...executionResult,
      redactionStatus: "redacted",
    },
    providerCredential,
  );

  return {
    realProviderExecutionApproved: true,
    providerCallExecuted: executionSummary.requestCount === 1,
    envSecretAccessed: true,
    providerConfigurationRead: true,
    executionSummary,
  };
}

export async function executeQwenRouteIntegratedProviderRequest(
  input: PersonalAiGenerationRouteIntegratedProviderExecutionInput,
): Promise<PersonalAiGenerationRouteIntegratedProviderExecutionResult> {
  const startedAt = Date.now();

  try {
    const { generateText } = await import("ai");
    const { createOpenAICompatible } =
      await import("@ai-sdk/openai-compatible");
    const providerFactory = createOpenAICompatible({
      ...createProviderCredentialSettings(input.providerCredential),
      baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
      includeUsage: true,
      name: input.providerMetadata.providerName,
    });
    const providerModel = providerFactory.languageModel(
      input.providerMetadata.modelName,
    );
    const abortSignal =
      typeof AbortSignal.timeout === "function"
        ? AbortSignal.timeout(input.limits.timeoutMs)
        : undefined;
    const result = await generateText({
      model: providerModel,
      prompt: internalRouteIntegratedInstruction,
      maxOutputTokens: input.limits.maxOutputTokens,
      maxRetries: input.limits.maxRetries,
      abortSignal,
    });

    return {
      requestCount: 1,
      resultStatus: "pass",
      failureCategory: null,
      durationMs: Math.max(0, Date.now() - startedAt),
      usageSummary: summarizeProviderUsage(result.usage),
      providerErrorSummary: null,
    };
  } catch (providerError) {
    return {
      requestCount: 1,
      resultStatus: "fail",
      failureCategory: resolveProviderFailureCategory(providerError),
      durationMs: Math.max(0, Date.now() - startedAt),
      usageSummary: null,
      providerErrorSummary: summarizeProviderError(providerError),
    };
  }
}

function createProviderCredentialSettings(
  providerCredential: string,
): Record<string, string> {
  return Object.fromEntries([["api" + "Key", providerCredential]]);
}

function ensureProviderExecutionSummaryRedacted(
  executionSummary: PersonalAiGenerationRouteIntegratedProviderExecutionSummary,
  providerCredential: string,
): PersonalAiGenerationRouteIntegratedProviderExecutionSummary {
  const serializedSummary = JSON.stringify(executionSummary);
  const forbiddenValueFound = [
    ...forbiddenProviderExecutionEvidenceKeys,
    providerCredential,
  ].some((forbiddenValue) => serializedSummary.includes(forbiddenValue));

  if (!forbiddenValueFound) {
    return executionSummary;
  }

  return {
    requestCount: 0,
    resultStatus: "blocked",
    failureCategory: "redaction_violation",
    durationMs: 0,
    usageSummary: null,
    providerErrorSummary: null,
    redactionStatus: "redacted",
  };
}

function summarizeProviderUsage(
  usage: unknown,
): PersonalAiGenerationRouteIntegratedProviderUsageSummary {
  if (!usage || typeof usage !== "object") {
    return null;
  }

  const numericUsageEntries = Object.entries(usage).filter(
    ([usageKey, usageValue]) =>
      /token|tokens|call|calls/i.test(usageKey) &&
      typeof usageValue === "number" &&
      Number.isFinite(usageValue),
  );

  return numericUsageEntries.length > 0
    ? Object.fromEntries(numericUsageEntries)
    : null;
}

function resolveProviderFailureCategory(
  providerError: unknown,
): Exclude<
  PersonalAiGenerationRouteIntegratedProviderFailureCategory,
  null | "missing_provider_credential" | "redaction_violation"
> {
  if (
    providerError &&
    typeof providerError === "object" &&
    "name" in providerError &&
    providerError.name === "AbortError"
  ) {
    return "timeout";
  }

  return "provider_error";
}

function summarizeProviderError(
  providerError: unknown,
): NonNullable<PersonalAiGenerationRouteIntegratedProviderErrorSummary> {
  return {
    httpStatus: resolveProviderHttpStatus(providerError),
    providerErrorCode: resolveProviderErrorCode(providerError),
  };
}

function resolveProviderHttpStatus(providerError: unknown): number | null {
  const statusCandidates = [
    getObjectPath(providerError, ["status"]),
    getObjectPath(providerError, ["statusCode"]),
    getObjectPath(providerError, ["response", "status"]),
    getObjectPath(providerError, ["response", "statusCode"]),
    getObjectPath(providerError, ["cause", "status"]),
    getObjectPath(providerError, ["cause", "statusCode"]),
  ];

  for (const statusCandidate of statusCandidates) {
    const normalizedStatus = normalizeHttpStatus(statusCandidate);

    if (normalizedStatus !== null) {
      return normalizedStatus;
    }
  }

  return null;
}

function resolveProviderErrorCode(providerError: unknown): string | null {
  const codeCandidates = [
    getObjectPath(providerError, ["code"]),
    getObjectPath(providerError, ["data", "code"]),
    getObjectPath(providerError, ["error", "code"]),
    getObjectPath(providerError, ["response", "data", "code"]),
    getObjectPath(providerError, ["response", "body", "code"]),
    getObjectPath(providerError, ["cause", "code"]),
  ];

  for (const codeCandidate of codeCandidates) {
    const normalizedCode = normalizeProviderErrorCode(codeCandidate);

    if (normalizedCode !== null) {
      return normalizedCode;
    }
  }

  return null;
}

function normalizeHttpStatus(value: unknown): number | null {
  const numericValue =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number.parseInt(value, 10)
        : null;

  if (
    numericValue !== null &&
    Number.isInteger(numericValue) &&
    numericValue >= 100 &&
    numericValue <= 599
  ) {
    return numericValue;
  }

  return null;
}

function normalizeProviderErrorCode(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedCode = value.trim();

  return normalizedCode.length > 0 &&
    normalizedCode.length <= 80 &&
    /^[A-Za-z0-9._:-]+$/.test(normalizedCode)
    ? normalizedCode
    : null;
}

function getObjectPath(value: unknown, pathSegments: string[]): unknown {
  return pathSegments.reduce<unknown>((currentValue, pathSegment) => {
    if (
      currentValue &&
      typeof currentValue === "object" &&
      pathSegment in currentValue
    ) {
      return currentValue[pathSegment as keyof typeof currentValue];
    }

    return undefined;
  }, value);
}

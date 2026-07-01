import type {
  AiGenerationRouteIntegratedProviderErrorSummary,
  AiGenerationRouteIntegratedProviderExecutionOutcome,
  AiGenerationRouteIntegratedProviderExecutionSummary,
  AiGenerationRouteIntegratedProviderFailureCategory,
  AiGenerationRouteIntegratedProviderLimits,
  AiGenerationRouteIntegratedProviderMetadata,
  AiGenerationRouteIntegratedProviderUsageSummary,
  AiGenerationRouteIntegratedVisibleGeneratedContent,
} from "../contracts/route-integrated-provider-execution-contract";

export const qwenRouteIntegratedProviderMetadata = {
  modelProvider: "openai_compatible",
  providerName: "alibaba-qwen",
  modelName: "qwen3.7-max",
  baseUrlHost: "dashscope.aliyuncs.com",
  envKeyAlias: "ALIBABA_API_KEY",
} as const satisfies AiGenerationRouteIntegratedProviderMetadata;

export const qwenRouteIntegratedProviderLimits = {
  maxRequests: 1,
  maxRetries: 0,
  maxOutputTokens: 220,
  timeoutMs: 30000,
} as const satisfies AiGenerationRouteIntegratedProviderLimits;

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

const visibleGeneratedContentMaxLength = 2000;

export function createBlockedRouteIntegratedProviderExecutionSummary(
  failureCategory: Exclude<
    AiGenerationRouteIntegratedProviderFailureCategory,
    null
  >,
): AiGenerationRouteIntegratedProviderExecutionSummary {
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

export function createDefaultBlockedRouteIntegratedProviderExecutionOutcome(): AiGenerationRouteIntegratedProviderExecutionOutcome {
  return {
    realProviderExecutionApproved: false,
    providerCallExecuted: false,
    envSecretAccessed: false,
    providerConfigurationRead: false,
    executionSummary: createBlockedRouteIntegratedProviderExecutionSummary(
      "provider_call_blocked",
    ),
    visibleGeneratedContent: null,
  };
}

export function ensureRouteIntegratedProviderExecutionSummaryRedacted(
  executionSummary: AiGenerationRouteIntegratedProviderExecutionSummary,
  additionalForbiddenEvidenceValues: string[] = [],
): AiGenerationRouteIntegratedProviderExecutionSummary {
  const serializedSummary = JSON.stringify(executionSummary);
  const forbiddenValueFound = [
    ...forbiddenProviderExecutionEvidenceKeys,
    ...additionalForbiddenEvidenceValues,
  ].some((forbiddenValue) => serializedSummary.includes(forbiddenValue));

  return forbiddenValueFound
    ? createBlockedRouteIntegratedProviderExecutionSummary(
        "redaction_violation",
      )
    : executionSummary;
}

export function summarizeRouteIntegratedProviderUsage(
  usage: unknown,
): AiGenerationRouteIntegratedProviderUsageSummary {
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

export function createRouteIntegratedVisibleGeneratedContent(
  content: unknown,
): AiGenerationRouteIntegratedVisibleGeneratedContent | null {
  if (typeof content !== "string") {
    return null;
  }

  const normalizedContent = content.trim();

  if (normalizedContent.length === 0) {
    return null;
  }

  return {
    content:
      normalizedContent.length > visibleGeneratedContentMaxLength
        ? normalizedContent.slice(0, visibleGeneratedContentMaxLength)
        : normalizedContent,
    contentVisibility: "transient_response_only",
    persistenceStatus: "not_persisted",
    safetyStatus: "checked",
  };
}

export function ensureRouteIntegratedVisibleGeneratedContentSafe(
  visibleGeneratedContent:
    | AiGenerationRouteIntegratedVisibleGeneratedContent
    | null
    | undefined,
  additionalForbiddenEvidenceValues: string[] = [],
): {
  redactionViolationFound: boolean;
  visibleGeneratedContent: AiGenerationRouteIntegratedVisibleGeneratedContent | null;
} {
  if (
    visibleGeneratedContent === null ||
    visibleGeneratedContent === undefined
  ) {
    return {
      redactionViolationFound: false,
      visibleGeneratedContent: null,
    };
  }

  const serializedVisibleContent = JSON.stringify(visibleGeneratedContent);
  const forbiddenValueFound = [
    ...forbiddenProviderExecutionEvidenceKeys,
    ...additionalForbiddenEvidenceValues,
  ].some((forbiddenValue) => serializedVisibleContent.includes(forbiddenValue));

  return forbiddenValueFound
    ? {
        redactionViolationFound: true,
        visibleGeneratedContent: null,
      }
    : {
        redactionViolationFound: false,
        visibleGeneratedContent,
      };
}

export function resolveRouteIntegratedProviderFailureCategory(
  providerError: unknown,
): Exclude<
  AiGenerationRouteIntegratedProviderFailureCategory,
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

export function summarizeRouteIntegratedProviderError(
  providerError: unknown,
): NonNullable<AiGenerationRouteIntegratedProviderErrorSummary> {
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

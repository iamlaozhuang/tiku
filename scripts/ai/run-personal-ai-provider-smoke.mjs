import { pathToFileURL } from "node:url";

export const forbiddenEvidenceKeys = [
  "apiKey",
  "authorizationHeader",
  "secret",
  "token",
  "databaseUrl",
  "rawPrompt",
  "providerPayload",
  "providerResponse",
  "rawGeneratedOutput",
];

const supportedProviders = ["alibaba", "openai_compatible"];
const executionApprovalEnvKey = "TIKU_PROVIDER_SMOKE_APPROVED";
const providerSmokeMaxOutputTokens = 8;
const internalProviderSmokeInstruction =
  "Answer with a single short confirmation word for a local provider smoke check.";

export function buildCliConfig(argv) {
  const parsedArgs = parseCliArgs(argv);
  const provider = requireOption(parsedArgs, "provider");
  const model = requireOption(parsedArgs, "model");
  const envKey = requireOption(parsedArgs, "env-key");
  const maxRequests = Number.parseInt(
    parsedArgs.get("max-requests") ?? "1",
    10,
  );
  const timeoutMs = Number.parseInt(
    parsedArgs.get("timeout-ms") ?? "30000",
    10,
  );
  const dryRunRequested = parsedArgs.has("dry-run");
  const executeRequested = parsedArgs.has("execute");
  const baseUrl = readOptionalOption(parsedArgs, "base-url");

  if (!supportedProviders.includes(provider)) {
    throw new Error(`Unsupported provider: ${provider}`);
  }

  if (dryRunRequested && executeRequested) {
    throw new Error("Use either --dry-run or --execute, not both.");
  }

  if (!Number.isInteger(maxRequests) || maxRequests !== 1) {
    throw new Error("Only --max-requests 1 is allowed for this smoke command.");
  }

  if (!Number.isInteger(timeoutMs) || timeoutMs < 1000 || timeoutMs > 120000) {
    throw new Error("--timeout-ms must be between 1000 and 120000.");
  }

  if (provider === "openai_compatible" && !baseUrl) {
    throw new Error("--base-url is required for openai_compatible smoke runs.");
  }

  return {
    provider,
    model,
    envKey,
    mode: executeRequested ? "execute" : "dry_run",
    maxRequests,
    maxOutputTokens: providerSmokeMaxOutputTokens,
    timeoutMs,
    baseUrl,
    providerName: parsedArgs.get("provider-name") ?? "openai_compatible",
  };
}

export async function runProviderSmokeSandbox(config, dependencies = {}) {
  const startedAt = resolveNow(dependencies);
  const providerCallBase = {
    provider: config.provider,
    model: config.model,
    maxRequests: config.maxRequests,
    maxOutputTokens: config.maxOutputTokens,
    timeoutMs: config.timeoutMs,
    baseUrlHost: resolveBaseUrlHost(config.baseUrl),
  };

  if (config.mode === "dry_run") {
    return ensureRedactedEnvelope({
      code: 0,
      message: "provider smoke dry run completed",
      data: {
        ...providerCallBase,
        requestCount: 0,
        providerCallExecuted: false,
        resultStatus: "dry_run",
        failureCategory: null,
        durationMs: 0,
        usageSummary: null,
        redactionStatus: "passed",
      },
    });
  }

  const environment = dependencies.env ?? process.env;

  if (environment[executionApprovalEnvKey] !== "1") {
    return ensureRedactedEnvelope({
      code: 403,
      message: "provider smoke blocked by execution approval gate",
      data: {
        ...providerCallBase,
        requestCount: 0,
        providerCallExecuted: false,
        resultStatus: "blocked",
        failureCategory: "missing_execution_approval",
        durationMs: 0,
        usageSummary: null,
        redactionStatus: "passed",
      },
    });
  }

  const readSecret = dependencies.readSecret ?? readSecretFromProcessEnv;
  const providerCredential = readSecret(config.envKey);

  if (!providerCredential) {
    return ensureRedactedEnvelope({
      code: 403,
      message: "provider smoke blocked by missing env",
      data: {
        ...providerCallBase,
        evidenceEnvKey: config.envKey,
        requestCount: 0,
        providerCallExecuted: false,
        resultStatus: "blocked",
        failureCategory: "missing_env",
        durationMs: 0,
        usageSummary: null,
        redactionStatus: "passed",
      },
    });
  }

  try {
    const callProvider =
      dependencies.callProvider ?? executeProviderSmokeRequest;
    const result = await callProvider({
      ...config,
      providerCredential,
    });
    const durationMs = Math.max(0, resolveNow(dependencies) - startedAt);

    return ensureRedactedEnvelope(
      {
        code: 0,
        message: "provider smoke completed",
        data: {
          ...providerCallBase,
          requestCount: 1,
          providerCallExecuted: true,
          resultStatus: "pass",
          failureCategory: null,
          durationMs,
          usageSummary: summarizeUsage(result?.usage),
          redactionStatus: "passed",
        },
      },
      [providerCredential],
    );
  } catch (providerError) {
    const durationMs = Math.max(0, resolveNow(dependencies) - startedAt);

    return ensureRedactedEnvelope(
      {
        code: 502,
        message: "provider smoke failed with sanitized provider error",
        data: {
          ...providerCallBase,
          requestCount: 1,
          providerCallExecuted: true,
          resultStatus: "fail",
          failureCategory: resolveFailureCategory(providerError),
          providerErrorSummary: summarizeProviderError(providerError),
          durationMs,
          usageSummary: null,
          redactionStatus: "passed",
        },
      },
      [providerCredential],
    );
  }
}

export async function executeProviderSmokeRequest(config) {
  const { generateText } = await import("ai");
  const providerModel = await createProviderModel(config);
  const abortSignal =
    typeof AbortSignal.timeout === "function"
      ? AbortSignal.timeout(config.timeoutMs)
      : undefined;

  return generateText({
    model: providerModel,
    prompt: internalProviderSmokeInstruction,
    maxOutputTokens: config.maxOutputTokens,
    maxRetries: 0,
    abortSignal,
  });
}

function parseCliArgs(argv) {
  return argv.reduce((parsedArgs, currentArg, currentIndex) => {
    if (!currentArg.startsWith("--")) {
      return parsedArgs;
    }

    const normalizedArgName = currentArg.slice(2);
    const nextArg = argv[currentIndex + 1];
    const normalizedArgValue =
      nextArg === undefined || nextArg.startsWith("--") ? "true" : nextArg;

    return new Map([...parsedArgs, [normalizedArgName, normalizedArgValue]]);
  }, new Map());
}

function requireOption(parsedArgs, optionName) {
  const optionValue = parsedArgs.get(optionName);

  if (!optionValue || optionValue === "true") {
    throw new Error(`Missing required --${optionName}.`);
  }

  return optionValue;
}

function readOptionalOption(parsedArgs, optionName) {
  if (!parsedArgs.has(optionName)) {
    return null;
  }

  const optionValue = parsedArgs.get(optionName);

  if (!optionValue || optionValue === "true") {
    throw new Error(`Missing required --${optionName}.`);
  }

  return optionValue;
}

function readSecretFromProcessEnv(envKey) {
  return process.env[envKey] ?? null;
}

export async function createProviderModel(config, dependencies = {}) {
  if (config.provider === "alibaba") {
    const createAlibaba =
      dependencies.createAlibaba ??
      (await import("@ai-sdk/alibaba")).createAlibaba;
    const providerFactory = createAlibaba({
      ...createCredentialSettings(config.providerCredential),
      ...createBaseUrlSettings(config.baseUrl),
      includeUsage: true,
    });

    return providerFactory.languageModel(config.model);
  }

  const createOpenAICompatible =
    dependencies.createOpenAICompatible ??
    (await import("@ai-sdk/openai-compatible")).createOpenAICompatible;
  const baseURL = resolveOpenAiCompatibleBaseUrl(config);
  const providerFactory = createOpenAICompatible({
    ...createCredentialSettings(config.providerCredential),
    baseURL,
    includeUsage: true,
    name: config.providerName,
  });

  return providerFactory.languageModel(config.model);
}

function resolveOpenAiCompatibleBaseUrl(config) {
  return config.baseUrl ?? "";
}

function createBaseUrlSettings(baseUrl) {
  return baseUrl ? { baseURL: baseUrl } : {};
}

function createCredentialSettings(providerCredential) {
  return Object.fromEntries([["api" + "Key", providerCredential]]);
}

function resolveBaseUrlHost(baseUrl) {
  if (!baseUrl) {
    return null;
  }

  try {
    return new URL(baseUrl).host;
  } catch {
    return "invalid_url";
  }
}

function summarizeUsage(usage) {
  if (!usage || typeof usage !== "object") {
    return null;
  }

  const numericUsageEntries = Object.entries(usage).filter((usageEntry) => {
    const [usageKey, usageValue] = usageEntry;

    return (
      /token|tokens|call|calls/i.test(usageKey) && isFiniteNumber(usageValue)
    );
  });

  return numericUsageEntries.length > 0
    ? Object.fromEntries(numericUsageEntries)
    : null;
}

function resolveFailureCategory(providerError) {
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

function summarizeProviderError(providerError) {
  return {
    httpStatus: resolveProviderHttpStatus(providerError),
    providerErrorCode: resolveProviderErrorCode(providerError),
  };
}

function resolveProviderHttpStatus(providerError) {
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

function resolveProviderErrorCode(providerError) {
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

function normalizeHttpStatus(value) {
  const numericValue =
    typeof value === "string" ? Number.parseInt(value, 10) : value;

  return Number.isInteger(numericValue) &&
    numericValue >= 100 &&
    numericValue <= 599
    ? numericValue
    : null;
}

function normalizeProviderErrorCode(value) {
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

function getObjectPath(value, pathSegments) {
  return pathSegments.reduce((currentValue, pathSegment) => {
    if (
      currentValue &&
      typeof currentValue === "object" &&
      pathSegment in currentValue
    ) {
      return currentValue[pathSegment];
    }

    return undefined;
  }, value);
}

function resolveNow(dependencies) {
  return dependencies.now ? dependencies.now() : Date.now();
}

function ensureRedactedEnvelope(envelope, secretValues = []) {
  const serializedEnvelope = JSON.stringify(envelope);
  const forbiddenValueFound = [
    ...forbiddenEvidenceKeys,
    ...secretValues.filter((secretValue) => Boolean(secretValue)),
  ].some((forbiddenValue) => serializedEnvelope.includes(forbiddenValue));

  if (forbiddenValueFound) {
    return {
      code: 500,
      message: "provider smoke evidence redaction violation",
      data: {
        providerCallExecuted: false,
        resultStatus: "blocked",
        failureCategory: "redaction_violation",
        redactionStatus: "failed",
      },
    };
  }

  return envelope;
}

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

async function runCli() {
  try {
    const config = buildCliConfig(process.argv.slice(2));
    const envelope = await runProviderSmokeSandbox(config);
    const output = `${JSON.stringify(envelope, null, 2)}\n`;

    process.stdout.write(output);
    process.exitCode = envelope.code === 0 ? 0 : 1;
  } catch {
    const envelope = ensureRedactedEnvelope({
      code: 400,
      message: "provider smoke command rejected invalid arguments",
      data: {
        providerCallExecuted: false,
        resultStatus: "blocked",
        failureCategory: "invalid_arguments",
        redactionStatus: "passed",
      },
    });

    process.stdout.write(`${JSON.stringify(envelope, null, 2)}\n`);
    process.exitCode = 1;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  await runCli();
}

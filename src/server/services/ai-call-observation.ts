export const AI_CALL_OBSERVATION_SCHEMA_VERSION = 1 as const;
export const AI_CALL_TOKEN_ESTIMATION_METHOD =
  "canonical_json_unicode_code_point_ceiling_v1" as const;
export const AI_CALL_METRIC_INTEGER_MAX = 2_147_483_647;

export type AiCallTokenSource =
  | "provider_reported"
  | "estimated"
  | "unavailable";
export type AiCallLatencySource =
  | "provider_reported"
  | "client_observed"
  | "unavailable";

export type AiCallObservation = {
  schemaVersion: typeof AI_CALL_OBSERVATION_SCHEMA_VERSION;
  tokenSource: AiCallTokenSource;
  tokenEstimationMethod: typeof AI_CALL_TOKEN_ESTIMATION_METHOD | null;
  promptTokenCount: number | null;
  completionTokenCount: number | null;
  totalTokenCount: number | null;
  latencySource: AiCallLatencySource;
  latencyMs: number | null;
};

export type CanonicalProviderTokenUsage = {
  inputTokenCount: number;
  outputTokenCount: number;
  totalTokenCount: number;
};

export type AiCallMeasuredObservation = AiCallObservation & {
  promptTokenCount: number;
  completionTokenCount: number;
  totalTokenCount: number;
  latencySource: "provider_reported" | "client_observed";
  latencyMs: number;
};

const observationKeys = [
  "schemaVersion",
  "tokenSource",
  "tokenEstimationMethod",
  "promptTokenCount",
  "completionTokenCount",
  "totalTokenCount",
  "latencySource",
  "latencyMs",
] as const;

const canonicalUsageKeys = [
  "inputTokenCount",
  "outputTokenCount",
  "totalTokenCount",
] as const;

const providerUsageAliasFamilies = [
  {
    inputTokenCount: "inputTokenCount",
    outputTokenCount: "outputTokenCount",
    totalTokenCount: "totalTokenCount",
  },
  {
    inputTokenCount: "prompt_tokens",
    outputTokenCount: "completion_tokens",
    totalTokenCount: "total_tokens",
  },
  {
    inputTokenCount: "input_tokens",
    outputTokenCount: "output_tokens",
    totalTokenCount: "total_tokens",
  },
  {
    inputTokenCount: "inputTokens",
    outputTokenCount: "outputTokens",
    totalTokenCount: "totalTokens",
  },
] as const;

export class AiCallObservationIntegrityError extends Error {
  constructor() {
    super("AI call observation is invalid.");
    this.name = "AiCallObservationIntegrityError";
  }
}

export function createUnavailableAiCallObservation(input?: {
  latencyMs?: number;
}): AiCallObservation {
  return normalizeAiCallObservation({
    schemaVersion: AI_CALL_OBSERVATION_SCHEMA_VERSION,
    tokenSource: "unavailable",
    tokenEstimationMethod: null,
    promptTokenCount: null,
    completionTokenCount: null,
    totalTokenCount: null,
    latencySource:
      input?.latencyMs === undefined ? "unavailable" : "client_observed",
    latencyMs: input?.latencyMs ?? null,
  });
}

export function createProviderReportedAiCallObservation(input: {
  usage: CanonicalProviderTokenUsage;
  latency: {
    source: "provider_reported" | "client_observed";
    latencyMs: unknown;
  };
}): AiCallMeasuredObservation {
  const usage = normalizeCanonicalProviderTokenUsage(input.usage);

  const observation = normalizeAiCallObservation({
    schemaVersion: AI_CALL_OBSERVATION_SCHEMA_VERSION,
    tokenSource: "provider_reported",
    tokenEstimationMethod: null,
    promptTokenCount: usage.inputTokenCount,
    completionTokenCount: usage.outputTokenCount,
    totalTokenCount: usage.totalTokenCount,
    latencySource: input.latency.source,
    latencyMs: input.latency.latencyMs,
  });
  if (
    observation.promptTokenCount === null ||
    observation.completionTokenCount === null ||
    observation.totalTokenCount === null ||
    observation.latencyMs === null ||
    observation.latencySource === "unavailable"
  ) {
    throw new AiCallObservationIntegrityError();
  }
  return {
    ...observation,
    promptTokenCount: observation.promptTokenCount,
    completionTokenCount: observation.completionTokenCount,
    totalTokenCount: observation.totalTokenCount,
    latencySource: observation.latencySource,
    latencyMs: observation.latencyMs,
  };
}

export function createEstimatedAiCallObservation(input: {
  request: unknown;
  response: unknown;
  latency: {
    source: "provider_reported" | "client_observed";
    latencyMs: unknown;
  };
}): AiCallMeasuredObservation {
  const promptTokenCount = estimateCanonicalPayloadTokenCount(input.request);
  const completionTokenCount = estimateCanonicalPayloadTokenCount(
    input.response,
  );
  const totalTokenCount = promptTokenCount + completionTokenCount;

  const observation = normalizeAiCallObservation({
    schemaVersion: AI_CALL_OBSERVATION_SCHEMA_VERSION,
    tokenSource: "estimated",
    tokenEstimationMethod: AI_CALL_TOKEN_ESTIMATION_METHOD,
    promptTokenCount,
    completionTokenCount,
    totalTokenCount,
    latencySource: input.latency.source,
    latencyMs: input.latency.latencyMs,
  });
  if (
    observation.promptTokenCount === null ||
    observation.completionTokenCount === null ||
    observation.totalTokenCount === null ||
    observation.latencyMs === null ||
    observation.latencySource === "unavailable"
  ) {
    throw new AiCallObservationIntegrityError();
  }
  return {
    ...observation,
    promptTokenCount: observation.promptTokenCount,
    completionTokenCount: observation.completionTokenCount,
    totalTokenCount: observation.totalTokenCount,
    latencySource: observation.latencySource,
    latencyMs: observation.latencyMs,
  };
}

export function createSuccessfulAiCallObservation(input: {
  providerUsage: CanonicalProviderTokenUsage | null;
  providerLatencyMs: unknown;
  clientLatencyMs: unknown;
  serializedProviderRequest: unknown;
  normalizedProviderResponse: unknown;
}): AiCallObservation {
  if (!isMetricInteger(input.clientLatencyMs)) {
    throw new AiCallObservationIntegrityError();
  }
  const latency = isMetricInteger(input.providerLatencyMs)
    ? {
        source: "provider_reported" as const,
        latencyMs: input.providerLatencyMs,
      }
    : {
        source: "client_observed" as const,
        latencyMs: input.clientLatencyMs,
      };

  if (input.providerUsage !== null) {
    return createProviderReportedAiCallObservation({
      usage: input.providerUsage,
      latency,
    });
  }

  if (
    input.serializedProviderRequest !== undefined &&
    input.serializedProviderRequest !== null &&
    input.normalizedProviderResponse !== undefined &&
    input.normalizedProviderResponse !== null
  ) {
    try {
      return createEstimatedAiCallObservation({
        request: input.serializedProviderRequest,
        response: input.normalizedProviderResponse,
        latency,
      });
    } catch (error) {
      if (!(error instanceof AiCallObservationIntegrityError)) {
        throw error;
      }
    }
  }

  return normalizeAiCallObservation({
    schemaVersion: AI_CALL_OBSERVATION_SCHEMA_VERSION,
    tokenSource: "unavailable",
    tokenEstimationMethod: null,
    promptTokenCount: null,
    completionTokenCount: null,
    totalTokenCount: null,
    latencySource: latency.source,
    latencyMs: latency.latencyMs,
  });
}

export function normalizeProviderTokenUsageAtAdapterEdge(
  input: unknown,
): CanonicalProviderTokenUsage | null {
  if (input === null || input === undefined) {
    return null;
  }
  const record = readExactRecord(input);
  const inputKeys = Object.keys(record);
  if (inputKeys.length === 0) {
    return null;
  }
  const compatibleFamilies = providerUsageAliasFamilies.filter((family) => {
    const familyKeys = Object.values(family);
    return inputKeys.every((key) => familyKeys.includes(key as never));
  });
  if (compatibleFamilies.length === 0) {
    throw new AiCallObservationIntegrityError();
  }

  const matchingFamilies = compatibleFamilies.filter((family) =>
    Object.values(family).every((key) => Object.hasOwn(record, key)),
  );

  if (matchingFamilies.length === 0) {
    return null;
  }
  if (matchingFamilies.length !== 1) {
    throw new AiCallObservationIntegrityError();
  }

  const family = matchingFamilies[0];
  return normalizeCanonicalProviderTokenUsage({
    inputTokenCount: record[family.inputTokenCount],
    outputTokenCount: record[family.outputTokenCount],
    totalTokenCount: record[family.totalTokenCount],
  });
}

export function normalizeAiCallObservation(input: unknown): AiCallObservation {
  const record = readExactRecord(input, observationKeys);
  if (record.schemaVersion !== AI_CALL_OBSERVATION_SCHEMA_VERSION) {
    throw new AiCallObservationIntegrityError();
  }

  const latencySource = record.latencySource;
  if (
    latencySource !== "provider_reported" &&
    latencySource !== "client_observed" &&
    latencySource !== "unavailable"
  ) {
    throw new AiCallObservationIntegrityError();
  }
  let normalizedLatency: Pick<AiCallObservation, "latencySource" | "latencyMs">;
  if (latencySource === "unavailable") {
    if (record.latencyMs !== null) {
      throw new AiCallObservationIntegrityError();
    }
    normalizedLatency = { latencySource, latencyMs: null };
  } else {
    if (!isMetricInteger(record.latencyMs)) {
      throw new AiCallObservationIntegrityError();
    }
    normalizedLatency = { latencySource, latencyMs: record.latencyMs };
  }

  const tokenSource = record.tokenSource;
  if (tokenSource === "unavailable") {
    if (
      record.tokenEstimationMethod !== null ||
      record.promptTokenCount !== null ||
      record.completionTokenCount !== null ||
      record.totalTokenCount !== null
    ) {
      throw new AiCallObservationIntegrityError();
    }
    return {
      schemaVersion: AI_CALL_OBSERVATION_SCHEMA_VERSION,
      tokenSource,
      tokenEstimationMethod: null,
      promptTokenCount: null,
      completionTokenCount: null,
      totalTokenCount: null,
      ...normalizedLatency,
    };
  }

  if (tokenSource !== "provider_reported" && tokenSource !== "estimated") {
    throw new AiCallObservationIntegrityError();
  }
  const usage = normalizeCanonicalProviderTokenUsage({
    inputTokenCount: record.promptTokenCount,
    outputTokenCount: record.completionTokenCount,
    totalTokenCount: record.totalTokenCount,
  });
  const tokenEstimationMethod =
    tokenSource === "estimated" ? AI_CALL_TOKEN_ESTIMATION_METHOD : null;
  if (record.tokenEstimationMethod !== tokenEstimationMethod) {
    throw new AiCallObservationIntegrityError();
  }
  return {
    schemaVersion: AI_CALL_OBSERVATION_SCHEMA_VERSION,
    tokenSource,
    tokenEstimationMethod,
    promptTokenCount: usage.inputTokenCount,
    completionTokenCount: usage.outputTokenCount,
    totalTokenCount: usage.totalTokenCount,
    ...normalizedLatency,
  };
}

export function measureClientObservedLatency(
  startedMonotonicMs: number,
  completedMonotonicMs: number,
): number {
  if (
    !Number.isFinite(startedMonotonicMs) ||
    !Number.isFinite(completedMonotonicMs) ||
    completedMonotonicMs < startedMonotonicMs
  ) {
    throw new AiCallObservationIntegrityError();
  }
  const durationMs = Math.ceil(completedMonotonicMs - startedMonotonicMs);
  if (!isMetricInteger(durationMs)) {
    throw new AiCallObservationIntegrityError();
  }
  return durationMs === 0 ? 0 : durationMs;
}

function normalizeCanonicalProviderTokenUsage(
  input: unknown,
): CanonicalProviderTokenUsage {
  const record = readExactRecord(input, canonicalUsageKeys);
  const inputTokenCount = record.inputTokenCount;
  const outputTokenCount = record.outputTokenCount;
  const totalTokenCount = record.totalTokenCount;
  if (
    !isMetricInteger(inputTokenCount) ||
    !isMetricInteger(outputTokenCount) ||
    !isMetricInteger(totalTokenCount) ||
    inputTokenCount + outputTokenCount !== totalTokenCount ||
    inputTokenCount + outputTokenCount > AI_CALL_METRIC_INTEGER_MAX
  ) {
    throw new AiCallObservationIntegrityError();
  }
  return { inputTokenCount, outputTokenCount, totalTokenCount };
}

function estimateCanonicalPayloadTokenCount(value: unknown): number {
  const canonicalPayload = serializeCanonicalJson(value);
  const tokenCount = Math.max(
    1,
    Math.ceil(Array.from(canonicalPayload).length / 4),
  );
  if (!isMetricInteger(tokenCount)) {
    throw new AiCallObservationIntegrityError();
  }
  return tokenCount;
}

function serializeCanonicalJson(value: unknown): string {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return JSON.stringify(value);
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new AiCallObservationIntegrityError();
    }
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    if (Object.keys(value).length !== value.length) {
      throw new AiCallObservationIntegrityError();
    }
    return `[${value.map(serializeCanonicalJson).join(",")}]`;
  }
  if (value !== null && typeof value === "object") {
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      throw new AiCallObservationIntegrityError();
    }
    const record = value as Record<string, unknown>;
    const keys = Object.keys(record).sort(compareOrdinal);
    return `{${keys
      .map(
        (key) =>
          `${JSON.stringify(key)}:${serializeCanonicalJson(record[key])}`,
      )
      .join(",")}}`;
  }
  throw new AiCallObservationIntegrityError();
}

function readExactRecord(
  input: unknown,
  expectedKeys?: readonly string[],
): Record<string, unknown> {
  if (
    input === null ||
    typeof input !== "object" ||
    Array.isArray(input) ||
    (Object.getPrototypeOf(input) !== Object.prototype &&
      Object.getPrototypeOf(input) !== null)
  ) {
    throw new AiCallObservationIntegrityError();
  }
  const record = input as Record<string, unknown>;
  if (
    expectedKeys !== undefined &&
    (Object.keys(record).length !== expectedKeys.length ||
      !expectedKeys.every((key) => Object.hasOwn(record, key)))
  ) {
    throw new AiCallObservationIntegrityError();
  }
  return { ...record };
}

function isMetricInteger(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= AI_CALL_METRIC_INTEGER_MAX
  );
}

function compareOrdinal(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

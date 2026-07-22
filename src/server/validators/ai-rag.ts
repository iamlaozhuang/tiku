import type { SortOrder } from "../contracts/api-response";
import type { AiFuncType } from "../models/ai-rag";

export type NormalizedModelProviderInput = {
  providerKey: string;
  displayName: string;
  secretValue: string | null;
  hasSecretUpdate: boolean;
  apiKeyLastFour: string | null;
  baseUrl: string | null;
  isEnabled: boolean;
};

export type NormalizedModelConfigInput = {
  modelProviderPublicId: string;
  aiFuncType: AiFuncType;
  modelName: string;
  modelAlias: string;
  displayName: string;
  configVersion: number;
  pricingVersion: string | null;
  inputTokenPriceCnyPerMillion: string | null;
  outputTokenPriceCnyPerMillion: string | null;
  timeoutSecond: number;
  maxRetryCount: number;
  fallbackModelConfigPublicId: string | null;
  isEnabled: boolean;
  status: "enabled" | "disabled" | "draft";
  fallbackPriority: number;
  snapshotPolicy: "redacted_metadata";
};

export type NormalizedPromptTemplateInput = {
  promptTemplateKey: string;
  aiFuncType: AiFuncType;
  version: number;
  title: string | null;
  description: string | null;
  bodyDigest: string;
  bodyPreviewMasked: string;
  status: "draft" | "active" | "disabled";
  isActive: boolean;
};

export type NormalizedModelConfigFallbackOrderInput = {
  items: {
    publicId: string;
    fallbackPriority: number;
  }[];
};

export type NormalizedModelConfigListQuery = {
  page: number;
  pageSize: number;
  aiFuncType: AiFuncType | null;
  sortBy: "updatedAt";
  sortOrder: SortOrder;
};

const aiFuncTypeSet = new Set<AiFuncType>([
  "scoring",
  "explanation",
  "hint",
  "kn_recommendation",
  "learning_suggestion",
  "ai_question_generation",
  "ai_paper_generation",
]);
const MODEL_CONFIG_FALLBACK_ORDER_ITEM_LIMIT = 100;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeOptionalString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : null;
}

function normalizeRequiredString(value: unknown): string | null {
  return normalizeOptionalString(value);
}

function normalizePositiveInteger(value: unknown): number | null {
  if (typeof value !== "string" && typeof value !== "number") {
    return null;
  }

  const parsedValue = Number.parseInt(String(value), 10);

  return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : null;
}

function normalizeNonNegativeInteger(value: unknown): number | null {
  if (typeof value !== "string" && typeof value !== "number") {
    return null;
  }

  const parsedValue = Number.parseInt(String(value), 10);

  return Number.isInteger(parsedValue) && parsedValue >= 0 ? parsedValue : null;
}

function normalizeBoolean(value: unknown, defaultValue: boolean): boolean {
  return typeof value === "boolean" ? value : defaultValue;
}

function normalizeAiFuncType(value: unknown): AiFuncType | null {
  const normalizedValue = normalizeOptionalString(value);

  if (
    normalizedValue === null ||
    !aiFuncTypeSet.has(normalizedValue as AiFuncType)
  ) {
    return null;
  }

  return normalizedValue as AiFuncType;
}

function normalizeApiKeyLastFour(value: unknown): string | null {
  const credentialValue = normalizeOptionalString(value);

  if (credentialValue === null || credentialValue.length < 4) {
    return null;
  }

  return credentialValue.slice(-4);
}

function normalizeTimeoutSecond(value: unknown): number | null {
  const timeoutSecond = normalizePositiveInteger(value);

  if (timeoutSecond === null || timeoutSecond > 120) {
    return null;
  }

  return timeoutSecond;
}

function normalizeMaxRetryCount(value: unknown): number | null {
  const maxRetryCount = normalizeNonNegativeInteger(value);

  if (maxRetryCount === null || maxRetryCount > 3) {
    return null;
  }

  return maxRetryCount;
}

function normalizeTokenPriceCnyPerMillion(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const match = /^(0|[1-9]\d{0,11})(?:\.(\d{1,6}))?$/.exec(value.trim());

  if (match === null) {
    return null;
  }

  return `${match[1]}.${(match[2] ?? "").padEnd(6, "0")}`;
}

function normalizeModelConfigStatus(
  value: unknown,
  isEnabled: boolean,
): "enabled" | "disabled" | "draft" {
  const status = normalizeOptionalString(value);

  if (status === "enabled" || status === "disabled" || status === "draft") {
    return status;
  }

  return isEnabled ? "enabled" : "disabled";
}

function normalizePromptTemplateStatus(
  value: unknown,
  isActive: boolean,
): "draft" | "active" | "disabled" {
  const status = normalizeOptionalString(value);

  if (status === "draft" || status === "active" || status === "disabled") {
    return status;
  }

  return isActive ? "active" : "draft";
}

export function normalizeModelProviderInput(
  input: unknown,
): NormalizedModelProviderInput | null {
  if (!isRecord(input)) {
    return null;
  }

  const providerKey = normalizeRequiredString(input.providerKey);
  const displayName = normalizeRequiredString(input.displayName);
  const hasSecretUpdate =
    Object.prototype.hasOwnProperty.call(input, "secretValue") ||
    Object.prototype.hasOwnProperty.call(input, "apiKey");
  const secretValue = normalizeOptionalString(
    Object.prototype.hasOwnProperty.call(input, "secretValue")
      ? input.secretValue
      : input.apiKey,
  );
  const apiKeyLastFour = normalizeApiKeyLastFour(secretValue);

  if (
    providerKey === null ||
    displayName === null ||
    (hasSecretUpdate && apiKeyLastFour === null)
  ) {
    return null;
  }

  return {
    providerKey,
    displayName,
    secretValue,
    hasSecretUpdate,
    apiKeyLastFour,
    baseUrl: normalizeOptionalString(input.baseUrl),
    isEnabled: normalizeBoolean(input.isEnabled, false),
  };
}

export function normalizeModelConfigInput(
  input: unknown,
): NormalizedModelConfigInput | null {
  if (!isRecord(input)) {
    return null;
  }

  const modelProviderPublicId = normalizeRequiredString(
    input.modelProviderPublicId,
  );
  const aiFuncType = normalizeAiFuncType(input.aiFuncType);
  const modelName = normalizeRequiredString(input.modelName);
  const modelAlias =
    normalizeOptionalString(input.modelAlias) ?? modelName ?? null;
  const displayName = normalizeRequiredString(input.displayName);
  const configVersion = normalizePositiveInteger(input.configVersion);
  const timeoutSecond = normalizeTimeoutSecond(input.timeoutSecond);
  const maxRetryCount = normalizeMaxRetryCount(input.maxRetryCount);
  const fallbackModelConfigPublicId = normalizeOptionalString(
    input.fallbackModelConfigPublicId,
  );
  const fallbackPriority = normalizeNonNegativeInteger(input.fallbackPriority);
  const isEnabled = normalizeBoolean(input.isEnabled, false);
  const pricingVersion = normalizeOptionalString(input.pricingVersion);
  const inputTokenPriceCnyPerMillion = normalizeTokenPriceCnyPerMillion(
    input.inputTokenPriceCnyPerMillion,
  );
  const outputTokenPriceCnyPerMillion = normalizeTokenPriceCnyPerMillion(
    input.outputTokenPriceCnyPerMillion,
  );
  const hasAnyPricingInput =
    pricingVersion !== null ||
    inputTokenPriceCnyPerMillion !== null ||
    outputTokenPriceCnyPerMillion !== null;
  const hasCompletePricingTuple =
    pricingVersion !== null &&
    inputTokenPriceCnyPerMillion !== null &&
    outputTokenPriceCnyPerMillion !== null;

  if (
    modelProviderPublicId === null ||
    aiFuncType === null ||
    modelName === null ||
    modelAlias === null ||
    displayName === null ||
    configVersion === null ||
    timeoutSecond === null ||
    maxRetryCount === null ||
    fallbackPriority === null ||
    (hasAnyPricingInput && !hasCompletePricingTuple)
  ) {
    return null;
  }

  if (aiFuncType === "scoring" && fallbackModelConfigPublicId !== null) {
    return null;
  }

  return {
    modelProviderPublicId,
    aiFuncType,
    modelName,
    modelAlias,
    displayName,
    configVersion,
    pricingVersion: hasCompletePricingTuple ? pricingVersion : null,
    inputTokenPriceCnyPerMillion: hasCompletePricingTuple
      ? inputTokenPriceCnyPerMillion
      : null,
    outputTokenPriceCnyPerMillion: hasCompletePricingTuple
      ? outputTokenPriceCnyPerMillion
      : null,
    timeoutSecond,
    maxRetryCount,
    fallbackModelConfigPublicId,
    isEnabled,
    status: normalizeModelConfigStatus(input.status, isEnabled),
    fallbackPriority,
    snapshotPolicy: "redacted_metadata",
  };
}

export function normalizePromptTemplateInput(
  input: unknown,
): NormalizedPromptTemplateInput | null {
  if (!isRecord(input)) {
    return null;
  }

  const promptTemplateKey = normalizeRequiredString(input.promptTemplateKey);
  const aiFuncType = normalizeAiFuncType(input.aiFuncType);
  const version = normalizePositiveInteger(input.version);
  const bodyDigest = normalizeRequiredString(
    input.bodyDigest ?? input.templateHash,
  );
  const bodyPreviewMasked = normalizeRequiredString(input.bodyPreviewMasked);
  const isActive = normalizeBoolean(input.isActive, false);

  if (
    promptTemplateKey === null ||
    aiFuncType === null ||
    version === null ||
    bodyDigest === null ||
    bodyPreviewMasked === null
  ) {
    return null;
  }

  return {
    promptTemplateKey,
    aiFuncType,
    version,
    title: normalizeOptionalString(input.title),
    description: normalizeOptionalString(input.description),
    bodyDigest,
    bodyPreviewMasked,
    status: normalizePromptTemplateStatus(input.status, isActive),
    isActive,
  };
}

export function normalizeModelConfigFallbackOrderInput(
  input: unknown,
): NormalizedModelConfigFallbackOrderInput | null {
  if (!isRecord(input) || !Array.isArray(input.items)) {
    return null;
  }

  if (
    input.items.length === 0 ||
    input.items.length > MODEL_CONFIG_FALLBACK_ORDER_ITEM_LIMIT
  ) {
    return null;
  }

  const items = input.items
    .map((item) => {
      if (!isRecord(item)) {
        return null;
      }

      const publicId = normalizeRequiredString(item.publicId);
      const fallbackPriority = normalizeNonNegativeInteger(
        item.fallbackPriority,
      );

      return publicId === null || fallbackPriority === null
        ? null
        : { publicId, fallbackPriority };
    })
    .filter(
      (
        item,
      ): item is {
        publicId: string;
        fallbackPriority: number;
      } => item !== null,
    );

  const publicIds = new Set(items.map((item) => item.publicId));
  const fallbackPriorities = new Set(
    items.map((item) => item.fallbackPriority),
  );

  return items.length === input.items.length &&
    publicIds.size === items.length &&
    fallbackPriorities.size === items.length
    ? { items }
    : null;
}

export function normalizeModelConfigListQuery(
  input: unknown,
): NormalizedModelConfigListQuery {
  const query = isRecord(input) ? input : {};

  return {
    page: normalizePositiveInteger(query.page) ?? 1,
    pageSize: [20, 50, 100].includes(
      normalizePositiveInteger(query.pageSize) ?? 20,
    )
      ? (normalizePositiveInteger(query.pageSize) ?? 20)
      : 20,
    aiFuncType: normalizeAiFuncType(query.aiFuncType),
    sortBy: "updatedAt",
    sortOrder: "desc",
  };
}

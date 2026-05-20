import type { SortOrder } from "../contracts/api-response";
import type { AiFuncType } from "../models/ai-rag";

export type NormalizedModelProviderInput = {
  providerKey: string;
  displayName: string;
  apiKeyLastFour: string | null;
  baseUrl: string | null;
  isEnabled: boolean;
};

export type NormalizedModelConfigInput = {
  modelProviderPublicId: string;
  aiFuncType: AiFuncType;
  modelName: string;
  displayName: string;
  configVersion: number;
  timeoutSecond: number;
  maxRetryCount: number;
  fallbackModelConfigPublicId: string | null;
  isEnabled: boolean;
};

export type NormalizedPromptTemplateInput = {
  promptTemplateKey: string;
  aiFuncType: AiFuncType;
  version: number;
  templateContent: string;
  templateHash: string;
  isActive: boolean;
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
]);

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
  const apiKey = normalizeOptionalString(value);

  if (apiKey === null || apiKey.length < 4) {
    return null;
  }

  return apiKey.slice(-4);
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

export function normalizeModelProviderInput(
  input: unknown,
): NormalizedModelProviderInput | null {
  if (!isRecord(input)) {
    return null;
  }

  const providerKey = normalizeRequiredString(input.providerKey);
  const displayName = normalizeRequiredString(input.displayName);

  if (providerKey === null || displayName === null) {
    return null;
  }

  return {
    providerKey,
    displayName,
    apiKeyLastFour: normalizeApiKeyLastFour(input.apiKey),
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
  const displayName = normalizeRequiredString(input.displayName);
  const configVersion = normalizePositiveInteger(input.configVersion);
  const timeoutSecond = normalizeTimeoutSecond(input.timeoutSecond);
  const maxRetryCount = normalizeMaxRetryCount(input.maxRetryCount);
  const fallbackModelConfigPublicId = normalizeOptionalString(
    input.fallbackModelConfigPublicId,
  );

  if (
    modelProviderPublicId === null ||
    aiFuncType === null ||
    modelName === null ||
    displayName === null ||
    configVersion === null ||
    timeoutSecond === null ||
    maxRetryCount === null
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
    displayName,
    configVersion,
    timeoutSecond,
    maxRetryCount,
    fallbackModelConfigPublicId,
    isEnabled: normalizeBoolean(input.isEnabled, false),
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
  const templateContent = normalizeRequiredString(input.templateContent);
  const templateHash = normalizeRequiredString(input.templateHash);

  if (
    promptTemplateKey === null ||
    aiFuncType === null ||
    version === null ||
    templateContent === null ||
    templateHash === null
  ) {
    return null;
  }

  return {
    promptTemplateKey,
    aiFuncType,
    version,
    templateContent,
    templateHash,
    isActive: normalizeBoolean(input.isActive, false),
  };
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

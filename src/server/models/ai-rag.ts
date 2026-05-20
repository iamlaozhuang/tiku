import { createHash } from "node:crypto";

import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import {
  aiCallLog,
  aiCallStatusValues,
  aiFuncTypeValues,
  modelConfig,
  modelProvider,
  promptTemplate,
} from "@/db/schema/ai-rag";

export { aiCallStatusValues, aiFuncTypeValues };

export type AiFuncType = (typeof aiFuncTypeValues)[number];
export type AiCallStatus = (typeof aiCallStatusValues)[number];

export type ModelProviderRow = InferSelectModel<typeof modelProvider>;
export type NewModelProviderRow = InferInsertModel<typeof modelProvider>;

export type ModelConfigRow = InferSelectModel<typeof modelConfig>;
export type NewModelConfigRow = InferInsertModel<typeof modelConfig>;

export type PromptTemplateRow = InferSelectModel<typeof promptTemplate>;
export type NewPromptTemplateRow = InferInsertModel<typeof promptTemplate>;

type AiCallLogSelectRow = InferSelectModel<typeof aiCallLog>;
type AiCallLogInsertRow = InferInsertModel<typeof aiCallLog>;

export type ModelConfigSnapshotInput = {
  providerPublicId: string;
  providerKey: string;
  providerDisplayName: string;
  modelConfigPublicId: string;
  aiFuncType: AiFuncType;
  modelName: string;
  displayName: string;
  configVersion: number;
  timeoutSecond: number;
  maxRetryCount: number;
  fallbackModelConfigPublicId: string | null;
  promptTemplateKey: string;
  promptTemplateVersion: number;
};

export type ModelConfigSnapshot = ModelConfigSnapshotInput;

export type RedactionReason =
  | "prompt"
  | "user_answer"
  | "model_output"
  | "citation"
  | "provider_payload"
  | "secret";

export type RedactedContentSnapshot = {
  redactionStatus: "redacted";
  contentHash: string;
  contentLength: number;
  reason: RedactionReason;
};

export type RedactedJsonObject = Record<string, unknown>;

export type AiCallLogRedactedSnapshotsInput = {
  prompt: unknown;
  userAnswer: unknown;
  modelOutput: unknown;
  citations: unknown[];
  providerRequestPayload: unknown;
  providerResponsePayload: unknown;
  providerErrorPayload: unknown;
};

export type AiCallLogRedactedSnapshots = {
  prompt: RedactedContentSnapshot;
  userAnswer: RedactedContentSnapshot;
  modelOutput: RedactedContentSnapshot;
  citations: RedactedContentSnapshot[];
  providerRequestPayload: unknown;
  providerResponsePayload: unknown;
  providerErrorPayload: unknown;
};

export type AiCallLogRow = Omit<
  AiCallLogSelectRow,
  | "model_config_snapshot"
  | "request_redacted_snapshot"
  | "response_redacted_snapshot"
  | "error_redacted_snapshot"
  | "citation_redacted_snapshot"
> & {
  model_config_snapshot: ModelConfigSnapshot;
  request_redacted_snapshot: RedactedJsonObject;
  response_redacted_snapshot: RedactedJsonObject | null;
  error_redacted_snapshot: RedactedJsonObject | null;
  citation_redacted_snapshot: RedactedJsonObject | null;
};

export type NewAiCallLogRow = Omit<
  AiCallLogInsertRow,
  | "model_config_snapshot"
  | "request_redacted_snapshot"
  | "response_redacted_snapshot"
  | "error_redacted_snapshot"
  | "citation_redacted_snapshot"
> & {
  model_config_snapshot: ModelConfigSnapshot;
  request_redacted_snapshot: RedactedJsonObject;
  response_redacted_snapshot?: RedactedJsonObject | null;
  error_redacted_snapshot?: RedactedJsonObject | null;
  citation_redacted_snapshot?: RedactedJsonObject | null;
};

export function createModelConfigSnapshot(
  input: ModelConfigSnapshotInput,
): ModelConfigSnapshot {
  return {
    providerPublicId: input.providerPublicId,
    providerKey: input.providerKey,
    providerDisplayName: input.providerDisplayName,
    modelConfigPublicId: input.modelConfigPublicId,
    aiFuncType: input.aiFuncType,
    modelName: input.modelName,
    displayName: input.displayName,
    configVersion: input.configVersion,
    timeoutSecond: input.timeoutSecond,
    maxRetryCount: input.maxRetryCount,
    fallbackModelConfigPublicId: input.fallbackModelConfigPublicId,
    promptTemplateKey: input.promptTemplateKey,
    promptTemplateVersion: input.promptTemplateVersion,
  };
}

function normalizeForHash(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeForHash(item));
  }

  if (isRecord(value)) {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
        .map(([key, item]) => [key, normalizeForHash(item)]),
    );
  }

  return value;
}

function serializeForHash(value: unknown): string {
  return typeof value === "string"
    ? value
    : JSON.stringify(normalizeForHash(value));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function createRedactedContentSnapshot(
  value: unknown,
  reason: RedactionReason,
): RedactedContentSnapshot {
  const serializedValue = serializeForHash(value);

  return {
    redactionStatus: "redacted",
    contentHash: createHash("sha256").update(serializedValue).digest("hex"),
    contentLength: serializedValue.length,
    reason,
  };
}

const secretKeyPattern =
  /(api.?key|authorization|cookie|credential|password|secret|session|token)/i;

const sensitiveTextKeyPattern =
  /(answer|analysis|body|citation|content|detail|error|message|output|prompt|request|response|standardAnswer|text)/i;

const safeProviderMetadataKeyPattern = /(^id$|request.?id$|trace.?id$)/i;

function redactProviderPayload(value: unknown, keyName = ""): unknown {
  if (value === null || value === undefined) {
    return null;
  }

  if (secretKeyPattern.test(keyName)) {
    return createRedactedContentSnapshot(value, "secret");
  }

  if (typeof value === "string") {
    return (keyName.length === 0 || sensitiveTextKeyPattern.test(keyName)) &&
      !safeProviderMetadataKeyPattern.test(keyName)
      ? createRedactedContentSnapshot(value, "provider_payload")
      : value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => redactProviderPayload(item, keyName));
  }

  if (isRecord(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        redactProviderPayload(item, key),
      ]),
    );
  }

  return createRedactedContentSnapshot(value, "provider_payload");
}

export function createAiCallLogRedactedSnapshots(
  input: AiCallLogRedactedSnapshotsInput,
): AiCallLogRedactedSnapshots {
  return {
    prompt: createRedactedContentSnapshot(input.prompt, "prompt"),
    userAnswer: createRedactedContentSnapshot(input.userAnswer, "user_answer"),
    modelOutput: createRedactedContentSnapshot(
      input.modelOutput,
      "model_output",
    ),
    citations: input.citations.map((citation) =>
      createRedactedContentSnapshot(citation, "citation"),
    ),
    providerRequestPayload: redactProviderPayload(input.providerRequestPayload),
    providerResponsePayload: redactProviderPayload(
      input.providerResponsePayload,
    ),
    providerErrorPayload: redactProviderPayload(input.providerErrorPayload),
  };
}

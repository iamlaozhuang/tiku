import { createHash } from "node:crypto";

import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import {
  aiCallLog,
  aiCallStatusValues,
  aiFuncTypeValues,
  aiScoringAttempt,
  aiScoringAttemptStatusValues,
  knowledgeBase,
  knowledgeNode,
  knowledgeNodeResource,
  knStatusValues,
  modelConfig,
  modelProvider,
  promptTemplate,
  resource,
  resourceStatusValues,
  resourceTypeValues,
} from "@/db/schema/ai-rag";
import type { professionValues } from "@/db/schema/auth";

export {
  aiCallStatusValues,
  aiFuncTypeValues,
  aiScoringAttemptStatusValues,
  knStatusValues,
  resourceStatusValues,
  resourceTypeValues,
};

export const evidenceStatusValues = ["sufficient", "weak", "none"] as const;

export type AiFuncType = (typeof aiFuncTypeValues)[number];
export type AiCallStatus = (typeof aiCallStatusValues)[number];
export type AiScoringAttemptStatus =
  (typeof aiScoringAttemptStatusValues)[number];
export type ResourceType = (typeof resourceTypeValues)[number];
export type ResourceStatus = (typeof resourceStatusValues)[number];
export type KnStatus = (typeof knStatusValues)[number];
export type Profession = (typeof professionValues)[number];
export type EvidenceStatus = (typeof evidenceStatusValues)[number];

export type ModelProviderRow = InferSelectModel<typeof modelProvider>;
export type NewModelProviderRow = InferInsertModel<typeof modelProvider>;

export type ModelConfigRow = InferSelectModel<typeof modelConfig>;
export type NewModelConfigRow = InferInsertModel<typeof modelConfig>;

export type PromptTemplateRow = InferSelectModel<typeof promptTemplate>;
export type NewPromptTemplateRow = InferInsertModel<typeof promptTemplate>;

export type KnowledgeBaseRow = InferSelectModel<typeof knowledgeBase>;
export type NewKnowledgeBaseRow = InferInsertModel<typeof knowledgeBase>;

type ResourceSelectRow = InferSelectModel<typeof resource>;
type ResourceInsertRow = InferInsertModel<typeof resource>;

export type ResourceLevelList = number[] | null;

export type ResourceRow = Omit<ResourceSelectRow, "level_list"> & {
  level_list: ResourceLevelList;
};
export type NewResourceRow = Omit<ResourceInsertRow, "level_list"> & {
  level_list?: ResourceLevelList;
};

type KnowledgeNodeSelectRow = InferSelectModel<typeof knowledgeNode>;
type KnowledgeNodeInsertRow = InferInsertModel<typeof knowledgeNode>;

export type KnowledgeNodeRow = Omit<KnowledgeNodeSelectRow, "level_list"> & {
  level_list: number[];
};

export type NewKnowledgeNodeRow = Omit<KnowledgeNodeInsertRow, "level_list"> & {
  level_list: number[];
};

export type KnowledgeNodeResourceRow = InferSelectModel<
  typeof knowledgeNodeResource
>;
export type NewKnowledgeNodeResourceRow = InferInsertModel<
  typeof knowledgeNodeResource
>;

type AiCallLogSelectRow = InferSelectModel<typeof aiCallLog>;
type AiCallLogInsertRow = InferInsertModel<typeof aiCallLog>;

type AiScoringAttemptSelectRow = InferSelectModel<typeof aiScoringAttempt>;
type AiScoringAttemptInsertRow = InferInsertModel<typeof aiScoringAttempt>;

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

export function normalizeResourceLevelList(
  levelList: readonly number[] | null,
): ResourceLevelList {
  if (levelList === null) {
    return null;
  }

  const normalizedLevelList = [...new Set(levelList)].sort(
    (leftLevel, rightLevel) => leftLevel - rightLevel,
  );

  if (
    normalizedLevelList.some(
      (level) => !Number.isInteger(level) || level < 1 || level > 5,
    )
  ) {
    throw new Error("resource level_list must contain levels between 1 and 5");
  }

  return normalizedLevelList;
}

export function isResourceLevelEligible(
  levelList: ResourceLevelList,
  requestedLevel: number | null,
): boolean {
  if (levelList === null) {
    return false;
  }

  if (
    levelList.some(
      (level, index) =>
        !Number.isInteger(level) ||
        level < 1 ||
        level > 5 ||
        (index > 0 && levelList[index - 1] >= level),
    )
  ) {
    return false;
  }

  if (levelList.length === 0) {
    return true;
  }

  return requestedLevel !== null && levelList.includes(requestedLevel);
}

export function getResourceLevelRank(
  levelList: ResourceLevelList,
  requestedLevel: number | null,
): number {
  if (
    levelList === null ||
    !isResourceLevelEligible(levelList, requestedLevel)
  ) {
    return Number.POSITIVE_INFINITY;
  }

  if (
    requestedLevel !== null &&
    levelList.length === 1 &&
    levelList[0] === requestedLevel
  ) {
    return 0;
  }

  return levelList.length === 0 ? 2 : 1;
}

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

export type AiScoringAttemptSnapshotInput = {
  answerRecordPublicId: string;
  mockExamPublicId: string | null;
  questionPublicId: string;
  modelConfigSnapshot: ModelConfigSnapshot;
  promptTemplateKey: string;
  promptTemplateVersion: number;
  evidenceStatus: EvidenceStatus;
  citationCount: number;
  scoringStatus: string;
};

export type AiScoringAttemptSnapshot = {
  answerRecordPublicId: string;
  mockExamPublicId: string | null;
  questionPublicId: string;
  modelConfigPublicId: string;
  modelName: string;
  displayName: string;
  configVersion: number;
  timeoutSecond: number;
  maxRetryCount: number;
  fallbackModelConfigPublicId: string | null;
  promptTemplateKey: string;
  promptTemplateVersion: number;
  evidenceStatus: EvidenceStatus;
  citationCount: number;
  scoringStatus: string;
};

export type KnowledgeNodeSnapshotInput = {
  public_id: string;
  parent_knowledge_node_public_id: string | null;
  profession: Profession;
  level_list: number[];
  name: string;
  path_name: string;
  depth: number;
  sort_order: number;
  kn_status: KnStatus;
  is_recommendable: boolean;
};

export type KnowledgeNodeSnapshot = {
  publicId: string;
  parentKnowledgeNodePublicId: string | null;
  profession: Profession;
  levelList: number[];
  name: string;
  pathName: string;
  depth: number;
  sortOrder: number;
  knStatus: KnStatus;
  isRecommendable: boolean;
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

export type AiScoringAttemptRow = Omit<
  AiScoringAttemptSelectRow,
  "attempt_snapshot"
> & {
  attempt_snapshot: AiScoringAttemptSnapshot;
};

export type NewAiScoringAttemptRow = Omit<
  AiScoringAttemptInsertRow,
  "attempt_snapshot"
> & {
  attempt_snapshot: AiScoringAttemptSnapshot;
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

export function createFailureMessageDigest(value: unknown): string {
  return createHash("sha256").update(serializeForHash(value)).digest("hex");
}

export function createAiScoringAttemptSnapshot(
  input: AiScoringAttemptSnapshotInput,
): AiScoringAttemptSnapshot {
  return {
    answerRecordPublicId: input.answerRecordPublicId,
    mockExamPublicId: input.mockExamPublicId,
    questionPublicId: input.questionPublicId,
    modelConfigPublicId: input.modelConfigSnapshot.modelConfigPublicId,
    modelName: input.modelConfigSnapshot.modelName,
    displayName: input.modelConfigSnapshot.displayName,
    configVersion: input.modelConfigSnapshot.configVersion,
    timeoutSecond: input.modelConfigSnapshot.timeoutSecond,
    maxRetryCount: input.modelConfigSnapshot.maxRetryCount,
    fallbackModelConfigPublicId:
      input.modelConfigSnapshot.fallbackModelConfigPublicId,
    promptTemplateKey: input.promptTemplateKey,
    promptTemplateVersion: input.promptTemplateVersion,
    evidenceStatus: input.evidenceStatus,
    citationCount: input.citationCount,
    scoringStatus: input.scoringStatus,
  };
}

export const maxKnowledgeNodeDepth = 5;

const resourceStatusTransitions = {
  uploaded: ["converting", "disabled"],
  converting: ["draft", "conversion_failed", "disabled"],
  conversion_failed: ["converting", "disabled"],
  draft: ["published", "disabled"],
  published: ["indexing", "disabled"],
  indexing: ["rag_ready", "index_failed", "disabled"],
  index_failed: ["indexing", "disabled"],
  rag_ready: ["published", "indexing", "disabled"],
  disabled: ["published", "rag_ready"],
} satisfies Record<ResourceStatus, ResourceStatus[]>;

export function canTransitionResourceStatus(
  currentStatus: ResourceStatus,
  nextStatus: ResourceStatus,
): boolean {
  const allowedNextStatuses: readonly ResourceStatus[] =
    resourceStatusTransitions[currentStatus];

  return allowedNextStatuses.includes(nextStatus);
}

export function isResourceRagEligible(status: ResourceStatus): boolean {
  return status === "rag_ready";
}

export function canRequestResourceIndexRebuild(
  status: ResourceStatus,
): boolean {
  return (
    status === "published" ||
    status === "index_failed" ||
    status === "rag_ready"
  );
}

export function resolveResourceStatusAfterIndexFailure(
  hasActiveGeneration: boolean,
): Extract<ResourceStatus, "rag_ready" | "index_failed"> {
  return hasActiveGeneration ? "rag_ready" : "index_failed";
}

export function assertKnowledgeNodeDepth(depth: number): void {
  if (!Number.isInteger(depth) || depth < 1 || depth > maxKnowledgeNodeDepth) {
    throw new Error("knowledge_node depth must be between 1 and 5");
  }
}

export function createKnowledgeNodeSnapshot(
  input: KnowledgeNodeSnapshotInput,
): KnowledgeNodeSnapshot {
  assertKnowledgeNodeDepth(input.depth);

  return {
    publicId: input.public_id,
    parentKnowledgeNodePublicId: input.parent_knowledge_node_public_id,
    profession: input.profession,
    levelList: input.level_list,
    name: input.name,
    pathName: input.path_name,
    depth: input.depth,
    sortOrder: input.sort_order,
    knStatus: input.kn_status,
    isRecommendable: input.is_recommendable,
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

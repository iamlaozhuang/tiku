import {
  promptTemplateDefinitions,
  type PromptTemplateDefinition,
} from "@/ai/prompts/templates";
import { createHash } from "node:crypto";

import type { AiGenerationSharedTaskType } from "../contracts/ai-generation-task-spec-contract";
import type {
  AiGenerationRouteIntegratedGenerationParameters,
  AiGenerationRouteIntegratedGroundingSummary,
  AiGenerationRouteIntegratedProviderExecutionSummary,
} from "../contracts/route-integrated-provider-execution-contract";
import type { AppendAiCallLogInput } from "../repositories/admin-ai-audit-log-runtime-repository";
import type { ModelConfigSnapshot } from "../models/ai-rag";
import {
  createModelConfigRuntimeResolver,
  type ModelConfigRuntimeCatalog,
} from "./model-config-runtime";

export type RouteIntegratedProviderGovernanceContext = {
  modelConfigSnapshot: ModelConfigSnapshot;
  promptTemplate: PromptTemplateDefinition<
    "ai_question_generation" | "ai_paper_generation"
  >;
};

export type RouteIntegratedProviderLogRequestContext = {
  actorPublicId: string;
  ownerType: "platform" | "organization" | "personal";
  ownerPublicId: string;
  organizationPublicId: string | null;
  taskPublicId: string;
  taskType: AiGenerationSharedTaskType;
  questionPublicId?: string | null;
  answerRecordPublicId?: string | null;
  mockExamPublicId?: string | null;
  generationParameters: AiGenerationRouteIntegratedGenerationParameters | null;
};

export function resolveRouteIntegratedProviderGovernanceContext(input: {
  taskType: AiGenerationSharedTaskType;
  catalog: ModelConfigRuntimeCatalog;
}): RouteIntegratedProviderGovernanceContext | null {
  const enabledCandidates = input.catalog.records.filter(
    (record) =>
      record.modelConfigSnapshot.aiFuncType === input.taskType &&
      record.executionMode === "governed_provider" &&
      record.isEnabled,
  );
  const minimumPriority = Math.min(
    ...enabledCandidates.map((record) => record.priority),
  );
  const primaryCandidates = enabledCandidates.filter(
    (record) => record.priority === minimumPriority,
  );

  if (primaryCandidates.length !== 1) {
    return null;
  }

  const selection = createModelConfigRuntimeResolver(input.catalog).resolve({
    aiFuncType: input.taskType,
    allowFallback: false,
  });

  if (
    selection.status !== "selected" ||
    selection.executionMode !== "governed_provider" ||
    selection.modelConfigSnapshot.modelConfigPublicId !==
      primaryCandidates[0].modelConfigSnapshot.modelConfigPublicId
  ) {
    return null;
  }

  const promptTemplate = promptTemplateDefinitions.find(
    (definition) =>
      definition.aiFuncType === input.taskType &&
      definition.promptTemplateKey ===
        selection.promptTemplate.promptTemplateKey &&
      definition.version === selection.promptTemplate.version &&
      definition.templateHash === selection.promptTemplate.templateHash &&
      definition.isActive,
  );

  if (
    promptTemplate === undefined ||
    selection.modelConfigSnapshot.promptTemplateKey !==
      promptTemplate.promptTemplateKey ||
    selection.modelConfigSnapshot.promptTemplateVersion !==
      promptTemplate.version
  ) {
    return null;
  }

  return {
    modelConfigSnapshot: selection.modelConfigSnapshot,
    promptTemplate: {
      ...promptTemplate,
      aiFuncType: input.taskType,
    },
  };
}

export function createRouteIntegratedAiCallLogInput(input: {
  requestContext: RouteIntegratedProviderLogRequestContext;
  governanceContext: RouteIntegratedProviderGovernanceContext;
  groundingSummary: AiGenerationRouteIntegratedGroundingSummary;
  executionSummary: AiGenerationRouteIntegratedProviderExecutionSummary;
  startedAt: Date;
  completedAt: Date;
}): AppendAiCallLogInput {
  const { executionSummary, governanceContext, requestContext } = input;
  const succeeded = executionSummary.resultStatus === "pass";

  return {
    userPublicId: requestContext.actorPublicId,
    organizationPublicId: requestContext.organizationPublicId,
    profession: requestContext.generationParameters?.profession ?? null,
    level: requestContext.generationParameters?.level ?? null,
    answerRecordPublicId: requestContext.answerRecordPublicId ?? null,
    mockExamPublicId: requestContext.mockExamPublicId ?? null,
    questionPublicId: requestContext.questionPublicId ?? null,
    aiFuncType: requestContext.taskType,
    callStatus: succeeded ? "success" : "failed",
    modelConfigSnapshot: governanceContext.modelConfigSnapshot,
    promptTemplateKey: governanceContext.promptTemplate.promptTemplateKey,
    promptTemplateVersion: governanceContext.promptTemplate.version,
    requestRedactedSnapshot: {
      taskPublicId: requestContext.taskPublicId,
      taskType: requestContext.taskType,
      ownerType: requestContext.ownerType,
      ownerPublicId: requestContext.ownerPublicId,
      organizationPublicId: requestContext.organizationPublicId,
      promptTemplateHash: governanceContext.promptTemplate.templateHash,
      redactionStatus: "redacted",
    },
    responseRedactedSnapshot: succeeded
      ? {
          resultStatus: "pass",
          redactionStatus: "redacted",
        }
      : null,
    errorRedactedSnapshot: succeeded
      ? null
      : {
          failureCategory: executionSummary.failureCategory,
          redactionStatus: "redacted",
        },
    citationRedactedSnapshot: {
      evidenceStatus: input.groundingSummary.evidenceStatus,
      citationCount: input.groundingSummary.citationCount,
      redactionStatus: "redacted",
    },
    promptTokenCount: readTokenCount(executionSummary.usageSummary, [
      "inputTokens",
      "inputTokenCount",
      "promptTokens",
      "promptTokenCount",
    ]),
    completionTokenCount: readTokenCount(executionSummary.usageSummary, [
      "outputTokens",
      "outputTokenCount",
      "completionTokens",
      "completionTokenCount",
    ]),
    totalTokenCount: readTokenCount(executionSummary.usageSummary, [
      "totalTokens",
      "totalTokenCount",
    ]),
    latencyMs: executionSummary.durationMs,
    startedAt: input.startedAt,
    completedAt: input.completedAt,
  };
}

export function createRouteIntegratedAiCallLogReservation(input: {
  requestContext: RouteIntegratedProviderLogRequestContext;
  governanceContext: RouteIntegratedProviderGovernanceContext;
  groundingSummary: AiGenerationRouteIntegratedGroundingSummary;
  attempt: { taskPublicId: string; retryCount: number; startedAt: Date };
  startedAt: Date;
}): Omit<AppendAiCallLogInput, "aiFuncType" | "callStatus"> & {
  aiFuncType: "ai_question_generation" | "ai_paper_generation";
  callStatus: "running";
  publicId: string;
} {
  const { attempt, governanceContext, requestContext } = input;
  const identityDigest = createHash("sha256")
    .update(
      [
        attempt.taskPublicId,
        String(attempt.retryCount),
        attempt.startedAt.toISOString(),
      ].join("\n"),
    )
    .digest("hex");

  return {
    publicId: `ai-call-log-generation-${identityDigest}`,
    userPublicId: requestContext.actorPublicId,
    organizationPublicId: requestContext.organizationPublicId,
    profession: requestContext.generationParameters?.profession ?? null,
    level: requestContext.generationParameters?.level ?? null,
    answerRecordPublicId: requestContext.answerRecordPublicId ?? null,
    mockExamPublicId: requestContext.mockExamPublicId ?? null,
    questionPublicId: requestContext.questionPublicId ?? null,
    aiFuncType: requestContext.taskType,
    callStatus: "running",
    modelConfigSnapshot: governanceContext.modelConfigSnapshot,
    promptTemplateKey: governanceContext.promptTemplate.promptTemplateKey,
    promptTemplateVersion: governanceContext.promptTemplate.version,
    requestRedactedSnapshot: {
      taskPublicId: requestContext.taskPublicId,
      taskType: requestContext.taskType,
      ownerType: requestContext.ownerType,
      ownerPublicId: requestContext.ownerPublicId,
      organizationPublicId: requestContext.organizationPublicId,
      promptTemplateHash: governanceContext.promptTemplate.templateHash,
      redactionStatus: "redacted",
    },
    responseRedactedSnapshot: null,
    errorRedactedSnapshot: null,
    citationRedactedSnapshot: {
      evidenceStatus: input.groundingSummary.evidenceStatus,
      citationCount: input.groundingSummary.citationCount,
      redactionStatus: "redacted",
    },
    promptTokenCount: null,
    completionTokenCount: null,
    totalTokenCount: null,
    estimatedCostCny: null,
    latencyMs: null,
    startedAt: input.startedAt,
    completedAt: null,
  };
}

function readTokenCount(
  usageSummary: Record<string, number> | null,
  keys: readonly string[],
): number | null {
  if (usageSummary === null) {
    return null;
  }

  for (const key of keys) {
    const value = usageSummary[key];

    if (Number.isSafeInteger(value) && (value ?? -1) >= 0) {
      return value ?? null;
    }
  }

  return null;
}

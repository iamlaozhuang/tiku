import { createHash } from "node:crypto";

import {
  createAiCallLogRedactedSnapshots,
  type AiCallStatus,
  type ModelConfigSnapshot,
  type Profession,
  type RedactedJsonObject,
} from "../models/ai-rag";
import type { KnowledgeNodeSnapshot } from "../models/ai-rag";
import { createRedactedModelConfigRuntimeSnapshot } from "./model-config-runtime";
import {
  createSuccessfulAiCallObservation,
  createUnavailableAiCallObservation,
  measureClientObservedLatency,
  type AiCallObservation,
} from "./ai-call-observation";

export type KnowledgeRecommendationStatus =
  | "recommended"
  | "recommendation_failed";

export type KnowledgeRecommendationConfidence = "high" | "medium" | "low";

export type KnowledgeRecommendationSource = "ai_recommended";

export type KnowledgeRecommendationConfirmationStatus = "pending_confirmation";

export type KnowledgeRecommendationPromptTemplateSnapshot = {
  promptTemplateKey: string;
  version: number;
  templateHash: string;
};

export type KnowledgeRecommendationRunnerRecommendation = {
  knowledgeNodePublicId: string;
  confidence: string;
  reason: string;
};

export type KnowledgeRecommendationRunnerResult = {
  recommendations: KnowledgeRecommendationRunnerRecommendation[];
  providerRequestPayload: unknown;
  providerResponsePayload: unknown;
};

export type KnowledgeRecommendationRunnerInput = {
  questionText: string;
  analysis: string | null;
  standardAnswer: string | null;
  profession: Profession;
  level: number | null;
  knowledgeNodeSnapshots: KnowledgeNodeSnapshot[];
  modelConfigSnapshot: ModelConfigSnapshot;
  promptTemplate: KnowledgeRecommendationPromptTemplateSnapshot;
};

export type KnowledgeRecommendationRunner = (
  input: KnowledgeRecommendationRunnerInput,
) => Promise<KnowledgeRecommendationRunnerResult>;

export type KnowledgeRecommendationCallLogDraft = {
  callStatus: AiCallStatus;
  modelConfigSnapshot: ModelConfigSnapshot;
  promptTemplateKey: string;
  promptTemplateVersion: number;
  requestRedactedSnapshot: RedactedJsonObject;
  responseRedactedSnapshot: RedactedJsonObject | null;
  errorRedactedSnapshot: RedactedJsonObject | null;
  citationRedactedSnapshot: RedactedJsonObject | null;
  observation: AiCallObservation;
  startedAt: Date;
  completedAt: Date;
};

export type KnowledgeRecommendationContext = {
  userPublicId: string;
  questionPublicId: string;
  questionRevisionPublicId: string;
  questionText: string;
  analysis: string | null;
  standardAnswer: string | null;
  profession: Profession;
  level: number | null;
  knowledgeNodeSnapshots: KnowledgeNodeSnapshot[];
  modelConfigSnapshot: ModelConfigSnapshot;
  promptTemplate: KnowledgeRecommendationPromptTemplateSnapshot;
};

export type KnowledgeRecommendationItem = {
  knowledgeNodeSnapshot: KnowledgeNodeSnapshot;
  confidence: KnowledgeRecommendationConfidence;
  reason: string;
  source: KnowledgeRecommendationSource;
  confirmationStatus: KnowledgeRecommendationConfirmationStatus;
};

export type KnowledgeRecommendationResult = {
  recommendationStatus: KnowledgeRecommendationStatus;
  recommendations: KnowledgeRecommendationItem[];
  modelConfigSnapshot: ModelConfigSnapshot;
  promptTemplateKey: string;
  promptTemplateVersion: number;
  aiCallLogDraft: KnowledgeRecommendationCallLogDraft | null;
  failureReason?: "recommendation_runner_failed";
};

export type KnowledgeRecommendationService = {
  recommendKnowledgeNodes(
    context: KnowledgeRecommendationContext,
  ): Promise<KnowledgeRecommendationResult>;
};

export type KnowledgeRecommendationServiceDependencies = {
  runner: KnowledgeRecommendationRunner;
  now?: () => Date;
  monotonicNow?: () => number;
};

const maxRecommendationCount = 5;
const recommendationRunnerFailedReason = "recommendation_runner_failed";

function isKnowledgeNodeLevelCompatible(
  knowledgeNodeSnapshot: KnowledgeNodeSnapshot,
  level: number | null,
): boolean {
  return (
    level === null ||
    knowledgeNodeSnapshot.levelList.length === 0 ||
    knowledgeNodeSnapshot.levelList.includes(level)
  );
}

function getEligibleKnowledgeNodeSnapshots(
  context: KnowledgeRecommendationContext,
): KnowledgeNodeSnapshot[] {
  return context.knowledgeNodeSnapshots.filter(
    (knowledgeNodeSnapshot) =>
      knowledgeNodeSnapshot.profession === context.profession &&
      knowledgeNodeSnapshot.knStatus === "active" &&
      knowledgeNodeSnapshot.isRecommendable &&
      isKnowledgeNodeLevelCompatible(knowledgeNodeSnapshot, context.level),
  );
}

function normalizeConfidence(
  confidence: string,
): KnowledgeRecommendationConfidence {
  return confidence === "high" ||
    confidence === "medium" ||
    confidence === "low"
    ? confidence
    : "low";
}

function createRedactedPayloadEnvelope(value: unknown): RedactedJsonObject {
  const serializedValue =
    typeof value === "string" ? value : JSON.stringify(value);

  return {
    redactionStatus: "redacted",
    contentHash: createHash("sha256").update(serializedValue).digest("hex"),
    contentLength: serializedValue.length,
    reason: "provider_payload",
  };
}

function createPromptSnapshot(input: {
  context: KnowledgeRecommendationContext;
  eligibleKnowledgeNodeCount: number;
}): unknown {
  return {
    promptTemplateKey: input.context.promptTemplate.promptTemplateKey,
    promptTemplateVersion: input.context.promptTemplate.version,
    templateHash: input.context.promptTemplate.templateHash,
    questionPublicId: input.context.questionPublicId,
    questionRevisionPublicId: input.context.questionRevisionPublicId,
    eligibleKnowledgeNodeCount: input.eligibleKnowledgeNodeCount,
  };
}

function createRequestContext(input: {
  context: KnowledgeRecommendationContext;
  eligibleKnowledgeNodeSnapshots: KnowledgeNodeSnapshot[];
}): unknown {
  return {
    questionText: input.context.questionText,
    analysis: input.context.analysis,
    standardAnswer: input.context.standardAnswer,
    profession: input.context.profession,
    level: input.context.level,
    knowledgeNodeSnapshots: input.eligibleKnowledgeNodeSnapshots,
  };
}

function createAiCallLogDraft(input: {
  context: KnowledgeRecommendationContext;
  eligibleKnowledgeNodeSnapshots: KnowledgeNodeSnapshot[];
  callStatus: AiCallStatus;
  modelOutput: unknown;
  providerRequestPayload: unknown;
  providerResponsePayload: unknown;
  providerErrorPayload: unknown;
  observation: AiCallObservation;
  startedAt: Date;
  completedAt: Date;
}): KnowledgeRecommendationCallLogDraft {
  const redactedSnapshots = createAiCallLogRedactedSnapshots({
    prompt: createPromptSnapshot({
      context: input.context,
      eligibleKnowledgeNodeCount: input.eligibleKnowledgeNodeSnapshots.length,
    }),
    userAnswer: createRequestContext({
      context: input.context,
      eligibleKnowledgeNodeSnapshots: input.eligibleKnowledgeNodeSnapshots,
    }),
    modelOutput: input.modelOutput,
    citations: input.eligibleKnowledgeNodeSnapshots,
    providerRequestPayload: createRedactedPayloadEnvelope(
      input.providerRequestPayload,
    ),
    providerResponsePayload: createRedactedPayloadEnvelope(
      input.providerResponsePayload,
    ),
    providerErrorPayload: createRedactedPayloadEnvelope(
      input.providerErrorPayload,
    ),
  });

  return {
    callStatus: input.callStatus,
    modelConfigSnapshot: input.context.modelConfigSnapshot,
    promptTemplateKey: input.context.promptTemplate.promptTemplateKey,
    promptTemplateVersion: input.context.promptTemplate.version,
    requestRedactedSnapshot: {
      modelConfig: createRedactedModelConfigRuntimeSnapshot(
        input.context.modelConfigSnapshot,
      ),
      prompt: redactedSnapshots.prompt,
      question: redactedSnapshots.userAnswer,
      providerRequestPayload: redactedSnapshots.providerRequestPayload,
    },
    responseRedactedSnapshot:
      input.callStatus === "success"
        ? {
            modelOutput: redactedSnapshots.modelOutput,
            providerResponsePayload: redactedSnapshots.providerResponsePayload,
          }
        : null,
    errorRedactedSnapshot:
      input.callStatus === "failed"
        ? {
            providerErrorPayload: redactedSnapshots.providerErrorPayload,
          }
        : null,
    citationRedactedSnapshot: {
      knowledgeNodeSnapshots: redactedSnapshots.citations,
    },
    observation: input.observation,
    startedAt: input.startedAt,
    completedAt: input.completedAt,
  };
}

function createBaseResult(
  context: KnowledgeRecommendationContext,
  overrides: Partial<KnowledgeRecommendationResult>,
): KnowledgeRecommendationResult {
  return {
    recommendationStatus: "recommended",
    recommendations: [],
    modelConfigSnapshot: context.modelConfigSnapshot,
    promptTemplateKey: context.promptTemplate.promptTemplateKey,
    promptTemplateVersion: context.promptTemplate.version,
    aiCallLogDraft: null,
    ...overrides,
  };
}

function createRecommendationItems(
  runnerResult: KnowledgeRecommendationRunnerResult,
  eligibleKnowledgeNodeSnapshots: KnowledgeNodeSnapshot[],
): KnowledgeRecommendationItem[] {
  const knowledgeNodeSnapshotByPublicId = new Map(
    eligibleKnowledgeNodeSnapshots.map((knowledgeNodeSnapshot) => [
      knowledgeNodeSnapshot.publicId,
      knowledgeNodeSnapshot,
    ]),
  );
  const recommendedKnowledgeNodePublicIds = new Set<string>();
  const recommendations: KnowledgeRecommendationItem[] = [];

  for (const runnerRecommendation of runnerResult.recommendations) {
    const knowledgeNodeSnapshot = knowledgeNodeSnapshotByPublicId.get(
      runnerRecommendation.knowledgeNodePublicId,
    );

    if (
      knowledgeNodeSnapshot === undefined ||
      recommendedKnowledgeNodePublicIds.has(knowledgeNodeSnapshot.publicId)
    ) {
      continue;
    }

    recommendations.push({
      knowledgeNodeSnapshot,
      confidence: normalizeConfidence(runnerRecommendation.confidence),
      reason: runnerRecommendation.reason,
      source: "ai_recommended",
      confirmationStatus: "pending_confirmation",
    });
    recommendedKnowledgeNodePublicIds.add(knowledgeNodeSnapshot.publicId);

    if (recommendations.length >= maxRecommendationCount) {
      break;
    }
  }

  return recommendations;
}

export function createKnowledgeRecommendationService(
  dependencies: KnowledgeRecommendationServiceDependencies,
): KnowledgeRecommendationService {
  const now = dependencies.now ?? (() => new Date());
  const monotonicNow = dependencies.monotonicNow ?? (() => performance.now());

  return {
    async recommendKnowledgeNodes(context) {
      const eligibleKnowledgeNodeSnapshots =
        getEligibleKnowledgeNodeSnapshots(context);

      if (eligibleKnowledgeNodeSnapshots.length === 0) {
        return createBaseResult(context, {
          recommendationStatus: "recommended",
          recommendations: [],
          aiCallLogDraft: null,
        });
      }

      const runnerInput: KnowledgeRecommendationRunnerInput = {
        questionText: context.questionText,
        analysis: context.analysis,
        standardAnswer: context.standardAnswer,
        profession: context.profession,
        level: context.level,
        knowledgeNodeSnapshots: eligibleKnowledgeNodeSnapshots,
        modelConfigSnapshot: context.modelConfigSnapshot,
        promptTemplate: context.promptTemplate,
      };
      const startedAt = now();
      const startedMonotonicMs = monotonicNow();
      try {
        const runnerResult = await dependencies.runner(runnerInput);
        const recommendations = createRecommendationItems(
          runnerResult,
          eligibleKnowledgeNodeSnapshots,
        );
        const completedAt = now();
        const latencyMs = measureClientObservedLatency(
          startedMonotonicMs,
          monotonicNow(),
        );

        return createBaseResult(context, {
          recommendationStatus: "recommended",
          recommendations,
          aiCallLogDraft: createAiCallLogDraft({
            context,
            eligibleKnowledgeNodeSnapshots,
            callStatus: "success",
            modelOutput: {
              recommendations,
            },
            providerRequestPayload: runnerResult.providerRequestPayload,
            providerResponsePayload: runnerResult.providerResponsePayload,
            providerErrorPayload: null,
            observation: createSuccessfulAiCallObservation({
              providerUsage: null,
              providerLatencyMs: undefined,
              clientLatencyMs: latencyMs,
              serializedProviderRequest: runnerResult.providerRequestPayload,
              normalizedProviderResponse: { recommendations },
            }),
            startedAt,
            completedAt,
          }),
        });
      } catch (error) {
        const completedAt = now();
        const latencyMs = measureClientObservedLatency(
          startedMonotonicMs,
          monotonicNow(),
        );
        return createBaseResult(context, {
          recommendationStatus: "recommendation_failed",
          recommendations: [],
          failureReason: recommendationRunnerFailedReason,
          aiCallLogDraft: createAiCallLogDraft({
            context,
            eligibleKnowledgeNodeSnapshots,
            callStatus: "failed",
            modelOutput: null,
            providerRequestPayload: null,
            providerResponsePayload: null,
            providerErrorPayload:
              error instanceof Error
                ? { message: error.message, name: error.name }
                : error,
            observation: createUnavailableAiCallObservation({ latencyMs }),
            startedAt,
            completedAt,
          }),
        });
      }
    },
  };
}

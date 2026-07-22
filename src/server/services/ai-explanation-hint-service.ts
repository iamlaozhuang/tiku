import type {
  RagCitationDto,
  RagRetrievalResultDto,
} from "../contracts/ai-rag-contract";
import {
  createAiCallLogRedactedSnapshots,
  type AiCallStatus,
  type EvidenceStatus,
  type ModelConfigSnapshot,
  type RedactedJsonObject,
} from "../models/ai-rag";
import { createRedactedModelConfigRuntimeSnapshot } from "./model-config-runtime";

export type AiExplanationStatus = "explained" | "explanation_unavailable";

export type AiHintStatus = "hinted" | "hint_unavailable";

export type AiExplanationTriggerReason = "wrong_answer_auto" | "manual_request";

export type AiExplanationPromptTemplateSnapshot = {
  promptTemplateKey: string;
  version: number;
  templateHash: string;
};

export type AiHintPromptTemplateSnapshot = {
  promptTemplateKey: string;
  version: number;
  templateHash: string;
};

export type AiExplanationRunnerResult = {
  explanationText: string;
  keyPoints: string[];
  learningSuggestion: string | null;
  providerRequestPayload: unknown;
  providerResponsePayload: unknown;
};

export type AiHintRunnerResult = {
  hintText: string;
  improvementDirections: string[];
  providerRequestPayload: unknown;
  providerResponsePayload: unknown;
};

export type AiExplanationRunnerInput = {
  questionText: string;
  standardAnswer: string;
  analysis: string | null;
  learnerAnswer: string;
  isCorrect: boolean;
  triggerReason: AiExplanationTriggerReason;
  ragRetrievalResult: RagRetrievalResultDto;
  modelConfigSnapshot: ModelConfigSnapshot;
  promptTemplate: AiExplanationPromptTemplateSnapshot;
};

export type AiHintRunnerInput = {
  questionText: string;
  studentAnswer: string;
  scoringPointLabels: string[];
  ragRetrievalResult: RagRetrievalResultDto;
  modelConfigSnapshot: ModelConfigSnapshot;
  promptTemplate: AiHintPromptTemplateSnapshot;
};

export type AiExplanationRunner = (
  input: AiExplanationRunnerInput,
) => Promise<AiExplanationRunnerResult>;

export type AiHintRunner = (
  input: AiHintRunnerInput,
) => Promise<AiHintRunnerResult>;

export type AiExplanationHintRunnerFailureCategory =
  | "timeout"
  | "rate_limited"
  | "provider_unavailable"
  | "network"
  | "invalid_output"
  | "client_error";

export class AiExplanationHintRunnerError extends Error {
  constructor(
    readonly failureCategory: AiExplanationHintRunnerFailureCategory,
    message = failureCategory,
  ) {
    super(message);
    this.name = "AiExplanationHintRunnerError";
  }
}

export type AiExplanationCallLogDraft = {
  callStatus: AiCallStatus;
  modelConfigSnapshot: ModelConfigSnapshot;
  promptTemplateKey: string;
  promptTemplateVersion: number;
  requestRedactedSnapshot: RedactedJsonObject;
  responseRedactedSnapshot: RedactedJsonObject | null;
  errorRedactedSnapshot: RedactedJsonObject | null;
  citationRedactedSnapshot: RedactedJsonObject | null;
  startedAt: Date;
  completedAt: Date;
  promptTokenCount: number;
  completionTokenCount: number;
  totalTokenCount: number;
};

export type AiHintCallLogDraft = AiExplanationCallLogDraft;

export type AiExplanationContext = {
  userPublicId: string;
  practicePublicId: string | null;
  answerRecordPublicId: string;
  questionPublicId: string;
  questionText: string;
  standardAnswer: string;
  analysis: string | null;
  learnerAnswer: string;
  isCorrect: boolean;
  triggerReason: AiExplanationTriggerReason;
  modelConfigSnapshot: ModelConfigSnapshot;
  promptTemplate: AiExplanationPromptTemplateSnapshot;
  fallbackAttempt?: {
    modelConfigSnapshot: ModelConfigSnapshot;
    promptTemplate: AiExplanationPromptTemplateSnapshot;
  };
  ragRetrievalResult: RagRetrievalResultDto;
};

export type AiHintContext = {
  userPublicId: string;
  practicePublicId: string | null;
  answerRecordPublicId: string;
  questionPublicId: string;
  questionText: string;
  standardAnswer: string;
  studentAnswer: string;
  scoringPointLabels: string[];
  modelConfigSnapshot: ModelConfigSnapshot;
  promptTemplate: AiHintPromptTemplateSnapshot;
  fallbackAttempt?: {
    modelConfigSnapshot: ModelConfigSnapshot;
    promptTemplate: AiHintPromptTemplateSnapshot;
  };
  ragRetrievalResult: RagRetrievalResultDto;
};

export type AiExplanationResult = {
  explanationStatus: AiExplanationStatus;
  explanationText: string;
  keyPoints: string[];
  learningSuggestion: string | null;
  insufficientEvidenceMessage: string | null;
  modelConfigSnapshot: ModelConfigSnapshot;
  promptTemplateKey: string;
  promptTemplateVersion: number;
  evidenceStatus: EvidenceStatus;
  citations: RagCitationDto[];
  aiCallLogDraft: AiExplanationCallLogDraft | null;
  aiCallLogDrafts: AiExplanationCallLogDraft[];
};

export type AiHintResult = {
  hintStatus: AiHintStatus;
  hintText: string;
  improvementDirections: string[];
  insufficientEvidenceMessage: string | null;
  modelConfigSnapshot: ModelConfigSnapshot;
  promptTemplateKey: string;
  promptTemplateVersion: number;
  evidenceStatus: EvidenceStatus;
  citations: RagCitationDto[];
  aiCallLogDraft: AiHintCallLogDraft | null;
  aiCallLogDrafts: AiHintCallLogDraft[];
};

export type AiExplanationHintService = {
  generateObjectiveExplanation(
    context: AiExplanationContext,
  ): Promise<AiExplanationResult>;
  generateSubjectiveHint(context: AiHintContext): Promise<AiHintResult>;
};

export type AiExplanationHintServiceDependencies = {
  explanationRunner: AiExplanationRunner;
  hintRunner: AiHintRunner;
  onAttemptComplete?: (draft: AiExplanationCallLogDraft) => Promise<void>;
};

const insufficientEvidenceMessage =
  "RAG evidence is insufficient; no citation is attached.";
const explanationUnavailableText = "AI explanation is temporarily unavailable.";
const hintUnavailableText = "AI hint is temporarily unavailable.";
const answerWithheldHintText =
  "Focus on the missing reasoning steps instead of reading the final answer.";
const retryableRunnerFailureCategories =
  new Set<AiExplanationHintRunnerFailureCategory>([
    "timeout",
    "rate_limited",
    "provider_unavailable",
    "network",
    "invalid_output",
  ]);
const retryableNetworkErrorCodes = new Set([
  "ECONNABORTED",
  "ECONNREFUSED",
  "ECONNRESET",
  "ENETDOWN",
  "ENETUNREACH",
  "ETIMEDOUT",
]);

class AiExplanationHintAttemptLogPersistenceError extends Error {
  constructor() {
    super("AI explanation or hint attempt log persistence failed.");
    this.name = "AiExplanationHintAttemptLogPersistenceError";
  }
}

function estimateTokenCount(value: string): number {
  return Math.max(1, Math.ceil(value.length / 4));
}

async function persistAttemptLog(
  dependencies: AiExplanationHintServiceDependencies,
  draft: AiExplanationCallLogDraft,
): Promise<void> {
  try {
    await dependencies.onAttemptComplete?.(draft);
  } catch {
    throw new AiExplanationHintAttemptLogPersistenceError();
  }
}

function readErrorProperty(error: unknown, property: string): unknown {
  return error !== null && typeof error === "object" && property in error
    ? error[property as keyof typeof error]
    : null;
}

function readNestedErrorProperty(
  error: unknown,
  container: string,
  property: string,
): unknown {
  return readErrorProperty(readErrorProperty(error, container), property);
}

function normalizeHttpStatus(value: unknown): number | null {
  const status =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : null;

  return status !== null &&
    Number.isInteger(status) &&
    status >= 100 &&
    status <= 599
    ? status
    : null;
}

function isRetryableRunnerFailure(error: unknown): boolean {
  if (error instanceof AiExplanationHintRunnerError) {
    return retryableRunnerFailureCategories.has(error.failureCategory);
  }

  if (readErrorProperty(error, "name") === "AbortError") {
    return true;
  }

  const status = [
    readErrorProperty(error, "status"),
    readErrorProperty(error, "statusCode"),
    readNestedErrorProperty(error, "response", "status"),
    readNestedErrorProperty(error, "response", "statusCode"),
    readNestedErrorProperty(error, "cause", "status"),
    readNestedErrorProperty(error, "cause", "statusCode"),
  ]
    .map(normalizeHttpStatus)
    .find((candidate) => candidate !== null);

  if (status !== undefined) {
    return status === 408 || status === 429 || status >= 500;
  }

  const code = [
    readErrorProperty(error, "code"),
    readNestedErrorProperty(error, "cause", "code"),
  ].find((candidate) => typeof candidate === "string");

  return typeof code === "string" && retryableNetworkErrorCodes.has(code);
}

function isPromptAligned(
  modelConfigSnapshot: ModelConfigSnapshot,
  promptTemplate: AiExplanationPromptTemplateSnapshot,
): boolean {
  return (
    modelConfigSnapshot.promptTemplateKey ===
      promptTemplate.promptTemplateKey &&
    modelConfigSnapshot.promptTemplateVersion === promptTemplate.version
  );
}

function resolveValidFallbackAttempt(input: {
  aiFuncType: "explanation" | "hint";
  primaryModelConfigSnapshot: ModelConfigSnapshot;
  fallbackAttempt:
    | {
        modelConfigSnapshot: ModelConfigSnapshot;
        promptTemplate: AiExplanationPromptTemplateSnapshot;
      }
    | undefined;
}):
  | {
      modelConfigSnapshot: ModelConfigSnapshot;
      promptTemplate: AiExplanationPromptTemplateSnapshot;
    }
  | undefined {
  const fallbackAttempt = input.fallbackAttempt;

  return fallbackAttempt !== undefined &&
    input.primaryModelConfigSnapshot.aiFuncType === input.aiFuncType &&
    fallbackAttempt.modelConfigSnapshot.aiFuncType === input.aiFuncType &&
    input.primaryModelConfigSnapshot.fallbackModelConfigPublicId ===
      fallbackAttempt.modelConfigSnapshot.modelConfigPublicId &&
    input.primaryModelConfigSnapshot.modelConfigPublicId !==
      fallbackAttempt.modelConfigSnapshot.modelConfigPublicId &&
    isPromptAligned(
      fallbackAttempt.modelConfigSnapshot,
      fallbackAttempt.promptTemplate,
    )
    ? fallbackAttempt
    : undefined;
}

function getAttachableCitations(
  ragRetrievalResult: RagRetrievalResultDto,
): RagCitationDto[] {
  return ragRetrievalResult.evidenceStatus === "sufficient"
    ? ragRetrievalResult.citations
    : [];
}

function getInsufficientEvidenceMessage(
  ragRetrievalResult: RagRetrievalResultDto,
): string | null {
  return ragRetrievalResult.evidenceStatus === "sufficient"
    ? null
    : insufficientEvidenceMessage;
}

function createPromptSnapshot(input: {
  promptTemplateKey: string;
  promptTemplateVersion: number;
  templateHash: string;
  questionPublicId: string;
  answerRecordPublicId: string;
}): unknown {
  return {
    promptTemplateKey: input.promptTemplateKey,
    promptTemplateVersion: input.promptTemplateVersion,
    templateHash: input.templateHash,
    questionPublicId: input.questionPublicId,
    answerRecordPublicId: input.answerRecordPublicId,
  };
}

function createAiCallLogDraft(input: {
  modelConfigSnapshot: ModelConfigSnapshot;
  promptTemplateKey: string;
  promptTemplateVersion: number;
  promptTemplateHash: string;
  questionPublicId: string;
  answerRecordPublicId: string;
  callStatus: AiCallStatus;
  userAnswer: string;
  requestContext: unknown;
  modelOutput: unknown;
  providerRequestPayload: unknown;
  providerResponsePayload: unknown;
  providerErrorPayload: unknown;
  ragRetrievalResult: RagRetrievalResultDto;
  citations: RagCitationDto[];
  startedAt: Date;
  completedAt: Date;
  promptTokenCount: number;
  completionTokenCount: number;
}): AiExplanationCallLogDraft {
  const promptSnapshot = createPromptSnapshot({
    promptTemplateKey: input.promptTemplateKey,
    promptTemplateVersion: input.promptTemplateVersion,
    templateHash: input.promptTemplateHash,
    questionPublicId: input.questionPublicId,
    answerRecordPublicId: input.answerRecordPublicId,
  });
  const redactedSnapshots = createAiCallLogRedactedSnapshots({
    prompt: promptSnapshot,
    userAnswer: input.userAnswer,
    modelOutput: input.modelOutput,
    citations: input.citations,
    providerRequestPayload: {
      requestBody: JSON.stringify(input.providerRequestPayload),
    },
    providerResponsePayload: {
      responseBody: JSON.stringify(input.providerResponsePayload),
    },
    providerErrorPayload: {
      errorBody: JSON.stringify(input.providerErrorPayload),
    },
  });
  const redactedRequestContext = createAiCallLogRedactedSnapshots({
    prompt: null,
    userAnswer: input.requestContext,
    modelOutput: null,
    citations: [],
    providerRequestPayload: null,
    providerResponsePayload: null,
    providerErrorPayload: null,
  }).userAnswer;

  return {
    callStatus: input.callStatus,
    modelConfigSnapshot: input.modelConfigSnapshot,
    promptTemplateKey: input.promptTemplateKey,
    promptTemplateVersion: input.promptTemplateVersion,
    requestRedactedSnapshot: {
      modelConfig: createRedactedModelConfigRuntimeSnapshot(
        input.modelConfigSnapshot,
      ),
      prompt: redactedSnapshots.prompt,
      userAnswer: redactedSnapshots.userAnswer,
      providerRequestPayload: redactedSnapshots.providerRequestPayload,
      requestContext: redactedRequestContext,
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
      citations: redactedSnapshots.citations,
      evidenceSummary: input.ragRetrievalResult.evidenceSummary,
    },
    startedAt: input.startedAt,
    completedAt: input.completedAt,
    promptTokenCount: input.promptTokenCount,
    completionTokenCount: input.completionTokenCount,
    totalTokenCount: input.promptTokenCount + input.completionTokenCount,
  };
}

function createExplanationRequestContext(
  context: AiExplanationContext,
): unknown {
  return {
    questionText: context.questionText,
    standardAnswer: context.standardAnswer,
    analysis: context.analysis,
    learnerAnswer: context.learnerAnswer,
    isCorrect: context.isCorrect,
    triggerReason: context.triggerReason,
    ragEvidenceSummary: context.ragRetrievalResult.evidenceSummary,
  };
}

function createHintRequestContext(context: AiHintContext): unknown {
  return {
    questionText: context.questionText,
    standardAnswer: context.standardAnswer,
    studentAnswer: context.studentAnswer,
    scoringPointLabels: context.scoringPointLabels,
    ragEvidenceSummary: context.ragRetrievalResult.evidenceSummary,
  };
}

function sanitizeHintText(hintText: string, standardAnswer: string): string {
  const normalizedStandardAnswer = standardAnswer.trim();

  if (normalizedStandardAnswer.length === 0) {
    return hintText;
  }

  return hintText.includes(normalizedStandardAnswer)
    ? hintText.split(normalizedStandardAnswer).join(answerWithheldHintText)
    : hintText;
}

export function createAiExplanationHintService(
  dependencies: AiExplanationHintServiceDependencies,
): AiExplanationHintService {
  return {
    async generateObjectiveExplanation(context) {
      const citations = getAttachableCitations(context.ragRetrievalResult);
      const fallbackAttempt = resolveValidFallbackAttempt({
        aiFuncType: "explanation",
        primaryModelConfigSnapshot: context.modelConfigSnapshot,
        fallbackAttempt: context.fallbackAttempt,
      });
      const attempts = [
        {
          modelConfigSnapshot: context.modelConfigSnapshot,
          promptTemplate: context.promptTemplate,
        },
        ...(fallbackAttempt === undefined ? [] : [fallbackAttempt]),
      ];
      const aiCallLogDrafts: AiExplanationCallLogDraft[] = [];

      for (const [attemptIndex, attempt] of attempts.entries()) {
        const attemptStartedAt = new Date();

        try {
          const runnerResult = await dependencies.explanationRunner({
            questionText: context.questionText,
            standardAnswer: context.standardAnswer,
            analysis: context.analysis,
            learnerAnswer: context.learnerAnswer,
            isCorrect: context.isCorrect,
            triggerReason: context.triggerReason,
            ragRetrievalResult: context.ragRetrievalResult,
            modelConfigSnapshot: attempt.modelConfigSnapshot,
            promptTemplate: attempt.promptTemplate,
          });
          const modelOutput = {
            explanationText: runnerResult.explanationText,
            keyPoints: runnerResult.keyPoints,
            learningSuggestion: runnerResult.learningSuggestion,
          };
          const successDraft = createAiCallLogDraft({
            modelConfigSnapshot: attempt.modelConfigSnapshot,
            promptTemplateKey: attempt.promptTemplate.promptTemplateKey,
            promptTemplateVersion: attempt.promptTemplate.version,
            promptTemplateHash: attempt.promptTemplate.templateHash,
            questionPublicId: context.questionPublicId,
            answerRecordPublicId: context.answerRecordPublicId,
            callStatus: "success",
            userAnswer: context.learnerAnswer,
            requestContext: createExplanationRequestContext(context),
            modelOutput,
            providerRequestPayload: runnerResult.providerRequestPayload,
            providerResponsePayload: runnerResult.providerResponsePayload,
            providerErrorPayload: null,
            ragRetrievalResult: context.ragRetrievalResult,
            citations,
            startedAt: attemptStartedAt,
            completedAt: new Date(),
            promptTokenCount: estimateTokenCount(context.learnerAnswer),
            completionTokenCount: estimateTokenCount(
              runnerResult.explanationText,
            ),
          });

          aiCallLogDrafts.push(successDraft);
          await persistAttemptLog(dependencies, successDraft);

          return {
            explanationStatus: "explained",
            explanationText: runnerResult.explanationText,
            keyPoints: runnerResult.keyPoints,
            learningSuggestion: runnerResult.learningSuggestion,
            insufficientEvidenceMessage: getInsufficientEvidenceMessage(
              context.ragRetrievalResult,
            ),
            modelConfigSnapshot: attempt.modelConfigSnapshot,
            promptTemplateKey: attempt.promptTemplate.promptTemplateKey,
            promptTemplateVersion: attempt.promptTemplate.version,
            evidenceStatus: context.ragRetrievalResult.evidenceStatus,
            citations,
            aiCallLogDraft: successDraft,
            aiCallLogDrafts,
          };
        } catch (error) {
          if (error instanceof AiExplanationHintAttemptLogPersistenceError) {
            throw error;
          }

          const failedDraft = createAiCallLogDraft({
            modelConfigSnapshot: attempt.modelConfigSnapshot,
            promptTemplateKey: attempt.promptTemplate.promptTemplateKey,
            promptTemplateVersion: attempt.promptTemplate.version,
            promptTemplateHash: attempt.promptTemplate.templateHash,
            questionPublicId: context.questionPublicId,
            answerRecordPublicId: context.answerRecordPublicId,
            callStatus: "failed",
            userAnswer: context.learnerAnswer,
            requestContext: createExplanationRequestContext(context),
            modelOutput: null,
            providerRequestPayload: null,
            providerResponsePayload: null,
            providerErrorPayload:
              error instanceof Error
                ? { message: error.message, name: error.name }
                : error,
            ragRetrievalResult: context.ragRetrievalResult,
            citations: [],
            startedAt: attemptStartedAt,
            completedAt: new Date(),
            promptTokenCount: estimateTokenCount(context.learnerAnswer),
            completionTokenCount: 0,
          });

          aiCallLogDrafts.push(failedDraft);
          await persistAttemptLog(dependencies, failedDraft);

          if (
            attemptIndex < attempts.length - 1 &&
            isRetryableRunnerFailure(error)
          ) {
            continue;
          }

          return {
            explanationStatus: "explanation_unavailable",
            explanationText: explanationUnavailableText,
            keyPoints: [],
            learningSuggestion: null,
            insufficientEvidenceMessage: getInsufficientEvidenceMessage(
              context.ragRetrievalResult,
            ),
            modelConfigSnapshot: attempt.modelConfigSnapshot,
            promptTemplateKey: attempt.promptTemplate.promptTemplateKey,
            promptTemplateVersion: attempt.promptTemplate.version,
            evidenceStatus: context.ragRetrievalResult.evidenceStatus,
            citations: [],
            aiCallLogDraft: failedDraft,
            aiCallLogDrafts,
          };
        }
      }

      throw new Error("AI explanation attempt plan is empty.");
    },

    async generateSubjectiveHint(context) {
      const citations = getAttachableCitations(context.ragRetrievalResult);
      const fallbackAttempt = resolveValidFallbackAttempt({
        aiFuncType: "hint",
        primaryModelConfigSnapshot: context.modelConfigSnapshot,
        fallbackAttempt: context.fallbackAttempt,
      });
      const attempts = [
        {
          modelConfigSnapshot: context.modelConfigSnapshot,
          promptTemplate: context.promptTemplate,
        },
        ...(fallbackAttempt === undefined ? [] : [fallbackAttempt]),
      ];
      const aiCallLogDrafts: AiHintCallLogDraft[] = [];

      for (const [attemptIndex, attempt] of attempts.entries()) {
        const attemptStartedAt = new Date();

        try {
          const runnerResult = await dependencies.hintRunner({
            questionText: context.questionText,
            studentAnswer: context.studentAnswer,
            scoringPointLabels: context.scoringPointLabels,
            ragRetrievalResult: context.ragRetrievalResult,
            modelConfigSnapshot: attempt.modelConfigSnapshot,
            promptTemplate: attempt.promptTemplate,
          });
          const hintText = sanitizeHintText(
            runnerResult.hintText,
            context.standardAnswer,
          );
          const modelOutput = {
            hintText,
            improvementDirections: runnerResult.improvementDirections,
          };
          const successDraft = createAiCallLogDraft({
            modelConfigSnapshot: attempt.modelConfigSnapshot,
            promptTemplateKey: attempt.promptTemplate.promptTemplateKey,
            promptTemplateVersion: attempt.promptTemplate.version,
            promptTemplateHash: attempt.promptTemplate.templateHash,
            questionPublicId: context.questionPublicId,
            answerRecordPublicId: context.answerRecordPublicId,
            callStatus: "success",
            userAnswer: context.studentAnswer,
            requestContext: createHintRequestContext(context),
            modelOutput,
            providerRequestPayload: runnerResult.providerRequestPayload,
            providerResponsePayload: runnerResult.providerResponsePayload,
            providerErrorPayload: null,
            ragRetrievalResult: context.ragRetrievalResult,
            citations,
            startedAt: attemptStartedAt,
            completedAt: new Date(),
            promptTokenCount: estimateTokenCount(context.studentAnswer),
            completionTokenCount: estimateTokenCount(hintText),
          });

          aiCallLogDrafts.push(successDraft);
          await persistAttemptLog(dependencies, successDraft);

          return {
            hintStatus: "hinted",
            hintText,
            improvementDirections: runnerResult.improvementDirections,
            insufficientEvidenceMessage: getInsufficientEvidenceMessage(
              context.ragRetrievalResult,
            ),
            modelConfigSnapshot: attempt.modelConfigSnapshot,
            promptTemplateKey: attempt.promptTemplate.promptTemplateKey,
            promptTemplateVersion: attempt.promptTemplate.version,
            evidenceStatus: context.ragRetrievalResult.evidenceStatus,
            citations,
            aiCallLogDraft: successDraft,
            aiCallLogDrafts,
          };
        } catch (error) {
          if (error instanceof AiExplanationHintAttemptLogPersistenceError) {
            throw error;
          }

          const failedDraft = createAiCallLogDraft({
            modelConfigSnapshot: attempt.modelConfigSnapshot,
            promptTemplateKey: attempt.promptTemplate.promptTemplateKey,
            promptTemplateVersion: attempt.promptTemplate.version,
            promptTemplateHash: attempt.promptTemplate.templateHash,
            questionPublicId: context.questionPublicId,
            answerRecordPublicId: context.answerRecordPublicId,
            callStatus: "failed",
            userAnswer: context.studentAnswer,
            requestContext: createHintRequestContext(context),
            modelOutput: null,
            providerRequestPayload: null,
            providerResponsePayload: null,
            providerErrorPayload:
              error instanceof Error
                ? { message: error.message, name: error.name }
                : error,
            ragRetrievalResult: context.ragRetrievalResult,
            citations: [],
            startedAt: attemptStartedAt,
            completedAt: new Date(),
            promptTokenCount: estimateTokenCount(context.studentAnswer),
            completionTokenCount: 0,
          });

          aiCallLogDrafts.push(failedDraft);
          await persistAttemptLog(dependencies, failedDraft);

          if (
            attemptIndex < attempts.length - 1 &&
            isRetryableRunnerFailure(error)
          ) {
            continue;
          }

          return {
            hintStatus: "hint_unavailable",
            hintText: hintUnavailableText,
            improvementDirections: [],
            insufficientEvidenceMessage: getInsufficientEvidenceMessage(
              context.ragRetrievalResult,
            ),
            modelConfigSnapshot: attempt.modelConfigSnapshot,
            promptTemplateKey: attempt.promptTemplate.promptTemplateKey,
            promptTemplateVersion: attempt.promptTemplate.version,
            evidenceStatus: context.ragRetrievalResult.evidenceStatus,
            citations: [],
            aiCallLogDraft: failedDraft,
            aiCallLogDrafts,
          };
        }
      }

      throw new Error("AI hint attempt plan is empty.");
    },
  };
}

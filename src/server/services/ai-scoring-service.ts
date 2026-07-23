import type {
  RagCitationDto,
  RagRetrievalResultDto,
} from "../contracts/ai-rag-contract";
import {
  createAiCallLogRedactedSnapshots,
  createAiScoringAttemptSnapshot,
  createFailureMessageDigest,
  type AiCallStatus,
  type AiScoringAttemptSnapshot,
  type AiScoringAttemptStatus,
  type EvidenceStatus,
  type ModelConfigSnapshot,
  type RedactedJsonObject,
} from "../models/ai-rag";
import { createRedactedModelConfigRuntimeSnapshot } from "./model-config-runtime";
import {
  AiScoringResultContractError,
  normalizeAiScoringPointResults,
  validateAiScoringExpectedFacts,
} from "./ai-scoring-result-contract";
import {
  normalizeAiScoringQuestionContext,
  type AiScoringQuestionContext,
  type AiScoringQuestionContextScope,
} from "./ai-scoring-question-context";

export type AiScoringStatus =
  | "scored"
  | "scoring_failed"
  | "retry_limit_reached";

export type AiScoringPointInput = {
  scoringPointPublicId: string;
  label: string;
  maxScore: number;
};

export type AiScoringPointResult = {
  scoringPointPublicId: string;
  isHit: boolean;
  score: number;
  reason: string;
};

export type AiScoringPromptTemplateSnapshot = {
  promptTemplateKey: string;
  version: number;
  templateHash: string;
};

export type AiScoringRunnerResult = {
  scoringPoints: AiScoringPointResult[];
  overallComment: string;
  improvementSuggestion: string | null;
  providerRequestPayload: unknown;
  providerResponsePayload: unknown;
};

export type AiScoringRunner = (
  input: AiScoringRunnerInput,
) => Promise<AiScoringRunnerResult>;

export type AiScoringRunnerInput = {
  questionContext: AiScoringQuestionContext;
  questionText: string;
  standardAnswer: string;
  studentAnswer: string;
  scoringPoints: AiScoringPointInput[];
  ragRetrievalResult: RagRetrievalResultDto;
  modelConfigSnapshot: ModelConfigSnapshot;
  promptTemplate: AiScoringPromptTemplateSnapshot;
};

export type AiScoringCallLogDraft = {
  callStatus: AiCallStatus;
  modelConfigSnapshot: ModelConfigSnapshot;
  promptTemplateKey: string;
  promptTemplateVersion: number;
  requestRedactedSnapshot: RedactedJsonObject;
  responseRedactedSnapshot: RedactedJsonObject | null;
  errorRedactedSnapshot: RedactedJsonObject | null;
  citationRedactedSnapshot: RedactedJsonObject | null;
};

export type AiScoringAttemptDraft = {
  status: AiScoringAttemptStatus;
  failureCode: string | null;
  failureMessageDigest: string | null;
  retryAfterAt: Date | null;
  attemptSnapshot: AiScoringAttemptSnapshot;
};

export type ExistingAiScoringResult = {
  scoringStatus: AiScoringStatus;
  totalScore: number;
  maxScore: number;
  retryCount: number;
  scoringPoints: AiScoringPointResult[];
  overallComment: string;
  improvementSuggestion: string | null;
  modelConfigSnapshot: ModelConfigSnapshot;
  promptTemplateKey: string;
  promptTemplateVersion: number;
  evidenceStatus: EvidenceStatus;
  citations: RagCitationDto[];
  aiCallLogDraft: AiScoringCallLogDraft | null;
  aiScoringAttemptDraft: AiScoringAttemptDraft | null;
  failureReason?: string;
};

export type AiScoringContext = {
  userPublicId: string;
  mockExamPublicId: string;
  profession: AiScoringQuestionContextScope["profession"];
  level: number;
  subject: AiScoringQuestionContextScope["subject"];
  answerRecordPublicId: string;
  paperQuestionPublicId: string;
  questionPublicId: string;
  questionContext: unknown;
  questionText: string;
  standardAnswer: string;
  studentAnswer: string;
  maxScore: number;
  scoringPoints: AiScoringPointInput[];
  modelConfigSnapshot: ModelConfigSnapshot;
  promptTemplate: AiScoringPromptTemplateSnapshot;
  ragRetrievalResult: RagRetrievalResultDto;
  existingResult?: ExistingAiScoringResult | null;
  retryCount?: number;
};

export type AiScoringService = {
  scoreSubjectiveAnswer(
    context: AiScoringContext,
  ): Promise<ExistingAiScoringResult>;
};

export type AiScoringServiceDependencies = {
  runner: AiScoringRunner;
};

const scoringMaxRetryCount = 3;
const scoringFallbackNotAllowedReason = "scoring_fallback_not_allowed";
const scoringRunnerFailedReason = "scoring_runner_failed";
const invalidScoringResultReason = "invalid_scoring_result";
const invalidScoringQuestionContextReason = "invalid_scoring_question_context";

function createRequestSnapshot(context: AiScoringContext): unknown {
  return {
    questionText: context.questionText,
    standardAnswer: context.standardAnswer,
    studentAnswer: context.studentAnswer,
    scoringPoints: context.scoringPoints,
    ragEvidenceSummary: context.ragRetrievalResult.evidenceSummary,
  };
}

function createResponseSnapshot(result: unknown): unknown {
  return result;
}

function createPromptSnapshot(context: AiScoringContext): unknown {
  return {
    promptTemplateKey: context.promptTemplate.promptTemplateKey,
    promptTemplateVersion: context.promptTemplate.version,
    templateHash: context.promptTemplate.templateHash,
    questionPublicId: context.questionPublicId,
    answerRecordPublicId: context.answerRecordPublicId,
  };
}

function createAiCallLogDraft(input: {
  context: AiScoringContext;
  callStatus: AiCallStatus;
  modelOutput: unknown;
  providerRequestPayload: unknown;
  providerResponsePayload: unknown;
  providerErrorPayload: unknown;
  citations: RagCitationDto[];
}): AiScoringCallLogDraft {
  const redactedSnapshots = createAiCallLogRedactedSnapshots({
    prompt: createPromptSnapshot(input.context),
    userAnswer: input.context.studentAnswer,
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
      userAnswer: redactedSnapshots.userAnswer,
      providerRequestPayload: redactedSnapshots.providerRequestPayload,
      requestContext: createAiCallLogRedactedSnapshots({
        prompt: null,
        userAnswer: createRequestSnapshot(input.context),
        modelOutput: null,
        citations: [],
        providerRequestPayload: null,
        providerResponsePayload: null,
        providerErrorPayload: null,
      }).userAnswer,
    },
    responseRedactedSnapshot:
      input.callStatus === "success"
        ? {
            modelOutput: redactedSnapshots.modelOutput,
            providerResponsePayload: redactedSnapshots.providerResponsePayload,
            responseContext: createAiCallLogRedactedSnapshots({
              prompt: null,
              userAnswer: null,
              modelOutput: createResponseSnapshot(input.modelOutput),
              citations: [],
              providerRequestPayload: null,
              providerResponsePayload: null,
              providerErrorPayload: null,
            }).modelOutput,
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
      evidenceSummary: input.context.ragRetrievalResult.evidenceSummary,
    },
  };
}

function createAiScoringAttemptDraft(input: {
  context: AiScoringContext;
  status: AiScoringAttemptStatus;
  scoringStatus: AiScoringStatus;
  failureCode: string | null;
  failureMessage: unknown;
}): AiScoringAttemptDraft {
  return {
    status: input.status,
    failureCode: input.failureCode,
    failureMessageDigest:
      input.failureMessage === null
        ? null
        : createFailureMessageDigest(input.failureMessage),
    retryAfterAt: null,
    attemptSnapshot: createAiScoringAttemptSnapshot({
      answerRecordPublicId: input.context.answerRecordPublicId,
      mockExamPublicId: input.context.mockExamPublicId,
      questionPublicId: input.context.questionPublicId,
      modelConfigSnapshot: input.context.modelConfigSnapshot,
      promptTemplateKey: input.context.promptTemplate.promptTemplateKey,
      promptTemplateVersion: input.context.promptTemplate.version,
      evidenceStatus: input.context.ragRetrievalResult.evidenceStatus,
      citationCount: input.context.ragRetrievalResult.citations.length,
      scoringStatus: input.scoringStatus,
    }),
  };
}

function createBaseResult(
  context: AiScoringContext,
  overrides: Partial<ExistingAiScoringResult>,
): ExistingAiScoringResult {
  return {
    scoringStatus: "scored",
    totalScore: 0,
    maxScore: context.maxScore,
    retryCount: context.retryCount ?? 0,
    scoringPoints: [],
    overallComment: "",
    improvementSuggestion: null,
    modelConfigSnapshot: context.modelConfigSnapshot,
    promptTemplateKey: context.promptTemplate.promptTemplateKey,
    promptTemplateVersion: context.promptTemplate.version,
    evidenceStatus: context.ragRetrievalResult.evidenceStatus,
    citations: context.ragRetrievalResult.citations,
    aiCallLogDraft: null,
    aiScoringAttemptDraft: null,
    ...overrides,
  };
}

function createInvalidScoringResult(
  context: AiScoringContext,
  retryCount: number,
): ExistingAiScoringResult {
  return createBaseResult(context, {
    scoringStatus: "scoring_failed",
    retryCount: retryCount + 1,
    citations: [],
    failureReason: invalidScoringResultReason,
    aiScoringAttemptDraft: createAiScoringAttemptDraft({
      context,
      status: "failed",
      scoringStatus: "scoring_failed",
      failureCode: invalidScoringResultReason,
      failureMessage: null,
    }),
  });
}

function createInvalidScoringQuestionContextResult(
  context: AiScoringContext,
  retryCount: number,
): ExistingAiScoringResult {
  return createBaseResult(context, {
    scoringStatus: "scoring_failed",
    retryCount: retryCount + 1,
    citations: [],
    failureReason: invalidScoringQuestionContextReason,
    aiScoringAttemptDraft: createAiScoringAttemptDraft({
      context,
      status: "failed",
      scoringStatus: "scoring_failed",
      failureCode: invalidScoringQuestionContextReason,
      failureMessage: null,
    }),
  });
}

function isUnanswered(studentAnswer: string): boolean {
  return studentAnswer.trim().length === 0;
}

function hasReusableSuccessfulResult(
  existingResult: ExistingAiScoringResult | null | undefined,
): existingResult is ExistingAiScoringResult {
  return existingResult?.scoringStatus === "scored";
}

function canAttemptScoring(retryCount: number): boolean {
  return retryCount < scoringMaxRetryCount;
}

export function createAiScoringService(
  dependencies: AiScoringServiceDependencies,
): AiScoringService {
  return {
    async scoreSubjectiveAnswer(context) {
      if (hasReusableSuccessfulResult(context.existingResult)) {
        return context.existingResult;
      }

      const retryCount = context.retryCount ?? 0;

      try {
        validateAiScoringExpectedFacts({
          expectedScoringPoints: context.scoringPoints,
          questionMaxScore: context.maxScore,
        });
      } catch (error) {
        if (error instanceof AiScoringResultContractError) {
          return createInvalidScoringResult(context, retryCount);
        }
        throw error;
      }

      if (!canAttemptScoring(retryCount)) {
        return createBaseResult(context, {
          scoringStatus: "retry_limit_reached",
          retryCount,
          citations: [],
          failureReason: scoringRunnerFailedReason,
        });
      }

      if (context.modelConfigSnapshot.fallbackModelConfigPublicId !== null) {
        return createBaseResult(context, {
          scoringStatus: "scoring_failed",
          retryCount: retryCount + 1,
          citations: [],
          failureReason: scoringFallbackNotAllowedReason,
          aiScoringAttemptDraft: createAiScoringAttemptDraft({
            context,
            status: "failed",
            scoringStatus: "scoring_failed",
            failureCode: scoringFallbackNotAllowedReason,
            failureMessage: null,
          }),
        });
      }

      if (isUnanswered(context.studentAnswer)) {
        return createBaseResult(context, {
          scoringStatus: "scored",
          retryCount,
          totalScore: 0,
          citations: [],
          overallComment: "Unanswered subjective answer scored as zero.",
          aiScoringAttemptDraft: createAiScoringAttemptDraft({
            context,
            status: "succeeded",
            scoringStatus: "scored",
            failureCode: null,
            failureMessage: null,
          }),
          aiCallLogDraft: createAiCallLogDraft({
            context,
            callStatus: "success",
            modelOutput: {
              scoringStatus: "scored",
              totalScore: 0,
              reason: "unanswered",
            },
            providerRequestPayload: null,
            providerResponsePayload: null,
            providerErrorPayload: null,
            citations: [],
          }),
        });
      }

      const questionContext = normalizeAiScoringQuestionContext(
        context.questionContext,
        {
          paperQuestionPublicId: context.paperQuestionPublicId,
          questionPublicId: context.questionPublicId,
          profession: context.profession,
          level: context.level,
          subject: context.subject,
        },
      );

      if (questionContext === null) {
        return createInvalidScoringQuestionContextResult(context, retryCount);
      }

      try {
        const runnerResult = await dependencies.runner({
          questionContext,
          questionText: context.questionText,
          standardAnswer: context.standardAnswer,
          studentAnswer: context.studentAnswer,
          scoringPoints: context.scoringPoints,
          ragRetrievalResult: context.ragRetrievalResult,
          modelConfigSnapshot: context.modelConfigSnapshot,
          promptTemplate: context.promptTemplate,
        });
        const { scoringPoints, totalScore } = normalizeAiScoringPointResults({
          expectedScoringPoints: context.scoringPoints,
          actualScoringPoints: runnerResult.scoringPoints,
          questionMaxScore: context.maxScore,
        });
        const resultSnapshot = {
          scoringPoints,
          totalScore,
          overallComment: runnerResult.overallComment,
          improvementSuggestion: runnerResult.improvementSuggestion,
        };

        return createBaseResult(context, {
          scoringStatus: "scored",
          retryCount: retryCount + 1,
          totalScore,
          scoringPoints,
          overallComment: runnerResult.overallComment,
          improvementSuggestion: runnerResult.improvementSuggestion,
          citations:
            context.ragRetrievalResult.evidenceStatus === "sufficient"
              ? context.ragRetrievalResult.citations
              : [],
          aiCallLogDraft: createAiCallLogDraft({
            context,
            callStatus: "success",
            modelOutput: resultSnapshot,
            providerRequestPayload: runnerResult.providerRequestPayload,
            providerResponsePayload: runnerResult.providerResponsePayload,
            providerErrorPayload: null,
            citations: context.ragRetrievalResult.citations,
          }),
          aiScoringAttemptDraft: createAiScoringAttemptDraft({
            context,
            status: "succeeded",
            scoringStatus: "scored",
            failureCode: null,
            failureMessage: null,
          }),
        });
      } catch (error) {
        const nextRetryCount = retryCount + 1;
        const failureReason =
          error instanceof AiScoringResultContractError
            ? invalidScoringResultReason
            : scoringRunnerFailedReason;
        const providerErrorPayload =
          error instanceof AiScoringResultContractError
            ? { code: invalidScoringResultReason }
            : error instanceof Error
              ? { message: error.message, name: error.name }
              : error;

        return createBaseResult(context, {
          scoringStatus: "scoring_failed",
          retryCount: nextRetryCount,
          citations: [],
          failureReason,
          aiScoringAttemptDraft: createAiScoringAttemptDraft({
            context,
            status: "failed",
            scoringStatus: "scoring_failed",
            failureCode: failureReason,
            failureMessage: providerErrorPayload,
          }),
          aiCallLogDraft: createAiCallLogDraft({
            context,
            callStatus: "failed",
            modelOutput: null,
            providerRequestPayload: null,
            providerResponsePayload: null,
            providerErrorPayload,
            citations: [],
          }),
        });
      }
    },
  };
}

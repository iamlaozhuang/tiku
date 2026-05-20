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
  failureReason?: string;
};

export type AiScoringContext = {
  userPublicId: string;
  mockExamPublicId: string;
  answerRecordPublicId: string;
  questionPublicId: string;
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

function roundToHalfPoint(score: number): number {
  return Math.round(score * 2) / 2;
}

function clampScore(score: number, maxScore: number): number {
  return Math.min(Math.max(score, 0), maxScore);
}

function normalizeScoringPointResults(
  context: AiScoringContext,
  runnerResult: AiScoringRunnerResult,
): AiScoringPointResult[] {
  const scoringPointMaxScoreByPublicId = new Map(
    context.scoringPoints.map((scoringPoint) => [
      scoringPoint.scoringPointPublicId,
      scoringPoint.maxScore,
    ]),
  );

  return runnerResult.scoringPoints.map((scoringPoint) => {
    const scoringPointMaxScore =
      scoringPointMaxScoreByPublicId.get(scoringPoint.scoringPointPublicId) ??
      0;

    return {
      scoringPointPublicId: scoringPoint.scoringPointPublicId,
      isHit: scoringPoint.isHit,
      score: clampScore(
        roundToHalfPoint(scoringPoint.score),
        scoringPointMaxScore,
      ),
      reason: scoringPoint.reason,
    };
  });
}

function sumScore(scoringPoints: AiScoringPointResult[]): number {
  return scoringPoints.reduce(
    (totalScore, scoringPoint) => totalScore + scoringPoint.score,
    0,
  );
}

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
    providerRequestPayload: input.providerRequestPayload,
    providerResponsePayload: input.providerResponsePayload,
    providerErrorPayload: input.providerErrorPayload,
  });

  return {
    callStatus: input.callStatus,
    modelConfigSnapshot: input.context.modelConfigSnapshot,
    promptTemplateKey: input.context.promptTemplate.promptTemplateKey,
    promptTemplateVersion: input.context.promptTemplate.version,
    requestRedactedSnapshot: {
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
    ...overrides,
  };
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
        });
      }

      if (isUnanswered(context.studentAnswer)) {
        return createBaseResult(context, {
          scoringStatus: "scored",
          retryCount,
          totalScore: 0,
          citations: [],
          overallComment: "Unanswered subjective answer scored as zero.",
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

      try {
        const runnerResult = await dependencies.runner({
          questionText: context.questionText,
          standardAnswer: context.standardAnswer,
          studentAnswer: context.studentAnswer,
          scoringPoints: context.scoringPoints,
          ragRetrievalResult: context.ragRetrievalResult,
          modelConfigSnapshot: context.modelConfigSnapshot,
          promptTemplate: context.promptTemplate,
        });
        const scoringPoints = normalizeScoringPointResults(
          context,
          runnerResult,
        );
        const totalScore = clampScore(
          sumScore(scoringPoints),
          context.maxScore,
        );
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
        });
      } catch (error) {
        const nextRetryCount = retryCount + 1;

        return createBaseResult(context, {
          scoringStatus: "scoring_failed",
          retryCount: nextRetryCount,
          citations: [],
          failureReason: scoringRunnerFailedReason,
          aiCallLogDraft: createAiCallLogDraft({
            context,
            callStatus: "failed",
            modelOutput: null,
            providerRequestPayload: null,
            providerResponsePayload: null,
            providerErrorPayload:
              error instanceof Error
                ? { message: error.message, name: error.name }
                : error,
            citations: [],
          }),
        });
      }
    },
  };
}

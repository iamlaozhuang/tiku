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

export type AiExplanationCallLogDraft = {
  callStatus: AiCallStatus;
  modelConfigSnapshot: ModelConfigSnapshot;
  promptTemplateKey: string;
  promptTemplateVersion: number;
  requestRedactedSnapshot: RedactedJsonObject;
  responseRedactedSnapshot: RedactedJsonObject | null;
  errorRedactedSnapshot: RedactedJsonObject | null;
  citationRedactedSnapshot: RedactedJsonObject | null;
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
};

const insufficientEvidenceMessage =
  "RAG evidence is insufficient; no citation is attached.";
const explanationUnavailableText = "AI explanation is temporarily unavailable.";
const hintUnavailableText = "AI hint is temporarily unavailable.";
const answerWithheldHintText =
  "Focus on the missing reasoning steps instead of reading the final answer.";

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
    providerRequestPayload: input.providerRequestPayload,
    providerResponsePayload: input.providerResponsePayload,
    providerErrorPayload: input.providerErrorPayload,
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

      try {
        const runnerResult = await dependencies.explanationRunner({
          questionText: context.questionText,
          standardAnswer: context.standardAnswer,
          analysis: context.analysis,
          learnerAnswer: context.learnerAnswer,
          isCorrect: context.isCorrect,
          triggerReason: context.triggerReason,
          ragRetrievalResult: context.ragRetrievalResult,
          modelConfigSnapshot: context.modelConfigSnapshot,
          promptTemplate: context.promptTemplate,
        });
        const modelOutput = {
          explanationText: runnerResult.explanationText,
          keyPoints: runnerResult.keyPoints,
          learningSuggestion: runnerResult.learningSuggestion,
        };

        return {
          explanationStatus: "explained",
          explanationText: runnerResult.explanationText,
          keyPoints: runnerResult.keyPoints,
          learningSuggestion: runnerResult.learningSuggestion,
          insufficientEvidenceMessage: getInsufficientEvidenceMessage(
            context.ragRetrievalResult,
          ),
          modelConfigSnapshot: context.modelConfigSnapshot,
          promptTemplateKey: context.promptTemplate.promptTemplateKey,
          promptTemplateVersion: context.promptTemplate.version,
          evidenceStatus: context.ragRetrievalResult.evidenceStatus,
          citations,
          aiCallLogDraft: createAiCallLogDraft({
            modelConfigSnapshot: context.modelConfigSnapshot,
            promptTemplateKey: context.promptTemplate.promptTemplateKey,
            promptTemplateVersion: context.promptTemplate.version,
            promptTemplateHash: context.promptTemplate.templateHash,
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
          }),
        };
      } catch (error) {
        return {
          explanationStatus: "explanation_unavailable",
          explanationText: explanationUnavailableText,
          keyPoints: [],
          learningSuggestion: null,
          insufficientEvidenceMessage: getInsufficientEvidenceMessage(
            context.ragRetrievalResult,
          ),
          modelConfigSnapshot: context.modelConfigSnapshot,
          promptTemplateKey: context.promptTemplate.promptTemplateKey,
          promptTemplateVersion: context.promptTemplate.version,
          evidenceStatus: context.ragRetrievalResult.evidenceStatus,
          citations: [],
          aiCallLogDraft: createAiCallLogDraft({
            modelConfigSnapshot: context.modelConfigSnapshot,
            promptTemplateKey: context.promptTemplate.promptTemplateKey,
            promptTemplateVersion: context.promptTemplate.version,
            promptTemplateHash: context.promptTemplate.templateHash,
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
          }),
        };
      }
    },

    async generateSubjectiveHint(context) {
      const citations = getAttachableCitations(context.ragRetrievalResult);

      try {
        const runnerResult = await dependencies.hintRunner({
          questionText: context.questionText,
          studentAnswer: context.studentAnswer,
          scoringPointLabels: context.scoringPointLabels,
          ragRetrievalResult: context.ragRetrievalResult,
          modelConfigSnapshot: context.modelConfigSnapshot,
          promptTemplate: context.promptTemplate,
        });
        const hintText = sanitizeHintText(
          runnerResult.hintText,
          context.standardAnswer,
        );
        const modelOutput = {
          hintText,
          improvementDirections: runnerResult.improvementDirections,
        };

        return {
          hintStatus: "hinted",
          hintText,
          improvementDirections: runnerResult.improvementDirections,
          insufficientEvidenceMessage: getInsufficientEvidenceMessage(
            context.ragRetrievalResult,
          ),
          modelConfigSnapshot: context.modelConfigSnapshot,
          promptTemplateKey: context.promptTemplate.promptTemplateKey,
          promptTemplateVersion: context.promptTemplate.version,
          evidenceStatus: context.ragRetrievalResult.evidenceStatus,
          citations,
          aiCallLogDraft: createAiCallLogDraft({
            modelConfigSnapshot: context.modelConfigSnapshot,
            promptTemplateKey: context.promptTemplate.promptTemplateKey,
            promptTemplateVersion: context.promptTemplate.version,
            promptTemplateHash: context.promptTemplate.templateHash,
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
          }),
        };
      } catch (error) {
        return {
          hintStatus: "hint_unavailable",
          hintText: hintUnavailableText,
          improvementDirections: [],
          insufficientEvidenceMessage: getInsufficientEvidenceMessage(
            context.ragRetrievalResult,
          ),
          modelConfigSnapshot: context.modelConfigSnapshot,
          promptTemplateKey: context.promptTemplate.promptTemplateKey,
          promptTemplateVersion: context.promptTemplate.version,
          evidenceStatus: context.ragRetrievalResult.evidenceStatus,
          citations: [],
          aiCallLogDraft: createAiCallLogDraft({
            modelConfigSnapshot: context.modelConfigSnapshot,
            promptTemplateKey: context.promptTemplate.promptTemplateKey,
            promptTemplateVersion: context.promptTemplate.version,
            promptTemplateHash: context.promptTemplate.templateHash,
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
          }),
        };
      }
    },
  };
}

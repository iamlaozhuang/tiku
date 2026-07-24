import type {
  AiGenerationRouteIntegratedQuestionDraftSummary,
  AiGenerationRouteIntegratedQuestionOptionDraft,
  AiGenerationRouteIntegratedStructuredPreview,
} from "../contracts/route-integrated-provider-execution-contract";
import type {
  PersonalAiGenerationLearningPaperSourceQuestionDto,
  PersonalAiGenerationLearningFormalWriteBoundaryDto,
  PersonalAiGenerationLearningSessionQuestionDto,
  PersonalAiGenerationLearningSessionQuestionOptionDto,
} from "../contracts/personal-ai-generation-learning-session-contract";
import type { PersonalAiGenerationLearningSessionQuestionType } from "../models/personal-ai-generation-learning-session";
import type { PersonalAiGenerationLearningSessionAnswerFeedbackDto } from "../contracts/personal-ai-generation-learning-session-contract";
import { createHash } from "node:crypto";

const PERSONAL_AI_LEARNING_ANSWER_COMMAND_SCHEMA_VERSION = 1;
const MAX_PERSONAL_AI_LEARNING_ANSWER_REVISION = 2_147_483_647;

const questionTypeAliases: Record<
  string,
  PersonalAiGenerationLearningSessionQuestionType
> = {
  calculation: "calculation",
  case_analysis: "case_analysis",
  fill_blank: "fill_blank",
  multi_choice: "multi_choice",
  short_answer: "short_answer",
  single_choice: "single_choice",
  true_false: "true_false",
};

export function createBlockedPersonalAiLearningFormalWriteBoundary(): PersonalAiGenerationLearningFormalWriteBoundaryDto {
  return {
    questionWriteStatus: "blocked",
    paperWriteStatus: "blocked",
    practiceWriteStatus: "blocked",
    answerRecordWriteStatus: "blocked",
    examReportWriteStatus: "blocked",
    mistakeBookWriteStatus: "blocked",
  };
}

export function normalizePersonalAiLearningQuestionType(
  questionType: string | null,
): PersonalAiGenerationLearningSessionQuestionType | null {
  const normalizedQuestionType = questionType?.trim().toLowerCase();

  if (!normalizedQuestionType) {
    return null;
  }

  return questionTypeAliases[normalizedQuestionType] ?? null;
}

export function normalizePersonalAiLearningLabels(labels: string[]): string[] {
  return Array.from(
    new Set(
      labels
        .map((label) => label.trim().toUpperCase())
        .filter((label) => label.length > 0),
    ),
  ).sort((left, right) => (left < right ? -1 : left > right ? 1 : 0));
}

type PersonalAiLearningAnswerCommandInput = {
  expectedAnswerRevision: number;
  answerFeedback: PersonalAiGenerationLearningSessionAnswerFeedbackDto;
};

export function createPersonalAiLearningAnswerCommandCanonicalFacts(
  input: PersonalAiLearningAnswerCommandInput,
) {
  const { answerFeedback, expectedAnswerRevision } = input;
  const formalWriteBoundary = projectBlockedFormalWriteBoundary(
    answerFeedback.formalWriteBoundary,
  );

  if (
    !hasExactKeys(answerFeedback, [
      "actorPublicId",
      "aiScoringStatus",
      "analysis",
      "answerRevision",
      "blockReason",
      "formalWriteBoundary",
      "isCorrect",
      "maxScore",
      "mistakeBookPublicId",
      "score",
      "selectedOptionLabels",
      "sessionPublicId",
      "sessionQuestionPublicId",
      "standardAnswerLabels",
      "standardAnswerText",
      "status",
      "submittedAt",
      "textAnswer",
    ]) ||
    !Number.isInteger(expectedAnswerRevision) ||
    expectedAnswerRevision < 0 ||
    expectedAnswerRevision >= MAX_PERSONAL_AI_LEARNING_ANSWER_REVISION ||
    answerFeedback.answerRevision !== expectedAnswerRevision + 1 ||
    answerFeedback.status === "blocked" ||
    answerFeedback.blockReason !== null ||
    !isNonEmptyBoundedText(answerFeedback.sessionPublicId) ||
    !isNonEmptyBoundedText(answerFeedback.sessionQuestionPublicId) ||
    !isNonEmptyBoundedText(answerFeedback.actorPublicId) ||
    !isCanonicalAnswerLabelArray(answerFeedback.selectedOptionLabels) ||
    !isCanonicalAnswerLabelArray(answerFeedback.standardAnswerLabels) ||
    !isNullableBoundedText(answerFeedback.textAnswer) ||
    !isNullableBoundedText(answerFeedback.standardAnswerText) ||
    !isNullableBoundedText(answerFeedback.analysis) ||
    !isNullableBoundedText(answerFeedback.score) ||
    !isNullableBoundedText(answerFeedback.maxScore) ||
    !isValidAnswerFeedbackSemantics(answerFeedback) ||
    !isValidIsoTimestamp(answerFeedback.submittedAt) ||
    answerFeedback.aiScoringStatus !== "blocked" ||
    answerFeedback.mistakeBookPublicId !== null ||
    formalWriteBoundary === null
  ) {
    return null;
  }

  return {
    schemaVersion: PERSONAL_AI_LEARNING_ANSWER_COMMAND_SCHEMA_VERSION,
    sessionPublicId: answerFeedback.sessionPublicId,
    sessionQuestionPublicId: answerFeedback.sessionQuestionPublicId,
    actorPublicId: answerFeedback.actorPublicId,
    expectedAnswerRevision,
    answer: {
      selectedOptionLabels: [...answerFeedback.selectedOptionLabels],
      textAnswer: answerFeedback.textAnswer,
      feedbackStatus: answerFeedback.status,
      isCorrect: answerFeedback.isCorrect,
      score: answerFeedback.score,
      maxScore: answerFeedback.maxScore,
      standardAnswerLabels: [...answerFeedback.standardAnswerLabels],
      standardAnswerText: answerFeedback.standardAnswerText,
      analysis: answerFeedback.analysis,
      aiScoringStatus: answerFeedback.aiScoringStatus,
      formalWriteBoundary,
      mistakeBookPublicId: answerFeedback.mistakeBookPublicId,
    },
  };
}

export function createPersonalAiLearningAnswerCommandDigest(
  input: PersonalAiLearningAnswerCommandInput,
): string | null {
  const canonicalCommand =
    createPersonalAiLearningAnswerCommandCanonicalFacts(input);

  if (canonicalCommand === null) {
    return null;
  }

  return createHash("sha256")
    .update(JSON.stringify(canonicalCommand), "utf8")
    .digest("hex");
}

function isCanonicalAnswerLabelArray(value: unknown): value is string[] {
  if (!Array.isArray(value) || value.length > 100) {
    return false;
  }

  for (let index = 0; index < value.length; index += 1) {
    if (!Object.hasOwn(value, index)) {
      return false;
    }

    const label = value[index];

    if (
      typeof label !== "string" ||
      label.length === 0 ||
      label.length > 100 ||
      label !== label.trim().toUpperCase()
    ) {
      return false;
    }

    if (index > 0 && value[index - 1]! >= label) {
      return false;
    }
  }

  return true;
}

function isNonEmptyBoundedText(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= 4_000 &&
    value === value.trim()
  );
}

function isNullableBoundedText(value: unknown): value is string | null {
  return value === null || (typeof value === "string" && value.length <= 4_000);
}

function projectBlockedFormalWriteBoundary(
  value: PersonalAiGenerationLearningSessionAnswerFeedbackDto["formalWriteBoundary"],
):
  | PersonalAiGenerationLearningSessionAnswerFeedbackDto["formalWriteBoundary"]
  | null {
  if (
    !hasExactKeys(value, [
      "answerRecordWriteStatus",
      "examReportWriteStatus",
      "mistakeBookWriteStatus",
      "paperWriteStatus",
      "practiceWriteStatus",
      "questionWriteStatus",
    ]) ||
    value.questionWriteStatus !== "blocked" ||
    value.paperWriteStatus !== "blocked" ||
    value.practiceWriteStatus !== "blocked" ||
    value.answerRecordWriteStatus !== "blocked" ||
    value.examReportWriteStatus !== "blocked" ||
    value.mistakeBookWriteStatus !== "blocked"
  ) {
    return null;
  }

  return {
    questionWriteStatus: value.questionWriteStatus,
    paperWriteStatus: value.paperWriteStatus,
    practiceWriteStatus: value.practiceWriteStatus,
    answerRecordWriteStatus: value.answerRecordWriteStatus,
    examReportWriteStatus: value.examReportWriteStatus,
    mistakeBookWriteStatus: value.mistakeBookWriteStatus,
  };
}

function isValidAnswerFeedbackSemantics(
  answerFeedback: PersonalAiGenerationLearningSessionAnswerFeedbackDto,
): boolean {
  if (answerFeedback.status === "scored") {
    return (
      typeof answerFeedback.isCorrect === "boolean" &&
      answerFeedback.textAnswer === null &&
      answerFeedback.score !== null &&
      answerFeedback.maxScore !== null &&
      isValidScore(answerFeedback.score) &&
      isValidScore(answerFeedback.maxScore) &&
      Number(answerFeedback.score) <= Number(answerFeedback.maxScore)
    );
  }

  return (
    answerFeedback.status === "submitted_review_required" &&
    answerFeedback.isCorrect === null &&
    answerFeedback.selectedOptionLabels.length === 0 &&
    answerFeedback.textAnswer !== null &&
    answerFeedback.textAnswer.trim().length > 0 &&
    answerFeedback.score === null &&
    answerFeedback.maxScore !== null &&
    isValidScore(answerFeedback.maxScore)
  );
}

function isValidScore(value: string): boolean {
  const score = Number(value);

  return Number.isFinite(score) && score >= 0;
}

function isValidIsoTimestamp(value: unknown): value is string {
  return (
    typeof value === "string" &&
    Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString() === value
  );
}

function hasExactKeys(
  value: unknown,
  expectedKeys: readonly string[],
): boolean {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const actualKeys = Object.keys(value).sort();
  const sortedExpectedKeys = [...expectedKeys].sort();

  return (
    actualKeys.length === sortedExpectedKeys.length &&
    actualKeys.every((key, index) => key === sortedExpectedKeys[index])
  );
}

export function collectPersonalAiLearningQuestionDrafts(
  structuredPreview: AiGenerationRouteIntegratedStructuredPreview,
): AiGenerationRouteIntegratedQuestionDraftSummary[] | null {
  if (structuredPreview.parseStatus !== "parsed") {
    return null;
  }

  if (structuredPreview.kind === "question_set") {
    return structuredPreview.draftSummaries;
  }

  return structuredPreview.paperSectionSummaries.flatMap(
    (paperSectionSummary) => paperSectionSummary.questionDrafts,
  );
}

export function createPersonalAiLearningSessionQuestion(input: {
  sessionPublicId: string;
  usableQuestionIndex: number;
  draft: AiGenerationRouteIntegratedQuestionDraftSummary;
}): PersonalAiGenerationLearningSessionQuestionDto | null {
  const questionType = normalizePersonalAiLearningQuestionType(
    input.draft.questionType,
  );
  const questionStem = normalizeNullableText(input.draft.questionStem);

  if (questionType === null || questionStem === null) {
    return null;
  }

  const questionOptions = normalizeQuestionOptions(
    input.draft.questionOptions ?? [],
  );
  const standardAnswerText = normalizeNullableText(input.draft.standardAnswer);

  if (questionOptions.length !== (input.draft.questionOptions?.length ?? 0)) {
    return null;
  }

  return {
    sessionQuestionPublicId: `${input.sessionPublicId}_q_${input.usableQuestionIndex}`,
    sourceDraftNumber: input.draft.draftNumber,
    questionType,
    difficulty: normalizeNullableText(input.draft.difficulty),
    knowledgeNodeLabels: normalizeKnowledgeNodeLabels(
      input.draft.knowledgeNodeLabels ?? [],
    ),
    questionStem,
    questionOptions,
    standardAnswerLabels: resolveStandardAnswerLabels({
      questionType,
      questionOptions,
      standardAnswerText,
    }),
    standardAnswerText,
    analysis: normalizeNullableText(input.draft.analysis),
    maxScore: "1.0",
    reviewStatus: "draft_review_required",
  };
}

export function createPersonalAiLearningSessionQuestionFromPaperSource(input: {
  sessionPublicId: string;
  usableQuestionIndex: number;
  sourceQuestion: PersonalAiGenerationLearningPaperSourceQuestionDto;
  selectedScore: number;
}): PersonalAiGenerationLearningSessionQuestionDto | null {
  const questionType = normalizePersonalAiLearningQuestionType(
    input.sourceQuestion.questionType,
  );
  const questionStem = normalizeNullableText(input.sourceQuestion.questionStem);

  if (questionType === null || questionStem === null) {
    return null;
  }

  const questionOptions = normalizeLearningQuestionOptions(
    input.sourceQuestion.questionOptions,
  );
  const standardAnswerText = normalizeNullableText(
    input.sourceQuestion.standardAnswerText,
  );
  const normalizedStandardAnswerLabels = normalizePersonalAiLearningLabels(
    input.sourceQuestion.standardAnswerLabels,
  );

  return {
    sessionQuestionPublicId: `${input.sessionPublicId}_q_${input.usableQuestionIndex}`,
    sourceDraftNumber: input.usableQuestionIndex,
    questionType,
    difficulty: normalizeNullableText(input.sourceQuestion.difficulty),
    knowledgeNodeLabels: normalizeKnowledgeNodeLabels(
      input.sourceQuestion.knowledgeNodeLabels,
    ),
    questionStem,
    questionOptions,
    standardAnswerLabels:
      normalizedStandardAnswerLabels.length > 0
        ? normalizedStandardAnswerLabels
        : resolveStandardAnswerLabels({
            questionType,
            questionOptions,
            standardAnswerText,
          }),
    standardAnswerText,
    analysis: normalizeNullableText(input.sourceQuestion.analysis),
    maxScore: formatSelectedPaperScore(input.selectedScore),
    reviewStatus: "draft_review_required",
  };
}

function normalizeQuestionOptions(
  questionOptions: AiGenerationRouteIntegratedQuestionOptionDraft[],
): PersonalAiGenerationLearningSessionQuestionOptionDto[] {
  return normalizeLearningQuestionOptions(questionOptions);
}

function normalizeLearningQuestionOptions(
  questionOptions: {
    optionLabel: string | null | undefined;
    optionText: string | null | undefined;
    isCorrect?: boolean | null | undefined;
  }[],
): PersonalAiGenerationLearningSessionQuestionOptionDto[] {
  return questionOptions
    .map((questionOption) => {
      const optionLabel = normalizeNullableText(questionOption.optionLabel);
      const optionText = normalizeNullableText(questionOption.optionText);

      if (optionLabel === null || optionText === null) {
        return null;
      }

      return {
        optionLabel: optionLabel.toUpperCase(),
        optionText,
        isCorrect: questionOption.isCorrect ?? null,
      };
    })
    .filter(
      (
        questionOption,
      ): questionOption is PersonalAiGenerationLearningSessionQuestionOptionDto =>
        questionOption !== null,
    );
}

function formatSelectedPaperScore(score: number): string {
  return Number.isFinite(score) ? score.toFixed(1) : "0.0";
}

function resolveStandardAnswerLabels(input: {
  questionType: PersonalAiGenerationLearningSessionQuestionType;
  questionOptions: PersonalAiGenerationLearningSessionQuestionOptionDto[];
  standardAnswerText: string | null;
}): string[] {
  const correctOptionLabels = input.questionOptions
    .filter((questionOption) => questionOption.isCorrect === true)
    .map((questionOption) => questionOption.optionLabel);

  if (correctOptionLabels.length > 0) {
    return normalizePersonalAiLearningLabels(correctOptionLabels);
  }

  if (input.standardAnswerText === null) {
    return [];
  }

  if (input.questionType === "true_false") {
    const normalizedAnswer = input.standardAnswerText.trim().toUpperCase();

    return normalizedAnswer === "TRUE" || normalizedAnswer === "FALSE"
      ? [normalizedAnswer]
      : [];
  }

  const separatedLabels = input.standardAnswerText.match(/[A-H](?![a-z])/gi);

  return normalizePersonalAiLearningLabels(separatedLabels ?? []);
}

function normalizeKnowledgeNodeLabels(knowledgeNodeLabels: string[]): string[] {
  return Array.from(
    new Set(
      knowledgeNodeLabels
        .map((knowledgeNodeLabel) => knowledgeNodeLabel.trim())
        .filter((knowledgeNodeLabel) => knowledgeNodeLabel.length > 0),
    ),
  );
}

function normalizeNullableText(
  value: string | null | undefined,
): string | null {
  const normalizedValue = value?.trim();

  return normalizedValue && normalizedValue.length > 0 ? normalizedValue : null;
}

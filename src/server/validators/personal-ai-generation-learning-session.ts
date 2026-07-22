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
  ).sort((left, right) => left.localeCompare(right));
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

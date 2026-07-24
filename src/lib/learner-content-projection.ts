import type {
  PersonalAiGenerationLearningSessionDto,
  PersonalAiGenerationLearningSessionPublicQuestionDto,
  PersonalAiGenerationLearningSessionQuestionDto,
} from "@/server/contracts/personal-ai-generation-learning-session-contract";

const TEACHER_ONLY_QUESTION_KEYS = new Set([
  "analysis",
  "analysisRichText",
  "correctAnswer",
  "fillBlankAnswers",
  "isCorrect",
  "referenceAnswer",
  "scoringPoints",
  "standardAnswer",
  "standardAnswerLabels",
  "standardAnswerRichText",
  "standardAnswerText",
]);

function projectValue(value: unknown, insideQuestion: boolean): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => projectValue(item, insideQuestion));
  }

  if (typeof value !== "object" || value === null) {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).flatMap(([key, nestedValue]) => {
      if (insideQuestion && TEACHER_ONLY_QUESTION_KEYS.has(key)) {
        return [];
      }

      const nestedInsideQuestion = insideQuestion || key === "paperQuestions";

      return [[key, projectValue(nestedValue, nestedInsideQuestion)]];
    }),
  );
}

export function projectPaperSnapshotForLearner(
  paperSnapshot: Record<string, unknown>,
): Record<string, unknown> {
  return projectValue(paperSnapshot, false) as Record<string, unknown>;
}

export function projectPersonalAiLearningSessionForLearner(
  session: PersonalAiGenerationLearningSessionDto,
): PersonalAiGenerationLearningSessionDto {
  return {
    ...session,
    questions: session.questions.map((question) => ({
      ...projectPersonalAiLearningQuestionForLearner(question),
      questionOptions: question.questionOptions.map((questionOption) => ({
        ...questionOption,
        isCorrect: null,
      })),
      standardAnswerLabels: [],
      standardAnswerText: null,
      analysis: null,
    })),
  };
}

export function projectPersonalAiLearningQuestionForLearner(
  question: PersonalAiGenerationLearningSessionQuestionDto,
): PersonalAiGenerationLearningSessionPublicQuestionDto {
  return {
    sessionQuestionPublicId: question.sessionQuestionPublicId,
    sourceDraftNumber: question.sourceDraftNumber,
    questionType: question.questionType,
    difficulty: question.difficulty,
    knowledgeNodeLabels: [...question.knowledgeNodeLabels],
    questionStem: question.questionStem,
    questionOptions: question.questionOptions.map((questionOption) => ({
      optionLabel: questionOption.optionLabel,
      optionText: questionOption.optionText,
    })),
    maxScore: question.maxScore,
    reviewStatus: question.reviewStatus,
    ...(question.questionGroup === null || question.questionGroup === undefined
      ? {}
      : {
          questionGroup: {
            ...question.questionGroup,
            materialSnapshot: {
              ...question.questionGroup.materialSnapshot,
            },
            memberQuestionPublicIds: [
              ...question.questionGroup.memberQuestionPublicIds,
            ],
          },
        }),
  };
}

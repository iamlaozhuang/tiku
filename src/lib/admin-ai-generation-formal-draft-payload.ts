import type {
  AdminAiGenerationFormalQuestionDraftPayload,
  AdminAiGenerationFormalReviewedDraftPayload,
} from "@/server/contracts/admin-ai-generation-formal-draft-adapter-contract";
import type {
  AdminAiGenerationLocalContractBaseDto,
  AdminAiGenerationLocalContractDto,
} from "@/server/contracts/admin-ai-generation-local-contract";
import type {
  AiGenerationRouteIntegratedGenerationParameters,
  AiGenerationRouteIntegratedQuestionDraftSummary,
} from "@/server/contracts/route-integrated-provider-execution-contract";
import type {
  MultiChoiceRule,
  PaperType,
  Profession,
  QuestionType,
  ScoringMethod,
  Subject,
} from "@/server/models/paper";

type ContentAdminFormalReviewedDraftLocalContract =
  | AdminAiGenerationLocalContractBaseDto
  | AdminAiGenerationLocalContractDto;

type CreateContentAdminFormalReviewedDraftPayloadInput = {
  localContractSummary: ContentAdminFormalReviewedDraftLocalContract | null;
  generationParameters: AiGenerationRouteIntegratedGenerationParameters;
  requestedAt: string;
};

export type { AdminAiGenerationFormalReviewedDraftPayload };

const formalQuestionTypes = [
  "single_choice",
  "multi_choice",
  "true_false",
  "fill_blank",
  "short_answer",
  "case_analysis",
  "calculation",
] as const satisfies readonly QuestionType[];

const objectiveQuestionTypes = new Set<QuestionType>([
  "single_choice",
  "multi_choice",
  "true_false",
  "fill_blank",
]);

export function createContentAdminFormalReviewedDraftPayload({
  localContractSummary,
  generationParameters,
  requestedAt,
}: CreateContentAdminFormalReviewedDraftPayloadInput): AdminAiGenerationFormalReviewedDraftPayload | null {
  if (localContractSummary?.workspace !== "content") {
    return null;
  }

  const structuredPreview =
    localContractSummary.runtimeBridge.visibleGeneratedContent
      ?.structuredPreview;

  if (structuredPreview?.parseStatus !== "parsed") {
    return null;
  }

  if (
    localContractSummary.generationKind === "question" &&
    structuredPreview.kind === "question_set"
  ) {
    const questionDraft = structuredPreview.draftSummaries
      .map((draftSummary) =>
        createFormalQuestionDraftPayload(draftSummary, generationParameters),
      )
      .find((payload) => payload !== null);

    return questionDraft ?? null;
  }

  if (
    localContractSummary.generationKind === "paper" &&
    structuredPreview.kind === "paper_draft"
  ) {
    const paperSections = structuredPreview.paperSectionSummaries
      .map((paperSection, paperSectionIndex) => {
        const paperQuestions = paperSection.questionDrafts
          .map((questionDraft, questionIndex) => {
            const companionQuestionDraft = createFormalQuestionDraftPayload(
              questionDraft,
              generationParameters,
            );

            if (companionQuestionDraft === null) {
              return null;
            }

            return {
              questionPublicId: null,
              companionQuestionDraft,
              score: "1.0",
              sortOrder: questionIndex + 1,
              questionGroup: null,
            };
          })
          .filter((paperQuestion) => paperQuestion !== null);

        if (paperQuestions.length === 0) {
          return null;
        }

        return {
          title:
            normalizeRequiredText(paperSection.title) ??
            `第${paperSectionIndex + 1}大题`,
          description: normalizeOptionalText(paperSection.description),
          sortOrder: paperSectionIndex + 1,
          paperQuestions,
        };
      })
      .filter((paperSection) => paperSection !== null);

    if (paperSections.length === 0) {
      return null;
    }

    return {
      name: createContentAdminFormalPaperDraftName(requestedAt),
      profession: generationParameters.profession as Profession,
      level: generationParameters.level,
      subject: generationParameters.subject as Subject,
      paperType: "mock_paper" satisfies PaperType,
      year: null,
      source: "content_ai_generation",
      durationMinute: null,
      totalScore: null,
      paperSections,
    };
  }

  return null;
}

function createFormalQuestionDraftPayload(
  questionDraft: AiGenerationRouteIntegratedQuestionDraftSummary,
  generationParameters: AiGenerationRouteIntegratedGenerationParameters,
): AdminAiGenerationFormalQuestionDraftPayload | null {
  const stemRichText = normalizeRequiredText(questionDraft.questionStem);
  const standardAnswerRichText = normalizeRequiredText(
    questionDraft.standardAnswer,
  );
  const analysisRichText = normalizeRequiredText(questionDraft.analysis);

  if (
    stemRichText === null ||
    standardAnswerRichText === null ||
    analysisRichText === null
  ) {
    return null;
  }

  const questionType = normalizeQuestionType(
    questionDraft.questionType ?? generationParameters.questionType,
  );

  return {
    questionType,
    profession: generationParameters.profession as Profession,
    level: generationParameters.level,
    subject: generationParameters.subject as Subject,
    stemRichText,
    analysisRichText,
    standardAnswerRichText,
    multiChoiceRule: "all_correct_only" satisfies MultiChoiceRule,
    scoringMethod: resolveScoringMethod(questionType),
    materialPublicId: null,
    questionOptions: createQuestionOptions(
      questionDraft,
      standardAnswerRichText,
    ),
    scoringPoints: [],
    fillBlankAnswers:
      questionType === "fill_blank"
        ? createFillBlankAnswers(standardAnswerRichText)
        : [],
    knowledgeNodePublicIds: [],
    tagPublicIds: [],
  };
}

function normalizeQuestionType(value: string | null | undefined): QuestionType {
  if (value === "judge") {
    return "true_false";
  }

  return formalQuestionTypes.includes(value as QuestionType)
    ? (value as QuestionType)
    : "short_answer";
}

function resolveScoringMethod(questionType: QuestionType): ScoringMethod {
  return objectiveQuestionTypes.has(questionType) ? "auto_match" : "ai_scoring";
}

function createQuestionOptions(
  questionDraft: AiGenerationRouteIntegratedQuestionDraftSummary,
  standardAnswerRichText: string,
): AdminAiGenerationFormalQuestionDraftPayload["questionOptions"] {
  const answerTokens = new Set(
    standardAnswerRichText
      .split(/[,，;；、\s]+/u)
      .map((token) => token.trim().toLowerCase())
      .filter((token) => token.length > 0),
  );

  return (questionDraft.questionOptions ?? [])
    .map((questionOption, optionIndex) => {
      const label =
        normalizeRequiredText(questionOption.optionLabel) ??
        String.fromCharCode(65 + optionIndex);
      const contentRichText = normalizeRequiredText(questionOption.optionText);

      if (contentRichText === null) {
        return null;
      }

      return {
        label,
        contentRichText,
        isCorrect:
          typeof questionOption.isCorrect === "boolean"
            ? questionOption.isCorrect
            : answerTokens.has(label.toLowerCase()) ||
              answerTokens.has(contentRichText.toLowerCase()),
        sortOrder: optionIndex + 1,
      };
    })
    .filter((questionOption) => questionOption !== null);
}

function createFillBlankAnswers(
  standardAnswerRichText: string,
): AdminAiGenerationFormalQuestionDraftPayload["fillBlankAnswers"] {
  return [
    {
      blankKey: "blank_1",
      standardAnswers: [standardAnswerRichText],
      score: "1.0",
      sortOrder: 1,
    },
  ];
}

function createContentAdminFormalPaperDraftName(requestedAt: string): string {
  return `AI组卷草稿 ${requestedAt.slice(0, 16).replace("T", " ")}`;
}

function normalizeRequiredText(
  value: string | null | undefined,
): string | null {
  const normalizedValue = value?.trim() ?? "";

  return normalizedValue.length > 0 ? normalizedValue : null;
}

function normalizeOptionalText(
  value: string | null | undefined,
): string | null {
  return normalizeRequiredText(value);
}

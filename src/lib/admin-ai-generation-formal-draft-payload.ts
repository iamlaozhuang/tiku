import type {
  AdminAiGenerationFormalQuestionKnowledgeNodeCandidateSource,
  AdminAiGenerationFormalQuestionDraftPayload,
  AdminAiGenerationFormalQuestionReviewCandidatePayload,
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
  QuestionDifficulty,
  QuestionType,
  ScoringMethod,
  Subject,
} from "@/server/models/paper";
import { getDefaultScoringConfiguration } from "./question-scoring-contract";
import {
  isAiGenerationReviewRequiredQuestionType,
  parseCurrentAiGenerationQuestionType,
} from "@/server/services/ai-generation-question-type-contract";

type ContentAdminFormalReviewedDraftLocalContract =
  | AdminAiGenerationLocalContractBaseDto
  | AdminAiGenerationLocalContractDto;

type CreateContentAdminFormalReviewedDraftPayloadInput = {
  localContractSummary: ContentAdminFormalReviewedDraftLocalContract | null;
  generationParameters: AiGenerationRouteIntegratedGenerationParameters;
  requestedAt: string;
  sourceIdentity?: {
    requestPublicId: string;
    resultPublicId: string;
    taskPublicId: string;
  };
  createSourceContentDigest?: (
    source: AdminAiGenerationFormalQuestionKnowledgeNodeCandidateSource,
  ) => string;
};

export type { AdminAiGenerationFormalReviewedDraftPayload };

export function createContentAdminFormalReviewedDraftPayload({
  localContractSummary,
  generationParameters,
  requestedAt,
  sourceIdentity,
  createSourceContentDigest,
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
    if (
      structuredPreview.requestedQuestionCount !== 1 ||
      structuredPreview.draftSummaries.length !== 1
    ) {
      return null;
    }

    return createFormalQuestionDraftPayload(
      structuredPreview.draftSummaries[0],
      generationParameters,
      sourceIdentity === undefined || createSourceContentDigest === undefined
        ? undefined
        : { sourceIdentity, createSourceContentDigest },
    );
  }

  if (
    localContractSummary.generationKind === "paper" &&
    localContractSummary.paperAssembly?.status === "assembled"
  ) {
    const paperAssembly = localContractSummary.paperAssembly;
    const paperSections = paperAssembly.container.sections
      .map((paperSection, paperSectionIndex) => {
        const paperQuestions = paperSection.selectedQuestions.map(
          (selectedQuestion, questionIndex) => ({
            questionPublicId: selectedQuestion.questionPublicId,
            companionQuestionDraft: null,
            score: selectedQuestion.score.toFixed(1),
            sortOrder: questionIndex + 1,
            questionGroup: null,
          }),
        );

        if (
          paperQuestions.length === 0 ||
          paperSection.selectedQuestions.some(
            (selectedQuestion) =>
              selectedQuestion.sourceKind !== "platform_formal_question",
          )
        ) {
          return null;
        }

        return {
          title:
            normalizeRequiredText(paperSection.title) ??
            `第${paperSectionIndex + 1}大题`,
          description: null,
          sortOrder: paperSectionIndex + 1,
          paperQuestions,
        };
      })
      .filter((paperSection) => paperSection !== null);

    if (
      paperSections.length === 0 ||
      paperAssembly.sourceDiagnostics.role !== "content_admin"
    ) {
      return null;
    }

    return {
      name: createContentAdminFormalPaperDraftName(requestedAt),
      profession: generationParameters.profession as Profession,
      level: generationParameters.level,
      subject: generationParameters.subject as Subject,
      paperType: "mock_paper" satisfies PaperType,
      year: null,
      month: null,
      sourceDescription: "content_ai_generation",
      sourceRegion: null,
      sourceOrganization: null,
      questionBasis: null,
      generationMethod: "ai",
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
  candidateContext?: {
    sourceIdentity: NonNullable<
      CreateContentAdminFormalReviewedDraftPayloadInput["sourceIdentity"]
    >;
    createSourceContentDigest: NonNullable<
      CreateContentAdminFormalReviewedDraftPayloadInput["createSourceContentDigest"]
    >;
  },
):
  | AdminAiGenerationFormalQuestionDraftPayload
  | AdminAiGenerationFormalQuestionReviewCandidatePayload
  | null {
  const stemRichText = normalizeRequiredText(questionDraft.questionStem);
  const providerStandardAnswer = normalizeRequiredText(
    questionDraft.standardAnswer,
  );
  const analysisRichText = normalizeRequiredText(questionDraft.analysis);

  if (
    stemRichText === null ||
    providerStandardAnswer === null ||
    analysisRichText === null
  ) {
    return null;
  }
  const questionType = parseCurrentAiGenerationQuestionType(
    questionDraft.questionType ?? generationParameters.questionType,
  );
  if (questionType === null) {
    return null;
  }
  const standardAnswerRichText = projectFormalStandardAnswer(
    questionType,
    providerStandardAnswer,
  );
  if (standardAnswerRichText === null) {
    return null;
  }
  const questionOptions = createQuestionOptions(
    questionDraft,
    providerStandardAnswer,
    questionType,
  );
  if (
    questionOptions === null ||
    !hasValidQuestionOptions(questionType, questionOptions)
  ) {
    return null;
  }
  const difficulty = normalizeQuestionDifficulty(questionDraft.difficulty);
  const knowledgeNodePublicIds = [
    ...new Set(generationParameters.knowledgeNodePublicIds),
  ];

  if (difficulty === null) {
    return null;
  }

  const scoringPoints = copyQuestionScoringPoints(questionDraft.scoringPoints);
  const fillBlankAnswers = copyQuestionFillBlankAnswers(
    questionDraft.fillBlankAnswers,
  );
  if (
    scoringPoints === null ||
    fillBlankAnswers === null ||
    !hasValidQuestionTypeScoringFacts({
      questionType,
      scoringPoints,
      fillBlankAnswers,
    })
  ) {
    return null;
  }

  const questionPayload: AdminAiGenerationFormalQuestionDraftPayload = {
    questionType,
    profession: generationParameters.profession as Profession,
    level: generationParameters.level,
    subject: generationParameters.subject as Subject,
    difficulty,
    stemRichText,
    analysisRichText,
    standardAnswerRichText,
    multiChoiceRule: "all_correct_only" satisfies MultiChoiceRule,
    scoringMethod: resolveScoringMethod(questionType),
    materialPublicId: null,
    questionOptions,
    scoringPoints,
    fillBlankAnswers,
    knowledgeNodePublicIds,
    tagPublicIds: [],
  };

  if (generationParameters.knowledgeNodeMode === "selected") {
    return knowledgeNodePublicIds.length > 0 &&
      knowledgeNodePublicIds.length ===
        generationParameters.knowledgeNodePublicIds.length
      ? questionPayload
      : null;
  }

  if (
    candidateContext === undefined ||
    (generationParameters.knowledgeNodeMode !== "balanced" &&
      generationParameters.knowledgeNodeMode !== "comprehensive")
  ) {
    return null;
  }

  const generatedLabels = normalizeGeneratedKnowledgeNodeLabels(
    questionDraft.knowledgeNodeLabels,
  );

  if (generatedLabels === null) {
    return null;
  }

  const candidateSource: AdminAiGenerationFormalQuestionKnowledgeNodeCandidateSource =
    {
      schemaVersion: 1,
      generationMode: generationParameters.knowledgeNodeMode,
      requestPublicId: candidateContext.sourceIdentity.requestPublicId,
      resultPublicId: candidateContext.sourceIdentity.resultPublicId,
      taskPublicId: candidateContext.sourceIdentity.taskPublicId,
      generatedLabels,
      questionDraft: {
        ...questionPayload,
        knowledgeNodePublicIds: [],
      },
    };
  const sourceContentDigest =
    candidateContext.createSourceContentDigest(candidateSource);

  if (!/^sha256:[0-9a-f]{64}$/u.test(sourceContentDigest)) {
    return null;
  }

  return {
    ...candidateSource.questionDraft,
    knowledgeNodePublicIds: [],
    knowledgeNodeConfirmation: {
      schemaVersion: 1,
      status: "unresolved",
      generationMode: candidateSource.generationMode,
      requestPublicId: candidateSource.requestPublicId,
      resultPublicId: candidateSource.resultPublicId,
      taskPublicId: candidateSource.taskPublicId,
      sourceContentDigest,
      generatedLabels,
    },
  };
}

function normalizeGeneratedKnowledgeNodeLabels(
  values: readonly string[] | undefined,
): string[] | null {
  if (values === undefined || values.length === 0 || values.length > 50) {
    return null;
  }

  const generatedLabels: string[] = [];
  const exactLabels = new Set<string>();
  const collisionKeys = new Set<string>();

  for (const value of values) {
    const label = value.normalize("NFC");

    if (
      label !== value ||
      label.trim() !== label ||
      label.length === 0 ||
      label.length > 128 ||
      /[\u0000-\u001f\u007f-\u009f]/u.test(label)
    ) {
      return null;
    }

    if (exactLabels.has(label)) {
      continue;
    }

    const collisionKey = label.normalize("NFKC").toLocaleLowerCase("und");

    if (collisionKeys.has(collisionKey)) {
      return null;
    }

    exactLabels.add(label);
    collisionKeys.add(collisionKey);
    generatedLabels.push(label);
  }

  return generatedLabels.length === 0 ? null : generatedLabels;
}

function normalizeQuestionDifficulty(
  value: string | null | undefined,
): QuestionDifficulty | null {
  return value === "easy" || value === "medium" || value === "hard"
    ? value
    : null;
}

function resolveScoringMethod(questionType: QuestionType): ScoringMethod {
  return getDefaultScoringConfiguration(questionType).scoringMethod;
}

function projectFormalStandardAnswer(
  questionType: QuestionType,
  providerStandardAnswer: string,
): string | null {
  if (questionType !== "true_false") {
    return providerStandardAnswer;
  }
  if (providerStandardAnswer === "true") return "A";
  if (providerStandardAnswer === "false") return "B";
  return null;
}

function createQuestionOptions(
  questionDraft: AiGenerationRouteIntegratedQuestionDraftSummary,
  providerStandardAnswer: string,
  questionType: QuestionType,
): AdminAiGenerationFormalQuestionDraftPayload["questionOptions"] | null {
  const values = questionDraft.questionOptions;
  if (!Array.isArray(values) || !hasDenseArrayEntries(values)) return null;
  if (questionType === "true_false") {
    if (
      values.length !== 0 ||
      (providerStandardAnswer !== "true" && providerStandardAnswer !== "false")
    ) {
      return null;
    }
    return [
      {
        label: "A",
        contentRichText: "正确",
        isCorrect: providerStandardAnswer === "true",
        sortOrder: 1,
      },
      {
        label: "B",
        contentRichText: "错误",
        isCorrect: providerStandardAnswer === "false",
        sortOrder: 2,
      },
    ];
  }

  const answerTokens = new Set(
    providerStandardAnswer
      .split(/[,，;；、\s]+/u)
      .map((token) => token.trim().toLowerCase())
      .filter((token) => token.length > 0),
  );

  const questionOptions: AdminAiGenerationFormalQuestionDraftPayload["questionOptions"] =
    [];
  const labels = new Set<string>();
  for (let optionIndex = 0; optionIndex < values.length; optionIndex += 1) {
    const questionOption = values[optionIndex];
    const label = normalizeRequiredText(questionOption.optionLabel);
    const contentRichText = normalizeRequiredText(questionOption.optionText);
    if (label === null || contentRichText === null || labels.has(label)) {
      return null;
    }
    labels.add(label);
    questionOptions.push({
      label,
      contentRichText,
      isCorrect:
        typeof questionOption.isCorrect === "boolean"
          ? questionOption.isCorrect
          : answerTokens.has(label.toLowerCase()) ||
            answerTokens.has(contentRichText.toLowerCase()),
      sortOrder: optionIndex + 1,
    });
  }
  return questionOptions;
}

function hasValidQuestionOptions(
  questionType: QuestionType,
  questionOptions: AdminAiGenerationFormalQuestionDraftPayload["questionOptions"],
): boolean {
  if (questionType !== "single_choice" && questionType !== "multi_choice") {
    if (questionType !== "true_false") return questionOptions.length === 0;
    return (
      questionOptions.length === 2 &&
      questionOptions[0]?.label === "A" &&
      questionOptions[0]?.contentRichText === "正确" &&
      questionOptions[1]?.label === "B" &&
      questionOptions[1]?.contentRichText === "错误" &&
      questionOptions.filter((option) => option.isCorrect).length === 1
    );
  }
  const correctCount = questionOptions.filter(
    (option) => option.isCorrect,
  ).length;
  return (
    questionOptions.length >= 2 &&
    (questionType === "single_choice" ? correctCount === 1 : correctCount >= 2)
  );
}

function copyQuestionScoringPoints(
  values: AiGenerationRouteIntegratedQuestionDraftSummary["scoringPoints"],
): AdminAiGenerationFormalQuestionDraftPayload["scoringPoints"] | null {
  if (!Array.isArray(values) || !hasDenseArrayEntries(values)) return null;
  const scoringPoints: AdminAiGenerationFormalQuestionDraftPayload["scoringPoints"] =
    [];
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    const description = normalizeRequiredText(value.description);
    if (
      description === null ||
      !Number.isFinite(Number(value.score)) ||
      Number(value.score) <= 0 ||
      value.sortOrder !== index + 1
    ) {
      return null;
    }
    scoringPoints.push({
      description,
      score: value.score,
      sortOrder: value.sortOrder,
    });
  }
  return scoringPoints;
}

function copyQuestionFillBlankAnswers(
  values: AiGenerationRouteIntegratedQuestionDraftSummary["fillBlankAnswers"],
): AdminAiGenerationFormalQuestionDraftPayload["fillBlankAnswers"] | null {
  if (!Array.isArray(values) || !hasDenseArrayEntries(values)) return null;
  const fillBlankAnswers: AdminAiGenerationFormalQuestionDraftPayload["fillBlankAnswers"] =
    [];
  const blankKeys = new Set<string>();
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    const blankKey = normalizeRequiredText(value.blankKey);
    if (!hasDenseArrayEntries(value.standardAnswers)) return null;
    const standardAnswers: string[] = [];
    for (const standardAnswer of value.standardAnswers) {
      const normalizedAnswer = normalizeRequiredText(standardAnswer);
      if (
        normalizedAnswer === null ||
        standardAnswers.includes(normalizedAnswer)
      ) {
        return null;
      }
      standardAnswers.push(normalizedAnswer);
    }
    if (
      blankKey === null ||
      blankKeys.has(blankKey) ||
      standardAnswers.length === 0 ||
      !Number.isFinite(Number(value.score)) ||
      Number(value.score) <= 0 ||
      value.sortOrder !== index + 1
    ) {
      return null;
    }
    blankKeys.add(blankKey);
    fillBlankAnswers.push({
      blankKey,
      standardAnswers,
      score: value.score,
      sortOrder: value.sortOrder,
    });
  }
  return fillBlankAnswers;
}

function hasDenseArrayEntries(value: readonly unknown[]): boolean {
  for (let index = 0; index < value.length; index += 1) {
    if (!Object.hasOwn(value, index)) return false;
  }
  return true;
}

function hasValidQuestionTypeScoringFacts(input: {
  questionType: QuestionType;
  scoringPoints: AdminAiGenerationFormalQuestionDraftPayload["scoringPoints"];
  fillBlankAnswers: AdminAiGenerationFormalQuestionDraftPayload["fillBlankAnswers"];
}): boolean {
  if (input.questionType === "fill_blank") {
    return (
      input.scoringPoints.length === 0 && input.fillBlankAnswers.length > 0
    );
  }
  if (isAiGenerationReviewRequiredQuestionType(input.questionType)) {
    return (
      input.scoringPoints.length > 0 && input.fillBlankAnswers.length === 0
    );
  }
  return (
    input.scoringPoints.length === 0 && input.fillBlankAnswers.length === 0
  );
}

function createContentAdminFormalPaperDraftName(requestedAt: string): string {
  return `待审试卷草稿 ${requestedAt.slice(0, 16).replace("T", " ")}`;
}

function normalizeRequiredText(
  value: string | null | undefined,
): string | null {
  const normalizedValue = value?.trim() ?? "";

  return normalizedValue.length > 0 ? normalizedValue : null;
}

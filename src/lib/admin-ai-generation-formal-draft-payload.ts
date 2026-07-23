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
  const difficulty = normalizeQuestionDifficulty(questionDraft.difficulty);
  const knowledgeNodePublicIds = [
    ...new Set(generationParameters.knowledgeNodePublicIds),
  ];

  if (difficulty === null) {
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
    questionOptions: createQuestionOptions(
      questionDraft,
      standardAnswerRichText,
    ),
    scoringPoints: [],
    fillBlankAnswers:
      questionType === "fill_blank"
        ? createFillBlankAnswers(standardAnswerRichText)
        : [],
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
  return `待审试卷草稿 ${requestedAt.slice(0, 16).replace("T", " ")}`;
}

function normalizeRequiredText(
  value: string | null | undefined,
): string | null {
  const normalizedValue = value?.trim() ?? "";

  return normalizedValue.length > 0 ? normalizedValue : null;
}

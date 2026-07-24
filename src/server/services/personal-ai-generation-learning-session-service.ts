import type {
  PersonalAiGenerationLearningPaperAssemblySessionCreationInputDto,
  PersonalAiGenerationLearningPaperSourceQuestionDto,
  PersonalAiGenerationLearningSessionAnswerFeedbackDto,
  PersonalAiGenerationLearningSessionAnswerInputDto,
  PersonalAiGenerationLearningSessionCreationInputDto,
  PersonalAiGenerationLearningSessionCreationResultDto,
  PersonalAiGenerationLearningSessionDto,
  PersonalAiGenerationLearningSessionProgressResultDto,
  PersonalAiGenerationLearningSessionQuestionDto,
  PersonalAiGenerationLearningSessionRepository,
  PersonalAiGenerationLearningSessionService,
  PersonalAiGenerationLearningSessionStatisticsDto,
} from "../contracts/personal-ai-generation-learning-session-contract";
import type { AiPaperPlanAndSelectContainerDto } from "../contracts/ai-paper-plan-and-select-contract";
import { PERSONAL_AI_GENERATION_LEARNING_TEXT_ANSWER_MAX_LENGTH } from "../models/personal-ai-generation-learning-session";
import {
  createBlockedPersonalAiLearningFormalWriteBoundary,
  createPersonalAiLearningSessionQuestion,
  createPersonalAiLearningSessionQuestionFromPaperSource,
  normalizePersonalAiLearningLabels,
} from "../validators/personal-ai-generation-learning-session";
import { projectPersonalAiLearningSessionForLearner } from "@/lib/learner-content-projection";
import { isAiGenerationReviewRequiredQuestionType } from "./ai-generation-question-type-contract";

export function createPersonalAiGenerationLearningSessionService(input: {
  repository: PersonalAiGenerationLearningSessionRepository;
}): PersonalAiGenerationLearningSessionService {
  return {
    createLearningSession: (creationInput) =>
      createLearningSession(input.repository, creationInput),
    createLearningSessionFromPaperAssembly: (creationInput) =>
      createLearningSessionFromPaperAssembly(input.repository, creationInput),
    submitLearningSessionAnswer: (answerInput) =>
      submitLearningSessionAnswer(input.repository, answerInput),
    getLearningSessionProgress: (progressInput) =>
      getLearningSessionProgress(input.repository, progressInput),
  };
}

async function createLearningSession(
  repository: PersonalAiGenerationLearningSessionRepository,
  input: PersonalAiGenerationLearningSessionCreationInputDto,
): Promise<PersonalAiGenerationLearningSessionCreationResultDto> {
  if (input.evidenceStatus !== "sufficient" || input.citationCount <= 0) {
    return blockCreation("insufficient_grounding_evidence");
  }

  if (input.sourceResultPublicId === null) {
    return blockCreation("source_result_required");
  }

  const drafts = input.questionDraftSnapshot.snapshot.questions;
  const questions: PersonalAiGenerationLearningSessionQuestionDto[] = [];

  for (const [index, draft] of drafts.entries()) {
    const question = createPersonalAiLearningSessionQuestion({
      sessionPublicId: input.sessionPublicId,
      usableQuestionIndex: index + 1,
      draft,
    });

    if (question === null) {
      return blockCreation("no_usable_generated_questions");
    }

    questions.push(question);
  }

  if (
    questions.length !==
    input.questionDraftSnapshot.snapshot.requestedQuestionCount
  ) {
    return blockCreation("no_usable_generated_questions");
  }
  const existingResult = await reuseExistingLearningSession(
    repository,
    input,
    questions,
  );

  if (existingResult !== null) {
    return existingResult;
  }

  const session: PersonalAiGenerationLearningSessionDto = {
    sessionPublicId: input.sessionPublicId,
    contentDomain: "personal_ai_learning",
    sourceResultPublicId: input.sourceResultPublicId,
    sourceTaskPublicId: input.sourceTaskPublicId,
    ownerType: input.ownerType,
    ownerPublicId: input.ownerPublicId,
    actorPublicId: input.actorPublicId,
    evidenceStatus: input.evidenceStatus,
    citationCount: input.citationCount,
    questionCount: questions.length,
    questions,
    formalWriteBoundary: createBlockedPersonalAiLearningFormalWriteBoundary(),
    createdAt: input.createdAt.toISOString(),
  };

  const saveResult = await repository.saveSession(session);

  if (saveResult.status === "blocked") {
    return blockCreation(saveResult.blockReason);
  }

  return (
    (await reuseExistingLearningSession(repository, input, questions)) ??
    blockCreation("session_context_mismatch")
  );
}

async function createLearningSessionFromPaperAssembly(
  repository: PersonalAiGenerationLearningSessionRepository,
  input: PersonalAiGenerationLearningPaperAssemblySessionCreationInputDto,
): Promise<PersonalAiGenerationLearningSessionCreationResultDto> {
  const existingResult = await reuseExistingLearningSession(repository, input);

  if (existingResult !== null) {
    return existingResult;
  }

  if (input.evidenceStatus !== "sufficient") {
    return blockCreation("insufficient_grounding_evidence");
  }

  if (input.sourceResultPublicId === null) {
    return blockCreation("source_result_required");
  }

  const questions = createPaperAssemblySessionQuestions(input);

  if (questions === null) {
    return blockCreation("selected_question_source_missing");
  }

  if (questions.length === 0) {
    return blockCreation("no_usable_selected_questions");
  }

  const session: PersonalAiGenerationLearningSessionDto = {
    sessionPublicId: input.sessionPublicId,
    contentDomain: "personal_ai_learning",
    sourceResultPublicId: input.sourceResultPublicId,
    sourceTaskPublicId: input.sourceTaskPublicId,
    ownerType: input.ownerType,
    ownerPublicId: input.ownerPublicId,
    actorPublicId: input.actorPublicId,
    evidenceStatus: input.evidenceStatus,
    citationCount: input.citationCount,
    questionCount: questions.length,
    questions,
    formalWriteBoundary: createBlockedPersonalAiLearningFormalWriteBoundary(),
    createdAt: input.createdAt.toISOString(),
  };

  const saveResult = await repository.saveSession(session);

  if (saveResult.status === "blocked") {
    return blockCreation(saveResult.blockReason);
  }

  return (
    (await reuseExistingLearningSession(repository, input, questions)) ??
    blockCreation("session_context_mismatch")
  );
}

async function reuseExistingLearningSession(
  repository: PersonalAiGenerationLearningSessionRepository,
  input: Pick<
    PersonalAiGenerationLearningSessionCreationInputDto,
    | "sessionPublicId"
    | "sourceResultPublicId"
    | "sourceTaskPublicId"
    | "ownerType"
    | "ownerPublicId"
    | "actorPublicId"
  >,
  expectedQuestions?: PersonalAiGenerationLearningSessionQuestionDto[],
): Promise<PersonalAiGenerationLearningSessionCreationResultDto | null> {
  const existingSession = await repository.findSessionByPublicId(
    input.sessionPublicId,
  );

  if (existingSession === null) {
    return null;
  }

  if (
    existingSession.sourceResultPublicId !== input.sourceResultPublicId ||
    existingSession.sourceTaskPublicId !== input.sourceTaskPublicId ||
    existingSession.ownerType !== input.ownerType ||
    existingSession.ownerPublicId !== input.ownerPublicId ||
    existingSession.actorPublicId !== input.actorPublicId ||
    (expectedQuestions !== undefined &&
      JSON.stringify(existingSession.questions) !==
        JSON.stringify(expectedQuestions))
  ) {
    return blockCreation("session_context_mismatch");
  }

  return {
    status: "created",
    blockReason: null,
    session: projectPersonalAiLearningSessionForLearner(existingSession),
  };
}

function createPaperAssemblySessionQuestions(
  input: PersonalAiGenerationLearningPaperAssemblySessionCreationInputDto,
): PersonalAiGenerationLearningSessionQuestionDto[] | null {
  if (!hasCompletePaperAssemblyQuestionGroups(input)) {
    return null;
  }

  const sourceQuestionByKey = new Map(
    input.sourceQuestions.map((sourceQuestion) => [
      createPaperSourceQuestionKey(sourceQuestion),
      sourceQuestion,
    ]),
  );
  const questions: PersonalAiGenerationLearningSessionQuestionDto[] = [];

  for (const selectedQuestion of input.paperAssemblyContainer.sections.flatMap(
    (section) => section.selectedQuestions,
  )) {
    const sourceQuestion = sourceQuestionByKey.get(
      createPaperSourceQuestionKey(selectedQuestion),
    );

    if (sourceQuestion === undefined) {
      return null;
    }

    if (
      JSON.stringify(selectedQuestion.questionGroup ?? null) !==
      JSON.stringify(sourceQuestion.questionGroup ?? null)
    ) {
      return null;
    }

    const sessionQuestion =
      createPersonalAiLearningSessionQuestionFromPaperSource({
        sessionPublicId: input.sessionPublicId,
        usableQuestionIndex: questions.length + 1,
        sourceQuestion,
        selectedScore: selectedQuestion.score,
      });

    if (sessionQuestion === null) {
      return null;
    }

    questions.push({
      ...sessionQuestion,
      questionGroup:
        selectedQuestion.questionGroup === null ||
        selectedQuestion.questionGroup === undefined
          ? null
          : {
              ...selectedQuestion.questionGroup,
              materialSnapshot: {
                ...selectedQuestion.questionGroup.materialSnapshot,
              },
              memberQuestionPublicIds: [
                ...selectedQuestion.questionGroup.memberQuestionPublicIds,
              ],
            },
    });
  }

  return questions;
}

function hasCompletePaperAssemblyQuestionGroups(
  input: PersonalAiGenerationLearningPaperAssemblySessionCreationInputDto,
): boolean {
  const selectedByGroupPublicId = new Map<
    string,
    Array<{
      sectionKey: string;
      question: AiPaperPlanAndSelectContainerDto["sections"][number]["selectedQuestions"][number];
    }>
  >();

  for (const section of input.paperAssemblyContainer.sections) {
    for (const question of section.selectedQuestions) {
      const groupPublicId = question.questionGroup?.publicId;

      if (groupPublicId === undefined) {
        continue;
      }

      const groupedQuestions = selectedByGroupPublicId.get(groupPublicId) ?? [];
      groupedQuestions.push({ sectionKey: section.sectionKey, question });
      selectedByGroupPublicId.set(groupPublicId, groupedQuestions);
    }
  }

  const sourceByKey = new Map(
    input.sourceQuestions.map((question) => [
      createPaperSourceQuestionKey(question),
      question,
    ]),
  );

  for (const groupedQuestions of selectedByGroupPublicId.values()) {
    const first = groupedQuestions[0];
    const firstGroup = first?.question.questionGroup;

    if (
      first === undefined ||
      firstGroup === null ||
      firstGroup === undefined ||
      new Set(groupedQuestions.map((item) => item.sectionKey)).size !== 1 ||
      firstGroup.memberQuestionPublicIds.length !== groupedQuestions.length
    ) {
      return false;
    }

    const groupedQuestionByPublicId = new Map(
      groupedQuestions.map((item) => [item.question.questionPublicId, item]),
    );

    for (const [
      index,
      questionPublicId,
    ] of firstGroup.memberQuestionPublicIds.entries()) {
      const item = groupedQuestionByPublicId.get(questionPublicId);
      const questionGroup = item?.question.questionGroup;
      const sourceQuestion =
        item === undefined
          ? undefined
          : sourceByKey.get(createPaperSourceQuestionKey(item.question));

      if (
        item === undefined ||
        questionGroup === null ||
        questionGroup === undefined ||
        questionGroup.questionSortOrder !== index + 1 ||
        JSON.stringify(questionGroup) !==
          JSON.stringify({ ...firstGroup, questionSortOrder: index + 1 }) ||
        sourceQuestion === undefined ||
        JSON.stringify(sourceQuestion.questionGroup ?? null) !==
          JSON.stringify(questionGroup)
      ) {
        return false;
      }
    }
  }

  return true;
}

function createPaperSourceQuestionKey(input: {
  questionPublicId: string;
  sourceKind: PersonalAiGenerationLearningPaperSourceQuestionDto["sourceKind"];
}): string {
  return `${input.sourceKind}:${input.questionPublicId}`;
}

async function submitLearningSessionAnswer(
  repository: PersonalAiGenerationLearningSessionRepository,
  input: PersonalAiGenerationLearningSessionAnswerInputDto,
): Promise<PersonalAiGenerationLearningSessionAnswerFeedbackDto> {
  const session = await repository.findSessionByPublicId(input.sessionPublicId);
  const fallbackSubmittedAt = input.submittedAt.toISOString();

  if (session === null) {
    return createBlockedAnswerFeedback({
      input,
      submittedAt: fallbackSubmittedAt,
      blockReason: "session_not_found",
    });
  }

  if (session.actorPublicId !== input.actorPublicId) {
    return createBlockedAnswerFeedback({
      input,
      submittedAt: fallbackSubmittedAt,
      blockReason: "actor_not_allowed",
    });
  }

  const question = session.questions.find(
    (sessionQuestion) =>
      sessionQuestion.sessionQuestionPublicId === input.sessionQuestionPublicId,
  );

  if (question === undefined) {
    return createBlockedAnswerFeedback({
      input,
      submittedAt: fallbackSubmittedAt,
      blockReason: "question_not_found",
    });
  }

  if (input.expectedAnswerRevision === 2_147_483_647) {
    return createBlockedAnswerFeedback({
      input,
      submittedAt: fallbackSubmittedAt,
      blockReason: "answer_revision_conflict",
    });
  }

  const selectedOptionLabels = normalizePersonalAiLearningLabels(
    input.selectedOptionLabels,
  );
  const isSubjectiveQuestion = isAiGenerationReviewRequiredQuestionType(
    question.questionType,
  );

  if (isSubjectiveQuestion) {
    const textAnswer = input.textAnswer?.trim() ?? "";

    if (selectedOptionLabels.length > 0) {
      return createBlockedAnswerFeedback({
        input,
        submittedAt: fallbackSubmittedAt,
        blockReason: "answer_shape_invalid",
      });
    }

    if (textAnswer.length === 0) {
      return createBlockedAnswerFeedback({
        input,
        submittedAt: fallbackSubmittedAt,
        blockReason: "answer_required",
      });
    }

    if (
      textAnswer.length > PERSONAL_AI_GENERATION_LEARNING_TEXT_ANSWER_MAX_LENGTH
    ) {
      return createBlockedAnswerFeedback({
        input,
        submittedAt: fallbackSubmittedAt,
        blockReason: "answer_too_long",
      });
    }

    const answerFeedback = createAnswerFeedback({
      input: { ...input, textAnswer },
      question,
      selectedOptionLabels,
      status: "submitted_review_required",
      isCorrect: null,
      score: null,
    });

    const saveResult = await repository.saveAnswerFeedback({
      expectedAnswerRevision: input.expectedAnswerRevision,
      answerFeedback,
    });

    return saveResult.status === "blocked"
      ? createBlockedAnswerFeedback({
          input,
          submittedAt: fallbackSubmittedAt,
          blockReason: saveResult.blockReason,
        })
      : saveResult.answerFeedback;
  }

  if ((input.textAnswer?.trim().length ?? 0) > 0) {
    return createBlockedAnswerFeedback({
      input,
      submittedAt: fallbackSubmittedAt,
      blockReason: "answer_shape_invalid",
    });
  }

  const standardAnswerLabels = normalizePersonalAiLearningLabels(
    question.standardAnswerLabels,
  );
  const isCorrect =
    selectedOptionLabels.join("|") === standardAnswerLabels.join("|");

  const answerFeedback = createAnswerFeedback({
    input,
    question,
    selectedOptionLabels,
    status: "scored",
    isCorrect,
    score: isCorrect ? question.maxScore : "0.0",
  });

  const saveResult = await repository.saveAnswerFeedback({
    expectedAnswerRevision: input.expectedAnswerRevision,
    answerFeedback,
  });

  return saveResult.status === "blocked"
    ? createBlockedAnswerFeedback({
        input,
        submittedAt: fallbackSubmittedAt,
        blockReason: saveResult.blockReason,
      })
    : saveResult.answerFeedback;
}

async function getLearningSessionProgress(
  repository: PersonalAiGenerationLearningSessionRepository,
  input: {
    sessionPublicId: string;
    actorPublicId: string;
    viewedAt: Date;
  },
): Promise<PersonalAiGenerationLearningSessionProgressResultDto> {
  const session = await repository.findSessionByPublicId(input.sessionPublicId);

  if (session === null) {
    return {
      status: "blocked",
      blockReason: "session_not_found",
      progress: null,
    };
  }

  if (session.actorPublicId !== input.actorPublicId) {
    return {
      status: "blocked",
      blockReason: "actor_not_allowed",
      progress: null,
    };
  }

  const answerFeedbacks = selectLatestAnswerFeedbacks({
    session,
    answerFeedbacks: await repository.listAnswerFeedbackBySessionPublicId(
      input.sessionPublicId,
    ),
  });

  return {
    status: "ready",
    blockReason: null,
    progress: {
      sessionPublicId: session.sessionPublicId,
      contentDomain: session.contentDomain,
      sourceResultPublicId: session.sourceResultPublicId,
      sourceTaskPublicId: session.sourceTaskPublicId,
      ownerType: session.ownerType,
      ownerPublicId: session.ownerPublicId,
      actorPublicId: session.actorPublicId,
      persistenceStatus: "repository_persisted",
      resumeStatus: "resumable",
      evidenceStatus: session.evidenceStatus,
      citationCount: session.citationCount,
      questionCount: session.questionCount,
      answerFeedbacks,
      statistics: createLearningSessionStatistics({
        answerFeedbacks,
        questions: session.questions,
        updatedAt: input.viewedAt,
      }),
      formalWriteBoundary: session.formalWriteBoundary,
      createdAt: session.createdAt,
    },
  };
}

function blockCreation(
  blockReason: PersonalAiGenerationLearningSessionCreationResultDto["blockReason"],
): PersonalAiGenerationLearningSessionCreationResultDto {
  if (blockReason === null) {
    throw new Error("blockReason is required for blocked creation");
  }

  return {
    status: "blocked",
    blockReason,
    session: null,
  };
}

function createAnswerFeedback(input: {
  input: PersonalAiGenerationLearningSessionAnswerInputDto;
  question: PersonalAiGenerationLearningSessionQuestionDto;
  selectedOptionLabels: string[];
  status: Exclude<
    PersonalAiGenerationLearningSessionAnswerFeedbackDto["status"],
    "blocked"
  >;
  isCorrect: boolean | null;
  score: string | null;
}): PersonalAiGenerationLearningSessionAnswerFeedbackDto {
  return {
    status: input.status,
    blockReason: null,
    sessionPublicId: input.input.sessionPublicId,
    sessionQuestionPublicId: input.input.sessionQuestionPublicId,
    actorPublicId: input.input.actorPublicId,
    answerRevision: input.input.expectedAnswerRevision + 1,
    selectedOptionLabels: input.selectedOptionLabels,
    textAnswer: input.input.textAnswer?.trim() || null,
    isCorrect: input.isCorrect,
    score: input.score,
    maxScore: input.question.maxScore,
    standardAnswerLabels: input.question.standardAnswerLabels,
    standardAnswerText: input.question.standardAnswerText,
    analysis: input.question.analysis,
    aiScoringStatus: "blocked",
    formalWriteBoundary: createBlockedPersonalAiLearningFormalWriteBoundary(),
    mistakeBookPublicId: null,
    submittedAt: input.input.submittedAt.toISOString(),
  };
}

function createBlockedAnswerFeedback(input: {
  input: PersonalAiGenerationLearningSessionAnswerInputDto;
  submittedAt: string;
  blockReason: Exclude<
    PersonalAiGenerationLearningSessionAnswerFeedbackDto["blockReason"],
    null
  >;
}): PersonalAiGenerationLearningSessionAnswerFeedbackDto {
  return {
    status: "blocked",
    blockReason: input.blockReason,
    sessionPublicId: input.input.sessionPublicId,
    sessionQuestionPublicId: input.input.sessionQuestionPublicId,
    actorPublicId: input.input.actorPublicId,
    answerRevision: null,
    selectedOptionLabels: normalizePersonalAiLearningLabels(
      input.input.selectedOptionLabels,
    ),
    textAnswer: input.input.textAnswer?.trim() || null,
    isCorrect: null,
    score: null,
    maxScore: null,
    standardAnswerLabels: [],
    standardAnswerText: null,
    analysis: null,
    aiScoringStatus: "blocked",
    formalWriteBoundary: createBlockedPersonalAiLearningFormalWriteBoundary(),
    mistakeBookPublicId: null,
    submittedAt: input.submittedAt,
  };
}

function selectLatestAnswerFeedbacks(input: {
  session: PersonalAiGenerationLearningSessionDto;
  answerFeedbacks: PersonalAiGenerationLearningSessionAnswerFeedbackDto[];
}): PersonalAiGenerationLearningSessionAnswerFeedbackDto[] {
  const latestAnswerFeedbackByQuestion = input.answerFeedbacks
    .filter(
      (answerFeedback) =>
        answerFeedback.sessionPublicId === input.session.sessionPublicId &&
        answerFeedback.actorPublicId === input.session.actorPublicId,
    )
    .reduce<
      Record<string, PersonalAiGenerationLearningSessionAnswerFeedbackDto>
    >((latestByQuestion, answerFeedback) => {
      const currentFeedback =
        latestByQuestion[answerFeedback.sessionQuestionPublicId];

      if (
        currentFeedback !== undefined &&
        currentFeedback.submittedAt >= answerFeedback.submittedAt
      ) {
        return latestByQuestion;
      }

      return {
        ...latestByQuestion,
        [answerFeedback.sessionQuestionPublicId]: answerFeedback,
      };
    }, {});

  return input.session.questions
    .map(
      (question) =>
        latestAnswerFeedbackByQuestion[question.sessionQuestionPublicId],
    )
    .filter(
      (
        answerFeedback,
      ): answerFeedback is PersonalAiGenerationLearningSessionAnswerFeedbackDto =>
        answerFeedback !== undefined,
    );
}

function createLearningSessionStatistics(input: {
  answerFeedbacks: PersonalAiGenerationLearningSessionAnswerFeedbackDto[];
  questions: PersonalAiGenerationLearningSessionQuestionDto[];
  updatedAt: Date;
}): PersonalAiGenerationLearningSessionStatisticsDto {
  const submittedCount = input.answerFeedbacks.length;
  const correctCount = input.answerFeedbacks.filter(
    (answerFeedback) => answerFeedback.isCorrect === true,
  ).length;
  const incorrectCount = input.answerFeedbacks.filter(
    (answerFeedback) => answerFeedback.isCorrect === false,
  ).length;
  const reviewRequiredCount = input.answerFeedbacks.filter(
    (answerFeedback) => answerFeedback.isCorrect === null,
  ).length;
  const objectiveFeedbackCount = correctCount + incorrectCount;
  const totalScore = input.answerFeedbacks.reduce(
    (score, answerFeedback) => score + parseLearningScore(answerFeedback.score),
    0,
  );
  const maxScore = input.questions.reduce(
    (score, question) => score + parseLearningScore(question.maxScore),
    0,
  );
  const questionCount = input.questions.length;

  return {
    questionCount,
    submittedCount,
    correctCount,
    incorrectCount,
    reviewRequiredCount,
    completionRate:
      questionCount === 0
        ? 0
        : roundLearningRate(submittedCount / questionCount),
    accuracyRate:
      objectiveFeedbackCount === 0
        ? null
        : roundLearningRate(correctCount / objectiveFeedbackCount),
    score: formatLearningScore(totalScore),
    maxScore: formatLearningScore(maxScore),
    updatedAt: input.updatedAt.toISOString(),
  };
}

function parseLearningScore(score: string | null): number {
  if (score === null) {
    return 0;
  }

  const parsedScore = Number.parseFloat(score);

  return Number.isFinite(parsedScore) ? parsedScore : 0;
}

function formatLearningScore(score: number): string {
  return score.toFixed(1);
}

function roundLearningRate(rate: number): number {
  return Number(rate.toFixed(4));
}

import type {
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
import {
  collectPersonalAiLearningQuestionDrafts,
  createBlockedPersonalAiLearningFormalWriteBoundary,
  createPersonalAiLearningSessionQuestion,
  normalizePersonalAiLearningLabels,
} from "../validators/personal-ai-generation-learning-session";

export function createPersonalAiGenerationLearningSessionService(input: {
  repository: PersonalAiGenerationLearningSessionRepository;
}): PersonalAiGenerationLearningSessionService {
  return {
    createLearningSession: (creationInput) =>
      createLearningSession(input.repository, creationInput),
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
  const groundingSummary = input.visibleGeneratedContent.groundingSummary;

  if (
    groundingSummary === undefined ||
    groundingSummary.evidenceStatus !== "sufficient"
  ) {
    return blockCreation("insufficient_grounding_evidence");
  }

  const structuredPreview = input.visibleGeneratedContent.structuredPreview;

  if (structuredPreview === undefined) {
    return blockCreation("structured_preview_unavailable");
  }

  const drafts = collectPersonalAiLearningQuestionDrafts(structuredPreview);

  if (drafts === null) {
    return blockCreation("structured_preview_not_parsed");
  }

  const questions = drafts.reduce<
    PersonalAiGenerationLearningSessionQuestionDto[]
  >((usableQuestions, draft) => {
    const question = createPersonalAiLearningSessionQuestion({
      sessionPublicId: input.sessionPublicId,
      usableQuestionIndex: usableQuestions.length + 1,
      draft,
    });

    if (question !== null) {
      usableQuestions.push(question);
    }

    return usableQuestions;
  }, []);

  if (questions.length === 0) {
    return blockCreation("no_usable_generated_questions");
  }

  const session: PersonalAiGenerationLearningSessionDto = {
    sessionPublicId: input.sessionPublicId,
    contentDomain: "personal_ai_learning",
    sourceResultPublicId: input.sourceResultPublicId,
    sourceTaskPublicId: input.sourceTaskPublicId,
    ownerType: input.ownerType,
    ownerPublicId: input.ownerPublicId,
    actorPublicId: input.actorPublicId,
    evidenceStatus: groundingSummary.evidenceStatus,
    citationCount: groundingSummary.citationCount,
    questionCount: questions.length,
    questions,
    formalWriteBoundary: createBlockedPersonalAiLearningFormalWriteBoundary(),
    createdAt: input.createdAt.toISOString(),
  };

  await repository.saveSession(session);

  return {
    status: "created",
    blockReason: null,
    session,
  };
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

  const selectedOptionLabels = normalizePersonalAiLearningLabels(
    input.selectedOptionLabels,
  );

  if (
    question.questionType === "short_answer" ||
    question.standardAnswerLabels.length === 0
  ) {
    const answerFeedback = createAnswerFeedback({
      input,
      question,
      selectedOptionLabels,
      status: "submitted_review_required",
      isCorrect: null,
      score: null,
    });

    await repository.saveAnswerFeedback(answerFeedback);

    return answerFeedback;
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

  await repository.saveAnswerFeedback(answerFeedback);

  return answerFeedback;
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

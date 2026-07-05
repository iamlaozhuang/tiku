import type {
  PersonalAiGenerationLearningSessionAnswerFeedbackDto,
  PersonalAiGenerationLearningSessionAnswerInputDto,
  PersonalAiGenerationLearningSessionCreationInputDto,
  PersonalAiGenerationLearningSessionCreationResultDto,
  PersonalAiGenerationLearningSessionDto,
  PersonalAiGenerationLearningSessionQuestionDto,
  PersonalAiGenerationLearningSessionRepository,
  PersonalAiGenerationLearningSessionService,
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
    return createAnswerFeedback({
      input,
      question,
      selectedOptionLabels,
      status: "submitted_review_required",
      isCorrect: null,
      score: null,
    });
  }

  const standardAnswerLabels = normalizePersonalAiLearningLabels(
    question.standardAnswerLabels,
  );
  const isCorrect =
    selectedOptionLabels.join("|") === standardAnswerLabels.join("|");

  return createAnswerFeedback({
    input,
    question,
    selectedOptionLabels,
    status: "scored",
    isCorrect,
    score: isCorrect ? question.maxScore : "0.0",
  });
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

import type {
  PracticeAnswerFeedbackDto,
  PracticeAnswerRecordDto,
  PracticeDto,
  PracticeQuestionProgressDto,
} from "../contracts/practice-contract";
import type {
  PracticeAnswerFeedbackRow,
  PracticeAnswerRecordRow,
  PracticeAnswerResumeRow,
  PracticeRow,
} from "../repositories/practice-repository";
import { mapLearnerCitations } from "./learner-citation-mapper";
import { projectPaperSnapshotForLearner } from "@/lib/learner-content-projection";
import { listPublishedPaperSnapshotQuestionEntries } from "@/lib/published-paper-snapshot";

function formatNullableTimestamp(value: Date | null): string | null {
  return value === null ? null : value.toISOString();
}

function getQuestionCount(paperSnapshot: Record<string, unknown>): number {
  return listPublishedPaperSnapshotQuestionEntries(paperSnapshot).length;
}

type PracticeResumeQuestion = {
  paperQuestionPublicId: string;
  questionPublicId: string | null;
  questionType: string | null;
  scoringMethod: string | null;
  standardAnswerRichText: string | null;
  analysisRichText: string | null;
};

export type PracticeResumeProjection = {
  currentQuestionIndex: number;
  questionProgress: PracticeQuestionProgressDto[];
};

function getRequiredString(
  value: Record<string, unknown>,
  key: string,
): string | null {
  const candidate = value[key];
  return typeof candidate === "string" && candidate.trim().length > 0
    ? candidate
    : null;
}

function getNullableString(
  value: Record<string, unknown>,
  key: string,
): string | null {
  const candidate = value[key];
  return typeof candidate === "string" ? candidate : null;
}

function listPracticeResumeQuestions(
  paperSnapshot: Record<string, unknown>,
): PracticeResumeQuestion[] | null {
  const questions = listPublishedPaperSnapshotQuestionEntries(
    paperSnapshot,
  ).map(({ paperQuestion }) => {
    const paperQuestionPublicId = getRequiredString(
      paperQuestion,
      "paperQuestionPublicId",
    );
    const questionPublicId = getRequiredString(
      paperQuestion,
      "questionPublicId",
    );
    const questionType = getRequiredString(paperQuestion, "questionType");
    const scoringMethod = getRequiredString(paperQuestion, "scoringMethod");

    return paperQuestionPublicId === null
      ? null
      : {
          paperQuestionPublicId,
          questionPublicId,
          questionType,
          scoringMethod,
          standardAnswerRichText: getNullableString(
            paperQuestion,
            "standardAnswerRichText",
          ),
          analysisRichText: getNullableString(
            paperQuestion,
            "analysisRichText",
          ),
        };
  });

  if (questions.some((question) => question === null)) {
    return null;
  }

  const normalizedQuestions = questions.filter(
    (question): question is PracticeResumeQuestion => question !== null,
  );
  const paperQuestionPublicIds = normalizedQuestions.map(
    (question) => question.paperQuestionPublicId,
  );
  const questionPublicIds = normalizedQuestions.flatMap((question) =>
    question.questionPublicId === null ? [] : [question.questionPublicId],
  );

  return new Set(paperQuestionPublicIds).size ===
    paperQuestionPublicIds.length &&
    new Set(questionPublicIds).size === questionPublicIds.length
    ? normalizedQuestions
    : null;
}

function isObjectiveQuestion(question: PracticeResumeQuestion): boolean {
  return (
    question.scoringMethod === "auto_match" &&
    ["single_choice", "multi_choice", "true_false", "fill_blank"].includes(
      question.questionType ?? "",
    )
  );
}

function selectAuthoritativeAnswerRecord(
  question: PracticeResumeQuestion,
  answerRecords: PracticeAnswerResumeRow[],
): PracticeAnswerResumeRow | null {
  if (
    question.questionPublicId === null ||
    question.questionType === null ||
    question.scoringMethod === null ||
    answerRecords.length === 0 ||
    answerRecords.some(
      (answerRecord) =>
        answerRecord.exam_mode !== "practice" ||
        answerRecord.question_public_id !== question.questionPublicId,
    )
  ) {
    return null;
  }

  const hasLegacyAttempt = answerRecords.some(
    (answerRecord) =>
      answerRecord.practice_attempt_number === null &&
      answerRecord.practice_max_attempt_count === null,
  );
  const hasPartialAttempt = answerRecords.some(
    (answerRecord) =>
      (answerRecord.practice_attempt_number === null) !==
      (answerRecord.practice_max_attempt_count === null),
  );

  if (hasPartialAttempt || (hasLegacyAttempt && answerRecords.length !== 1)) {
    return null;
  }

  if (hasLegacyAttempt) {
    return answerRecords[0]!;
  }

  const maxAttemptCounts = [
    ...new Set(
      answerRecords.map((answerRecord) =>
        Number(answerRecord.practice_max_attempt_count),
      ),
    ),
  ];
  const expectedMaxAttemptCount = isObjectiveQuestion(question) ? 1 : 2;
  const attemptNumbers = answerRecords
    .map((answerRecord) => Number(answerRecord.practice_attempt_number))
    .sort((left, right) => left - right);

  if (
    maxAttemptCounts.length !== 1 ||
    maxAttemptCounts[0] !== expectedMaxAttemptCount ||
    attemptNumbers.some(
      (attemptNumber, index) =>
        !Number.isSafeInteger(attemptNumber) || attemptNumber !== index + 1,
    )
  ) {
    return null;
  }

  return (
    answerRecords.find(
      (answerRecord) =>
        answerRecord.practice_attempt_number === attemptNumbers.length,
    ) ?? null
  );
}

function isTerminalAnswerRecord(
  question: PracticeResumeQuestion,
  answerRecord: PracticeAnswerResumeRow,
): boolean {
  if (question.questionType === null) {
    return false;
  }

  if (isObjectiveQuestion(question)) {
    return (
      answerRecord.answer_record_status === "scored" &&
      answerRecord.is_correct !== null &&
      answerRecord.score !== null
    );
  }

  return (
    answerRecord.is_correct === null &&
    ((answerRecord.answer_record_status === "submitted" &&
      answerRecord.score === null) ||
      (answerRecord.answer_record_status === "scored" &&
        answerRecord.score !== null))
  );
}

function buildResumeFeedback(
  question: PracticeResumeQuestion,
  answerRecord: PracticeAnswerResumeRow,
): PracticeAnswerFeedbackDto {
  if (question.questionType === null || question.scoringMethod === null) {
    throw new Error("Practice question type is required for resume feedback.");
  }

  const isObjective = isObjectiveQuestion(question);

  return mapPracticeAnswerFeedbackToApi({
    answer_record_public_id: answerRecord.public_id,
    is_correct: answerRecord.is_correct,
    score: answerRecord.score,
    max_score: answerRecord.max_score,
    standard_answer_rich_text: question.standardAnswerRichText,
    analysis_rich_text: question.analysisRichText,
    mistake_book_public_id: answerRecord.mistake_book_public_id,
    ai_explanation_status: isObjective ? "unavailable" : null,
    ai_explanation_text: null,
    ai_explanation_learning_suggestion: null,
    ai_explanation_evidence_status: null,
    ai_explanation_citations: [],
    ai_hint_status: isObjective ? null : "unavailable",
    ai_hint_text: null,
    ai_hint_improvement_directions: [],
    ai_hint_evidence_status: null,
    ai_hint_citations: [],
    retry_remaining_count: 0,
    answered_at: answerRecord.answered_at,
  });
}

export function buildPracticeResumeProjection(
  paperSnapshot: Record<string, unknown>,
  answerRecords: PracticeAnswerResumeRow[],
): PracticeResumeProjection | null {
  const questions = listPracticeResumeQuestions(paperSnapshot);

  if (questions === null) {
    return null;
  }

  const answerRecordPublicIds = answerRecords.map(
    (answerRecord) => answerRecord.public_id,
  );
  const knownPaperQuestionPublicIds = new Set(
    questions.map((question) => question.paperQuestionPublicId),
  );

  if (
    new Set(answerRecordPublicIds).size !== answerRecordPublicIds.length ||
    answerRecords.some(
      (answerRecord) =>
        !knownPaperQuestionPublicIds.has(answerRecord.paper_question_public_id),
    )
  ) {
    return null;
  }

  const progressOrNull = questions.map((question, questionIndex) => {
    const questionAnswerRecords = answerRecords.filter(
      (answerRecord) =>
        answerRecord.paper_question_public_id ===
        question.paperQuestionPublicId,
    );

    if (questionAnswerRecords.length === 0) {
      return null;
    }

    const currentAnswerRecord = selectAuthoritativeAnswerRecord(
      question,
      questionAnswerRecords,
    );

    if (
      currentAnswerRecord === null ||
      questionAnswerRecords.some(
        (answerRecord) => !isTerminalAnswerRecord(question, answerRecord),
      ) ||
      !isTerminalAnswerRecord(question, currentAnswerRecord)
    ) {
      return false;
    }

    return {
      paperQuestionPublicId: question.paperQuestionPublicId,
      answerRecord: mapPracticeAnswerRecordToApi(currentAnswerRecord),
      feedback: buildResumeFeedback(question, currentAnswerRecord),
      attemptNumber: currentAnswerRecord.practice_attempt_number,
      maxAttemptCount: currentAnswerRecord.practice_max_attempt_count,
      stage: "terminal" as const,
      nextAction:
        questionIndex === questions.length - 1
          ? ("complete" as const)
          : ("continue" as const),
    };
  });

  if (progressOrNull.some((progress) => progress === false)) {
    return null;
  }

  const questionProgress = progressOrNull.filter(
    (progress): progress is PracticeQuestionProgressDto =>
      progress !== null && progress !== false,
  );
  const progressedQuestionPublicIds = new Set(
    questionProgress.map((progress) => progress.paperQuestionPublicId),
  );
  const nextQuestionIndex = questions.findIndex(
    (question) =>
      !progressedQuestionPublicIds.has(question.paperQuestionPublicId),
  );

  return {
    currentQuestionIndex:
      nextQuestionIndex === -1
        ? Math.max(questions.length - 1, 0)
        : nextQuestionIndex,
    questionProgress,
  };
}

export function mapPracticeToApi(
  practice: PracticeRow,
  currentQuestionIndex = 0,
): PracticeDto {
  return {
    publicId: practice.public_id,
    paperPublicId: practice.paper_public_id,
    profession: practice.profession,
    level: practice.level,
    subject: practice.subject,
    practiceStatus: practice.practice_status,
    startedAt: practice.started_at.toISOString(),
    lastAnsweredAt: formatNullableTimestamp(practice.last_answered_at),
    expiresAt: practice.expires_at.toISOString(),
    currentQuestionIndex,
    questionCount: getQuestionCount(practice.paper_snapshot),
    paperSnapshot: projectPaperSnapshotForLearner(practice.paper_snapshot),
  };
}

export function mapPracticeAnswerRecordToApi(
  answerRecord: PracticeAnswerRecordRow,
): PracticeAnswerRecordDto {
  return {
    publicId: answerRecord.public_id,
    examMode: answerRecord.exam_mode,
    paperQuestionPublicId: answerRecord.paper_question_public_id,
    questionPublicId: answerRecord.question_public_id,
    answerSnapshot: answerRecord.answer_snapshot,
    answerRecordStatus: answerRecord.answer_record_status,
    isCorrect: answerRecord.is_correct,
    score: answerRecord.score,
    maxScore: answerRecord.max_score,
    answeredAt: formatNullableTimestamp(answerRecord.answered_at),
    submittedAt: formatNullableTimestamp(answerRecord.submitted_at),
  };
}

export function mapPracticeAnswerFeedbackToApi(
  feedback: PracticeAnswerFeedbackRow,
): PracticeAnswerFeedbackDto {
  return {
    answerRecordPublicId: feedback.answer_record_public_id,
    isCorrect: feedback.is_correct,
    score: feedback.score,
    maxScore: feedback.max_score,
    standardAnswerRichText: feedback.standard_answer_rich_text,
    analysisRichText: feedback.analysis_rich_text,
    mistakeBookPublicId: feedback.mistake_book_public_id,
    aiExplanationStatus: feedback.ai_explanation_status,
    aiExplanationText: feedback.ai_explanation_text,
    aiExplanationLearningSuggestion:
      feedback.ai_explanation_learning_suggestion,
    aiExplanationEvidenceStatus: feedback.ai_explanation_evidence_status,
    aiExplanationCitations: mapLearnerCitations({
      evidenceStatus: feedback.ai_explanation_evidence_status,
      citations: feedback.ai_explanation_citations,
    }),
    aiHintStatus: feedback.ai_hint_status,
    aiHintText: feedback.ai_hint_text,
    aiHintImprovementDirections: feedback.ai_hint_improvement_directions,
    aiHintEvidenceStatus: feedback.ai_hint_evidence_status,
    aiHintCitations: mapLearnerCitations({
      evidenceStatus: feedback.ai_hint_evidence_status,
      citations: feedback.ai_hint_citations,
    }),
    retryRemainingCount: feedback.retry_remaining_count,
    answeredAt: formatNullableTimestamp(feedback.answered_at),
  };
}

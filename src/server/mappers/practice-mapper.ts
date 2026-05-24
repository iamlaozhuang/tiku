import type {
  PracticeAnswerFeedbackDto,
  PracticeAnswerRecordDto,
  PracticeDto,
} from "../contracts/practice-contract";
import type {
  PracticeAnswerFeedbackRow,
  PracticeAnswerRecordRow,
  PracticeRow,
} from "../repositories/practice-repository";

function formatNullableTimestamp(value: Date | null): string | null {
  return value === null ? null : value.toISOString();
}

function getQuestionCount(paperSnapshot: Record<string, unknown>): number {
  const paperSections = Array.isArray(paperSnapshot.paperSections)
    ? paperSnapshot.paperSections
    : [];

  return paperSections.reduce((total, paperSection) => {
    if (
      typeof paperSection !== "object" ||
      paperSection === null ||
      !("paperQuestions" in paperSection) ||
      !Array.isArray(paperSection.paperQuestions)
    ) {
      return total;
    }

    return total + paperSection.paperQuestions.length;
  }, 0);
}

function getOrderedPaperQuestionPublicIds(
  paperSnapshot: Record<string, unknown>,
): string[] {
  const paperSections = Array.isArray(paperSnapshot.paperSections)
    ? paperSnapshot.paperSections
    : [];

  return paperSections.flatMap((paperSection) => {
    if (
      typeof paperSection !== "object" ||
      paperSection === null ||
      !("paperQuestions" in paperSection) ||
      !Array.isArray(paperSection.paperQuestions)
    ) {
      return [];
    }

    const paperQuestions: unknown[] = paperSection.paperQuestions;

    return paperQuestions
      .map((paperQuestion: unknown) => {
        if (
          typeof paperQuestion !== "object" ||
          paperQuestion === null ||
          !("paperQuestionPublicId" in paperQuestion)
        ) {
          return null;
        }

        return typeof paperQuestion.paperQuestionPublicId === "string"
          ? paperQuestion.paperQuestionPublicId
          : null;
      })
      .filter(
        (publicId: string | null): publicId is string => publicId !== null,
      );
  });
}

function getCurrentQuestionIndex(
  paperSnapshot: Record<string, unknown>,
  answerRecords: PracticeAnswerRecordRow[],
): number {
  const paperQuestionPublicIds =
    getOrderedPaperQuestionPublicIds(paperSnapshot);

  if (paperQuestionPublicIds.length === 0) {
    return 0;
  }

  const answeredPaperQuestionPublicIds = new Set(
    answerRecords.map((answerRecord) => answerRecord.paper_question_public_id),
  );
  const nextQuestionIndex = paperQuestionPublicIds.findIndex(
    (publicId) => !answeredPaperQuestionPublicIds.has(publicId),
  );

  return nextQuestionIndex === -1
    ? paperQuestionPublicIds.length - 1
    : nextQuestionIndex;
}

export function mapPracticeToApi(
  practice: PracticeRow,
  answerRecords: PracticeAnswerRecordRow[] = [],
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
    currentQuestionIndex: getCurrentQuestionIndex(
      practice.paper_snapshot,
      answerRecords,
    ),
    questionCount: getQuestionCount(practice.paper_snapshot),
    paperSnapshot: practice.paper_snapshot,
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
    aiExplanationCitations: feedback.ai_explanation_citations,
    aiHintStatus: feedback.ai_hint_status,
    aiHintText: feedback.ai_hint_text,
    aiHintImprovementDirections: feedback.ai_hint_improvement_directions,
    aiHintEvidenceStatus: feedback.ai_hint_evidence_status,
    aiHintCitations: feedback.ai_hint_citations,
    retryRemainingCount: feedback.retry_remaining_count,
    answeredAt: formatNullableTimestamp(feedback.answered_at),
  };
}

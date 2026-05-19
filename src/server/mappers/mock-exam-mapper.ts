import type {
  MockExamAnswerRecordDto,
  MockExamDto,
} from "../contracts/mock-exam-contract";
import type {
  MockExamAnswerRecordRow,
  MockExamRow,
} from "../repositories/mock-exam-repository";

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

export function mapMockExamToApi(
  mockExam: MockExamRow,
  serverNow: Date,
): MockExamDto {
  return {
    publicId: mockExam.public_id,
    paperPublicId: mockExam.paper_public_id,
    profession: mockExam.profession,
    level: mockExam.level,
    subject: mockExam.subject,
    examStatus: mockExam.exam_status,
    startedAt: mockExam.started_at.toISOString(),
    submittedAt: formatNullableTimestamp(mockExam.submitted_at),
    serverNow: serverNow.toISOString(),
    serverDeadlineAt: formatNullableTimestamp(mockExam.server_deadline_at),
    durationMinute: mockExam.duration_minute,
    questionCount: getQuestionCount(mockExam.paper_snapshot),
    answeredCount: mockExam.answered_count,
    paperSnapshot: mockExam.paper_snapshot,
  };
}

export function mapMockExamAnswerRecordToApi(
  answerRecord: MockExamAnswerRecordRow,
): MockExamAnswerRecordDto {
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

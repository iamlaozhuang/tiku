import type {
  MockExamAnswerRecordDto,
  MockExamDto,
} from "../contracts/mock-exam-contract";
import type {
  MockExamAnswerRecordRow,
  MockExamRow,
} from "../repositories/mock-exam-repository";
import { projectPaperSnapshotForLearner } from "@/lib/learner-content-projection";
import { listPublishedPaperSnapshotQuestionEntries } from "@/lib/published-paper-snapshot";

function formatNullableTimestamp(value: Date | null): string | null {
  return value === null ? null : value.toISOString();
}

function getQuestionCount(paperSnapshot: Record<string, unknown>): number {
  return listPublishedPaperSnapshotQuestionEntries(paperSnapshot).length;
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
    paperSnapshot: projectPaperSnapshotForLearner(mockExam.paper_snapshot),
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
    answerRevision: answerRecord.answer_revision,
    clientOperationId: answerRecord.client_operation_id,
    clientSavedAt: formatNullableTimestamp(answerRecord.client_saved_at),
    answerRecordStatus: answerRecord.answer_record_status,
    isCorrect: answerRecord.is_correct,
    score: answerRecord.score,
    maxScore: answerRecord.max_score,
    answeredAt: formatNullableTimestamp(answerRecord.answered_at),
    submittedAt: formatNullableTimestamp(answerRecord.submitted_at),
  };
}

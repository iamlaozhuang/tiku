import type { Profession, Subject } from "../models/paper";
import type {
  AnswerRecordStatus,
  ExamStatus,
} from "../models/student-experience";

export type MockExamAnswerSnapshotDto = {
  selectedLabels: string[];
  textAnswer: string | null;
  savedFromClientAt: string | null;
};

export type MockExamDto = {
  publicId: string;
  paperPublicId: string;
  profession: Profession;
  level: number;
  subject: Subject;
  examStatus: ExamStatus;
  startedAt: string;
  submittedAt: string | null;
  serverNow: string;
  serverDeadlineAt: string | null;
  durationMinute: number | null;
  questionCount: number;
  answeredCount: number;
  paperSnapshot: Record<string, unknown>;
};

export type MockExamAnswerRecordDto = {
  publicId: string;
  examMode: "mock_exam";
  paperQuestionPublicId: string;
  questionPublicId: string;
  answerSnapshot: MockExamAnswerSnapshotDto;
  answerRecordStatus: AnswerRecordStatus;
  isCorrect: boolean | null;
  score: string | null;
  maxScore: string;
  answeredAt: string | null;
  submittedAt: string | null;
};

export type MockExamResultDto = {
  mockExam: MockExamDto;
};

export type MockExamAnswerRecordResultDto = {
  answerRecord: MockExamAnswerRecordDto;
};

export type MockExamSubmitResultDto = {
  mockExam: MockExamDto;
  unansweredCount: number;
};

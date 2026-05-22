import type { Profession, Subject } from "../models/paper";
import type {
  AnswerRecordStatus,
  PracticeStatus,
} from "../models/student-experience";

export type PracticeAnswerSnapshotDto = {
  selectedLabels: string[];
  textAnswer: string | null;
  savedFromClientAt: string | null;
};

export type PracticeDto = {
  publicId: string;
  paperPublicId: string;
  profession: Profession;
  level: number;
  subject: Subject;
  practiceStatus: PracticeStatus;
  startedAt: string;
  lastAnsweredAt: string | null;
  expiresAt: string;
  currentQuestionIndex: number;
  questionCount: number;
  paperSnapshot: Record<string, unknown>;
};

export type PracticeAnswerFeedbackDto = {
  answerRecordPublicId: string;
  isCorrect: boolean | null;
  score: string | null;
  maxScore: string;
  standardAnswerRichText: string | null;
  analysisRichText: string | null;
  mistakeBookPublicId: string | null;
  aiExplanationStatus: string | null;
  aiHintStatus: string | null;
  answeredAt: string | null;
};

export type PracticeAnswerRecordDto = {
  publicId: string;
  examMode: "practice";
  paperQuestionPublicId: string;
  questionPublicId: string;
  answerSnapshot: PracticeAnswerSnapshotDto;
  answerRecordStatus: AnswerRecordStatus;
  isCorrect: boolean | null;
  score: string | null;
  maxScore: string;
  answeredAt: string | null;
  submittedAt: string | null;
};

export type PracticeResultDto = {
  practice: PracticeDto;
  answerRecords: PracticeAnswerRecordDto[];
};

export type PracticeAnswerFeedbackResultDto = {
  feedback: PracticeAnswerFeedbackDto;
};

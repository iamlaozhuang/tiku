import type { AuthorizationType } from "../contracts/effective-authorization-contract";
import type { PracticeAnswerSnapshotDto } from "../contracts/practice-contract";
import type { Profession, Subject } from "../models/paper";
import type {
  AnswerRecordStatus,
  PracticeStatus,
} from "../models/student-experience";

export type PracticeAuthorizationScopeRow = {
  profession: Profession;
  level: number;
  authorization_types: AuthorizationType[];
  expires_at: Date;
};

export type PracticePaperRow = {
  public_id: string;
  profession: Profession;
  level: number;
  subject: Subject;
  paper_snapshot: Record<string, unknown>;
};

export type PracticeRow = {
  id: number;
  public_id: string;
  paper_public_id: string;
  profession: Profession;
  level: number;
  subject: Subject;
  practice_status: PracticeStatus;
  started_at: Date;
  last_answered_at: Date | null;
  expires_at: Date;
  paper_snapshot: Record<string, unknown>;
};

export type PracticeAnswerRecordRow = {
  public_id: string;
  exam_mode: "practice";
  paper_question_public_id: string;
  question_public_id: string;
  answer_snapshot: PracticeAnswerSnapshotDto;
  answer_record_status: AnswerRecordStatus;
  is_correct: boolean | null;
  score: string | null;
  max_score: string;
  answered_at: Date | null;
  submitted_at: Date | null;
};

export type PracticeAnswerFeedbackRow = {
  answer_record_public_id: string;
  is_correct: boolean | null;
  score: string | null;
  max_score: string;
  standard_answer_rich_text: string | null;
  analysis_rich_text: string | null;
  mistake_book_public_id: string | null;
  ai_explanation_status: string | null;
  ai_hint_status: string | null;
  answered_at: Date | null;
};

export type CreatePracticeInput = {
  publicId: string;
  userPublicId: string;
  paperPublicId: string;
  paperSnapshot: Record<string, unknown>;
  profession: Profession;
  level: number;
  subject: Subject;
  startedAt: Date;
  expiresAt: Date;
};

export type CreatePracticeAnswerInput = {
  publicId: string;
  userPublicId: string;
  practicePublicId: string;
  paperQuestionPublicId: string;
  questionPublicId: string;
  questionSnapshot: Record<string, unknown>;
  answerSnapshot: PracticeAnswerSnapshotDto;
  answerRecordStatus: AnswerRecordStatus;
  isCorrect: boolean | null;
  score: string | null;
  maxScore: string;
  answeredAt: Date;
  submittedAt: Date;
};

export type UpsertMistakeBookInput = {
  publicId: string;
  userPublicId: string;
  questionPublicId: string;
  paperQuestionPublicId: string;
  profession: Profession;
  level: number;
  subject: Subject;
  questionSnapshot: Record<string, unknown>;
  latestAnswerSnapshot: PracticeAnswerSnapshotDto;
  latestWrongAt: Date;
};

export type PracticeRepository = {
  listEffectiveAuthorizationScopes(query: {
    userPublicId: string;
  }): Promise<PracticeAuthorizationScopeRow[]>;
  findPublishedPaperByPublicId(query: {
    userPublicId: string;
    paperPublicId: string;
  }): Promise<PracticePaperRow | null>;
  findActivePracticeByPaper(query: {
    userPublicId: string;
    paperPublicId: string;
  }): Promise<PracticeRow | null>;
  findPracticeByPublicId(query: {
    userPublicId: string;
    publicId: string;
  }): Promise<PracticeRow | null>;
  createPractice(input: CreatePracticeInput): Promise<PracticeRow>;
  expirePractice(input: { publicId: string; expiredAt: Date }): Promise<void>;
  terminatePractice(input: {
    publicId: string;
    terminatedAt: Date;
    terminationReason: string;
  }): Promise<PracticeRow | null>;
  findAnswerRecordByPracticeAndQuestion(input: {
    userPublicId: string;
    practicePublicId: string;
    paperQuestionPublicId: string;
  }): Promise<PracticeAnswerRecordRow | null>;
  createPracticeAnswerRecord(
    input: CreatePracticeAnswerInput,
  ): Promise<PracticeAnswerRecordRow>;
  updatePracticeLastAnsweredAt(input: {
    publicId: string;
    lastAnsweredAt: Date;
  }): Promise<void>;
  upsertMistakeBookFromWrongAnswer(
    input: UpsertMistakeBookInput,
  ): Promise<{ public_id: string }>;
};

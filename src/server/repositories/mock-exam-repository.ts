import type { AuthorizationType } from "../contracts/effective-authorization-contract";
import type { MockExamAnswerSnapshotDto } from "../contracts/mock-exam-contract";
import type { Profession, Subject } from "../models/paper";
import type {
  AnswerRecordStatus,
  ExamStatus,
} from "../models/student-experience";

export type MockExamAuthorizationScopeRow = {
  profession: Profession;
  level: number;
  authorization_types: AuthorizationType[];
  expires_at: Date;
};

export type MockExamPaperRow = {
  public_id: string;
  profession: Profession;
  level: number;
  subject: Subject;
  duration_minute: number | null;
  paper_snapshot: Record<string, unknown>;
};

export type MockExamRow = {
  id: number;
  public_id: string;
  paper_public_id: string;
  profession: Profession;
  level: number;
  subject: Subject;
  exam_status: ExamStatus;
  started_at: Date;
  submitted_at: Date | null;
  server_deadline_at: Date | null;
  duration_minute: number | null;
  terminated_at: Date | null;
  termination_reason: string | null;
  objective_score: string | null;
  subjective_score: string | null;
  total_score: string | null;
  paper_snapshot: Record<string, unknown>;
  answered_count: number;
};

export type MockExamAnswerRecordRow = {
  public_id: string;
  exam_mode: "mock_exam";
  paper_question_public_id: string;
  question_public_id: string;
  answer_snapshot: MockExamAnswerSnapshotDto;
  answer_record_status: AnswerRecordStatus;
  is_correct: boolean | null;
  score: string | null;
  max_score: string;
  answered_at: Date | null;
  submitted_at: Date | null;
};

export type CreateMockExamInput = {
  publicId: string;
  userPublicId: string;
  paperPublicId: string;
  paperSnapshot: Record<string, unknown>;
  profession: Profession;
  level: number;
  subject: Subject;
  startedAt: Date;
  serverDeadlineAt: Date | null;
  durationMinute: number | null;
};

export type SaveMockExamAnswerInput = {
  publicId: string;
  userPublicId: string;
  mockExamPublicId: string;
  paperQuestionPublicId: string;
  questionPublicId: string;
  questionSnapshot: Record<string, unknown>;
  answerSnapshot: MockExamAnswerSnapshotDto;
  answerRecordStatus: AnswerRecordStatus;
  isCorrect: null;
  score: null;
  maxScore: string;
  answeredAt: Date;
};

export type SubmitMockExamInput = {
  publicId: string;
  submittedAt: Date;
  objectiveScore: string;
  subjectiveScore: string | null;
  totalScore: string;
  unansweredCount: number;
};

export type TerminateMockExamInput = {
  publicId: string;
  terminatedAt: Date;
  terminationReason: string;
};

export type MockExamRepository = {
  listEffectiveAuthorizationScopes(query: {
    userPublicId: string;
  }): Promise<MockExamAuthorizationScopeRow[]>;
  findPublishedPaperByPublicId(query: {
    userPublicId: string;
    paperPublicId: string;
  }): Promise<MockExamPaperRow | null>;
  findActiveMockExamByPaper(query: {
    userPublicId: string;
    paperPublicId: string;
  }): Promise<MockExamRow | null>;
  findMockExamByPublicId(query: {
    userPublicId: string;
    publicId: string;
  }): Promise<MockExamRow | null>;
  createMockExam(input: CreateMockExamInput): Promise<MockExamRow>;
  saveMockExamAnswerRecord(
    input: SaveMockExamAnswerInput,
  ): Promise<MockExamAnswerRecordRow>;
  listMockExamAnswerRecords(query: {
    userPublicId: string;
    mockExamPublicId: string;
  }): Promise<MockExamAnswerRecordRow[]>;
  submitMockExam(input: SubmitMockExamInput): Promise<MockExamRow | null>;
  terminateMockExam(input: TerminateMockExamInput): Promise<MockExamRow | null>;
};

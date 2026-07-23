import type { AuthorizationType } from "../contracts/effective-authorization-contract";
import type { ExamReportSnapshotDto } from "../contracts/exam-report-contract";
import type { MockExamAnswerSnapshotDto } from "../contracts/mock-exam-contract";
import type { ExamReportAiScoringEvidenceRow } from "./exam-report-repository";
import type { Profession, Subject } from "../models/paper";
import type {
  AnswerRecordStatus,
  ExamStatus,
} from "../models/student-experience";
import type { EnqueueAiScoringTaskInput } from "./ai-scoring-task-repository";
import type { AnswerSessionAuthorizationLineage } from "./practice-repository";

export type MockExamAuthorizationScopeRow = {
  profession: Profession;
  level: number;
  authorization_types: AuthorizationType[];
  expires_at: Date;
  authorization_source: AuthorizationType;
  authorization_public_id: string;
  organization_public_id: string | null;
  quota_owner_type: "personal" | "organization";
  quota_owner_public_id: string;
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
  authorization_source: AuthorizationType | null;
  authorization_public_id: string | null;
  authorization_organization_public_id: string | null;
  quota_owner_type: "personal" | "organization" | null;
  quota_owner_public_id: string | null;
};

export type MockExamAnswerRecordRow = {
  public_id: string;
  exam_mode: "mock_exam";
  paper_question_public_id: string;
  question_public_id: string;
  question_snapshot?: Record<string, unknown>;
  answer_snapshot: MockExamAnswerSnapshotDto;
  ai_scoring_evidence?: ExamReportAiScoringEvidenceRow | null;
  answer_revision: number;
  client_operation_id: string | null;
  client_saved_at: Date | null;
  answer_record_status: AnswerRecordStatus;
  is_correct: boolean | null;
  score: string | null;
  max_score: string;
  answered_at: Date | null;
  submitted_at: Date | null;
};

export type CreateMockExamInput = {
  publicId: string;
  deadlineTaskPublicId: string | null;
  userPublicId: string;
  paperPublicId: string;
  paperSnapshot: Record<string, unknown>;
  profession: Profession;
  level: number;
  subject: Subject;
  startedAt: Date;
  serverDeadlineAt: Date | null;
  durationMinute: number | null;
  authorizationLineage: AnswerSessionAuthorizationLineage;
};

export type SaveMockExamAnswerInput = {
  publicId: string;
  userPublicId: string;
  mockExamPublicId: string;
  paperQuestionPublicId: string;
  questionPublicId: string;
  questionSnapshot: Record<string, unknown>;
  answerSnapshot: MockExamAnswerSnapshotDto;
  operationId: string;
  expectedRevision: number;
  answerRecordStatus: AnswerRecordStatus;
  isCorrect: null;
  score: null;
  maxScore: string;
  answeredAt: Date;
};

export type SubmitMockExamInput = {
  publicId: string;
  examStatus: Extract<
    ExamStatus,
    "completed" | "scoring" | "scoring_partial_failed"
  >;
  submittedAt: Date;
  objectiveScore: string;
  subjectiveScore: string | null;
  totalScore: string;
  unansweredCount: number;
  aiScoringTasks: EnqueueAiScoringTaskInput[];
  answerRecordResults: {
    paperQuestionPublicId: string;
    answerRecordStatus: AnswerRecordStatus;
    isCorrect: boolean | null;
    score: string | null;
    submittedAt: Date;
    aiScoringSnapshot?: Record<string, unknown> | null;
  }[];
};

export type ApplyMockExamScoringResultsInput = {
  publicId: string;
  examStatus: Extract<ExamStatus, "completed" | "scoring_partial_failed">;
  scoredAt: Date;
  objectiveScore: string;
  subjectiveScore: string | null;
  totalScore: string;
  answerRecordResults: {
    paperQuestionPublicId: string;
    answerRecordStatus: AnswerRecordStatus;
    isCorrect: boolean | null;
    score: string | null;
    aiScoringSnapshot?: Record<string, unknown> | null;
  }[];
};

export type TerminateMockExamInput = {
  publicId: string;
  terminatedAt: Date;
  terminationReason: string;
};

export type RetryFailedMockExamAiScoringTasksResult = {
  mockExam: MockExamRow;
  retriedCount: number;
  failedCount: number;
};

export type SaveMockExamAnswerRecordResult = {
  status:
    | "saved"
    | "replayed"
    | "stale"
    | "not_writable"
    | "operation_conflict";
  answerRecord: MockExamAnswerRecordRow | null;
};

export type SupplementMissingMockExamAnswerInput = {
  publicId: string;
  paperQuestionPublicId: string;
  questionPublicId: string;
  questionSnapshot: Record<string, unknown>;
  answerSnapshot: MockExamAnswerSnapshotDto;
  operationId: string;
  clientSavedAt: Date;
  answerRecordStatus: AnswerRecordStatus;
  isCorrect: boolean | null;
  score: string | null;
  maxScore: string;
  aiScoringTask: EnqueueAiScoringTaskInput | null;
};

export type SupplementMissingMockExamAnswersResult = {
  mockExam: MockExamRow;
  answerRecords: MockExamAnswerRecordRow[];
  supplementedCount: number;
  skippedExistingCount: number;
};

export type RebuildExistingExamReportResult = {
  publicId: string;
  reportRevision: number;
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
  ): Promise<SaveMockExamAnswerRecordResult>;
  listMockExamAnswerRecords(query: {
    userPublicId: string;
    mockExamPublicId: string;
  }): Promise<MockExamAnswerRecordRow[]>;
  supplementMissingMockExamAnswers(input: {
    userPublicId: string;
    mockExamPublicId: string;
    supplementedAt: Date;
    answers: SupplementMissingMockExamAnswerInput[];
  }): Promise<SupplementMissingMockExamAnswersResult | null>;
  rebuildExistingExamReport(input: {
    userPublicId: string;
    mockExamPublicId: string;
    hasChanges: boolean;
    examStatus: ExamStatus;
    objectiveScore: string | null;
    subjectiveScore: string | null;
    totalScore: string | null;
    reportSnapshot: ExamReportSnapshotDto;
    rebuiltAt: Date;
  }): Promise<RebuildExistingExamReportResult | null>;
  submitMockExam(input: SubmitMockExamInput): Promise<MockExamRow | null>;
  applyMockExamScoringResults(
    input: ApplyMockExamScoringResultsInput,
  ): Promise<MockExamRow | null>;
  retryFailedAiScoringTasks?(input: {
    userPublicId: string;
    mockExamPublicId: string;
    retriedAt: Date;
  }): Promise<RetryFailedMockExamAiScoringTasksResult | null>;
  terminateMockExam(input: TerminateMockExamInput): Promise<MockExamRow | null>;
};

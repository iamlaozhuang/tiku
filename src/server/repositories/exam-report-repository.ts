import type { AuthorizationType } from "../contracts/effective-authorization-contract";
import type {
  ExamReportSnapshotDto,
  LearningSuggestionSnapshotDto,
} from "../contracts/exam-report-contract";
import type { SortOrder } from "../contracts/api-response";
import type { Profession, Subject } from "../models/paper";
import type {
  AnswerRecordStatus,
  ExamStatus,
} from "../models/student-experience";

export type ExamReportAuthorizationScopeRow = {
  profession: Profession;
  level: number;
  authorization_types: AuthorizationType[];
  expires_at: Date;
};

export type ExamReportRow = {
  id: number;
  public_id: string;
  exam_report_public_id: string | null;
  mock_exam_public_id: string;
  paper_public_id: string;
  paper_name: string;
  profession: Profession;
  level: number;
  subject: Subject;
  exam_status: ExamStatus;
  objective_score: string | null;
  subjective_score: string | null;
  total_score: string | null;
  duration_second: number;
  report_snapshot: ExamReportSnapshotDto;
  learning_suggestion_snapshot: LearningSuggestionSnapshotDto;
  generated_at: Date;
  started_at: Date;
  created_at: Date;
  updated_at: Date;
};

export type ExamReportMockExamRow = {
  public_id: string;
  paper_public_id: string;
  paper_snapshot: Record<string, unknown>;
  profession: Profession;
  level: number;
  subject: Subject;
  exam_status: ExamStatus;
  started_at: Date;
  submitted_at: Date | null;
  objective_score: string | null;
  subjective_score: string | null;
  total_score: string | null;
};

export type ExamReportAnswerSnapshot = {
  selectedLabels: string[];
  textAnswer: string | null;
  savedFromClientAt: string | null;
};

export type ExamReportAiScoringEvidenceRow = {
  taskPublicId: string;
  taskStatus: string;
  attemptNumber: number;
  attemptStatus: string | null;
  modelConfigSnapshot: Record<string, unknown>;
  promptTemplateKey: string;
  promptTemplateVersion: number;
  promptTemplateHash: string;
  resultSnapshot: Record<string, unknown> | null;
};

export type ExamReportAnswerRecordRow = {
  public_id: string;
  paper_question_public_id: string;
  question_public_id: string;
  question_snapshot: Record<string, unknown>;
  answer_snapshot: ExamReportAnswerSnapshot;
  ai_scoring_evidence: ExamReportAiScoringEvidenceRow | null;
  answer_record_status: AnswerRecordStatus;
  is_correct: boolean | null;
  score: string | null;
  max_score: string;
  answered_at: Date | null;
  submitted_at: Date | null;
};

export type UpdateExamReportLearningSuggestionInput = {
  userPublicId: string;
  publicId: string;
  learningSuggestionSnapshot: LearningSuggestionSnapshotDto;
};

export type ExamReportListQuery = {
  userPublicId: string;
  page: number;
  pageSize: number;
  status: ExamStatus | null;
  search: string | null;
  sortBy: "startedAt";
  sortOrder: SortOrder;
};

export type CreateExamReportInput = {
  publicId: string;
  userPublicId: string;
  mockExamPublicId: string;
  paperPublicId: string;
  paperName: string;
  profession: Profession;
  level: number;
  subject: Subject;
  examStatus: ExamStatus;
  objectiveScore: string | null;
  subjectiveScore: string | null;
  totalScore: string | null;
  durationSecond: number;
  reportSnapshot: ExamReportSnapshotDto;
  learningSuggestionSnapshot: LearningSuggestionSnapshotDto;
  generatedAt: Date;
};

export type RebuildExamReportInput = CreateExamReportInput & {
  learningSuggestionSnapshot: null;
};

export type ExamReportRepository = {
  listEffectiveAuthorizationScopes(query: {
    userPublicId: string;
  }): Promise<ExamReportAuthorizationScopeRow[]>;
  listExamReports(query: ExamReportListQuery): Promise<{
    rows: ExamReportRow[];
    total: number;
  }>;
  findExamReportByPublicId(query: {
    userPublicId: string;
    publicId: string;
  }): Promise<ExamReportRow | null>;
  findExamReportByMockExamPublicId(query: {
    userPublicId: string;
    mockExamPublicId: string;
  }): Promise<ExamReportRow | null>;
  findSubmittedMockExamByPublicId(query: {
    userPublicId: string;
    mockExamPublicId: string;
  }): Promise<ExamReportMockExamRow | null>;
  listMockExamAnswerRecords(query: {
    userPublicId: string;
    mockExamPublicId: string;
  }): Promise<ExamReportAnswerRecordRow[]>;
  createExamReport(input: CreateExamReportInput): Promise<ExamReportRow>;
  rebuildExamReport(input: RebuildExamReportInput): Promise<ExamReportRow>;
  updateExamReportLearningSuggestionSnapshot(
    input: UpdateExamReportLearningSuggestionInput,
  ): Promise<void>;
};

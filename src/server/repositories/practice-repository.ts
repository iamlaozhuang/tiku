import type { AuthorizationType } from "../contracts/effective-authorization-contract";
import type { PracticeAnswerSnapshotDto } from "../contracts/practice-contract";
import type { Profession, Subject } from "../models/paper";
import type { RagCitationDto } from "../contracts/ai-rag-contract";
import type { EvidenceStatus } from "../models/ai-rag";
import type {
  AnswerRecordStatus,
  PracticeStatus,
} from "../models/student-experience";

export type AnswerSessionAuthorizationLineage = {
  authorizationSource: AuthorizationType;
  authorizationPublicId: string;
  organizationPublicId: string | null;
  quotaOwnerType: "personal" | "organization";
  quotaOwnerPublicId: string;
};

export class AuthorizationStartConflictError extends Error {
  constructor() {
    super("Selected authorization is no longer valid.");
    this.name = "AuthorizationStartConflictError";
  }
}

export class ActiveAnswerSessionClaimConflictError extends Error {
  constructor() {
    super("Active answer session claim conflicts with authoritative state.");
    this.name = "ActiveAnswerSessionClaimConflictError";
  }
}

export type PracticeAuthorizationScopeRow = {
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
  authorization_source: AuthorizationType | null;
  authorization_public_id: string | null;
  authorization_organization_public_id: string | null;
  quota_owner_type: "personal" | "organization" | null;
  quota_owner_public_id: string | null;
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
  practice_attempt_number: number | null;
  practice_max_attempt_count: number | null;
  answered_at: Date | null;
  submitted_at: Date | null;
};

export type PracticeAnswerResumeRow = PracticeAnswerRecordRow & {
  mistake_book_public_id: string | null;
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
  ai_explanation_text: string | null;
  ai_explanation_learning_suggestion: string | null;
  ai_explanation_evidence_status: EvidenceStatus | null;
  ai_explanation_citations: RagCitationDto[];
  ai_hint_status: string | null;
  ai_hint_text: string | null;
  ai_hint_improvement_directions: string[];
  ai_hint_evidence_status: EvidenceStatus | null;
  ai_hint_citations: RagCitationDto[];
  retry_remaining_count: number;
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
  authorizationLineage: AnswerSessionAuthorizationLineage;
  replaceActivePublicId: string | null;
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

export type SubmitPracticeAnswerInput = CreatePracticeAnswerInput & {
  expectedPracticeSnapshot: Record<string, unknown>;
  profession: Profession;
  level: number;
  subject: Subject;
  authorizationLineage: AnswerSessionAuthorizationLineage | null;
  maxAttemptCount: 1 | 2;
  mistakeBook: UpsertMistakeBookInput | null;
};

export type SubmitPracticeAnswerResult =
  | {
      status: "created";
      answerRecord: PracticeAnswerRecordRow;
      mistakeBookPublicId: string | null;
    }
  | {
      status: "objective_already_answered";
    }
  | {
      status: "subjective_retry_exhausted";
    }
  | {
      status: "authoritative_state_conflict";
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

export type UpsertMistakeBookFromFavoriteInput = {
  publicId: string;
  userPublicId: string;
  questionPublicId: string;
  paperQuestionPublicId: string;
  profession: Profession;
  level: number;
  subject: Subject;
  questionSnapshot: Record<string, unknown>;
  latestAnswerSnapshot: PracticeAnswerSnapshotDto;
  favoritedAt: Date;
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
  listAnswerRecordsByPractice(input: {
    userPublicId: string;
    practicePublicId: string;
  }): Promise<PracticeAnswerResumeRow[]>;
  submitPracticeAnswer(
    input: SubmitPracticeAnswerInput,
  ): Promise<SubmitPracticeAnswerResult>;
  upsertMistakeBookFromFavorite(
    input: UpsertMistakeBookFromFavoriteInput,
  ): Promise<{ public_id: string }>;
};

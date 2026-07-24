import type { EvidenceStatus } from "../models/ai-rag";
import type { PersonalAiGenerationPrivateQuestionDraftSnapshotDto } from "./personal-ai-generation-result-persistence-contract";
import type {
  AiPaperPlanAndSelectContainerDto,
  AiPaperQuestionGroupSnapshotDto,
  AiPaperQuestionSourceKind,
} from "./ai-paper-plan-and-select-contract";
import type {
  PersonalAiGenerationLearningAnswerBlockReason,
  PersonalAiGenerationLearningAnswerFeedbackStatus,
  PersonalAiGenerationLearningSessionAuthorizationSource,
  PersonalAiGenerationLearningSessionCompleteBlockReason,
  PersonalAiGenerationLearningContentDomain,
  PersonalAiGenerationLearningFormalWriteStatus,
  PersonalAiGenerationLearningPersistenceStatus,
  PersonalAiGenerationLearningResumeStatus,
  PersonalAiGenerationLearningSessionCreationBlockReason,
  PersonalAiGenerationLearningSessionCreationStatus,
  PersonalAiGenerationLearningSessionLifecycleAvailability,
  PersonalAiGenerationLearningSessionOwnerType,
  PersonalAiGenerationLearningSessionProgressStatus,
  PersonalAiGenerationLearningSessionQuestionType,
  PersonalAiGenerationLearningSessionStatus,
} from "../models/personal-ai-generation-learning-session";

export type PersonalAiGenerationLearningPaperQuestionSourceKind = Exclude<
  AiPaperQuestionSourceKind,
  "ai_generated_draft"
>;

export type PersonalAiGenerationLearningFormalWriteBoundaryDto = {
  questionWriteStatus: PersonalAiGenerationLearningFormalWriteStatus;
  paperWriteStatus: PersonalAiGenerationLearningFormalWriteStatus;
  practiceWriteStatus: PersonalAiGenerationLearningFormalWriteStatus;
  answerRecordWriteStatus: PersonalAiGenerationLearningFormalWriteStatus;
  examReportWriteStatus: PersonalAiGenerationLearningFormalWriteStatus;
  mistakeBookWriteStatus: PersonalAiGenerationLearningFormalWriteStatus;
};

export type PersonalAiGenerationLearningCompletionSummarySnapshotDto = {
  schemaVersion: 1;
  questionCount: number;
  submittedCount: number;
  correctCount: number;
  incorrectCount: number;
  reviewRequiredCount: number;
  completionRate: number;
  accuracyRate: number | null;
  score: string;
  maxScore: string;
};

export type PersonalAiGenerationLearningSessionQuestionOptionDto = {
  optionLabel: string;
  optionText: string;
  isCorrect: boolean | null;
};

export type PersonalAiGenerationLearningSessionQuestionDto = {
  sessionQuestionPublicId: string;
  sourceDraftNumber: number;
  questionType: PersonalAiGenerationLearningSessionQuestionType;
  difficulty: string | null;
  knowledgeNodeLabels: string[];
  questionStem: string;
  questionOptions: PersonalAiGenerationLearningSessionQuestionOptionDto[];
  standardAnswerLabels: string[];
  standardAnswerText: string | null;
  analysis: string | null;
  maxScore: string;
  reviewStatus: "draft_review_required";
  questionGroup?: AiPaperQuestionGroupSnapshotDto | null;
};

export type PersonalAiGenerationLearningPaperSourceQuestionDto = {
  questionPublicId: string;
  sourceKind: PersonalAiGenerationLearningPaperQuestionSourceKind;
  questionType: PersonalAiGenerationLearningSessionQuestionType;
  difficulty: string | null;
  knowledgeNodeLabels: string[];
  questionStem: string;
  questionOptions: PersonalAiGenerationLearningSessionQuestionOptionDto[];
  standardAnswerLabels: string[];
  standardAnswerText: string | null;
  analysis: string | null;
  questionGroup?: AiPaperQuestionGroupSnapshotDto | null;
};

export type PersonalAiGenerationLearningSessionDto = {
  sessionPublicId: string;
  contentDomain: PersonalAiGenerationLearningContentDomain;
  sourceResultPublicId: string | null;
  sourceTaskPublicId: string;
  ownerType: PersonalAiGenerationLearningSessionOwnerType;
  ownerPublicId: string;
  actorPublicId: string;
  lifecycleAvailability: PersonalAiGenerationLearningSessionLifecycleAvailability;
  authorizationSource: PersonalAiGenerationLearningSessionAuthorizationSource | null;
  authorizationPublicId: string | null;
  sessionStatus: PersonalAiGenerationLearningSessionStatus | null;
  sessionRevision: number | null;
  completedAt: string | null;
  completionSummary: PersonalAiGenerationLearningCompletionSummarySnapshotDto | null;
  evidenceStatus: EvidenceStatus;
  citationCount: number;
  questionCount: number;
  questions: PersonalAiGenerationLearningSessionQuestionDto[];
  formalWriteBoundary: PersonalAiGenerationLearningFormalWriteBoundaryDto;
  createdAt: string;
  updatedAt: string;
};

export type PersonalAiGenerationLearningSessionPublicQuestionDto = Omit<
  PersonalAiGenerationLearningSessionQuestionDto,
  "questionOptions" | "standardAnswerLabels" | "standardAnswerText" | "analysis"
> & {
  questionOptions: Omit<
    PersonalAiGenerationLearningSessionQuestionOptionDto,
    "isCorrect"
  >[];
};

export type PersonalAiGenerationLearningSessionPublicDto = Omit<
  PersonalAiGenerationLearningSessionDto,
  "authorizationPublicId" | "questions"
> & {
  questions: PersonalAiGenerationLearningSessionPublicQuestionDto[];
};

export type PersonalAiGenerationLearningSessionCreationInputDto = {
  sessionPublicId: string;
  sourceResultPublicId: string | null;
  sourceTaskPublicId: string;
  ownerType: PersonalAiGenerationLearningSessionOwnerType;
  ownerPublicId: string;
  actorPublicId: string;
  authorizationSource: PersonalAiGenerationLearningSessionAuthorizationSource;
  authorizationPublicId: string;
  questionDraftSnapshot: PersonalAiGenerationPrivateQuestionDraftSnapshotDto;
  evidenceStatus: EvidenceStatus;
  citationCount: number;
  createdAt: Date;
};

export type PersonalAiGenerationLearningPaperAssemblySessionCreationInputDto = {
  sessionPublicId: string;
  sourceResultPublicId: string | null;
  sourceTaskPublicId: string;
  ownerType: PersonalAiGenerationLearningSessionOwnerType;
  ownerPublicId: string;
  actorPublicId: string;
  authorizationSource: PersonalAiGenerationLearningSessionAuthorizationSource;
  authorizationPublicId: string;
  evidenceStatus: EvidenceStatus;
  citationCount: number;
  paperAssemblyContainer: AiPaperPlanAndSelectContainerDto;
  sourceQuestions: PersonalAiGenerationLearningPaperSourceQuestionDto[];
  createdAt: Date;
};

export type PersonalAiGenerationLearningSessionCreationResultDto =
  | {
      status: Extract<
        PersonalAiGenerationLearningSessionCreationStatus,
        "created"
      >;
      blockReason: null;
      session: PersonalAiGenerationLearningSessionDto;
    }
  | {
      status: Extract<
        PersonalAiGenerationLearningSessionCreationStatus,
        "blocked"
      >;
      blockReason: PersonalAiGenerationLearningSessionCreationBlockReason;
      session: null;
    };

export type PersonalAiGenerationLearningSessionPublicCreationResultDto =
  | {
      status: "created";
      blockReason: null;
      session: PersonalAiGenerationLearningSessionPublicDto;
    }
  | {
      status: "blocked";
      blockReason: PersonalAiGenerationLearningSessionCreationBlockReason;
      session: null;
    };

export type PersonalAiGenerationLearningSessionAnswerInputDto = {
  sessionPublicId: string;
  sessionQuestionPublicId: string;
  actorPublicId: string;
  authorizationSource: PersonalAiGenerationLearningSessionAuthorizationSource;
  authorizationPublicId: string;
  expectedAnswerRevision: number;
  selectedOptionLabels: string[];
  textAnswer: string | null;
  submittedAt: Date;
};

export type PersonalAiGenerationLearningSessionAnswerFeedbackDto = {
  status: PersonalAiGenerationLearningAnswerFeedbackStatus;
  blockReason: PersonalAiGenerationLearningAnswerBlockReason | null;
  sessionPublicId: string;
  sessionQuestionPublicId: string;
  actorPublicId: string;
  answerRevision: number | null;
  selectedOptionLabels: string[];
  textAnswer: string | null;
  isCorrect: boolean | null;
  score: string | null;
  maxScore: string | null;
  standardAnswerLabels: string[];
  standardAnswerText: string | null;
  analysis: string | null;
  aiScoringStatus: "blocked";
  formalWriteBoundary: PersonalAiGenerationLearningFormalWriteBoundaryDto;
  mistakeBookPublicId: string | null;
  submittedAt: string;
};

export type PersonalAiGenerationLearningSessionAnswerSaveResultDto =
  | {
      status: "saved" | "replayed";
      blockReason: null;
      answerFeedback: PersonalAiGenerationLearningSessionAnswerFeedbackDto;
    }
  | {
      status: "blocked";
      blockReason: Extract<
        PersonalAiGenerationLearningAnswerBlockReason,
        "answer_revision_conflict" | "answer_history_unavailable"
      >;
      answerFeedback: null;
    };

export type PersonalAiGenerationLearningSessionStatisticsDto = {
  questionCount: number;
  submittedCount: number;
  correctCount: number;
  incorrectCount: number;
  reviewRequiredCount: number;
  completionRate: number;
  accuracyRate: number | null;
  score: string;
  maxScore: string;
  updatedAt: string;
};

export type PersonalAiGenerationLearningSessionProgressDto = {
  sessionPublicId: string;
  contentDomain: PersonalAiGenerationLearningContentDomain;
  sourceResultPublicId: string | null;
  sourceTaskPublicId: string;
  ownerType: PersonalAiGenerationLearningSessionOwnerType;
  ownerPublicId: string;
  actorPublicId: string;
  lifecycleAvailability: PersonalAiGenerationLearningSessionLifecycleAvailability;
  sessionStatus: PersonalAiGenerationLearningSessionStatus | null;
  sessionRevision: number | null;
  completedAt: string | null;
  completionSummary: PersonalAiGenerationLearningCompletionSummarySnapshotDto | null;
  persistenceStatus: PersonalAiGenerationLearningPersistenceStatus;
  resumeStatus: PersonalAiGenerationLearningResumeStatus;
  evidenceStatus: EvidenceStatus;
  citationCount: number;
  questionCount: number;
  questions: PersonalAiGenerationLearningSessionPublicQuestionDto[];
  answerFeedbacks: PersonalAiGenerationLearningSessionAnswerFeedbackDto[];
  statistics: PersonalAiGenerationLearningSessionStatisticsDto;
  formalWriteBoundary: PersonalAiGenerationLearningFormalWriteBoundaryDto;
  createdAt: string;
};

export type PersonalAiGenerationLearningSessionProgressInputDto = {
  sessionPublicId: string;
  actorPublicId: string;
  authorizationSource: PersonalAiGenerationLearningSessionAuthorizationSource;
  authorizationPublicId: string;
};

export type PersonalAiGenerationLearningSessionCompleteInputDto = {
  sessionPublicId: string;
  actorPublicId: string;
  authorizationSource: PersonalAiGenerationLearningSessionAuthorizationSource;
  authorizationPublicId: string;
  expectedSessionRevision: number;
  completedAt: Date;
};

export type PersonalAiGenerationLearningSessionCompleteResultDto =
  | {
      status: "completed" | "replayed";
      blockReason: null;
      sessionRevision: number;
      completedAt: string;
      completionSummary: PersonalAiGenerationLearningCompletionSummarySnapshotDto;
    }
  | {
      status: "blocked";
      blockReason: PersonalAiGenerationLearningSessionCompleteBlockReason;
      sessionRevision: null;
      completedAt: null;
      completionSummary: null;
    };

export type PersonalAiGenerationLearningSessionHistoryQueryDto = {
  actorPublicId: string;
  ownerType: PersonalAiGenerationLearningSessionOwnerType;
  ownerPublicId: string;
  authorizationSource: PersonalAiGenerationLearningSessionAuthorizationSource;
  authorizationPublicId: string;
  page: number;
  pageSize: number;
};

export type PersonalAiGenerationLearningSessionHistoryItemDto = {
  sessionPublicId: string;
  sourceResultPublicId: string | null;
  sourceTaskPublicId: string;
  lifecycleAvailability: PersonalAiGenerationLearningSessionLifecycleAvailability;
  sessionStatus: PersonalAiGenerationLearningSessionStatus | null;
  sessionRevision: number | null;
  questionCount: number;
  submittedCount: number | null;
  completionRate: number | null;
  score: string | null;
  maxScore: string | null;
  canResume: boolean;
  canReview: boolean;
  canComplete: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
};

export type PersonalAiGenerationLearningSessionHistoryDto = {
  sessions: PersonalAiGenerationLearningSessionHistoryItemDto[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type PersonalAiGenerationLearningSessionAggregateStatisticsDto = {
  attemptCount: number;
  inProgressCount: number;
  completedCount: number;
  completedQuestionCount: number;
  submittedCount: number;
  correctCount: number;
  incorrectCount: number;
  reviewRequiredCount: number;
  completionRate: number | null;
  accuracyRate: number | null;
  score: string;
  maxScore: string;
};

export type PersonalAiGenerationLearningSessionProgressResultDto =
  | {
      status: Extract<
        PersonalAiGenerationLearningSessionProgressStatus,
        "ready"
      >;
      blockReason: null;
      progress: PersonalAiGenerationLearningSessionProgressDto;
    }
  | {
      status: Extract<
        PersonalAiGenerationLearningSessionProgressStatus,
        "blocked"
      >;
      blockReason: Extract<
        PersonalAiGenerationLearningAnswerBlockReason,
        "session_not_found" | "actor_not_allowed" | "answer_history_unavailable"
      >;
      progress: null;
    };

export type PersonalAiGenerationLearningSessionSaveResultDto =
  | {
      status: "saved";
      blockReason: null;
    }
  | {
      status: "blocked";
      blockReason: Extract<
        PersonalAiGenerationLearningSessionCreationBlockReason,
        "source_result_not_found" | "session_context_mismatch"
      >;
    };

export type PersonalAiGenerationLearningSessionRepository = {
  saveSession(
    session: PersonalAiGenerationLearningSessionDto,
  ):
    | Promise<PersonalAiGenerationLearningSessionSaveResultDto>
    | PersonalAiGenerationLearningSessionSaveResultDto;
  findSessionByPublicId(
    sessionPublicId: string,
  ):
    | Promise<PersonalAiGenerationLearningSessionDto | null>
    | PersonalAiGenerationLearningSessionDto
    | null;
  saveAnswerFeedback(input: {
    expectedAnswerRevision: number;
    authorizationSource: PersonalAiGenerationLearningSessionAuthorizationSource;
    authorizationPublicId: string;
    answerFeedback: PersonalAiGenerationLearningSessionAnswerFeedbackDto;
  }):
    | Promise<PersonalAiGenerationLearningSessionAnswerSaveResultDto>
    | PersonalAiGenerationLearningSessionAnswerSaveResultDto;
  listAnswerFeedbackBySessionPublicId(
    sessionPublicId: string,
  ):
    | Promise<PersonalAiGenerationLearningSessionAnswerFeedbackDto[]>
    | PersonalAiGenerationLearningSessionAnswerFeedbackDto[];
  validateCompletedSessionSummary(input: {
    session: PersonalAiGenerationLearningSessionDto;
    answerFeedbacks: PersonalAiGenerationLearningSessionAnswerFeedbackDto[];
  }): Promise<boolean> | boolean;
  completeSession(
    input: PersonalAiGenerationLearningSessionCompleteInputDto,
  ):
    | Promise<PersonalAiGenerationLearningSessionCompleteResultDto>
    | PersonalAiGenerationLearningSessionCompleteResultDto;
  listSessionHistory(
    input: PersonalAiGenerationLearningSessionHistoryQueryDto,
  ):
    | Promise<PersonalAiGenerationLearningSessionHistoryDto | null>
    | PersonalAiGenerationLearningSessionHistoryDto
    | null;
  getSessionStatistics(
    input: Omit<
      PersonalAiGenerationLearningSessionHistoryQueryDto,
      "page" | "pageSize"
    >,
  ):
    | Promise<PersonalAiGenerationLearningSessionAggregateStatisticsDto | null>
    | PersonalAiGenerationLearningSessionAggregateStatisticsDto
    | null;
};

export type PersonalAiGenerationLearningSessionService = {
  createLearningSession(
    input: PersonalAiGenerationLearningSessionCreationInputDto,
  ): Promise<PersonalAiGenerationLearningSessionCreationResultDto>;
  createLearningSessionFromPaperAssembly(
    input: PersonalAiGenerationLearningPaperAssemblySessionCreationInputDto,
  ): Promise<PersonalAiGenerationLearningSessionCreationResultDto>;
  submitLearningSessionAnswer(
    input: PersonalAiGenerationLearningSessionAnswerInputDto,
  ): Promise<PersonalAiGenerationLearningSessionAnswerFeedbackDto>;
  getLearningSessionProgress(
    input: PersonalAiGenerationLearningSessionProgressInputDto,
  ): Promise<PersonalAiGenerationLearningSessionProgressResultDto>;
  completeLearningSession(
    input: PersonalAiGenerationLearningSessionCompleteInputDto,
  ): Promise<PersonalAiGenerationLearningSessionCompleteResultDto>;
  listLearningSessionHistory(
    input: PersonalAiGenerationLearningSessionHistoryQueryDto,
  ): Promise<PersonalAiGenerationLearningSessionHistoryDto | null>;
  getLearningSessionStatistics(
    input: Omit<
      PersonalAiGenerationLearningSessionHistoryQueryDto,
      "page" | "pageSize"
    >,
  ): Promise<PersonalAiGenerationLearningSessionAggregateStatisticsDto | null>;
};

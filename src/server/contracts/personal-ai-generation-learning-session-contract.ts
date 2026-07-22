import type { EvidenceStatus } from "../models/ai-rag";
import type { PersonalAiGenerationPrivateQuestionDraftSnapshotDto } from "./personal-ai-generation-result-persistence-contract";
import type {
  AiPaperPlanAndSelectContainerDto,
  AiPaperQuestionSourceKind,
} from "./ai-paper-plan-and-select-contract";
import type {
  PersonalAiGenerationLearningAnswerBlockReason,
  PersonalAiGenerationLearningAnswerFeedbackStatus,
  PersonalAiGenerationLearningContentDomain,
  PersonalAiGenerationLearningFormalWriteStatus,
  PersonalAiGenerationLearningPersistenceStatus,
  PersonalAiGenerationLearningResumeStatus,
  PersonalAiGenerationLearningSessionCreationBlockReason,
  PersonalAiGenerationLearningSessionCreationStatus,
  PersonalAiGenerationLearningSessionOwnerType,
  PersonalAiGenerationLearningSessionProgressStatus,
  PersonalAiGenerationLearningSessionQuestionType,
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
};

export type PersonalAiGenerationLearningSessionDto = {
  sessionPublicId: string;
  contentDomain: PersonalAiGenerationLearningContentDomain;
  sourceResultPublicId: string | null;
  sourceTaskPublicId: string;
  ownerType: PersonalAiGenerationLearningSessionOwnerType;
  ownerPublicId: string;
  actorPublicId: string;
  evidenceStatus: EvidenceStatus;
  citationCount: number;
  questionCount: number;
  questions: PersonalAiGenerationLearningSessionQuestionDto[];
  formalWriteBoundary: PersonalAiGenerationLearningFormalWriteBoundaryDto;
  createdAt: string;
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
  "questions"
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
  persistenceStatus: PersonalAiGenerationLearningPersistenceStatus;
  resumeStatus: PersonalAiGenerationLearningResumeStatus;
  evidenceStatus: EvidenceStatus;
  citationCount: number;
  questionCount: number;
  answerFeedbacks: PersonalAiGenerationLearningSessionAnswerFeedbackDto[];
  statistics: PersonalAiGenerationLearningSessionStatisticsDto;
  formalWriteBoundary: PersonalAiGenerationLearningFormalWriteBoundaryDto;
  createdAt: string;
};

export type PersonalAiGenerationLearningSessionProgressInputDto = {
  sessionPublicId: string;
  actorPublicId: string;
  viewedAt: Date;
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
        "session_not_found" | "actor_not_allowed"
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
        "source_result_not_found"
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
  saveAnswerFeedback(
    answerFeedback: PersonalAiGenerationLearningSessionAnswerFeedbackDto,
  ): Promise<void> | void;
  listAnswerFeedbackBySessionPublicId(
    sessionPublicId: string,
  ):
    | Promise<PersonalAiGenerationLearningSessionAnswerFeedbackDto[]>
    | PersonalAiGenerationLearningSessionAnswerFeedbackDto[];
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
};

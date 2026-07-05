import type { EvidenceStatus } from "../models/ai-rag";
import type {
  PersonalAiGenerationLearningAnswerBlockReason,
  PersonalAiGenerationLearningAnswerFeedbackStatus,
  PersonalAiGenerationLearningContentDomain,
  PersonalAiGenerationLearningFormalWriteStatus,
  PersonalAiGenerationLearningSessionCreationBlockReason,
  PersonalAiGenerationLearningSessionCreationStatus,
  PersonalAiGenerationLearningSessionOwnerType,
  PersonalAiGenerationLearningSessionQuestionType,
} from "../models/personal-ai-generation-learning-session";
import type { AiGenerationRouteIntegratedVisibleGeneratedContent } from "./route-integrated-provider-execution-contract";

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

export type PersonalAiGenerationLearningSessionCreationInputDto = {
  sessionPublicId: string;
  sourceResultPublicId: string | null;
  sourceTaskPublicId: string;
  ownerType: PersonalAiGenerationLearningSessionOwnerType;
  ownerPublicId: string;
  actorPublicId: string;
  visibleGeneratedContent: AiGenerationRouteIntegratedVisibleGeneratedContent;
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

export type PersonalAiGenerationLearningSessionRepository = {
  saveSession(
    session: PersonalAiGenerationLearningSessionDto,
  ): Promise<void> | void;
  findSessionByPublicId(
    sessionPublicId: string,
  ):
    | Promise<PersonalAiGenerationLearningSessionDto | null>
    | PersonalAiGenerationLearningSessionDto
    | null;
};

export type PersonalAiGenerationLearningSessionService = {
  createLearningSession(
    input: PersonalAiGenerationLearningSessionCreationInputDto,
  ): Promise<PersonalAiGenerationLearningSessionCreationResultDto>;
  submitLearningSessionAnswer(
    input: PersonalAiGenerationLearningSessionAnswerInputDto,
  ): Promise<PersonalAiGenerationLearningSessionAnswerFeedbackDto>;
};

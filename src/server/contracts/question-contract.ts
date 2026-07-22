import type {
  FillBlankAnswer,
  MultiChoiceRule,
  Profession,
  QuestionStatus,
  QuestionDifficulty,
  QuestionType,
  ScoringMethod,
  Subject,
} from "../models/paper";
import type { ApiPagination } from "./api-response";

export type QuestionOptionDto = {
  label: string;
  contentRichText: string;
  isCorrect: boolean;
  sortOrder: number;
};

export type ScoringPointDto = {
  description: string;
  score: string;
  sortOrder: number;
};

export type FillBlankAnswerDto = FillBlankAnswer;

export type QuestionDto = {
  publicId: string;
  questionType: QuestionType;
  profession: Profession;
  level: number;
  subject: Subject;
  difficulty?: QuestionDifficulty | null;
  stemRichText: string;
  analysisRichText: string;
  standardAnswerRichText: string;
  status: QuestionStatus;
  isLocked: boolean;
  lockedAt: string | null;
  multiChoiceRule: MultiChoiceRule;
  scoringMethod: ScoringMethod;
  materialPublicId: string | null;
  questionOptions: QuestionOptionDto[];
  scoringPoints: ScoringPointDto[];
  fillBlankAnswers?: FillBlankAnswerDto[];
  knowledgeNodePublicIds: string[];
  tagPublicIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type QuestionResultDto = {
  question: QuestionDto;
};

export type QuestionDetailMaterialDto = {
  publicId: string;
  title: string;
  status: "available" | "disabled";
};

export type QuestionDetailKnowledgeNodeDto = {
  publicId: string;
  name: string;
  pathName: string;
  knStatus: "active" | "disabled";
};

export type QuestionDetailTagDto = {
  publicId: string;
  name: string;
};

export type QuestionPaperReferenceDto = {
  paperPublicId: string;
  name: string;
  paperStatus: "draft" | "published" | "archived";
  updatedAt: string;
};

export type QuestionDetailDto = QuestionDto & {
  material: QuestionDetailMaterialDto | null;
  knowledgeNodes: QuestionDetailKnowledgeNodeDto[];
  tags: QuestionDetailTagDto[];
  lockReason: {
    code: "paper_published";
    paperCount: number;
  } | null;
  paperReferences: {
    items: QuestionPaperReferenceDto[];
    pagination: ApiPagination;
  };
};

export type QuestionDetailResultDto = {
  question: QuestionDetailDto;
};

export type QuestionKnowledgeRecommendationItemDto = {
  candidatePublicId: string;
  knowledgeNodePublicId: string;
  name: string;
  pathName: string;
  confidence: "high" | "medium" | "low";
  reason: string;
  source: "ai_recommended";
  confirmationStatus: "pending_confirmation" | "confirmed" | "ignored";
  confidenceBasisPoint: number;
  citationCount: number;
};

export type QuestionKnowledgeRecommendationReviewStateDto = {
  questionUpdatedAt: string;
  currentQuestionUpdatedAt: string;
  taskPublicId: string;
  taskStatus: "pending" | "running" | "succeeded" | "failed" | "superseded";
  staleCheck: "question_updated_at_mismatch";
  bindingMode: "durable_question_binding";
};

export type QuestionKnowledgeRecommendationDto = {
  questionPublicId: string;
  recommendationStatus:
    | "pending"
    | "running"
    | "recommended"
    | "recommendation_failed"
    | "superseded";
  reviewState: QuestionKnowledgeRecommendationReviewStateDto;
  recommendations: QuestionKnowledgeRecommendationItemDto[];
  evidenceStatus: "sufficient" | "weak" | "none" | null;
  modelConfig: {
    modelConfigPublicId: string;
    promptTemplatePublicId: string;
  } | null;
  failureReason: string | null;
};

export type QuestionKnowledgeRecommendationResultDto = {
  recommendation: QuestionKnowledgeRecommendationDto;
};

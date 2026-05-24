import type {
  MultiChoiceRule,
  Profession,
  QuestionStatus,
  QuestionType,
  ScoringMethod,
  Subject,
} from "../models/paper";

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

export type QuestionDto = {
  publicId: string;
  questionType: QuestionType;
  profession: Profession;
  level: number;
  subject: Subject;
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
  knowledgeNodePublicIds: string[];
  tagPublicIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type QuestionResultDto = {
  question: QuestionDto;
};

export type QuestionKnowledgeRecommendationItemDto = {
  knowledgeNodePublicId: string;
  name: string;
  pathName: string;
  confidence: "high" | "medium" | "low";
  reason: string;
  source: "ai_recommended";
  confirmationStatus: "pending_confirmation";
};

export type QuestionKnowledgeRecommendationReviewStateDto = {
  questionUpdatedAt: string;
  staleCheck: "question_updated_at_mismatch";
  bindingMode: "local_review_only";
};

export type QuestionKnowledgeRecommendationDto = {
  questionPublicId: string;
  recommendationStatus: "recommended" | "recommendation_failed";
  reviewState: QuestionKnowledgeRecommendationReviewStateDto;
  recommendations: QuestionKnowledgeRecommendationItemDto[];
  modelConfig: {
    modelConfigPublicId: string;
    providerPublicId: string;
    providerDisplayName: string;
    providerKey: string;
    modelName: string;
    displayName: string;
    aiFuncType: "kn_recommendation";
    configVersion: number;
    promptTemplateKey: string;
    promptTemplateVersion: number;
  };
  failureReason: string | null;
};

export type QuestionKnowledgeRecommendationResultDto = {
  recommendation: QuestionKnowledgeRecommendationDto;
};

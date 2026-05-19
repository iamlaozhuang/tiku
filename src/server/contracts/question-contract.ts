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

import type {
  MultiChoiceRule,
  Profession,
  QuestionStatus,
  QuestionType,
  ScoringMethod,
  Subject,
} from "../models/paper";
import type {
  NormalizedCreateQuestionInput,
  NormalizedQuestionListInput,
  NormalizedUpdateQuestionInput,
} from "../validators/question";

export type QuestionOptionAccessRow = {
  id: number;
  question_id: number;
  label: string;
  content_rich_text: string;
  is_correct: boolean;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
};

export type ScoringPointAccessRow = {
  id: number;
  question_id: number;
  description: string;
  score: string;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
};

export type QuestionAccessRow = {
  id: number;
  public_id: string;
  question_type: QuestionType;
  profession: Profession;
  level: number;
  subject: Subject;
  stem_rich_text: string;
  analysis_rich_text: string;
  standard_answer_rich_text: string;
  status: QuestionStatus;
  is_locked: boolean;
  locked_at: Date | null;
  multi_choice_rule: MultiChoiceRule;
  scoring_method: ScoringMethod;
  material_id: number | null;
  material_public_id: string | null;
  question_options: QuestionOptionAccessRow[];
  scoring_points: ScoringPointAccessRow[];
  created_at: Date;
  updated_at: Date;
};

export type QuestionListResult = {
  rows: QuestionAccessRow[];
  total: number;
};

export type UpdateQuestionInput = NormalizedUpdateQuestionInput & {
  publicId: string;
};

export type QuestionRepository = {
  listQuestions(
    query: NormalizedQuestionListInput,
  ): Promise<QuestionListResult>;
  createQuestion(
    input: NormalizedCreateQuestionInput,
  ): Promise<QuestionAccessRow>;
  findQuestionByPublicId(publicId: string): Promise<QuestionAccessRow | null>;
  updateQuestion(input: UpdateQuestionInput): Promise<QuestionAccessRow>;
  disableQuestion(publicId: string): Promise<QuestionAccessRow | null>;
  copyQuestion(publicId: string): Promise<QuestionAccessRow | null>;
};

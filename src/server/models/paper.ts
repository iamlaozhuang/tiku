import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import { professionValues } from "@/db/schema/auth";
import {
  material,
  materialStatusValues,
  multiChoiceRuleValues,
  paper,
  paperAsset,
  paperAttachmentCreatableUsageValues,
  paperAttachmentUsageValues,
  paperGenerationMethodValues,
  paperQuestion,
  paperScoringPoint,
  paperSection,
  paperStatusValues,
  paperTypeValues,
  question,
  questionGroup,
  questionOption,
  questionDifficultyValues,
  questionStatusValues,
  questionTypeValues,
  type FillBlankAnswerValue,
  scoringMethodValues,
  scoringPoint,
  subjectValues,
} from "@/db/schema/paper";

export {
  materialStatusValues,
  multiChoiceRuleValues,
  paperAttachmentCreatableUsageValues,
  paperAttachmentUsageValues,
  paperGenerationMethodValues,
  paperStatusValues,
  paperTypeValues,
  professionValues,
  questionStatusValues,
  questionDifficultyValues,
  questionTypeValues,
  scoringMethodValues,
  subjectValues,
};

export type Profession = (typeof professionValues)[number];
export type Subject = (typeof subjectValues)[number];
export type ExamSubject = Subject;
export type QuestionType = (typeof questionTypeValues)[number];
export type QuestionStatus = (typeof questionStatusValues)[number];
export type QuestionDifficulty = (typeof questionDifficultyValues)[number];
export type MaterialStatus = (typeof materialStatusValues)[number];
export type PaperType = (typeof paperTypeValues)[number];
export type PaperGenerationMethod =
  (typeof paperGenerationMethodValues)[number];
export type PaperStatus = (typeof paperStatusValues)[number];
export type MultiChoiceRule = (typeof multiChoiceRuleValues)[number];
export type ScoringMethod = (typeof scoringMethodValues)[number];
export type PaperAttachmentUsage = (typeof paperAttachmentUsageValues)[number];
export type CreatablePaperAttachmentUsage =
  (typeof paperAttachmentCreatableUsageValues)[number];
export type FillBlankAnswer = FillBlankAnswerValue;

export type MaterialRow = InferSelectModel<typeof material>;
export type NewMaterialRow = InferInsertModel<typeof material>;

export type QuestionRow = InferSelectModel<typeof question>;
export type NewQuestionRow = InferInsertModel<typeof question>;

export type QuestionOptionRow = InferSelectModel<typeof questionOption>;
export type NewQuestionOptionRow = InferInsertModel<typeof questionOption>;

export type ScoringPointRow = InferSelectModel<typeof scoringPoint>;
export type NewScoringPointRow = InferInsertModel<typeof scoringPoint>;

export type PaperDbRow = InferSelectModel<typeof paper>;
export type NewPaperRow = InferInsertModel<typeof paper>;

export type PaperSectionRow = InferSelectModel<typeof paperSection>;
export type NewPaperSectionRow = InferInsertModel<typeof paperSection>;

export type QuestionGroupRow = InferSelectModel<typeof questionGroup>;
export type NewQuestionGroupRow = InferInsertModel<typeof questionGroup>;

export type PaperQuestionRow = InferSelectModel<typeof paperQuestion>;
export type NewPaperQuestionRow = InferInsertModel<typeof paperQuestion>;

export type PaperScoringPointRow = InferSelectModel<typeof paperScoringPoint>;
export type NewPaperScoringPointRow = InferInsertModel<
  typeof paperScoringPoint
>;

export type PaperAssetRow = InferSelectModel<typeof paperAsset>;
export type NewPaperAssetRow = InferInsertModel<typeof paperAsset>;

export type PaperRow = {
  id: number;
  public_id: string;
  title: string;
  profession: Profession;
  level: number;
  subject: ExamSubject;
  paper_type: PaperType;
  paper_status: PaperStatus;
  description: string | null;
  created_at: Date;
  updated_at: Date;
  published_at: Date | null;
};

export type PaperDto = {
  publicId: string;
  title: string;
  profession: Profession;
  level: number;
  subject: ExamSubject;
  paperType: PaperType;
  paperStatus: PaperStatus;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
};

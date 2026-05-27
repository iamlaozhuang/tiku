import type {
  MaterialStatus,
  PaperStatus,
  Profession,
  QuestionStatus,
  QuestionType,
  Subject,
} from "../models/paper";

export type MaterialQuestionReferenceDto = {
  questionPublicId: string;
  questionType: QuestionType;
  status: QuestionStatus;
  updatedAt: string;
};

export type MaterialPaperReferenceDto = {
  paperPublicId: string;
  name: string;
  paperStatus: PaperStatus;
  updatedAt: string;
};

export type MaterialReferenceListDto = {
  questions: MaterialQuestionReferenceDto[];
  papers: MaterialPaperReferenceDto[];
};

export type MaterialDto = {
  publicId: string;
  title: string;
  contentRichText: string;
  profession: Profession;
  level: number;
  subject: Subject;
  status: MaterialStatus;
  isLocked: boolean;
  lockedAt: string | null;
  references: MaterialReferenceListDto;
  createdAt: string;
  updatedAt: string;
};

export type MaterialResultDto = {
  material: MaterialDto;
};

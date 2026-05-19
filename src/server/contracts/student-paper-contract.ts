import type { AuthorizationType } from "./effective-authorization-contract";
import type { PaperType, Profession, Subject } from "../models/paper";

export type StudentPaperScopeDto = {
  profession: Profession;
  level: number;
  authorizationTypes: AuthorizationType[];
  expiresAt: string;
  status: "active";
};

export type StudentPaperSummaryDto = {
  publicId: string;
  name: string;
  profession: Profession;
  level: number;
  subject: Subject;
  paperType: PaperType | null;
  durationMinute: number | null;
  totalScore: string | null;
  publishedAt: string | null;
  questionCount: number;
  canPractice: boolean;
  canMockExam: boolean;
};

export type StudentPaperDetailDto = StudentPaperSummaryDto & {
  paperSnapshot: Record<string, unknown>;
};

export type StudentPaperListDto = {
  papers: StudentPaperSummaryDto[];
};

export type StudentPaperScopesDto = {
  scopes: StudentPaperScopeDto[];
};

export type StudentPaperDetailResultDto = {
  paper: StudentPaperDetailDto;
};

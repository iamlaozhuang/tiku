import type { PaperType, Profession, Subject } from "./paper";

export type PaperMockExamContentAccessStatus = "scope_only";

export type PaperMockExamScopeInput = {
  userPublicId: string;
  authorizationPublicId: string;
  paperPublicId: string;
  mockExamPublicId: string | null;
  profession: Profession;
  level: number;
  subject: Subject;
  paperType: PaperType;
};

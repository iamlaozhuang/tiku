import type { AuthorizationContextSourceType } from "./authorization-context";
import type { Profession } from "./auth";
import type { PaperType, Subject } from "./paper";

export type AuthorizationPaperMockExamAccessContextStatus =
  "context_summary_only";

export type AuthorizationPermissionBehaviorStatus = "unchanged";

export type AuthorizationPaperMockExamContextMatchStatus =
  | "matches_authorization"
  | "context_mismatch";

export type AuthorizationPaperAccessContextInput = {
  paperPublicId: string;
  profession: Profession;
  level: number;
  subject: Subject;
  paperType: PaperType;
};

export type AuthorizationMockExamAccessContextInput =
  AuthorizationPaperAccessContextInput & {
    mockExamPublicId: string;
  };

export type AuthorizationPaperMockExamAccessContextInput = {
  userPublicId: string;
  authorizationPublicId: string;
  authorizationType: AuthorizationContextSourceType;
  authorizationProfession: Profession;
  authorizationLevel: number;
  paperContext: AuthorizationPaperAccessContextInput | null;
  mockExamContext: AuthorizationMockExamAccessContextInput | null;
};

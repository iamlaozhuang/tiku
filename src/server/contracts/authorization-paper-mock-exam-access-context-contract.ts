import type {
  AuthorizationPaperMockExamAccessContextScopeStatus,
  AuthorizationPaperMockExamAccessContextStatus,
  AuthorizationPaperMockExamContextMatchStatus,
  AuthorizationPermissionBehaviorStatus,
} from "../models/authorization-paper-mock-exam-access-context";
import type { AuthorizationContextSourceType } from "../models/authorization-context";
import type { EffectiveAuthorizationEdition } from "./effective-authorization-contract";
import type { Profession } from "../models/auth";
import type { PaperType, Subject } from "../models/paper";

export type AuthorizationAccessContextAuthorizationDto = {
  authorizationPublicId: string;
  authorizationSource: AuthorizationContextSourceType;
  effectiveEdition: EffectiveAuthorizationEdition;
  profession: Profession;
  level: number;
  organizationPublicId: string | null;
};

export type AuthorizationPaperAccessContextDto = {
  paperPublicId: string;
  profession: Profession;
  level: number;
  subject: Subject;
  paperType: PaperType;
  contextMatchStatus: AuthorizationPaperMockExamContextMatchStatus;
};

export type AuthorizationMockExamAccessContextDto =
  AuthorizationPaperAccessContextDto & {
    mockExamPublicId: string;
  };

export type AuthorizationPaperMockExamAccessContextDto = {
  userPublicId: string;
  authorization: AuthorizationAccessContextAuthorizationDto;
  accessContextStatus: AuthorizationPaperMockExamAccessContextStatus;
  accessContextScopeStatus: AuthorizationPaperMockExamAccessContextScopeStatus;
  permissionBehaviorStatus: AuthorizationPermissionBehaviorStatus;
  paper: AuthorizationPaperAccessContextDto | null;
  mockExam: AuthorizationMockExamAccessContextDto | null;
};

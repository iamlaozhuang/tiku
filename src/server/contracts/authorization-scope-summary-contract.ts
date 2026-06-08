import type { Profession } from "../models/auth";
import type {
  AuthorizationScopeContentAccessStatus,
  AuthorizationScopeMatchStatus,
  AuthorizationScopeSummaryRuntimeStatus,
} from "../models/authorization-scope-summary";
import type { AuthorizationContextSourceType } from "../models/authorization-context";

export type AuthorizationScopeRedactionStatus = "redacted";

export type AuthorizationScopeAuthorizationDto = {
  publicId: string;
  authorizationType: AuthorizationContextSourceType;
  profession: Profession;
  level: number;
};

export type AuthorizationScopeContextDto = {
  publicId: string;
  profession: Profession;
  level: number;
  scopeMatchStatus: AuthorizationScopeMatchStatus;
};

export type AuthorizationScopeSummaryContextDto = {
  contentAccessStatus: AuthorizationScopeContentAccessStatus;
  paper: AuthorizationScopeContextDto | null;
  mockExam: AuthorizationScopeContextDto | null;
};

export type AuthorizationScopeEvidenceReferencesDto = {
  auditLogPublicId: string | null;
  aiCallLogPublicId: string | null;
  redactionStatus: AuthorizationScopeRedactionStatus;
};

export type AuthorizationScopeSummaryDto = {
  userPublicId: string;
  runtimeStatus: AuthorizationScopeSummaryRuntimeStatus;
  authorization: AuthorizationScopeAuthorizationDto;
  contextScope: AuthorizationScopeSummaryContextDto;
  evidenceReferences: AuthorizationScopeEvidenceReferencesDto;
};

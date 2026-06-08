import type { Profession } from "./auth";
import type { AuthorizationContextSourceType } from "./authorization-context";

export type AuthorizationScopeSummaryRuntimeStatus = "local_contract_only";

export type AuthorizationScopeContentAccessStatus = "scope_only";

export type AuthorizationScopeMatchStatus =
  | "matches_authorization"
  | "context_mismatch";

export type AuthorizationScopeContext = {
  publicId: string;
  profession: Profession;
  level: number;
};

export type AuthorizationScopeSummaryInput = {
  userPublicId: string;
  authorizationPublicId: string;
  authorizationType: AuthorizationContextSourceType;
  profession: Profession;
  level: number;
  paperScope: AuthorizationScopeContext | null;
  mockExamScope: AuthorizationScopeContext | null;
  auditLogPublicId: string | null;
  aiCallLogPublicId: string | null;
};

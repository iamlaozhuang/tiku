import type { AuthStatus, Profession } from "../models/auth";
import type { AuthorizationContextSourceType } from "../models/authorization-context";

export type AuthorizationContextRedactionStatus = "redacted";

export type AuthorizationContextAuthorizationDto = {
  publicId: string;
  authorizationType: AuthorizationContextSourceType;
  profession: Profession;
  level: number;
  startsAt: string;
  expiresAt: string;
  status: AuthStatus;
  organizationPublicId: string | null;
};

export type AuthorizationContextRedeemCodeReferenceDto = {
  publicId: string | null;
  redactionStatus: AuthorizationContextRedactionStatus;
};

export type AuthorizationContextScopeDto = {
  paperPublicId: string | null;
  mockExamPublicId: string | null;
};

export type AuthorizationContextEvidenceReferencesDto = {
  auditLogPublicId: string | null;
  aiCallLogPublicId: string | null;
  redactionStatus: AuthorizationContextRedactionStatus;
};

export type AuthorizationContextDto = {
  userPublicId: string;
  authorization: AuthorizationContextAuthorizationDto;
  redeemCodeReference: AuthorizationContextRedeemCodeReferenceDto;
  contextScope: AuthorizationContextScopeDto;
  evidenceReferences: AuthorizationContextEvidenceReferencesDto;
};

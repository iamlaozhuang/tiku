import type { AuthStatus, Profession } from "./auth";

export type AuthorizationContextSourceType = "personal_auth" | "org_auth";

export type AuthorizationContextSource = {
  authorizationType: AuthorizationContextSourceType;
  publicId: string;
  profession: Profession;
  level: number;
  startsAt: Date;
  expiresAt: Date;
  status: AuthStatus;
  organizationPublicId: string | null;
  redeemCodePublicId: string | null;
};

export type AuthorizationContextScope = {
  paperPublicId: string | null;
  mockExamPublicId: string | null;
};

export type AuthorizationContextEvidenceReferences = {
  auditLogPublicId: string | null;
  aiCallLogPublicId: string | null;
};

export type AuthorizationContextInput = {
  userPublicId: string;
  authorizationSources: AuthorizationContextSource[];
  scope: AuthorizationContextScope;
  evidenceReferences: AuthorizationContextEvidenceReferences;
};

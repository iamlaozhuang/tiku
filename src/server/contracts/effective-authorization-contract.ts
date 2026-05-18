import type { AuthStatus, Profession } from "../models/auth";

export type AuthorizationType = "personal_auth" | "org_auth";

export type AuthorizationListItemDto = {
  publicId: string;
  authorizationType: AuthorizationType;
  profession: Profession;
  level: number;
  startsAt: string;
  expiresAt: string;
  status: AuthStatus;
  organizationPublicId: string | null;
  organizationName: string | null;
};

export type EffectiveAuthorizationDto = {
  profession: Profession;
  level: number;
  authorizationTypes: AuthorizationType[];
  expiresAt: string;
  status: "active";
};

export type EffectiveAuthorizationListDto = {
  authorizations: AuthorizationListItemDto[];
  effectiveAuthorizations: EffectiveAuthorizationDto[];
};

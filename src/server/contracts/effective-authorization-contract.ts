import type { AuthStatus, Profession } from "../models/auth";

export type AuthorizationType = "personal_auth" | "org_auth";

export type EffectiveAuthorizationEdition = "standard" | "advanced";

export type EffectiveAuthorizationOwnerType =
  | "personal"
  | "organization"
  | "platform";

export type EffectiveAuthorizationBlockedReason =
  | "authorization_missing"
  | "production_enablement_blocked";

export type EffectiveAuthorizationContextDisplayStatus = "display_only";

export type EffectiveAuthorizationCapabilitiesDto = {
  canGenerateAiQuestion: boolean;
  canGenerateAiPaper: boolean;
  canCreateOrganizationTraining: boolean;
  canAnswerOrganizationTraining: boolean;
  canViewOrganizationTrainingSummary: boolean;
  canManageAuthorizationQuota: boolean;
};

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

export type EffectiveAuthorizationContextDto = {
  profession: Profession;
  level: number;
  contextDisplayStatus: EffectiveAuthorizationContextDisplayStatus;
  effectiveEdition: EffectiveAuthorizationEdition;
  authorizationSource: AuthorizationType;
  authorizationPublicId: string;
  ownerType: EffectiveAuthorizationOwnerType;
  ownerPublicId: string;
  organizationPublicId: string | null;
  quotaOwnerType: EffectiveAuthorizationOwnerType;
  quotaOwnerPublicId: string;
  capabilities: EffectiveAuthorizationCapabilitiesDto;
  blockedReason: EffectiveAuthorizationBlockedReason | null;
};

export type EffectiveAuthorizationListDto = {
  authorizations: AuthorizationListItemDto[];
  effectiveAuthorizations: EffectiveAuthorizationDto[];
  authorizationContexts?: EffectiveAuthorizationContextDto[];
};

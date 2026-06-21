import type {
  AuthStatus,
  AuthUpgradeStatus,
  AuthorizationEdition,
  Profession,
} from "../models/auth";

export type EditionAwareAuthorizationSource = "personal_auth" | "org_auth";

export type EditionAwareAuthorizationOwnerType = "personal" | "organization";

export type EditionAwareAuthorizationUpgradeStatus = AuthUpgradeStatus | "none";

export type EditionAwareAuthorizationDisplayStatus =
  | AuthStatus
  | AuthUpgradeStatus;

export type EditionAwareAuthorizationContextDto = {
  authorizationSource: EditionAwareAuthorizationSource;
  authorizationPublicId: string;
  edition: AuthorizationEdition;
  effectiveEdition: AuthorizationEdition;
  upgradeStatus: EditionAwareAuthorizationUpgradeStatus;
  profession: Profession;
  level: number;
  ownerType: EditionAwareAuthorizationOwnerType;
  ownerPublicId: string;
  organizationPublicId: string | null;
  quotaOwnerType: EditionAwareAuthorizationOwnerType;
  quotaOwnerPublicId: string;
  expiresAt: string;
  displayStatus: EditionAwareAuthorizationDisplayStatus;
};

export type EditionAwareAuthorizationListDto = {
  authorizationContexts: EditionAwareAuthorizationContextDto[];
};

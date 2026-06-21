import type {
  EditionAwareAuthorizationContextDto,
  EditionAwareAuthorizationDisplayStatus,
  EditionAwareAuthorizationListDto,
  EditionAwareAuthorizationOwnerType,
  EditionAwareAuthorizationSource,
  EditionAwareAuthorizationUpgradeStatus,
} from "../contracts/edition-aware-authorization-contract";
import type { AuthorizationEdition, Profession } from "../models/auth";

export type EditionAwareAuthorizationContextRow = {
  authorization_source: EditionAwareAuthorizationSource;
  authorization_public_id: string;
  edition: AuthorizationEdition;
  effective_edition: AuthorizationEdition;
  upgrade_status: EditionAwareAuthorizationUpgradeStatus;
  profession: Profession;
  level: number;
  owner_type: EditionAwareAuthorizationOwnerType;
  owner_public_id: string;
  organization_public_id: string | null;
  quota_owner_type: EditionAwareAuthorizationOwnerType;
  quota_owner_public_id: string;
  expires_at: Date;
  display_status: EditionAwareAuthorizationDisplayStatus;
};

export function mapEditionAwareAuthorizationContextToApi(
  authorizationContext: EditionAwareAuthorizationContextRow,
): EditionAwareAuthorizationContextDto {
  return {
    authorizationSource: authorizationContext.authorization_source,
    authorizationPublicId: authorizationContext.authorization_public_id,
    edition: authorizationContext.edition,
    effectiveEdition: authorizationContext.effective_edition,
    upgradeStatus: authorizationContext.upgrade_status,
    profession: authorizationContext.profession,
    level: authorizationContext.level,
    ownerType: authorizationContext.owner_type,
    ownerPublicId: authorizationContext.owner_public_id,
    organizationPublicId: authorizationContext.organization_public_id,
    quotaOwnerType: authorizationContext.quota_owner_type,
    quotaOwnerPublicId: authorizationContext.quota_owner_public_id,
    expiresAt: authorizationContext.expires_at.toISOString(),
    displayStatus: authorizationContext.display_status,
  };
}

export function mapEditionAwareAuthorizationListToApi(
  authorizationContexts: EditionAwareAuthorizationContextRow[],
): EditionAwareAuthorizationListDto {
  return {
    authorizationContexts: authorizationContexts.map(
      mapEditionAwareAuthorizationContextToApi,
    ),
  };
}

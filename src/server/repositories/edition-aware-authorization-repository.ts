import type {
  AuthStatus,
  AuthUpgradeSourceType,
  AuthUpgradeStatus,
  AuthorizationEdition,
  Profession,
} from "../models/auth";
import type { OrgStatus } from "../validators/organization";

export type EditionAwarePersonalAuthRow = {
  public_id: string;
  profession: Profession;
  level: number;
  starts_at: Date;
  expires_at: Date;
  status: AuthStatus;
  edition: AuthorizationEdition;
};

export type EditionAwareOrgAuthRow = {
  public_id: string;
  organization_public_id: string;
  organization_status: OrgStatus;
  profession: Profession;
  level: number;
  starts_at: Date;
  expires_at: Date;
  status: AuthStatus;
  edition: AuthorizationEdition;
};

export type EditionAwareAuthUpgradeRow = {
  public_id: string;
  personal_auth_public_id: string | null;
  org_auth_public_id: string | null;
  target_edition: AuthorizationEdition;
  source_type: AuthUpgradeSourceType;
  starts_at: Date;
  expires_at: Date;
  revoked_at: Date | null;
  status: AuthUpgradeStatus;
};

export type EditionAwareAuthorizationRepository = {
  listPersonalAuthsByUserPublicId(
    userPublicId: string,
  ): Promise<EditionAwarePersonalAuthRow[]>;
  listOrgAuthsByUserPublicId(
    userPublicId: string,
  ): Promise<EditionAwareOrgAuthRow[]>;
  listAuthUpgradesByAuthorizationPublicIds(
    authorizationPublicIds: string[],
  ): Promise<EditionAwareAuthUpgradeRow[]>;
};

type EditionAwareAuthorizationSources = {
  personalAuths: EditionAwarePersonalAuthRow[];
  orgAuths: EditionAwareOrgAuthRow[];
};

function appendUniquePublicId(publicIds: string[], publicId: string): string[] {
  if (publicIds.includes(publicId)) {
    return publicIds;
  }

  return [...publicIds, publicId];
}

export function collectEditionAwareAuthorizationPublicIds(
  sources: EditionAwareAuthorizationSources,
): string[] {
  return [...sources.personalAuths, ...sources.orgAuths].reduce(
    (publicIds, authorization) =>
      appendUniquePublicId(publicIds, authorization.public_id),
    [] as string[],
  );
}

function getAuthUpgradeAuthorizationPublicId(
  authUpgrade: EditionAwareAuthUpgradeRow,
): string | null {
  return authUpgrade.personal_auth_public_id ?? authUpgrade.org_auth_public_id;
}

export function groupEditionAwareAuthUpgradesByAuthorizationPublicId(
  authUpgrades: EditionAwareAuthUpgradeRow[],
): Record<string, EditionAwareAuthUpgradeRow[]> {
  return authUpgrades.reduce(
    (groupedAuthUpgrades, authUpgrade) => {
      const authorizationPublicId =
        getAuthUpgradeAuthorizationPublicId(authUpgrade);

      if (authorizationPublicId === null) {
        return groupedAuthUpgrades;
      }

      return {
        ...groupedAuthUpgrades,
        [authorizationPublicId]: [
          ...(groupedAuthUpgrades[authorizationPublicId] ?? []),
          authUpgrade,
        ],
      };
    },
    {} as Record<string, EditionAwareAuthUpgradeRow[]>,
  );
}

import {
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type {
  EditionAwareAuthorizationDisplayStatus,
  EditionAwareAuthorizationListDto,
  EditionAwareAuthorizationOwnerType,
  EditionAwareAuthorizationSource,
  EditionAwareAuthorizationUpgradeStatus,
} from "../contracts/edition-aware-authorization-contract";
import { mapEditionAwareAuthorizationListToApi } from "../mappers/edition-aware-authorization-mapper";
import type { AuthorizationEdition } from "../models/auth";
import {
  collectEditionAwareAuthorizationPublicIds,
  groupEditionAwareAuthUpgradesByAuthorizationPublicId,
  type EditionAwareAuthorizationRepository,
  type EditionAwareAuthUpgradeRow,
  type EditionAwareOrgAuthRow,
  type EditionAwarePersonalAuthRow,
} from "../repositories/edition-aware-authorization-repository";
import type { EditionAwareAuthorizationQuery } from "../validators/edition-aware-authorization";

export type EditionAwareAuthorizationUserContext = {
  userPublicId: string;
};

export type EditionAwareAuthorizationClock = {
  now(): Date;
};

export type EditionAwareAuthorizationService = {
  listAuthorizationContexts(
    userContext: EditionAwareAuthorizationUserContext,
    query: EditionAwareAuthorizationQuery,
  ): Promise<ApiResponse<EditionAwareAuthorizationListDto>>;
};

type EditionAwareSourceContext = {
  authorizationSource: EditionAwareAuthorizationSource;
  authorizationPublicId: string;
  edition: AuthorizationEdition;
  profession: EditionAwarePersonalAuthRow["profession"];
  level: number;
  ownerType: EditionAwareAuthorizationOwnerType;
  ownerPublicId: string;
  organizationPublicId: string | null;
  quotaOwnerType: EditionAwareAuthorizationOwnerType;
  quotaOwnerPublicId: string;
  expiresAt: Date;
  displayStatus: EditionAwareAuthorizationDisplayStatus;
};

type EditionEvaluation = {
  effectiveEdition: AuthorizationEdition;
  upgradeStatus: EditionAwareAuthorizationUpgradeStatus;
};

const systemClock: EditionAwareAuthorizationClock = {
  now() {
    return new Date();
  },
};

function isActiveBetween(startsAt: Date, expiresAt: Date, now: Date): boolean {
  return startsAt <= now && expiresAt >= now;
}

function isActivePersonalAuth(
  personalAuth: EditionAwarePersonalAuthRow,
  now: Date,
): boolean {
  return (
    personalAuth.status === "active" &&
    isActiveBetween(personalAuth.starts_at, personalAuth.expires_at, now)
  );
}

function isActiveOrgAuth(orgAuth: EditionAwareOrgAuthRow, now: Date): boolean {
  return (
    orgAuth.status === "active" &&
    orgAuth.organization_status === "active" &&
    isActiveBetween(orgAuth.starts_at, orgAuth.expires_at, now)
  );
}

function isActiveAuthUpgrade(
  authUpgrade: EditionAwareAuthUpgradeRow,
  now: Date,
): boolean {
  return (
    authUpgrade.status === "active" &&
    authUpgrade.revoked_at === null &&
    authUpgrade.starts_at <= now &&
    authUpgrade.expires_at >= now
  );
}

function getFallbackUpgradeStatus(
  authUpgrades: EditionAwareAuthUpgradeRow[],
  now: Date,
): EditionAwareAuthorizationUpgradeStatus {
  if (
    authUpgrades.some(
      (authUpgrade) =>
        authUpgrade.status === "revoked" || authUpgrade.revoked_at !== null,
    )
  ) {
    return "revoked";
  }

  if (
    authUpgrades.some(
      (authUpgrade) =>
        authUpgrade.status === "expired" || authUpgrade.expires_at < now,
    )
  ) {
    return "expired";
  }

  return "none";
}

function evaluateEdition(
  sourceEdition: AuthorizationEdition,
  authUpgrades: EditionAwareAuthUpgradeRow[],
  now: Date,
): EditionEvaluation {
  if (sourceEdition === "advanced") {
    return {
      effectiveEdition: "advanced",
      upgradeStatus: "none",
    };
  }

  const activeAuthUpgrade = authUpgrades.find((authUpgrade) =>
    isActiveAuthUpgrade(authUpgrade, now),
  );

  if (activeAuthUpgrade !== undefined) {
    return {
      effectiveEdition: activeAuthUpgrade.target_edition,
      upgradeStatus: "active",
    };
  }

  return {
    effectiveEdition: "standard",
    upgradeStatus: getFallbackUpgradeStatus(authUpgrades, now),
  };
}

function mapPersonalAuthToSourceContext(
  userPublicId: string,
  personalAuth: EditionAwarePersonalAuthRow,
): EditionAwareSourceContext {
  return {
    authorizationSource: "personal_auth",
    authorizationPublicId: personalAuth.public_id,
    edition: personalAuth.edition,
    profession: personalAuth.profession,
    level: personalAuth.level,
    ownerType: "personal",
    ownerPublicId: userPublicId,
    organizationPublicId: null,
    quotaOwnerType: "personal",
    quotaOwnerPublicId: userPublicId,
    expiresAt: personalAuth.expires_at,
    displayStatus: personalAuth.status,
  };
}

function mapOrgAuthToSourceContext(
  orgAuth: EditionAwareOrgAuthRow,
): EditionAwareSourceContext {
  return {
    authorizationSource: "org_auth",
    authorizationPublicId: orgAuth.public_id,
    edition: orgAuth.edition,
    profession: orgAuth.profession,
    level: orgAuth.level,
    ownerType: "organization",
    ownerPublicId: orgAuth.organization_public_id,
    organizationPublicId: orgAuth.organization_public_id,
    quotaOwnerType: "organization",
    quotaOwnerPublicId: orgAuth.organization_public_id,
    expiresAt: orgAuth.expires_at,
    displayStatus: orgAuth.status,
  };
}

function matchesQuery(
  sourceContext: EditionAwareSourceContext,
  editionEvaluation: EditionEvaluation,
  query: EditionAwareAuthorizationQuery,
): boolean {
  return (
    (query.profession === null ||
      query.profession === sourceContext.profession) &&
    (query.level === null || query.level === sourceContext.level) &&
    (query.authorizationSource === null ||
      query.authorizationSource === sourceContext.authorizationSource) &&
    (query.effectiveEdition === null ||
      query.effectiveEdition === editionEvaluation.effectiveEdition)
  );
}

function mapSourceContextToRow(
  sourceContext: EditionAwareSourceContext,
  editionEvaluation: EditionEvaluation,
) {
  return {
    authorization_source: sourceContext.authorizationSource,
    authorization_public_id: sourceContext.authorizationPublicId,
    edition: sourceContext.edition,
    effective_edition: editionEvaluation.effectiveEdition,
    upgrade_status: editionEvaluation.upgradeStatus,
    profession: sourceContext.profession,
    level: sourceContext.level,
    owner_type: sourceContext.ownerType,
    owner_public_id: sourceContext.ownerPublicId,
    organization_public_id: sourceContext.organizationPublicId,
    quota_owner_type: sourceContext.quotaOwnerType,
    quota_owner_public_id: sourceContext.quotaOwnerPublicId,
    expires_at: sourceContext.expiresAt,
    display_status: sourceContext.displayStatus,
  };
}

export function createEditionAwareAuthorizationService(
  repository: EditionAwareAuthorizationRepository,
  clock: EditionAwareAuthorizationClock = systemClock,
): EditionAwareAuthorizationService {
  return {
    async listAuthorizationContexts(userContext, query) {
      const now = clock.now();
      const [personalAuths, orgAuths] = await Promise.all([
        repository.listPersonalAuthsByUserPublicId(userContext.userPublicId),
        repository.listOrgAuthsByUserPublicId(userContext.userPublicId),
      ]);
      const activePersonalAuths = personalAuths.filter((personalAuth) =>
        isActivePersonalAuth(personalAuth, now),
      );
      const activeOrgAuths = orgAuths.filter((orgAuth) =>
        isActiveOrgAuth(orgAuth, now),
      );
      const authorizationPublicIds = collectEditionAwareAuthorizationPublicIds({
        personalAuths: activePersonalAuths,
        orgAuths: activeOrgAuths,
      });
      const groupedAuthUpgrades =
        groupEditionAwareAuthUpgradesByAuthorizationPublicId(
          await repository.listAuthUpgradesByAuthorizationPublicIds(
            authorizationPublicIds,
          ),
        );
      const sourceContexts = [
        ...activePersonalAuths.map((personalAuth) =>
          mapPersonalAuthToSourceContext(
            userContext.userPublicId,
            personalAuth,
          ),
        ),
        ...activeOrgAuths.map(mapOrgAuthToSourceContext),
      ];
      const authorizationContextRows = sourceContexts.flatMap(
        (sourceContext) => {
          const editionEvaluation = evaluateEdition(
            sourceContext.edition,
            groupedAuthUpgrades[sourceContext.authorizationPublicId] ?? [],
            now,
          );

          if (!matchesQuery(sourceContext, editionEvaluation, query)) {
            return [];
          }

          return [mapSourceContextToRow(sourceContext, editionEvaluation)];
        },
      );

      return createSuccessResponse(
        mapEditionAwareAuthorizationListToApi(authorizationContextRows),
      );
    },
  };
}

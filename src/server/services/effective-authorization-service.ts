import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type {
  EffectiveAuthorizationBlockedReason,
  EffectiveAuthorizationCapabilitiesDto,
  EffectiveAuthorizationContextDto,
  EffectiveAuthorizationEdition,
  EffectiveAuthorizationListDto,
  EffectiveAuthorizationUpgradeStatus,
} from "../contracts/effective-authorization-contract";
import { mapEffectiveAuthorizationListToApi } from "../mappers/effective-authorization-mapper";
import type {
  EffectiveAuthUpgradeRow,
  EffectiveAuthorizationRepository,
  EffectiveOrgAuthRow,
  EffectivePersonalAuthRow,
} from "../repositories/effective-authorization-repository";

export type EffectiveAuthorizationUserContext = {
  userPublicId: string;
};

export type EffectiveAuthorizationClock = {
  now(): Date;
};

export type EffectiveAuthorizationCapabilityConfig = {
  isProductionEnablementConfigured: boolean;
};

export type EffectiveAuthorizationService = {
  listEffectiveAuthorizations(
    userContext: EffectiveAuthorizationUserContext,
  ): Promise<ApiResponse<EffectiveAuthorizationListDto | null>>;
};

const systemClock: EffectiveAuthorizationClock = {
  now() {
    return new Date();
  },
};

const defaultCapabilityConfig: EffectiveAuthorizationCapabilityConfig = {
  isProductionEnablementConfigured: false,
};

const disabledCapabilities: EffectiveAuthorizationCapabilitiesDto = {
  canGenerateAiQuestion: false,
  canGenerateAiPaper: false,
  canCreateOrganizationTraining: false,
  canAnswerOrganizationTraining: false,
  canViewOrganizationTrainingSummary: false,
  canManageAuthorizationQuota: false,
};

type EffectiveAuthorizationEditionRow = {
  effective_edition?: EffectiveAuthorizationEdition;
};

type EffectiveAuthorizationEditionEvaluation = {
  edition: EffectiveAuthorizationEdition;
  effectiveEdition: EffectiveAuthorizationEdition;
  upgradeStatus: EffectiveAuthorizationUpgradeStatus;
};

function isActiveBetween(startsAt: Date, expiresAt: Date, now: Date): boolean {
  return startsAt <= now && expiresAt >= now;
}

function isEffectivePersonalAuth(
  personalAuth: EffectivePersonalAuthRow,
  now: Date,
): boolean {
  return (
    personalAuth.status === "active" &&
    isActiveBetween(personalAuth.starts_at, personalAuth.expires_at, now)
  );
}

function isEffectiveOrgAuth(orgAuth: EffectiveOrgAuthRow, now: Date): boolean {
  return (
    orgAuth.status === "active" &&
    orgAuth.organization_status === "active" &&
    isActiveBetween(orgAuth.starts_at, orgAuth.expires_at, now)
  );
}

function getEffectiveEdition(
  authorization: EffectivePersonalAuthRow | EffectiveOrgAuthRow,
): EffectiveAuthorizationEdition {
  return (
    (authorization as EffectiveAuthorizationEditionRow).effective_edition ??
    "standard"
  );
}

function getSourceEdition(
  authorization: EffectivePersonalAuthRow | EffectiveOrgAuthRow,
): EffectiveAuthorizationEdition {
  return authorization.edition ?? "standard";
}

function getUpgradeAuthorizationPublicId(
  authUpgrade: EffectiveAuthUpgradeRow,
): string | null {
  return authUpgrade.personal_auth_public_id ?? authUpgrade.org_auth_public_id;
}

function isActiveAuthUpgrade(
  authUpgrade: EffectiveAuthUpgradeRow,
  now: Date,
): boolean {
  return (
    authUpgrade.status === "active" &&
    authUpgrade.revoked_at === null &&
    isActiveBetween(authUpgrade.starts_at, authUpgrade.expires_at, now)
  );
}

function selectActiveAuthUpgrade(
  authUpgrades: EffectiveAuthUpgradeRow[],
  now: Date,
): EffectiveAuthUpgradeRow | null {
  return (
    [...authUpgrades]
      .filter((authUpgrade) => isActiveAuthUpgrade(authUpgrade, now))
      .sort(
        (left, right) => right.expires_at.getTime() - left.expires_at.getTime(),
      )[0] ?? null
  );
}

function getInactiveAuthUpgradeStatus(
  authUpgrades: EffectiveAuthUpgradeRow[],
  now: Date,
): EffectiveAuthorizationUpgradeStatus {
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

function evaluateAuthorizationEdition(
  authorization: EffectivePersonalAuthRow | EffectiveOrgAuthRow,
  authUpgrades: EffectiveAuthUpgradeRow[],
  now: Date,
): EffectiveAuthorizationEditionEvaluation {
  const edition = getSourceEdition(authorization);

  if (edition === "advanced") {
    return {
      edition,
      effectiveEdition: "advanced",
      upgradeStatus: "none",
    };
  }

  const activeAuthUpgrade = selectActiveAuthUpgrade(authUpgrades, now);

  if (activeAuthUpgrade !== null) {
    return {
      edition,
      effectiveEdition: activeAuthUpgrade.target_edition,
      upgradeStatus: activeAuthUpgrade.status,
    };
  }

  return {
    edition,
    effectiveEdition: getEffectiveEdition(authorization),
    upgradeStatus: getInactiveAuthUpgradeStatus(authUpgrades, now),
  };
}

function groupAuthUpgradesByAuthorizationPublicId(
  authUpgrades: EffectiveAuthUpgradeRow[],
): Map<string, EffectiveAuthUpgradeRow[]> {
  const groupedAuthUpgrades = new Map<string, EffectiveAuthUpgradeRow[]>();

  for (const authUpgrade of authUpgrades) {
    const authorizationPublicId = getUpgradeAuthorizationPublicId(authUpgrade);

    if (authorizationPublicId === null) {
      continue;
    }

    groupedAuthUpgrades.set(authorizationPublicId, [
      ...(groupedAuthUpgrades.get(authorizationPublicId) ?? []),
      authUpgrade,
    ]);
  }

  return groupedAuthUpgrades;
}

async function listAuthUpgradesByAuthorizationPublicId(
  effectiveAuthorizationRepository: EffectiveAuthorizationRepository,
  authorizationPublicIds: string[],
): Promise<Map<string, EffectiveAuthUpgradeRow[]>> {
  if (
    authorizationPublicIds.length === 0 ||
    effectiveAuthorizationRepository.listAuthUpgradesByAuthorizationPublicIds ===
      undefined
  ) {
    return new Map();
  }

  return groupAuthUpgradesByAuthorizationPublicId(
    await effectiveAuthorizationRepository.listAuthUpgradesByAuthorizationPublicIds(
      authorizationPublicIds,
    ),
  );
}

function getAdvancedBlockedReason(
  effectiveEdition: EffectiveAuthorizationEdition,
  isProductionEnablementConfigured: boolean,
): EffectiveAuthorizationBlockedReason | null {
  if (effectiveEdition === "advanced" && !isProductionEnablementConfigured) {
    return "production_enablement_blocked";
  }

  return null;
}

function createPersonalCapabilities(
  effectiveEdition: EffectiveAuthorizationEdition,
  isProductionEnablementConfigured: boolean,
): EffectiveAuthorizationCapabilitiesDto {
  if (effectiveEdition !== "advanced" || !isProductionEnablementConfigured) {
    return disabledCapabilities;
  }

  return {
    ...disabledCapabilities,
    canGenerateAiQuestion: true,
    canGenerateAiPaper: true,
  };
}

function createOrgCapabilities(
  effectiveEdition: EffectiveAuthorizationEdition,
  isProductionEnablementConfigured: boolean,
): EffectiveAuthorizationCapabilitiesDto {
  if (effectiveEdition !== "advanced" || !isProductionEnablementConfigured) {
    return disabledCapabilities;
  }

  return {
    ...disabledCapabilities,
    canCreateOrganizationTraining: true,
    canAnswerOrganizationTraining: true,
    canViewOrganizationTrainingSummary: true,
  };
}

function mapPersonalAuthToAuthorizationContext(
  userPublicId: string,
  personalAuth: EffectivePersonalAuthRow,
  editionEvaluation: EffectiveAuthorizationEditionEvaluation,
  isProductionEnablementConfigured: boolean,
): EffectiveAuthorizationContextDto {
  const { edition, effectiveEdition, upgradeStatus } = editionEvaluation;

  return {
    profession: personalAuth.profession,
    level: personalAuth.level,
    contextDisplayStatus: "display_only",
    edition,
    effectiveEdition,
    upgradeStatus,
    expiresAt: personalAuth.expires_at.toISOString(),
    displayStatus: personalAuth.status,
    authorizationSource: "personal_auth",
    authorizationPublicId: personalAuth.public_id,
    ownerType: "personal",
    ownerPublicId: userPublicId,
    organizationPublicId: null,
    quotaOwnerType: "personal",
    quotaOwnerPublicId: userPublicId,
    capabilities: createPersonalCapabilities(
      effectiveEdition,
      isProductionEnablementConfigured,
    ),
    blockedReason: getAdvancedBlockedReason(
      effectiveEdition,
      isProductionEnablementConfigured,
    ),
  };
}

function mapOrgAuthToAuthorizationContext(
  orgAuth: EffectiveOrgAuthRow,
  editionEvaluation: EffectiveAuthorizationEditionEvaluation,
  isProductionEnablementConfigured: boolean,
): EffectiveAuthorizationContextDto {
  const { edition, effectiveEdition, upgradeStatus } = editionEvaluation;

  return {
    profession: orgAuth.profession,
    level: orgAuth.level,
    contextDisplayStatus: "display_only",
    edition,
    effectiveEdition,
    upgradeStatus,
    expiresAt: orgAuth.expires_at.toISOString(),
    displayStatus: orgAuth.status,
    authorizationSource: "org_auth",
    authorizationPublicId: orgAuth.public_id,
    ownerType: "organization",
    ownerPublicId: orgAuth.organization_public_id,
    organizationPublicId: orgAuth.organization_public_id,
    quotaOwnerType: "organization",
    quotaOwnerPublicId: orgAuth.organization_public_id,
    capabilities: createOrgCapabilities(
      effectiveEdition,
      isProductionEnablementConfigured,
    ),
    blockedReason: getAdvancedBlockedReason(
      effectiveEdition,
      isProductionEnablementConfigured,
    ),
  };
}

export function createEffectiveAuthorizationService(
  effectiveAuthorizationRepository: EffectiveAuthorizationRepository,
  clock: EffectiveAuthorizationClock = systemClock,
  capabilityConfig: EffectiveAuthorizationCapabilityConfig = defaultCapabilityConfig,
): EffectiveAuthorizationService {
  return {
    async listEffectiveAuthorizations(userContext) {
      const now = clock.now();
      const [personalAuths, orgAuths] = await Promise.all([
        effectiveAuthorizationRepository.listPersonalAuthsByUserPublicId(
          userContext.userPublicId,
        ),
        effectiveAuthorizationRepository.listOrgAuthsByUserPublicId(
          userContext.userPublicId,
        ),
      ]);
      const effectivePersonalAuths = personalAuths.filter((personalAuth) =>
        isEffectivePersonalAuth(personalAuth, now),
      );
      const effectiveOrgAuths = orgAuths.filter((orgAuth) =>
        isEffectiveOrgAuth(orgAuth, now),
      );
      const authUpgradesByAuthorizationPublicId =
        await listAuthUpgradesByAuthorizationPublicId(
          effectiveAuthorizationRepository,
          [
            ...effectivePersonalAuths.map(
              (personalAuth) => personalAuth.public_id,
            ),
            ...effectiveOrgAuths.map((orgAuth) => orgAuth.public_id),
          ],
        );
      const isProductionEnablementConfigured =
        capabilityConfig.isProductionEnablementConfigured;

      return createSuccessResponse({
        ...mapEffectiveAuthorizationListToApi({
          personalAuths: effectivePersonalAuths,
          orgAuths: effectiveOrgAuths,
        }),
        authorizationContexts: [
          ...effectivePersonalAuths.map((personalAuth) =>
            mapPersonalAuthToAuthorizationContext(
              userContext.userPublicId,
              personalAuth,
              evaluateAuthorizationEdition(
                personalAuth,
                authUpgradesByAuthorizationPublicId.get(
                  personalAuth.public_id,
                ) ?? [],
                now,
              ),
              isProductionEnablementConfigured,
            ),
          ),
          ...effectiveOrgAuths.map((orgAuth) =>
            mapOrgAuthToAuthorizationContext(
              orgAuth,
              evaluateAuthorizationEdition(
                orgAuth,
                authUpgradesByAuthorizationPublicId.get(orgAuth.public_id) ??
                  [],
                now,
              ),
              isProductionEnablementConfigured,
            ),
          ),
        ],
      });
    },
  };
}

export function createUnavailableEffectiveAuthorizationService(): EffectiveAuthorizationService {
  return {
    async listEffectiveAuthorizations() {
      return createErrorResponse(
        503007,
        "Effective authorization runtime is not configured.",
      );
    },
  };
}

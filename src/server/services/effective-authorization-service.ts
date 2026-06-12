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
} from "../contracts/effective-authorization-contract";
import { mapEffectiveAuthorizationListToApi } from "../mappers/effective-authorization-mapper";
import type {
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
  isProductionEnablementConfigured: boolean,
): EffectiveAuthorizationContextDto {
  const effectiveEdition = getEffectiveEdition(personalAuth);

  return {
    profession: personalAuth.profession,
    level: personalAuth.level,
    contextDisplayStatus: "display_only",
    effectiveEdition,
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
  isProductionEnablementConfigured: boolean,
): EffectiveAuthorizationContextDto {
  const effectiveEdition = getEffectiveEdition(orgAuth);

  return {
    profession: orgAuth.profession,
    level: orgAuth.level,
    contextDisplayStatus: "display_only",
    effectiveEdition,
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
              isProductionEnablementConfigured,
            ),
          ),
          ...effectiveOrgAuths.map((orgAuth) =>
            mapOrgAuthToAuthorizationContext(
              orgAuth,
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

import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type { EffectiveAuthorizationListDto } from "../contracts/effective-authorization-contract";
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

export function createEffectiveAuthorizationService(
  effectiveAuthorizationRepository: EffectiveAuthorizationRepository,
  clock: EffectiveAuthorizationClock = systemClock,
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

      return createSuccessResponse(
        mapEffectiveAuthorizationListToApi({
          personalAuths: personalAuths.filter((personalAuth) =>
            isEffectivePersonalAuth(personalAuth, now),
          ),
          orgAuths: orgAuths.filter((orgAuth) =>
            isEffectiveOrgAuth(orgAuth, now),
          ),
        }),
      );
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

import type {
  AuthorizationListItemDto,
  EffectiveAuthorizationDto,
  EffectiveAuthorizationListDto,
} from "../contracts/effective-authorization-contract";
import type {
  EffectiveOrgAuthRow,
  EffectivePersonalAuthRow,
} from "../repositories/effective-authorization-repository";

type EffectiveAuthorizationListInput = {
  personalAuths: EffectivePersonalAuthRow[];
  orgAuths: EffectiveOrgAuthRow[];
};

function mapPersonalAuthToAuthorizationItem(
  personalAuth: EffectivePersonalAuthRow,
): AuthorizationListItemDto {
  return {
    publicId: personalAuth.public_id,
    authorizationType: "personal_auth",
    profession: personalAuth.profession,
    level: personalAuth.level,
    startsAt: personalAuth.starts_at.toISOString(),
    expiresAt: personalAuth.expires_at.toISOString(),
    status: personalAuth.status,
    organizationPublicId: null,
    organizationName: null,
  };
}

function mapOrgAuthToAuthorizationItem(
  orgAuth: EffectiveOrgAuthRow,
): AuthorizationListItemDto {
  return {
    publicId: orgAuth.public_id,
    authorizationType: "org_auth",
    profession: orgAuth.profession,
    level: orgAuth.level,
    startsAt: orgAuth.starts_at.toISOString(),
    expiresAt: orgAuth.expires_at.toISOString(),
    status: orgAuth.status,
    organizationPublicId: orgAuth.organization_public_id,
    organizationName: orgAuth.organization_name,
  };
}

function mergeEffectiveAuthorization(
  effectiveAuthorizations: EffectiveAuthorizationDto[],
  authorization: AuthorizationListItemDto,
): EffectiveAuthorizationDto[] {
  const currentIndex = effectiveAuthorizations.findIndex(
    (effectiveAuthorization) =>
      effectiveAuthorization.profession === authorization.profession &&
      effectiveAuthorization.level === authorization.level,
  );

  if (currentIndex === -1) {
    return [
      ...effectiveAuthorizations,
      {
        profession: authorization.profession,
        level: authorization.level,
        authorizationTypes: [authorization.authorizationType],
        expiresAt: authorization.expiresAt,
        status: "active",
      },
    ];
  }

  return effectiveAuthorizations.map((effectiveAuthorization, index) => {
    if (index !== currentIndex) {
      return effectiveAuthorization;
    }

    const authorizationTypes =
      effectiveAuthorization.authorizationTypes.includes(
        authorization.authorizationType,
      )
        ? effectiveAuthorization.authorizationTypes
        : [
            ...effectiveAuthorization.authorizationTypes,
            authorization.authorizationType,
          ];
    const expiresAt =
      new Date(authorization.expiresAt) >
      new Date(effectiveAuthorization.expiresAt)
        ? authorization.expiresAt
        : effectiveAuthorization.expiresAt;

    return {
      ...effectiveAuthorization,
      authorizationTypes,
      expiresAt,
    };
  });
}

export function mapEffectiveAuthorizationListToApi(
  input: EffectiveAuthorizationListInput,
): EffectiveAuthorizationListDto {
  const authorizations = [
    ...input.personalAuths.map(mapPersonalAuthToAuthorizationItem),
    ...input.orgAuths.map(mapOrgAuthToAuthorizationItem),
  ];
  const effectiveAuthorizations = authorizations.reduce(
    mergeEffectiveAuthorization,
    [] as EffectiveAuthorizationDto[],
  );

  return {
    authorizations,
    effectiveAuthorizations,
  };
}

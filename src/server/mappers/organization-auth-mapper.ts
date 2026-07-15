import type {
  DisableOrganizationResultDto,
  OrgAuthDto,
  OrgAuthResultDto,
  OrganizationDto,
  OrganizationResultDto,
} from "../contracts/organization-auth-contract";
import type {
  DisableOrganizationResult,
  OrgAuthAccessRow,
  OrganizationAccessRow,
} from "../repositories/organization-auth-repository";

function formatNullableTimestamp(value: Date | null): string | null {
  return value === null ? null : value.toISOString();
}

export function mapOrganizationToApi(
  organization: OrganizationAccessRow,
): OrganizationDto {
  return {
    publicId: organization.public_id,
    name: organization.name,
    orgTier: organization.org_tier,
    parentOrganizationPublicId: organization.parent_organization_public_id,
    status: organization.status,
    contactName: organization.contact_name,
    contactPhone: organization.contact_phone,
    remark: organization.remark,
    revision: organization.revision,
    createdAt: organization.created_at.toISOString(),
    updatedAt: organization.updated_at.toISOString(),
  };
}

export function mapOrganizationResultToApi(
  organization: OrganizationAccessRow,
): OrganizationResultDto {
  return {
    organization: mapOrganizationToApi(organization),
  };
}

export function mapDisableOrganizationResultToApi(
  result: DisableOrganizationResult,
): DisableOrganizationResultDto {
  return {
    organization: mapOrganizationToApi(result.organization),
    affectedOrganizationPublicIds: result.affectedOrganizationPublicIds,
  };
}

export function mapOrgAuthToApi(orgAuth: OrgAuthAccessRow): OrgAuthDto {
  return {
    publicId: orgAuth.public_id,
    name: orgAuth.name,
    purchaserOrganizationPublicId: orgAuth.purchaser_organization_public_id,
    authScopeType: orgAuth.auth_scope_type,
    profession: orgAuth.profession,
    level: orgAuth.level,
    accountQuota: orgAuth.account_quota,
    usedQuota: orgAuth.used_quota,
    startsAt: orgAuth.starts_at.toISOString(),
    expiresAt: orgAuth.expires_at.toISOString(),
    status: orgAuth.status,
    cancelledAt: formatNullableTimestamp(orgAuth.cancelled_at),
    organizationPublicIds: orgAuth.organization_public_ids,
    createdAt: orgAuth.created_at.toISOString(),
    updatedAt: orgAuth.updated_at.toISOString(),
  };
}

export function mapOrgAuthResultToApi(
  orgAuth: OrgAuthAccessRow,
): OrgAuthResultDto {
  const orgAuthDto = mapOrgAuthToApi(orgAuth);

  return {
    orgAuth: orgAuthDto,
    orgAuths: [orgAuthDto],
  };
}

export function mapOrgAuthPackageResultToApi(
  orgAuths: OrgAuthAccessRow[],
): OrgAuthResultDto {
  const orgAuthDtos = orgAuths.map(mapOrgAuthToApi);

  return {
    orgAuth: orgAuthDtos[0],
    orgAuths: orgAuthDtos,
  };
}

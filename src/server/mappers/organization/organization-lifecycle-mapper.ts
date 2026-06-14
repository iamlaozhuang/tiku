import type {
  EmployeeUnbindLifecycleEventDto,
  OrgAuthLifecycleDto,
  OrganizationLifecycleDto,
} from "../../contracts/organization/organization-lifecycle-contract";
import type {
  EmployeeUnbindResult,
  OrgAuthRecord,
  OrganizationRecord,
  OrganizationRepository,
} from "../../repositories/organization/organization-repository";

function formatTimestamp(value: string | Date): string {
  return value instanceof Date
    ? value.toISOString()
    : new Date(value).toISOString();
}

function formatNullableTimestamp(value: string | Date | null): string | null {
  return value === null ? null : formatTimestamp(value);
}

export async function mapOrganizationRecordToDto(
  organization: OrganizationRecord,
  repository: Pick<OrganizationRepository, "countActiveOrgAuths">,
): Promise<OrganizationLifecycleDto> {
  return {
    activeOrgAuthCount: await repository.countActiveOrgAuths(
      organization.publicId,
    ),
    contactName: organization.contactName,
    contactPhone: organization.contactPhone,
    createdAt: formatTimestamp(organization.createdAt),
    depth: organization.depth,
    employeeCount: organization.employeeCount,
    name: organization.name,
    orgTier: organization.orgTier,
    parentOrganizationPublicId: organization.parentOrganizationPublicId,
    publicId: organization.publicId,
    remark: organization.remark,
    status: organization.status,
    updatedAt: formatTimestamp(organization.updatedAt),
  };
}

export function mapOrgAuthRecordToDto(
  orgAuth: OrgAuthRecord,
): OrgAuthLifecycleDto {
  return {
    accountQuota: orgAuth.accountQuota,
    authScopeType: orgAuth.authScopeType,
    cancelledAt: formatNullableTimestamp(orgAuth.cancelledAt),
    createdAt: formatTimestamp(orgAuth.createdAt),
    expiresAt: formatTimestamp(orgAuth.expiresAt),
    level: orgAuth.level,
    name: orgAuth.name,
    organizationPublicIds: orgAuth.organizationPublicIds,
    profession: orgAuth.profession,
    publicId: orgAuth.publicId,
    purchaserOrganizationPublicId: orgAuth.purchaserOrganizationPublicId,
    startsAt: formatTimestamp(orgAuth.startsAt),
    status: orgAuth.status,
    updatedAt: formatTimestamp(orgAuth.updatedAt),
    usedQuota: orgAuth.usedQuota,
  };
}

export function mapEmployeeUnbindResultToDto(
  result: EmployeeUnbindResult,
): EmployeeUnbindLifecycleEventDto {
  return {
    affectedOrgAuthPublicIds: result.affectedOrgAuthPublicIds,
    employeeLifecycleStatus: "unbound",
    employeePublicId: result.employee.publicId,
    enterpriseAccessStatus: "revoked",
    organizationPublicId: result.employee.organizationPublicId,
    personalAuthFallback:
      result.employee.personalAuthPublicId === null ? "none" : "preserved",
    userPublicId: result.employee.userPublicId,
  };
}

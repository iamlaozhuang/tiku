import type { NormalizedCreateOrgAuthInput } from "../../validators/org-auth";
import type { NormalizedOrganizationListQuery } from "../../validators/organization/list-query";
import type {
  EmployeeRecord,
  EmployeeUnbindInput,
  EmployeeUnbindResult,
  OrgAuthRecord,
  OrganizationRecord,
  OrganizationRepository,
} from "./organization-repository";

type InMemoryOrganizationRepositorySeed = {
  employees?: EmployeeRecord[];
  orgAuths?: OrgAuthRecord[];
  organizations?: OrganizationRecord[];
};

function toTime(value: string | Date): number {
  return value instanceof Date ? value.getTime() : new Date(value).getTime();
}

function overlaps(input: {
  existingExpiresAt: string | Date;
  existingStartsAt: string | Date;
  expiresAt: Date;
  startsAt: Date;
}): boolean {
  return (
    toTime(input.existingStartsAt) < input.expiresAt.getTime() &&
    input.startsAt.getTime() < toTime(input.existingExpiresAt)
  );
}

function getCoverageIds(input: {
  authScopeType: string;
  organizationPublicIds: string[];
  purchaserOrganizationPublicId: string;
}): string[] {
  return input.authScopeType === "specified_nodes"
    ? input.organizationPublicIds
    : [input.purchaserOrganizationPublicId];
}

function includesKeyword(
  organization: OrganizationRecord,
  keyword: string | null,
): boolean {
  if (keyword === null) {
    return true;
  }

  const normalizedKeyword = keyword.toLowerCase();

  return (
    organization.name.toLowerCase().includes(normalizedKeyword) ||
    organization.publicId.toLowerCase().includes(normalizedKeyword)
  );
}

function sortOrganizations(
  organizations: OrganizationRecord[],
  query: NormalizedOrganizationListQuery,
): OrganizationRecord[] {
  return [...organizations].sort((left, right) => {
    const leftValue = left[query.sortBy];
    const rightValue = right[query.sortBy];
    const direction = query.sortOrder === "asc" ? 1 : -1;

    return String(leftValue).localeCompare(String(rightValue)) * direction;
  });
}

function createTimestamp(): string {
  return "2026-06-14T12:00:00.000Z";
}

export function createInMemoryOrganizationRepository(
  seed: InMemoryOrganizationRepositorySeed = {},
): OrganizationRepository {
  const organizations = [...(seed.organizations ?? [])];
  const orgAuths = [...(seed.orgAuths ?? [])];
  const employees = [...(seed.employees ?? [])];

  return {
    async countActiveOrgAuths(organizationPublicId) {
      return orgAuths.filter(
        (orgAuth) =>
          orgAuth.status === "active" &&
          getCoverageIds(orgAuth).includes(organizationPublicId),
      ).length;
    },

    async createOrgAuth(input) {
      const now = createTimestamp();
      const orgAuth: OrgAuthRecord = {
        accountQuota: input.accountQuota,
        authScopeType: input.authScopeType,
        cancelledAt: null,
        createdAt: now,
        expiresAt: input.expiresAt,
        level: input.level,
        name: input.name,
        organizationPublicIds: input.organizationPublicIds,
        profession: input.profession,
        publicId: `org-auth-created-${orgAuths.length + 1}`,
        purchaserOrganizationPublicId: input.purchaserOrganizationPublicId,
        startsAt: input.startsAt,
        status: "active",
        updatedAt: now,
        usedQuota: 0,
      };

      orgAuths.push(orgAuth);

      return orgAuth;
    },

    async createOrganization(input) {
      const now = createTimestamp();
      const organization: OrganizationRecord = {
        contactName: input.contactName,
        contactPhone: input.contactPhone,
        createdAt: now,
        depth: input.depth,
        employeeCount: 0,
        name: input.name,
        orgTier: input.orgTier,
        parentOrganizationPublicId: input.parentOrganizationPublicId,
        publicId: `org-created-${organizations.length + 1}`,
        remark: input.remark,
        status: "active",
        updatedAt: now,
      };

      organizations.push(organization);

      return organization;
    },

    async findOrganizationByPublicId(publicId) {
      return (
        organizations.find(
          (organization) => organization.publicId === publicId,
        ) ?? null
      );
    },

    async hasOverlappingOrgAuth(input: NormalizedCreateOrgAuthInput) {
      const candidateCoverageIds = new Set(getCoverageIds(input));

      return orgAuths.some((orgAuth) => {
        if (
          orgAuth.status !== "active" ||
          orgAuth.profession !== input.profession ||
          orgAuth.level !== input.level ||
          !overlaps({
            existingExpiresAt: orgAuth.expiresAt,
            existingStartsAt: orgAuth.startsAt,
            expiresAt: input.expiresAt,
            startsAt: input.startsAt,
          })
        ) {
          return false;
        }

        return getCoverageIds(orgAuth).some((organizationPublicId) =>
          candidateCoverageIds.has(organizationPublicId),
        );
      });
    },

    async listOrganizations(query) {
      const filteredOrganizations = organizations.filter(
        (organization) =>
          (query.orgTier === null || organization.orgTier === query.orgTier) &&
          (query.status === null || organization.status === query.status) &&
          includesKeyword(organization, query.keyword),
      );
      const sortedOrganizations = sortOrganizations(
        filteredOrganizations,
        query,
      );
      const start = (query.page - 1) * query.pageSize;

      return {
        organizations: sortedOrganizations.slice(start, start + query.pageSize),
        total: filteredOrganizations.length,
      };
    },

    async unbindEmployee(
      input: EmployeeUnbindInput,
    ): Promise<EmployeeUnbindResult | null> {
      const employee = employees.find(
        (candidate) =>
          candidate.publicId === input.employeePublicId &&
          candidate.organizationPublicId === input.organizationPublicId,
      );

      if (employee === undefined) {
        return null;
      }

      employee.status = "unbound";

      return {
        affectedOrgAuthPublicIds: orgAuths
          .filter(
            (orgAuth) =>
              orgAuth.status === "active" &&
              getCoverageIds(orgAuth).includes(input.organizationPublicId),
          )
          .map((orgAuth) => orgAuth.publicId),
        employee,
      };
    },
  };
}

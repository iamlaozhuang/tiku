import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type {
  OrganizationPortalEmployeeAccountStatus,
  OrganizationPortalEmployeeRosterItemDto,
  OrganizationPortalEmployeeRosterQuery,
  OrganizationPortalOverviewDto,
} from "../contracts/organization-portal-overview-contract";
import type {
  AdminRole,
  AuthorizationEdition,
  UserStatus,
} from "../models/auth";

export const ORGANIZATION_PORTAL_OVERVIEW_NOT_FOUND_CODE = 404189;
export const ORGANIZATION_PORTAL_OVERVIEW_NOT_FOUND_MESSAGE =
  "Organization portal overview is unavailable.";

export type OrganizationPortalOverviewAdminContext = {
  adminPublicId: string;
  adminRoles: readonly AdminRole[];
  authorizationPublicId: string | null;
  authorizationSource: "org_auth";
  effectiveEdition: AuthorizationEdition;
  organizationPublicId: string;
};

export type OrganizationPortalOverviewRepositoryInput = {
  now: Date;
  organizationPublicId: string;
  updatedAt: string;
};

export type OrganizationPortalOverviewRepository = {
  readOverview(
    input: OrganizationPortalOverviewRepositoryInput,
  ): Promise<OrganizationPortalOverviewDto | null>;
};

export type OrganizationPortalEmployeeRosterRepositoryInput = {
  now: Date;
  organizationPublicId: string;
  query: OrganizationPortalEmployeeRosterQuery;
};

export type OrganizationPortalEmployeeRosterRepositoryResult = {
  employees: OrganizationPortalEmployeeRosterItemDto[];
  total: number;
};

export type OrganizationPortalEmployeeRosterRepository = {
  readEmployeeRoster(
    input: OrganizationPortalEmployeeRosterRepositoryInput,
  ): Promise<OrganizationPortalEmployeeRosterRepositoryResult | null>;
};

export type BuildOrganizationPortalOverviewInput = {
  adminContext: OrganizationPortalOverviewAdminContext;
  now: Date;
  repository: OrganizationPortalOverviewRepository;
  updatedAt: string;
};

export async function buildOrganizationPortalOverviewFromRepository({
  adminContext,
  now,
  repository,
  updatedAt,
}: BuildOrganizationPortalOverviewInput): Promise<
  ApiResponse<OrganizationPortalOverviewDto | null>
> {
  const overview = await repository.readOverview({
    now,
    organizationPublicId: adminContext.organizationPublicId,
    updatedAt,
  });

  if (overview === null) {
    return createErrorResponse(
      ORGANIZATION_PORTAL_OVERVIEW_NOT_FOUND_CODE,
      ORGANIZATION_PORTAL_OVERVIEW_NOT_FOUND_MESSAGE,
    );
  }

  return createSuccessResponse(overview);
}

const employeeRosterPageSizes = new Set([20, 50, 100]);
const employeeAccountStatuses = new Set([
  "all",
  "active",
  "disabled",
  "locked",
]);
const employeeAuthFilters = new Set([
  "all",
  "none",
  "standard",
  "advanced",
  "expired",
]);

function normalizeOptionalText(value: string | null): string | null {
  const normalizedValue = value?.trim().replace(/\s+/g, " ") ?? "";

  return normalizedValue.length > 0 ? normalizedValue : null;
}

export function normalizeOrganizationPortalEmployeeRosterQuery(
  searchParams: URLSearchParams,
): OrganizationPortalEmployeeRosterQuery {
  const rawPage = Number(searchParams.get("page"));
  const rawPageSize = Number(searchParams.get("pageSize"));
  const rawAccountStatus = searchParams.get("accountStatus") ?? "all";
  const rawAuthFilter = searchParams.get("authFilter") ?? "all";

  return {
    accountStatus: employeeAccountStatuses.has(rawAccountStatus)
      ? (rawAccountStatus as OrganizationPortalEmployeeRosterQuery["accountStatus"])
      : "all",
    authFilter: employeeAuthFilters.has(rawAuthFilter)
      ? (rawAuthFilter as OrganizationPortalEmployeeRosterQuery["authFilter"])
      : "all",
    employeePublicId: normalizeOptionalText(
      searchParams.get("employeePublicId"),
    ),
    keyword: normalizeOptionalText(searchParams.get("keyword")),
    page: Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1,
    pageSize: employeeRosterPageSizes.has(rawPageSize)
      ? (rawPageSize as OrganizationPortalEmployeeRosterQuery["pageSize"])
      : 20,
  };
}

export function resolveOrganizationPortalEmployeeAccountStatus(input: {
  lockedUntilAt: Date | null;
  now: Date;
  status: UserStatus;
}): OrganizationPortalEmployeeAccountStatus {
  if (input.status === "disabled") {
    return "disabled";
  }

  return input.lockedUntilAt !== null && input.lockedUntilAt > input.now
    ? "locked"
    : "active";
}

export async function buildOrganizationPortalEmployeeRosterFromRepository(input: {
  adminContext: OrganizationPortalOverviewAdminContext;
  now: Date;
  query: OrganizationPortalEmployeeRosterQuery;
  repository: OrganizationPortalEmployeeRosterRepository;
}): Promise<ApiResponse<OrganizationPortalEmployeeRosterItemDto[] | null>> {
  const result = await input.repository.readEmployeeRoster({
    now: input.now,
    organizationPublicId: input.adminContext.organizationPublicId,
    query: input.query,
  });

  if (result === null) {
    return createErrorResponse(
      ORGANIZATION_PORTAL_OVERVIEW_NOT_FOUND_CODE,
      ORGANIZATION_PORTAL_OVERVIEW_NOT_FOUND_MESSAGE,
    );
  }

  return createPaginatedResponse(result.employees, {
    page: input.query.page,
    pageSize: input.query.pageSize,
    sortBy: "employeeDisplayName",
    sortOrder: "asc",
    total: result.total,
  });
}

import type {
  AdminRole,
  AuthScopeType,
  AuthStatus,
  OrgTier,
  Profession,
  RedeemCodeStatus,
  UserStatus,
  UserType,
} from "../models/auth";

export const ADMIN_AUTH_OPERATION_PAGE_SIZE_OPTIONS = [20, 50, 100] as const;

export const ADMIN_AUTH_OPERATION_SORT_FIELDS = [
  "registeredAt",
  "updatedAt",
  "expiresAt",
  "createdAt",
] as const;

export const ADMIN_AUTH_OPERATION_ERROR_CODES = {
  adminPermissionDenied: 403601,
  resourceNotFound: 404601,
  concurrentConflict: 409601,
  validationFailed: 422601,
} as const;

export type AdminAuthOperationPageSize =
  (typeof ADMIN_AUTH_OPERATION_PAGE_SIZE_OPTIONS)[number];

export type AdminAuthOperationSortField =
  (typeof ADMIN_AUTH_OPERATION_SORT_FIELDS)[number];

export type AdminAuthOperationSortOrder = "asc" | "desc";

export type AdminAuthOperationListQuery = {
  page: number;
  pageSize: AdminAuthOperationPageSize;
  sortBy: AdminAuthOperationSortField;
  sortOrder: AdminAuthOperationSortOrder;
  keyword: string | null;
  status: UserStatus | AuthStatus | RedeemCodeStatus | "all";
  userType: UserType | "all";
};

export type AdminUserSummaryDto = {
  publicId: string;
  phone: string;
  name: string;
  registeredAt: string;
  status: UserStatus;
  userType: UserType;
  organizationPublicId: string | null;
  organizationName: string | null;
  authStatus: AuthStatus | null;
};

export type AdminUserListDto = {
  users: AdminUserSummaryDto[];
};

export type AdminUserEnterpriseBindingDto = {
  employeePublicId: string;
  organizationPublicId: string;
  organizationName: string;
  orgTier: OrgTier;
  status: UserStatus;
};

export type AdminUserAuthorizationSummaryDto = {
  publicId: string;
  authorizationType: "personal_auth" | "org_auth";
  purchaserName: string | null;
  authScopeType: AuthScopeType | null;
  profession: Profession;
  level: number;
  accountQuota: number | null;
  usedQuota: number | null;
  startsAt: string | null;
  expiresAt: string | null;
  status: AuthStatus;
  organizationPublicIds: string[];
};

export type AdminUserDetailDto = {
  user: AdminUserSummaryDto;
  enterpriseBinding: AdminUserEnterpriseBindingDto | null;
  authorizations: AdminUserAuthorizationSummaryDto[];
};

export type OrganizationTreeNodeDto = {
  publicId: string;
  name: string;
  orgTier: OrgTier;
  parentOrganizationPublicId: string | null;
  status: "active" | "disabled";
  employeeCount: number;
  authSummary: string | null;
};

export type OrganizationListDto = {
  organizations: OrganizationTreeNodeDto[];
};

export type EmployeeSummaryDto = {
  publicId: string;
  userPublicId: string;
  phone: string;
  name: string;
  organizationPublicId: string;
  status: UserStatus;
};

export type EmployeeListDto = {
  employees: EmployeeSummaryDto[];
};

export type EmployeeMutationResultDto = {
  employee: EmployeeSummaryDto;
};

export type AuthorizationSummaryDto = {
  publicId: string;
  purchaserName: string;
  authScopeType: AuthScopeType;
  profession: Profession;
  level: number;
  accountQuota: number;
  usedQuota: number;
  startsAt: string;
  expiresAt: string;
  status: AuthStatus;
};

export type AuthorizationListDto = {
  authorizations: AuthorizationSummaryDto[];
};

export type RedeemCodeSummaryDto = {
  publicId: string;
  codeDisplay: string;
  canViewPlainText: boolean;
  profession: Profession;
  level: number;
  status: RedeemCodeStatus;
  redeemedUserPublicId: string | null;
  redeemDeadlineAt: string;
  createdAt: string;
};

export type RedeemCodeListDto = {
  redeemCodes: RedeemCodeSummaryDto[];
};

export type RedeemCodeGenerationItemDto = {
  publicId: string;
  codePlainText: string;
  codeDisplay: string;
  profession: Profession;
  level: number;
  status: RedeemCodeStatus;
  redeemDeadlineAt: string;
  createdAt: string;
};

export type RedeemCodeGenerationDto = {
  generation: {
    generationGroupId: string;
    count: number;
    profession: Profession;
    level: number;
    durationDay: number;
    redeemDeadlineAt: string;
  };
  redeemCodes: RedeemCodeGenerationItemDto[];
};

export type AdminRoleSummaryDto = {
  role: AdminRole;
  label: string;
  scope: "global" | "operations" | "content";
  canManageAdminAccount: boolean;
};

export type AdminRoleListDto = {
  adminRoles: AdminRoleSummaryDto[];
};

export function createAdminAuthOperationListQuery(
  overrides: Partial<AdminAuthOperationListQuery> = {},
): AdminAuthOperationListQuery {
  const { keyword, ...queryOverrides } = overrides;

  return {
    page: 1,
    pageSize: 20,
    sortBy: "updatedAt",
    sortOrder: "desc",
    status: "all",
    userType: "all",
    ...queryOverrides,
    keyword: typeof keyword === "string" ? normalizeKeyword(keyword) : null,
  };
}

function normalizeKeyword(value: string): string | null {
  const keyword = value.trim();

  return keyword.length === 0 ? null : keyword;
}

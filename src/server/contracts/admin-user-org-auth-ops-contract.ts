import type {
  AdminRole,
  AuthScopeType,
  AuthStatus,
  OrgTier,
  Profession,
  RedeemCodeStatus,
  RedeemCodeType,
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

export type AdminUserCategory =
  | "no_auth_personal"
  | "personal_standard"
  | "personal_advanced"
  | "employee"
  | "backend_admin"
  | "disabled";

export type AdminUserAuthFilter =
  | "all"
  | "none"
  | "standard"
  | "advanced"
  | "expired";

export type AdminUserAccountDomain = "learner_employee" | "admin";

export type AdminUserManagedBy =
  | "super_admin"
  | "ops_admin_scoped_org_admin"
  | "platform_ops";

export type AdminAuthOperationListQuery = {
  page: number;
  pageSize: AdminAuthOperationPageSize;
  sortBy: AdminAuthOperationSortField;
  sortOrder: AdminAuthOperationSortOrder;
  keyword: string | null;
  status: UserStatus | AuthStatus | RedeemCodeStatus | "all";
  userType: UserType | "all";
  userCategory?: AdminUserCategory | "all";
  authFilter?: AdminUserAuthFilter;
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
  userCategory?: AdminUserCategory;
  accountDomain?: AdminUserAccountDomain;
  authEditionLabel?:
    | "none"
    | "standard"
    | "advanced"
    | "expired"
    | "admin_not_applicable";
  isPhoneEditable?: false;
  canBePhysicallyDeleted?: false;
  canResetPassword?: boolean;
  canDisable?: boolean;
  canEnable?: boolean;
  managedBy?: AdminUserManagedBy;
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

export type EmployeeImportRowInputDto = {
  userPublicId: string;
  organizationPublicId: string;
};

export type EmployeeImportRejectedRowDto = {
  rowNumber: number;
  userPublicId: string | null;
  organizationPublicId: string | null;
  reason:
    | "duplicate_phone"
    | "duplicate_user"
    | "employee_create_failed"
    | "invalid_row"
    | "organization_not_found"
    | "user_not_found";
};

export type EmployeeInitialPasswordDistributionRowDto = {
  rowNumber: number;
  phone: string;
  name: string;
  organizationPublicId: string;
  initialPassword: string;
};

export type EmployeeImportResultDto = {
  generatedInitialPasswords?: EmployeeInitialPasswordDistributionRowDto[];
  importedEmployees: EmployeeSummaryDto[];
  rejectedRows: EmployeeImportRejectedRowDto[];
};

export type EmployeeUnbindResultDto = {
  employeePublicId: string;
  userPublicId: string;
  previousOrganizationPublicId: string;
  status: "unbound";
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
  codePlainText: string | null;
  redeemCodeType: RedeemCodeType;
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

export type RedeemCodeDetailDto = RedeemCodeSummaryDto & {
  redeemedAt: string | null;
  durationDay: number;
  generationGroupId: string;
  updatedAt: string;
  redactionStatus: "redacted";
  redactionReason:
    | "plaintext_redeem_code_and_hash_hidden"
    | "code_hash_hidden_plaintext_role_allowed";
};

export type RedeemCodeDetailResultDto = {
  redeemCode: RedeemCodeDetailDto;
};

export type RedeemCodeGenerationItemDto = {
  publicId: string;
  codePlainText: string;
  codeDisplay: string;
  redeemCodeType: RedeemCodeType;
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
    redeemCodeType: RedeemCodeType;
    profession: Profession;
    level: number;
    durationDay: number;
    redeemDeadlineAt: string;
  };
  redeemCodes: RedeemCodeGenerationItemDto[];
};

export type AdminUserPasswordResetResultDto = {
  userPublicId: string;
  oneTimePasswordPlainText: string | null;
  distributionWindow: {
    visibleOnce: boolean;
    expiresAt: string | null;
    redactionNotice: string;
    sessionRevocation:
      | "revoked_active_sessions"
      | "not_executed_in_local_contract";
  };
};

export type AdminRoleSummaryDto = {
  role: AdminRole;
  label: string;
  scope: "global" | "operations" | "content" | "organization";
  canManageAdminAccount: boolean;
  managedBy: AdminUserManagedBy;
};

export type AdminRoleListDto = {
  adminRoles: AdminRoleSummaryDto[];
};

export type PlatformAdminAccountCreationRole = Extract<
  AdminRole,
  "ops_admin" | "content_admin"
>;

export type OrganizationAdminAccountCreationRole = Extract<
  AdminRole,
  "org_standard_admin" | "org_advanced_admin"
>;

export type AdminAccountCreationRole =
  | PlatformAdminAccountCreationRole
  | OrganizationAdminAccountCreationRole;

export type AdminAccountCreationInputDto = {
  phone: string;
  name: string;
  password: string;
  adminRole: AdminAccountCreationRole;
  organizationPublicId: string | null;
};

export type AdminAccountCreationSummaryDto = {
  publicId: string;
  name: string;
  adminRole: AdminAccountCreationRole;
  organizationPublicId: string | null;
  registeredAt: string;
  status: UserStatus;
  accountDomain: "admin";
  managedBy: Extract<
    AdminUserManagedBy,
    "super_admin" | "ops_admin_scoped_org_admin"
  >;
};

export type AdminAccountCreationResultDto = {
  adminAccount: AdminAccountCreationSummaryDto;
};

export type AdminAccountCreationConflictReason =
  | "admin_phone_exists"
  | "learner_employee_phone_exists";

export type AdminAccountCreationConflictDto = {
  reason: AdminAccountCreationConflictReason;
};

export type AdminAccountCreationNotFoundReason = "organization_not_found";

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
    userCategory: "all",
    authFilter: "all",
    ...queryOverrides,
    keyword: typeof keyword === "string" ? normalizeKeyword(keyword) : null,
  };
}

function normalizeKeyword(value: string): string | null {
  const keyword = value.trim();

  return keyword.length === 0 ? null : keyword;
}

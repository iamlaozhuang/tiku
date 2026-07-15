import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
  type ApiPagination,
  type ApiResponse,
} from "../contracts/api-response";
import {
  ADMIN_AUTH_OPERATION_ERROR_CODES,
  type AdminAuthOperationListQuery,
  type AdminRoleListDto,
  type AdminUserPasswordResetResultDto,
  type AdminUserSummaryDto,
  type AdminUserDetailDto,
  type AuthorizationListDto,
  type OrganizationListDto,
  type RedeemCodeListDto,
  type AdminUserListDto,
} from "../contracts/admin-user-org-auth-ops-contract";
import type { AdminRole } from "../models/auth";
import { maskPhoneForDisplay } from "../mappers/phone-display-mapper";

export type AdminOpsRole = AdminRole;

export type AdminUserOrgAuthOpsActor = {
  publicId: string;
  roles: AdminOpsRole[];
  status?: "active" | "disabled";
  canViewRedeemCodePlainText: boolean;
};

export type AdminUserOrgAuthOpsServiceContext = {
  actor: AdminUserOrgAuthOpsActor;
};

export type AdminOpsApiResponse<TData> = Omit<
  ApiResponse<TData>,
  "pagination"
> & {
  pagination?: ApiPagination | null;
};

export type AdminUserOrgAuthOpsService = {
  listUsers(
    query: Partial<AdminAuthOperationListQuery>,
  ): Promise<AdminOpsApiResponse<AdminUserListDto | null>>;
  getUserDetail(
    publicId: string,
  ): Promise<ApiResponse<AdminUserDetailDto | null>>;
  listOrganizations(
    query: Partial<AdminAuthOperationListQuery>,
  ): Promise<AdminOpsApiResponse<OrganizationListDto | null>>;
  listAuthorizations(
    query: Partial<AdminAuthOperationListQuery>,
  ): Promise<AdminOpsApiResponse<AuthorizationListDto | null>>;
  listRedeemCodes(
    query: Partial<AdminAuthOperationListQuery>,
  ): Promise<AdminOpsApiResponse<RedeemCodeListDto | null>>;
  listAdminRoles(): Promise<AdminOpsApiResponse<AdminRoleListDto | null>>;
  resetUserPassword(
    publicId: string,
  ): Promise<ApiResponse<AdminUserPasswordResetResultDto | null>>;
};

const unavailableResponse = {
  code: 503601,
  message: "Admin user organization authorization runtime is not configured.",
  data: null,
  pagination: null,
} as const;

type SampleUserBase = Omit<
  AdminUserSummaryDto,
  "canResetPassword" | "canDisable" | "canEnable"
>;

const sampleUsers: SampleUserBase[] = [
  {
    publicId: "user-public-000",
    phone: "13700000000",
    name: "王五",
    registeredAt: "2026-05-21T08:00:00.000Z",
    status: "active",
    userType: "personal",
    organizationPublicId: null,
    organizationName: null,
    authStatus: null,
    userCategory: "no_auth_personal",
    accountDomain: "learner_employee",
    authEditionLabel: "none",
    isPhoneEditable: false,
    canBePhysicallyDeleted: false,
    managedBy: "platform_ops",
  },
  {
    publicId: "user-public-standard-001",
    phone: "13600000000",
    name: "赵六",
    registeredAt: "2026-05-20T09:00:00.000Z",
    status: "active",
    userType: "personal",
    organizationPublicId: null,
    organizationName: null,
    authStatus: "active",
    userCategory: "personal_standard",
    accountDomain: "learner_employee",
    authEditionLabel: "standard",
    isPhoneEditable: false,
    canBePhysicallyDeleted: false,
    managedBy: "platform_ops",
  },
  {
    publicId: "user-public-advanced-001",
    phone: "13500000000",
    name: "孙七",
    registeredAt: "2026-05-20T09:30:00.000Z",
    status: "active",
    userType: "personal",
    organizationPublicId: null,
    organizationName: null,
    authStatus: "active",
    userCategory: "personal_advanced",
    accountDomain: "learner_employee",
    authEditionLabel: "advanced",
    isPhoneEditable: false,
    canBePhysicallyDeleted: false,
    managedBy: "platform_ops",
  },
  {
    publicId: "user-public-001",
    phone: "13800000000",
    name: "张三",
    registeredAt: "2026-05-20T08:00:00.000Z",
    status: "active",
    userType: "employee",
    organizationPublicId: "organization-public-001",
    organizationName: "杭州烟草",
    authStatus: "active",
    userCategory: "employee",
    accountDomain: "learner_employee",
    authEditionLabel: "advanced",
    isPhoneEditable: false,
    canBePhysicallyDeleted: false,
    managedBy: "platform_ops",
  },
  {
    publicId: "user-public-002",
    phone: "13900000000",
    name: "李四",
    registeredAt: "2026-05-19T08:00:00.000Z",
    status: "disabled",
    userType: "personal",
    organizationPublicId: null,
    organizationName: null,
    authStatus: "expired",
    userCategory: "disabled",
    accountDomain: "learner_employee",
    authEditionLabel: "expired",
    isPhoneEditable: false,
    canBePhysicallyDeleted: false,
    managedBy: "platform_ops",
  },
  {
    publicId: "admin-public-001",
    phone: "13100000000",
    name: "内容老师账号",
    registeredAt: "2026-05-18T08:00:00.000Z",
    status: "active",
    userType: "personal",
    organizationPublicId: null,
    organizationName: null,
    authStatus: null,
    userCategory: "backend_admin",
    accountDomain: "admin",
    authEditionLabel: "admin_not_applicable",
    isPhoneEditable: false,
    canBePhysicallyDeleted: false,
    managedBy: "super_admin",
  },
  {
    publicId: "admin-org-public-001",
    phone: "13000000000",
    name: "企业管理员账号",
    registeredAt: "2026-05-18T08:30:00.000Z",
    status: "active",
    userType: "personal",
    organizationPublicId: "organization-public-001",
    organizationName: "杭州烟草",
    authStatus: null,
    userCategory: "backend_admin",
    accountDomain: "admin",
    authEditionLabel: "admin_not_applicable",
    isPhoneEditable: false,
    canBePhysicallyDeleted: false,
    managedBy: "ops_admin_scoped_org_admin",
  },
];

const sampleUserDetail: AdminUserDetailDto = {
  user: {
    ...sampleUsers[3]!,
    canResetPassword: true,
    canDisable: true,
    canEnable: false,
  },
  enterpriseBinding: {
    employeePublicId: "employee-public-001",
    organizationPublicId: "organization-public-001",
    organizationName: "杭州烟草",
    orgTier: "city",
    status: "active",
  },
  authorizations: [
    {
      publicId: "personal-auth-public-001",
      authorizationType: "personal_auth",
      purchaserName: null,
      authScopeType: null,
      profession: "monopoly",
      level: 3,
      accountQuota: null,
      usedQuota: null,
      startsAt: "2026-05-01T00:00:00.000Z",
      expiresAt: "2027-05-01T00:00:00.000Z",
      status: "active",
      organizationPublicIds: [],
    },
    {
      publicId: "authorization-public-001",
      authorizationType: "org_auth",
      purchaserName: "杭州烟草",
      authScopeType: "current_and_descendants",
      profession: "monopoly",
      level: 3,
      accountQuota: 100,
      usedQuota: 42,
      startsAt: "2026-05-01T00:00:00.000Z",
      expiresAt: "2027-05-01T00:00:00.000Z",
      status: "active",
      organizationPublicIds: ["organization-public-001"],
    },
  ],
};

const sampleOrganizations: OrganizationListDto["organizations"] = [
  {
    publicId: "organization-public-001",
    name: "杭州烟草",
    orgTier: "city",
    parentOrganizationPublicId: "organization-public-000",
    revision: 1,
    status: "active",
    employeeCount: 42,
    authSummary: "monopoly / level 3",
  },
];

const sampleAuthorizations: AuthorizationListDto["authorizations"] = [
  {
    publicId: "authorization-public-001",
    purchaserName: "杭州烟草",
    authScopeType: "current_and_descendants",
    profession: "monopoly",
    level: 3,
    accountQuota: 100,
    usedQuota: 42,
    startsAt: "2026-05-01T00:00:00.000Z",
    expiresAt: "2027-05-01T00:00:00.000Z",
    status: "active",
  },
];

const sampleRedeemCodes: Omit<
  RedeemCodeListDto["redeemCodes"][number],
  "codeDisplay" | "codePlainText" | "canViewPlainText"
>[] = [
  {
    publicId: "redeem-code-public-001",
    redeemCodeType: "personal_standard_activation",
    profession: "monopoly",
    level: 3,
    status: "unused",
    redeemedUserPublicId: null,
    redeemDeadlineAt: "2027-05-20T15:59:59.999Z",
    createdAt: "2026-05-20T08:00:00.000Z",
  },
];

function createPagination(
  query: Partial<AdminAuthOperationListQuery>,
  total: number,
): ApiPagination {
  return {
    page: query.page ?? 1,
    pageSize: query.pageSize ?? 20,
    sortBy: query.sortBy ?? "updatedAt",
    sortOrder: query.sortOrder ?? "desc",
    total,
  };
}

function isActiveActor(actor: AdminUserOrgAuthOpsActor): boolean {
  return (actor.status ?? "active") === "active";
}

function canManageUserCredential(
  actor: AdminUserOrgAuthOpsActor,
  user: SampleUserBase,
): boolean {
  if (!isActiveActor(actor)) {
    return false;
  }

  if (actor.roles.includes("super_admin")) {
    return true;
  }

  if (user.accountDomain === "admin") {
    return (
      user.managedBy === "ops_admin_scoped_org_admin" &&
      actor.roles.includes("ops_admin")
    );
  }

  return actor.roles.includes("ops_admin");
}

function toUserSummary(
  user: SampleUserBase,
  actor: AdminUserOrgAuthOpsActor,
): AdminUserSummaryDto {
  const canManage = canManageUserCredential(actor, user);

  return {
    ...user,
    phone: maskPhoneForDisplay(user.phone),
    canResetPassword: canManage,
    canDisable: canManage && user.status === "active",
    canEnable: canManage && user.status === "disabled",
  };
}

function matchesUserQuery(
  user: SampleUserBase,
  query: Partial<AdminAuthOperationListQuery>,
): boolean {
  const keyword = query.keyword?.trim().toLowerCase();

  if (
    keyword !== undefined &&
    keyword.length > 0 &&
    !`${user.name} ${user.phone}`.toLowerCase().includes(keyword)
  ) {
    return false;
  }

  if (query.status !== undefined && query.status !== "all") {
    if (query.status !== user.status && query.status !== user.authStatus) {
      return false;
    }
  }

  if (
    query.userType !== undefined &&
    query.userType !== "all" &&
    query.userType !== user.userType
  ) {
    return false;
  }

  if (
    query.userCategory !== undefined &&
    query.userCategory !== "all" &&
    query.userCategory !== user.userCategory
  ) {
    return false;
  }

  if (query.authFilter !== undefined && query.authFilter !== "all") {
    return query.authFilter === user.authEditionLabel;
  }

  return true;
}

function findSampleUserByPublicId(publicId: string) {
  return sampleUsers.find((user) => user.publicId === publicId) ?? null;
}

export function createAdminUserOrgAuthOpsService({
  actor,
}: AdminUserOrgAuthOpsServiceContext): AdminUserOrgAuthOpsService {
  return {
    async listUsers(query) {
      const users = sampleUsers
        .filter((user) => matchesUserQuery(user, query))
        .map((user) => toUserSummary(user, actor));

      return createPaginatedResponse(
        { users },
        createPagination(query, users.length),
      );
    },
    async getUserDetail(publicId) {
      return createSuccessResponse(
        publicId === sampleUserDetail.user.publicId
          ? {
              ...sampleUserDetail,
              user: toUserSummary(sampleUserDetail.user, actor),
            }
          : null,
      );
    },
    async listOrganizations(query) {
      return createPaginatedResponse(
        { organizations: sampleOrganizations },
        createPagination(query, sampleOrganizations.length),
      );
    },
    async listAuthorizations(query) {
      return createPaginatedResponse(
        { authorizations: sampleAuthorizations },
        createPagination(query, sampleAuthorizations.length),
      );
    },
    async listRedeemCodes(query) {
      const redeemCodes = sampleRedeemCodes.map((redeemCode) => ({
        ...redeemCode,
        codeDisplay: actor.canViewRedeemCodePlainText
          ? "RC-2026-0001-PLAIN"
          : "RC-2026-****",
        codePlainText: actor.canViewRedeemCodePlainText
          ? "RC-2026-0001-PLAIN"
          : null,
        canViewPlainText: actor.canViewRedeemCodePlainText,
      }));

      return createPaginatedResponse(
        { redeemCodes },
        createPagination(query, redeemCodes.length),
      );
    },
    async listAdminRoles() {
      return createSuccessResponse({
        adminRoles: [
          {
            role: "super_admin",
            label: "超级管理员",
            scope: "global",
            canManageAdminAccount: true,
            managedBy: "super_admin",
          },
          {
            role: "ops_admin",
            label: "运营管理员",
            scope: "operations",
            canManageAdminAccount: false,
            managedBy: "super_admin",
          },
          {
            role: "content_admin",
            label: "内容老师",
            scope: "content",
            canManageAdminAccount: false,
            managedBy: "super_admin",
          },
          {
            role: "org_standard_admin",
            label: "标准版企业管理员",
            scope: "organization",
            canManageAdminAccount:
              actor.roles.includes("super_admin") ||
              actor.roles.includes("ops_admin"),
            managedBy: "ops_admin_scoped_org_admin",
          },
          {
            role: "org_advanced_admin",
            label: "高级版企业管理员",
            scope: "organization",
            canManageAdminAccount:
              actor.roles.includes("super_admin") ||
              actor.roles.includes("ops_admin"),
            managedBy: "ops_admin_scoped_org_admin",
          },
        ],
      });
    },
    async resetUserPassword(publicId) {
      const user = findSampleUserByPublicId(publicId);

      if (user === null) {
        return createErrorResponse(
          ADMIN_AUTH_OPERATION_ERROR_CODES.resourceNotFound,
          "Admin resource not found.",
        );
      }

      if (!canManageUserCredential(actor, user)) {
        return createErrorResponse(
          ADMIN_AUTH_OPERATION_ERROR_CODES.adminPermissionDenied,
          "Admin permission denied.",
        );
      }

      return createSuccessResponse({
        userPublicId: user.publicId,
        oneTimePasswordPlainText: "LOCAL-RESET-ONCE",
        distributionWindow: {
          visibleOnce: true,
          expiresAt: "2026-07-03T15:00:00.000Z",
          redactionNotice:
            "One-time reset password is returned only in this local distribution window.",
          sessionRevocation: "not_executed_in_local_contract",
        },
      });
    },
  };
}

export function createUnavailableAdminUserOrgAuthOpsService(): AdminUserOrgAuthOpsService {
  return {
    async listUsers() {
      return unavailableResponse;
    },
    async listOrganizations() {
      return unavailableResponse;
    },
    async getUserDetail() {
      return createErrorResponse(
        unavailableResponse.code,
        unavailableResponse.message,
      );
    },
    async listAuthorizations() {
      return unavailableResponse;
    },
    async listRedeemCodes() {
      return unavailableResponse;
    },
    async listAdminRoles() {
      return unavailableResponse;
    },
    async resetUserPassword() {
      return createErrorResponse(
        unavailableResponse.code,
        unavailableResponse.message,
      );
    },
  };
}

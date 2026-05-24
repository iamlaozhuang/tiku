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
  type AuthorizationListDto,
  type OrganizationListDto,
  type RedeemCodeListDto,
  type AdminUserListDto,
} from "../contracts/admin-user-org-auth-ops-contract";

export type AdminOpsRole = "super_admin" | "ops_admin" | "content_admin";

export type AdminUserOrgAuthOpsActor = {
  publicId: string;
  roles: AdminOpsRole[];
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
  resetUserPassword(publicId: string): Promise<ApiResponse<null>>;
};

const unavailableResponse = {
  code: 503601,
  message: "Admin user organization authorization runtime is not configured.",
  data: null,
  pagination: null,
} as const;

const sampleUsers: AdminUserListDto["users"] = [
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
  },
];

const sampleOrganizations: OrganizationListDto["organizations"] = [
  {
    publicId: "organization-public-001",
    name: "杭州烟草",
    orgTier: "city",
    parentOrganizationPublicId: "organization-public-000",
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
  "codeDisplay" | "canViewPlainText"
>[] = [
  {
    publicId: "redeem-code-public-001",
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

function canManageUserCredential(actor: AdminUserOrgAuthOpsActor): boolean {
  return actor.roles.includes("super_admin");
}

export function createAdminUserOrgAuthOpsService({
  actor,
}: AdminUserOrgAuthOpsServiceContext): AdminUserOrgAuthOpsService {
  return {
    async listUsers(query) {
      return createPaginatedResponse(
        { users: sampleUsers },
        createPagination(query, sampleUsers.length),
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
          },
          {
            role: "ops_admin",
            label: "运营管理员",
            scope: "operations",
            canManageAdminAccount: false,
          },
          {
            role: "content_admin",
            label: "内容老师",
            scope: "content",
            canManageAdminAccount: false,
          },
        ],
      });
    },
    async resetUserPassword() {
      if (!canManageUserCredential(actor)) {
        return createErrorResponse(
          ADMIN_AUTH_OPERATION_ERROR_CODES.adminPermissionDenied,
          "Admin permission denied.",
        );
      }

      return createSuccessResponse(null);
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

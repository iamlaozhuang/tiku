import { createElement } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { AdminUserOrgAuthOpsBaseline } from "@/components/admin/UserOrgAuthOps/AdminUserOrgAuthOpsBaseline";
import {
  ADMIN_AUTH_OPERATION_ERROR_CODES,
  ADMIN_AUTH_OPERATION_PAGE_SIZE_OPTIONS,
  ADMIN_AUTH_OPERATION_SORT_FIELDS,
  createAdminAuthOperationListQuery,
} from "@/server/contracts/admin-user-org-auth-ops-contract";
import {
  createAdminUserOrgAuthOpsService,
  createUnavailableAdminUserOrgAuthOpsService,
} from "@/server/services/admin-user-org-auth-ops-service";
import { createAdminUserOrgAuthOpsRouteHandlers } from "@/server/services/admin-user-org-auth-ops-route";

afterEach(() => {
  cleanup();
});

describe("admin user organization authorization ops baseline", () => {
  it("defines list query and operation contracts with public identifiers only", () => {
    const query = createAdminAuthOperationListQuery({
      page: 3,
      pageSize: 100,
      sortBy: "registeredAt",
      sortOrder: "asc",
      keyword: "  13800000000  ",
      status: "active",
      userType: "employee",
    });

    expect(ADMIN_AUTH_OPERATION_PAGE_SIZE_OPTIONS).toEqual([20, 50, 100]);
    expect(ADMIN_AUTH_OPERATION_SORT_FIELDS).toEqual([
      "registeredAt",
      "updatedAt",
      "expiresAt",
      "createdAt",
    ]);
    expect(ADMIN_AUTH_OPERATION_ERROR_CODES).toMatchObject({
      adminPermissionDenied: 403601,
      resourceNotFound: 404601,
      concurrentConflict: 409601,
      validationFailed: 422601,
    });
    expect(query).toMatchObject({
      page: 3,
      pageSize: 100,
      sortBy: "registeredAt",
      sortOrder: "asc",
      keyword: "13800000000",
      status: "active",
      userType: "employee",
    });
    expect(query).not.toHaveProperty("id");
  });

  it("returns safe admin operation summaries and permission-denied mutations", async () => {
    const service = createAdminUserOrgAuthOpsService({
      actor: {
        publicId: "admin-ops-001",
        roles: ["ops_admin"],
        canViewRedeemCodePlainText: false,
      },
    });

    const userList = await service.listUsers({ page: 1, pageSize: 20 });
    const organizationList = await service.listOrganizations({});
    const authorizationList = await service.listAuthorizations({});
    const redeemCodeList = await service.listRedeemCodes({});
    const adminRoleList = await service.listAdminRoles();
    const resetPassword = await service.resetUserPassword("user-public-001");

    expect(userList).toMatchObject({
      code: 0,
      message: "ok",
      pagination: { page: 1, pageSize: 20, total: 2 },
    });
    expect(userList.data?.users[0]).toMatchObject({
      publicId: "user-public-001",
      phone: "13800000000",
      userType: "employee",
      organizationName: "杭州烟草",
      authStatus: "active",
    });
    expect(userList.data?.users[0]).not.toHaveProperty("id");
    expect(organizationList.data?.organizations[0]).not.toHaveProperty("id");
    expect(authorizationList.data?.authorizations[0]).not.toHaveProperty("id");
    expect(redeemCodeList.data?.redeemCodes[0]).toMatchObject({
      publicId: "redeem-code-public-001",
      codeDisplay: "RC-2026-****",
      canViewPlainText: false,
    });
    expect(redeemCodeList.data?.redeemCodes[0]).not.toHaveProperty("id");
    expect(adminRoleList.data?.adminRoles).toHaveLength(3);
    expect(resetPassword).toMatchObject({
      code: 403601,
      message: "Admin permission denied.",
      data: null,
    });
  });

  it("keeps unavailable route services in the standard response envelope", async () => {
    const unavailableService = createUnavailableAdminUserOrgAuthOpsService();

    await expect(unavailableService.listUsers({})).resolves.toEqual({
      code: 503601,
      message:
        "Admin user organization authorization runtime is not configured.",
      data: null,
      pagination: null,
    });
  });

  it("adapts admin operation route requests to standard paginated responses", async () => {
    const handlers = createAdminUserOrgAuthOpsRouteHandlers(
      createAdminUserOrgAuthOpsService({
        actor: {
          publicId: "admin-super-001",
          roles: ["super_admin", "ops_admin"],
          canViewRedeemCodePlainText: true,
        },
      }),
    );

    const usersResponse = await handlers.users.GET(
      new Request("http://localhost/api/v1/users?page=2&pageSize=50"),
    );
    const redeemCodesResponse = await handlers.redeemCodes.GET(
      new Request("http://localhost/api/v1/redeem-codes?page=1&pageSize=20"),
    );
    const resetPasswordResponse = await handlers.resetPassword.POST(
      new Request(
        "http://localhost/api/v1/users/user-public-001/reset-password",
        {
          method: "POST",
        },
      ),
      {
        params: Promise.resolve({
          publicId: "user-public-001",
        }),
      },
    );

    const usersJson = await usersResponse.json();

    expect(usersJson).toMatchObject({
      code: 0,
      message: "ok",
      pagination: {
        page: 2,
        pageSize: 50,
        total: 2,
      },
      data: {
        users: expect.arrayContaining([
          expect.objectContaining({
            publicId: "user-public-001",
          }),
        ]),
      },
    });
    await expect(redeemCodesResponse.json()).resolves.toMatchObject({
      code: 0,
      data: {
        redeemCodes: [
          {
            codeDisplay: "RC-2026-0001-PLAIN",
            canViewPlainText: true,
          },
        ],
      },
    });
    await expect(resetPasswordResponse.json()).resolves.toEqual({
      code: 0,
      message: "ok",
      data: null,
    });
  });

  it("renders admin operation states, guarded redeem codes, confirmations, and toast feedback", () => {
    render(createElement(AdminUserOrgAuthOpsBaseline, { state: "loading" }));
    expect(screen.getByText("正在加载用户与授权运营数据")).toBeInTheDocument();

    cleanup();
    render(createElement(AdminUserOrgAuthOpsBaseline, { state: "empty" }));
    expect(screen.getByText("暂无用户与授权运营数据")).toBeInTheDocument();

    cleanup();
    render(createElement(AdminUserOrgAuthOpsBaseline, { state: "error" }));
    expect(screen.getByText("用户与授权运营数据加载失败")).toBeInTheDocument();

    cleanup();
    render(createElement(AdminUserOrgAuthOpsBaseline));

    expect(
      screen.getByRole("heading", { name: "用户、组织与授权运营" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("admin-user-user-public-001")).toHaveAttribute(
      "data-public-id",
      "user-public-001",
    );
    expect(
      screen.getByTestId("admin-user-user-public-001"),
    ).not.toHaveAttribute("data-id");
    expect(screen.getByText("RC-2026-****")).toBeInTheDocument();
    expect(screen.queryByText("RC-2026-0001-PLAIN")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "创建企业授权" }));
    expect(screen.getByRole("alertdialog")).toHaveTextContent(
      "确认创建企业授权？",
    );
    fireEvent.click(screen.getByRole("button", { name: "确认创建" }));
    expect(screen.getByRole("status")).toHaveTextContent("企业授权已提交");

    fireEvent.click(screen.getByRole("button", { name: "生成卡密" }));
    expect(screen.getByRole("alertdialog")).toHaveTextContent(
      "卡密生成需要二次确认",
    );
    fireEvent.click(screen.getByRole("button", { name: "确认生成" }));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "数据已被其他操作更新，请刷新后重试",
    );
  });
});

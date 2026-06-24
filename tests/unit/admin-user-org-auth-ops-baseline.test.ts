import { createElement } from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AdminUserOrgAuthOpsBaseline } from "@/components/admin/UserOrgAuthOps/AdminUserOrgAuthOpsBaseline";
import {
  AdminOrgAuthPage,
  AdminRedeemCodePage,
} from "@/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage";
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
  localStorage.clear();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

const adminSessionPayload = {
  code: 0,
  message: "ok",
  data: {
    user: {
      publicId: "user-admin-ops",
      phone: "13900000001",
      name: "System Ops",
      userType: null,
      status: "active",
      lockedUntilAt: null,
      employeePublicId: null,
      organizationPublicId: null,
      adminPublicId: "admin-ops-public-001",
      adminRoles: ["ops_admin"],
    },
    session: {
      expiresAt: "2026-05-29T04:00:00.000Z",
    },
  },
};

const organizationPayload = {
  code: 0,
  message: "ok",
  data: {
    organizations: [
      {
        publicId: "organization-public-001",
        name: "杭州烟草",
        orgTier: "city",
        parentOrganizationPublicId: "organization-public-000",
        status: "active",
        employeeCount: 42,
        authSummary: "专卖 3级 / 42 / 100",
      },
    ],
  },
};

const organizationTreePayload = {
  code: 0,
  message: "ok",
  data: {
    organizations: [
      {
        publicId: "org-province-001",
        name: "浙江省烟草公司",
        orgTier: "province",
        parentOrganizationPublicId: null,
        status: "active",
        employeeCount: 0,
        authSummary: null,
      },
      {
        publicId: "org-city-001",
        name: "杭州市烟草公司",
        orgTier: "city",
        parentOrganizationPublicId: "org-province-001",
        status: "active",
        employeeCount: 3,
        authSummary: null,
      },
      {
        publicId: "org-district-001",
        name: "西湖区烟草公司",
        orgTier: "district",
        parentOrganizationPublicId: "org-city-001",
        status: "active",
        employeeCount: 2,
        authSummary: null,
      },
    ],
  },
};

const orgAuthPayload = {
  code: 0,
  message: "ok",
  data: {
    orgAuths: [
      {
        publicId: "org-auth-public-001",
        name: "杭州烟草企业授权",
        purchaserOrganizationPublicId: "organization-public-001",
        authScopeType: "current_and_descendants",
        profession: "monopoly",
        level: 3,
        accountQuota: 100,
        usedQuota: 42,
        startsAt: "2026-05-22T00:00:00.000Z",
        expiresAt: "2026-08-22T00:00:00.000Z",
        status: "active",
        cancelledAt: null,
        organizationPublicIds: ["organization-public-001"],
        createdAt: "2026-05-22T00:00:00.000Z",
        updatedAt: "2026-05-22T00:00:00.000Z",
      },
    ],
  },
};

const employeePayload = {
  code: 0,
  message: "ok",
  data: {
    employees: [
      {
        publicId: "employee-public-001",
        userPublicId: "user-employee-public-001",
        phone: "13800000000",
        name: "张三",
        organizationPublicId: "organization-public-001",
        status: "active",
      },
    ],
  },
};

const redeemCodePayload = {
  code: 0,
  message: "ok",
  data: {
    redeemCodes: [
      {
        publicId: "redeem-code-public-001",
        codeDisplay: "RC-2026-****",
        canViewPlainText: false,
        profession: "monopoly",
        level: 3,
        status: "unused",
        redeemedUserPublicId: null,
        redeemDeadlineAt: "2026-06-24T15:59:59.999Z",
        createdAt: "2026-05-22T00:00:00.000Z",
      },
    ],
  },
};

const redeemCodeDetailPayload = {
  code: 0,
  message: "ok",
  data: {
    redeemCode: {
      publicId: "redeem-code-public-001",
      codeDisplay: "RC-2026-****",
      canViewPlainText: false,
      profession: "monopoly",
      level: 3,
      status: "unused",
      redeemedUserPublicId: null,
      redeemedAt: null,
      durationDay: 365,
      redeemDeadlineAt: "2026-06-24T15:59:59.999Z",
      generationGroupId: "redeem-code-batch-public-001",
      createdAt: "2026-05-22T00:00:00.000Z",
      updatedAt: "2026-05-23T09:00:00.000Z",
      redactionStatus: "redacted",
      redactionReason: "plaintext_redeem_code_and_hash_hidden",
      id: 402,
      code_hash: "detail-do-not-render",
      codePlainText: "RC-2026-DETAIL-PLAIN",
    },
  },
};

const generatedRedeemCodePayload = {
  code: 0,
  message: "ok",
  data: {
    generation: {
      generationGroupId: "redeem-code-batch-public-001",
      count: 2,
      profession: "logistics",
      level: 4,
      durationDay: 180,
      redeemDeadlineAt: "2026-07-01T15:59:59.999Z",
    },
    redeemCodes: [
      {
        publicId: "redeem-code-public-generated-001",
        codePlainText: "LOCALTST",
        codeDisplay: "LOCALTST",
        profession: "logistics",
        level: 4,
        status: "unused",
        redeemDeadlineAt: "2026-07-01T15:59:59.999Z",
        createdAt: "2026-05-25T00:00:00.000Z",
      },
    ],
  },
};

function createJsonResponse(payload: unknown) {
  return {
    ok: true,
    status: 200,
    json: async () => payload,
  };
}

function mockSystemOpsFetch() {
  const fetchMock = vi.fn(
    async (url: RequestInfo | URL, init?: RequestInit) => {
      void init;
      const path = String(url);

      if (path === "/api/v1/sessions") {
        return createJsonResponse(adminSessionPayload);
      }

      if (path === "/api/v1/organizations?page=1&pageSize=20") {
        return createJsonResponse(organizationPayload);
      }

      if (path === "/api/v1/org-auths?page=1&pageSize=20") {
        return createJsonResponse(orgAuthPayload);
      }

      if (path === "/api/v1/employees?page=1&pageSize=20") {
        return createJsonResponse(employeePayload);
      }

      if (path === "/api/v1/employees/employee-public-001/unbind") {
        return createJsonResponse({
          code: 0,
          message: "ok",
          data: {
            employeePublicId: "employee-public-001",
            userPublicId: "user-employee-public-001",
            previousOrganizationPublicId: "organization-public-001",
            status: "unbound",
          },
        });
      }

      if (path === "/api/v1/redeem-codes?page=1&pageSize=20") {
        return createJsonResponse(redeemCodePayload);
      }

      if (path === "/api/v1/redeem-codes/redeem-code-public-001") {
        return createJsonResponse(redeemCodeDetailPayload);
      }

      if (
        path ===
        "/api/v1/redeem-codes?page=1&pageSize=20&status=unused&keyword=RC-2026"
      ) {
        return createJsonResponse(redeemCodePayload);
      }

      if (path === "/api/v1/org-auths") {
        return createJsonResponse({
          code: 0,
          message: "ok",
          data: {
            orgAuth: {
              ...orgAuthPayload.data.orgAuths[0],
              publicId: "org-auth-public-created-001",
              name: "本地验证企业授权",
              usedQuota: 0,
            },
          },
        });
      }

      if (path === "/api/v1/org-auths/org-auth-public-001/cancel") {
        return createJsonResponse({
          code: 0,
          message: "ok",
          data: {
            orgAuth: {
              ...orgAuthPayload.data.orgAuths[0],
              status: "cancelled",
              cancelledAt: "2026-05-25T00:00:00.000Z",
            },
          },
        });
      }

      if (path === "/api/v1/redeem-codes") {
        return createJsonResponse(generatedRedeemCodePayload);
      }

      return createJsonResponse({
        code: 404001,
        message: "missing",
        data: null,
      });
    },
  );

  vi.stubGlobal("fetch", fetchMock);

  return fetchMock;
}

function mockSystemOpsFetchWithOrganizationTree() {
  const fetchMock = vi.fn(
    async (url: RequestInfo | URL, init?: RequestInit) => {
      const path = String(url);

      if (path === "/api/v1/sessions") {
        return createJsonResponse(adminSessionPayload);
      }

      if (path === "/api/v1/organizations?page=1&pageSize=20") {
        return createJsonResponse(organizationTreePayload);
      }

      if (path === "/api/v1/org-auths?page=1&pageSize=20") {
        return createJsonResponse({
          code: 0,
          message: "ok",
          data: { orgAuths: [] },
        });
      }

      if (path === "/api/v1/employees?page=1&pageSize=20") {
        return createJsonResponse({
          code: 0,
          message: "ok",
          data: { employees: [] },
        });
      }

      if (path === "/api/v1/employees/import") {
        return createJsonResponse({
          code: 0,
          message: "ok",
          data: {
            importedEmployees: [
              {
                publicId: "employee-imported-public-001",
                userPublicId: "user-imported-public-001",
                phone: "13900001111",
                name: "Import One",
                organizationPublicId: "org-district-001",
                status: "active",
              },
            ],
            rejectedRows: [
              {
                rowNumber: 3,
                userPublicId: "user-rejected-public-001",
                organizationPublicId: "org-missing-public-001",
                reason: "duplicate_phone",
              },
            ],
          },
        });
      }

      if (path === "/api/v1/org-auths") {
        const body = JSON.parse(String(init?.body));

        return createJsonResponse({
          code: 0,
          message: "ok",
          data: {
            orgAuth: {
              publicId: "org-auth-public-created-tree",
              name: body.name,
              purchaserOrganizationPublicId: body.purchaserOrganizationPublicId,
              authScopeType: body.authScopeType,
              profession: body.profession,
              level: body.level,
              accountQuota: body.accountQuota,
              usedQuota: 0,
              startsAt: body.startsAt,
              expiresAt: body.expiresAt,
              status: "active",
              cancelledAt: null,
              organizationPublicIds: body.organizationPublicIds,
              createdAt: "2026-05-26T00:00:00.000Z",
              updatedAt: "2026-05-26T00:00:00.000Z",
            },
          },
        });
      }

      if (path === "/api/v1/organizations") {
        const body = JSON.parse(String(init?.body));

        return createJsonResponse({
          code: 0,
          message: "ok",
          data: {
            organization: {
              publicId: "org-province-created",
              name: body.name,
              orgTier: body.orgTier,
              parentOrganizationPublicId: body.parentOrganizationPublicId,
              status: "active",
              contactName: body.contactName,
              contactPhone: body.contactPhone,
              remark: body.remark,
              createdAt: "2026-05-26T00:00:00.000Z",
              updatedAt: "2026-05-26T00:00:00.000Z",
            },
          },
        });
      }

      if (path === "/api/v1/organizations/org-city-001") {
        const body = JSON.parse(String(init?.body));

        return createJsonResponse({
          code: 0,
          message: "ok",
          data: {
            organization: {
              publicId: "org-city-001",
              name: body.name,
              orgTier: body.orgTier,
              parentOrganizationPublicId: body.parentOrganizationPublicId,
              status: body.status,
              contactName: body.contactName,
              contactPhone: body.contactPhone,
              remark: body.remark,
              createdAt: "2026-05-26T00:00:00.000Z",
              updatedAt: "2026-05-26T00:10:00.000Z",
            },
          },
        });
      }

      if (path === "/api/v1/organizations/org-city-001/disable") {
        return createJsonResponse({
          code: 0,
          message: "ok",
          data: {
            organization: {
              ...organizationTreePayload.data.organizations[1],
              status: "disabled",
              contactName: null,
              contactPhone: null,
              remark: null,
              createdAt: "2026-05-26T00:00:00.000Z",
              updatedAt: "2026-05-26T00:20:00.000Z",
            },
            affectedOrganizationPublicIds: ["org-city-001"],
          },
        });
      }

      return createJsonResponse({
        code: 404001,
        message: "missing",
        data: null,
      });
    },
  );

  vi.stubGlobal("fetch", fetchMock);

  return fetchMock;
}

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

  it("returns safe admin operation summaries and denies content admin user credential mutations", async () => {
    const service = createAdminUserOrgAuthOpsService({
      actor: {
        publicId: "admin-content-001",
        roles: ["content_admin"],
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

  it("makes required system ops staging entries discoverable from org_auth and redeem_code pages", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockSystemOpsFetch();

    render(createElement(AdminRedeemCodePage));

    const redeemCodeEntry = await screen.findByTestId(
      "system-ops-redeem-code-generate-entry",
    );
    expect(
      within(redeemCodeEntry).getByRole("link", { name: "生成卡密" }),
    ).toHaveAttribute("href", "#redeem-code-generate-panel");
    expect(redeemCodeEntry).toHaveTextContent("系统运营本地验收");
    expect(redeemCodeEntry).not.toHaveTextContent("staging 必验");

    cleanup();
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockSystemOpsFetch();

    render(createElement(AdminOrgAuthPage));

    const orgAuthEntry = await screen.findByTestId(
      "system-ops-org-auth-create-entry",
    );
    expect(
      within(orgAuthEntry).getByRole("link", { name: "新增企业授权" }),
    ).toHaveAttribute("href", "#org-auth-create-panel");
    expect(orgAuthEntry).toHaveTextContent("系统运营本地验收");
    expect(orgAuthEntry).not.toHaveTextContent("staging 必验");
  });

  it("closes org_auth create and cancel actions on the organization page", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockSystemOpsFetch();

    render(createElement(AdminOrgAuthPage));

    await screen.findByTestId("org-auth-create-form");
    fireEvent.change(screen.getByTestId("org-auth-edition-select"), {
      target: { value: "standard" },
    });

    await screen.findByRole("heading", { name: "企业授权运营" });

    fireEvent.click(screen.getByRole("button", { name: "创建企业授权" }));
    expect(screen.getByRole("alertdialog")).toHaveTextContent(
      "确认创建企业授权？",
    );
    fireEvent.click(screen.getByRole("button", { name: "确认创建" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      "企业授权已创建",
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/org-auths",
      expect.objectContaining({
        method: "POST",
      }),
    );
    const createCall = fetchMock.mock.calls.find(
      ([url]) => String(url) === "/api/v1/org-auths",
    );
    expect(JSON.parse(String(createCall?.[1]?.body))).toMatchObject({
      purchaserOrganizationPublicId: "organization-public-001",
      authScopeType: "current_and_descendants",
      profession: "monopoly",
      level: 3,
      edition: "standard",
      accountQuota: 100,
      organizationPublicIds: ["organization-public-001"],
    });

    const activeOrgAuthRow = screen.getByTestId(
      "admin-org-auth-org-auth-public-001",
    );
    fireEvent.click(
      within(activeOrgAuthRow).getByRole("button", { name: "取消授权" }),
    );
    expect(screen.getByRole("alertdialog")).toHaveTextContent(
      "确认取消企业授权？",
    );
    fireEvent.click(screen.getByRole("button", { name: "确认取消" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      "企业授权已取消",
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/org-auths/org-auth-public-001/cancel",
      expect.objectContaining({
        method: "POST",
      }),
    );
  });

  it("requires explicit org_auth edition selection before create submit", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockSystemOpsFetch();

    render(createElement(AdminOrgAuthPage));

    await screen.findByTestId("org-auth-create-form");

    const createButton = screen.getByTestId("org-auth-create-button");

    expect(createButton).toBeDisabled();

    fireEvent.change(screen.getByTestId("org-auth-edition-select"), {
      target: { value: "advanced" },
    });

    expect(createButton).not.toBeDisabled();

    fireEvent.click(createButton);
    expect(screen.getByRole("alertdialog")).toHaveTextContent("advanced");
    fireEvent.click(screen.getByTestId("org-auth-confirm-action"));

    const createCall = fetchMock.mock.calls.find(
      ([url]) => String(url) === "/api/v1/org-auths",
    );
    expect(JSON.parse(String(createCall?.[1]?.body))).toMatchObject({
      edition: "advanced",
    });
  });

  it("submits full org_auth scope fields for specified organization nodes", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockSystemOpsFetchWithOrganizationTree();

    render(createElement(AdminOrgAuthPage));

    await screen.findByRole("heading", { name: "企业授权运营" });

    fireEvent.change(screen.getByLabelText("授权名称"), {
      target: { value: "杭州市县区联合授权" },
    });
    fireEvent.change(screen.getByLabelText("购买主体"), {
      target: { value: "org-city-001" },
    });
    fireEvent.change(screen.getByLabelText("授权范围类型"), {
      target: { value: "specified_nodes" },
    });
    fireEvent.click(screen.getByLabelText("西湖区烟草公司"));
    fireEvent.change(screen.getByLabelText("专业"), {
      target: { value: "logistics" },
    });
    fireEvent.change(screen.getByTestId("org-auth-edition-select"), {
      target: { value: "advanced" },
    });
    fireEvent.change(screen.getByLabelText("等级"), {
      target: { value: "5" },
    });
    fireEvent.change(screen.getByLabelText("账号额度"), {
      target: { value: "30" },
    });
    fireEvent.change(screen.getByLabelText("开始日期"), {
      target: { value: "2026-06-01" },
    });
    fireEvent.change(screen.getByLabelText("到期日期"), {
      target: { value: "2027-06-01" },
    });

    fireEvent.click(screen.getByRole("button", { name: "创建企业授权" }));
    expect(screen.getByRole("alertdialog")).toHaveTextContent(
      "确认创建企业授权？",
    );
    fireEvent.click(screen.getByRole("button", { name: "确认创建" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      "企业授权已创建",
    );

    const createCall = fetchMock.mock.calls.find(
      ([url]) => String(url) === "/api/v1/org-auths",
    );
    expect(JSON.parse(String(createCall?.[1]?.body))).toEqual({
      accountQuota: 30,
      authScopeType: "specified_nodes",
      expiresAt: "2027-06-01T00:00:00.000Z",
      level: 5,
      name: "杭州市县区联合授权",
      organizationPublicIds: ["org-district-001"],
      edition: "advanced",
      profession: "logistics",
      purchaserOrganizationPublicId: "org-city-001",
      startsAt: "2026-06-01T00:00:00.000Z",
    });
  });

  it("creates, edits, and disables organization tree nodes from the organization page", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockSystemOpsFetchWithOrganizationTree();

    render(createElement(AdminOrgAuthPage));

    await screen.findByTestId("organization-tree-management-form");

    fireEvent.change(screen.getByTestId("organization-name-input"), {
      target: { value: "Fujian Test Tobacco" },
    });
    fireEvent.change(screen.getByTestId("organization-tier-select"), {
      target: { value: "province" },
    });
    fireEvent.click(screen.getByTestId("organization-submit-button"));
    fireEvent.click(screen.getByTestId("organization-confirm-action"));

    const createCall = fetchMock.mock.calls.find(
      ([url]) => String(url) === "/api/v1/organizations",
    );
    expect(JSON.parse(String(createCall?.[1]?.body))).toMatchObject({
      name: "Fujian Test Tobacco",
      orgTier: "province",
      parentOrganizationPublicId: null,
    });

    fireEvent.click(screen.getByTestId("organization-edit-org-city-001"));
    fireEvent.change(screen.getByTestId("organization-name-input"), {
      target: { value: "Quanzhou Test Tobacco" },
    });
    fireEvent.change(screen.getByTestId("organization-parent-select"), {
      target: { value: "org-province-001" },
    });
    fireEvent.click(screen.getByTestId("organization-submit-button"));
    fireEvent.click(screen.getByTestId("organization-confirm-action"));

    const updateCall = fetchMock.mock.calls.find(
      ([url]) => String(url) === "/api/v1/organizations/org-city-001",
    );
    expect(JSON.parse(String(updateCall?.[1]?.body))).toMatchObject({
      name: "Quanzhou Test Tobacco",
      orgTier: "city",
      parentOrganizationPublicId: "org-province-001",
      status: "active",
    });

    fireEvent.click(screen.getByTestId("organization-disable-org-city-001"));
    fireEvent.click(screen.getByTestId("organization-confirm-action"));

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/organizations/org-city-001/disable",
      expect.objectContaining({
        method: "POST",
      }),
    );
  });

  it("renders organization detail management without leaking internal identifiers", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockSystemOpsFetch();

    render(createElement(AdminOrgAuthPage));

    const organization = await screen.findByTestId(
      "admin-organization-organization-public-001",
    );
    fireEvent.click(within(organization).getByRole("button", { name: "详情" }));

    const organizationDetail = screen.getByTestId(
      "admin-organization-detail-organization-public-001",
    );

    expect(organizationDetail).toHaveAttribute(
      "data-public-id",
      "organization-public-001",
    );
    expect(organizationDetail).not.toHaveAttribute("data-id");
    expect(organizationDetail).toHaveTextContent("组织详情");
    expect(organizationDetail).toHaveTextContent("杭州烟草");
    expect(organizationDetail).toHaveTextContent("市级");
    expect(organizationDetail).toHaveTextContent("员工 42");
    expect(organizationDetail).toHaveTextContent("关联授权 1");
    expect(organizationDetail).toHaveTextContent("杭州烟草企业授权");
    expect(organizationDetail).not.toHaveTextContent("101");
    expect(organizationDetail).not.toHaveTextContent("201");
    expect(organizationDetail).not.toHaveTextContent("301");

    fireEvent.click(
      within(organizationDetail).getByRole("button", { name: "编辑组织" }),
    );
    expect(screen.getByTestId("organization-name-input")).toHaveValue(
      "杭州烟草",
    );

    fireEvent.click(
      within(organizationDetail).getByRole("button", { name: "关闭" }),
    );
    expect(
      screen.queryByTestId("admin-organization-detail-organization-public-001"),
    ).not.toBeInTheDocument();
  });

  it("blocks organization tree mutations with invalid tier parent selection", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockSystemOpsFetchWithOrganizationTree();

    render(createElement(AdminOrgAuthPage));

    await screen.findByTestId("organization-tree-management-form");

    fireEvent.change(screen.getByTestId("organization-name-input"), {
      target: { value: "Invalid District Test" },
    });
    fireEvent.change(screen.getByTestId("organization-tier-select"), {
      target: { value: "district" },
    });
    fireEvent.change(screen.getByTestId("organization-parent-select"), {
      target: { value: "org-province-001" },
    });

    expect(screen.getByTestId("organization-form-error")).toHaveTextContent(
      /./,
    );
    expect(screen.getByTestId("organization-submit-button")).toBeDisabled();
    expect(
      fetchMock.mock.calls.some(
        ([url]) => String(url) === "/api/v1/organizations",
      ),
    ).toBe(false);
  });

  it("previews employee import content and renders redacted rejection feedback", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockSystemOpsFetchWithOrganizationTree();
    const employeeImportContent = [
      "phone,name,initialPassword,organizationPublicId",
      "13900001111,Import One,Passw0rd!,org-district-001",
      "13900002222,Import Two,Passw0rd!,org-missing-public-001",
    ].join("\n");

    render(createElement(AdminOrgAuthPage));

    await screen.findByTestId("employee-import-textarea");

    fireEvent.change(screen.getByTestId("employee-import-textarea"), {
      target: { value: employeeImportContent },
    });

    const importPreview = screen.getByTestId("employee-import-preview");
    expect(importPreview).toHaveTextContent("员工账号 CSV");
    expect(importPreview).toHaveTextContent("2 行");

    fireEvent.click(screen.getByTestId("employee-import-submit"));
    expect(screen.getByRole("alertdialog")).toHaveTextContent("确认导入员工？");
    fireEvent.click(screen.getByTestId("employee-confirm-action"));

    const importResult = await screen.findByTestId("employee-import-result");
    expect(importResult).toHaveTextContent("成功 1");
    expect(importResult).toHaveTextContent("拒绝 1");
    expect(importResult).toHaveTextContent("第 3 行：手机号重复");
    expect(importResult).not.toHaveTextContent("user-rejected-public-001");
    expect(importResult).not.toHaveTextContent("org-missing-public-001");
    expect(importResult).not.toHaveTextContent("13900002222");

    const importCall = fetchMock.mock.calls.find(
      ([url]) => String(url) === "/api/v1/employees/import",
    );
    expect(JSON.parse(String(importCall?.[1]?.body))).toEqual({
      content: employeeImportContent,
      sourceFormat: "csv",
    });
  });

  it("manages employee unbind feedback and marks transfer as approval required", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockSystemOpsFetch();

    render(createElement(AdminOrgAuthPage));

    const employee = await screen.findByTestId(
      "admin-employee-employee-public-001",
    );
    const transferBoundary = screen.getByTestId(
      "employee-transfer-approval-required",
    );

    expect(transferBoundary).toHaveTextContent("approval_required");
    expect(transferBoundary).toHaveTextContent("transfer route");
    expect(within(employee).getByText(/解绑影响/)).toHaveTextContent(
      "原组织员工数 -1",
    );

    fireEvent.click(within(employee).getByRole("button", { name: "解绑" }));
    expect(screen.getByRole("alertdialog")).toHaveTextContent("确认解绑员工？");
    fireEvent.click(screen.getByTestId("employee-confirm-action"));

    expect(await screen.findByRole("status")).toHaveTextContent("员工已解绑");
    const unbindResult = screen.getByTestId("employee-unbind-result");

    expect(unbindResult).toHaveTextContent("解绑成功");
    expect(unbindResult).toHaveTextContent("杭州烟草");
    expect(unbindResult).not.toHaveAttribute("data-id");
    expect(
      screen.queryByTestId("admin-employee-employee-public-001"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByTestId("admin-organization-organization-public-001"),
    ).toHaveTextContent("41 名员工");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/employees/employee-public-001/unbind",
      expect.objectContaining({
        method: "POST",
      }),
    );
  });

  it("closes redeem_code generation and filtering on the redeem code page", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockSystemOpsFetch();

    render(createElement(AdminRedeemCodePage));

    await screen.findByRole("heading", { name: "卡密管理" });

    fireEvent.change(screen.getByLabelText("卡密状态"), {
      target: { value: "unused" },
    });
    fireEvent.change(screen.getByLabelText("卡密搜索"), {
      target: { value: "RC-2026" },
    });

    expect(await screen.findByText("RC-2026-****")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/redeem-codes?page=1&pageSize=20&status=unused&keyword=RC-2026",
      expect.anything(),
    );

    fireEvent.click(screen.getByTestId("redeem-code-generation-mode-batch"));
    fireEvent.change(screen.getByTestId("redeem-code-generation-count-input"), {
      target: { value: "2" },
    });
    fireEvent.change(
      screen.getByTestId("redeem-code-generation-profession-select"),
      {
        target: { value: "logistics" },
      },
    );
    fireEvent.change(screen.getByTestId("redeem-code-generation-level-input"), {
      target: { value: "4" },
    });
    fireEvent.change(
      screen.getByTestId("redeem-code-generation-duration-input"),
      {
        target: { value: "180" },
      },
    );
    fireEvent.change(
      screen.getByTestId("redeem-code-generation-deadline-input"),
      {
        target: { value: "2026-07-01" },
      },
    );

    fireEvent.click(screen.getByTestId("redeem-code-generate-button"));
    expect(screen.getByRole("alertdialog")).toHaveTextContent("确认生成卡密？");
    expect(screen.getByRole("alertdialog")).toHaveTextContent("2");
    expect(screen.getByRole("alertdialog")).not.toHaveTextContent("LOCALTST");
    fireEvent.click(
      screen.getByTestId("redeem-code-generation-confirm-action"),
    );

    expect(await screen.findByRole("status")).toHaveTextContent(
      "卡密已生成，请仅在本地验证时复制给学员",
    );
    const generationSummary = await screen.findByTestId(
      "redeem-code-generation-redacted-summary",
    );
    expect(generationSummary).toHaveTextContent("redeem-code-batch-public-001");
    expect(generationSummary).toHaveTextContent("2");
    expect(generationSummary).toHaveTextContent("logistics");
    expect(generationSummary).toHaveTextContent("4");
    expect(generationSummary).not.toHaveTextContent("LOCALTST");
    expect(screen.queryByText("LOCALTST")).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/redeem-codes",
      expect.objectContaining({
        method: "POST",
      }),
    );
    const generateCall = fetchMock.mock.calls.find(
      ([url]) => String(url) === "/api/v1/redeem-codes",
    );
    expect(JSON.parse(String(generateCall?.[1]?.body))).toMatchObject({
      count: 2,
      profession: "logistics",
      level: 4,
      durationDay: 180,
      redeemDeadlineDate: "2026-07-01",
    });
  });

  it("renders a redacted redeem_code detail view from the redeem code page", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockSystemOpsFetch();

    render(createElement(AdminRedeemCodePage));

    await screen.findByRole("heading", { name: "卡密管理" });

    const redeemCodeRow = await screen.findByTestId(
      "admin-redeem-code-redeem-code-public-001",
    );

    fireEvent.click(
      within(redeemCodeRow).getByRole("button", { name: "详情" }),
    );

    const redeemCodeDetail = await screen.findByTestId(
      "admin-redeem-code-detail-redeem-code-public-001",
    );

    expect(redeemCodeDetail).toHaveAttribute(
      "data-public-id",
      "redeem-code-public-001",
    );
    expect(redeemCodeDetail).not.toHaveAttribute("data-id");
    expect(redeemCodeDetail).toHaveTextContent("RC-2026-****");
    expect(redeemCodeDetail).toHaveTextContent("redeem-code-public-001");
    expect(redeemCodeDetail).toHaveTextContent("redeem-code-batch-public-001");
    expect(redeemCodeDetail).toHaveTextContent("365");
    expect(redeemCodeDetail).toHaveTextContent("redacted");
    expect(redeemCodeDetail).toHaveTextContent("未兑换");
    expect(redeemCodeDetail).toHaveTextContent("2026-06-24");
    expect(redeemCodeDetail).not.toHaveTextContent("LOCALTST");
    expect(redeemCodeDetail).not.toHaveTextContent("code_hash");
    expect(redeemCodeDetail).not.toHaveTextContent("detail-do-not-render");
    expect(redeemCodeDetail).not.toHaveTextContent("RC-2026-DETAIL-PLAIN");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/redeem-codes/redeem-code-public-001",
      expect.objectContaining({
        headers: { authorization: "Bearer unit-test-admin-token" },
      }),
    );

    fireEvent.click(
      within(redeemCodeDetail).getByRole("button", { name: "关闭" }),
    );
    expect(
      screen.queryByTestId("admin-redeem-code-detail-redeem-code-public-001"),
    ).not.toBeInTheDocument();
  });
});

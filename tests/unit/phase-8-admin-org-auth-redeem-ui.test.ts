import { createElement } from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  AdminOrgAuthPage,
  AdminRedeemCodePage,
} from "@/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage";

const adminSessionPayload = {
  code: 0,
  message: "ok",
  data: {
    user: {
      publicId: "user-dev-admin",
      phone: "13900000001",
      name: "Dev Admin",
      userType: null,
      status: "active",
      lockedUntilAt: null,
      employeePublicId: null,
      organizationPublicId: null,
      adminPublicId: "admin-dev-super-admin",
      adminRoles: ["super_admin"],
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
        id: 101,
      },
    ],
  },
  pagination: {
    page: 1,
    pageSize: 20,
    total: 1,
    sortBy: "updatedAt",
    sortOrder: "desc",
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
        purchaserOrganizationName: "杭州烟草",
        authScopeType: "current_and_descendants",
        profession: "monopoly",
        level: 3,
        accountQuota: 100,
        usedQuota: 42,
        edition: "advanced",
        effectiveEdition: "advanced",
        upgradeStatus: "none",
        startsAt: "2026-05-22T00:00:00.000Z",
        expiresAt: "2026-08-22T00:00:00.000Z",
        status: "active",
        cancelledAt: null,
        organizationPublicIds: ["organization-public-001"],
        coveredOrganizationCount: 1,
        coveredOrganizationNames: ["杭州烟草"],
        createdAt: "2026-05-22T00:00:00.000Z",
        updatedAt: "2026-05-22T00:00:00.000Z",
        id: 201,
      },
    ],
  },
  pagination: {
    page: 1,
    pageSize: 20,
    total: 1,
    sortBy: "updatedAt",
    sortOrder: "desc",
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
        organizationName: "杭州烟草",
        activeOrgAuthCount: 2,
        registeredAt: "2026-05-20T00:00:00.000Z",
        status: "active",
        id: 301,
      },
    ],
  },
  pagination: {
    page: 1,
    pageSize: 20,
    total: 1,
    sortBy: "updatedAt",
    sortOrder: "desc",
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
        codePlainText: "RC-2026-0001-PLAIN",
        redeemCodeType: "personal_standard_activation",
        canViewPlainText: false,
        profession: "monopoly",
        level: 3,
        status: "unused",
        redeemedUserPublicId: null,
        redeemDeadlineAt: "2026-06-24T15:59:59.999Z",
        createdAt: "2026-05-22T00:00:00.000Z",
        id: 401,
        code_hash: "do-not-render",
      },
    ],
  },
  pagination: {
    page: 1,
    pageSize: 20,
    total: 1,
    sortBy: "createdAt",
    sortOrder: "desc",
  },
};

function createJsonResponse(payload: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload,
  };
}

function mockAdminFetch() {
  const fetchMock = vi.fn(async (url: RequestInfo | URL) => {
    const path = String(url);

    if (path === "/api/v1/sessions") {
      return createJsonResponse(adminSessionPayload);
    }

    if (path.startsWith("/api/v1/organization-tree-nodes?")) {
      const requestUrl = new URL(path, "http://localhost");
      const parentOrganizationPublicId = requestUrl.searchParams.get(
        "parentOrganizationPublicId",
      );
      const keyword = requestUrl.searchParams.get("keyword");
      const treeNodes = [
        {
          publicId: "organization-public-province",
          name: "测试省",
          orgTier: "province",
          parentOrganizationPublicId: null,
          status: "active",
          employeeCount: 8,
          childCount: 1,
          authSummary: null,
          ancestorPath: [],
        },
        {
          publicId: "organization-public-city",
          name: "测试地市",
          orgTier: "city",
          parentOrganizationPublicId: "organization-public-province",
          status: "active",
          employeeCount: 6,
          childCount: 1,
          authSummary: null,
          ancestorPath: [
            {
              publicId: "organization-public-province",
              name: "测试省",
              orgTier: "province",
            },
          ],
        },
        {
          publicId: "organization-public-district",
          name: "测试县区",
          orgTier: "district",
          parentOrganizationPublicId: "organization-public-city",
          status: "active",
          employeeCount: 4,
          childCount: 1,
          authSummary: "专卖 3级",
          ancestorPath: [
            {
              publicId: "organization-public-province",
              name: "测试省",
              orgTier: "province",
            },
            {
              publicId: "organization-public-city",
              name: "测试地市",
              orgTier: "city",
            },
          ],
        },
        {
          publicId: "organization-public-station",
          name: "测试站点",
          orgTier: "station",
          parentOrganizationPublicId: "organization-public-district",
          status: "active",
          employeeCount: 2,
          childCount: 0,
          authSummary: "专卖 3级",
          ancestorPath: [
            {
              publicId: "organization-public-province",
              name: "测试省",
              orgTier: "province",
            },
            {
              publicId: "organization-public-city",
              name: "测试地市",
              orgTier: "city",
            },
            {
              publicId: "organization-public-district",
              name: "测试县区",
              orgTier: "district",
            },
          ],
        },
      ];
      const nodes =
        keyword === "测试站点"
          ? [treeNodes[3]]
          : treeNodes.filter(
              (node) =>
                node.parentOrganizationPublicId === parentOrganizationPublicId,
            );

      return createJsonResponse({
        code: 0,
        message: "ok",
        data: { nodes },
        pagination: {
          page: 1,
          pageSize: 50,
          total: nodes.length,
          sortBy: "name",
          sortOrder: "asc",
        },
      });
    }

    if (path === "/api/v1/organizations?page=1&pageSize=20") {
      return createJsonResponse(organizationPayload);
    }

    if (path.startsWith("/api/v1/org-auths?")) {
      const requestUrl = new URL(path, "http://localhost");
      const page = Number(requestUrl.searchParams.get("page") ?? "1");
      const pageSize = Number(requestUrl.searchParams.get("pageSize") ?? "20");

      return createJsonResponse({
        ...orgAuthPayload,
        pagination: {
          page,
          pageSize,
          total: 75,
          sortBy: requestUrl.searchParams.get("sortBy") ?? "updatedAt",
          sortOrder: requestUrl.searchParams.get("sortOrder") ?? "desc",
        },
      });
    }

    if (path.startsWith("/api/v1/employees?")) {
      const requestUrl = new URL(path, "http://localhost");
      const page = Number(requestUrl.searchParams.get("page") ?? "1");
      const pageSize = Number(requestUrl.searchParams.get("pageSize") ?? "20");

      return createJsonResponse({
        ...employeePayload,
        pagination: {
          page,
          pageSize,
          total: 65,
          sortBy: requestUrl.searchParams.get("sortBy") ?? "registeredAt",
          sortOrder: requestUrl.searchParams.get("sortOrder") ?? "desc",
        },
      });
    }

    if (path.startsWith("/api/v1/redeem-codes?")) {
      return createJsonResponse(redeemCodePayload);
    }

    return createJsonResponse({ code: 404001, message: "missing", data: null });
  });

  vi.stubGlobal("fetch", fetchMock);

  return fetchMock;
}

afterEach(() => {
  cleanup();
  localStorage.clear();
  window.history.replaceState(null, "", "/");
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("AdminOrgAuthPage", () => {
  it("uses a list-first employee workflow with reusable filters, pagination, and on-demand actions", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockAdminFetch();

    render(createElement(AdminOrgAuthPage));

    await screen.findByRole("heading", { name: "企业管理" });
    fireEvent.click(screen.getByTestId("ops-organization-view-employees"));

    const toolbar = await screen.findByRole("region", { name: "员工筛选" });
    const table = screen.getByRole("table", { name: "员工账号列表" });
    expect(toolbar).toHaveTextContent("共 65 名员工");
    expect(table).toHaveTextContent("杭州烟草");
    expect(table).toHaveTextContent("有效企业授权 2 项");
    expect(table).toHaveTextContent("2026-05-20");
    expect(
      within(table).queryByText("employee-public-001"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("employee-import-textarea"),
    ).not.toBeInTheDocument();

    fireEvent.change(within(toolbar).getByLabelText("员工关键词"), {
      target: { value: "员工" },
    });
    fireEvent.change(within(toolbar).getByLabelText("所属企业名称"), {
      target: { value: "杭州" },
    });
    fireEvent.change(within(toolbar).getByLabelText("员工状态"), {
      target: { value: "disabled" },
    });
    fireEvent.change(within(toolbar).getByLabelText("员工每页条数"), {
      target: { value: "50" },
    });

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/v1/employees?page=1&pageSize=50&sortBy=registeredAt&sortOrder=desc&keyword=%E5%91%98%E5%B7%A5&organizationKeyword=%E6%9D%AD%E5%B7%9E&status=disabled",
        expect.anything(),
      ),
    );

    fireEvent.click(screen.getByRole("button", { name: "下一页" }));
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/employees?page=2&pageSize=50"),
        expect.anything(),
      ),
    );

    fireEvent.click(within(toolbar).getByRole("button", { name: "重置筛选" }));
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/v1/employees?page=1&pageSize=20&sortBy=registeredAt&sortOrder=desc",
        expect.anything(),
      ),
    );

    fireEvent.click(
      within(toolbar).getByRole("button", { name: "批量导入员工" }),
    );
    expect(
      screen.getByRole("dialog", { name: "批量导入员工" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("employee-import-textarea")).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });

    fireEvent.click(within(table).getByRole("button", { name: "转移员工" }));
    expect(
      screen.getByRole("dialog", { name: "转移员工" }),
    ).toBeInTheDocument();
  });

  it("uses a list-first enterprise authorization workflow with reusable filters and pagination", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockAdminFetch();

    render(createElement(AdminOrgAuthPage));

    await screen.findByRole("heading", { name: "企业管理" });
    fireEvent.click(screen.getByTestId("ops-organization-view-org-auth"));

    const toolbar = await screen.findByRole("region", {
      name: "企业授权筛选",
    });
    expect(
      screen.queryByTestId("org-auth-create-form"),
    ).not.toBeInTheDocument();
    const orgAuthTable = screen.getByRole("table", {
      name: "企业授权列表",
    });
    expect(orgAuthTable).toBeInTheDocument();
    expect(within(toolbar).getByText("共 75 条企业授权")).toBeInTheDocument();
    expect(screen.getAllByText("杭州烟草").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("覆盖 1 家企业")).toBeInTheDocument();
    expect(orgAuthTable).not.toHaveTextContent("organization-public-001");

    fireEvent.change(within(toolbar).getByLabelText("授权关键词"), {
      target: { value: "杭州" },
    });
    fireEvent.change(within(toolbar).getByLabelText("授权状态"), {
      target: { value: "active" },
    });
    fireEvent.change(within(toolbar).getByLabelText("授权版本"), {
      target: { value: "advanced" },
    });
    fireEvent.change(within(toolbar).getByLabelText("授权专业"), {
      target: { value: "logistics" },
    });
    fireEvent.change(within(toolbar).getByLabelText("授权等级"), {
      target: { value: "4" },
    });
    fireEvent.change(within(toolbar).getByLabelText("到期状态"), {
      target: { value: "expiring_soon" },
    });

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/v1/org-auths?page=1&pageSize=20&sortBy=expiresAt&sortOrder=asc&keyword=%E6%9D%AD%E5%B7%9E&status=active&edition=advanced&profession=logistics&level=4&expiryStatus=expiring_soon",
        expect.anything(),
      ),
    );

    fireEvent.click(screen.getByRole("button", { name: "下一页" }));
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/org-auths?page=2&pageSize=20"),
        expect.anything(),
      ),
    );

    fireEvent.click(within(toolbar).getByRole("button", { name: "重置筛选" }));
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/v1/org-auths?page=1&pageSize=20&sortBy=expiresAt&sortOrder=asc",
        expect.anything(),
      ),
    );

    const createOrgAuthButton = within(toolbar).getByRole("button", {
      name: "新增企业授权",
    });
    createOrgAuthButton.focus();
    fireEvent.click(createOrgAuthButton);
    expect(
      screen.getByRole("dialog", { name: "新增企业授权" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("org-auth-create-form")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "关闭新增企业授权" }),
    ).toHaveFocus();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(
      screen.queryByRole("dialog", { name: "新增企业授权" }),
    ).not.toBeInTheDocument();
    expect(createOrgAuthButton).toHaveFocus();
  });

  it("renders unauthorized state without calling protected admin APIs when the local session token is missing", async () => {
    const fetchMock = vi.fn(async (url: RequestInfo | URL) => {
      void url;

      return createJsonResponse({
        code: 401001,
        message: "unauthorized",
        data: null,
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(AdminOrgAuthPage));

    expect(await screen.findByText("请先登录后台")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "前往登录" })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/sessions",
      expect.anything(),
    );
    expect(
      fetchMock.mock.calls.some(([url]) => String(url).includes("org-auths")),
    ).toBe(false);
  });

  it("loads organization, org_auth, and employee data through the admin session runtime without leaking internals", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockAdminFetch();

    render(createElement(AdminOrgAuthPage));

    expect(screen.getByText("正在加载企业管理数据")).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "企业管理" }),
    ).toBeInTheDocument();

    const organization = await screen.findByTestId(
      "admin-organization-organization-public-province",
    );
    const orgAuth = screen.getByTestId("admin-org-auth-org-auth-public-001");
    const employee = screen.getByTestId("admin-employee-employee-public-001");

    expect(organization).toHaveAttribute(
      "data-public-id",
      "organization-public-province",
    );
    expect(organization).not.toHaveAttribute("data-id");
    expect(within(organization).getByText("测试省")).toBeInTheDocument();
    expect(within(orgAuth).getByText("专卖 3级")).toBeInTheDocument();
    expect(within(orgAuth).getByText("42 / 100")).toBeInTheDocument();
    expect(within(orgAuth).getByText("高级版")).toBeInTheDocument();
    expect(employee).toHaveAttribute("data-public-id", "employee-public-001");
    expect(within(employee).getByText("张三")).toBeInTheDocument();
    expect(document.body.textContent).not.toContain("unit-test-admin-token");
    expect(document.body.textContent).not.toContain("101");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/sessions",
      expect.objectContaining({
        headers: { authorization: "Bearer unit-test-admin-token" },
      }),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/org-auths?page=1&pageSize=20",
      expect.objectContaining({
        headers: { authorization: "Bearer unit-test-admin-token" },
      }),
    );
  });

  it("splits enterprise management into organization, authorization, and employee task views", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockAdminFetch();

    render(createElement(AdminOrgAuthPage));

    await screen.findByRole("heading", { name: "企业管理" });

    const viewTabs = screen.getByTestId(
      "ops-organization-management-view-tabs",
    );
    expect(viewTabs).toHaveTextContent("组织架构");
    expect(viewTabs).toHaveTextContent("企业授权");
    expect(viewTabs).toHaveTextContent("员工运营");
    expect(
      screen.queryByTestId("organization-tree-management-form"),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "新增省级组织" }));
    expect(
      screen.getByTestId("organization-tree-management-form"),
    ).toBeVisible();
    expect(
      screen.queryByTestId("org-auth-create-form"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("employee-import-textarea"),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("ops-organization-view-org-auth"));
    expect(
      screen.queryByTestId("org-auth-create-form"),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "新增企业授权" }));
    expect(screen.getByTestId("org-auth-create-form")).toBeVisible();
    expect(
      screen.getByTestId("organization-tree-management-form"),
    ).not.toBeVisible();
    expect(window.location.search).toContain("view=org-auth");

    fireEvent.click(screen.getByTestId("ops-organization-view-employees"));
    expect(
      screen.queryByTestId("employee-import-textarea"),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "批量导入员工" }));
    expect(screen.getByTestId("employee-import-textarea")).toBeVisible();
    expect(
      screen.queryByTestId("org-auth-create-form"),
    ).not.toBeInTheDocument();
    expect(window.location.search).toContain("view=employees");
  });

  it("shows organization node detail from the branch-loaded tree", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockAdminFetch();

    render(createElement(AdminOrgAuthPage));

    const organization = await screen.findByTestId(
      "admin-organization-organization-public-province",
    );
    fireEvent.click(within(organization).getByRole("button", { name: "详情" }));

    const organizationDetail = screen.getByTestId(
      "admin-organization-detail-organization-public-province",
    );

    expect(organizationDetail).toHaveTextContent("当前组织");
    expect(organizationDetail).toHaveTextContent("测试省");
    expect(organizationDetail).toHaveTextContent("直属员工");
    expect(organizationDetail).toHaveTextContent("直属下级");
    expect(organizationDetail).toHaveTextContent("授权摘要");
    expect(organizationDetail).not.toHaveTextContent("101");
    expect(organizationDetail).not.toHaveTextContent("201");
    expect(organizationDetail).not.toHaveTextContent("301");
  });

  it("loads the four-level organization tree by branch and shows full search ancestry", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockAdminFetch();

    render(createElement(AdminOrgAuthPage));

    const tree = await screen.findByRole("tree", { name: "企业组织树" });
    const provinceNode = within(tree).getByRole("treeitem", {
      name: /测试省/u,
    });
    expect(provinceNode).toHaveClass("text-left");

    fireEvent.click(within(provinceNode).getByRole("button", { name: "展开" }));
    const cityNode = await within(tree).findByRole("treeitem", {
      name: /测试地市/u,
    });
    fireEvent.click(within(cityNode).getByRole("button", { name: "展开" }));
    const districtNode = await within(tree).findByRole("treeitem", {
      name: /测试县区/u,
    });
    fireEvent.click(within(districtNode).getByRole("button", { name: "展开" }));
    expect(
      await within(tree).findByRole("treeitem", { name: /测试站点/u }),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("搜索企业组织"), {
      target: { value: "测试站点" },
    });
    expect(
      await screen.findAllByText("测试省 / 测试地市 / 测试县区 / 测试站点"),
    ).toHaveLength(2);
    expect(
      fetchMock.mock.calls.some(([url]) =>
        String(url).includes(
          "parentOrganizationPublicId=organization-public-district",
        ),
      ),
    ).toBe(true);
    expect(
      fetchMock.mock.calls.some(([url]) =>
        String(url).includes("keyword=%E6%B5%8B%E8%AF%95%E7%AB%99%E7%82%B9"),
      ),
    ).toBe(true);
  });

  it("renders first-create empty data and error states from standard response envelopes", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: RequestInfo | URL) => {
        const path = String(url);

        if (path === "/api/v1/sessions") {
          return createJsonResponse(adminSessionPayload);
        }

        return createJsonResponse({
          code: 0,
          message: "ok",
          data: path.includes("org-auths")
            ? { orgAuths: [] }
            : path.includes("employees")
              ? { employees: [] }
              : { organizations: [] },
        });
      }),
    );

    render(createElement(AdminOrgAuthPage));

    expect(
      await screen.findByRole("heading", { name: "企业管理" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("暂无企业管理数据")).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("organization-tree-management-form"),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "新增省级组织" }));
    expect(
      screen.getByTestId("organization-tree-management-form"),
    ).toBeVisible();
    expect(screen.getByTestId("organization-submit-button")).toBeDisabled();

    cleanup();
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: RequestInfo | URL) => {
        if (String(url) === "/api/v1/sessions") {
          return createJsonResponse(adminSessionPayload);
        }

        return createJsonResponse({
          code: 503601,
          message: "unavailable",
          data: null,
        });
      }),
    );

    render(createElement(AdminOrgAuthPage));

    expect(await screen.findByText("企业管理数据加载失败")).toBeInTheDocument();
  });
});

describe("AdminRedeemCodePage", () => {
  it("loads masked redeem_code data through the admin session runtime without rendering plaintext or hashes", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockAdminFetch();

    render(createElement(AdminRedeemCodePage));

    expect(screen.getByText("正在加载卡密数据")).toBeInTheDocument();
    expect(await screen.findByText("RC-2026-****")).toBeInTheDocument();
    expect(screen.getByText("卡密明文不可用")).toBeInTheDocument();

    const redeemCode = screen.getByTestId(
      "admin-redeem-code-redeem-code-public-001",
    );

    expect(redeemCode).toHaveAttribute(
      "data-public-id",
      "redeem-code-public-001",
    );
    expect(redeemCode).not.toHaveAttribute("data-id");
    expect(within(redeemCode).getByText("明文不可用")).toBeInTheDocument();
    expect(document.body.textContent).not.toContain("unit-test-admin-token");
    expect(document.body.textContent).not.toContain("do-not-render");
    expect(document.body.textContent).not.toContain("RC-2026-0001-PLAIN");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/redeem-codes?page=1&pageSize=20&sortBy=createdAt&sortOrder=desc",
      expect.objectContaining({
        headers: { authorization: "Bearer unit-test-admin-token" },
      }),
    );
  });

  it("renders empty and error states for redeem_code list responses", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: RequestInfo | URL) => {
        if (String(url) === "/api/v1/sessions") {
          return createJsonResponse(adminSessionPayload);
        }

        return createJsonResponse({
          code: 0,
          message: "ok",
          data: { redeemCodes: [] },
        });
      }),
    );

    render(createElement(AdminRedeemCodePage));

    expect(await screen.findByText("暂无卡密数据")).toBeInTheDocument();
    expect(
      screen.queryByTestId("system-ops-redeem-code-generate-entry"),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("redeem-code-generate-button")).toBeDisabled();

    cleanup();
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: RequestInfo | URL) => {
        if (String(url) === "/api/v1/sessions") {
          return createJsonResponse(adminSessionPayload);
        }

        return createJsonResponse({
          code: 503601,
          message: "unavailable",
          data: null,
        });
      }),
    );

    render(createElement(AdminRedeemCodePage));

    expect(await screen.findByText("卡密数据加载失败")).toBeInTheDocument();
  });
});

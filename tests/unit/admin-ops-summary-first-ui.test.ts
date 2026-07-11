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
  AdminAiCallLogOpsPage,
  AdminAuditLogOpsPage,
} from "@/app/(admin)/ops/ai-audit-logs/AdminAiAuditLogOpsBaseline";
import { AdminOpsManagement } from "@/features/admin/admin-ops-management/AdminOpsManagement";
import { AdminContactConfigPage } from "@/features/admin/contact-config/AdminContactConfigPage";
import {
  AdminOrgAuthPage,
  AdminRedeemCodePage,
} from "@/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage";
import type { AdminUserListDto } from "@/server/contracts/admin-user-org-auth-ops-contract";

afterEach(() => {
  cleanup();
  localStorage.clear();
  window.history.replaceState(null, "", "/");
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
      name: "Ops Admin",
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

const emptyOpsCollections = {
  aiCallLogs: [],
  auditLogs: [],
  dailySummaries: [],
  employees: [],
  orgAuths: [],
  redeemCodes: [],
  users: [],
};
const cookieBackedSessionToken = "__cookie_backed_session__";

function createAdminUser(index: number) {
  const publicId = `user-admin-ui-${String(index).padStart(2, "0")}`;

  return {
    publicId,
    phone: `1390000${String(index).padStart(4, "0")}`,
    name: `分页用户 ${index}`,
    registeredAt: "2026-05-20T08:00:00.000Z",
    status: "active",
    userType: index % 2 === 0 ? "employee" : "personal",
    organizationPublicId: index % 2 === 0 ? "organization-public-001" : null,
    organizationName: index % 2 === 0 ? "Ops Smoke Org" : null,
    authStatus: index % 3 === 0 ? "active" : null,
  } satisfies AdminUserListDto["users"][number];
}

function createBackendAdminAccount(index: number) {
  return {
    publicId: `admin-public-ui-${String(index).padStart(2, "0")}`,
    phone: `admin-account-${String(index).padStart(2, "0")}`,
    name: `后台账号 ${index}`,
    adminRole: index % 2 === 0 ? "org_standard_admin" : "content_admin",
    status: "active",
    registeredAt: "2026-05-20T08:00:00.000Z",
    accountDomain: "admin",
    organizations:
      index % 2 === 0
        ? [
            {
              publicId: "organization-public-001",
              name: "Ops Smoke Org",
            },
          ]
        : [],
  } as const;
}

function jsonResponse(payload: unknown) {
  return {
    ok: true,
    status: 200,
    json: async () => payload,
  } as Response;
}

function stubFetchForSummaryFirstPages({
  adminAccountFailure = false,
  adminAccounts = [],
  users = emptyOpsCollections.users,
}: {
  adminAccountFailure?: boolean;
  adminAccounts?: ReturnType<typeof createBackendAdminAccount>[];
  users?: AdminUserListDto["users"];
} = {}) {
  const fetchMock = vi.fn(
    async (...[url]: [RequestInfo | URL, RequestInit?]) => {
      const path = String(url);

      if (path === "/api/v1/sessions") {
        return jsonResponse(adminSessionPayload);
      }

      if (path.startsWith("/api/v1/admin-accounts")) {
        if (adminAccountFailure) {
          return jsonResponse({
            code: 503605,
            message: "Admin account list unavailable.",
            data: null,
          });
        }

        const url = new URL(path, "http://localhost");
        const page = Number(url.searchParams.get("page") ?? "1");
        const pageSize = Number(url.searchParams.get("pageSize") ?? "20");
        const start = (page - 1) * pageSize;

        return jsonResponse({
          code: 0,
          message: "ok",
          data: {
            adminAccounts: adminAccounts.slice(start, start + pageSize),
          },
          pagination: {
            page,
            pageSize,
            sortBy: url.searchParams.get("sortBy") ?? "registeredAt",
            sortOrder: url.searchParams.get("sortOrder") ?? "desc",
            total: adminAccounts.length,
          },
        });
      }

      if (path.startsWith("/api/v1/users")) {
        const url = new URL(path, "http://localhost");
        const page = Number(url.searchParams.get("page") ?? "1");
        const pageSize = Number(url.searchParams.get("pageSize") ?? "20");
        const start = (page - 1) * pageSize;

        return jsonResponse({
          code: 0,
          message: "ok",
          data: { users: users.slice(start, start + pageSize) },
          pagination: {
            page,
            pageSize,
            sortBy: url.searchParams.get("sortBy") ?? "updatedAt",
            sortOrder: url.searchParams.get("sortOrder") ?? "desc",
            total: users.length,
          },
        });
      }

      if (path.startsWith("/api/v1/organizations")) {
        return jsonResponse({
          code: 0,
          message: "ok",
          data: {
            organizations: [
              {
                publicId: "organization-public-001",
                name: "Ops Smoke Org",
                orgTier: "city",
                parentOrganizationPublicId: null,
                status: "active",
                employeeCount: 0,
                authSummary: null,
              },
            ],
          },
        });
      }

      if (path.startsWith("/api/v1/employees")) {
        return jsonResponse({
          code: 0,
          message: "ok",
          data: { employees: emptyOpsCollections.employees },
        });
      }

      if (path.startsWith("/api/v1/org-auths")) {
        return jsonResponse({
          code: 0,
          message: "ok",
          data: { orgAuths: emptyOpsCollections.orgAuths },
        });
      }

      if (path.startsWith("/api/v1/redeem-codes")) {
        return jsonResponse({
          code: 0,
          message: "ok",
          data: { redeemCodes: emptyOpsCollections.redeemCodes },
        });
      }

      if (path.startsWith("/api/v1/audit-logs")) {
        return jsonResponse({
          code: 0,
          message: "ok",
          data: { auditLogs: emptyOpsCollections.auditLogs },
        });
      }

      if (path.startsWith("/api/v1/ai-call-logs/summary")) {
        return jsonResponse({
          code: 0,
          message: "ok",
          data: { dailySummaries: emptyOpsCollections.dailySummaries },
        });
      }

      if (path.startsWith("/api/v1/ai-call-logs")) {
        return jsonResponse({
          code: 0,
          message: "ok",
          data: { aiCallLogs: emptyOpsCollections.aiCallLogs },
        });
      }

      if (path === "/api/v1/contact-configs") {
        return jsonResponse({
          code: 0,
          message: "ok",
          data: {
            contactConfig: {
              publicId: "contact-config-local-purchase-guidance",
              title: "本地购买咨询",
              summary: "购买标准版或高级版前先联系运营确认。",
              safetyNotice: "不要在公开渠道发送凭证。",
              channels: [
                {
                  channelType: "phone",
                  isEnabled: true,
                  label: "运营电话",
                  qrImageUrl: null,
                  value: "400-000-0000",
                  serviceHours: "工作日",
                  usage: "购买咨询",
                  href: null,
                },
                {
                  channelType: "wechat_work",
                  isEnabled: true,
                  label: "企业微信",
                  qrImageUrl:
                    "/api/v1/contact-configs/qr-images/contact-config-qr-local-ui",
                  value: "tiku-ops",
                  serviceHours: "工作日 09:00-18:00",
                  usage: "企业微信购买咨询",
                  href: null,
                },
              ],
              updatedAt: "2026-05-26T00:00:00.000Z",
            },
          },
        });
      }

      return jsonResponse({ code: 404001, message: "missing", data: null });
    },
  );

  vi.stubGlobal("fetch", fetchMock);

  return fetchMock;
}

function expectCookieBackedFetch(
  fetchMock: ReturnType<typeof vi.fn>,
  pathPrefix: string,
) {
  const matchedCall = fetchMock.mock.calls.find(([url]) =>
    String(url).startsWith(pathPrefix),
  );

  expect(matchedCall).toBeDefined();
  expect(matchedCall?.[1]).toEqual(
    expect.objectContaining({
      credentials: "same-origin",
    }),
  );
  expect(new Headers(matchedCall?.[1]?.headers).get("authorization")).toBe(
    `Bearer ${cookieBackedSessionToken}`,
  );
}

describe("admin ops summary-first UI", () => {
  it("renders a list-first learner and employee account work area before backend account tools", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const visibleUser = createAdminUser(1);
    const fetchMock = stubFetchForSummaryFirstPages({ users: [visibleUser] });

    render(createElement(AdminOpsManagement));

    await screen.findByRole("heading", { level: 1, name: "用户管理" });

    expect(screen.queryByTestId("ops-summary-first-band")).toBeNull();
    expect(screen.queryByRole("region", { name: "用户摘要" })).toBeNull();

    const userWorkArea = screen.getByRole("region", {
      name: "学员与员工账号",
    });
    expect(within(userWorkArea).getByLabelText("用户状态")).toBeInTheDocument();
    expect(within(userWorkArea).getByLabelText("用户类型")).toBeInTheDocument();
    expect(
      within(userWorkArea).getByRole("columnheader", { name: "用户" }),
    ).toBeInTheDocument();
    expect(
      within(userWorkArea).getByRole("columnheader", { name: "类型与状态" }),
    ).toBeInTheDocument();
    expect(
      within(userWorkArea).getByRole("columnheader", { name: "企业与授权" }),
    ).toBeInTheDocument();
    expect(
      within(userWorkArea).getByRole("columnheader", { name: "操作" }),
    ).toBeInTheDocument();
    expect(screen.queryByText(visibleUser.publicId)).toBeNull();

    const accountTabs = screen.getByRole("tablist", { name: "账号类型" });
    fireEvent.click(within(accountTabs).getByRole("tab", { name: "后台账号" }));
    const backendAccountSection = screen.getByRole("tabpanel", {
      name: "后台账号",
    });
    expect(screen.queryByRole("region", { name: "后台账号创建" })).toBeNull();
    fireEvent.click(
      within(backendAccountSection).getByRole("button", {
        name: "创建后台账号",
      }),
    );
    expect(
      screen.getByRole("region", { name: "后台账号创建" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "企业组织与员工" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "企业授权" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "卡密管理" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "审计日志" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "AI 调用日志" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "企业授权页" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "打开卡密生成" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "用户筛选" })).toBeNull();
    expect(screen.queryByRole("region", { name: "运营筛选" })).toBeNull();
    expect(screen.getByLabelText("后台账号每页条数")).toHaveValue("20");
    expect(screen.getByText(/后台账号与学员账号域分离/u)).toBeInTheDocument();

    const fetchedPaths = fetchMock.mock.calls.map(([url]) => String(url));
    expect(fetchedPaths).not.toContainEqual(
      expect.stringMatching(/^\/api\/v1\/employees\b/u),
    );
    expect(fetchedPaths).not.toContainEqual(
      expect.stringMatching(/^\/api\/v1\/org-auths\b/u),
    );
    expect(fetchedPaths).not.toContainEqual(
      expect.stringMatching(/^\/api\/v1\/redeem-codes\b/u),
    );
    expect(fetchedPaths).not.toContainEqual(
      expect.stringMatching(/^\/api\/v1\/audit-logs\b/u),
    );
    expect(fetchedPaths).not.toContainEqual(
      expect.stringMatching(/^\/api\/v1\/ai-call-logs\b/u),
    );
  });

  it("paginates the user list with the shared admin page-size options", async () => {
    localStorage.setItem(
      "tiku.localSessionToken",
      "unit-test-admin-token-pagination",
    );
    stubFetchForSummaryFirstPages({
      users: Array.from({ length: 25 }, (_, index) =>
        createAdminUser(index + 1),
      ),
    });

    render(createElement(AdminOpsManagement));

    await screen.findByRole("heading", { level: 1, name: "用户管理" });

    expect(screen.getByText("显示 1-20 / 共 25 个用户")).toBeInTheDocument();
    expect(screen.getByText("分页用户 1 / 13900000001")).toBeInTheDocument();
    expect(
      screen.queryByText("分页用户 21 / 13900000021"),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "下一页" }));

    expect(
      await screen.findByText("显示 21-25 / 共 25 个用户"),
    ).toBeInTheDocument();
    expect(screen.getByText("分页用户 21 / 13900000021")).toBeInTheDocument();
    expect(
      screen.queryByText("分页用户 1 / 13900000001"),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "下一页" })).toBeDisabled();

    fireEvent.change(screen.getByLabelText("每页条数"), {
      target: { value: "50" },
    });

    expect(screen.getByLabelText("每页条数")).toHaveValue("50");
    expect(
      await screen.findByText("显示 1-25 / 共 25 个用户"),
    ).toBeInTheDocument();
    expect(screen.getByText("分页用户 1 / 13900000001")).toBeInTheDocument();
    expect(screen.getByText("分页用户 21 / 13900000021")).toBeInTheDocument();
  });

  it("searches users by keyword and returns pagination to the first page", async () => {
    localStorage.setItem(
      "tiku.localSessionToken",
      "unit-test-admin-token-keyword",
    );
    const fetchMock = stubFetchForSummaryFirstPages({
      users: Array.from({ length: 25 }, (_, index) =>
        createAdminUser(index + 1),
      ),
    });

    render(createElement(AdminOpsManagement));

    await screen.findByRole("heading", { level: 1, name: "用户管理" });
    fireEvent.click(screen.getByRole("button", { name: "下一页" }));
    await screen.findByText("显示 21-25 / 共 25 个用户");

    fireEvent.change(screen.getByLabelText("搜索用户"), {
      target: { value: "目标用户" },
    });

    await waitFor(() => {
      expect(
        fetchMock.mock.calls.some(([url]) => {
          const requestUrl = new URL(String(url), "http://localhost");

          return (
            requestUrl.pathname === "/api/v1/users" &&
            requestUrl.searchParams.get("keyword") === "目标用户" &&
            requestUrl.searchParams.get("page") === "1"
          );
        }),
      ).toBe(true);
    });
    expect(screen.getByText("显示 1-20 / 共 25 个用户")).toBeInTheDocument();
  });

  it("separates backend accounts into a filtered and paginated tab", async () => {
    localStorage.setItem(
      "tiku.localSessionToken",
      "unit-test-admin-token-backend-list",
    );
    const backendAccounts = Array.from({ length: 25 }, (_, index) =>
      createBackendAdminAccount(index + 1),
    );
    const fetchMock = stubFetchForSummaryFirstPages({
      adminAccounts: backendAccounts,
      users: [createAdminUser(1)],
    });

    render(createElement(AdminOpsManagement));

    await screen.findByRole("heading", { level: 1, name: "用户管理" });
    const accountTabs = screen.getByRole("tablist", { name: "账号类型" });
    expect(
      within(accountTabs).getByRole("tab", { name: "学员与员工账号" }),
    ).toHaveAttribute("aria-selected", "true");
    fireEvent.click(within(accountTabs).getByRole("tab", { name: "后台账号" }));

    const backendAccountRegion = screen.getByRole("tabpanel", {
      name: "后台账号",
    });
    expect(
      within(backendAccountRegion).getByLabelText("搜索后台账号"),
    ).toBeInTheDocument();
    expect(
      within(backendAccountRegion).getByLabelText("后台角色"),
    ).toBeInTheDocument();
    expect(
      within(backendAccountRegion).getByLabelText("后台账号状态"),
    ).toBeInTheDocument();
    expect(
      within(backendAccountRegion).getByLabelText("绑定组织"),
    ).toBeInTheDocument();
    expect(
      within(backendAccountRegion).getByLabelText("后台账号每页条数"),
    ).toBeInTheDocument();
    expect(
      within(backendAccountRegion).getByRole("columnheader", { name: "账号" }),
    ).toBeInTheDocument();
    expect(
      within(backendAccountRegion).getByRole("columnheader", { name: "角色" }),
    ).toBeInTheDocument();
    expect(
      within(backendAccountRegion).getByRole("columnheader", {
        name: "组织范围",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("后台账号 1 / admin-account-01"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(backendAccounts[0]?.publicId ?? "missing"),
    ).toBeNull();
    expect(
      screen.getByText("显示 1-20 / 共 25 个后台账号"),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("搜索后台账号"), {
      target: { value: "目标管理员" },
    });
    await waitFor(() => {
      expect(
        fetchMock.mock.calls.some(([url]) => {
          const requestUrl = new URL(String(url), "http://localhost");

          return (
            requestUrl.pathname === "/api/v1/admin-accounts" &&
            requestUrl.searchParams.get("keyword") === "目标管理员" &&
            requestUrl.searchParams.get("page") === "1"
          );
        }),
      ).toBe(true);
    });
    expect(
      within(backendAccountRegion).getByRole("button", {
        name: "创建后台账号",
      }),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("初始密码")).toBeNull();
  });

  it("isolates a backend account list failure from learner and employee accounts", async () => {
    localStorage.setItem(
      "tiku.localSessionToken",
      "unit-test-admin-token-admin-list-failure",
    );
    stubFetchForSummaryFirstPages({
      adminAccountFailure: true,
      users: [createAdminUser(1)],
    });

    render(createElement(AdminOpsManagement));

    expect(
      await screen.findByRole("heading", {
        level: 2,
        name: "学员与员工账号",
      }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "后台账号" }));
    expect(
      await screen.findByRole("alert", {
        name: "后台账号列表加载失败",
      }),
    ).toBeInTheDocument();
  });

  it("renders organization auth summary before operations actions and preserves edition boundary copy", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    stubFetchForSummaryFirstPages();

    render(createElement(AdminOrgAuthPage));

    await screen.findByRole("heading", { name: "企业管理" });

    const summaryBand = screen.getByTestId("ops-org-auth-summary-first-band");
    expect(summaryBand).toHaveTextContent("标准版");
    expect(summaryBand).toHaveTextContent("高级版");
    expect(summaryBand).toHaveTextContent("不会自动升级");
    expect(summaryBand).toHaveTextContent("禁用态");
    expect(
      summaryBand.compareDocumentPosition(
        screen.getByTestId("system-ops-org-auth-create-entry"),
      ) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      summaryBand.compareDocumentPosition(
        screen.getByTestId("org-auth-create-form"),
      ) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("renders redeem code summary before generation and keeps plaintext exception explicit", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    stubFetchForSummaryFirstPages();

    render(createElement(AdminRedeemCodePage));

    await screen.findByRole("heading", { name: "卡密管理" });
    expect(
      screen.queryByRole("link", { name: "企业授权" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "卡密管理" }),
    ).not.toBeInTheDocument();

    const summaryBand = screen.getByTestId(
      "ops-redeem-code-summary-first-band",
    );
    expect(summaryBand).toHaveTextContent("明文仅限有权运营界面复制");
    expect(summaryBand).toHaveTextContent("证据");
    expect(summaryBand).toHaveTextContent("禁用态");
    expect(
      screen.queryByTestId("system-ops-redeem-code-generate-entry"),
    ).not.toBeInTheDocument();
    expect(
      summaryBand.compareDocumentPosition(
        screen.getByTestId("redeem-code-generate-button"),
      ) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("keeps operations org auth pages usable with cookie-backed admin sessions", async () => {
    const orgAuthFetchMock = stubFetchForSummaryFirstPages();

    render(createElement(AdminOrgAuthPage));

    await screen.findByRole("heading", { name: "企业管理" });
    expectCookieBackedFetch(orgAuthFetchMock, "/api/v1/sessions");
    expectCookieBackedFetch(orgAuthFetchMock, "/api/v1/organizations");

    cleanup();
    localStorage.clear();
    vi.unstubAllGlobals();

    const redeemCodeFetchMock = stubFetchForSummaryFirstPages();

    render(createElement(AdminRedeemCodePage));

    await screen.findByRole("heading", { name: "卡密管理" });
    expectCookieBackedFetch(redeemCodeFetchMock, "/api/v1/sessions");
    expectCookieBackedFetch(redeemCodeFetchMock, "/api/v1/redeem-codes");
  });

  it("renders separated audit and AI call log pages without model management mixing", () => {
    render(createElement(AdminAuditLogOpsPage, { currentRole: "ops_admin" }));

    const auditSummaryBand = screen.getByTestId("ops-audit-log-summary-band");
    expect(auditSummaryBand).toHaveTextContent("运营管理员");
    expect(auditSummaryBand).toHaveTextContent("审计日志只读");
    expect(auditSummaryBand).toHaveTextContent("原始请求体");
    expect(
      screen.getByRole("heading", { name: "审计日志" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: "模型配置" })).toBeNull();
    expect(screen.queryByText("保存配置")).not.toBeInTheDocument();
    expect(screen.queryByText("正式入库复核")).not.toBeInTheDocument();

    cleanup();

    render(createElement(AdminAiCallLogOpsPage, { currentRole: "ops_admin" }));

    const aiCallSummaryBand = screen.getByTestId(
      "ops-ai-call-log-summary-band",
    );
    expect(aiCallSummaryBand).toHaveTextContent("运营管理员");
    expect(aiCallSummaryBand).toHaveTextContent("AI 调用日志只读");
    expect(aiCallSummaryBand).toHaveTextContent("Provider 不在页面执行");
    expect(
      screen.getByRole("heading", { name: "AI 调用日志" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: "模型配置" })).toBeNull();
    expect(screen.queryByText("保存配置")).not.toBeInTheDocument();
    expect(screen.queryByText("正式入库复核")).not.toBeInTheDocument();
  });

  it("keeps split audit and AI call logs usable with cookie-backed admin sessions", async () => {
    const fetchMock = stubFetchForSummaryFirstPages();

    render(createElement(AdminAuditLogOpsPage, { runtimeEnabled: true }));

    await screen.findByRole("heading", { name: "审计日志" });
    expectCookieBackedFetch(fetchMock, "/api/v1/audit-logs");
    expect(fetchMock.mock.calls.map(([url]) => String(url))).not.toContainEqual(
      expect.stringMatching(/^\/api\/v1\/ai-call-logs\b/u),
    );

    cleanup();
    localStorage.clear();
    vi.unstubAllGlobals();

    const aiCallFetchMock = stubFetchForSummaryFirstPages();

    render(createElement(AdminAiCallLogOpsPage, { runtimeEnabled: true }));

    await screen.findByRole("heading", { name: "AI 调用日志" });
    expectCookieBackedFetch(aiCallFetchMock, "/api/v1/ai-call-logs");
    expectCookieBackedFetch(aiCallFetchMock, "/api/v1/ai-call-logs/summary");
    expect(
      aiCallFetchMock.mock.calls.map(([url]) => String(url)),
    ).not.toContainEqual(expect.stringMatching(/^\/api\/v1\/audit-logs\b/u));
  });

  it("renders contact config summary before the form and keeps standard and advanced purchase guidance clear", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = stubFetchForSummaryFirstPages();

    render(createElement(AdminContactConfigPage));

    await screen.findByRole("heading", { name: "购买联系方式" });

    const summaryBand = screen.getByTestId(
      "ops-contact-config-summary-first-band",
    );
    expect(summaryBand).toHaveTextContent("标准版");
    expect(summaryBand).toHaveTextContent("高级版");
    expect(summaryBand).toHaveTextContent("错误态");
    expect(summaryBand).toHaveTextContent("禁用态");
    expect(summaryBand).not.toHaveTextContent("summary-first");
    expect(
      summaryBand.compareDocumentPosition(
        screen.getByLabelText("购买联系方式标题"),
      ) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(within(summaryBand).queryByText("400-000-0000")).toBeNull();
    expect(screen.getByLabelText("渠道 1 类型")).toHaveValue("phone");
    expect(screen.getByLabelText("渠道 2 类型")).toHaveValue("wechat_work");
    expect(screen.getByLabelText("渠道 2 二维码图片地址")).toHaveValue(
      "/api/v1/contact-configs/qr-images/contact-config-qr-local-ui",
    );
    expect(screen.getByRole("img", { name: "企业微信二维码" })).toHaveAttribute(
      "src",
      "/api/v1/contact-configs/qr-images/contact-config-qr-local-ui",
    );

    fireEvent.click(screen.getByRole("button", { name: "保存购买联系方式" }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/v1/contact-configs",
        expect.objectContaining({
          method: "PUT",
        }),
      ),
    );
    const saveCall = fetchMock.mock.calls.find(
      ([url, init]) =>
        String(url) === "/api/v1/contact-configs" &&
        (init as RequestInit | undefined)?.method === "PUT",
    );
    expect(JSON.parse(String(saveCall?.[1]?.body))).toMatchObject({
      channels: [
        expect.objectContaining({
          channelType: "phone",
          isEnabled: true,
          qrImageUrl: null,
        }),
        expect.objectContaining({
          channelType: "wechat_work",
          isEnabled: true,
          qrImageUrl:
            "/api/v1/contact-configs/qr-images/contact-config-qr-local-ui",
        }),
      ],
    });
  });
});

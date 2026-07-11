import { createElement } from "react";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AdminAiAuditLogOpsBaseline } from "@/app/(admin)/ops/ai-audit-logs/AdminAiAuditLogOpsBaseline";
import { AdminOpsManagement } from "@/features/admin/admin-ops-management/AdminOpsManagement";
import { AdminContactConfigPage } from "@/features/admin/contact-config/AdminContactConfigPage";
import {
  AdminOrgAuthPage,
  AdminRedeemCodePage,
} from "@/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage";

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

function jsonResponse(payload: unknown) {
  return {
    ok: true,
    status: 200,
    json: async () => payload,
  } as Response;
}

function stubFetchForSummaryFirstPages() {
  const fetchMock = vi.fn(async (url: RequestInfo | URL) => {
    const path = String(url);

    if (path === "/api/v1/sessions") {
      return jsonResponse(adminSessionPayload);
    }

    if (path.startsWith("/api/v1/users")) {
      return jsonResponse({
        code: 0,
        message: "ok",
        data: { users: emptyOpsCollections.users },
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
                label: "运营电话",
                value: "400-000-0000",
                serviceHours: "工作日",
                usage: "购买咨询",
                href: null,
              },
            ],
            updatedAt: "2026-05-26T00:00:00.000Z",
          },
        },
      });
    }

    return jsonResponse({ code: 404001, message: "missing", data: null });
  });

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
  it("renders operations workspace summary and boundaries before filters and write actions", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = stubFetchForSummaryFirstPages();

    render(createElement(AdminOpsManagement));

    await screen.findByRole("heading", { level: 1, name: "用户管理" });

    const summaryBand = screen.getByTestId("ops-summary-first-band");
    expect(summaryBand).toHaveTextContent("summary-first");
    expect(summaryBand).toHaveTextContent("运营管理员");
    expect(summaryBand).toHaveTextContent("用户与后台账号");
    expect(summaryBand).toHaveTextContent("空态");

    expect(
      summaryBand.compareDocumentPosition(
        screen.getByRole("region", { name: "运营筛选" }),
      ) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      summaryBand.compareDocumentPosition(
        screen.getByRole("region", { name: "后台账号创建" }),
      ) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
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

  it("renders organization auth summary before operations actions and preserves edition boundary copy", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    stubFetchForSummaryFirstPages();

    render(createElement(AdminOrgAuthPage));

    await screen.findByRole("heading", { name: "企业授权运营" });

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
      summaryBand.compareDocumentPosition(
        screen.getByTestId("system-ops-redeem-code-generate-entry"),
      ) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      summaryBand.compareDocumentPosition(
        screen.getByTestId("redeem-code-generate-button"),
      ) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("keeps operations org auth pages usable with cookie-backed admin sessions", async () => {
    const orgAuthFetchMock = stubFetchForSummaryFirstPages();

    render(createElement(AdminOrgAuthPage));

    await screen.findByRole("heading", { name: "企业授权运营" });
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

  it("renders AI audit summary before model management and keeps ops read-only boundary visible", () => {
    render(
      createElement(AdminAiAuditLogOpsBaseline, { currentRole: "ops_admin" }),
    );

    const summaryBand = screen.getByTestId("ops-ai-audit-summary-first-band");
    expect(summaryBand).toHaveTextContent("运营管理员");
    expect(summaryBand).toHaveTextContent("只读日志");
    expect(summaryBand).toHaveTextContent("Provider 不在页面执行");
    expect(summaryBand).toHaveTextContent("原始 Prompt");
    expect(
      summaryBand.compareDocumentPosition(
        screen.getByRole("tab", { name: "模型配置" }),
      ) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(screen.queryByText("保存配置")).not.toBeInTheDocument();
  });

  it("keeps AI audit logs usable with cookie-backed admin sessions", async () => {
    const fetchMock = stubFetchForSummaryFirstPages();

    render(
      createElement(AdminAiAuditLogOpsBaseline, {
        currentRole: "ops_admin",
        runtimeEnabled: true,
      }),
    );

    await screen.findByRole("heading", { name: "AI 配置与日志运营" });
    expectCookieBackedFetch(fetchMock, "/api/v1/model-providers");
    expectCookieBackedFetch(fetchMock, "/api/v1/audit-logs");
  });

  it("renders contact config summary before the form and keeps standard and advanced purchase guidance clear", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    stubFetchForSummaryFirstPages();

    render(createElement(AdminContactConfigPage));

    await screen.findByRole("heading", { name: "购买联系方式" });

    const summaryBand = screen.getByTestId(
      "ops-contact-config-summary-first-band",
    );
    expect(summaryBand).toHaveTextContent("标准版");
    expect(summaryBand).toHaveTextContent("高级版");
    expect(summaryBand).toHaveTextContent("错误态");
    expect(summaryBand).toHaveTextContent("禁用态");
    expect(
      summaryBand.compareDocumentPosition(
        screen.getByLabelText("购买联系方式标题"),
      ) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(within(summaryBand).queryByText("400-000-0000")).toBeNull();
  });
});

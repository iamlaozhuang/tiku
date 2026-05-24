import { createElement } from "react";
import { cleanup, render, screen, within } from "@testing-library/react";
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
        canViewPlainText: false,
        profession: "monopoly",
        level: 3,
        status: "unused",
        redeemedUserPublicId: null,
        createdAt: "2026-05-22T00:00:00.000Z",
        id: 401,
        code_hash: "do-not-render",
        codePlainText: "RC-2026-0001-PLAIN",
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

    if (path === "/api/v1/organizations?page=1&pageSize=20") {
      return createJsonResponse(organizationPayload);
    }

    if (path === "/api/v1/org-auths?page=1&pageSize=20") {
      return createJsonResponse(orgAuthPayload);
    }

    if (path === "/api/v1/employees?page=1&pageSize=20") {
      return createJsonResponse(employeePayload);
    }

    if (path === "/api/v1/redeem-codes?page=1&pageSize=20") {
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
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("AdminOrgAuthPage", () => {
  it("renders unauthorized state without calling protected admin APIs when the local session token is missing", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(AdminOrgAuthPage));

    expect(screen.getByText("请先登录后台")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "前往登录" })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("loads organization, org_auth, and employee data through the admin session runtime without leaking internals", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockAdminFetch();

    render(createElement(AdminOrgAuthPage));

    expect(screen.getByText("正在加载企业授权运营数据")).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "企业授权运营" }),
    ).toBeInTheDocument();

    const organization = screen.getByTestId(
      "admin-organization-organization-public-001",
    );
    const orgAuth = screen.getByTestId("admin-org-auth-org-auth-public-001");
    const employee = screen.getByTestId("admin-employee-employee-public-001");

    expect(organization).toHaveAttribute(
      "data-public-id",
      "organization-public-001",
    );
    expect(organization).not.toHaveAttribute("data-id");
    expect(within(organization).getByText("杭州烟草")).toBeInTheDocument();
    expect(within(orgAuth).getByText("专卖 3级")).toBeInTheDocument();
    expect(within(orgAuth).getByText("42 / 100")).toBeInTheDocument();
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

  it("renders empty and error states from standard response envelopes", async () => {
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

    expect(await screen.findByText("暂无企业授权运营数据")).toBeInTheDocument();

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

    expect(
      await screen.findByText("企业授权运营数据加载失败"),
    ).toBeInTheDocument();
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
    expect(within(redeemCode).getByText("不可查看明文")).toBeInTheDocument();
    expect(document.body.textContent).not.toContain("unit-test-admin-token");
    expect(document.body.textContent).not.toContain("do-not-render");
    expect(document.body.textContent).not.toContain("RC-2026-0001-PLAIN");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/redeem-codes?page=1&pageSize=20",
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

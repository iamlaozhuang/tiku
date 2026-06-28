import { createElement } from "react";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import AdminOrganizationPortalRoutePage from "@/app/(admin)/organization/portal/page";
import { AdminOrganizationPortalPage } from "@/features/admin/organization-portal/AdminOrganizationPortalPage";

const adminSessionPayload = {
  code: 0,
  message: "ok",
  data: {
    user: {
      publicId: "user-admin-organization-portal",
      phone: "13900000004",
      name: "组织高级管理员",
      userType: null,
      status: "active",
      lockedUntilAt: null,
      employeePublicId: null,
      organizationPublicId: "organization-portal-scope-001",
      adminPublicId: "admin-organization-portal-001",
      adminRoles: ["org_advanced_admin"],
      adminWorkspaceCapability: {
        adminRoles: ["org_advanced_admin"],
        organizationPublicId: "organization-portal-scope-001",
        organizationEffectiveEdition: "advanced",
        canUseOrganizationAdvancedWorkspace: true,
      },
    },
    session: {
      expiresAt: "2026-06-30T04:00:00.000Z",
    },
  },
};

const standardAdminSessionPayload = {
  code: 0,
  message: "ok",
  data: {
    user: {
      publicId: "user-admin-organization-standard-portal",
      phone: "13900000005",
      name: "组织标准管理员",
      userType: null,
      status: "active",
      lockedUntilAt: null,
      employeePublicId: null,
      organizationPublicId: "organization-standard-scope-001",
      adminPublicId: "admin-organization-standard-001",
      adminRoles: ["org_standard_admin"],
      adminWorkspaceCapability: {
        adminRoles: ["org_standard_admin"],
        organizationPublicId: "organization-standard-scope-001",
        organizationEffectiveEdition: "standard",
        canUseOrganizationAdvancedWorkspace: false,
      },
    },
    session: {
      expiresAt: "2026-06-30T04:00:00.000Z",
    },
  },
};

function createJsonResponse(payload: unknown) {
  return {
    ok: true,
    status: 200,
    json: async () => payload,
  };
}

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("AdminOrganizationPortalPage", () => {
  it("is wired as the organization portal route page", () => {
    expect(AdminOrganizationPortalRoutePage()).toEqual(
      createElement(AdminOrganizationPortalPage),
    );
  });

  it("renders unauthorized state without exposing organization portal destinations when session is missing", async () => {
    const fetchMock = vi.fn(async (url: RequestInfo | URL) => {
      if (String(url) === "/api/v1/sessions") {
        return createJsonResponse({
          code: 401001,
          message: "Admin session is required.",
          data: null,
        });
      }

      return createJsonResponse({
        code: 404001,
        message: "missing",
        data: null,
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(AdminOrganizationPortalPage));

    expect(await screen.findByRole("alert")).toHaveAttribute(
      "data-admin-ux-state",
      "permission-denied",
    );
    expect(screen.queryByTestId("organization-portal-shell")).toBeNull();
    expect(fetchMock.mock.calls.map(([url]) => String(url))).toEqual([
      "/api/v1/sessions",
    ]);
  });

  it("renders Chinese advanced organization admin destinations", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = vi.fn(async (url: RequestInfo | URL) => {
      if (String(url) === "/api/v1/sessions") {
        return createJsonResponse(adminSessionPayload);
      }

      return createJsonResponse({
        code: 404001,
        message: "missing",
        data: null,
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(AdminOrganizationPortalPage));

    expect(
      await screen.findByRole("heading", { name: "组织后台" }),
    ).toBeInTheDocument();

    const portalShell = screen.getByTestId("organization-portal-shell");
    const supportedDestinations = within(portalShell)
      .getAllByRole("link")
      .map((linkElement) => ({
        href: linkElement.getAttribute("href"),
        name: linkElement.textContent,
      }));

    expect(supportedDestinations).toEqual([
      {
        href: "/organization/organization-training",
        name: expect.stringContaining("企业训练"),
      },
      {
        href: "/organization/organization-analytics",
        name: expect.stringContaining("统计摘要"),
      },
      {
        href: "/organization/ai-question-generation",
        name: expect.stringContaining("AI出题"),
      },
      {
        href: "/organization/ai-paper-generation",
        name: expect.stringContaining("AI组卷"),
      },
    ]);
    expect(portalShell).toHaveTextContent("员工管理");
    expect(portalShell).toHaveTextContent("授权状态");
    expect(portalShell).toHaveTextContent("organization-portal-scope-001");
    expect(portalShell).toHaveTextContent("高级版组织授权已生效");
    expect(portalShell).toHaveTextContent("训练、统计和智能草稿入口已开放");
    expect(portalShell).not.toHaveTextContent("/ops/organizations");
    expect(portalShell).not.toHaveTextContent("Organization Portal");
    expect(portalShell).not.toHaveTextContent("Organization Training");
    expect(portalShell).not.toHaveTextContent("local shell");
    expect(portalShell).not.toHaveTextContent("Provider");
    expect(portalShell).not.toHaveTextContent("Payment");
    expect(document.body.textContent).not.toContain("unit-test-admin-token");

    expect(fetchMock.mock.calls.map(([url]) => String(url))).toEqual([
      "/api/v1/sessions",
    ]);
  });

  it("keeps standard organization admins on scoped Chinese summaries without advanced links", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = vi.fn(async (url: RequestInfo | URL) => {
      if (String(url) === "/api/v1/sessions") {
        return createJsonResponse(standardAdminSessionPayload);
      }

      return createJsonResponse({
        code: 404001,
        message: "missing",
        data: null,
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(AdminOrganizationPortalPage));

    expect(
      await screen.findByRole("heading", { name: "组织后台" }),
    ).toBeInTheDocument();

    const portalShell = screen.getByTestId("organization-portal-shell");
    expect(portalShell).toHaveTextContent("organization-standard-scope-001");
    expect(portalShell).toHaveTextContent("员工管理");
    expect(portalShell).toHaveTextContent("授权状态");
    expect(portalShell).toHaveTextContent("标准版暂不可用");
    expect(portalShell).toHaveTextContent("当前组织仍可查看员工和授权摘要");
    expect(portalShell).toHaveTextContent("高级版开通或升级请联系运营管理员");
    expect(portalShell).toHaveTextContent("高级能力入口保持关闭");
    expect(portalShell).not.toHaveTextContent("AI出题");
    expect(portalShell).not.toHaveTextContent("AI组卷");
    expect(portalShell).not.toHaveTextContent("企业训练");
    expect(portalShell).not.toHaveTextContent("统计摘要");
    expect(portalShell).not.toHaveTextContent("Organization Training");
    expect(within(portalShell).queryAllByRole("link")).toEqual([]);
    expect(fetchMock.mock.calls.map(([url]) => String(url))).toEqual([
      "/api/v1/sessions",
    ]);
  });
});

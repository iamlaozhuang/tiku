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
        organizationAuthorizationSource: "org_auth",
        capabilitySource: "service_computed",
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
        organizationAuthorizationSource: "org_auth",
        capabilitySource: "service_computed",
        canUseOrganizationAdvancedWorkspace: false,
      },
    },
    session: {
      expiresAt: "2026-06-30T04:00:00.000Z",
    },
  },
};

const advancedOrganizationPortalOverviewPayload = {
  code: 0,
  message: "ok",
  data: {
    organization: {
      displayName: "华东营销中心",
      orgTier: "city",
      status: "active",
    },
    employeeSummary: {
      total: 3,
      active: 2,
      disabled: 1,
      locked: 0,
    },
    employees: [
      {
        employeeDisplayName: "员工甲",
        phoneMasked: "139****0001",
        status: "active",
      },
      {
        employeeDisplayName: "员工乙",
        phoneMasked: "139****0002",
        status: "disabled",
      },
    ],
    authorization: {
      packageName: "营销专套组织授权",
      sourceEdition: "standard",
      effectiveEdition: "advanced",
      status: "active",
      startsAt: "2026-07-01T00:00:00.000Z",
      expiresAt: "2027-07-01T00:00:00.000Z",
      accountQuota: 30,
      usedQuota: 12,
      availableQuota: 18,
      authScopeType: "specified_nodes",
      scopes: [
        {
          profession: "marketing",
          level: 3,
          subject: null,
          organizationCount: 1,
        },
      ],
      upgradeStatus: "active",
    },
    boundary: {
      isReadonly: true,
      mutationOwnerLabel: "平台运营",
      redactionStatus: "summary_only",
    },
    updatedAt: "2026-07-08T10:00:00.000Z",
  },
};

const standardOrganizationPortalOverviewPayload = {
  code: 0,
  message: "ok",
  data: {
    organization: {
      displayName: "华南营销中心",
      orgTier: "city",
      status: "active",
    },
    employeeSummary: {
      total: 2,
      active: 2,
      disabled: 0,
      locked: 0,
    },
    employees: [
      {
        employeeDisplayName: "员工丙",
        phoneMasked: "138****0003",
        status: "active",
      },
    ],
    authorization: {
      packageName: "标准组织授权",
      sourceEdition: "standard",
      effectiveEdition: "standard",
      status: "active",
      startsAt: "2026-07-01T00:00:00.000Z",
      expiresAt: "2027-07-01T00:00:00.000Z",
      accountQuota: 10,
      usedQuota: 2,
      availableQuota: 8,
      authScopeType: "specified_nodes",
      scopes: [
        {
          profession: "marketing",
          level: 3,
          subject: null,
          organizationCount: 1,
        },
      ],
      upgradeStatus: "none",
    },
    boundary: {
      isReadonly: true,
      mutationOwnerLabel: "平台运营",
      redactionStatus: "summary_only",
    },
    updatedAt: "2026-07-08T10:00:00.000Z",
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

      if (String(url) === "/api/v1/organization-portal-overviews") {
        return createJsonResponse(advancedOrganizationPortalOverviewPayload);
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
    expect(portalShell).toHaveTextContent("员工名单与状态");
    expect(portalShell).toHaveTextContent("华东营销中心");
    expect(portalShell).toHaveTextContent("共 3 人");
    expect(portalShell).toHaveTextContent("正常 2");
    expect(portalShell).toHaveTextContent("停用 1");
    expect(portalShell).toHaveTextContent("员工甲");
    expect(portalShell).toHaveTextContent("139****0001");
    expect(portalShell).toHaveTextContent("授权状态");
    expect(portalShell).toHaveTextContent("营销专套组织授权");
    expect(portalShell).toHaveTextContent("高级版");
    expect(portalShell).toHaveTextContent("额度 12/30");
    expect(portalShell).toHaveTextContent("剩余 18");
    expect(portalShell).toHaveTextContent("营销 3级");
    expect(portalShell).toHaveTextContent("当前组织范围");
    expect(portalShell).toHaveTextContent("高级版组织后台");
    expect(portalShell).not.toHaveTextContent("organization-portal-scope-001");
    expect(portalShell).toHaveTextContent("高级版组织授权已生效");
    expect(portalShell).toHaveTextContent("训练、统计和智能草稿入口已开放");
    expect(portalShell).not.toHaveTextContent("/ops/organizations");
    expect(portalShell).not.toHaveTextContent("Organization Portal");
    expect(portalShell).not.toHaveTextContent("Organization Training");
    expect(portalShell).not.toHaveTextContent("local shell");
    expect(portalShell).not.toHaveTextContent("Provider");
    expect(portalShell).not.toHaveTextContent("Payment");
    expect(portalShell).not.toHaveTextContent("org_auth");
    expect(document.body.textContent).not.toContain("unit-test-admin-token");

    expect(fetchMock.mock.calls.map(([url]) => String(url))).toEqual([
      "/api/v1/sessions",
      "/api/v1/organization-portal-overviews",
    ]);
  });

  it("keeps standard organization admins on scoped Chinese summaries without advanced links", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = vi.fn(async (url: RequestInfo | URL) => {
      if (String(url) === "/api/v1/sessions") {
        return createJsonResponse(standardAdminSessionPayload);
      }

      if (String(url) === "/api/v1/organization-portal-overviews") {
        return createJsonResponse(standardOrganizationPortalOverviewPayload);
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
    expect(portalShell).toHaveTextContent("当前组织范围");
    expect(portalShell).toHaveTextContent("标准版组织后台");
    expect(portalShell).not.toHaveTextContent(
      "organization-standard-scope-001",
    );
    expect(portalShell).toHaveTextContent("员工名单与状态");
    expect(portalShell).toHaveTextContent("华南营销中心");
    expect(portalShell).toHaveTextContent("共 2 人");
    expect(portalShell).toHaveTextContent("正常 2");
    expect(portalShell).toHaveTextContent("员工丙");
    expect(portalShell).toHaveTextContent("138****0003");
    expect(portalShell).toHaveTextContent("授权状态");
    expect(portalShell).toHaveTextContent("标准组织授权");
    expect(portalShell).toHaveTextContent("标准版");
    expect(portalShell).toHaveTextContent("额度 2/10");
    expect(portalShell).toHaveTextContent("剩余 8");
    expect(portalShell).toHaveTextContent("标准版暂不可用");
    expect(portalShell).toHaveTextContent(
      "当前组织仅开放员工名单、员工状态和授权状态查看",
    );
    expect(portalShell).toHaveTextContent(
      "员工新增、导入、调动、解绑及授权调整仍由平台运营管理员处理",
    );
    expect(portalShell).toHaveTextContent(
      "当前组织仍可查看员工名单、员工状态和授权状态",
    );
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
      "/api/v1/organization-portal-overviews",
    ]);
  });
});

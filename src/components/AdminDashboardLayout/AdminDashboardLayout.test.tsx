import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AdminDashboardLayout } from "./AdminDashboardLayout";

let mockedPathname = "/ops/users";
const replaceMock = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => mockedPathname,
  useRouter: () => ({
    replace: replaceMock,
  }),
}));

function createAdminSessionResponse(input: {
  adminRoles: string[];
  canUseOrganizationAdvancedWorkspace?: boolean;
  organizationEffectiveEdition?: "advanced" | "standard" | null;
  organizationPublicId?: string | null;
}) {
  const organizationPublicId = input.organizationPublicId ?? null;
  const organizationEffectiveEdition =
    input.organizationEffectiveEdition ?? null;

  return {
    code: 0,
    message: "ok",
    data: {
      user: {
        publicId: "user_public_redacted",
        phone: "redacted",
        name: "Redacted Admin",
        userType: null,
        status: "active",
        lockedUntilAt: null,
        employeePublicId: null,
        organizationPublicId,
        adminPublicId: "admin_public_redacted",
        adminRoles: input.adminRoles,
        adminWorkspaceCapability: {
          adminRoles: input.adminRoles,
          organizationPublicId,
          organizationEffectiveEdition,
          organizationAuthorizationSource:
            organizationPublicId === null ? null : "org_auth",
          capabilitySource: "service_computed",
          canUseOrganizationAdvancedWorkspace:
            input.canUseOrganizationAdvancedWorkspace ?? false,
        },
      },
      session: {
        expiresAt: "2026-07-07T00:00:00.000Z",
      },
    },
  };
}

function mockSessionResponse(responseBody: unknown) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({
      json: async () => responseBody,
    })),
  );
}

describe("AdminDashboardLayout shared admin state templates", () => {
  beforeEach(() => {
    mockedPathname = "/ops/users";
    replaceMock.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("shows a missing organization context state for super admin organization workspace access", async () => {
    mockedPathname = "/organization/portal";
    mockSessionResponse(
      createAdminSessionResponse({
        adminRoles: ["super_admin"],
      }),
    );

    render(
      <AdminDashboardLayout>
        <div>organization page body</div>
      </AdminDashboardLayout>,
    );

    expect(await screen.findByText("需要选择组织上下文")).toBeInTheDocument();
    expect(screen.getByText("返回运营后台")).toHaveAttribute(
      "href",
      "/ops/users",
    );
    expect(
      screen.queryByText("organization page body"),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("请先登录后台")).not.toBeInTheDocument();
  });

  it("keeps unauthorized users on the login-specific state only", async () => {
    mockSessionResponse({
      code: 0,
      message: "ok",
      data: null,
    });

    render(
      <AdminDashboardLayout>
        <div>ops page body</div>
      </AdminDashboardLayout>,
    );

    expect(await screen.findByText("请先登录后台")).toBeInTheDocument();
    expect(screen.getByText("前往登录")).toHaveAttribute("href", "/login");
    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/login");
    });
    expect(screen.queryByText("ops page body")).not.toBeInTheDocument();
  });

  it("renders the admin workspace context band for authorized operations pages", async () => {
    mockSessionResponse(
      createAdminSessionResponse({
        adminRoles: ["super_admin", "ops_admin"],
      }),
    );

    render(
      <AdminDashboardLayout>
        <div>ops page body</div>
      </AdminDashboardLayout>,
    );

    expect(
      await screen.findByTestId("admin-workspace-context-band"),
    ).toHaveTextContent("运营后台");
    expect(
      screen.getByTestId("admin-workspace-context-band"),
    ).toHaveTextContent("超级管理员 / 运营管理员");
    expect(
      screen.getByTestId("admin-workspace-context-band"),
    ).toHaveTextContent("用户、企业、授权、卡密与审计治理归属于运营后台。");
    expect(screen.getByText("ops page body")).toBeInTheDocument();
  });

  it("does not present organization workspace as an ordinary switch target for super admin without organization context", async () => {
    mockSessionResponse(
      createAdminSessionResponse({
        adminRoles: ["super_admin"],
      }),
    );

    render(
      <AdminDashboardLayout>
        <div>ops page body</div>
      </AdminDashboardLayout>,
    );

    expect(await screen.findByText("ops page body")).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "切换到组织后台" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("需要选择组织上下文")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "返回运营后台处理组织与授权" }),
    ).toHaveAttribute("href", "/ops/organizations");
  });

  it("blocks standard organization admins from advanced organization routes before page content renders", async () => {
    mockedPathname = "/organization/ai-question-generation";
    mockSessionResponse(
      createAdminSessionResponse({
        adminRoles: ["org_standard_admin"],
        organizationEffectiveEdition: "standard",
        organizationPublicId: "organization_public_redacted",
      }),
    );

    render(
      <AdminDashboardLayout>
        <div>organization AI page body</div>
      </AdminDashboardLayout>,
    );

    expect(await screen.findByText("标准版暂不可用")).toBeInTheDocument();
    expect(screen.getByText("返回组织概览")).toHaveAttribute(
      "href",
      "/organization/portal",
    );
    expect(
      screen.queryByText("organization AI page body"),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("请先登录后台")).not.toBeInTheDocument();
  });
});

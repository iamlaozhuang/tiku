import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AdminAiCallLogOpsPage } from "@/app/(admin)/ops/ai-audit-logs/AdminAiAuditLogOpsBaseline";

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

function createStudentSessionResponse() {
  return {
    code: 0,
    message: "ok",
    data: {
      user: {
        publicId: "user_student_redacted",
        phone: "redacted",
        name: "Redacted Student",
        userType: "personal",
        status: "active",
        lockedUntilAt: null,
        employeePublicId: null,
        organizationPublicId: null,
        adminPublicId: null,
        adminRoles: [],
      },
      session: {
        expiresAt: "2026-07-12T12:00:00.000Z",
      },
    },
  };
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
    expect(screen.getByText("返回平台总览")).toHaveAttribute(
      "href",
      "/admin/overview",
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

  it("keeps an authenticated student on a forbidden backend state without a login redirect", async () => {
    mockSessionResponse(createStudentSessionResponse());

    render(
      <AdminDashboardLayout>
        <div>ops page body</div>
      </AdminDashboardLayout>,
    );

    expect(await screen.findByText("无权访问此后台工作区")).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
    expect(screen.queryByText("请先登录后台")).not.toBeInTheDocument();
    expect(screen.queryByText("ops page body")).not.toBeInTheDocument();
  });

  it("shows a backend session error without redirecting to login", async () => {
    mockSessionResponse({
      code: 503001,
      message: "temporarily unavailable",
      data: null,
    });

    render(
      <AdminDashboardLayout>
        <div>ops page body</div>
      </AdminDashboardLayout>,
    );

    expect(await screen.findByText("后台会话状态暂不可用")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "重试" })).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
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

  it("keeps the authenticated super-admin role truthful inside split log pages", async () => {
    mockedPathname = "/ops/ai-call-logs";
    mockSessionResponse(
      createAdminSessionResponse({
        adminRoles: ["super_admin"],
      }),
    );

    render(
      <AdminDashboardLayout>
        <AdminAiCallLogOpsPage />
      </AdminDashboardLayout>,
    );

    const toolbar = await screen.findByRole("region", {
      name: "AI 调用日志筛选",
    });
    expect(toolbar).toHaveTextContent("当前为超级管理员只读视角");
    expect(toolbar).not.toHaveTextContent("当前为运营管理员只读视角");
    expect(
      screen.getByTestId("ops-ai-call-log-summary-band"),
    ).toHaveTextContent("超级管理员");
  });

  it("keeps wide admin tables inside the content scroll boundary", async () => {
    mockSessionResponse(
      createAdminSessionResponse({
        adminRoles: ["ops_admin"],
      }),
    );

    render(
      <AdminDashboardLayout>
        <div>wide operations table</div>
      </AdminDashboardLayout>,
    );

    expect(
      await screen.findByText("wide operations table"),
    ).toBeInTheDocument();

    const content = screen.getByRole("main");
    expect(content).toHaveClass("min-w-0");
    expect(content.parentElement).toHaveClass("min-w-0");
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
    for (const returnLink of screen.getAllByRole("link", {
      name: "返回组织概览",
    })) {
      expect(returnLink).toHaveAttribute("href", "/organization/portal");
    }
    expect(
      screen.queryByText("organization AI page body"),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("请先登录后台")).not.toBeInTheDocument();
    expect(
      screen.getByTestId("admin-workspace-context-band"),
    ).toHaveTextContent("标准版组织管理员");
    expect(
      screen.getByTestId("admin-workspace-context-band"),
    ).toHaveTextContent("标准版组织能力仅覆盖员工名单");
    expect(
      screen.getByRole("navigation", { name: "侧边栏导航" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "组织概览" })).toHaveAttribute(
      "href",
      "/organization/portal",
    );
  });
});

import { createElement } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AdminDashboardLayout } from "@/components/AdminDashboardLayout";

const replaceMock = vi.fn();
let pathnameMock = "/ops/users";

vi.mock("next/navigation", () => ({
  usePathname: () => pathnameMock,
  useRouter: () => ({
    replace: replaceMock,
  }),
}));

const adminSessionPayload = {
  code: 0,
  message: "ok",
  data: {
    user: {
      publicId: "user-admin-public",
      phone: "13900000001",
      name: "Admin User",
      userType: null,
      status: "active",
      lockedUntilAt: null,
      employeePublicId: null,
      organizationPublicId: null,
      adminPublicId: "admin-public-001",
      adminRoles: ["super_admin"],
    },
    session: {
      expiresAt: "2026-05-29T04:00:00.000Z",
    },
  },
};

const opsAdminSessionPayload = {
  code: 0,
  message: "ok",
  data: {
    user: {
      publicId: "user-ops-admin-public",
      phone: "13900000003",
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

const contentAdminSessionPayload = {
  code: 0,
  message: "ok",
  data: {
    user: {
      publicId: "user-content-admin-public",
      phone: "13900000004",
      name: "Content Admin",
      userType: null,
      status: "active",
      lockedUntilAt: null,
      employeePublicId: null,
      organizationPublicId: null,
      adminPublicId: "admin-content-public-001",
      adminRoles: ["content_admin"],
    },
    session: {
      expiresAt: "2026-05-29T04:00:00.000Z",
    },
  },
};

afterEach(() => {
  cleanup();
  localStorage.clear();
  replaceMock.mockReset();
  pathnameMock = "/ops/users";
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("AdminDashboardLayout navigation", () => {
  it("routes the audit log menu item to the existing ai audit log page", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => adminSessionPayload,
      })),
    );

    render(
      createElement(
        AdminDashboardLayout,
        null,
        createElement("div", null, "admin page"),
      ),
    );

    expect(await screen.findByText("admin page")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /审计日志/u })).toHaveAttribute(
      "href",
      "/ops/ai-audit-logs",
    );
  });

  it("shows a visible logout control for an allowed backend workspace", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => contentAdminSessionPayload,
      })),
    );
    pathnameMock = "/content/papers";

    render(
      createElement(
        AdminDashboardLayout,
        null,
        createElement("div", null, "content page"),
      ),
    );

    expect(await screen.findByText("content page")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "退出登录" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("内容后台").length).toBeGreaterThan(0);
  });

  it("denies content admins from the operations workspace", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => contentAdminSessionPayload,
      })),
    );
    pathnameMock = "/ops/users";

    render(
      createElement(
        AdminDashboardLayout,
        null,
        createElement("div", null, "ops page"),
      ),
    );

    const denialAlert = await screen.findByRole("alert");
    expect(denialAlert).toHaveTextContent("无权访问此后台工作区");
    expect(screen.queryByText("ops page")).toBeNull();
    expect(screen.queryByRole("link", { name: /用户管理/u })).toBeNull();
  });

  it("denies ops admins from the content workspace", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => opsAdminSessionPayload,
      })),
    );
    pathnameMock = "/content/papers";

    render(
      createElement(
        AdminDashboardLayout,
        null,
        createElement("div", null, "content page"),
      ),
    );

    const denialAlert = await screen.findByRole("alert");
    expect(denialAlert).toHaveTextContent("无权访问此后台工作区");
    expect(screen.queryByText("content page")).toBeNull();
    expect(screen.queryByRole("link", { name: /试卷管理/u })).toBeNull();
  });
});

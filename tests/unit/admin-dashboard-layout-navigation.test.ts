import { createElement } from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AdminDashboardLayout } from "@/components/AdminDashboardLayout";
import { buildDevSeedDataset, devSeedPublicIds } from "@/db/dev-seed";

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
      phone: "13900000006",
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

const orgStandardAdminSessionPayload = {
  code: 0,
  message: "ok",
  data: {
    user: {
      publicId: "user-org-standard-admin-public",
      phone: "13900000004",
      name: "Org Standard Admin",
      userType: null,
      status: "active",
      lockedUntilAt: null,
      employeePublicId: null,
      organizationPublicId: "organization-standard-public-001",
      adminPublicId: "admin-org-standard-public-001",
      adminRoles: ["org_standard_admin"],
    },
    session: {
      expiresAt: "2026-05-29T04:00:00.000Z",
    },
  },
};

const orgAdvancedAdminSessionPayload = {
  code: 0,
  message: "ok",
  data: {
    user: {
      publicId: "user-org-advanced-admin-public",
      phone: "13900000005",
      name: "Org Advanced Admin",
      userType: null,
      status: "active",
      lockedUntilAt: null,
      employeePublicId: null,
      organizationPublicId: "organization-advanced-public-001",
      adminPublicId: "admin-org-advanced-public-001",
      adminRoles: ["org_advanced_admin"],
    },
    session: {
      expiresAt: "2026-05-29T04:00:00.000Z",
    },
  },
};

function buildUnitSeedDataset() {
  return buildDevSeedDataset({
    orgAdvancedAdminPasswordHash: "org-advanced-admin-password-hash",
    orgStandardAdminPasswordHash: "org-standard-admin-password-hash",
    studentPasswordHash: "student-password-hash",
    superAdminPasswordHash: "admin-password-hash",
  });
}

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
    expect(screen.getByRole("link", { name: /AI出题/u })).toHaveAttribute(
      "href",
      "/content/ai-question-generation",
    );
    expect(screen.getByRole("link", { name: /AI组卷/u })).toHaveAttribute(
      "href",
      "/content/ai-paper-generation",
    );
  });

  it("clears the server-backed session when the backend logout control is clicked", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = vi.fn(
      async (_input: RequestInfo | URL, init?: RequestInit) => {
        if (init?.method === "DELETE") {
          return {
            ok: true,
            status: 200,
            json: async () => ({
              code: 0,
              message: "ok",
              data: null,
            }),
          };
        }

        return {
          ok: true,
          status: 200,
          json: async () => contentAdminSessionPayload,
        };
      },
    );
    vi.stubGlobal("fetch", fetchMock);
    pathnameMock = "/content/papers";

    render(
      createElement(
        AdminDashboardLayout,
        null,
        createElement("div", null, "content page"),
      ),
    );

    fireEvent.click(await screen.findByRole("button", { name: "退出登录" }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/v1/sessions",
        expect.objectContaining({
          credentials: "same-origin",
          method: "DELETE",
        }),
      ),
    );
    expect(localStorage.getItem("tiku.localSessionToken")).toBeNull();
    expect(replaceMock).toHaveBeenCalledWith("/login");
  });

  it("keeps organization admin navigation fixtures aligned with the dev seed role mapping", () => {
    const seedDataset = buildUnitSeedDataset();
    const orgStandardAdmin = seedDataset.admins.find(
      (adminAccount) =>
        adminAccount.publicId === devSeedPublicIds.orgStandardAdmin,
    );
    const orgAdvancedAdmin = seedDataset.admins.find(
      (adminAccount) =>
        adminAccount.publicId === devSeedPublicIds.orgAdvancedAdmin,
    );

    expect(orgStandardAdminSessionPayload.data.user.phone).toBe(
      orgStandardAdmin?.phone,
    );
    expect(orgStandardAdminSessionPayload.data.user.adminRoles).toEqual([
      orgStandardAdmin?.adminRole,
    ]);
    expect(orgAdvancedAdminSessionPayload.data.user.phone).toBe(
      orgAdvancedAdmin?.phone,
    );
    expect(orgAdvancedAdminSessionPayload.data.user.adminRoles).toEqual([
      orgAdvancedAdmin?.adminRole,
    ]);
  });

  it("shows organization AI entries only for advanced organization admins", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => orgAdvancedAdminSessionPayload,
      })),
    );
    pathnameMock = "/organization/portal";

    render(
      createElement(
        AdminDashboardLayout,
        null,
        createElement("div", null, "organization page"),
      ),
    );

    expect(await screen.findByText("organization page")).toBeInTheDocument();
    expect(screen.getAllByText("组织后台").length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: /企业训练/u })).toHaveAttribute(
      "href",
      "/organization/organization-training",
    );
    expect(screen.getByRole("link", { name: /统计摘要/u })).toHaveAttribute(
      "href",
      "/organization/organization-analytics",
    );
    expect(screen.getByRole("link", { name: /AI出题/u })).toHaveAttribute(
      "href",
      "/organization/ai-question-generation",
    );
    expect(screen.getByRole("link", { name: /AI组卷/u })).toHaveAttribute(
      "href",
      "/organization/ai-paper-generation",
    );
    expect(screen.queryByRole("link", { name: /用户管理/u })).toBeNull();
    expect(screen.queryByRole("link", { name: /试卷管理/u })).toBeNull();
  });

  it("hides organization AI entries for standard organization admins", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => orgStandardAdminSessionPayload,
      })),
    );
    pathnameMock = "/organization/portal";

    render(
      createElement(
        AdminDashboardLayout,
        null,
        createElement("div", null, "organization page"),
      ),
    );

    expect(await screen.findByText("organization page")).toBeInTheDocument();
    expect(screen.getAllByText("组织后台").length).toBeGreaterThan(0);
    expect(screen.queryByRole("link", { name: /企业训练/u })).toBeNull();
    expect(screen.queryByRole("link", { name: /统计摘要/u })).toBeNull();
    expect(screen.queryByRole("link", { name: /AI出题/u })).toBeNull();
    expect(screen.queryByRole("link", { name: /AI组卷/u })).toBeNull();
    expect(screen.queryByRole("link", { name: /用户管理/u })).toBeNull();
    expect(screen.queryByRole("link", { name: /试卷管理/u })).toBeNull();
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

  it("denies contaminated organization admins from the operations workspace", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => ({
          ...orgStandardAdminSessionPayload,
          data: {
            ...orgStandardAdminSessionPayload.data,
            user: {
              ...orgStandardAdminSessionPayload.data.user,
              adminRoles: ["org_standard_admin", "ops_admin"],
            },
          },
        }),
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

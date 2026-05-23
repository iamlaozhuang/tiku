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
});

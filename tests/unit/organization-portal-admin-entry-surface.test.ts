import { createElement } from "react";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import AdminOrganizationPortalRoutePage from "@/app/(admin)/content/organization-portal/page";
import { AdminOrganizationPortalPage } from "@/features/admin/organization-portal/AdminOrganizationPortalPage";

const adminSessionPayload = {
  code: 0,
  message: "ok",
  data: {
    user: {
      publicId: "user-admin-organization-portal",
      phone: "13900000004",
      name: "Organization Portal Admin",
      userType: null,
      status: "active",
      lockedUntilAt: null,
      employeePublicId: null,
      organizationPublicId: "organization-portal-scope-001",
      adminPublicId: "admin-organization-portal-001",
      adminRoles: ["org_advanced_admin"],
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
      name: "Organization Standard Portal Admin",
      userType: null,
      status: "active",
      lockedUntilAt: null,
      employeePublicId: null,
      organizationPublicId: "organization-standard-scope-001",
      adminPublicId: "admin-organization-standard-001",
      adminRoles: ["org_standard_admin"],
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
  it("is wired as the admin content organization portal route page", () => {
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

  it("renders only locally supported organization admin destinations for an admin session", async () => {
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
      await screen.findByRole("heading", { name: "Organization Portal" }),
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
        name: expect.stringContaining("Organization Training"),
      },
      {
        href: "/organization/organization-analytics",
        name: expect.stringContaining("Organization Analytics"),
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
    expect(portalShell).toHaveTextContent("organization-portal-scope-001");
    expect(portalShell).not.toHaveTextContent("/ops/organizations");
    expect(portalShell).not.toHaveTextContent("Export");
    expect(portalShell).not.toHaveTextContent("Provider");
    expect(portalShell).not.toHaveTextContent("Payment");
    expect(document.body.textContent).not.toContain("unit-test-admin-token");

    expect(fetchMock.mock.calls.map(([url]) => String(url))).toEqual([
      "/api/v1/sessions",
    ]);
  });

  it("keeps standard organization admins out of organization AI destinations", async () => {
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
      await screen.findByRole("heading", { name: "Organization Portal" }),
    ).toBeInTheDocument();

    const portalShell = screen.getByTestId("organization-portal-shell");
    expect(portalShell).toHaveTextContent("organization-standard-scope-001");
    expect(portalShell).not.toHaveTextContent("AI出题");
    expect(portalShell).not.toHaveTextContent("AI组卷");
    expect(portalShell).not.toHaveTextContent("Organization Training");
    expect(within(portalShell).queryAllByRole("link")).toEqual([]);
    expect(fetchMock.mock.calls.map(([url]) => String(url))).toEqual([
      "/api/v1/sessions",
    ]);
  });
});

import { createElement } from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AdminDashboardLayout } from "@/components/AdminDashboardLayout";
import { AdminAiGenerationEntryPage } from "@/features/admin/ai-generation/AdminAiGenerationEntryPage";
import { AdminOrganizationTrainingPage } from "@/features/admin/organization-training/AdminOrganizationTrainingPage";
import { mapAuthContextToApi } from "@/server/mappers/auth-mapper";

const replaceMock = vi.fn();
let pathnameMock = "/organization/portal";

vi.mock("next/navigation", () => ({
  usePathname: () => pathnameMock,
  useRouter: () => ({
    replace: replaceMock,
  }),
}));

function createJsonResponse(payload: unknown) {
  return {
    ok: true,
    status: 200,
    json: async () => payload,
  };
}

function createOrganizationAdminSession(input: {
  canUseOrganizationAdvancedWorkspace: boolean;
  organizationEffectiveEdition: "standard" | "advanced" | null;
}) {
  return {
    code: 0,
    message: "ok",
    data: {
      user: {
        publicId: "user-organization-admin-source-contract",
        phone: "13900000901",
        name: "组织管理员",
        userType: null,
        status: "active",
        lockedUntilAt: null,
        employeePublicId: null,
        organizationPublicId: "organization-source-contract-001",
        adminPublicId: "admin-organization-source-contract-001",
        adminRoles: ["org_advanced_admin"],
        adminWorkspaceCapability: {
          adminRoles: ["org_advanced_admin"],
          organizationPublicId: "organization-source-contract-001",
          organizationEffectiveEdition: input.organizationEffectiveEdition,
          canUseOrganizationAdvancedWorkspace:
            input.canUseOrganizationAdvancedWorkspace,
        },
      },
      session: {
        expiresAt: "2026-06-30T04:00:00.000Z",
      },
    },
  };
}

afterEach(() => {
  cleanup();
  localStorage.clear();
  replaceMock.mockReset();
  pathnameMock = "/organization/portal";
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("organization admin standard/advanced workspace source contract", () => {
  it("maps organization admin sessions to a service-side workspace capability summary", () => {
    const mappedAuthContext = mapAuthContextToApi({
      session: {
        token: "s",
        auth_user_id: "auth-user-organization-admin",
        expires_at: new Date("2026-06-30T04:00:00.000Z"),
      },
      user: {
        id: 901,
        auth_user_id: "auth-user-organization-admin",
        public_id: "user-organization-admin",
        phone: "13900000901",
        name: "组织高级管理员",
        user_type: null,
        status: "active",
        locked_until_at: null,
        employee_public_id: null,
        organization_public_id: "organization-source-contract-001",
        admin_public_id: "admin-organization-source-contract-001",
        admin_roles: ["org_advanced_admin"],
      },
    });

    expect(mappedAuthContext.user.adminWorkspaceCapability).toEqual({
      adminRoles: ["org_advanced_admin"],
      organizationPublicId: "organization-source-contract-001",
      organizationEffectiveEdition: "advanced",
      canUseOrganizationAdvancedWorkspace: true,
    });
    expect(mappedAuthContext.user.adminWorkspaceCapability).not.toHaveProperty(
      "id",
    );
  });

  it("does not show advanced organization layout entries when the service capability summary is standard", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        createJsonResponse(
          createOrganizationAdminSession({
            organizationEffectiveEdition: "standard",
            canUseOrganizationAdvancedWorkspace: false,
          }),
        ),
      ),
    );

    render(
      createElement(
        AdminDashboardLayout,
        null,
        createElement("div", null, "organization page"),
      ),
    );

    expect(await screen.findByText("organization page")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /企业训练/u })).toBeNull();
    expect(screen.queryByRole("link", { name: /统计摘要/u })).toBeNull();
    expect(screen.queryByRole("link", { name: /AI出题/u })).toBeNull();
    expect(screen.queryByRole("link", { name: /AI组卷/u })).toBeNull();
  });

  it("blocks organization training direct access when role is advanced but service capability is standard", async () => {
    const fetchMock = vi.fn(async (url: RequestInfo | URL) => {
      if (String(url) === "/api/v1/sessions") {
        return createJsonResponse(
          createOrganizationAdminSession({
            organizationEffectiveEdition: "standard",
            canUseOrganizationAdvancedWorkspace: false,
          }),
        );
      }

      throw new Error(`Unexpected fetch: ${String(url)}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(AdminOrganizationTrainingPage));

    const unavailableState = await screen.findByRole("alert");
    expect(unavailableState).toHaveTextContent("标准版暂不可用");
    expect(screen.queryByRole("form", { name: "组织培训草稿表单" })).toBeNull();
    expect(fetchMock.mock.calls.map(([url]) => String(url))).toEqual([
      "/api/v1/sessions",
    ]);
  });

  it("does not load organization AI history or submit actions unless the service capability summary is advanced", async () => {
    const fetchMock = vi.fn(async (url: RequestInfo | URL) => {
      if (String(url) === "/api/v1/sessions") {
        return createJsonResponse(
          createOrganizationAdminSession({
            organizationEffectiveEdition: "standard",
            canUseOrganizationAdvancedWorkspace: false,
          }),
        );
      }

      throw new Error(`Unexpected fetch: ${String(url)}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      createElement(AdminAiGenerationEntryPage, {
        workspace: "organization",
        generationKind: "question",
      }),
    );

    await waitFor(() => {
      expect(fetchMock.mock.calls.map(([url]) => String(url))).toEqual([
        "/api/v1/sessions",
      ]);
    });
    expect(screen.queryByTestId("admin-ai-generation-submit")).toBeNull();
    expect(screen.queryByTestId("admin-ai-generation-task-history")).toBeNull();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "标准版暂不可用",
    );
  });
});

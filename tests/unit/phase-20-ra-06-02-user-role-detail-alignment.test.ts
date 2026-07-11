import { createElement } from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AdminOpsManagement } from "@/features/admin/admin-ops-management/AdminOpsManagement";
import { createAdminFlowRuntimeRouteHandlers } from "@/server/services/admin-flow-runtime";
import type { AdminAuthOperationListQuery } from "@/server/contracts/admin-user-org-auth-ops-contract";
import type { AdminFlowRuntimeRepositories } from "@/server/services/admin-flow-runtime";
import type { SessionService } from "@/server/services/session-service";

const now = "2026-05-31T08:00:00.000Z";
const future = "2027-05-31T08:00:00.000Z";

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

function createAdminSessionService(
  role: "super_admin" | "ops_admin" | "content_admin",
): Pick<SessionService, "getCurrentSession"> {
  return {
    async getCurrentSession(input) {
      if (input.authorization !== "Bearer admin-session-token") {
        return {
          code: 401001,
          message: "Unauthorized.",
          data: null,
        };
      }

      return {
        code: 0,
        message: "ok",
        data: {
          session: { expiresAt: future },
          user: {
            publicId: "admin-user-public-001",
            phone: "13900000001",
            name: "运营管理员",
            userType: null,
            status: "active",
            lockedUntilAt: null,
            employeePublicId: null,
            organizationPublicId: null,
            adminPublicId: "admin-public-001",
            adminRoles: [role],
          },
        },
      };
    },
  };
}

const userDetailPayload = {
  user: {
    publicId: "user-public-001",
    phone: "13900000002",
    name: "学员甲",
    registeredAt: now,
    status: "active",
    userType: "employee",
    organizationPublicId: "organization-public-001",
    organizationName: "杭州烟草",
    authStatus: "active",
  },
  enterpriseBinding: {
    employeePublicId: "employee-public-001",
    organizationPublicId: "organization-public-001",
    organizationName: "杭州烟草",
    orgTier: "city",
    status: "active",
  },
  authorizations: [
    {
      publicId: "personal-auth-public-001",
      authorizationType: "personal_auth",
      purchaserName: null,
      authScopeType: null,
      profession: "monopoly",
      level: 3,
      accountQuota: null,
      usedQuota: null,
      startsAt: now,
      expiresAt: future,
      status: "active",
      organizationPublicIds: [],
    },
    {
      publicId: "org-auth-public-001",
      authorizationType: "org_auth",
      purchaserName: "杭州烟草",
      authScopeType: "current_and_descendants",
      profession: "monopoly",
      level: 3,
      accountQuota: 100,
      usedQuota: 1,
      startsAt: now,
      expiresAt: future,
      status: "active",
      organizationPublicIds: ["organization-public-001"],
    },
  ],
};

function collectObjectKeys(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap(collectObjectKeys);
  }

  if (typeof value !== "object" || value === null) {
    return [];
  }

  return Object.entries(value).flatMap(([key, childValue]) => [
    key,
    ...collectObjectKeys(childValue),
  ]);
}

function createAdminFlowRepositories(input: {
  auditInputs: unknown[];
  mutationInputs: unknown[];
}) {
  const userOrgAuthRepository = {
    async listUsers(query: AdminAuthOperationListQuery) {
      return {
        users: [userDetailPayload.user],
        pagination: {
          page: query.page,
          pageSize: query.pageSize,
          sortBy: query.sortBy,
          sortOrder: query.sortOrder,
          total: 1,
        },
      };
    },
    async getUserDetail(publicId: string) {
      return publicId === "user-public-001" ? userDetailPayload : null;
    },
    async resetUserPassword(publicId: string) {
      input.mutationInputs.push({ action: "resetUserPassword", publicId });
      return publicId === "user-public-001";
    },
    async disableUser(publicId: string) {
      input.mutationInputs.push({ action: "disableUser", publicId });
      return publicId === "user-public-001";
    },
    async enableUser(publicId: string) {
      input.mutationInputs.push({ action: "enableUser", publicId });
      return publicId === "user-public-001";
    },
    async revokeUserSessions(publicId: string) {
      input.mutationInputs.push({ action: "revokeUserSessions", publicId });
      return publicId === "user-public-001";
    },
  };

  return {
    userOrgAuthRepository,
    contentKnowledgeRepository: {
      async listQuestions() {
        throw new Error("listQuestions should not be called by this test");
      },
      async listPapers() {
        throw new Error("listPapers should not be called by this test");
      },
    },
    auditLogRepository: {
      async appendAuditLog(auditLogInput) {
        input.auditInputs.push(auditLogInput);
      },
      async listAuditLogs(query) {
        return {
          auditLogs: [],
          pagination: {
            page: query.page,
            pageSize: query.pageSize,
            sortBy: query.sortBy,
            sortOrder: query.sortOrder,
            total: 0,
          },
        };
      },
    },
  } as AdminFlowRuntimeRepositories;
}

function createOkPayload<TData>(data: TData) {
  return {
    code: 0,
    message: "ok",
    data,
  };
}

function mockAdminOpsFetch() {
  localStorage.setItem("tiku.localSessionToken", "admin-session-token");

  return vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
    const url =
      input instanceof Request
        ? input.url
        : typeof input === "string"
          ? input
          : input.toString();

    if (url.startsWith("/api/v1/sessions")) {
      return Response.json(
        createOkPayload({
          session: { expiresAt: future },
          user: {
            publicId: "admin-user-public-001",
            phone: "13900000001",
            name: "运营管理员",
            userType: null,
            status: "active",
            lockedUntilAt: null,
            employeePublicId: null,
            organizationPublicId: null,
            adminPublicId: "admin-public-001",
            adminRoles: ["ops_admin"],
          },
        }),
      );
    }

    if (url.startsWith("/api/v1/users/user-public-001/reset-password")) {
      return Response.json(createOkPayload(null));
    }

    if (url.startsWith("/api/v1/users/user-public-001/disable")) {
      return Response.json(createOkPayload(null));
    }

    if (url.startsWith("/api/v1/users/user-public-001")) {
      return Response.json(createOkPayload(userDetailPayload));
    }

    if (url.startsWith("/api/v1/users")) {
      return Response.json(
        createOkPayload({ users: [userDetailPayload.user] }),
      );
    }

    if (url.startsWith("/api/v1/organizations")) {
      return Response.json(
        createOkPayload({
          organizations: [
            {
              publicId: "organization-public-001",
              name: "杭州烟草",
              orgTier: "city",
              parentOrganizationPublicId: null,
              status: "active",
              employeeCount: 1,
              authSummary: "monopoly / level 3",
            },
          ],
        }),
      );
    }

    if (url.startsWith("/api/v1/employees")) {
      return Response.json(
        createOkPayload({
          employees: [
            {
              publicId: "employee-public-001",
              userPublicId: "user-public-001",
              phone: "13900000002",
              name: "员工甲",
              organizationPublicId: "organization-public-001",
              status: "active",
            },
          ],
        }),
      );
    }

    if (url.startsWith("/api/v1/org-auths")) {
      return Response.json(
        createOkPayload({
          orgAuths: [
            {
              publicId: "org-auth-public-001",
              name: "杭州企业授权",
              purchaserOrganizationPublicId: "organization-public-001",
              authScopeType: "current_and_descendants",
              profession: "monopoly",
              level: 3,
              accountQuota: 100,
              usedQuota: 1,
              startsAt: now,
              expiresAt: future,
              status: "active",
              cancelledAt: null,
              organizationPublicIds: ["organization-public-001"],
              createdAt: now,
              updatedAt: now,
            },
          ],
        }),
      );
    }

    if (url.startsWith("/api/v1/redeem-codes")) {
      return Response.json(createOkPayload({ redeemCodes: [] }));
    }

    if (url.startsWith("/api/v1/audit-logs")) {
      return Response.json(createOkPayload({ auditLogs: [] }));
    }

    if (url.startsWith("/api/v1/ai-call-logs/summary")) {
      return Response.json(createOkPayload({ dailySummaries: [] }));
    }

    if (url.startsWith("/api/v1/ai-call-logs")) {
      return Response.json(createOkPayload({ aiCallLogs: [] }));
    }

    return Response.json({
      code: 404001,
      message: "Not found.",
      data: null,
    });
  });
}

describe("phase 20 RA-06-02 user management role detail alignment", () => {
  it("allows ops_admin to read user detail with authorization list and enterprise binding only through public identifiers", async () => {
    const handlers = createAdminFlowRuntimeRouteHandlers({
      repositories: createAdminFlowRepositories({
        auditInputs: [],
        mutationInputs: [],
      }),
      sessionService: createAdminSessionService("ops_admin"),
    }) as ReturnType<typeof createAdminFlowRuntimeRouteHandlers> & {
      users: {
        detail: {
          GET: (
            request: Request,
            context: { params: Promise<{ publicId: string }> },
          ) => Promise<Response>;
        };
      };
    };

    const response = await handlers.users.detail.GET(
      new Request("http://localhost/api/v1/users/user-public-001", {
        headers: { authorization: "Bearer admin-session-token" },
      }),
      { params: Promise.resolve({ publicId: "user-public-001" }) },
    );
    const payload = await response.json();

    expect(payload).toEqual(createOkPayload(userDetailPayload));
    expect(collectObjectKeys(payload)).not.toContain("id");
    expect(collectObjectKeys(payload)).not.toContain("userId");
    expect(JSON.stringify(payload)).not.toContain("password");
    expect(JSON.stringify(payload)).not.toContain("token");
    expect(JSON.stringify(payload)).not.toContain("auth_user_id");
  });

  it("allows ops_admin user lifecycle and credential reset actions while denying content_admin", async () => {
    const auditInputs: unknown[] = [];
    const mutationInputs: unknown[] = [];
    const repositories = createAdminFlowRepositories({
      auditInputs,
      mutationInputs,
    });
    const opsHandlers = createAdminFlowRuntimeRouteHandlers({
      repositories,
      sessionService: createAdminSessionService("ops_admin"),
    });
    const headers = {
      authorization: "Bearer admin-session-token",
      "x-forwarded-for": "203.0.113.30, 10.0.0.1",
    };

    const resetResponse = await opsHandlers.users.resetPassword.POST(
      new Request(
        "http://localhost/api/v1/users/user-public-001/reset-password",
        {
          body: JSON.stringify({ newPassword: "ResetPass2026" }),
          method: "POST",
          headers: {
            ...headers,
            "content-type": "application/json",
          },
        },
      ),
      { params: Promise.resolve({ publicId: "user-public-001" }) },
    );
    const disableResponse = await opsHandlers.users.disable.POST(
      new Request("http://localhost/api/v1/users/user-public-001/disable", {
        method: "POST",
        headers,
      }),
      { params: Promise.resolve({ publicId: "user-public-001" }) },
    );
    const enableResponse = await opsHandlers.users.enable.POST(
      new Request("http://localhost/api/v1/users/user-public-001/enable", {
        method: "POST",
        headers,
      }),
      { params: Promise.resolve({ publicId: "user-public-001" }) },
    );

    await expect(resetResponse.json()).resolves.toEqual(createOkPayload(null));
    await expect(disableResponse.json()).resolves.toEqual(
      createOkPayload(null),
    );
    await expect(enableResponse.json()).resolves.toEqual(createOkPayload(null));
    expect(mutationInputs).toEqual([
      { action: "resetUserPassword", publicId: "user-public-001" },
      { action: "revokeUserSessions", publicId: "user-public-001" },
      { action: "disableUser", publicId: "user-public-001" },
      { action: "revokeUserSessions", publicId: "user-public-001" },
      { action: "enableUser", publicId: "user-public-001" },
    ]);
    expect(auditInputs).toEqual([
      expect.objectContaining({
        actorRole: "ops_admin",
        actionType: "user.reset_password",
        resultStatus: "success",
        metadataSummary: "redacted user credential reset metadata",
        requestIp: "203.0.113.30",
      }),
      expect.objectContaining({
        actorRole: "ops_admin",
        actionType: "user.disable",
        resultStatus: "success",
        metadataSummary: "redacted user disable metadata",
        requestIp: "203.0.113.30",
      }),
      expect.objectContaining({
        actorRole: "ops_admin",
        actionType: "user.enable",
        resultStatus: "success",
        metadataSummary: "redacted user enable metadata",
        requestIp: "203.0.113.30",
      }),
    ]);
    expect(JSON.stringify({ auditInputs, mutationInputs })).not.toContain(
      "admin-session-token",
    );

    const deniedHandlers = createAdminFlowRuntimeRouteHandlers({
      repositories: createAdminFlowRepositories({
        auditInputs: [],
        mutationInputs: [],
      }),
      sessionService: createAdminSessionService("content_admin"),
    });
    const deniedResponse = await deniedHandlers.users.disable.POST(
      new Request("http://localhost/api/v1/users/user-public-001/disable", {
        method: "POST",
        headers: { authorization: "Bearer admin-session-token" },
      }),
      { params: Promise.resolve({ publicId: "user-public-001" }) },
    );

    await expect(deniedResponse.json()).resolves.toEqual({
      code: 403601,
      message: "Admin permission denied.",
      data: null,
    });
  });

  it("renders user detail, authorization list, and role-appropriate user actions on the ops page without leaking internal fields", async () => {
    const fetchMock = mockAdminOpsFetch();

    render(createElement(AdminOpsManagement));

    expect(
      await screen.findByRole("heading", { level: 1, name: "用户管理" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "后台账号安全策略" }),
    ).toBeInTheDocument();
    expect(screen.getByText("5 次 / 15 分钟")).toBeInTheDocument();
    expect(screen.getByText("8 小时")).toBeInTheDocument();
    expect(screen.getByText("后台账号独立")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "创建后台账号" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("super_admin")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "查看详情" }));

    const detailPanel = await screen.findByTestId(
      "admin-user-detail-user-public-001",
    );

    expect(detailPanel).toHaveAttribute("data-public-id", "user-public-001");
    expect(detailPanel).not.toHaveAttribute("data-id");
    expect(within(detailPanel).getByText("授权列表")).toBeInTheDocument();
    expect(within(detailPanel).getByText("企业绑定")).toBeInTheDocument();
    expect(within(detailPanel).getByText("个人授权")).toBeInTheDocument();
    expect(within(detailPanel).getByText("组织授权")).toBeInTheDocument();
    expect(within(detailPanel).queryByText("personal_auth")).toBeNull();
    expect(within(detailPanel).queryByText("org_auth")).toBeNull();
    expect(
      within(detailPanel).getAllByText("organization-public-001").length,
    ).toBeGreaterThan(0);
    expect(within(detailPanel).queryByText("auth_user_id")).toBeNull();
    expect(within(detailPanel).queryByText("password")).toBeNull();
    expect(within(detailPanel).queryByText("token")).toBeNull();

    fireEvent.click(
      within(detailPanel).getByRole("button", { name: "停用用户" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "确认停用" }));

    await waitFor(() => {
      expect(
        fetchMock.mock.calls.some(
          ([input]) =>
            String(input) === "/api/v1/users/user-public-001/disable",
        ),
      ).toBe(true);
    });
  });
});

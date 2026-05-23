import { createElement } from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AdminOpsManagement } from "@/features/admin/admin-ops-management/AdminOpsManagement";
import { createAdminFlowRuntimeRouteHandlers } from "@/server/services/admin-flow-runtime";
import type { AdminFlowRuntimeRepositories } from "@/server/services/admin-flow-runtime";
import type { SessionService } from "@/server/services/session-service";

const now = "2026-05-23T08:00:00.000Z";

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

function createAdminSessionService(
  role: "super_admin" | "ops_admin" | "content_admin",
): SessionService {
  return {
    async login() {
      throw new Error("login should not be called by admin ops routes");
    },
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
          session: {
            expiresAt: "2026-05-23T16:00:00.000Z",
          },
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

function createAdminOpsRepositories() {
  const auditInputs: unknown[] = [];
  const resetInputs: string[] = [];

  const repositories = {
    userOrgAuthRepository: {
      async listUsers(query) {
        return {
          users: [
            {
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
          ],
          pagination: {
            page: query.page,
            pageSize: query.pageSize,
            sortBy: query.sortBy,
            sortOrder: query.sortOrder,
            total: 1,
          },
        };
      },
      async resetUserPassword(publicId) {
        resetInputs.push(publicId);
        return publicId === "user-public-001";
      },
    },
    contentKnowledgeRepository: {
      async listQuestions() {
        throw new Error("listQuestions should not be called by admin ops test");
      },
      async listPapers() {
        throw new Error("listPapers should not be called by admin ops test");
      },
    },
    auditLogRepository: {
      async appendAuditLog(input) {
        auditInputs.push(input);
      },
      async listAuditLogs(query) {
        return {
          auditLogs: [
            {
              publicId: "audit-log-public-001",
              actorPublicId: "admin-public-001",
              actorRole: "super_admin",
              actionType: "user.reset_password",
              targetResourceType: "user",
              targetPublicId: "user-public-001",
              resultStatus: "success",
              metadataSummary: "redacted user credential reset metadata",
              requestIp: "203.0.113.10",
              createdAt: now,
            },
          ],
          pagination: {
            page: query.page,
            pageSize: query.pageSize,
            sortBy: query.sortBy,
            sortOrder: query.sortOrder,
            total: 1,
          },
        };
      },
    },
  } satisfies AdminFlowRuntimeRepositories;

  return { auditInputs, repositories, resetInputs };
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
          session: { expiresAt: "2026-05-23T16:00:00.000Z" },
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
            adminRoles: ["super_admin", "ops_admin"],
          },
        }),
      );
    }

    if (url.startsWith("/api/v1/users/user-public-001/reset-password")) {
      return Response.json(createOkPayload(null));
    }

    if (url.startsWith("/api/v1/users")) {
      return Response.json(
        createOkPayload({
          users: [
            {
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
          ],
        }),
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
              expiresAt: "2027-05-23T08:00:00.000Z",
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
      return Response.json(
        createOkPayload({
          redeemCodes: [
            {
              publicId: "redeem-code-public-001",
              codeDisplay: "RC-2026-****",
              canViewPlainText: false,
              profession: "monopoly",
              level: 3,
              status: "unused",
              redeemedUserPublicId: null,
              createdAt: now,
            },
          ],
        }),
      );
    }

    if (url.startsWith("/api/v1/audit-logs")) {
      return Response.json(
        createOkPayload({
          auditLogs: [
            {
              publicId: "audit-log-public-001",
              actorPublicId: "admin-public-001",
              actorRole: "super_admin",
              actionType: "user.reset_password",
              targetResourceType: "user",
              targetPublicId: "user-public-001",
              resultStatus: "success",
              metadataSummary: "redacted user credential reset metadata",
              requestIp: "203.0.113.10",
              createdAt: now,
            },
          ],
        }),
      );
    }

    if (url.startsWith("/api/v1/ai-call-logs/summary")) {
      return Response.json(
        createOkPayload({
          dailySummaries: [
            {
              bucket: "2026-05-23",
              bucketType: "day",
              aiFuncType: "ai_scoring",
              providerDisplayName: "Mock AI",
              modelAlias: "mock-scoring",
              callCount: 1,
              successCount: 1,
              failedCount: 0,
              totalTokenCount: 100,
              estimatedCostCny: "0.00",
            },
          ],
        }),
      );
    }

    if (url.startsWith("/api/v1/ai-call-logs")) {
      return Response.json(
        createOkPayload({
          aiCallLogs: [
            {
              publicId: "ai-call-log-public-001",
              userPublicId: "user-public-001",
              organizationPublicId: "organization-public-001",
              profession: "monopoly",
              level: 3,
              aiFuncType: "ai_scoring",
              callStatus: "success",
              providerDisplayName: "Mock AI",
              modelAlias: "mock-scoring",
              promptSummary: "redacted prompt and answer snapshot",
              outputSummary: "redacted learning suggestion snapshot",
              promptTokenCount: 40,
              completionTokenCount: 60,
              totalTokenCount: 100,
              estimatedCostCny: "0.00",
              latencyMs: 80,
              startedAt: now,
              completedAt: now,
            },
          ],
        }),
      );
    }

    return Response.json({
      code: 404001,
      message: "Not found.",
      data: null,
    });
  });
}

describe("phase 9 admin ops runtime ui completion", () => {
  it("protects user reset password with admin role, publicId, audit log, and redacted response", async () => {
    const { auditInputs, repositories, resetInputs } =
      createAdminOpsRepositories();
    const handlers = createAdminFlowRuntimeRouteHandlers({
      repositories,
      sessionService: createAdminSessionService("super_admin"),
    }) as ReturnType<typeof createAdminFlowRuntimeRouteHandlers> & {
      users: {
        resetPassword: {
          POST: (
            request: Request,
            context: { params: Promise<{ publicId: string }> },
          ) => Promise<Response>;
        };
      };
    };

    const response = await handlers.users.resetPassword.POST(
      new Request(
        "http://localhost/api/v1/users/user-public-001/reset-password",
        {
          method: "POST",
          headers: {
            authorization: "Bearer admin-session-token",
            "x-forwarded-for": "203.0.113.10, 10.0.0.1",
          },
        },
      ),
      { params: Promise.resolve({ publicId: "user-public-001" }) },
    );
    const payload = await response.json();

    expect(payload).toEqual({
      code: 0,
      message: "ok",
      data: null,
    });
    expect(resetInputs).toEqual(["user-public-001"]);
    expect(auditInputs).toEqual([
      expect.objectContaining({
        actorPublicId: "admin-public-001",
        actorRole: "super_admin",
        actionType: "user.reset_password",
        targetResourceType: "user",
        targetPublicId: "user-public-001",
        resultStatus: "success",
        metadataSummary: "redacted user credential reset metadata",
        requestIp: "203.0.113.10",
      }),
    ]);
    expect(JSON.stringify(payload)).not.toContain("password");
    expect(JSON.stringify(payload)).not.toContain("admin-session-token");
  });

  it("denies user reset password for non-super admins and records redacted audit metadata", async () => {
    const { auditInputs, repositories, resetInputs } =
      createAdminOpsRepositories();
    const handlers = createAdminFlowRuntimeRouteHandlers({
      repositories,
      sessionService: createAdminSessionService("ops_admin"),
    }) as ReturnType<typeof createAdminFlowRuntimeRouteHandlers> & {
      users: {
        resetPassword: {
          POST: (
            request: Request,
            context: { params: Promise<{ publicId: string }> },
          ) => Promise<Response>;
        };
      };
    };

    const response = await handlers.users.resetPassword.POST(
      new Request(
        "http://localhost/api/v1/users/user-public-001/reset-password",
        {
          method: "POST",
          headers: { authorization: "Bearer admin-session-token" },
        },
      ),
      { params: Promise.resolve({ publicId: "user-public-001" }) },
    );

    await expect(response.json()).resolves.toEqual({
      code: 403601,
      message: "Admin permission denied.",
      data: null,
    });
    expect(resetInputs).toEqual([]);
    expect(auditInputs).toEqual([
      expect.objectContaining({
        actionType: "user.reset_password",
        resultStatus: "failed",
        metadataSummary:
          "redacted user credential reset permission denial metadata",
      }),
    ]);
  });

  it("renders protected admin ops data, read-only logs, publicId rows, redaction, confirmations, and filter refresh", async () => {
    const fetchMock = mockAdminOpsFetch();

    render(createElement(AdminOpsManagement));

    expect(screen.getByText("正在加载运营后台数据")).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "运营后台闭环" }),
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("admin-user-row-user-public-001"),
    ).toHaveAttribute("data-public-id", "user-public-001");
    expect(
      screen.getByTestId("admin-user-row-user-public-001"),
    ).not.toHaveAttribute("data-id");
    expect(screen.getByText("审计日志只读")).toBeInTheDocument();
    expect(screen.getByText("AI 调用日志只读")).toBeInTheDocument();
    expect(screen.getByText("RC-2026-****")).toBeInTheDocument();
    expect(screen.queryByText("RC-2026-0001-PLAIN")).toBeNull();
    expect(screen.queryByText("code_hash")).toBeNull();
    expect(screen.queryByText("raw prompt")).toBeNull();
    expect(screen.queryByText("sk-real-secret")).toBeNull();
    expect(screen.queryByText("admin-session-token")).toBeNull();

    fireEvent.change(screen.getByLabelText("用户状态"), {
      target: { value: "active" },
    });

    await waitFor(() => {
      expect(
        fetchMock.mock.calls.some(([input]) =>
          String(input).includes("status=active"),
        ),
      ).toBe(true);
    });

    fireEvent.click(screen.getByRole("button", { name: "注册时间排序" }));

    await waitFor(() => {
      expect(
        fetchMock.mock.calls.some(([input]) =>
          String(input).includes("sortBy=registeredAt"),
        ),
      ).toBe(true);
    });

    fireEvent.click(screen.getByRole("button", { name: "重置密码" }));
    expect(screen.getByRole("alertdialog")).toHaveTextContent(
      "确认重置用户密码？",
    );
    fireEvent.click(screen.getByRole("button", { name: "确认重置" }));
    expect(await screen.findByRole("status")).toHaveTextContent(
      "密码已重置，未返回明文密码",
    );

    fireEvent.click(screen.getByRole("button", { name: "生成卡密" }));
    expect(screen.getByRole("alertdialog")).toHaveTextContent(
      "卡密生成需要二次确认",
    );
    fireEvent.click(screen.getByRole("button", { name: "确认生成" }));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "数据已被其他操作更新，请刷新后重试",
    );
  });
});

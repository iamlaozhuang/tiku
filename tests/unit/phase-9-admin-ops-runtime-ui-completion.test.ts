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

  const fetchMock = vi.spyOn(globalThis, "fetch");

  return fetchMock.mockImplementation(async (input, init) => {
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

    if (url === "/api/v1/users/user-public-001") {
      return Response.json(
        createOkPayload({
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
              publicId: "org-auth-public-001",
              authorizationType: "org_auth",
              profession: "monopoly",
              level: 3,
              status: "active",
              purchaserName: "杭州烟草",
              organizationPublicIds: ["organization-public-001"],
            },
          ],
        }),
      );
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
      if (
        input instanceof Request
          ? input.method === "POST"
          : init?.method === "POST"
      ) {
        return Response.json(
          createOkPayload({
            redeemCode: {
              publicId: "redeem-code-public-generated",
              codePlainText: "ABCDEFG2",
              codeDisplay: "ABCDEFG2",
              profession: "monopoly",
              level: 3,
              status: "unused",
              redeemDeadlineAt: "2027-05-23T08:00:00.000Z",
              createdAt: now,
            },
          }),
        );
      }

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
          body: JSON.stringify({ newPassword: "ResetPass2026" }),
          method: "POST",
          headers: {
            authorization: "Bearer admin-session-token",
            "content-type": "application/json",
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

  it("denies user reset password for content admins and records redacted audit metadata", async () => {
    const { auditInputs, repositories, resetInputs } =
      createAdminOpsRepositories();
    const handlers = createAdminFlowRuntimeRouteHandlers({
      repositories,
      sessionService: createAdminSessionService("content_admin"),
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
    expect(screen.getByText("AI 评分 / 调用成功")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "查看详情" }));
    expect(await screen.findByText("组织授权")).toBeInTheDocument();

    const visibleText = document.body.textContent ?? "";
    expect(visibleText).not.toContain("super_admin");
    expect(visibleText).not.toContain("ops_admin");
    expect(visibleText).not.toContain("content_admin");
    expect(visibleText).not.toContain("org_auth");
    expect(visibleText).not.toContain("ai_scoring");
    expect(visibleText).not.toContain("user.reset_password");
    expect(visibleText).not.toContain("success");
    expect(visibleText).not.toContain("metadata");

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

    fireEvent.click(
      within(screen.getByTestId("admin-user-row-user-public-001")).getByRole(
        "button",
        { name: "重置密码" },
      ),
    );
    expect(screen.getByRole("alertdialog")).toHaveTextContent(
      "确认重置用户密码？",
    );
    fireEvent.change(screen.getByLabelText("reset-password-new-password"), {
      target: { value: "ResetPass2026" },
    });
    fireEvent.click(screen.getByRole("button", { name: "确认重置" }));
    expect(await screen.findByRole("status")).toHaveTextContent(
      "密码已重置，未返回明文密码",
    );

    expect(screen.getByRole("link", { name: "打开卡密生成" })).toHaveAttribute(
      "href",
      "/ops/redeem-codes",
    );
    expect(
      fetchMock.mock.calls.some(
        ([input, init]) =>
          String(input).startsWith("/api/v1/redeem-codes") &&
          init?.method === "POST",
      ),
    ).toBe(false);
    expect(screen.queryByText("卡密生成需要二次确认")).not.toBeInTheDocument();
    expect(
      screen.queryByText("卡密已生成，请仅在本地验证时复制给学员"),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("ABCDEFG2")).not.toBeInTheDocument();
    expect(screen.queryByText("admin-session-token")).toBeNull();
  });
});

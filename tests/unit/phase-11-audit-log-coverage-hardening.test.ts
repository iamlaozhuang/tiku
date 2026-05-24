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
import { createAdminAiAuditLogListQuery } from "@/server/contracts/admin-ai-audit-log-ops-contract";
import { createAdminFlowRuntimeRouteHandlers } from "@/server/services/admin-flow-runtime";
import type { AdminFlowRuntimeRepositories } from "@/server/services/admin-flow-runtime";
import type { SessionService } from "@/server/services/session-service";

const now = "2026-05-24T09:00:00.000Z";

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

function createSessionService(): Pick<SessionService, "getCurrentSession"> {
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
          session: { expiresAt: "2026-05-24T12:00:00.000Z" },
          user: {
            publicId: "admin-user-public-001",
            phone: "13800000001",
            name: "Ops Admin",
            userType: null,
            status: "active",
            lockedUntilAt: null,
            employeePublicId: null,
            organizationPublicId: null,
            adminPublicId: "admin-public-001",
            adminRoles: ["super_admin", "ops_admin"],
          },
        },
      };
    },
  };
}

function createRepositories(input: {
  capturedQueries: unknown[];
}): AdminFlowRuntimeRepositories {
  return {
    userOrgAuthRepository: {
      async listUsers() {
        return {
          users: [],
          pagination: {
            page: 1,
            pageSize: 20,
            sortBy: "updatedAt",
            sortOrder: "desc",
            total: 0,
          },
        };
      },
    },
    contentKnowledgeRepository: {
      async listQuestions() {
        throw new Error("not used");
      },
      async listPapers() {
        throw new Error("not used");
      },
    },
    auditLogRepository: {
      async appendAuditLog() {
        return undefined;
      },
      async listAuditLogs(query) {
        input.capturedQueries.push(query);

        return {
          auditLogs: [
            {
              publicId: "audit-log-user-reset",
              actorPublicId: "admin-public-001",
              actorRole: "super_admin",
              actionType: "user.reset_password",
              targetResourceType: "user",
              targetPublicId: "user-public-001",
              resultStatus: "failed",
              metadataSummary:
                "redacted user credential reset permission denial metadata",
              requestIp: "203.0.113.10",
              createdAt: now,
            },
            {
              publicId: "audit-log-paper-publish",
              actorPublicId: "admin-public-001",
              actorRole: "content_admin",
              actionType: "paper.publish",
              targetResourceType: "paper",
              targetPublicId: "paper-public-001",
              resultStatus: "success",
              metadataSummary: "redacted paper mutation metadata",
              requestIp: "203.0.113.11",
              createdAt: now,
            },
          ],
          pagination: {
            page: query.page,
            pageSize: query.pageSize,
            sortBy: query.sortBy,
            sortOrder: query.sortOrder,
            total: 2,
          },
        };
      },
    },
  };
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

  fetchMock.mockImplementation(async (input) => {
    const url = String(input);

    if (url.startsWith("/api/v1/sessions")) {
      return Response.json(
        createOkPayload({
          session: { expiresAt: "2026-05-24T12:00:00.000Z" },
          user: {
            publicId: "admin-user-public-001",
            phone: "13800000001",
            name: "Ops Admin",
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

    if (url.startsWith("/api/v1/audit-logs")) {
      return Response.json(
        createOkPayload({
          auditLogs: [
            {
              publicId: "audit-log-user-reset",
              actorPublicId: "admin-public-001",
              actorRole: "super_admin",
              actionType: "user.reset_password",
              targetResourceType: "user",
              targetPublicId: "user-public-001",
              resultStatus: "failed",
              metadataSummary: "redacted user credential reset metadata",
              requestIp: "203.0.113.10",
              createdAt: now,
            },
          ],
        }),
      );
    }

    if (url.startsWith("/api/v1/ai-call-logs/summary")) {
      return Response.json(createOkPayload({ dailySummaries: [] }));
    }

    if (url.startsWith("/api/v1/ai-call-logs")) {
      return Response.json(createOkPayload({ aiCallLogs: [] }));
    }

    const listKeyByPath: [string, string][] = [
      ["/api/v1/users", "users"],
      ["/api/v1/organizations", "organizations"],
      ["/api/v1/employees", "employees"],
      ["/api/v1/org-auths", "orgAuths"],
      ["/api/v1/redeem-codes", "redeemCodes"],
    ];
    const matchedList = listKeyByPath.find(([path]) => url.startsWith(path));

    if (matchedList !== undefined) {
      return Response.json(createOkPayload({ [matchedList[1]]: [] }));
    }

    return Response.json({ code: 404001, message: "Not found.", data: null });
  });

  return fetchMock;
}

describe("phase 11 audit_log coverage hardening", () => {
  it("normalizes audit_log coverage filters without accepting raw fields", () => {
    const query = createAdminAiAuditLogListQuery({
      actionType: " user.reset_password ",
      resultStatus: "failed",
      targetResourceType: " user ",
      keyword: "  reset  ",
    } as Parameters<typeof createAdminAiAuditLogListQuery>[0]);

    expect(query).toMatchObject({
      actionType: "user.reset_password",
      resultStatus: "failed",
      targetResourceType: "user",
      keyword: "reset",
    });
    expect(query).not.toHaveProperty("requestBody");
    expect(query).not.toHaveProperty("authorization");
  });

  it("filters returned audit logs by action, target, result, and keyword without leaking internals", async () => {
    const capturedQueries: unknown[] = [];
    const handlers = createAdminFlowRuntimeRouteHandlers({
      repositories: createRepositories({ capturedQueries }),
      sessionService: createSessionService(),
    });

    const response = await handlers.auditLogs.collection.GET(
      new Request(
        "http://localhost/api/v1/audit-logs?page=1&pageSize=20&keyword=reset&actionType=user.reset_password&targetResourceType=user&resultStatus=failed",
        { headers: { authorization: "Bearer admin-session-token" } },
      ),
    );
    const payload = await response.json();

    expect(capturedQueries[0]).toMatchObject({
      actionType: "user.reset_password",
      targetResourceType: "user",
      resultStatus: "failed",
      keyword: "reset",
    });
    expect(payload).toMatchObject({
      code: 0,
      data: {
        auditLogs: [
          expect.objectContaining({
            publicId: "audit-log-user-reset",
            actionType: "user.reset_password",
            targetResourceType: "user",
            resultStatus: "failed",
            metadataSummary:
              "redacted user credential reset permission denial metadata",
          }),
        ],
      },
      pagination: {
        total: 1,
      },
    });
    expect(payload.data.auditLogs).toHaveLength(1);
    expect(JSON.stringify(payload)).not.toContain('"id"');
    expect(JSON.stringify(payload)).not.toContain("admin-session-token");
    expect(JSON.stringify(payload)).not.toContain("requestBody");
  });

  it("lets admins search audit coverage from the ops page without exposing tokens", async () => {
    const fetchMock = mockAdminOpsFetch();

    render(createElement(AdminOpsManagement));

    expect(
      await screen.findByRole("heading", { name: "运营后台闭环" }),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Audit log keyword"), {
      target: { value: "user.reset_password" },
    });

    await waitFor(() => {
      expect(
        fetchMock.mock.calls.some(([input]) =>
          String(input).includes("keyword=user.reset_password"),
        ),
      ).toBe(true);
    });
    expect(screen.getByText("审计日志只读")).toBeInTheDocument();
    expect(document.body.textContent).not.toContain("admin-session-token");
    expect(document.body.textContent).not.toContain("requestBody");
  });
});

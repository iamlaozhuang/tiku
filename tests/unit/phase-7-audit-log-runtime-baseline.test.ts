import { describe, expect, it } from "vitest";

import {
  createAdminFlowRuntimeRouteHandlers,
  type AdminFlowRuntimeRepositories,
} from "@/server/services/admin-flow-runtime";
import type {
  AdminAiAuditLogListQuery,
  AuditLogSummaryDto,
} from "@/server/contracts/admin-ai-audit-log-ops-contract";
import type { SessionService } from "@/server/services/session-service";

type AdminRole = "super_admin" | "ops_admin" | "content_admin";

const expiresAt = new Date("2027-05-21T08:00:00.000Z");

function createSessionService(role: AdminRole | null): SessionService {
  return {
    async login() {
      throw new Error("login should not be called by audit log routes");
    },
    async getCurrentSession(input) {
      if (
        input.authorization !== "Bearer admin-session-token" ||
        role === null
      ) {
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
            expiresAt: expiresAt.toISOString(),
          },
          user: {
            publicId: `admin-dev-${role}`,
            phone: "13900000001",
            name: "Dev Admin",
            userType: null,
            status: "active",
            lockedUntilAt: null,
            employeePublicId: null,
            organizationPublicId: null,
            adminPublicId: `admin-dev-${role}`,
            adminRoles: [role],
          },
        },
      };
    },
  };
}

function createRepositories(): AdminFlowRuntimeRepositories {
  const auditLogs: AuditLogSummaryDto[] = [];

  return {
    userOrgAuthRepository: {
      async listUsers() {
        throw new Error("listUsers should not be called by audit log routes");
      },
    },
    contentKnowledgeRepository: {
      async listQuestions() {
        throw new Error(
          "listQuestions should not be called by audit log routes",
        );
      },
      async listPapers() {
        throw new Error("listPapers should not be called by audit log routes");
      },
    },
    auditLogRepository: {
      async appendAuditLog(
        input: Omit<AuditLogSummaryDto, "publicId" | "createdAt">,
      ) {
        auditLogs.unshift({
          ...input,
          publicId: "audit-log-dev-list-001",
          createdAt: "2026-05-21T08:30:00.000Z",
        });
      },
      async listAuditLogs(query: AdminAiAuditLogListQuery) {
        return {
          auditLogs,
          pagination: {
            page: query.page,
            pageSize: query.pageSize,
            sortBy: query.sortBy,
            sortOrder: query.sortOrder,
            total: auditLogs.length,
          },
        };
      },
    },
  } as unknown as AdminFlowRuntimeRepositories;
}

describe("phase 7 audit log runtime baseline", () => {
  it("requires an authenticated admin session before returning audit logs", async () => {
    const handlers = createAdminFlowRuntimeRouteHandlers({
      sessionService: createSessionService(null),
      repositories: createRepositories(),
    });

    const response = await handlers.auditLogs.collection.GET(
      new Request("http://localhost/api/v1/audit-logs"),
    );

    await expect(response.json()).resolves.toEqual({
      code: 401001,
      message: "Admin session is required.",
      data: null,
    });
  });

  it("denies content admins from the operations audit log view", async () => {
    const handlers = createAdminFlowRuntimeRouteHandlers({
      sessionService: createSessionService("content_admin"),
      repositories: createRepositories(),
    });

    const response = await handlers.auditLogs.collection.GET(
      new Request("http://localhost/api/v1/audit-logs", {
        headers: { authorization: "Bearer admin-session-token" },
      }),
    );

    await expect(response.json()).resolves.toEqual({
      code: 403641,
      message: "Admin permission denied.",
      data: null,
    });
  });

  it("appends and returns redaction-safe audit log entries for super admins", async () => {
    const handlers = createAdminFlowRuntimeRouteHandlers({
      sessionService: createSessionService("super_admin"),
      repositories: createRepositories(),
    });

    const response = await handlers.auditLogs.collection.GET(
      new Request("http://localhost/api/v1/audit-logs?page=1&pageSize=20", {
        headers: {
          authorization: "Bearer admin-session-token",
          "x-forwarded-for": "203.0.113.10, 10.0.0.1",
        },
      }),
    );
    const payload = await response.json();

    expect(payload).toMatchObject({
      code: 0,
      message: "ok",
      data: {
        auditLogs: [
          {
            publicId: "audit-log-dev-list-001",
            actorPublicId: "admin-dev-super_admin",
            actorRole: "super_admin",
            actionType: "audit_log.list",
            targetResourceType: "audit_log",
            targetPublicId: null,
            resultStatus: "success",
            metadataSummary: "redacted audit_log list operation metadata",
            requestIp: "203.0.113.10",
            createdAt: "2026-05-21T08:30:00.000Z",
          },
        ],
      },
      pagination: {
        page: 1,
        pageSize: 20,
        total: 1,
      },
    });

    const serializedPayload = JSON.stringify(payload);
    expect(serializedPayload).not.toContain('"id"');
    expect(serializedPayload).not.toContain("Bearer admin-session-token");
    expect(serializedPayload).not.toContain("password");
    expect(serializedPayload).not.toContain("requestBody");
    expect(serializedPayload).not.toContain("session-token");
  });
});

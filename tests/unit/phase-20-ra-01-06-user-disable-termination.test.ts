import { describe, expect, it } from "vitest";

import { createAdminFlowRuntimeRouteHandlers } from "@/server/services/admin-flow-runtime";
import type { AdminFlowRuntimeRepositories } from "@/server/services/admin-flow-runtime";
import type { SessionService } from "@/server/services/session-service";

function createOpsAdminSessionService(): Pick<
  SessionService,
  "getCurrentSession"
> {
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
          session: { expiresAt: "2026-06-01T08:00:00.000Z" },
          user: {
            publicId: "admin-user-public-001",
            phone: "13900000001",
            name: "Ops Admin",
            userType: null,
            status: "active",
            lockedUntilAt: null,
            employeePublicId: null,
            organizationPublicId: null,
            adminPublicId: "admin-public-001",
            adminRoles: ["ops_admin"],
          },
        },
      };
    },
  };
}

function createAdminFlowRepositories(input: {
  auditInputs: unknown[];
  mutationInputs: unknown[];
}): AdminFlowRuntimeRepositories {
  return {
    userOrgAuthRepository: {
      async listUsers(query) {
        return {
          users: [],
          pagination: {
            page: query.page,
            pageSize: query.pageSize,
            sortBy: query.sortBy,
            sortOrder: query.sortOrder,
            total: 0,
          },
        };
      },
      async disableUser(publicId) {
        input.mutationInputs.push({ action: "disableUser", publicId });

        return publicId === "user-public-001" ? "updated" : "not_found";
      },
      async revokeUserSessions(publicId) {
        input.mutationInputs.push({ action: "revokeUserSessions", publicId });

        return publicId === "user-public-001";
      },
      async terminateUserActiveFlows(publicId: string) {
        input.mutationInputs.push({
          action: "terminateUserActiveFlows",
          publicId,
        });

        return { practiceCount: 1, mockExamCount: 2 };
      },
    },
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
  };
}

describe("phase 20 RA-01-06 user disable termination", () => {
  it("terminates active practice and mock_exam flows when disabling a user", async () => {
    const auditInputs: unknown[] = [];
    const mutationInputs: unknown[] = [];
    const handlers = createAdminFlowRuntimeRouteHandlers({
      repositories: createAdminFlowRepositories({
        auditInputs,
        mutationInputs,
      }),
      sessionService: createOpsAdminSessionService(),
    });

    const response = await handlers.users.disable.POST(
      new Request("http://localhost/api/v1/users/user-public-001/disable", {
        method: "POST",
        headers: {
          authorization: "Bearer admin-session-token",
          "x-forwarded-for": "203.0.113.40, 10.0.0.1",
        },
      }),
      { params: Promise.resolve({ publicId: "user-public-001" }) },
    );

    await expect(response.json()).resolves.toEqual({
      code: 0,
      message: "ok",
      data: null,
    });
    expect(mutationInputs).toEqual([
      { action: "disableUser", publicId: "user-public-001" },
    ]);
    expect(auditInputs).toEqual([
      expect.objectContaining({
        actorRole: "ops_admin",
        actionType: "user.disable",
        targetResourceType: "user",
        targetPublicId: "user-public-001",
        resultStatus: "success",
        metadataSummary: "redacted user disable metadata",
        requestIp: "203.0.113.40",
      }),
    ]);
    expect(JSON.stringify({ auditInputs, mutationInputs })).not.toContain(
      "admin-session-token",
    );
  });
});

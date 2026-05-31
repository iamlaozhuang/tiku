import { describe, expect, it } from "vitest";

import {
  createAdminFlowRuntimeRouteHandlers,
  type AdminFlowRuntimeRepositories,
} from "@/server/services/admin-flow-runtime";
import type { SessionService } from "@/server/services/session-service";

function createSuperAdminSessionService(): Pick<
  SessionService,
  "getCurrentSession"
> {
  return {
    async getCurrentSession() {
      return {
        code: 0,
        message: "ok",
        data: {
          session: { expiresAt: "2026-05-31T12:00:00.000Z" },
          user: {
            publicId: "admin-user-public-001",
            phone: "13900000001",
            name: "Super Admin",
            userType: null,
            status: "active",
            lockedUntilAt: null,
            employeePublicId: null,
            organizationPublicId: null,
            adminPublicId: "admin-public-001",
            adminRoles: ["super_admin"],
          },
        },
      };
    },
  };
}

function createRepositories(input: {
  auditInputs: unknown[];
  resetInputs: unknown[];
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
      async resetUserPassword(publicId, resetInput?: unknown) {
        input.resetInputs.push({
          publicId,
          resetInput,
        });

        return publicId === "user-public-001";
      },
      async revokeUserSessions(publicId) {
        input.resetInputs.push({
          publicId,
          action: "revokeUserSessions",
        });

        return publicId === "user-public-001";
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

describe("phase 20 RA-01-05 password reset ops flow", () => {
  it("accepts an operator-provided new password while keeping response and audit evidence redacted", async () => {
    const auditInputs: unknown[] = [];
    const resetInputs: unknown[] = [];
    const handlers = createAdminFlowRuntimeRouteHandlers({
      repositories: createRepositories({ auditInputs, resetInputs }),
      sessionService: createSuperAdminSessionService(),
    });

    const response = await handlers.users.resetPassword.POST(
      new Request(
        "http://localhost/api/v1/users/user-public-001/reset-password",
        {
          body: JSON.stringify({ newPassword: "ResetPass2026" }),
          headers: {
            authorization: "Bearer admin-session-token",
            "content-type": "application/json",
          },
          method: "POST",
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
    expect(resetInputs).toEqual([
      {
        publicId: "user-public-001",
        resetInput: { newPassword: "ResetPass2026" },
      },
      {
        publicId: "user-public-001",
        action: "revokeUserSessions",
      },
    ]);
    expect(auditInputs).toEqual([
      expect.objectContaining({
        actorPublicId: "admin-public-001",
        actorRole: "super_admin",
        actionType: "user.reset_password",
        targetResourceType: "user",
        targetPublicId: "user-public-001",
        resultStatus: "success",
        metadataSummary: "redacted user credential reset metadata",
      }),
    ]);

    expect(JSON.stringify({ payload, auditInputs })).not.toContain(
      "ResetPass2026",
    );
    expect(JSON.stringify({ payload, auditInputs })).not.toContain(
      "newPassword",
    );
    expect(JSON.stringify({ payload, auditInputs })).not.toContain(
      "admin-session-token",
    );
  });
});

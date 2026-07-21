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
      async resetUserPasswordAtomically(resetInput: {
        actor: {
          publicId: string;
          requestIp: string | null;
          role: string;
        };
        newPassword: string;
        publicId: string;
      }) {
        input.resetInputs.push({
          action: "resetUserPasswordAtomically",
          resetInput,
        });

        return resetInput.publicId === "user-public-001";
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
  it("generates the user password on the server and returns only a no-store one-time distribution window", async () => {
    const auditInputs: unknown[] = [];
    const resetInputs: unknown[] = [];
    const handlers = createAdminFlowRuntimeRouteHandlers({
      createOneTimePassword: () => "ServerGeneratedA123",
      repositories: createRepositories({ auditInputs, resetInputs }),
      sessionService: createSuperAdminSessionService(),
    });

    const response = await handlers.users.resetPassword.POST(
      new Request(
        "http://localhost/api/v1/users/user-public-001/reset-password",
        {
          body: JSON.stringify({ newPassword: "OperatorChosenPass2026" }),
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

    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(payload).toEqual({
      code: 0,
      message: "ok",
      data: {
        userPublicId: "user-public-001",
        oneTimePasswordPlainText: "ServerGeneratedA123",
        distributionWindow: {
          visibleOnce: true,
          expiresAt: null,
          redactionNotice:
            "The one-time password is returned once and must not be logged.",
          sessionRevocation: "revoked_active_sessions",
        },
      },
    });
    expect(resetInputs).toEqual([
      {
        action: "resetUserPasswordAtomically",
        resetInput: {
          actor: {
            publicId: "admin-public-001",
            requestIp: null,
            role: "super_admin",
          },
          newPassword: "ServerGeneratedA123",
          publicId: "user-public-001",
        },
      },
    ]);
    expect(auditInputs).toEqual([]);

    expect(JSON.stringify({ payload, auditInputs })).not.toContain(
      "OperatorChosenPass2026",
    );
    expect(JSON.stringify(auditInputs)).not.toContain("ServerGeneratedA123");
    expect(JSON.stringify(auditInputs)).not.toContain("newPassword");
    expect(JSON.stringify({ payload, auditInputs })).not.toContain(
      "admin-session-token",
    );
  });

  it("does not expose or revoke a generated password when the target user does not exist", async () => {
    const auditInputs: unknown[] = [];
    const resetInputs: unknown[] = [];
    const handlers = createAdminFlowRuntimeRouteHandlers({
      createOneTimePassword: () => "MissingUserGeneratedA123",
      repositories: createRepositories({ auditInputs, resetInputs }),
      sessionService: createSuperAdminSessionService(),
    });

    const response = await handlers.users.resetPassword.POST(
      new Request("http://localhost/api/v1/users/missing-user/reset-password", {
        body: JSON.stringify({ newPassword: "OperatorChosenPass2026" }),
        headers: { "content-type": "application/json" },
        method: "POST",
      }),
      { params: Promise.resolve({ publicId: "missing-user" }) },
    );

    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({
      code: 404601,
      message: "User does not exist.",
      data: null,
    });
    expect(resetInputs).toEqual([
      {
        action: "resetUserPasswordAtomically",
        resetInput: {
          actor: {
            publicId: "admin-public-001",
            requestIp: null,
            role: "super_admin",
          },
          newPassword: "MissingUserGeneratedA123",
          publicId: "missing-user",
        },
      },
    ]);
    expect(auditInputs).toEqual([
      expect.objectContaining({
        actionType: "user.reset_password",
        resultStatus: "failed",
        metadataSummary: "redacted user credential reset metadata",
      }),
    ]);
    expect(JSON.stringify(auditInputs)).not.toContain(
      "MissingUserGeneratedA123",
    );
    expect(JSON.stringify(auditInputs)).not.toContain("OperatorChosenPass2026");
  });

  it("fails closed before generating a password when the atomic reset command is unavailable", async () => {
    const auditInputs: unknown[] = [];
    const resetInputs: unknown[] = [];
    const repositories = createRepositories({ auditInputs, resetInputs });
    delete repositories.userOrgAuthRepository.resetUserPasswordAtomically;
    let generatorCallCount = 0;
    const handlers = createAdminFlowRuntimeRouteHandlers({
      createOneTimePassword: () => {
        generatorCallCount += 1;
        return "UnavailableGeneratedA123";
      },
      repositories,
      sessionService: createSuperAdminSessionService(),
    });

    const response = await handlers.users.resetPassword.POST(
      new Request(
        "http://localhost/api/v1/users/user-public-001/reset-password",
        { method: "POST" },
      ),
      { params: Promise.resolve({ publicId: "user-public-001" }) },
    );

    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({
      code: 503601,
      message: "Admin user password reset runtime is not configured.",
      data: null,
    });
    expect(generatorCallCount).toBe(0);
    expect(resetInputs).toEqual([]);
    expect(auditInputs).toEqual([
      expect.objectContaining({
        actionType: "user.reset_password",
        resultStatus: "failed",
        metadataSummary: "redacted user credential reset unavailable metadata",
      }),
    ]);
  });
});

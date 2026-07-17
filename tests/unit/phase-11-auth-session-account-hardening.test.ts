import { describe, expect, it } from "vitest";

import { createSessionRouteHandlers } from "@/server/auth/session-route";
import type { AuthAdapterBoundary } from "@/server/auth/auth-boundary";
import type { AuthUserRepository } from "@/server/repositories/auth-repository";
import { createAuthService } from "@/server/services/auth-service";
import { createAdminFlowRuntimeRouteHandlers } from "@/server/services/admin-flow-runtime";
import type { AdminFlowRuntimeRepositories } from "@/server/services/admin-flow-runtime";
import { createSessionService } from "@/server/services/session-service";
import type { SessionService } from "@/server/services/session-service";

const SESSION_TOKEN_FIELD = "token" as const;

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
          session: { expiresAt: "2026-05-24T18:00:00.000Z" },
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
      async resetUserPassword(publicId) {
        input.mutationInputs.push({
          action: "resetUserPassword",
          publicId,
        });

        return publicId === "user-public-001";
      },
      async revokeUserSessions(publicId) {
        input.mutationInputs.push({
          action: "revokeUserSessions",
          publicId,
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

describe("phase 11 auth session account hardening", () => {
  it("returns current session state through the route without internal ids or session tokens", async () => {
    const authAdapter = {
      async findSessionByToken() {
        return {
          [SESSION_TOKEN_FIELD]: "valid_session_value",
          auth_user_id: "auth-user-internal-001",
          expires_at: new Date("2026-05-24T18:00:00.000Z"),
        };
      },
    } satisfies AuthAdapterBoundary;
    const authUserRepository = {
      async findActiveUserByAuthUserId(authUserId) {
        return {
          id: 42,
          auth_user_id: authUserId,
          public_id: "user-public-001",
          phone: "13800000000",
          name: "Student User",
          user_type: "personal",
          status: "active",
          locked_until_at: null,
          employee_public_id: null,
          organization_public_id: null,
          admin_public_id: null,
          admin_roles: [],
        };
      },
    } satisfies AuthUserRepository;
    const sessionService = createSessionService(
      {
        async verifyPasswordCredential() {
          throw new Error("login credential adapter should not be used");
        },
        async createSingleActiveSession() {
          throw new Error("login session adapter should not be used");
        },
      },
      {
        async findLoginUserByPhone() {
          throw new Error("login repository should not be used");
        },
        async recordLoginFailure() {
          throw new Error("login failure repository should not be used");
        },
        async resetLoginFailures() {
          throw new Error("login reset repository should not be used");
        },
      },
      { now: () => new Date("2026-05-24T09:00:00.000Z") },
      createAuthService(authAdapter, authUserRepository, {
        now: () => new Date("2026-05-24T09:00:00.000Z"),
      }),
    );
    const { GET } = createSessionRouteHandlers(sessionService);

    const response = await GET(
      new Request("http://localhost/api/v1/sessions", {
        headers: { authorization: "Bearer valid_session_value" },
      }),
    );
    const payload = await response.json();

    expect(payload).toEqual({
      code: 0,
      message: "ok",
      data: {
        user: {
          publicId: "user-public-001",
          phone: "138****0000",
          name: "Student User",
          userType: "personal",
          status: "active",
          lockedUntilAt: null,
          employeePublicId: null,
          organizationPublicId: null,
          adminPublicId: null,
          adminRoles: [],
        },
        session: {
          expiresAt: "2026-05-24T18:00:00.000Z",
        },
      },
    });
    expect(JSON.stringify(payload)).not.toContain("auth-user-internal-001");
    expect(JSON.stringify(payload)).not.toContain("valid_session_value");
    expect(JSON.stringify(payload)).not.toContain("auth_user_id");
    expect(JSON.stringify(payload)).not.toContain('"id"');
  });

  it("returns the standard unauthorized envelope for missing or expired sessions", async () => {
    const authAdapter = {
      async findSessionByToken() {
        return {
          [SESSION_TOKEN_FIELD]: "expired_session_value",
          auth_user_id: "auth-user-internal-001",
          expires_at: new Date("2026-05-24T08:59:59.000Z"),
        };
      },
    } satisfies AuthAdapterBoundary;
    const authUserRepository = {
      async findActiveUserByAuthUserId() {
        throw new Error("expired session should not query users");
      },
    } satisfies AuthUserRepository;
    const sessionService = createSessionService(
      {
        async verifyPasswordCredential() {
          throw new Error("login credential adapter should not be used");
        },
        async createSingleActiveSession() {
          throw new Error("login session adapter should not be used");
        },
      },
      {
        async findLoginUserByPhone() {
          throw new Error("login repository should not be used");
        },
        async recordLoginFailure() {
          throw new Error("login failure repository should not be used");
        },
        async resetLoginFailures() {
          throw new Error("login reset repository should not be used");
        },
      },
      { now: () => new Date("2026-05-24T09:00:00.000Z") },
      createAuthService(authAdapter, authUserRepository, {
        now: () => new Date("2026-05-24T09:00:00.000Z"),
      }),
    );
    const { GET } = createSessionRouteHandlers(sessionService);

    const missingResponse = await GET(
      new Request("http://localhost/api/v1/sessions"),
    );
    const expiredResponse = await GET(
      new Request("http://localhost/api/v1/sessions", {
        headers: { authorization: "Bearer expired_session_value" },
      }),
    );

    await expect(missingResponse.json()).resolves.toEqual({
      code: 401001,
      message: "Unauthorized.",
      data: null,
    });
    await expect(expiredResponse.json()).resolves.toEqual({
      code: 401001,
      message: "Unauthorized.",
      data: null,
    });
  });

  it("revokes user sessions after a successful password reset with publicId-only audit evidence", async () => {
    const auditInputs: unknown[] = [];
    const mutationInputs: unknown[] = [];
    const handlers = createAdminFlowRuntimeRouteHandlers({
      createOneTimePassword: () => "HardeningGeneratedA123",
      repositories: createRepositories({
        auditInputs,
        mutationInputs,
      }),
      sessionService: createSuperAdminSessionService(),
    });

    const response = await handlers.users.resetPassword.POST(
      new Request(
        "http://localhost/api/v1/users/user-public-001/reset-password",
        {
          body: JSON.stringify({ newPassword: "OperatorChosenPass2026" }),
          headers: { "content-type": "application/json" },
          method: "POST",
        },
      ),
      { params: Promise.resolve({ publicId: "user-public-001" }) },
    );

    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({
      code: 0,
      message: "ok",
      data: {
        userPublicId: "user-public-001",
        oneTimePasswordPlainText: "HardeningGeneratedA123",
        distributionWindow: {
          visibleOnce: true,
          expiresAt: null,
          redactionNotice:
            "The one-time password is returned once and must not be logged.",
          sessionRevocation: "revoked_active_sessions",
        },
      },
    });
    expect(mutationInputs).toEqual([
      { action: "resetUserPassword", publicId: "user-public-001" },
      { action: "revokeUserSessions", publicId: "user-public-001" },
    ]);
    expect(auditInputs).toEqual([
      expect.objectContaining({
        actionType: "user.reset_password",
        targetResourceType: "user",
        targetPublicId: "user-public-001",
        resultStatus: "success",
        metadataSummary: "redacted user credential reset metadata",
      }),
    ]);
    expect(JSON.stringify({ auditInputs, mutationInputs })).not.toContain(
      '"id"',
    );
    expect(JSON.stringify(auditInputs)).not.toContain("passwordHash");
    expect(JSON.stringify(auditInputs)).not.toContain("temporaryPassword");
    expect(JSON.stringify(auditInputs)).not.toContain("plainText");
    expect(JSON.stringify(auditInputs)).not.toContain("HardeningGeneratedA123");
    expect(JSON.stringify(auditInputs)).not.toContain("OperatorChosenPass2026");
  });
});

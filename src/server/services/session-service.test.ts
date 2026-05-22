import { describe, expect, it } from "vitest";

import { createSessionService } from "./session-service";
import type { SessionCredentialAdapter } from "../auth/session-boundary";
import type { SessionUserRepository } from "../repositories/session-repository";

function createRepository(
  overrides: Partial<SessionUserRepository> = {},
): SessionUserRepository {
  return {
    async findLoginUserByPhone() {
      return {
        id: 42,
        auth_user_id: "auth_user_123",
        public_id: "user_public_123",
        phone: "13800000000",
        name: "张三",
        user_type: "personal",
        status: "active",
        login_failed_count: 0,
        locked_until_at: null,
        employee_public_id: null,
        organization_public_id: null,
        admin_public_id: null,
        admin_roles: [],
        login_failure_user_id: 42,
      };
    },
    async recordLoginFailure() {},
    async resetLoginFailures() {},
    ...overrides,
  };
}

function createCredentialAdapter(
  overrides: Partial<SessionCredentialAdapter> = {},
): SessionCredentialAdapter {
  return {
    async verifyPasswordCredential() {
      return true;
    },
    async createSingleActiveSession() {
      return {
        token: "session_token_123",
        auth_user_id: "auth_user_123",
        expires_at: new Date("2026-05-24T12:00:00.000Z"),
      };
    },
    ...overrides,
  };
}

describe("session service", () => {
  it("rejects invalid login input with the standard response envelope", async () => {
    const sessionService = createSessionService(
      createCredentialAdapter(),
      createRepository(),
    );

    await expect(
      sessionService.login({
        phone: "bad",
        password: "123",
      }),
    ).resolves.toEqual({
      code: 400001,
      message: "Invalid login input.",
      data: null,
    });
  });

  it("records a failed credential attempt without exposing which field failed", async () => {
    const recordedFailures: unknown[] = [];
    const sessionService = createSessionService(
      createCredentialAdapter({
        async verifyPasswordCredential() {
          return false;
        },
      }),
      createRepository({
        async recordLoginFailure(failure) {
          recordedFailures.push(failure);
        },
      }),
      {
        now: () => new Date("2026-05-17T12:00:00.000Z"),
      },
    );

    await expect(
      sessionService.login({
        phone: "13800000000",
        password: "abc12345",
      }),
    ).resolves.toEqual({
      code: 401002,
      message: "Invalid phone or password.",
      data: null,
    });
    expect(recordedFailures).toEqual([
      {
        userId: 42,
        loginFailedCount: 1,
        lockedUntilAt: null,
      },
    ]);
  });

  it("locks the account for five minutes after the third failed login", async () => {
    const recordedFailures: unknown[] = [];
    const sessionService = createSessionService(
      createCredentialAdapter({
        async verifyPasswordCredential() {
          return false;
        },
      }),
      createRepository({
        async findLoginUserByPhone() {
          return {
            id: 42,
            auth_user_id: "auth_user_123",
            public_id: "user_public_123",
            phone: "13800000000",
            name: "张三",
            user_type: "personal",
            status: "active",
            login_failed_count: 2,
            locked_until_at: null,
            employee_public_id: null,
            organization_public_id: null,
            admin_public_id: null,
            admin_roles: [],
            login_failure_user_id: 42,
          };
        },
        async recordLoginFailure(failure) {
          recordedFailures.push(failure);
        },
      }),
      {
        now: () => new Date("2026-05-17T12:00:00.000Z"),
      },
    );

    await expect(
      sessionService.login({
        phone: "13800000000",
        password: "abc12345",
      }),
    ).resolves.toEqual({
      code: 423001,
      message: "Account locked.",
      data: null,
    });
    expect(recordedFailures).toEqual([
      {
        userId: 42,
        loginFailedCount: 3,
        lockedUntilAt: new Date("2026-05-17T12:05:00.000Z"),
      },
    ]);
  });

  it("rejects login while the account is locked", async () => {
    const sessionService = createSessionService(
      createCredentialAdapter({
        async verifyPasswordCredential() {
          throw new Error("adapter should not be called while locked");
        },
      }),
      createRepository({
        async findLoginUserByPhone() {
          return {
            id: 42,
            auth_user_id: "auth_user_123",
            public_id: "user_public_123",
            phone: "13800000000",
            name: "张三",
            user_type: "personal",
            status: "active",
            login_failed_count: 3,
            locked_until_at: new Date("2026-05-17T12:04:00.000Z"),
            employee_public_id: null,
            organization_public_id: null,
            admin_public_id: null,
            admin_roles: [],
            login_failure_user_id: 42,
          };
        },
      }),
      {
        now: () => new Date("2026-05-17T12:00:00.000Z"),
      },
    );

    await expect(
      sessionService.login({
        phone: "13800000000",
        password: "abc12345",
      }),
    ).resolves.toEqual({
      code: 423001,
      message: "Account locked.",
      data: null,
    });
  });

  it("rejects disabled accounts before creating a new session", async () => {
    const sessionService = createSessionService(
      createCredentialAdapter({
        async createSingleActiveSession() {
          throw new Error("disabled account should not create session");
        },
      }),
      createRepository({
        async findLoginUserByPhone() {
          return {
            id: 42,
            auth_user_id: "auth_user_123",
            public_id: "user_public_123",
            phone: "13800000000",
            name: "张三",
            user_type: "personal",
            status: "disabled",
            login_failed_count: 0,
            locked_until_at: null,
            employee_public_id: null,
            organization_public_id: null,
            admin_public_id: null,
            admin_roles: [],
            login_failure_user_id: 42,
          };
        },
      }),
    );

    await expect(
      sessionService.login({
        phone: "13800000000",
        password: "abc12345",
      }),
    ).resolves.toEqual({
      code: 403002,
      message: "Account disabled.",
      data: null,
    });
  });

  it("creates a seven-day single active session after successful password verification", async () => {
    const createdSessions: unknown[] = [];
    const resetUserIds: number[] = [];
    const sessionService = createSessionService(
      createCredentialAdapter({
        async createSingleActiveSession(input) {
          createdSessions.push(input);

          return {
            token: "session_token_123",
            auth_user_id: input.authUserId,
            expires_at: input.expiresAt,
          };
        },
      }),
      createRepository({
        async resetLoginFailures(userId) {
          resetUserIds.push(userId);
        },
      }),
      {
        now: () => new Date("2026-05-17T12:00:00.000Z"),
      },
    );

    await expect(
      sessionService.login({
        phone: "13800000000",
        password: "abc12345",
      }),
    ).resolves.toEqual({
      code: 0,
      message: "ok",
      data: {
        token: "session_token_123",
        user: {
          publicId: "user_public_123",
          phone: "13800000000",
          name: "张三",
          userType: "personal",
          status: "active",
          lockedUntilAt: null,
          employeePublicId: null,
          organizationPublicId: null,
          adminPublicId: null,
          adminRoles: [],
        },
        session: {
          expiresAt: "2026-05-24T12:00:00.000Z",
        },
      },
    });
    expect(createdSessions).toEqual([
      {
        authUserId: "auth_user_123",
        expiresAt: new Date("2026-05-24T12:00:00.000Z"),
      },
    ]);
    expect(resetUserIds).toEqual([42]);
  });

  it("creates an eight-hour multi-session token for admin login", async () => {
    const createdSessions: unknown[] = [];
    const sessionService = createSessionService(
      createCredentialAdapter({
        async createSingleActiveSession() {
          throw new Error("admin login should not revoke existing sessions");
        },
        async createSession(input) {
          createdSessions.push(input);

          return {
            token: "admin_session_token_123",
            auth_user_id: input.authUserId,
            expires_at: input.expiresAt,
          };
        },
      }),
      createRepository({
        async findLoginUserByPhone() {
          return {
            id: 7,
            auth_user_id: "auth_admin_123",
            public_id: "admin_public_123",
            phone: "13900000001",
            name: "管理员",
            user_type: null,
            status: "active",
            login_failed_count: 0,
            locked_until_at: null,
            employee_public_id: null,
            organization_public_id: null,
            admin_public_id: "admin_public_123",
            admin_roles: ["super_admin"],
            login_failure_user_id: null,
          };
        },
      }),
      {
        now: () => new Date("2026-05-17T12:00:00.000Z"),
      },
    );

    await expect(
      sessionService.login({
        phone: "13900000001",
        password: "abc12345",
      }),
    ).resolves.toMatchObject({
      code: 0,
      message: "ok",
      data: {
        token: "admin_session_token_123",
        session: {
          expiresAt: "2026-05-17T20:00:00.000Z",
        },
        user: {
          publicId: "admin_public_123",
          userType: null,
          adminPublicId: "admin_public_123",
          adminRoles: ["super_admin"],
        },
      },
    });
    expect(createdSessions).toEqual([
      {
        authUserId: "auth_admin_123",
        expiresAt: new Date("2026-05-17T20:00:00.000Z"),
      },
    ]);
  });
});

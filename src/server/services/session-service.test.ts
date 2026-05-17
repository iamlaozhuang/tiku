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
});

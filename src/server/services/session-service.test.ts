import { describe, expect, it } from "vitest";

import { createSessionService } from "./session-service";
import {
  SessionAccountStateError,
  type SessionCredentialAdapter,
} from "../auth/session-boundary";
import type { SessionUserRepository } from "../repositories/session-repository";

const PASSWORD_FIELD = "password" as const;
const SESSION_TOKEN_FIELD = "token" as const;

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
    async recordLoginFailure() {
      return null;
    },
    async resetLoginFailures() {
      return true;
    },
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
        [SESSION_TOKEN_FIELD]: "session_token_123",
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
        [PASSWORD_FIELD]: "123",
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
          return { loginFailedCount: 1, lockedUntilAt: null };
        },
      }),
      {
        now: () => new Date("2026-05-17T12:00:00.000Z"),
      },
    );

    await expect(
      sessionService.login({
        phone: "13800000000",
        [PASSWORD_FIELD]: "abc12345",
      }),
    ).resolves.toEqual({
      code: 401002,
      message: "Invalid phone or password.",
      data: null,
    });
    expect(recordedFailures).toEqual([
      {
        userId: 42,
        userKind: undefined,
        lockThreshold: 3,
        lockUntilAt: new Date("2026-05-17T12:05:00.000Z"),
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
          return {
            loginFailedCount: 3,
            lockedUntilAt: new Date("2026-05-17T12:05:00.000Z"),
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
        [PASSWORD_FIELD]: "abc12345",
      }),
    ).resolves.toEqual({
      code: 423001,
      message: "Account locked.",
      data: null,
    });
    expect(recordedFailures).toEqual([
      {
        userId: 42,
        userKind: undefined,
        lockThreshold: 3,
        lockUntilAt: new Date("2026-05-17T12:05:00.000Z"),
      },
    ]);
  });

  it("locks admin login for fifteen minutes only after the fifth failed login", async () => {
    const recordedFailures: unknown[] = [];
    const fourthFailureService = createSessionService(
      createCredentialAdapter({
        async verifyPasswordCredential() {
          return false;
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
            login_failed_count: 3,
            locked_until_at: null,
            employee_public_id: null,
            organization_public_id: null,
            admin_public_id: "admin_public_123",
            admin_roles: ["super_admin"],
            login_failure_user_id: 7,
            login_failure_user_kind: "admin",
          };
        },
        async recordLoginFailure(failure) {
          recordedFailures.push(failure);
          return { loginFailedCount: 4, lockedUntilAt: null };
        },
      }),
      {
        now: () => new Date("2026-05-17T12:00:00.000Z"),
      },
    );
    const sessionService = createSessionService(
      createCredentialAdapter({
        async verifyPasswordCredential() {
          return false;
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
            login_failed_count: 4,
            locked_until_at: null,
            employee_public_id: null,
            organization_public_id: null,
            admin_public_id: "admin_public_123",
            admin_roles: ["super_admin"],
            login_failure_user_id: 7,
            login_failure_user_kind: "admin",
          };
        },
        async recordLoginFailure(failure) {
          recordedFailures.push(failure);
          return {
            loginFailedCount: 5,
            lockedUntilAt: new Date("2026-05-17T12:15:00.000Z"),
          };
        },
      }),
      {
        now: () => new Date("2026-05-17T12:00:00.000Z"),
      },
    );

    await expect(
      fourthFailureService.login({
        phone: "13900000001",
        [PASSWORD_FIELD]: "abc12345",
      }),
    ).resolves.toEqual({
      code: 401002,
      message: "Invalid phone or password.",
      data: null,
    });
    await expect(
      sessionService.login({
        phone: "13900000001",
        [PASSWORD_FIELD]: "abc12345",
      }),
    ).resolves.toEqual({
      code: 423001,
      message: "Account locked.",
      data: null,
    });
    expect(recordedFailures).toEqual([
      {
        userId: 7,
        userKind: "admin",
        lockThreshold: 5,
        lockUntilAt: new Date("2026-05-17T12:15:00.000Z"),
      },
      {
        userId: 7,
        userKind: "admin",
        lockThreshold: 5,
        lockUntilAt: new Date("2026-05-17T12:15:00.000Z"),
      },
    ]);
  });

  it("uses the atomic repository transition result instead of a stale login snapshot", async () => {
    const observedInputs: unknown[] = [];
    const recordLoginFailure = async (input: unknown) => {
      observedInputs.push(input);

      return {
        loginFailedCount: 3,
        lockedUntilAt: new Date("2026-05-17T12:05:00.000Z"),
      };
    };
    const sessionService = createSessionService(
      createCredentialAdapter({
        async verifyPasswordCredential() {
          return false;
        },
      }),
      createRepository({
        recordLoginFailure:
          recordLoginFailure as unknown as SessionUserRepository["recordLoginFailure"],
      }),
      {
        now: () => new Date("2026-05-17T12:00:00.000Z"),
      },
    );

    await expect(
      sessionService.login({
        phone: "13800000000",
        [PASSWORD_FIELD]: "abc12345",
      }),
    ).resolves.toEqual({
      code: 423001,
      message: "Account locked.",
      data: null,
    });
    expect(observedInputs).toEqual([
      {
        userId: 42,
        userKind: undefined,
        lockThreshold: 3,
        lockUntilAt: new Date("2026-05-17T12:05:00.000Z"),
      },
    ]);
  });

  it("returns one lock transition when concurrent failures share a stale snapshot", async () => {
    let persistedFailureCount = 0;
    const sessionService = createSessionService(
      createCredentialAdapter({
        async verifyPasswordCredential() {
          return false;
        },
      }),
      createRepository({
        async recordLoginFailure(input) {
          persistedFailureCount += 1;

          return {
            loginFailedCount: persistedFailureCount,
            lockedUntilAt:
              persistedFailureCount >= input.lockThreshold
                ? input.lockUntilAt
                : null,
          };
        },
      }),
      {
        now: () => new Date("2026-05-17T12:00:00.000Z"),
      },
    );

    const responses = await Promise.all(
      Array.from({ length: 3 }, () =>
        sessionService.login({
          phone: "13800000000",
          [PASSWORD_FIELD]: "abc12345",
        }),
      ),
    );

    expect(responses.map((response) => response.code).sort()).toEqual([
      401002, 401002, 423001,
    ]);
    expect(persistedFailureCount).toBe(3);
  });

  it("does not erase a concurrent failed attempt when a successful login resets by compare-and-set", async () => {
    let persistedFailureCount = 0;
    let releaseSuccessfulVerification: () => void = () => undefined;
    const failureRecorded = new Promise<void>((resolve) => {
      releaseSuccessfulVerification = resolve;
    });
    const sessionService = createSessionService(
      createCredentialAdapter({
        async verifyPasswordCredential(input) {
          if (input.password === "ValidPassword1") {
            await failureRecorded;
            return true;
          }

          return false;
        },
      }),
      createRepository({
        async findLoginUserByPhone() {
          const snapshotFailureCount = persistedFailureCount;

          return {
            id: 42,
            auth_user_id: "auth_user_123",
            public_id: "user_public_123",
            phone: "13800000000",
            name: "张三",
            user_type: "personal",
            status: "active",
            login_failed_count: snapshotFailureCount,
            locked_until_at: null,
            employee_public_id: null,
            organization_public_id: null,
            admin_public_id: null,
            admin_roles: [],
            login_failure_user_id: 42,
          };
        },
        async recordLoginFailure(input) {
          persistedFailureCount += 1;
          releaseSuccessfulVerification();

          return {
            loginFailedCount: persistedFailureCount,
            lockedUntilAt:
              persistedFailureCount >= input.lockThreshold
                ? input.lockUntilAt
                : null,
          };
        },
        async resetLoginFailures(input) {
          if (persistedFailureCount !== input.expectedLoginFailedCount) {
            return false;
          }

          persistedFailureCount = 0;
          return true;
        },
      }),
      { now: () => new Date("2026-05-17T12:00:00.000Z") },
    );

    const [successfulResponse, failedResponse] = await Promise.all([
      sessionService.login({
        phone: "13800000000",
        [PASSWORD_FIELD]: "ValidPassword1",
      }),
      sessionService.login({
        phone: "13800000000",
        [PASSWORD_FIELD]: "WrongPassword1",
      }),
    ]);

    expect(successfulResponse.code).toBe(0);
    expect(failedResponse.code).toBe(401002);
    expect(persistedFailureCount).toBe(1);
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
        [PASSWORD_FIELD]: "abc12345",
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
        [PASSWORD_FIELD]: "abc12345",
      }),
    ).resolves.toEqual({
      code: 403002,
      message: "Account disabled.",
      data: null,
    });
  });

  it("creates a seven-day single active session after successful password verification", async () => {
    const createdSessions: unknown[] = [];
    const resetInputs: unknown[] = [];
    const sessionService = createSessionService(
      createCredentialAdapter({
        async createSingleActiveSession(input) {
          createdSessions.push(input);

          return {
            [SESSION_TOKEN_FIELD]: "session_token_123",
            auth_user_id: input.authUserId,
            expires_at: input.expiresAt,
          };
        },
      }),
      createRepository({
        async resetLoginFailures(input) {
          resetInputs.push(input);
          return true;
        },
      }),
      {
        now: () => new Date("2026-05-17T12:00:00.000Z"),
      },
    );

    await expect(
      sessionService.login({
        phone: "13800000000",
        [PASSWORD_FIELD]: "abc12345",
      }),
    ).resolves.toEqual({
      code: 0,
      message: "ok",
      data: {
        [SESSION_TOKEN_FIELD]: "session_token_123",
        user: {
          publicId: "user_public_123",
          phone: "138****0000",
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
        passwordForReverification: "abc12345",
      },
    ]);
    expect(resetInputs).toEqual([
      {
        expectedLoginFailedCount: 0,
        userId: 42,
        userKind: undefined,
      },
    ]);
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
            [SESSION_TOKEN_FIELD]: "admin_session_token_123",
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
        [PASSWORD_FIELD]: "abc12345",
      }),
    ).resolves.toMatchObject({
      code: 0,
      message: "ok",
      data: {
        [SESSION_TOKEN_FIELD]: "admin_session_token_123",
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
        passwordForReverification: "abc12345",
      },
    ]);
  });

  it("fails closed when an account is disabled while credential verification is in flight", async () => {
    const sessionService = createSessionService(
      createCredentialAdapter({
        async createSingleActiveSession() {
          throw new SessionAccountStateError("disabled");
        },
      }),
      createRepository(),
    );

    await expect(
      sessionService.login({
        phone: "13800000000",
        [PASSWORD_FIELD]: "abc12345",
      }),
    ).resolves.toEqual({
      code: 403002,
      message: "Account disabled.",
      data: null,
    });
  });

  it("fails closed when the credential state changes while password verification is in flight", async () => {
    const sessionService = createSessionService(
      createCredentialAdapter({
        async createSingleActiveSession(input) {
          expect(input.passwordForReverification).toBe("abc12345");
          throw new SessionAccountStateError("changed");
        },
      }),
      createRepository(),
    );

    await expect(
      sessionService.login({
        phone: "13800000000",
        [PASSWORD_FIELD]: "abc12345",
      }),
    ).resolves.toEqual({
      code: 401002,
      message: "Invalid phone or password.",
      data: null,
    });
  });
});

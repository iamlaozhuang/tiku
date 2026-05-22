import { describe, expect, it } from "vitest";

import {
  createLocalSessionRuntime,
  createLocalUserRegistrationRuntime,
} from "./local-session-runtime";
import type { AuthUserRepository } from "../repositories/auth-repository";
import type { SessionUserRepository } from "../repositories/session-repository";

describe("local session runtime", () => {
  it("creates an opaque single active session for a seeded student credential login", async () => {
    const verifiedCredentials: unknown[] = [];
    const resetUserIds: number[] = [];
    const runtime = createLocalSessionRuntime({
      authUserRepository: {
        async findActiveUserByAuthUserId() {
          throw new Error("current session repository should not be called");
        },
      },
      credentialAdapter: {
        async findSessionByToken() {
          throw new Error("current session adapter should not be called");
        },
        async verifyPasswordCredential(input) {
          verifiedCredentials.push({
            hash: "stored-student-password-hash",
            password: input.password,
          });

          return true;
        },
        async createSingleActiveSession(input) {
          return {
            token: "opaque-student-session-token",
            auth_user_id: input.authUserId,
            expires_at: input.expiresAt,
          };
        },
      },
      now: () => new Date("2026-05-21T12:00:00.000Z"),
      sessionUserRepository: {
        async findLoginUserByPhone() {
          return {
            id: 42,
            auth_user_id: "auth-user-dev-student",
            public_id: "user-dev-student",
            phone: "13900000002",
            name: "本地学员",
            user_type: "personal",
            status: "active",
            locked_until_at: null,
            employee_public_id: null,
            organization_public_id: null,
            admin_public_id: null,
            admin_roles: [],
            login_failed_count: 0,
            login_failure_user_id: 42,
          };
        },
        async recordLoginFailure() {
          throw new Error("login failure should not be recorded");
        },
        async resetLoginFailures(userId) {
          resetUserIds.push(userId);
        },
      },
    });

    await expect(
      runtime.login({
        phone: "13900000002",
        password: "TikuDevStudent#2026",
      }),
    ).resolves.toEqual({
      code: 0,
      message: "ok",
      data: {
        token: "opaque-student-session-token",
        user: {
          publicId: "user-dev-student",
          phone: "13900000002",
          name: "本地学员",
          userType: "personal",
          status: "active",
          lockedUntilAt: null,
          employeePublicId: null,
          organizationPublicId: null,
          adminPublicId: null,
          adminRoles: [],
        },
        session: {
          expiresAt: "2026-05-28T12:00:00.000Z",
        },
      },
    });
    expect(verifiedCredentials).toEqual([
      {
        hash: "stored-student-password-hash",
        password: "TikuDevStudent#2026",
      },
    ]);
    expect(resetUserIds).toEqual([42]);
  });

  it("creates a personal user registration without exposing credential internals", async () => {
    const createdCredentials: unknown[] = [];
    const createdUsers: unknown[] = [];
    const runtime = createLocalUserRegistrationRuntime({
      credentialAdapter: {
        async createPasswordCredential(input) {
          createdCredentials.push(input);

          return {
            authUserId: "auth-user-registered-student",
          };
        },
      },
      userRegistrationRepository: {
        async findRegisteredUserByPhone() {
          return null;
        },
        async createPersonalUser(input) {
          createdUsers.push(input);

          return {
            id: 99,
            auth_user_id: input.authUserId,
            public_id: "user-registered-student",
            phone: input.phone,
            name: input.name,
            user_type: "personal",
            status: "active",
            locked_until_at: null,
            employee_public_id: null,
            organization_public_id: null,
            admin_public_id: null,
            admin_roles: [],
          };
        },
      },
    });

    const response = await runtime.registerPersonalUser({
      phone: "13900000003",
      password: "abc12345",
      name: "新学员",
    });

    expect(response).toEqual({
      code: 0,
      message: "ok",
      data: {
        user: {
          publicId: "user-registered-student",
          phone: "13900000003",
          name: "新学员",
          userType: "personal",
          status: "active",
          lockedUntilAt: null,
          employeePublicId: null,
          organizationPublicId: null,
          adminPublicId: null,
          adminRoles: [],
        },
        nextAction: "redeem_code",
      },
    });
    expect(createdCredentials).toEqual([
      {
        phone: "13900000003",
        password: "abc12345",
      },
    ]);
    expect(createdUsers).toEqual([
      {
        authUserId: "auth-user-registered-student",
        phone: "13900000003",
        name: "新学员",
      },
    ]);
    expect(JSON.stringify(response)).not.toContain("abc12345");
    expect(JSON.stringify(response)).not.toContain("auth-user-registered");
  });

  it("resolves a seeded admin session without returning the session token", async () => {
    const runtime = createLocalSessionRuntime({
      authUserRepository: {
        async findActiveUserByAuthUserId(authUserId) {
          return {
            id: 7,
            auth_user_id: authUserId,
            public_id: "admin-dev-super-admin",
            phone: "13900000001",
            name: "本地超级管理员",
            user_type: null,
            status: "active",
            locked_until_at: null,
            employee_public_id: null,
            organization_public_id: null,
            admin_public_id: "admin-dev-super-admin",
            admin_roles: ["super_admin"],
          };
        },
      } satisfies AuthUserRepository,
      credentialAdapter: {
        async findSessionByToken() {
          return {
            token: "opaque-admin-session-token",
            auth_user_id: "auth-user-dev-super-admin",
            expires_at: new Date("2026-05-28T12:00:00.000Z"),
          };
        },
        async verifyPasswordCredential() {
          throw new Error("login adapter should not be called");
        },
        async createSingleActiveSession() {
          throw new Error("login adapter should not create session");
        },
      },
      now: () => new Date("2026-05-21T12:00:00.000Z"),
      sessionUserRepository: {
        async findLoginUserByPhone() {
          throw new Error("login repository should not be called");
        },
        async recordLoginFailure() {
          throw new Error("login repository should not record failure");
        },
        async resetLoginFailures() {
          throw new Error("login repository should not reset failure");
        },
      } satisfies SessionUserRepository,
    });

    const response = await runtime.getCurrentSession({
      authorization: "Bearer opaque-admin-session-token",
    });

    expect(response).toEqual({
      code: 0,
      message: "ok",
      data: {
        user: {
          publicId: "admin-dev-super-admin",
          phone: "13900000001",
          name: "本地超级管理员",
          userType: null,
          status: "active",
          lockedUntilAt: null,
          employeePublicId: null,
          organizationPublicId: null,
          adminPublicId: "admin-dev-super-admin",
          adminRoles: ["super_admin"],
        },
        session: {
          expiresAt: "2026-05-28T12:00:00.000Z",
        },
      },
    });
    expect(response.data?.session).not.toHaveProperty("token");
  });
});

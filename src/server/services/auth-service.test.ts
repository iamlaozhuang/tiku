import { describe, expect, it } from "vitest";

import { createAuthService } from "./auth-service";
import type { AuthAdapterBoundary } from "../auth/auth-boundary";
import type { AuthUserRepository } from "../repositories/auth-repository";

const SESSION_TOKEN_FIELD = "token" as const;

describe("auth service", () => {
  it("returns a standard unauthorized response without calling adapters when the bearer token is missing", async () => {
    const requestedTokens: string[] = [];
    const authAdapter = {
      async findSessionByToken(token) {
        requestedTokens.push(token);
        return null;
      },
    } satisfies AuthAdapterBoundary;
    const authUserRepository = {
      async findActiveUserByAuthUserId() {
        throw new Error("repository should not be called");
      },
    } satisfies AuthUserRepository;
    const authService = createAuthService(authAdapter, authUserRepository);

    await expect(authService.getCurrentAuthContext({})).resolves.toEqual({
      code: 401001,
      message: "Unauthorized.",
      data: null,
    });
    expect(requestedTokens).toEqual([]);
  });

  it("rejects expired adapter sessions before querying the Tiku user repository", async () => {
    const authAdapter = {
      async findSessionByToken() {
        return {
          [SESSION_TOKEN_FIELD]: "session_token_123",
          auth_user_id: "auth_user_123",
          expires_at: new Date("2026-05-10T12:00:00.000Z"),
        };
      },
    } satisfies AuthAdapterBoundary;
    const authUserRepository = {
      async findActiveUserByAuthUserId() {
        throw new Error("repository should not be called for expired sessions");
      },
    } satisfies AuthUserRepository;
    const authService = createAuthService(authAdapter, authUserRepository, {
      now: () => new Date("2026-05-17T12:00:00.000Z"),
    });

    await expect(
      authService.getCurrentAuthContext({
        authorization: "Bearer session_token_123",
      }),
    ).resolves.toEqual({
      code: 401001,
      message: "Unauthorized.",
      data: null,
    });
  });

  it("maps a valid adapter session and active Tiku user into the standard response envelope", async () => {
    const requestedAuthUserIds: string[] = [];
    const authAdapter = {
      async findSessionByToken() {
        return {
          [SESSION_TOKEN_FIELD]: "session_token_123",
          auth_user_id: "auth_user_123",
          expires_at: new Date("2026-05-24T12:00:00.000Z"),
        };
      },
    } satisfies AuthAdapterBoundary;
    const authUserRepository = {
      async findActiveUserByAuthUserId(authUserId) {
        requestedAuthUserIds.push(authUserId);

        return {
          id: 42,
          auth_user_id: authUserId,
          public_id: "user_public_123",
          phone: "13800000000",
          name: "张三",
          user_type: "employee",
          status: "active",
          locked_until_at: null,
          employee_public_id: "employee_public_123",
          organization_public_id: "organization_public_123",
        };
      },
    } satisfies AuthUserRepository;
    const authService = createAuthService(authAdapter, authUserRepository, {
      now: () => new Date("2026-05-17T12:00:00.000Z"),
    });

    await expect(
      authService.getCurrentAuthContext({
        authorization: "Bearer session_token_123",
      }),
    ).resolves.toEqual({
      code: 0,
      message: "ok",
      data: {
        user: {
          publicId: "user_public_123",
          phone: "138****0000",
          name: "张三",
          userType: "employee",
          status: "active",
          lockedUntilAt: null,
          employeePublicId: "employee_public_123",
          organizationPublicId: "organization_public_123",
          adminPublicId: null,
          adminRoles: [],
        },
        session: {
          expiresAt: "2026-05-24T12:00:00.000Z",
        },
      },
    });
    expect(requestedAuthUserIds).toEqual(["auth_user_123"]);
  });
});

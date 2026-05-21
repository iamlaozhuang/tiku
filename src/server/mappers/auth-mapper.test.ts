import { describe, expect, it } from "vitest";

import { mapAuthContextToApi } from "./auth-mapper";

describe("mapAuthContextToApi", () => {
  it("maps auth context to camelCase DTOs without exposing internal ids", () => {
    const mappedAuthContext = mapAuthContextToApi({
      session: {
        token: "session_token_123",
        auth_user_id: "auth_user_123",
        expires_at: new Date("2026-05-24T12:00:00.000Z"),
      },
      user: {
        id: 42,
        auth_user_id: "auth_user_123",
        public_id: "user_public_123",
        phone: "13800000000",
        name: "张三",
        user_type: "employee",
        status: "active",
        locked_until_at: null,
        employee_public_id: "employee_public_123",
        organization_public_id: "organization_public_123",
      },
    });

    expect(mappedAuthContext).toEqual({
      user: {
        publicId: "user_public_123",
        phone: "13800000000",
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
    });
    expect(mappedAuthContext.user).not.toHaveProperty("id");
    expect(mappedAuthContext.user).not.toHaveProperty("authUserId");
    expect(mappedAuthContext.session).not.toHaveProperty("token");
  });
});

import { describe, expect, it } from "vitest";

import { createSessionRouteHandlers } from "./session-route";
import type { ApiResponse } from "../contracts/api-response";
import type { AuthRequestInput } from "../services/auth-service";
import { createSessionLogoutService } from "../services/session-logout-service";
import type { SessionService } from "../services/session-service";

const sessionCredentialField = "token";
const credentialFieldName = "password";

describe("session route handlers", () => {
  it("passes login request JSON to the session service and returns the standard response", async () => {
    const sessionService = {
      async login(input) {
        const loginInput = input as { phone: string };

        return {
          code: 0,
          message: "ok",
          data: {
            [sessionCredentialField]: `token_for_${loginInput.phone}`,
            user: {
              publicId: "user_public_123",
              phone: loginInput.phone,
              name: "张三",
              userType: "personal",
              status: "active",
              lockedUntilAt: null,
              employeePublicId: null,
              organizationPublicId: null,
            },
            session: {
              expiresAt: "2026-06-22T12:00:00.000Z",
            },
          },
        };
      },
      async getCurrentSession() {
        throw new Error("current session should not be called");
      },
    } satisfies SessionService;
    const { POST } = createSessionRouteHandlers(sessionService);

    const response = await POST(
      new Request("http://localhost/api/v1/sessions", {
        method: "POST",
        body: JSON.stringify({
          phone: "13800000000",
          [credentialFieldName]: "abc12345",
        }),
      }),
    );

    await expect(response.json()).resolves.toEqual({
      code: 0,
      message: "ok",
      data: {
        [sessionCredentialField]: "token_for_13800000000",
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
          expiresAt: "2026-06-22T12:00:00.000Z",
        },
      },
    });
    const sessionCookie = response.headers.get("set-cookie");

    expect(sessionCookie).toContain("tiku_session=token_for_13800000000");
    expect(sessionCookie).toContain("HttpOnly");
    expect(sessionCookie).toContain("SameSite=Lax");
    expect(sessionCookie).toContain("Path=/");
    expect(sessionCookie).toContain("Expires=Mon, 22 Jun 2026 12:00:00 GMT");
    expect(sessionCookie).not.toContain("Secure");
  });

  it("marks the login session cookie as secure for HTTPS requests", async () => {
    const sessionService = {
      async login() {
        return {
          code: 0,
          message: "ok",
          data: {
            [sessionCredentialField]: "secure_cookie_token",
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
              expiresAt: "2026-06-22T12:00:00.000Z",
            },
          },
        };
      },
      async getCurrentSession() {
        throw new Error("current session should not be called");
      },
    } satisfies SessionService;
    const { POST } = createSessionRouteHandlers(sessionService);

    const response = await POST(
      new Request("https://tiku.local/api/v1/sessions", {
        method: "POST",
        body: JSON.stringify({
          phone: "13800000000",
          [credentialFieldName]: "abc12345",
        }),
      }),
    );

    const sessionCookie = response.headers.get("set-cookie");

    expect(sessionCookie).toContain("HttpOnly");
    expect(sessionCookie).toContain("SameSite=Lax");
    expect(sessionCookie).toContain("Path=/");
    expect(sessionCookie).toContain("Secure");
  });

  it("passes the authorization header to current session lookup", async () => {
    const sessionService = {
      async login() {
        throw new Error("login should not be called");
      },
      async getCurrentSession(input) {
        return {
          code: input.authorization === "Bearer session_token_123" ? 0 : 401001,
          message: "ok",
          data: null,
        };
      },
    } satisfies SessionService;
    const { GET } = createSessionRouteHandlers(sessionService);

    const response = await GET(
      new Request("http://localhost/api/v1/sessions", {
        headers: {
          authorization: "Bearer session_token_123",
        },
      }),
    );

    await expect(response.json()).resolves.toEqual({
      code: 0,
      message: "ok",
      data: null,
    });
  });

  it("uses the session cookie when current session lookup has no authorization header", async () => {
    let observedAuthorization: string | null = null;
    const sessionService = {
      async login() {
        throw new Error("login should not be called");
      },
      async getCurrentSession(input) {
        observedAuthorization = input.authorization ?? null;

        return {
          code: input.authorization === "Bearer session_token_123" ? 0 : 401001,
          message: "ok",
          data: null,
        };
      },
    } satisfies SessionService;
    const { GET } = createSessionRouteHandlers(sessionService);

    const response = await GET(
      new Request("http://localhost/api/v1/sessions", {
        headers: {
          cookie: "theme=light; tiku_session=session_token_123",
        },
      }),
    );

    expect(observedAuthorization).toBe("Bearer session_token_123");
    await expect(response.json()).resolves.toEqual({
      code: 0,
      message: "ok",
      data: null,
    });
  });

  it("deletes the current server session and expires the session cookie on logout", async () => {
    let observedAuthorization: string | null = null;
    const sessionService = {
      async login() {
        throw new Error("login should not be called");
      },
      async getCurrentSession() {
        throw new Error("current session should not be called");
      },
      async logout(input: AuthRequestInput): Promise<ApiResponse<null>> {
        observedAuthorization = input.authorization ?? null;

        return {
          code: 0,
          message: "ok",
          data: null,
        };
      },
    } satisfies SessionService & {
      logout(input: AuthRequestInput): Promise<ApiResponse<null>>;
    };
    const { DELETE } = createSessionRouteHandlers(sessionService);

    const response = await DELETE(
      new Request("http://localhost/api/v1/sessions", {
        method: "DELETE",
        headers: {
          cookie: "theme=light; tiku_session=session_token_123",
        },
      }),
    );

    expect(observedAuthorization).toBe("Bearer session_token_123");
    await expect(response.json()).resolves.toEqual({
      code: 0,
      message: "ok",
      data: null,
    });

    const expiredSessionCookie = response.headers.get("set-cookie");

    expect(expiredSessionCookie).toContain("tiku_session=");
    expect(expiredSessionCookie).toContain("HttpOnly");
    expect(expiredSessionCookie).toContain("SameSite=Lax");
    expect(expiredSessionCookie).toContain("Path=/");
    expect(expiredSessionCookie).toContain(
      "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
    );
  });

  it("normalizes the logout authorization header before deleting the repository session", async () => {
    let deletedSessionCredential: string | null = null;
    const sessionLogoutService = createSessionLogoutService({
      async deleteSessionByCredential(sessionCredential) {
        deletedSessionCredential = sessionCredential;
      },
    });

    await expect(
      sessionLogoutService.logout({
        authorization: "Bearer session_token_123",
      }),
    ).resolves.toEqual({
      code: 0,
      message: "ok",
      data: null,
    });
    expect(deletedSessionCredential).toBe("session_token_123");
  });
});

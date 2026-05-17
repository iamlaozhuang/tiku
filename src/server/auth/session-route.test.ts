import { describe, expect, it } from "vitest";

import { createSessionRouteHandlers } from "./session-route";
import type { SessionService } from "../services/session-service";

describe("session route handlers", () => {
  it("passes login request JSON to the session service and returns the standard response", async () => {
    const sessionService = {
      async login(input) {
        const loginInput = input as { phone: string };

        return {
          code: 0,
          message: "ok",
          data: {
            token: `token_for_${loginInput.phone}`,
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
              expiresAt: "2026-05-24T12:00:00.000Z",
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
          password: "abc12345",
        }),
      }),
    );

    await expect(response.json()).resolves.toEqual({
      code: 0,
      message: "ok",
      data: {
        token: "token_for_13800000000",
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
});

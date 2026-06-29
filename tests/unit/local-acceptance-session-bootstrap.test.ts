import { describe, expect, it } from "vitest";

import {
  COOKIE_BACKED_SESSION_AUTHORIZATION,
  getRequestAuthorization,
} from "@/server/auth/session-cookie";
import { createLocalSessionRuntime } from "@/server/auth/local-session-runtime";
import {
  createLocalAcceptanceSessionRouteHandlers,
  createLocalAcceptanceSessionService,
} from "@/server/services/local-acceptance-session-service";

function createUnusedCredentialAdapter() {
  return {
    async verifyPasswordCredential() {
      return false;
    },
    async createSingleActiveSession() {
      throw new Error(
        "password login is not used by local acceptance bootstrap",
      );
    },
    async findSessionByToken() {
      return null;
    },
  };
}

function createUnusedAuthUserRepository() {
  return {
    async findActiveUserByAuthUserId() {
      return null;
    },
  };
}

describe("local acceptance session bootstrap", () => {
  it("creates a content_admin cookie-backed session without exposing the token in the response body", async () => {
    const now = new Date("2026-06-28T12:00:00.000Z");
    const routeHandlers = createLocalAcceptanceSessionRouteHandlers({
      service: createLocalAcceptanceSessionService({
        createToken: () => "local-acceptance-token-content-admin",
        now: () => now,
      }),
    });
    const response = await routeHandlers.POST(
      new Request("http://localhost:3000/api/v1/local-acceptance-sessions", {
        method: "POST",
        body: JSON.stringify({ role: "content_admin" }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      code: 0,
      data: {
        role: "content_admin",
        sessionMode: "cookie",
      },
    });
    expect(JSON.stringify(body)).not.toContain(
      "local-acceptance-token-content-admin",
    );
    expect(response.headers.get("set-cookie")).toContain("tiku_session=");

    const sessionRuntime = createLocalSessionRuntime({
      authUserRepository: createUnusedAuthUserRepository(),
      credentialAdapter: createUnusedCredentialAdapter(),
      now: () => now,
    });
    const sessionResponse = await sessionRuntime.getCurrentSession({
      authorization: "Bearer local-acceptance-token-content-admin",
    });

    expect(sessionResponse.code).toBe(0);
    expect(sessionResponse.data?.user.adminRoles).toEqual(["content_admin"]);
    expect(sessionResponse.data?.user.adminPublicId).toBe(
      "local-acceptance-content-admin",
    );
  });

  it("can resolve the bootstrap session through the cookie-backed authorization marker", async () => {
    const now = new Date("2026-06-28T12:00:00.000Z");
    const routeHandlers = createLocalAcceptanceSessionRouteHandlers({
      service: createLocalAcceptanceSessionService({
        createToken: () => "local-acceptance-token-cookie",
        now: () => now,
      }),
    });
    const response = await routeHandlers.POST(
      new Request("http://127.0.0.1:3000/api/v1/local-acceptance-sessions", {
        method: "POST",
        body: JSON.stringify({ role: "content_admin" }),
      }),
    );
    const setCookie = response.headers.get("set-cookie") ?? "";
    const cookiePair = setCookie.split(";")[0];
    const authorization = getRequestAuthorization(
      new Request("http://127.0.0.1:3000/api/v1/sessions", {
        headers: {
          authorization: COOKIE_BACKED_SESSION_AUTHORIZATION,
          cookie: cookiePair,
        },
      }),
    );
    const sessionRuntime = createLocalSessionRuntime({
      authUserRepository: createUnusedAuthUserRepository(),
      credentialAdapter: createUnusedCredentialAdapter(),
      now: () => now,
    });
    const sessionResponse = await sessionRuntime.getCurrentSession({
      authorization,
    });

    expect(sessionResponse.code).toBe(0);
    expect(sessionResponse.data?.user.adminRoles).toEqual(["content_admin"]);
  });

  it("rejects non-local hosts and unsupported roles", async () => {
    const routeHandlers = createLocalAcceptanceSessionRouteHandlers({
      service: createLocalAcceptanceSessionService({
        createToken: () => "unused-local-acceptance-token",
        now: () => new Date("2026-06-28T12:00:00.000Z"),
      }),
    });
    const remoteHostResponse = await routeHandlers.POST(
      new Request("http://example.com/api/v1/local-acceptance-sessions", {
        method: "POST",
        body: JSON.stringify({ role: "content_admin" }),
      }),
    );
    const invalidRoleResponse = await routeHandlers.POST(
      new Request("http://localhost:3000/api/v1/local-acceptance-sessions", {
        method: "POST",
        body: JSON.stringify({ role: "ops_admin" }),
      }),
    );

    expect(remoteHostResponse.status).toBe(403);
    expect(await remoteHostResponse.json()).toMatchObject({
      code: 403901,
      data: null,
    });
    expect(invalidRoleResponse.status).toBe(400);
    expect(await invalidRoleResponse.json()).toMatchObject({
      code: 400001,
      data: null,
    });
  });
});

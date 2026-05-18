import { describe, expect, it } from "vitest";

import { createEffectiveAuthorizationRouteHandlers } from "./effective-authorization-route";
import type { EffectiveAuthorizationService } from "./effective-authorization-service";

function createService(): EffectiveAuthorizationService {
  return {
    async listEffectiveAuthorizations(userContext) {
      return {
        code: 0,
        message: "ok",
        data: {
          authorizations: [
            {
              publicId: `${userContext.userPublicId}_personal_auth_123`,
              authorizationType: "personal_auth",
              profession: "monopoly",
              level: 3,
              startsAt: "2026-05-01T04:00:00.000Z",
              expiresAt: "2026-06-18T04:00:00.000Z",
              status: "active",
              organizationPublicId: null,
              organizationName: null,
            },
          ],
          effectiveAuthorizations: [
            {
              profession: "monopoly",
              level: 3,
              authorizationTypes: ["personal_auth"],
              expiresAt: "2026-06-18T04:00:00.000Z",
              status: "active",
            },
          ],
        },
      };
    },
  };
}

describe("effective authorization route handlers", () => {
  it("returns current user effective authorization list", async () => {
    const { GET } = createEffectiveAuthorizationRouteHandlers(
      createService(),
      async () => ({
        userPublicId: "user_public_123",
      }),
    );

    const response = await GET(
      new Request("http://localhost/api/v1/authorizations", {
        method: "GET",
      }),
    );

    await expect(response.json()).resolves.toEqual({
      code: 0,
      message: "ok",
      data: {
        authorizations: [
          {
            publicId: "user_public_123_personal_auth_123",
            authorizationType: "personal_auth",
            profession: "monopoly",
            level: 3,
            startsAt: "2026-05-01T04:00:00.000Z",
            expiresAt: "2026-06-18T04:00:00.000Z",
            status: "active",
            organizationPublicId: null,
            organizationName: null,
          },
        ],
        effectiveAuthorizations: [
          {
            profession: "monopoly",
            level: 3,
            authorizationTypes: ["personal_auth"],
            expiresAt: "2026-06-18T04:00:00.000Z",
            status: "active",
          },
        ],
      },
    });
  });

  it("returns standard unauthorized response when user context is missing", async () => {
    const { GET } = createEffectiveAuthorizationRouteHandlers(
      createService(),
      async () => null,
    );

    const response = await GET(
      new Request("http://localhost/api/v1/authorizations", {
        method: "GET",
      }),
    );

    await expect(response.json()).resolves.toEqual({
      code: 401001,
      message: "User session is required.",
      data: null,
    });
  });
});

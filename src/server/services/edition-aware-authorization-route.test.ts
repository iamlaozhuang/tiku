import { describe, expect, it } from "vitest";

import {
  createEditionAwareAuthorizationRouteHandlers,
  type EditionAwareAuthorizationRouteService,
} from "./edition-aware-authorization-route";
import type { EditionAwareAuthorizationQuery } from "../validators/edition-aware-authorization";

function createService(
  capturedQueries: EditionAwareAuthorizationQuery[],
): EditionAwareAuthorizationRouteService {
  return {
    async listAuthorizationContexts(userContext, query) {
      capturedQueries.push(query);

      return {
        code: 0,
        message: "ok",
        data: {
          authorizationContexts: [
            {
              authorizationSource: query.authorizationSource ?? "personal_auth",
              authorizationPublicId: `${userContext.userPublicId}_personal_auth_123`,
              edition: "standard",
              effectiveEdition: query.effectiveEdition ?? "standard",
              upgradeStatus: "none",
              profession: query.profession ?? "monopoly",
              level: query.level ?? 3,
              ownerType: "personal",
              ownerPublicId: userContext.userPublicId,
              organizationPublicId: null,
              quotaOwnerType: "personal",
              quotaOwnerPublicId: userContext.userPublicId,
              expiresAt: "2026-07-18T04:00:00.000Z",
              displayStatus: "active",
            },
          ],
        },
      };
    },
  };
}

describe("edition-aware authorization route handlers", () => {
  it("passes normalized query and user context to the route service", async () => {
    const capturedQueries: EditionAwareAuthorizationQuery[] = [];
    const { GET } = createEditionAwareAuthorizationRouteHandlers(
      createService(capturedQueries),
      async () => ({
        userPublicId: "user_public_123",
      }),
    );

    const response = await GET(
      new Request(
        "http://localhost/api/v1/authorizations?profession=monopoly&level=3&authorizationSource=personal_auth&effectiveEdition=advanced",
        {
          method: "GET",
        },
      ),
    );

    expect(capturedQueries).toEqual([
      {
        profession: "monopoly",
        level: 3,
        authorizationSource: "personal_auth",
        effectiveEdition: "advanced",
      },
    ]);
    await expect(response.json()).resolves.toEqual({
      code: 0,
      message: "ok",
      data: {
        authorizationContexts: [
          {
            authorizationSource: "personal_auth",
            authorizationPublicId: "user_public_123_personal_auth_123",
            edition: "standard",
            effectiveEdition: "advanced",
            upgradeStatus: "none",
            profession: "monopoly",
            level: 3,
            ownerType: "personal",
            ownerPublicId: "user_public_123",
            organizationPublicId: null,
            quotaOwnerType: "personal",
            quotaOwnerPublicId: "user_public_123",
            expiresAt: "2026-07-18T04:00:00.000Z",
            displayStatus: "active",
          },
        ],
      },
    });
  });

  it("returns standard bad request response for invalid route filters", async () => {
    const capturedQueries: EditionAwareAuthorizationQuery[] = [];
    const { GET } = createEditionAwareAuthorizationRouteHandlers(
      createService(capturedQueries),
      async () => ({
        userPublicId: "user_public_123",
      }),
    );

    const response = await GET(
      new Request("http://localhost/api/v1/authorizations?level=0", {
        method: "GET",
      }),
    );

    expect(capturedQueries).toEqual([]);
    await expect(response.json()).resolves.toEqual({
      code: 400001,
      message: "Invalid edition-aware authorization query.",
      data: null,
    });
  });

  it("returns standard unauthorized response when user context is missing", async () => {
    const { GET } = createEditionAwareAuthorizationRouteHandlers(
      createService([]),
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

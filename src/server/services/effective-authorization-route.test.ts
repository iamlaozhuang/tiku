import { describe, expect, it } from "vitest";

import { createEffectiveAuthorizationRouteHandlers } from "./effective-authorization-route";
import type { EffectiveAuthorizationService } from "./effective-authorization-service";

const disabledCapabilities = {
  canGenerateAiQuestion: false,
  canGenerateAiPaper: false,
  canCreateOrganizationTraining: false,
  canAnswerOrganizationTraining: false,
  canViewOrganizationTrainingSummary: false,
  canManageAuthorizationQuota: false,
};

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
          authorizationContexts: [
            {
              profession: "monopoly",
              level: 3,
              contextDisplayStatus: "display_only",
              effectiveEdition: "standard",
              authorizationSource: "personal_auth",
              authorizationPublicId: `${userContext.userPublicId}_personal_auth_123`,
              ownerType: "personal",
              ownerPublicId: userContext.userPublicId,
              organizationPublicId: null,
              quotaOwnerType: "personal",
              quotaOwnerPublicId: userContext.userPublicId,
              capabilities: disabledCapabilities,
              blockedReason: null,
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
        authorizationContexts: [
          {
            profession: "monopoly",
            level: 3,
            contextDisplayStatus: "display_only",
            effectiveEdition: "standard",
            authorizationSource: "personal_auth",
            authorizationPublicId: "user_public_123_personal_auth_123",
            ownerType: "personal",
            ownerPublicId: "user_public_123",
            organizationPublicId: null,
            quotaOwnerType: "personal",
            quotaOwnerPublicId: "user_public_123",
            capabilities: disabledCapabilities,
            blockedReason: null,
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

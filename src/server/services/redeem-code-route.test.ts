import { describe, expect, it } from "vitest";

import {
  createPersonalAuthRouteHandlers,
  createRedeemCodePreviewRouteHandlers,
  createRedeemCodeRouteHandlers,
} from "./redeem-code-route";
import type { RedeemCodeAuthorizationService } from "./redeem-code-authorization-service";

function createService(): RedeemCodeAuthorizationService {
  return {
    async previewRedeemCode(input) {
      const redeemCodeInput = input as { code: string };

      return {
        code: 0,
        message: "ok",
        data: {
          redeemCodeType: "personal_advanced_activation" as const,
          profession: "monopoly" as const,
          level: 3,
          resultEdition: "advanced" as const,
          durationDay: 365,
          redeemDeadlineAt: "2026-06-18T04:00:00.000Z",
          previewVersion: `sha256:${redeemCodeInput.code.length.toString().padStart(64, "0")}`,
          upgradeTargets: [],
        },
      };
    },
    async redeemCode(input, userContext) {
      void input;
      const userPublicId = userContext.userPublicId;

      return {
        code: 0,
        message: "ok",
        data: {
          personalAuth: {
            publicId: `${userPublicId}_personal_auth_123`,
            redeemCodePublicId: "redeem_code_public_123",
            profession: "monopoly",
            level: 3,
            startsAt: "2026-05-18T04:00:00.000Z",
            expiresAt: "2027-05-18T04:00:00.000Z",
            status: "active",
          },
        },
      };
    },
    async listPersonalAuths() {
      return {
        code: 0,
        message: "ok",
        data: {
          personalAuths: [
            {
              publicId: "user_public_123_personal_auth_123",
              redeemCodePublicId: "redeem_code_public_123",
              profession: "monopoly",
              level: 3,
              startsAt: "2026-05-18T04:00:00.000Z",
              expiresAt: "2027-05-18T04:00:00.000Z",
              status: "active",
            },
          ],
        },
      };
    },
  };
}

describe("redeem code route handlers", () => {
  it("passes redeem code JSON and user context to the authorization service", async () => {
    const { POST } = createRedeemCodeRouteHandlers(
      createService(),
      async () => ({
        userPublicId: "user_public_123",
      }),
    );

    const response = await POST(
      new Request("http://localhost/api/v1/redeem-codes/redeem", {
        method: "POST",
        body: JSON.stringify({
          code: "abcd2345",
        }),
      }),
    );

    await expect(response.json()).resolves.toEqual({
      code: 0,
      message: "ok",
      data: {
        personalAuth: {
          publicId: "user_public_123_personal_auth_123",
          redeemCodePublicId: "redeem_code_public_123",
          profession: "monopoly",
          level: 3,
          startsAt: "2026-05-18T04:00:00.000Z",
          expiresAt: "2027-05-18T04:00:00.000Z",
          status: "active",
        },
      },
    });
  });

  it("passes preview JSON and user context without exposing plaintext", async () => {
    const { POST } = createRedeemCodePreviewRouteHandlers(
      createService(),
      async () => ({ userPublicId: "user_public_123" }),
    );

    const response = await POST(
      new Request("http://localhost/api/v1/redeem-codes/preview", {
        method: "POST",
        body: JSON.stringify({ code: "abcd2345" }),
      }),
    );
    const payload = await response.json();

    expect(payload).toMatchObject({
      code: 0,
      data: {
        redeemCodeType: "personal_advanced_activation",
        upgradeTargets: [],
      },
    });
    expect(JSON.stringify(payload)).not.toContain("abcd2345");
  });

  it("returns standard unauthorized response when user context is missing", async () => {
    const { POST } = createRedeemCodeRouteHandlers(
      createService(),
      async () => null,
    );

    const response = await POST(
      new Request("http://localhost/api/v1/redeem-codes/redeem", {
        method: "POST",
        body: JSON.stringify({
          code: "abcd2345",
        }),
      }),
    );

    await expect(response.json()).resolves.toEqual({
      code: 401001,
      message: "User session is required.",
      data: null,
    });
  });
});

describe("personal auth route handlers", () => {
  it("returns current user personal authorization list", async () => {
    const { GET } = createPersonalAuthRouteHandlers(
      createService(),
      async () => ({
        userPublicId: "user_public_123",
      }),
    );

    const response = await GET(
      new Request("http://localhost/api/v1/personal-auths", {
        method: "GET",
      }),
    );

    await expect(response.json()).resolves.toEqual({
      code: 0,
      message: "ok",
      data: {
        personalAuths: [
          {
            publicId: "user_public_123_personal_auth_123",
            redeemCodePublicId: "redeem_code_public_123",
            profession: "monopoly",
            level: 3,
            startsAt: "2026-05-18T04:00:00.000Z",
            expiresAt: "2027-05-18T04:00:00.000Z",
            status: "active",
          },
        ],
      },
    });
  });
});

import { describe, expect, it } from "vitest";

import {
  createPersonalAuthRouteHandlers,
  createRedeemCodeRouteHandlers,
} from "./redeem-code-route";
import type { RedeemCodeAuthorizationService } from "./redeem-code-authorization-service";

function createService(): RedeemCodeAuthorizationService {
  return {
    async redeemCode(input, userContext) {
      const redeemCodeInput = input as { code: string };
      const userPublicId = userContext.userPublicId;

      return {
        code: 0,
        message: "ok",
        data: {
          redeemCode: {
            publicId: "redeem_code_public_123",
            codeDisplay: redeemCodeInput.code.toUpperCase(),
            profession: "monopoly",
            level: 3,
            status: "used",
          },
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
        redeemCode: {
          publicId: "redeem_code_public_123",
          codeDisplay: "ABCD2345",
          profession: "monopoly",
          level: 3,
          status: "used",
        },
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

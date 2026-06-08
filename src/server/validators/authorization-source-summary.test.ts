import { describe, expect, it } from "vitest";

import { normalizeAuthorizationSourceSummaryInput } from "./authorization-source-summary";

describe("authorization source summary validator", () => {
  it("normalizes authorization source public references", () => {
    expect(
      normalizeAuthorizationSourceSummaryInput({
        userPublicId: " user_public_123 ",
        authorizationSources: [
          {
            authorizationType: "personal_auth",
            publicId: " personal_auth_public_123 ",
            profession: "monopoly",
            level: 3,
            startsAt: "2026-06-01T00:00:00.000Z",
            expiresAt: "2026-07-01T00:00:00.000Z",
            status: "active",
            organizationPublicId: " organization_public_ignored ",
            redeemCodePublicId: " redeem_code_public_123 ",
          },
        ],
      }),
    ).toEqual({
      success: true,
      value: {
        userPublicId: "user_public_123",
        authorizationSources: [
          {
            authorizationType: "personal_auth",
            publicId: "personal_auth_public_123",
            profession: "monopoly",
            level: 3,
            startsAt: new Date("2026-06-01T00:00:00.000Z"),
            expiresAt: new Date("2026-07-01T00:00:00.000Z"),
            status: "active",
            organizationPublicId: null,
            redeemCodePublicId: "redeem_code_public_123",
          },
        ],
      },
    });
  });

  it("rejects missing org_auth organization context", () => {
    expect(
      normalizeAuthorizationSourceSummaryInput({
        userPublicId: "user_public_123",
        authorizationSources: [
          {
            authorizationType: "org_auth",
            publicId: "org_auth_public_123",
            profession: "monopoly",
            level: 3,
            startsAt: "2026-06-01T00:00:00.000Z",
            expiresAt: "2026-07-01T00:00:00.000Z",
            status: "active",
            organizationPublicId: "",
            redeemCodePublicId: null,
          },
        ],
      }),
    ).toEqual({
      success: false,
      message: "Invalid authorization source summary input.",
    });
  });
});

import { describe, expect, it } from "vitest";

import { normalizeAuthorizationSourceReasonSummaryInput } from "./authorization-source-reason-summary";

describe("authorization source reason summary validator", () => {
  it("normalizes valid authorization source reason input", () => {
    expect(
      normalizeAuthorizationSourceReasonSummaryInput({
        userPublicId: " user_public_123 ",
        selectedAuthorizationPublicId: " personal_auth_public_123 ",
        authorizationSources: [
          {
            publicId: " personal_auth_public_123 ",
            authorizationType: "personal_auth",
            profession: "monopoly",
            level: 3,
            startsAt: "2026-06-01T00:00:00.000Z",
            expiresAt: "2026-07-01T00:00:00.000Z",
            status: "active",
            organizationPublicId: null,
            redeemCodePublicId: " redeem_code_public_123 ",
          },
        ],
      }),
    ).toMatchObject({
      success: true,
      value: {
        userPublicId: "user_public_123",
        selectedAuthorizationPublicId: "personal_auth_public_123",
        authorizationSources: [
          {
            publicId: "personal_auth_public_123",
            authorizationType: "personal_auth",
            redeemCodePublicId: "redeem_code_public_123",
          },
        ],
      },
    });
  });

  it("rejects invalid org_auth source references", () => {
    expect(
      normalizeAuthorizationSourceReasonSummaryInput({
        userPublicId: "user_public_123",
        selectedAuthorizationPublicId: "org_auth_public_456",
        authorizationSources: [
          {
            publicId: "org_auth_public_456",
            authorizationType: "org_auth",
            profession: "monopoly",
            level: 3,
            startsAt: "2026-06-01T00:00:00.000Z",
            expiresAt: "2026-07-01T00:00:00.000Z",
            status: "active",
            organizationPublicId: null,
          },
        ],
      }).success,
    ).toBe(false);
  });
});

import { describe, expect, it } from "vitest";

import { normalizeAuthorizationAccessReasonSummaryInput } from "./authorization-access-reason-summary";

describe("authorization access reason summary validator", () => {
  it("normalizes aggregate authorization access reason input", () => {
    expect(
      normalizeAuthorizationAccessReasonSummaryInput({
        userPublicId: " user_public_123 ",
        authorizationPublicId: " personal_auth_public_123 ",
        authorizationProfession: "monopoly",
        authorizationLevel: 3,
        startsAt: "2026-06-01T00:00:00Z",
        expiresAt: "2026-07-01T00:00:00Z",
        currentAt: "2026-06-08T00:00:00Z",
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
          },
        ],
        paperContext: null,
        mockExamContext: null,
        redeemCodePublicId: " redeem_code_public_123 ",
        auditLogPublicId: null,
        aiCallLogPublicId: null,
      }),
    ).toMatchObject({
      success: true,
      value: {
        userPublicId: "user_public_123",
        authorizationPublicId: "personal_auth_public_123",
        redeemCodePublicId: "redeem_code_public_123",
        auditLogPublicId: null,
        aiCallLogPublicId: null,
      },
    });
  });

  it("rejects inconsistent selected authorization references", () => {
    expect(
      normalizeAuthorizationAccessReasonSummaryInput({
        userPublicId: "user_public_123",
        authorizationPublicId: "org_auth_public_missing",
        authorizationProfession: "monopoly",
        authorizationLevel: 3,
        startsAt: "2026-06-01T00:00:00.000Z",
        currentAt: "2026-06-08T00:00:00.000Z",
        authorizationSources: [
          {
            publicId: "personal_auth_public_123",
            authorizationType: "personal_auth",
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

import { describe, expect, it } from "vitest";

import { normalizeAuthorizationDisplaySummaryInput } from "./authorization-display-summary";

describe("authorization display summary validator", () => {
  it("normalizes aggregate authorization display input", () => {
    expect(
      normalizeAuthorizationDisplaySummaryInput({
        userPublicId: " user_public_123 ",
        authorizationPublicId: " personal_auth_public_123 ",
        startsAt: "2026-06-01T00:00:00Z",
        expiresAt: "2026-07-01T00:00:00Z",
        currentAt: "2026-06-08T00:00:00Z",
        authorizationSources: [
          {
            publicId: " personal_auth_public_123 ",
            authorizationType: "personal_auth",
            organizationPublicId: null,
          },
        ],
        redeemCodePublicId: " redeem_code_public_123 ",
        auditLogPublicId: " audit_log_public_123 ",
        aiCallLogPublicId: " ai_call_log_public_123 ",
        paperContext: {
          publicId: " paper_public_123 ",
          profession: "monopoly",
          level: 3,
        },
        mockExamContext: null,
      }),
    ).toMatchObject({
      success: true,
      value: {
        userPublicId: "user_public_123",
        authorizationPublicId: "personal_auth_public_123",
        paperContext: {
          publicId: "paper_public_123",
          profession: "monopoly",
          level: 3,
        },
        mockExamContext: null,
      },
    });
  });

  it("rejects missing selected authorization source", () => {
    expect(
      normalizeAuthorizationDisplaySummaryInput({
        userPublicId: "user_public_123",
        authorizationPublicId: "org_auth_public_missing",
        startsAt: "2026-06-01T00:00:00.000Z",
        currentAt: "2026-06-08T00:00:00.000Z",
        authorizationSources: [
          {
            publicId: "personal_auth_public_123",
            authorizationType: "personal_auth",
            organizationPublicId: null,
          },
        ],
      }).success,
    ).toBe(false);
  });

  it("rejects invalid paper or mock_exam context", () => {
    expect(
      normalizeAuthorizationDisplaySummaryInput({
        userPublicId: "user_public_123",
        authorizationPublicId: "personal_auth_public_123",
        startsAt: "2026-06-01T00:00:00.000Z",
        currentAt: "2026-06-08T00:00:00.000Z",
        authorizationSources: [
          {
            publicId: "personal_auth_public_123",
            authorizationType: "personal_auth",
            organizationPublicId: null,
          },
        ],
        paperContext: {
          publicId: "paper_public_123",
          profession: "unknown",
          level: 3,
        },
      }).success,
    ).toBe(false);
  });
});

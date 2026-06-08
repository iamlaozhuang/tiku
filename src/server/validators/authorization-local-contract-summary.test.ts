import { describe, expect, it } from "vitest";

import { normalizeAuthorizationLocalContractSummaryInput } from "./authorization-local-contract-summary";

describe("authorization local contract summary validator", () => {
  it("normalizes aggregate authorization read-model input", () => {
    expect(
      normalizeAuthorizationLocalContractSummaryInput({
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
            organizationPublicId: null,
            redeemCodePublicId: " redeem_code_public_123 ",
          },
        ],
        scopeSummary: {
          authorizationPublicId: " personal_auth_public_123 ",
          authorizationType: "personal_auth",
          profession: "monopoly",
          level: 3,
          paperScope: {
            publicId: " paper_public_123 ",
            profession: "monopoly",
            level: 3,
          },
          mockExamScope: null,
        },
        redeemCodePublicId: " redeem_code_public_123 ",
        auditLogPublicId: " audit_log_public_123 ",
        aiCallLogPublicId: " ai_call_log_public_123 ",
      }),
    ).toMatchObject({
      success: true,
      value: {
        userPublicId: "user_public_123",
        redeemCodePublicId: "redeem_code_public_123",
        auditLogPublicId: "audit_log_public_123",
        aiCallLogPublicId: "ai_call_log_public_123",
      },
    });
  });

  it("rejects scope summary that points outside authorization sources", () => {
    expect(
      normalizeAuthorizationLocalContractSummaryInput({
        userPublicId: "user_public_123",
        authorizationSources: [
          {
            authorizationType: "personal_auth",
            publicId: "personal_auth_public_123",
            profession: "monopoly",
            level: 3,
            startsAt: "2026-06-01T00:00:00.000Z",
            expiresAt: "2026-07-01T00:00:00.000Z",
            status: "active",
            organizationPublicId: null,
            redeemCodePublicId: null,
          },
        ],
        scopeSummary: {
          authorizationPublicId: "org_auth_public_456",
          authorizationType: "org_auth",
          profession: "monopoly",
          level: 3,
          paperScope: null,
          mockExamScope: null,
        },
      }),
    ).toEqual({
      success: false,
      message: "Invalid authorization local contract summary input.",
    });
  });
});

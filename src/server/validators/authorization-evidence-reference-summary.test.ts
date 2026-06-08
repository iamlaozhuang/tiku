import { describe, expect, it } from "vitest";

import { normalizeAuthorizationEvidenceReferenceSummaryInput } from "./authorization-evidence-reference-summary";

describe("authorization evidence reference summary validator", () => {
  it("normalizes valid redacted evidence reference input", () => {
    expect(
      normalizeAuthorizationEvidenceReferenceSummaryInput({
        userPublicId: " user_public_123 ",
        authorizationPublicId: " personal_auth_public_123 ",
        redeemCodePublicId: " redeem_code_public_123 ",
        auditLogPublicId: " audit_log_public_123 ",
        aiCallLogPublicId: " ai_call_log_public_123 ",
      }),
    ).toEqual({
      success: true,
      value: {
        userPublicId: "user_public_123",
        authorizationPublicId: "personal_auth_public_123",
        redeemCodePublicId: "redeem_code_public_123",
        auditLogPublicId: "audit_log_public_123",
        aiCallLogPublicId: "ai_call_log_public_123",
      },
    });
  });

  it("normalizes missing optional evidence references as null", () => {
    expect(
      normalizeAuthorizationEvidenceReferenceSummaryInput({
        userPublicId: "user_public_123",
        authorizationPublicId: "org_auth_public_123",
      }),
    ).toMatchObject({
      success: true,
      value: {
        redeemCodePublicId: null,
        auditLogPublicId: null,
        aiCallLogPublicId: null,
      },
    });
  });

  it("rejects missing required authorization references", () => {
    expect(
      normalizeAuthorizationEvidenceReferenceSummaryInput({
        userPublicId: "",
        authorizationPublicId: "personal_auth_public_123",
      }).success,
    ).toBe(false);

    expect(
      normalizeAuthorizationEvidenceReferenceSummaryInput({
        userPublicId: "user_public_123",
        authorizationPublicId: "",
      }).success,
    ).toBe(false);
  });
});

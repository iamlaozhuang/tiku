import { describe, expect, it } from "vitest";

import { normalizeAuthorizationReasonEvidencePresentationInput } from "./authorization-reason-evidence-presentation";

describe("authorization reason evidence presentation validator", () => {
  it("normalizes optional redacted evidence public references", () => {
    expect(
      normalizeAuthorizationReasonEvidencePresentationInput({
        reasonStatus: "reason_summary_only",
        redeemCodePublicId: " redeem_code_public_123 ",
        auditLogPublicId: " audit_log_public_123 ",
        aiCallLogPublicId: null,
      }),
    ).toEqual({
      success: true,
      value: {
        reasonStatus: "reason_summary_only",
        redeemCodePublicId: "redeem_code_public_123",
        auditLogPublicId: "audit_log_public_123",
        aiCallLogPublicId: null,
      },
    });
  });

  it("rejects invalid evidence public references", () => {
    expect(
      normalizeAuthorizationReasonEvidencePresentationInput({
        reasonStatus: "reason_summary_only",
        redeemCodePublicId: 123,
        auditLogPublicId: null,
        aiCallLogPublicId: null,
      }),
    ).toEqual({
      success: false,
      message: "Invalid authorization reason evidence presentation input.",
    });
  });
});

import { describe, expect, it } from "vitest";

import { normalizeRedeemCodeReferenceInput } from "./redeem-code-reference";

describe("redeem_code reference validator", () => {
  it("normalizes redacted redeem_code reference input while ignoring secret fields", () => {
    expect(
      normalizeRedeemCodeReferenceInput({
        userPublicId: " user_public_123 ",
        authorizationPublicId: " personal_auth_public_123 ",
        redeemCodePublicId: " redeem_code_public_123 ",
        paperPublicId: " paper_public_123 ",
        mockExamPublicId: " mock_exam_public_123 ",
        auditLogPublicId: " audit_log_public_123 ",
        aiCallLogPublicId: " ai_call_log_public_123 ",
        redeemCodePlaintext: "plaintext must be ignored",
        codeHash: "code hash must be ignored",
      }),
    ).toEqual({
      success: true,
      value: {
        userPublicId: "user_public_123",
        authorizationPublicId: "personal_auth_public_123",
        redeemCodePublicId: "redeem_code_public_123",
        paperPublicId: "paper_public_123",
        mockExamPublicId: "mock_exam_public_123",
        auditLogPublicId: "audit_log_public_123",
        aiCallLogPublicId: "ai_call_log_public_123",
      },
    });
  });

  it("rejects input without a redeem_code public reference", () => {
    expect(
      normalizeRedeemCodeReferenceInput({
        userPublicId: "user_public_123",
        authorizationPublicId: "personal_auth_public_123",
        redeemCodePublicId: null,
        paperPublicId: null,
        mockExamPublicId: null,
        auditLogPublicId: null,
        aiCallLogPublicId: null,
      }),
    ).toEqual({
      success: false,
      message: "Invalid redeem_code reference input.",
    });
  });
});

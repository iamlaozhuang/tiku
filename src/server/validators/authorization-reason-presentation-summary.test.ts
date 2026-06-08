import { describe, expect, it } from "vitest";

import { normalizeAuthorizationReasonPresentationSummaryInput } from "./authorization-reason-presentation-summary";

describe("authorization reason presentation summary validator", () => {
  it("normalizes aggregate reason presentation summary input", () => {
    expect(
      normalizeAuthorizationReasonPresentationSummaryInput({
        userPublicId: " user_public_123 ",
        authorizationPublicId: " personal_auth_public_123 ",
        reasonStatus: "reason_summary_only",
        reasonCodes: [" selected_authorization_active "],
        sourceReason: {
          selectedAuthorizationPublicId: " personal_auth_public_123 ",
          sourceReasonCode: "selected_authorization_active",
        },
        contextReason: {
          paperReasonCode: "context_matches_authorization",
          mockExamReasonCode: null,
        },
        paperContextPublicId: " paper_public_123 ",
        mockExamContextPublicId: null,
        evidenceReferences: {
          redeemCodeReference: {
            publicId: " redeem_code_public_123 ",
            redactionStatus: "redacted",
            referenceStatus: "redacted_reference",
          },
          auditLogPublicId: null,
          aiCallLogPublicId: null,
          redactionStatus: "redacted",
          referenceStatus: "redacted_reference",
        },
      }),
    ).toMatchObject({
      success: true,
      value: {
        userPublicId: "user_public_123",
        authorizationPublicId: "personal_auth_public_123",
        reasonCodes: ["selected_authorization_active"],
        paperContextPublicId: "paper_public_123",
        mockExamContextPublicId: null,
      },
    });
  });

  it("rejects missing paper context public reference when paper reason is present", () => {
    expect(
      normalizeAuthorizationReasonPresentationSummaryInput({
        userPublicId: "user_public_123",
        authorizationPublicId: "personal_auth_public_123",
        reasonStatus: "reason_summary_only",
        reasonCodes: ["context_matches_authorization"],
        sourceReason: {
          selectedAuthorizationPublicId: "personal_auth_public_123",
          sourceReasonCode: "selected_authorization_active",
        },
        contextReason: {
          paperReasonCode: "context_matches_authorization",
          mockExamReasonCode: null,
        },
        paperContextPublicId: null,
        mockExamContextPublicId: null,
        evidenceReferences: {
          redeemCodeReference: {
            publicId: null,
            redactionStatus: "redacted",
            referenceStatus: "redacted_reference",
          },
          auditLogPublicId: null,
          aiCallLogPublicId: null,
          redactionStatus: "redacted",
          referenceStatus: "redacted_reference",
        },
      }),
    ).toEqual({
      success: false,
      message: "Invalid authorization reason presentation summary input.",
    });
  });
});

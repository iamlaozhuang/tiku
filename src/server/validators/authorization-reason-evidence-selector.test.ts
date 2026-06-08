import { describe, expect, it } from "vitest";

import { normalizeAuthorizationReasonEvidenceSelectorInput } from "./authorization-reason-evidence-selector";

describe("authorization reason evidence selector validator", () => {
  it("normalizes a local_view_model_only evidence model", () => {
    expect(
      normalizeAuthorizationReasonEvidenceSelectorInput({
        viewModelStatus: "local_view_model_only",
        sourceSectionStatus: "local_view_section_only",
        modelKey: "authorization.reason.view_model.evidence",
        severity: "info",
        evidenceChips: [
          {
            chipKey: "authorization.reason.view_model.evidence.redeem_code",
            evidenceType: "redeem_code",
            publicId: " redeem_code_public_123 ",
            redactionStatus: "redacted",
            referenceStatus: "redacted_reference",
            presentationKey: "authorization.reason.evidence.redeem_code",
            sortOrder: 1,
          },
        ],
      }),
    ).toMatchObject({
      success: true,
      value: {
        evidenceChips: [
          {
            publicId: "redeem_code_public_123",
          },
        ],
      },
    });
  });

  it("rejects mismatched evidence selector chip keys", () => {
    expect(
      normalizeAuthorizationReasonEvidenceSelectorInput({
        viewModelStatus: "local_view_model_only",
        sourceSectionStatus: "local_view_section_only",
        modelKey: "authorization.reason.view_model.evidence",
        severity: "info",
        evidenceChips: [
          {
            chipKey: "authorization.reason.view_model.evidence.audit_log",
            evidenceType: "redeem_code",
            publicId: "redeem_code_public_123",
            redactionStatus: "redacted",
            referenceStatus: "redacted_reference",
            presentationKey: "authorization.reason.evidence.redeem_code",
            sortOrder: 1,
          },
        ],
      }),
    ).toEqual({
      success: false,
      message: "Invalid authorization reason evidence selector input.",
    });
  });
});

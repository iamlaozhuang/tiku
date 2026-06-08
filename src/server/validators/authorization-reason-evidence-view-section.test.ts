import { describe, expect, it } from "vitest";

import { normalizeAuthorizationReasonEvidenceViewSectionInput } from "./authorization-reason-evidence-view-section";

describe("authorization reason evidence view section validator", () => {
  it("normalizes redacted evidence presentation entries", () => {
    expect(
      normalizeAuthorizationReasonEvidenceViewSectionInput({
        presentationStatus: "local_presentation_only",
        evidencePresentations: [
          {
            evidenceType: " redeem_code ",
            publicId: " redeem_code_public_123 ",
            redactionStatus: "redacted",
            referenceStatus: "redacted_reference",
            presentationKey:
              " authorization.reason.evidence.redeem_code.redacted_reference ",
          },
        ],
      }),
    ).toMatchObject({
      success: true,
      value: {
        evidencePresentations: [
          {
            evidenceType: "redeem_code",
            publicId: "redeem_code_public_123",
            redactionStatus: "redacted",
            referenceStatus: "redacted_reference",
          },
        ],
      },
    });
  });

  it("rejects non-redacted evidence presentation entries", () => {
    expect(
      normalizeAuthorizationReasonEvidenceViewSectionInput({
        presentationStatus: "local_presentation_only",
        evidencePresentations: [
          {
            evidenceType: "redeem_code",
            publicId: "redeem_code_public_123",
            redactionStatus: "plaintext",
            referenceStatus: "raw_reference",
            presentationKey: "",
          },
        ],
      }),
    ).toEqual({
      success: false,
      message: "Invalid authorization reason evidence view section input.",
    });
  });
});

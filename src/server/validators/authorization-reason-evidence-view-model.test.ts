import { describe, expect, it } from "vitest";

import { normalizeAuthorizationReasonEvidenceViewModelInput } from "./authorization-reason-evidence-view-model";

describe("authorization reason evidence view model validator", () => {
  it("normalizes redacted evidence references", () => {
    expect(
      normalizeAuthorizationReasonEvidenceViewModelInput({
        sectionStatus: "local_view_section_only",
        sectionKey: "authorization.reason.view_section.evidence",
        sectionSeverity: "info",
        evidenceItems: [
          {
            evidenceType: "ai_call_log",
            publicId: " ai_call_log_public_123 ",
            redactionStatus: "redacted",
            referenceStatus: "redacted_reference",
            presentationKey:
              "authorization.reason.evidence.ai_call_log.redacted_reference",
            sortOrder: 1,
          },
        ],
      }),
    ).toEqual({
      success: true,
      value: {
        sectionStatus: "local_view_section_only",
        sectionKey: "authorization.reason.view_section.evidence",
        sectionSeverity: "info",
        evidenceItems: [
          {
            evidenceType: "ai_call_log",
            publicId: "ai_call_log_public_123",
            redactionStatus: "redacted",
            referenceStatus: "redacted_reference",
            presentationKey:
              "authorization.reason.evidence.ai_call_log.redacted_reference",
            sortOrder: 1,
          },
        ],
      },
    });
  });

  it("rejects unsupported evidence types", () => {
    expect(
      normalizeAuthorizationReasonEvidenceViewModelInput({
        sectionStatus: "local_view_section_only",
        sectionKey: "authorization.reason.view_section.evidence",
        sectionSeverity: "info",
        evidenceItems: [
          {
            evidenceType: "payment",
            publicId: "payment_public_123",
            redactionStatus: "redacted",
            referenceStatus: "redacted_reference",
            presentationKey:
              "authorization.reason.evidence.payment.redacted_reference",
            sortOrder: 1,
          },
        ],
      }),
    ).toEqual({
      success: false,
      message: "Invalid authorization reason evidence view model input.",
    });
  });
});

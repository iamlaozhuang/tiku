import { describe, expect, it } from "vitest";

import { normalizeAuthorizationReasonContextViewSectionInput } from "./authorization-reason-context-view-section";

describe("authorization reason context view section validator", () => {
  it("normalizes paper and mock_exam context presentation entries", () => {
    expect(
      normalizeAuthorizationReasonContextViewSectionInput({
        presentationStatus: "local_presentation_only",
        paperContextPresentation: {
          contextType: "paper",
          publicId: " paper_public_123 ",
          reasonCode: " context_matches_authorization ",
          presentationKey:
            " authorization.reason.context.paper.context_matches_authorization ",
          severity: "info",
        },
        mockExamContextPresentation: null,
      }),
    ).toMatchObject({
      success: true,
      value: {
        paperContextPresentation: {
          contextType: "paper",
          publicId: "paper_public_123",
          reasonCode: "context_matches_authorization",
        },
        mockExamContextPresentation: null,
      },
    });
  });

  it("rejects invalid context presentation fields", () => {
    expect(
      normalizeAuthorizationReasonContextViewSectionInput({
        presentationStatus: "local_presentation_only",
        paperContextPresentation: {
          contextType: "mock_exam",
          publicId: "",
          reasonCode: "unknown_context_reason",
          presentationKey: "",
          severity: "unknown",
        },
        mockExamContextPresentation: null,
      }),
    ).toEqual({
      success: false,
      message: "Invalid authorization reason context view section input.",
    });
  });
});

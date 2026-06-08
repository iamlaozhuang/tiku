import { describe, expect, it } from "vitest";

import { normalizeAuthorizationReasonViewSectionSummaryInput } from "./authorization-reason-view-section-summary";

describe("authorization reason view section summary validator", () => {
  it("normalizes aggregate view section summary input", () => {
    expect(
      normalizeAuthorizationReasonViewSectionSummaryInput({
        userPublicId: " user_public_123 ",
        authorizationPublicId: " personal_auth_public_123 ",
        presentationStatus: "local_presentation_only",
        sourcePresentation: {
          selectedAuthorizationPublicId: " personal_auth_public_123 ",
          sourceReasonCode: "selected_authorization_active",
          presentationKey:
            " authorization.reason.source.selected_authorization_active ",
          severity: "info",
        },
        reasonItems: [],
        contextPresentation: {
          presentationStatus: "local_presentation_only",
          paperContextPresentation: null,
          mockExamContextPresentation: null,
        },
        evidencePresentation: {
          presentationStatus: "local_presentation_only",
          evidencePresentations: [],
        },
      }),
    ).toMatchObject({
      success: true,
      value: {
        userPublicId: "user_public_123",
        authorizationPublicId: "personal_auth_public_123",
        sourcePresentation: {
          selectedAuthorizationPublicId: "personal_auth_public_123",
        },
      },
    });
  });

  it("rejects invalid nested presentation status", () => {
    expect(
      normalizeAuthorizationReasonViewSectionSummaryInput({
        userPublicId: "user_public_123",
        authorizationPublicId: "personal_auth_public_123",
        presentationStatus: "local_presentation_only",
        sourcePresentation: {
          selectedAuthorizationPublicId: "personal_auth_public_123",
          sourceReasonCode: "selected_authorization_active",
          presentationKey:
            "authorization.reason.source.selected_authorization_active",
          severity: "info",
        },
        reasonItems: [],
        contextPresentation: {
          presentationStatus: "display_only",
          paperContextPresentation: null,
          mockExamContextPresentation: null,
        },
        evidencePresentation: {
          presentationStatus: "local_presentation_only",
          evidencePresentations: [],
        },
      }),
    ).toEqual({
      success: false,
      message: "Invalid authorization reason view section summary input.",
    });
  });
});

import { describe, expect, it } from "vitest";

import { normalizeAuthorizationReasonStatusViewSectionInput } from "./authorization-reason-status-view-section";

describe("authorization reason status view section validator", () => {
  it("normalizes local_presentation_only status section input", () => {
    expect(
      normalizeAuthorizationReasonStatusViewSectionInput({
        presentationStatus: "local_presentation_only",
        authorizationPublicId: " personal_auth_public_123 ",
        sourcePresentation: {
          selectedAuthorizationPublicId: " personal_auth_public_123 ",
          sourceReasonCode: "selected_authorization_active",
          presentationKey:
            " authorization.reason.source.selected_authorization_active ",
          severity: "info",
        },
        reasonItems: [
          {
            reasonCode: " authorization_window_within_window ",
            presentationKey:
              " authorization.reason.authorization_window_within_window ",
            severity: "info",
            sortOrder: 2,
          },
        ],
      }),
    ).toMatchObject({
      success: true,
      value: {
        authorizationPublicId: "personal_auth_public_123",
        sourcePresentation: {
          selectedAuthorizationPublicId: "personal_auth_public_123",
        },
        reasonItems: [
          {
            reasonCode: "authorization_window_within_window",
            sortOrder: 2,
          },
        ],
      },
    });
  });

  it("rejects invalid status reason item fields", () => {
    expect(
      normalizeAuthorizationReasonStatusViewSectionInput({
        presentationStatus: "local_presentation_only",
        authorizationPublicId: "personal_auth_public_123",
        sourcePresentation: {
          selectedAuthorizationPublicId: "personal_auth_public_123",
          sourceReasonCode: "selected_authorization_active",
          presentationKey:
            "authorization.reason.source.selected_authorization_active",
          severity: "info",
        },
        reasonItems: [
          {
            reasonCode: "unknown_reason",
            presentationKey: "",
            severity: "unknown",
            sortOrder: 0,
          },
        ],
      }),
    ).toEqual({
      success: false,
      message: "Invalid authorization reason status view section input.",
    });
  });
});

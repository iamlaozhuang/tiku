import { describe, expect, it } from "vitest";

import { normalizeAuthorizationReasonViewModelSummaryInput } from "./authorization-reason-view-model-summary";

function createValidInput() {
  return {
    userPublicId: " user_public_123 ",
    authorizationPublicId: " personal_auth_public_123 ",
    summaryStatus: "local_view_section_only",
    statusSection: {
      sectionStatus: "local_view_section_only",
      sectionKey: "authorization.reason.view_section.status",
      sectionSeverity: "info",
      selectedAuthorizationPublicId: "personal_auth_public_123",
      statusItems: [
        {
          itemKey: "authorization.reason.status.source",
          reasonCode: "selected_authorization_active",
          presentationKey:
            "authorization.reason.source.selected_authorization_active",
          severity: "info",
          sortOrder: 1,
        },
      ],
    },
    contextSection: {
      sectionStatus: "local_view_section_only",
      sectionKey: "authorization.reason.view_section.context",
      sectionSeverity: "info",
      contextItems: [],
    },
    evidenceSection: {
      sectionStatus: "local_view_section_only",
      sectionKey: "authorization.reason.view_section.evidence",
      sectionSeverity: "info",
      evidenceItems: [],
    },
  };
}

describe("authorization reason view model summary validator", () => {
  it("normalizes a local_view_section_only view section summary", () => {
    expect(
      normalizeAuthorizationReasonViewModelSummaryInput(createValidInput()),
    ).toMatchObject({
      success: true,
      value: {
        userPublicId: "user_public_123",
        authorizationPublicId: "personal_auth_public_123",
        summaryStatus: "local_view_section_only",
      },
    });
  });

  it("rejects mismatched selected authorization references", () => {
    expect(
      normalizeAuthorizationReasonViewModelSummaryInput({
        ...createValidInput(),
        statusSection: {
          ...createValidInput().statusSection,
          selectedAuthorizationPublicId: "org_auth_public_mismatch",
        },
      }),
    ).toEqual({
      success: false,
      message: "Invalid authorization reason view model summary input.",
    });
  });
});

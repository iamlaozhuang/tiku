import { describe, expect, it } from "vitest";

import { normalizeAuthorizationReasonSelectorSummaryInput } from "./authorization-reason-selector-summary";

function createSummaryInput() {
  return {
    userPublicId: " user_public_123 ",
    authorizationPublicId: " personal_auth_public_123 ",
    summaryStatus: "local_view_model_only",
    sourceSummaryStatus: "local_view_section_only",
    statusModel: {
      viewModelStatus: "local_view_model_only",
      sourceSectionStatus: "local_view_section_only",
      modelKey: "authorization.reason.view_model.status",
      severity: "info",
      selectedAuthorizationPublicId: "personal_auth_public_123",
      statusRows: [
        {
          rowKey: "authorization.reason.view_model.status.source",
          reasonCode: "selected_authorization_active",
          presentationKey:
            "authorization.reason.source.selected_authorization_active",
          severity: "info",
          sortOrder: 1,
        },
      ],
    },
    contextModel: {
      viewModelStatus: "local_view_model_only",
      sourceSectionStatus: "local_view_section_only",
      modelKey: "authorization.reason.view_model.context",
      severity: "info",
      contextCards: [],
    },
    evidenceModel: {
      viewModelStatus: "local_view_model_only",
      sourceSectionStatus: "local_view_section_only",
      modelKey: "authorization.reason.view_model.evidence",
      severity: "info",
      evidenceChips: [],
    },
  };
}

describe("authorization reason selector summary validator", () => {
  it("normalizes a local_view_model_only selector summary input", () => {
    expect(
      normalizeAuthorizationReasonSelectorSummaryInput(createSummaryInput()),
    ).toMatchObject({
      success: true,
      value: {
        userPublicId: "user_public_123",
        authorizationPublicId: "personal_auth_public_123",
      },
    });
  });

  it("rejects non view-model summary input", () => {
    expect(
      normalizeAuthorizationReasonSelectorSummaryInput({
        ...createSummaryInput(),
        summaryStatus: "local_view_section_only",
      }),
    ).toEqual({
      success: false,
      message: "Invalid authorization reason selector summary input.",
    });
  });
});

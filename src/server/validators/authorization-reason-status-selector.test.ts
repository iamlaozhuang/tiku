import { describe, expect, it } from "vitest";

import { normalizeAuthorizationReasonStatusSelectorInput } from "./authorization-reason-status-selector";

describe("authorization reason status selector validator", () => {
  it("normalizes a local_view_model_only status model", () => {
    expect(
      normalizeAuthorizationReasonStatusSelectorInput({
        viewModelStatus: "local_view_model_only",
        sourceSectionStatus: "local_view_section_only",
        modelKey: "authorization.reason.view_model.status",
        severity: "info",
        selectedAuthorizationPublicId: " personal_auth_public_123 ",
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
      }),
    ).toMatchObject({
      success: true,
      value: {
        selectedAuthorizationPublicId: "personal_auth_public_123",
      },
    });
  });

  it("rejects invalid status row reason codes", () => {
    expect(
      normalizeAuthorizationReasonStatusSelectorInput({
        viewModelStatus: "local_view_model_only",
        sourceSectionStatus: "local_view_section_only",
        modelKey: "authorization.reason.view_model.status",
        severity: "info",
        selectedAuthorizationPublicId: "personal_auth_public_123",
        statusRows: [
          {
            rowKey: "authorization.reason.view_model.status.source",
            reasonCode: "unknown_reason",
            presentationKey: "authorization.reason.unknown_reason",
            severity: "info",
            sortOrder: 1,
          },
        ],
      }),
    ).toEqual({
      success: false,
      message: "Invalid authorization reason status selector input.",
    });
  });
});

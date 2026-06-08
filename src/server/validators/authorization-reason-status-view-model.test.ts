import { describe, expect, it } from "vitest";

import { normalizeAuthorizationReasonStatusViewModelInput } from "./authorization-reason-status-view-model";

describe("authorization reason status view model validator", () => {
  it("normalizes a local_view_section_only status section", () => {
    expect(
      normalizeAuthorizationReasonStatusViewModelInput({
        sectionStatus: "local_view_section_only",
        sectionKey: "authorization.reason.view_section.status",
        sectionSeverity: "info",
        selectedAuthorizationPublicId: " personal_auth_public_123 ",
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
      }),
    ).toEqual({
      success: true,
      value: {
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
    });
  });

  it("rejects invalid reason codes", () => {
    expect(
      normalizeAuthorizationReasonStatusViewModelInput({
        sectionStatus: "local_view_section_only",
        sectionKey: "authorization.reason.view_section.status",
        sectionSeverity: "info",
        selectedAuthorizationPublicId: "personal_auth_public_123",
        statusItems: [
          {
            itemKey: "authorization.reason.status.source",
            reasonCode: "unknown_reason",
            presentationKey: "authorization.reason.unknown_reason",
            severity: "info",
            sortOrder: 1,
          },
        ],
      }),
    ).toEqual({
      success: false,
      message: "Invalid authorization reason status view model input.",
    });
  });
});

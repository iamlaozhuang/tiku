import { describe, expect, it } from "vitest";

import { normalizeAuthorizationReasonContextViewModelInput } from "./authorization-reason-context-view-model";

describe("authorization reason context view model validator", () => {
  it("normalizes a local_view_section_only context section", () => {
    expect(
      normalizeAuthorizationReasonContextViewModelInput({
        sectionStatus: "local_view_section_only",
        sectionKey: "authorization.reason.view_section.context",
        sectionSeverity: "attention",
        contextItems: [
          {
            contextType: "paper",
            publicId: " paper_public_123 ",
            reasonCode: "context_mismatch",
            presentationKey:
              "authorization.reason.context.paper.context_mismatch",
            severity: "attention",
            sortOrder: 1,
          },
        ],
      }),
    ).toEqual({
      success: true,
      value: {
        sectionStatus: "local_view_section_only",
        sectionKey: "authorization.reason.view_section.context",
        sectionSeverity: "attention",
        contextItems: [
          {
            contextType: "paper",
            publicId: "paper_public_123",
            reasonCode: "context_mismatch",
            presentationKey:
              "authorization.reason.context.paper.context_mismatch",
            severity: "attention",
            sortOrder: 1,
          },
        ],
      },
    });
  });

  it("rejects unsupported context types", () => {
    expect(
      normalizeAuthorizationReasonContextViewModelInput({
        sectionStatus: "local_view_section_only",
        sectionKey: "authorization.reason.view_section.context",
        sectionSeverity: "info",
        contextItems: [
          {
            contextType: "practice",
            publicId: "practice_public_123",
            reasonCode: "context_matches_authorization",
            presentationKey:
              "authorization.reason.context.practice.context_matches_authorization",
            severity: "info",
            sortOrder: 1,
          },
        ],
      }),
    ).toEqual({
      success: false,
      message: "Invalid authorization reason context view model input.",
    });
  });
});

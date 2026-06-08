import { describe, expect, it } from "vitest";

import { normalizeAuthorizationReasonContextSelectorInput } from "./authorization-reason-context-selector";

describe("authorization reason context selector validator", () => {
  it("normalizes a local_view_model_only context model", () => {
    expect(
      normalizeAuthorizationReasonContextSelectorInput({
        viewModelStatus: "local_view_model_only",
        sourceSectionStatus: "local_view_section_only",
        modelKey: "authorization.reason.view_model.context",
        severity: "info",
        contextCards: [
          {
            cardKey: "authorization.reason.view_model.context.paper",
            contextType: "paper",
            publicId: " paper_public_123 ",
            reasonCode: "context_matches_authorization",
            presentationKey:
              "authorization.reason.context_matches_authorization",
            severity: "info",
            sortOrder: 1,
          },
        ],
      }),
    ).toMatchObject({
      success: true,
      value: {
        contextCards: [
          {
            publicId: "paper_public_123",
          },
        ],
      },
    });
  });

  it("rejects mismatched context selector card keys", () => {
    expect(
      normalizeAuthorizationReasonContextSelectorInput({
        viewModelStatus: "local_view_model_only",
        sourceSectionStatus: "local_view_section_only",
        modelKey: "authorization.reason.view_model.context",
        severity: "info",
        contextCards: [
          {
            cardKey: "authorization.reason.view_model.context.mock_exam",
            contextType: "paper",
            publicId: "paper_public_123",
            reasonCode: "context_matches_authorization",
            presentationKey:
              "authorization.reason.context_matches_authorization",
            severity: "info",
            sortOrder: 1,
          },
        ],
      }),
    ).toEqual({
      success: false,
      message: "Invalid authorization reason context selector input.",
    });
  });
});

import { describe, expect, it } from "vitest";

import { buildAuthorizationReasonContextViewSectionReadModel } from "./authorization-reason-context-view-section-service";

describe("authorization reason context view section service", () => {
  it("groups paper and mock_exam presentation entries into a local_view_section_only context section", () => {
    expect(
      buildAuthorizationReasonContextViewSectionReadModel({
        id: 982,
        presentationStatus: "local_presentation_only",
        paperContextPresentation: {
          id: 983,
          contextType: "paper",
          publicId: "paper_public_123",
          reasonCode: "context_matches_authorization",
          presentationKey:
            "authorization.reason.context.paper.context_matches_authorization",
          severity: "info",
        },
        mockExamContextPresentation: {
          id: 984,
          contextType: "mock_exam",
          publicId: "mock_exam_public_123",
          reasonCode: "context_mismatch",
          presentationKey:
            "authorization.reason.context.mock_exam.context_mismatch",
          severity: "attention",
        },
      }),
    ).toEqual({
      code: 0,
      message: "ok",
      data: {
        sectionStatus: "local_view_section_only",
        sectionKey: "authorization.reason.view_section.context",
        sectionSeverity: "attention",
        contextItems: [
          {
            contextType: "paper",
            publicId: "paper_public_123",
            reasonCode: "context_matches_authorization",
            presentationKey:
              "authorization.reason.context.paper.context_matches_authorization",
            severity: "info",
            sortOrder: 1,
          },
          {
            contextType: "mock_exam",
            publicId: "mock_exam_public_123",
            reasonCode: "context_mismatch",
            presentationKey:
              "authorization.reason.context.mock_exam.context_mismatch",
            severity: "attention",
            sortOrder: 2,
          },
        ],
      },
    });
  });

  it("preserves missing optional contexts as an empty section item list", () => {
    expect(
      buildAuthorizationReasonContextViewSectionReadModel({
        presentationStatus: "local_presentation_only",
        paperContextPresentation: null,
        mockExamContextPresentation: null,
      }).data,
    ).toEqual({
      sectionStatus: "local_view_section_only",
      sectionKey: "authorization.reason.view_section.context",
      sectionSeverity: "info",
      contextItems: [],
    });
  });
});

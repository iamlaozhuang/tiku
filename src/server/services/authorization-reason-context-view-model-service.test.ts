import { describe, expect, it } from "vitest";

import { buildAuthorizationReasonContextViewModelReadModel } from "./authorization-reason-context-view-model-service";

function createContextSectionInput() {
  return {
    id: 991,
    sectionStatus: "local_view_section_only",
    sectionKey: "authorization.reason.view_section.context",
    sectionSeverity: "info",
    contextItems: [
      {
        contextType: "mock_exam",
        publicId: "mock_exam_public_123",
        reasonCode: "context_matches_authorization",
        presentationKey:
          "authorization.reason.context.mock_exam.context_matches_authorization",
        severity: "info",
        sortOrder: 2,
      },
      {
        contextType: "paper",
        publicId: "paper_public_123",
        reasonCode: "context_matches_authorization",
        presentationKey:
          "authorization.reason.context.paper.context_matches_authorization",
        severity: "info",
        sortOrder: 1,
      },
    ],
  };
}

describe("authorization reason context view model service", () => {
  it("projects paper and mock_exam context items into local_view_model_only cards", () => {
    const result = buildAuthorizationReasonContextViewModelReadModel(
      createContextSectionInput(),
    );
    const serializedResult = JSON.stringify(result);

    expect(result).toEqual({
      code: 0,
      message: "ok",
      data: {
        viewModelStatus: "local_view_model_only",
        sourceSectionStatus: "local_view_section_only",
        modelKey: "authorization.reason.view_model.context",
        severity: "info",
        contextCards: [
          {
            cardKey: "authorization.reason.view_model.context.paper",
            contextType: "paper",
            publicId: "paper_public_123",
            reasonCode: "context_matches_authorization",
            presentationKey:
              "authorization.reason.context.paper.context_matches_authorization",
            severity: "info",
            sortOrder: 1,
          },
          {
            cardKey: "authorization.reason.view_model.context.mock_exam",
            contextType: "mock_exam",
            publicId: "mock_exam_public_123",
            reasonCode: "context_matches_authorization",
            presentationKey:
              "authorization.reason.context.mock_exam.context_matches_authorization",
            severity: "info",
            sortOrder: 2,
          },
        ],
      },
    });
    expect(serializedResult).not.toMatch(/"id":/);
  });

  it("preserves empty context sections as empty card lists", () => {
    expect(
      buildAuthorizationReasonContextViewModelReadModel({
        sectionStatus: "local_view_section_only",
        sectionKey: "authorization.reason.view_section.context",
        sectionSeverity: "info",
        contextItems: [],
      }),
    ).toEqual({
      code: 0,
      message: "ok",
      data: {
        viewModelStatus: "local_view_model_only",
        sourceSectionStatus: "local_view_section_only",
        modelKey: "authorization.reason.view_model.context",
        severity: "info",
        contextCards: [],
      },
    });
  });
});

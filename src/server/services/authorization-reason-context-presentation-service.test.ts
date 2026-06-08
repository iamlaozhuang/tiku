import { describe, expect, it } from "vitest";

import { buildAuthorizationReasonContextPresentationReadModel } from "./authorization-reason-context-presentation-service";

describe("authorization reason context presentation service", () => {
  it("maps paper and mock_exam reason codes to local_presentation_only context entries", () => {
    const result = buildAuthorizationReasonContextPresentationReadModel({
      id: 981,
      reasonStatus: "reason_summary_only",
      paperContext: {
        id: 982,
        publicId: "paper_public_123",
        reasonCode: "context_matches_authorization",
      },
      mockExamContext: {
        id: 983,
        publicId: "mock_exam_public_123",
        reasonCode: "context_mismatch",
      },
    });
    const serializedResult = JSON.stringify(result);

    expect(result).toEqual({
      code: 0,
      message: "ok",
      data: {
        presentationStatus: "local_presentation_only",
        paperContextPresentation: {
          contextType: "paper",
          publicId: "paper_public_123",
          reasonCode: "context_matches_authorization",
          presentationKey:
            "authorization.reason.context.paper.context_matches_authorization",
          severity: "info",
        },
        mockExamContextPresentation: {
          contextType: "mock_exam",
          publicId: "mock_exam_public_123",
          reasonCode: "context_mismatch",
          presentationKey:
            "authorization.reason.context.mock_exam.context_mismatch",
          severity: "attention",
        },
      },
    });
    expect(serializedResult).not.toMatch(/"id":/);
  });

  it("preserves missing optional paper and mock_exam contexts as null", () => {
    expect(
      buildAuthorizationReasonContextPresentationReadModel({
        reasonStatus: "reason_summary_only",
        paperContext: null,
        mockExamContext: null,
      }).data,
    ).toEqual({
      presentationStatus: "local_presentation_only",
      paperContextPresentation: null,
      mockExamContextPresentation: null,
    });
  });
});

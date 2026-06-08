import { describe, expect, it } from "vitest";

import { normalizeAuthorizationReasonContextPresentationInput } from "./authorization-reason-context-presentation";

describe("authorization reason context presentation validator", () => {
  it("normalizes paper and mock_exam presentation contexts", () => {
    expect(
      normalizeAuthorizationReasonContextPresentationInput({
        reasonStatus: "reason_summary_only",
        paperContext: {
          publicId: " paper_public_123 ",
          reasonCode: " context_matches_authorization ",
        },
        mockExamContext: {
          publicId: " mock_exam_public_123 ",
          reasonCode: "context_mismatch",
        },
      }),
    ).toEqual({
      success: true,
      value: {
        reasonStatus: "reason_summary_only",
        paperContext: {
          publicId: "paper_public_123",
          reasonCode: "context_matches_authorization",
        },
        mockExamContext: {
          publicId: "mock_exam_public_123",
          reasonCode: "context_mismatch",
        },
      },
    });
  });

  it("rejects invalid context fields", () => {
    expect(
      normalizeAuthorizationReasonContextPresentationInput({
        reasonStatus: "reason_summary_only",
        paperContext: {
          publicId: "",
          reasonCode: "unknown_context_reason",
        },
        mockExamContext: null,
      }),
    ).toEqual({
      success: false,
      message: "Invalid authorization reason context presentation input.",
    });
  });
});

import { describe, expect, it } from "vitest";

import { buildAuthorizationContextReasonSummaryReadModel } from "./authorization-context-reason-summary-service";

const privatePaperContent = "private-paper-content";

function createBaseInput() {
  return {
    id: 971,
    userPublicId: "user_public_123",
    authorizationPublicId: "personal_auth_public_123",
    authorizationProfession: "monopoly",
    authorizationLevel: 3,
    paperContext: {
      id: 972,
      publicId: "paper_public_123",
      profession: "monopoly",
      level: 3,
      privatePaperContent,
    },
    mockExamContext: {
      id: 973,
      publicId: "mock_exam_public_123",
      profession: "monopoly",
      level: 3,
    },
  };
}

describe("authorization context reason summary service", () => {
  it("builds reason_summary_only matching paper and mock_exam context metadata", () => {
    const result =
      buildAuthorizationContextReasonSummaryReadModel(createBaseInput());
    const serializedResult = JSON.stringify(result);

    expect(result).toEqual({
      code: 0,
      message: "ok",
      data: {
        userPublicId: "user_public_123",
        authorizationPublicId: "personal_auth_public_123",
        reasonStatus: "reason_summary_only",
        paper: {
          publicId: "paper_public_123",
          profession: "monopoly",
          level: 3,
          contextReasonCode: "context_matches_authorization",
        },
        mockExam: {
          publicId: "mock_exam_public_123",
          profession: "monopoly",
          level: 3,
          contextReasonCode: "context_matches_authorization",
        },
      },
    });
    expect(serializedResult).not.toMatch(/"id":/);
    expect(serializedResult).not.toContain(privatePaperContent);
  });

  it("summarizes paper and mock_exam context mismatches without enforcing permissions", () => {
    expect(
      buildAuthorizationContextReasonSummaryReadModel({
        ...createBaseInput(),
        paperContext: {
          publicId: "paper_public_456",
          profession: "marketing",
          level: 3,
        },
        mockExamContext: {
          publicId: "mock_exam_public_456",
          profession: "monopoly",
          level: 2,
        },
      }).data,
    ).toMatchObject({
      paper: {
        contextReasonCode: "context_mismatch",
      },
      mockExam: {
        contextReasonCode: "context_mismatch",
      },
    });
  });

  it("keeps missing paper or mock_exam context as null context only", () => {
    expect(
      buildAuthorizationContextReasonSummaryReadModel({
        ...createBaseInput(),
        paperContext: null,
      }).data,
    ).toMatchObject({
      reasonStatus: "reason_summary_only",
      paper: null,
      mockExam: {
        publicId: "mock_exam_public_123",
      },
    });
  });

  it("rejects invalid authorization context reason input", () => {
    expect(
      buildAuthorizationContextReasonSummaryReadModel({
        ...createBaseInput(),
        authorizationProfession: "unknown",
      }),
    ).toEqual({
      code: 400021,
      message: "Invalid authorization context reason summary input.",
      data: null,
    });
  });
});

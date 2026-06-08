import { describe, expect, it } from "vitest";

import { normalizePaperMockExamScopeInput } from "./paper-mock-exam-scope";

describe("paper mock_exam scope validator", () => {
  it("normalizes paper and mock_exam scope input while ignoring content fields", () => {
    expect(
      normalizePaperMockExamScopeInput({
        userPublicId: " user_public_123 ",
        authorizationPublicId: " personal_auth_public_123 ",
        paperPublicId: " paper_public_123 ",
        mockExamPublicId: " mock_exam_public_123 ",
        profession: "monopoly",
        level: 3,
        subject: "theory",
        paperType: "mock_paper",
        questionText: "question content must be ignored",
        standardAnswer: "standard_answer content must be ignored",
        analysis: "analysis content must be ignored",
        auditLogPublicId: "audit_log_public_123",
        aiCallLogPublicId: "ai_call_log_public_123",
      }),
    ).toEqual({
      success: true,
      value: {
        userPublicId: "user_public_123",
        authorizationPublicId: "personal_auth_public_123",
        paperPublicId: "paper_public_123",
        mockExamPublicId: "mock_exam_public_123",
        profession: "monopoly",
        level: 3,
        subject: "theory",
        paperType: "mock_paper",
      },
    });
  });

  it("rejects unsupported taxonomy values", () => {
    expect(
      normalizePaperMockExamScopeInput({
        userPublicId: "user_public_123",
        authorizationPublicId: "personal_auth_public_123",
        paperPublicId: "paper_public_123",
        mockExamPublicId: null,
        profession: "invalid_profession",
        level: 3,
        subject: "theory",
        paperType: "mock_paper",
      }),
    ).toEqual({
      success: false,
      message: "Invalid paper mock_exam scope input.",
    });
  });
});

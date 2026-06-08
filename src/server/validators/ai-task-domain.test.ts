import { describe, expect, it } from "vitest";

import { normalizeAiTaskDomainInput } from "./ai-task-domain";

describe("AI task domain validator", () => {
  it("normalizes local AI task domain input without raw prompt or answer fields", () => {
    expect(
      normalizeAiTaskDomainInput({
        userPublicId: " user_public_123 ",
        authorizationPublicId: " personal_auth_public_123 ",
        aiFuncType: "kn_recommendation",
        questionPublicId: " question_public_123 ",
        answerRecordPublicId: null,
        paperPublicId: " paper_public_123 ",
        mockExamPublicId: " mock_exam_public_123 ",
        auditLogPublicId: " audit_log_public_123 ",
        aiCallLogPublicId: null,
        promptText: "raw prompt must be ignored",
        answerText: "raw answer must be ignored",
      }),
    ).toEqual({
      success: true,
      value: {
        userPublicId: "user_public_123",
        authorizationPublicId: "personal_auth_public_123",
        aiFuncType: "kn_recommendation",
        questionPublicId: "question_public_123",
        answerRecordPublicId: null,
        paperPublicId: "paper_public_123",
        mockExamPublicId: "mock_exam_public_123",
        auditLogPublicId: "audit_log_public_123",
        aiCallLogPublicId: null,
      },
    });
  });

  it("rejects unsupported AI function types", () => {
    expect(
      normalizeAiTaskDomainInput({
        userPublicId: "user_public_123",
        authorizationPublicId: "personal_auth_public_123",
        aiFuncType: "invalid_ai_func",
        questionPublicId: "question_public_123",
        answerRecordPublicId: null,
        paperPublicId: null,
        mockExamPublicId: null,
        auditLogPublicId: null,
        aiCallLogPublicId: null,
      }),
    ).toEqual({
      success: false,
      message: "Invalid AI task domain input.",
    });
  });
});

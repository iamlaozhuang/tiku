import { describe, expect, it } from "vitest";

import { normalizePersonalAiGenerationRequestInput } from "./personal-ai-generation-request";

describe("personal AI generation request validator", () => {
  it("normalizes ai_hint input while ignoring prompt, raw answer, and generated content", () => {
    expect(
      normalizePersonalAiGenerationRequestInput({
        userPublicId: " user_public_123 ",
        authorizationPublicId: " personal_auth_public_123 ",
        aiFuncType: "hint",
        questionPublicId: " question_public_123 ",
        answerRecordPublicId: " answer_record_public_123 ",
        paperPublicId: " paper_public_123 ",
        mockExamPublicId: " mock_exam_public_123 ",
        redeemCodePublicId: " redeem_code_public_123 ",
        auditLogPublicId: " audit_log_public_123 ",
        aiCallLogPublicId: " ai_call_log_public_123 ",
        promptText: "prompt must be ignored",
        rawAnswer: "raw answer must be ignored",
        generatedContent: "generated content must be ignored",
      }),
    ).toEqual({
      success: true,
      value: {
        userPublicId: "user_public_123",
        authorizationPublicId: "personal_auth_public_123",
        aiFuncType: "hint",
        questionPublicId: "question_public_123",
        answerRecordPublicId: "answer_record_public_123",
        paperPublicId: "paper_public_123",
        mockExamPublicId: "mock_exam_public_123",
        redeemCodePublicId: "redeem_code_public_123",
        auditLogPublicId: "audit_log_public_123",
        aiCallLogPublicId: "ai_call_log_public_123",
      },
    });
  });

  it("rejects unsupported personal AI generation types", () => {
    expect(
      normalizePersonalAiGenerationRequestInput({
        userPublicId: "user_public_123",
        authorizationPublicId: "personal_auth_public_123",
        aiFuncType: "scoring",
        questionPublicId: "question_public_123",
      }),
    ).toEqual({
      success: false,
      message: "Invalid personal AI generation request input.",
    });
  });
});

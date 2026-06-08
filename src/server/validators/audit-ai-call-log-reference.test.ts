import { describe, expect, it } from "vitest";

import { normalizeAuditAiCallLogReferenceInput } from "./audit-ai-call-log-reference";

describe("audit_log ai_call_log reference validator", () => {
  it("normalizes redacted log reference input while ignoring raw payload fields", () => {
    expect(
      normalizeAuditAiCallLogReferenceInput({
        userPublicId: " user_public_123 ",
        authorizationPublicId: " personal_auth_public_123 ",
        auditLogPublicId: " audit_log_public_123 ",
        aiCallLogPublicId: " ai_call_log_public_123 ",
        paperPublicId: " paper_public_123 ",
        mockExamPublicId: " mock_exam_public_123 ",
        auditLogPayload: "audit_log payload must be ignored",
        aiCallLogPayload: "ai_call_log payload must be ignored",
        rawPrompt: "raw prompt must be ignored",
        rawAnswer: "raw answer must be ignored",
      }),
    ).toEqual({
      success: true,
      value: {
        userPublicId: "user_public_123",
        authorizationPublicId: "personal_auth_public_123",
        auditLogPublicId: "audit_log_public_123",
        aiCallLogPublicId: "ai_call_log_public_123",
        paperPublicId: "paper_public_123",
        mockExamPublicId: "mock_exam_public_123",
      },
    });
  });

  it("rejects input without audit_log or ai_call_log public references", () => {
    expect(
      normalizeAuditAiCallLogReferenceInput({
        userPublicId: "user_public_123",
        authorizationPublicId: "personal_auth_public_123",
        auditLogPublicId: null,
        aiCallLogPublicId: "",
        paperPublicId: null,
        mockExamPublicId: null,
      }),
    ).toEqual({
      success: false,
      message: "Invalid audit_log ai_call_log reference input.",
    });
  });
});

import { describe, expect, it } from "vitest";

import { buildAuditAiCallLogReferenceReadModel } from "./audit-ai-call-log-reference-service";

function createBaseInput() {
  const auditLogPayload = ["AUDIT", "LOG", "PAYLOAD"].join("-");
  const aiCallLogPayload = ["AI", "CALL", "LOG", "PAYLOAD"].join("-");
  const rawPrompt = ["RAW", "PROMPT"].join("-");
  const rawAnswer = ["RAW", "ANSWER"].join("-");
  const modelOutput = ["MODEL", "OUTPUT"].join("-");
  const requestIp = "192.0.2.10";

  return {
    id: 501,
    userPublicId: "user_public_123",
    authorizationPublicId: "personal_auth_public_123",
    auditLogPublicId: "audit_log_public_123",
    aiCallLogPublicId: "ai_call_log_public_123",
    paperPublicId: "paper_public_123",
    mockExamPublicId: "mock_exam_public_123",
    auditLogPayload,
    aiCallLogPayload,
    rawPrompt,
    rawAnswer,
    modelOutput,
    requestIp,
    secretToken: "secret-token",
  };
}

describe("audit_log ai_call_log reference service", () => {
  it("builds redacted audit_log and ai_call_log references without payloads", () => {
    const input = createBaseInput();
    const result = buildAuditAiCallLogReferenceReadModel(input);
    const serializedResult = JSON.stringify(result);

    expect(result).toEqual({
      code: 0,
      message: "ok",
      data: {
        userPublicId: "user_public_123",
        authorizationPublicId: "personal_auth_public_123",
        referenceScope: {
          paperPublicId: "paper_public_123",
          mockExamPublicId: "mock_exam_public_123",
        },
        auditLogReference: {
          publicId: "audit_log_public_123",
          redactionStatus: "redacted",
        },
        aiCallLogReference: {
          publicId: "ai_call_log_public_123",
          redactionStatus: "redacted",
        },
        referenceStatus: "redacted_reference",
      },
    });
    expect(serializedResult).not.toMatch(/"id":/);
    expect(serializedResult).not.toContain(input.auditLogPayload);
    expect(serializedResult).not.toContain(input.aiCallLogPayload);
    expect(serializedResult).not.toContain(input.rawPrompt);
    expect(serializedResult).not.toContain(input.rawAnswer);
    expect(serializedResult).not.toContain(input.modelOutput);
    expect(serializedResult).not.toContain(input.requestIp);
    expect(serializedResult).not.toContain(input.secretToken);
  });

  it("builds a single audit_log reference with nullable ai_call_log and scope", () => {
    expect(
      buildAuditAiCallLogReferenceReadModel({
        userPublicId: "user_public_456",
        authorizationPublicId: "org_auth_public_456",
        auditLogPublicId: "audit_log_public_456",
        aiCallLogPublicId: null,
        paperPublicId: null,
        mockExamPublicId: null,
      }),
    ).toEqual({
      code: 0,
      message: "ok",
      data: {
        userPublicId: "user_public_456",
        authorizationPublicId: "org_auth_public_456",
        referenceScope: {
          paperPublicId: null,
          mockExamPublicId: null,
        },
        auditLogReference: {
          publicId: "audit_log_public_456",
          redactionStatus: "redacted",
        },
        aiCallLogReference: {
          publicId: null,
          redactionStatus: "redacted",
        },
        referenceStatus: "redacted_reference",
      },
    });
  });

  it("returns a failure result when both log references are missing", () => {
    expect(
      buildAuditAiCallLogReferenceReadModel({
        userPublicId: "user_public_123",
        authorizationPublicId: "personal_auth_public_123",
        auditLogPublicId: "",
        aiCallLogPublicId: null,
        paperPublicId: "paper_public_123",
        mockExamPublicId: "mock_exam_public_123",
      }),
    ).toEqual({
      code: 400009,
      message: "Invalid audit_log ai_call_log reference input.",
      data: null,
    });
  });
});

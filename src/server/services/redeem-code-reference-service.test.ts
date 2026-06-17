import { describe, expect, it } from "vitest";

import { buildRedeemCodeReferenceReadModel } from "./redeem-code-reference-service";

function createBaseInput() {
  const redeemCodePlaintext = ["PLAIN", "REDEEM", "CODE"].join("-");
  const codeHash = ["CODE", "HASH"].join("-");
  const auditLogPayload = ["AUDIT", "PAYLOAD"].join("-");
  const aiCallLogPayload = ["AI", "CALL", "PAYLOAD"].join("-");

  return {
    id: 601,
    userPublicId: "user_public_123",
    authorizationPublicId: "personal_auth_public_123",
    redeemCodePublicId: "redeem_code_public_123",
    paperPublicId: "paper_public_123",
    mockExamPublicId: "mock_exam_public_123",
    auditLogPublicId: "audit_log_public_123",
    aiCallLogPublicId: "ai_call_log_public_123",
    redeemCodePlaintext,
    codeHash,
    auditLogPayload,
    aiCallLogPayload,
    privatePayloadMarker: "private-payload-marker",
  };
}

describe("redeem_code reference service", () => {
  it("builds a redacted redeem_code reference without plaintext or code hash", () => {
    const input = createBaseInput();
    const result = buildRedeemCodeReferenceReadModel(input);
    const serializedResult = JSON.stringify(result);

    expect(result).toEqual({
      code: 0,
      message: "ok",
      data: {
        userPublicId: "user_public_123",
        authorizationPublicId: "personal_auth_public_123",
        redeemCodeReference: {
          publicId: "redeem_code_public_123",
          redactionStatus: "redacted",
        },
        contextScope: {
          paperPublicId: "paper_public_123",
          mockExamPublicId: "mock_exam_public_123",
        },
        evidenceReferences: {
          auditLogPublicId: "audit_log_public_123",
          aiCallLogPublicId: "ai_call_log_public_123",
          redactionStatus: "redacted",
        },
        redactedReferenceScopeStatus: "redeem_code_audit_ai_call_log_only",
        referenceStatus: "redacted_reference",
      },
    });
    expect(serializedResult).not.toMatch(/"id":/);
    expect(serializedResult).not.toContain(input.redeemCodePlaintext);
    expect(serializedResult).not.toContain(input.codeHash);
    expect(serializedResult).not.toContain(input.auditLogPayload);
    expect(serializedResult).not.toContain(input.aiCallLogPayload);
    expect(serializedResult).not.toContain(input.privatePayloadMarker);
  });

  it("builds a redacted redeem_code reference with nullable scope and evidence", () => {
    expect(
      buildRedeemCodeReferenceReadModel({
        userPublicId: "user_public_456",
        authorizationPublicId: "personal_auth_public_456",
        redeemCodePublicId: "redeem_code_public_456",
        paperPublicId: null,
        mockExamPublicId: null,
        auditLogPublicId: null,
        aiCallLogPublicId: null,
      }),
    ).toEqual({
      code: 0,
      message: "ok",
      data: {
        userPublicId: "user_public_456",
        authorizationPublicId: "personal_auth_public_456",
        redeemCodeReference: {
          publicId: "redeem_code_public_456",
          redactionStatus: "redacted",
        },
        contextScope: {
          paperPublicId: null,
          mockExamPublicId: null,
        },
        evidenceReferences: {
          auditLogPublicId: null,
          aiCallLogPublicId: null,
          redactionStatus: "redacted",
        },
        redactedReferenceScopeStatus: "redeem_code_audit_ai_call_log_only",
        referenceStatus: "redacted_reference",
      },
    });
  });

  it("returns a failure result when redeem_code reference is missing", () => {
    expect(
      buildRedeemCodeReferenceReadModel({
        userPublicId: "user_public_123",
        authorizationPublicId: "personal_auth_public_123",
        redeemCodePublicId: "",
        paperPublicId: null,
        mockExamPublicId: null,
        auditLogPublicId: null,
        aiCallLogPublicId: null,
      }),
    ).toEqual({
      code: 400010,
      message: "Invalid redeem_code reference input.",
      data: null,
    });
  });
});

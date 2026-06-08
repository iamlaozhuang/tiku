import { describe, expect, it } from "vitest";

import { buildAuthorizationEvidenceReferenceSummaryReadModel } from "./authorization-evidence-reference-summary-service";

const plaintextRedeemCode = "plain-redeem-code-value";
const rawAuditLogPayload = "raw-audit-log-payload";
const rawAiCallLogPayload = "raw-ai-call-log-payload";

function createBaseInput() {
  return {
    id: 950,
    userPublicId: "user_public_123",
    authorizationPublicId: "personal_auth_public_123",
    redeemCodePublicId: "redeem_code_public_123",
    auditLogPublicId: "audit_log_public_123",
    aiCallLogPublicId: "ai_call_log_public_123",
    plaintextRedeemCode,
    rawAuditLogPayload,
    rawAiCallLogPayload,
  };
}

describe("authorization evidence reference summary service", () => {
  it("builds redacted reference metadata without raw evidence", () => {
    const result =
      buildAuthorizationEvidenceReferenceSummaryReadModel(createBaseInput());
    const serializedResult = JSON.stringify(result);

    expect(result).toEqual({
      code: 0,
      message: "ok",
      data: {
        userPublicId: "user_public_123",
        authorizationPublicId: "personal_auth_public_123",
        displayStatus: "display_only",
        referenceSummary: {
          totalReferenceCount: 3,
          missingReferenceCount: 0,
        },
        references: {
          redeemCode: {
            publicId: "redeem_code_public_123",
            redactionStatus: "redacted",
            referenceStatus: "redacted_reference",
          },
          auditLog: {
            publicId: "audit_log_public_123",
            redactionStatus: "redacted",
            referenceStatus: "redacted_reference",
          },
          aiCallLog: {
            publicId: "ai_call_log_public_123",
            redactionStatus: "redacted",
            referenceStatus: "redacted_reference",
          },
        },
      },
    });
    expect(serializedResult).not.toMatch(/"id":/);
    expect(serializedResult).not.toContain(plaintextRedeemCode);
    expect(serializedResult).not.toContain(rawAuditLogPayload);
    expect(serializedResult).not.toContain(rawAiCallLogPayload);
  });

  it("preserves null for missing optional evidence references", () => {
    expect(
      buildAuthorizationEvidenceReferenceSummaryReadModel({
        ...createBaseInput(),
        redeemCodePublicId: null,
        aiCallLogPublicId: null,
      }).data,
    ).toMatchObject({
      referenceSummary: {
        totalReferenceCount: 1,
        missingReferenceCount: 2,
      },
      references: {
        redeemCode: {
          publicId: null,
        },
        aiCallLog: {
          publicId: null,
        },
      },
    });
  });

  it("rejects invalid authorization evidence reference input", () => {
    expect(
      buildAuthorizationEvidenceReferenceSummaryReadModel({
        ...createBaseInput(),
        authorizationPublicId: "",
      }),
    ).toEqual({
      code: 400018,
      message: "Invalid authorization evidence reference summary input.",
      data: null,
    });
  });
});

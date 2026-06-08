import { describe, expect, it } from "vitest";

import { buildAuthorizationReasonEvidencePresentationReadModel } from "./authorization-reason-evidence-presentation-service";

const plaintextRedeemCode = "plain-redeem-code-value";
const rawAuditLogPayload = "raw-audit-log-payload";
const rawAiCallLogPayload = "raw-ai-call-log-payload";
const promptText = "raw prompt text";
const providerPayload = "raw provider payload";
const generatedAiContent = "generated AI content";

describe("authorization reason evidence presentation service", () => {
  it("returns only redacted evidence reference presentation rows", () => {
    const result = buildAuthorizationReasonEvidencePresentationReadModel({
      id: 991,
      reasonStatus: "reason_summary_only",
      redeemCodePublicId: "redeem_code_public_123",
      auditLogPublicId: "audit_log_public_123",
      aiCallLogPublicId: "ai_call_log_public_123",
      plaintextRedeemCode,
      rawAuditLogPayload,
      rawAiCallLogPayload,
      promptText,
      providerPayload,
      generatedAiContent,
    });
    const serializedResult = JSON.stringify(result);

    expect(result).toEqual({
      code: 0,
      message: "ok",
      data: {
        presentationStatus: "local_presentation_only",
        evidencePresentations: [
          {
            evidenceType: "redeem_code",
            publicId: "redeem_code_public_123",
            redactionStatus: "redacted",
            referenceStatus: "redacted_reference",
            presentationKey:
              "authorization.reason.evidence.redeem_code.redacted_reference",
          },
          {
            evidenceType: "audit_log",
            publicId: "audit_log_public_123",
            redactionStatus: "redacted",
            referenceStatus: "redacted_reference",
            presentationKey:
              "authorization.reason.evidence.audit_log.redacted_reference",
          },
          {
            evidenceType: "ai_call_log",
            publicId: "ai_call_log_public_123",
            redactionStatus: "redacted",
            referenceStatus: "redacted_reference",
            presentationKey:
              "authorization.reason.evidence.ai_call_log.redacted_reference",
          },
        ],
      },
    });
    expect(serializedResult).not.toMatch(/"id":/);
    expect(serializedResult).not.toContain(plaintextRedeemCode);
    expect(serializedResult).not.toContain(rawAuditLogPayload);
    expect(serializedResult).not.toContain(rawAiCallLogPayload);
    expect(serializedResult).not.toContain(promptText);
    expect(serializedResult).not.toContain(providerPayload);
    expect(serializedResult).not.toContain(generatedAiContent);
  });

  it("preserves missing optional evidence references as null", () => {
    expect(
      buildAuthorizationReasonEvidencePresentationReadModel({
        reasonStatus: "reason_summary_only",
        redeemCodePublicId: null,
        auditLogPublicId: null,
        aiCallLogPublicId: null,
      }).data,
    ).toMatchObject({
      evidencePresentations: [
        {
          evidenceType: "redeem_code",
          publicId: null,
        },
        {
          evidenceType: "audit_log",
          publicId: null,
        },
        {
          evidenceType: "ai_call_log",
          publicId: null,
        },
      ],
    });
  });
});

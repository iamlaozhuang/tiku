import { describe, expect, it } from "vitest";

import { buildAuthorizationReasonEvidenceViewSectionReadModel } from "./authorization-reason-evidence-view-section-service";

const plaintextRedeemCode = "plain-redeem-code-value";
const rawAuditLogPayload = "raw-audit-log-payload";
const rawAiCallLogPayload = "raw-ai-call-log-payload";
const promptText = "raw prompt text";
const providerPayload = "raw provider payload";
const generatedAiContent = "generated AI content";

describe("authorization reason evidence view section service", () => {
  it("groups only redacted evidence references into a local_view_section_only evidence section", () => {
    const result = buildAuthorizationReasonEvidenceViewSectionReadModel({
      id: 985,
      presentationStatus: "local_presentation_only",
      evidencePresentations: [
        {
          id: 986,
          evidenceType: "redeem_code",
          publicId: "redeem_code_public_123",
          redactionStatus: "redacted",
          referenceStatus: "redacted_reference",
          presentationKey:
            "authorization.reason.evidence.redeem_code.redacted_reference",
        },
        {
          id: 987,
          evidenceType: "audit_log",
          publicId: "audit_log_public_123",
          redactionStatus: "redacted",
          referenceStatus: "redacted_reference",
          presentationKey:
            "authorization.reason.evidence.audit_log.redacted_reference",
        },
      ],
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
        sectionStatus: "local_view_section_only",
        sectionKey: "authorization.reason.view_section.evidence",
        sectionSeverity: "info",
        evidenceItems: [
          {
            evidenceType: "redeem_code",
            publicId: "redeem_code_public_123",
            redactionStatus: "redacted",
            referenceStatus: "redacted_reference",
            presentationKey:
              "authorization.reason.evidence.redeem_code.redacted_reference",
            sortOrder: 1,
          },
          {
            evidenceType: "audit_log",
            publicId: "audit_log_public_123",
            redactionStatus: "redacted",
            referenceStatus: "redacted_reference",
            presentationKey:
              "authorization.reason.evidence.audit_log.redacted_reference",
            sortOrder: 2,
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

  it("preserves null evidence public references with redacted_reference status", () => {
    expect(
      buildAuthorizationReasonEvidenceViewSectionReadModel({
        presentationStatus: "local_presentation_only",
        evidencePresentations: [
          {
            evidenceType: "ai_call_log",
            publicId: null,
            redactionStatus: "redacted",
            referenceStatus: "redacted_reference",
            presentationKey:
              "authorization.reason.evidence.ai_call_log.redacted_reference",
          },
        ],
      }).data,
    ).toMatchObject({
      evidenceItems: [
        {
          evidenceType: "ai_call_log",
          publicId: null,
          referenceStatus: "redacted_reference",
        },
      ],
    });
  });
});

import { describe, expect, it } from "vitest";

import { buildAuthorizationReasonEvidenceViewModelReadModel } from "./authorization-reason-evidence-view-model-service";

const plaintextRedeemCode = "plain-redeem-code-value";
const rawAuditLogPayload = "raw-audit-log-payload";
const rawAiCallLogPayload = "raw-ai-call-log-payload";
const promptText = "raw prompt text";
const generatedAiContent = "generated ai content";

function createEvidenceSectionInput() {
  return {
    id: 992,
    sectionStatus: "local_view_section_only",
    sectionKey: "authorization.reason.view_section.evidence",
    sectionSeverity: "info",
    evidenceItems: [
      {
        evidenceType: "audit_log",
        publicId: null,
        redactionStatus: "redacted",
        referenceStatus: "redacted_reference",
        presentationKey:
          "authorization.reason.evidence.audit_log.redacted_reference",
        sortOrder: 2,
      },
      {
        evidenceType: "redeem_code",
        publicId: "redeem_code_public_123",
        redactionStatus: "redacted",
        referenceStatus: "redacted_reference",
        presentationKey:
          "authorization.reason.evidence.redeem_code.redacted_reference",
        sortOrder: 1,
      },
    ],
    plaintextRedeemCode,
    rawAuditLogPayload,
    rawAiCallLogPayload,
    promptText,
    generatedAiContent,
  };
}

describe("authorization reason evidence view model service", () => {
  it("projects redacted evidence references into local_view_model_only chips", () => {
    const result = buildAuthorizationReasonEvidenceViewModelReadModel(
      createEvidenceSectionInput(),
    );
    const serializedResult = JSON.stringify(result);

    expect(result).toEqual({
      code: 0,
      message: "ok",
      data: {
        viewModelStatus: "local_view_model_only",
        sourceSectionStatus: "local_view_section_only",
        modelKey: "authorization.reason.view_model.evidence",
        severity: "info",
        evidenceChips: [
          {
            chipKey: "authorization.reason.view_model.evidence.redeem_code",
            evidenceType: "redeem_code",
            publicId: "redeem_code_public_123",
            redactionStatus: "redacted",
            referenceStatus: "redacted_reference",
            presentationKey:
              "authorization.reason.evidence.redeem_code.redacted_reference",
            sortOrder: 1,
          },
          {
            chipKey: "authorization.reason.view_model.evidence.audit_log",
            evidenceType: "audit_log",
            publicId: null,
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
    expect(serializedResult).not.toContain(generatedAiContent);
  });

  it("rejects evidence items that are not redacted references", () => {
    expect(
      buildAuthorizationReasonEvidenceViewModelReadModel({
        ...createEvidenceSectionInput(),
        evidenceItems: [
          {
            evidenceType: "redeem_code",
            publicId: "redeem_code_public_123",
            redactionStatus: "visible",
            referenceStatus: "redacted_reference",
            presentationKey:
              "authorization.reason.evidence.redeem_code.redacted_reference",
            sortOrder: 1,
          },
        ],
      }),
    ).toEqual({
      code: 400034,
      message: "Invalid authorization reason evidence view model input.",
      data: null,
    });
  });
});

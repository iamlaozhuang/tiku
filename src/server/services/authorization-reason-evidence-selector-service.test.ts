import { describe, expect, it } from "vitest";

import { buildAuthorizationReasonEvidenceSelectorReadModel } from "./authorization-reason-evidence-selector-service";

const plaintextRedeemCode = "plain-redeem-code-value";
const rawAuditLogPayload = "raw-audit-log-payload";
const rawAiCallLogPayload = "raw-ai-call-log-payload";

function createEvidenceModelInput() {
  return {
    id: 1001,
    viewModelStatus: "local_view_model_only",
    sourceSectionStatus: "local_view_section_only",
    modelKey: "authorization.reason.view_model.evidence",
    severity: "attention",
    evidenceChips: [
      {
        chipKey: "authorization.reason.view_model.evidence.ai_call_log",
        evidenceType: "ai_call_log",
        publicId: "ai_call_log_public_123",
        redactionStatus: "redacted",
        referenceStatus: "redacted_reference",
        presentationKey: "authorization.reason.evidence.ai_call_log",
        sortOrder: 3,
      },
      {
        chipKey: "authorization.reason.view_model.evidence.redeem_code",
        evidenceType: "redeem_code",
        publicId: "redeem_code_public_123",
        redactionStatus: "redacted",
        referenceStatus: "redacted_reference",
        presentationKey: "authorization.reason.evidence.redeem_code",
        sortOrder: 1,
      },
      {
        chipKey: "authorization.reason.view_model.evidence.audit_log",
        evidenceType: "audit_log",
        publicId: null,
        redactionStatus: "redacted",
        referenceStatus: "redacted_reference",
        presentationKey: "authorization.reason.evidence.audit_log",
        sortOrder: 2,
      },
    ],
    plaintextRedeemCode,
    rawAuditLogPayload,
    rawAiCallLogPayload,
  };
}

describe("authorization reason evidence selector service", () => {
  it("selects redacted evidence public ids and chip count", () => {
    const result = buildAuthorizationReasonEvidenceSelectorReadModel(
      createEvidenceModelInput(),
    );
    const serializedResult = JSON.stringify(result);

    expect(result).toEqual({
      code: 0,
      message: "ok",
      data: {
        selectorStatus: "local_selector_only",
        sourceViewModelStatus: "local_view_model_only",
        selectorKey: "authorization.reason.selector.evidence",
        severity: "attention",
        redeemCodePublicId: "redeem_code_public_123",
        auditLogPublicId: null,
        aiCallLogPublicId: "ai_call_log_public_123",
        evidenceChipCount: 3,
      },
    });
    expect(serializedResult).not.toMatch(/"id":/);
    expect(serializedResult).not.toContain(plaintextRedeemCode);
    expect(serializedResult).not.toContain(rawAuditLogPayload);
    expect(serializedResult).not.toContain(rawAiCallLogPayload);
  });

  it("returns null evidence ids when optional evidence chips are absent", () => {
    expect(
      buildAuthorizationReasonEvidenceSelectorReadModel({
        ...createEvidenceModelInput(),
        severity: "info",
        evidenceChips: [],
      }),
    ).toEqual({
      code: 0,
      message: "ok",
      data: {
        selectorStatus: "local_selector_only",
        sourceViewModelStatus: "local_view_model_only",
        selectorKey: "authorization.reason.selector.evidence",
        severity: "info",
        redeemCodePublicId: null,
        auditLogPublicId: null,
        aiCallLogPublicId: null,
        evidenceChipCount: 0,
      },
    });
  });

  it("rejects unredacted evidence selector references", () => {
    expect(
      buildAuthorizationReasonEvidenceSelectorReadModel({
        ...createEvidenceModelInput(),
        evidenceChips: [
          {
            ...createEvidenceModelInput().evidenceChips[0],
            redactionStatus: "plain",
          },
        ],
      }),
    ).toEqual({
      code: 400038,
      message: "Invalid authorization reason evidence selector input.",
      data: null,
    });
  });
});

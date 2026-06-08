import { describe, expect, it } from "vitest";

import { buildAuthorizationReasonPresentationSummaryReadModel } from "./authorization-reason-presentation-summary-service";

const plaintextRedeemCode = "plain-redeem-code-value";
const rawAuditLogPayload = "raw-audit-log-payload";
const rawAiCallLogPayload = "raw-ai-call-log-payload";

function createBaseInput() {
  return {
    id: 997,
    userPublicId: "user_public_123",
    authorizationPublicId: "personal_auth_public_123",
    reasonStatus: "reason_summary_only",
    reasonCodes: [
      "selected_authorization_active",
      "authorization_window_within_window",
      "context_matches_authorization",
      "redacted_references_present",
    ],
    sourceReason: {
      selectedAuthorizationPublicId: "personal_auth_public_123",
      sourceReasonCode: "selected_authorization_active",
    },
    windowReason: {
      windowReasonCode: "authorization_window_within_window",
    },
    contextReason: {
      paperReasonCode: "context_matches_authorization",
      mockExamReasonCode: "context_matches_authorization",
    },
    paperContextPublicId: "paper_public_123",
    mockExamContextPublicId: "mock_exam_public_123",
    evidenceReferences: {
      redeemCodeReference: {
        publicId: "redeem_code_public_123",
        redactionStatus: "redacted",
        referenceStatus: "redacted_reference",
      },
      auditLogPublicId: "audit_log_public_123",
      aiCallLogPublicId: "ai_call_log_public_123",
      redactionStatus: "redacted",
      referenceStatus: "redacted_reference",
    },
    plaintextRedeemCode,
    rawAuditLogPayload,
    rawAiCallLogPayload,
  };
}

describe("authorization reason presentation summary service", () => {
  it("builds an aggregate local_presentation_only authorization reason contract", () => {
    const result =
      buildAuthorizationReasonPresentationSummaryReadModel(createBaseInput());
    const serializedResult = JSON.stringify(result);

    expect(result).toMatchObject({
      code: 0,
      message: "ok",
      data: {
        userPublicId: "user_public_123",
        authorizationPublicId: "personal_auth_public_123",
        reasonStatus: "reason_summary_only",
        presentationStatus: "local_presentation_only",
        sourcePresentation: {
          selectedAuthorizationPublicId: "personal_auth_public_123",
          sourceReasonCode: "selected_authorization_active",
          presentationKey:
            "authorization.reason.source.selected_authorization_active",
          severity: "info",
        },
        reasonItems: [
          {
            reasonCode: "selected_authorization_active",
            presentationKey:
              "authorization.reason.selected_authorization_active",
            severity: "info",
            sortOrder: 1,
          },
          {
            reasonCode: "authorization_window_within_window",
            presentationKey:
              "authorization.reason.authorization_window_within_window",
            severity: "info",
            sortOrder: 2,
          },
          {
            reasonCode: "context_matches_authorization",
            presentationKey:
              "authorization.reason.context_matches_authorization",
            severity: "info",
            sortOrder: 3,
          },
          {
            reasonCode: "redacted_references_present",
            presentationKey: "authorization.reason.redacted_references_present",
            severity: "info",
            sortOrder: 4,
          },
        ],
        contextPresentation: {
          paperContextPresentation: {
            contextType: "paper",
            publicId: "paper_public_123",
          },
          mockExamContextPresentation: {
            contextType: "mock_exam",
            publicId: "mock_exam_public_123",
          },
        },
        evidencePresentation: {
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
      },
    });
    expect(serializedResult).not.toMatch(/"id":/);
    expect(serializedResult).not.toContain(plaintextRedeemCode);
    expect(serializedResult).not.toContain(rawAuditLogPayload);
    expect(serializedResult).not.toContain(rawAiCallLogPayload);
  });

  it("rejects inconsistent selected authorization references", () => {
    expect(
      buildAuthorizationReasonPresentationSummaryReadModel({
        ...createBaseInput(),
        sourceReason: {
          selectedAuthorizationPublicId: "org_auth_public_mismatch",
          sourceReasonCode: "selected_authorization_active",
        },
      }),
    ).toEqual({
      code: 400027,
      message: "Invalid authorization reason presentation summary input.",
      data: null,
    });
  });
});

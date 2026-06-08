import { describe, expect, it } from "vitest";

import { buildAuthorizationReasonViewSectionSummaryReadModel } from "./authorization-reason-view-section-summary-service";

const plaintextRedeemCode = "plain-redeem-code-value";
const rawAuditLogPayload = "raw-audit-log-payload";
const rawAiCallLogPayload = "raw-ai-call-log-payload";

function createBaseInput() {
  return {
    id: 988,
    userPublicId: "user_public_123",
    authorizationPublicId: "personal_auth_public_123",
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
        presentationKey: "authorization.reason.selected_authorization_active",
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
    ],
    contextPresentation: {
      presentationStatus: "local_presentation_only",
      paperContextPresentation: {
        contextType: "paper",
        publicId: "paper_public_123",
        reasonCode: "context_matches_authorization",
        presentationKey:
          "authorization.reason.context.paper.context_matches_authorization",
        severity: "info",
      },
      mockExamContextPresentation: null,
    },
    evidencePresentation: {
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
      ],
    },
    plaintextRedeemCode,
    rawAuditLogPayload,
    rawAiCallLogPayload,
  };
}

describe("authorization reason view section summary service", () => {
  it("builds an aggregate local_view_section_only contract from presentation inputs", () => {
    const result =
      buildAuthorizationReasonViewSectionSummaryReadModel(createBaseInput());
    const serializedResult = JSON.stringify(result);

    expect(result).toMatchObject({
      code: 0,
      message: "ok",
      data: {
        userPublicId: "user_public_123",
        authorizationPublicId: "personal_auth_public_123",
        summaryStatus: "local_view_section_only",
        statusSection: {
          sectionKey: "authorization.reason.view_section.status",
          selectedAuthorizationPublicId: "personal_auth_public_123",
        },
        contextSection: {
          sectionKey: "authorization.reason.view_section.context",
          contextItems: [
            {
              contextType: "paper",
              publicId: "paper_public_123",
            },
          ],
        },
        evidenceSection: {
          sectionKey: "authorization.reason.view_section.evidence",
          evidenceItems: [
            {
              evidenceType: "redeem_code",
              publicId: "redeem_code_public_123",
              referenceStatus: "redacted_reference",
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
      buildAuthorizationReasonViewSectionSummaryReadModel({
        ...createBaseInput(),
        sourcePresentation: {
          ...createBaseInput().sourcePresentation,
          selectedAuthorizationPublicId: "org_auth_public_mismatch",
        },
      }),
    ).toEqual({
      code: 400031,
      message: "Invalid authorization reason view section summary input.",
      data: null,
    });
  });
});

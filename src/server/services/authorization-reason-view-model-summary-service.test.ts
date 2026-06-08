import { describe, expect, it } from "vitest";

import { buildAuthorizationReasonViewModelSummaryReadModel } from "./authorization-reason-view-model-summary-service";

const plaintextRedeemCode = "plain-redeem-code-value";
const rawAuditLogPayload = "raw-audit-log-payload";
const rawAiCallLogPayload = "raw-ai-call-log-payload";

function createViewSectionSummaryInput() {
  return {
    id: 993,
    userPublicId: "user_public_123",
    authorizationPublicId: "personal_auth_public_123",
    summaryStatus: "local_view_section_only",
    statusSection: {
      sectionStatus: "local_view_section_only",
      sectionKey: "authorization.reason.view_section.status",
      sectionSeverity: "info",
      selectedAuthorizationPublicId: "personal_auth_public_123",
      statusItems: [
        {
          itemKey: "authorization.reason.status.source",
          reasonCode: "selected_authorization_active",
          presentationKey:
            "authorization.reason.source.selected_authorization_active",
          severity: "info",
          sortOrder: 1,
        },
      ],
    },
    contextSection: {
      sectionStatus: "local_view_section_only",
      sectionKey: "authorization.reason.view_section.context",
      sectionSeverity: "info",
      contextItems: [
        {
          contextType: "paper",
          publicId: "paper_public_123",
          reasonCode: "context_matches_authorization",
          presentationKey:
            "authorization.reason.context.paper.context_matches_authorization",
          severity: "info",
          sortOrder: 1,
        },
      ],
    },
    evidenceSection: {
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
      ],
    },
    plaintextRedeemCode,
    rawAuditLogPayload,
    rawAiCallLogPayload,
  };
}

describe("authorization reason view model summary service", () => {
  it("builds an aggregate local_view_model_only contract from view sections", () => {
    const result = buildAuthorizationReasonViewModelSummaryReadModel(
      createViewSectionSummaryInput(),
    );
    const serializedResult = JSON.stringify(result);

    expect(result).toMatchObject({
      code: 0,
      message: "ok",
      data: {
        userPublicId: "user_public_123",
        authorizationPublicId: "personal_auth_public_123",
        summaryStatus: "local_view_model_only",
        sourceSummaryStatus: "local_view_section_only",
        statusModel: {
          modelKey: "authorization.reason.view_model.status",
          selectedAuthorizationPublicId: "personal_auth_public_123",
        },
        contextModel: {
          modelKey: "authorization.reason.view_model.context",
          contextCards: [
            {
              contextType: "paper",
              publicId: "paper_public_123",
            },
          ],
        },
        evidenceModel: {
          modelKey: "authorization.reason.view_model.evidence",
          evidenceChips: [
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
      buildAuthorizationReasonViewModelSummaryReadModel({
        ...createViewSectionSummaryInput(),
        statusSection: {
          ...createViewSectionSummaryInput().statusSection,
          selectedAuthorizationPublicId: "org_auth_public_mismatch",
        },
      }),
    ).toEqual({
      code: 400035,
      message: "Invalid authorization reason view model summary input.",
      data: null,
    });
  });
});

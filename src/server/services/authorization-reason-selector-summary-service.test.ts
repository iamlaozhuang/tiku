import { describe, expect, it } from "vitest";

import { buildAuthorizationReasonSelectorSummaryReadModel } from "./authorization-reason-selector-summary-service";

const plaintextRedeemCode = "plain-redeem-code-value";
const rawAuditLogPayload = "raw-audit-log-payload";
const rawAiCallLogPayload = "raw-ai-call-log-payload";

function createViewModelSummaryInput() {
  return {
    id: 1001,
    userPublicId: "user_public_123",
    authorizationPublicId: "personal_auth_public_123",
    summaryStatus: "local_view_model_only",
    sourceSummaryStatus: "local_view_section_only",
    statusModel: {
      viewModelStatus: "local_view_model_only",
      sourceSectionStatus: "local_view_section_only",
      modelKey: "authorization.reason.view_model.status",
      severity: "info",
      selectedAuthorizationPublicId: "personal_auth_public_123",
      statusRows: [
        {
          rowKey: "authorization.reason.view_model.status.source",
          reasonCode: "selected_authorization_active",
          presentationKey:
            "authorization.reason.source.selected_authorization_active",
          severity: "info",
          sortOrder: 1,
        },
      ],
    },
    contextModel: {
      viewModelStatus: "local_view_model_only",
      sourceSectionStatus: "local_view_section_only",
      modelKey: "authorization.reason.view_model.context",
      severity: "attention",
      contextCards: [
        {
          cardKey: "authorization.reason.view_model.context.paper",
          contextType: "paper",
          publicId: "paper_public_123",
          reasonCode: "context_mismatch",
          presentationKey: "authorization.reason.context_mismatch",
          severity: "attention",
          sortOrder: 1,
        },
      ],
    },
    evidenceModel: {
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
          presentationKey: "authorization.reason.evidence.redeem_code",
          sortOrder: 1,
        },
      ],
    },
    plaintextRedeemCode,
    rawAuditLogPayload,
    rawAiCallLogPayload,
  };
}

describe("authorization reason selector summary service", () => {
  it("builds a local selector summary from view models", () => {
    const result = buildAuthorizationReasonSelectorSummaryReadModel(
      createViewModelSummaryInput(),
    );
    const serializedResult = JSON.stringify(result);

    expect(result).toEqual({
      code: 0,
      message: "ok",
      data: {
        userPublicId: "user_public_123",
        authorizationPublicId: "personal_auth_public_123",
        selectorStatus: "local_selector_only",
        sourceSummaryStatus: "local_view_model_only",
        selectorKey: "authorization.reason.selector.summary",
        statusSelector: {
          selectorStatus: "local_selector_only",
          sourceViewModelStatus: "local_view_model_only",
          selectorKey: "authorization.reason.selector.status",
          selectedAuthorizationPublicId: "personal_auth_public_123",
          severity: "info",
          primaryReasonCode: "selected_authorization_active",
          statusRowCount: 1,
        },
        contextSelector: {
          selectorStatus: "local_selector_only",
          sourceViewModelStatus: "local_view_model_only",
          selectorKey: "authorization.reason.selector.context",
          severity: "attention",
          paperPublicId: "paper_public_123",
          mockExamPublicId: null,
          contextCardCount: 1,
        },
        evidenceSelector: {
          selectorStatus: "local_selector_only",
          sourceViewModelStatus: "local_view_model_only",
          selectorKey: "authorization.reason.selector.evidence",
          severity: "info",
          redeemCodePublicId: "redeem_code_public_123",
          auditLogPublicId: null,
          aiCallLogPublicId: null,
          evidenceChipCount: 1,
        },
      },
    });
    expect(serializedResult).not.toMatch(/"id":/);
    expect(serializedResult).not.toContain(plaintextRedeemCode);
    expect(serializedResult).not.toContain(rawAuditLogPayload);
    expect(serializedResult).not.toContain(rawAiCallLogPayload);
  });

  it("rejects authorization public id mismatches", () => {
    expect(
      buildAuthorizationReasonSelectorSummaryReadModel({
        ...createViewModelSummaryInput(),
        statusModel: {
          ...createViewModelSummaryInput().statusModel,
          selectedAuthorizationPublicId: "personal_auth_public_other",
        },
      }),
    ).toEqual({
      code: 400039,
      message: "Invalid authorization reason selector summary input.",
      data: null,
    });
  });
});

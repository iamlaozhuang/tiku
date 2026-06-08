import { describe, expect, it } from "vitest";

import { normalizeAuthorizationReasonSelectorActionContractInput } from "./authorization-reason-selector-action-contract";

function createSelectorSummary() {
  return {
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
      severity: "info",
      paperPublicId: "paper_public_123",
      mockExamPublicId: "mock_exam_public_123",
      contextCardCount: 2,
    },
    evidenceSelector: {
      selectorStatus: "local_selector_only",
      sourceViewModelStatus: "local_view_model_only",
      selectorKey: "authorization.reason.selector.evidence",
      severity: "info",
      redeemCodePublicId: "redeem_code_public_123",
      auditLogPublicId: "audit_log_public_123",
      aiCallLogPublicId: "ai_call_log_public_123",
      evidenceChipCount: 3,
    },
  };
}

describe("authorization reason selector action contract validator", () => {
  it("normalizes selector summary input for a local server action contract", () => {
    expect(
      normalizeAuthorizationReasonSelectorActionContractInput({
        userContext: {
          userPublicId: " user_public_123 ",
        },
        authorizationPublicId: " personal_auth_public_123 ",
        selectorSummary: createSelectorSummary(),
      }),
    ).toMatchObject({
      success: true,
      value: {
        userContext: {
          userPublicId: "user_public_123",
        },
        authorizationPublicId: "personal_auth_public_123",
      },
    });
  });

  it("rejects user public id mismatches", () => {
    expect(
      normalizeAuthorizationReasonSelectorActionContractInput({
        userContext: {
          userPublicId: "user_public_other",
        },
        authorizationPublicId: "personal_auth_public_123",
        selectorSummary: createSelectorSummary(),
      }),
    ).toEqual({
      success: false,
      message: "Invalid authorization reason selector action contract input.",
    });
  });
});

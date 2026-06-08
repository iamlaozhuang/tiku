import { describe, expect, it } from "vitest";

import { normalizeAuthorizationReasonSelectorApiContractInput } from "./authorization-reason-selector-api-contract";

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

describe("authorization reason selector API contract validator", () => {
  it("normalizes local selector summary input for a local API contract", () => {
    expect(
      normalizeAuthorizationReasonSelectorApiContractInput({
        method: "POST",
        userPublicId: " user_public_123 ",
        authorizationPublicId: " personal_auth_public_123 ",
        selectorSummary: createSelectorSummary(),
      }),
    ).toMatchObject({
      success: true,
      value: {
        method: "POST",
        userPublicId: "user_public_123",
        authorizationPublicId: "personal_auth_public_123",
      },
    });
  });

  it("rejects authorization public id mismatches", () => {
    expect(
      normalizeAuthorizationReasonSelectorApiContractInput({
        method: "POST",
        userPublicId: "user_public_123",
        authorizationPublicId: "personal_auth_public_other",
        selectorSummary: createSelectorSummary(),
      }),
    ).toEqual({
      success: false,
      message: "Invalid authorization reason selector API contract input.",
    });
  });
});

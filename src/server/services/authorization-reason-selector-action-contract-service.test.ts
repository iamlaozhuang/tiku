import { describe, expect, it } from "vitest";

import { buildAuthorizationReasonSelectorActionContract } from "./authorization-reason-selector-action-contract-service";

const plaintextRedeemCode = "plain-redeem-code-value";
const rawAuditLogPayload = "raw-audit-log-payload";
const rawAiCallLogPayload = "raw-ai-call-log-payload";

function createSelectorSummary() {
  return {
    id: 1001,
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
    plaintextRedeemCode,
    rawAuditLogPayload,
    rawAiCallLogPayload,
  };
}

describe("authorization reason selector action contract service", () => {
  it("builds a local server action contract envelope without sensitive fields", () => {
    const result = buildAuthorizationReasonSelectorActionContract({
      userContext: {
        userPublicId: "user_public_123",
      },
      authorizationPublicId: "personal_auth_public_123",
      selectorSummary: createSelectorSummary(),
    });
    const serializedResult = JSON.stringify(result);

    expect(result).toEqual({
      code: 0,
      message: "ok",
      data: {
        userPublicId: "user_public_123",
        authorizationPublicId: "personal_auth_public_123",
        actionContractStatus: "local_server_action_contract_only",
        sourceSelectorStatus: "local_selector_only",
        actionKey: "authorization.reason.selector.server_action_contract",
        evidenceReferenceStatus: "redacted_reference",
        selectorSummary: expect.objectContaining({
          userPublicId: "user_public_123",
          authorizationPublicId: "personal_auth_public_123",
          contextSelector: expect.objectContaining({
            paperPublicId: "paper_public_123",
            mockExamPublicId: "mock_exam_public_123",
          }),
          evidenceSelector: expect.objectContaining({
            redeemCodePublicId: "redeem_code_public_123",
            auditLogPublicId: "audit_log_public_123",
            aiCallLogPublicId: "ai_call_log_public_123",
          }),
        }),
      },
    });
    expect(serializedResult).not.toMatch(/"id":/);
    expect(serializedResult).not.toContain(plaintextRedeemCode);
    expect(serializedResult).not.toContain(rawAuditLogPayload);
    expect(serializedResult).not.toContain(rawAiCallLogPayload);
  });

  it("rejects selector summaries for a different user", () => {
    expect(
      buildAuthorizationReasonSelectorActionContract({
        userContext: {
          userPublicId: "user_public_other",
        },
        authorizationPublicId: "personal_auth_public_123",
        selectorSummary: createSelectorSummary(),
      }),
    ).toEqual({
      code: 400041,
      message: "Invalid authorization reason selector action contract input.",
      data: null,
    });
  });
});

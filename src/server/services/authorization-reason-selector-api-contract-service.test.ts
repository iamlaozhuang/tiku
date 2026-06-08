import { describe, expect, it } from "vitest";

import { buildAuthorizationReasonSelectorApiContract } from "./authorization-reason-selector-api-contract-service";

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
      severity: "attention",
      primaryReasonCode: "context_mismatch",
      statusRowCount: 2,
    },
    contextSelector: {
      selectorStatus: "local_selector_only",
      sourceViewModelStatus: "local_view_model_only",
      selectorKey: "authorization.reason.selector.context",
      severity: "attention",
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

describe("authorization reason selector API contract service", () => {
  it("builds a local API contract envelope without sensitive fields", () => {
    const result = buildAuthorizationReasonSelectorApiContract({
      method: "POST",
      userPublicId: "user_public_123",
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
        apiContractStatus: "local_api_contract_only",
        sourceSelectorStatus: "local_selector_only",
        contractKey: "authorization.reason.selector.api_contract",
        method: "POST",
        apiPathTemplate:
          "/api/v1/authorizations/{authorizationPublicId}/preview-reason-selector",
        apiPath:
          "/api/v1/authorizations/personal_auth_public_123/preview-reason-selector",
        evidenceReferenceStatus: "redacted_reference",
        selectorSummary: {
          userPublicId: "user_public_123",
          authorizationPublicId: "personal_auth_public_123",
          selectorStatus: "local_selector_only",
          sourceSummaryStatus: "local_view_model_only",
          selectorKey: "authorization.reason.selector.summary",
          statusSelector: expect.objectContaining({
            selectedAuthorizationPublicId: "personal_auth_public_123",
          }),
          contextSelector: expect.objectContaining({
            paperPublicId: "paper_public_123",
            mockExamPublicId: "mock_exam_public_123",
          }),
          evidenceSelector: expect.objectContaining({
            redeemCodePublicId: "redeem_code_public_123",
            auditLogPublicId: "audit_log_public_123",
            aiCallLogPublicId: "ai_call_log_public_123",
          }),
        },
      },
    });
    expect(serializedResult).not.toMatch(/"id":/);
    expect(serializedResult).not.toContain(plaintextRedeemCode);
    expect(serializedResult).not.toContain(rawAuditLogPayload);
    expect(serializedResult).not.toContain(rawAiCallLogPayload);
  });

  it("rejects selector summaries for a different authorization", () => {
    expect(
      buildAuthorizationReasonSelectorApiContract({
        method: "POST",
        userPublicId: "user_public_123",
        authorizationPublicId: "personal_auth_public_other",
        selectorSummary: createSelectorSummary(),
      }),
    ).toEqual({
      code: 400040,
      message: "Invalid authorization reason selector API contract input.",
      data: null,
    });
  });
});

import { describe, expect, it } from "vitest";

import { buildAuthorizationReasonContextSelectorReadModel } from "./authorization-reason-context-selector-service";

const plaintextRedeemCode = "plain-redeem-code-value";
const rawAuditLogPayload = "raw-audit-log-payload";
const rawAiCallLogPayload = "raw-ai-call-log-payload";

function createContextModelInput() {
  return {
    id: 1001,
    viewModelStatus: "local_view_model_only",
    sourceSectionStatus: "local_view_section_only",
    modelKey: "authorization.reason.view_model.context",
    severity: "info",
    contextCards: [
      {
        cardKey: "authorization.reason.view_model.context.mock_exam",
        contextType: "mock_exam",
        publicId: "mock_public_123",
        reasonCode: "context_matches_authorization",
        presentationKey: "authorization.reason.context_matches_authorization",
        severity: "info",
        sortOrder: 2,
      },
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
    plaintextRedeemCode,
    rawAuditLogPayload,
    rawAiCallLogPayload,
  };
}

describe("authorization reason context selector service", () => {
  it("selects context public ids, highest severity, and card count", () => {
    const result = buildAuthorizationReasonContextSelectorReadModel(
      createContextModelInput(),
    );
    const serializedResult = JSON.stringify(result);

    expect(result).toEqual({
      code: 0,
      message: "ok",
      data: {
        selectorStatus: "local_selector_only",
        sourceViewModelStatus: "local_view_model_only",
        selectorKey: "authorization.reason.selector.context",
        severity: "attention",
        paperPublicId: "paper_public_123",
        mockExamPublicId: "mock_public_123",
        contextCardCount: 2,
      },
    });
    expect(serializedResult).not.toMatch(/"id":/);
    expect(serializedResult).not.toContain(plaintextRedeemCode);
    expect(serializedResult).not.toContain(rawAuditLogPayload);
    expect(serializedResult).not.toContain(rawAiCallLogPayload);
  });

  it("returns null context ids when optional context cards are absent", () => {
    expect(
      buildAuthorizationReasonContextSelectorReadModel({
        ...createContextModelInput(),
        severity: "info",
        contextCards: [],
      }),
    ).toEqual({
      code: 0,
      message: "ok",
      data: {
        selectorStatus: "local_selector_only",
        sourceViewModelStatus: "local_view_model_only",
        selectorKey: "authorization.reason.selector.context",
        severity: "info",
        paperPublicId: null,
        mockExamPublicId: null,
        contextCardCount: 0,
      },
    });
  });

  it("rejects invalid context selector model keys", () => {
    expect(
      buildAuthorizationReasonContextSelectorReadModel({
        ...createContextModelInput(),
        modelKey: "authorization.reason.view_model.status",
      }),
    ).toEqual({
      code: 400037,
      message: "Invalid authorization reason context selector input.",
      data: null,
    });
  });
});

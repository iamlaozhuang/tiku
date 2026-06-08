import { describe, expect, it } from "vitest";

import { buildAuthorizationReasonStatusSelectorReadModel } from "./authorization-reason-status-selector-service";

const plaintextRedeemCode = "plain-redeem-code-value";
const rawAuditLogPayload = "raw-audit-log-payload";
const rawAiCallLogPayload = "raw-ai-call-log-payload";

function createStatusModelInput() {
  return {
    id: 1001,
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
      {
        rowKey: "authorization.reason.view_model.status.window",
        reasonCode: "authorization_window_expired",
        presentationKey: "authorization.reason.authorization_window_expired",
        severity: "attention",
        sortOrder: 2,
      },
    ],
    plaintextRedeemCode,
    rawAuditLogPayload,
    rawAiCallLogPayload,
  };
}

describe("authorization reason status selector service", () => {
  it("selects selected authorization, highest severity, primary reason, and row count", () => {
    const result = buildAuthorizationReasonStatusSelectorReadModel(
      createStatusModelInput(),
    );
    const serializedResult = JSON.stringify(result);

    expect(result).toEqual({
      code: 0,
      message: "ok",
      data: {
        selectorStatus: "local_selector_only",
        sourceViewModelStatus: "local_view_model_only",
        selectorKey: "authorization.reason.selector.status",
        selectedAuthorizationPublicId: "personal_auth_public_123",
        severity: "attention",
        primaryReasonCode: "authorization_window_expired",
        statusRowCount: 2,
      },
    });
    expect(serializedResult).not.toMatch(/"id":/);
    expect(serializedResult).not.toContain(plaintextRedeemCode);
    expect(serializedResult).not.toContain(rawAuditLogPayload);
    expect(serializedResult).not.toContain(rawAiCallLogPayload);
  });

  it("rejects invalid status selector model keys", () => {
    expect(
      buildAuthorizationReasonStatusSelectorReadModel({
        ...createStatusModelInput(),
        modelKey: "authorization.reason.view_model.context",
      }),
    ).toEqual({
      code: 400036,
      message: "Invalid authorization reason status selector input.",
      data: null,
    });
  });
});

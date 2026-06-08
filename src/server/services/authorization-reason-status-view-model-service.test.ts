import { describe, expect, it } from "vitest";

import { buildAuthorizationReasonStatusViewModelReadModel } from "./authorization-reason-status-view-model-service";

const plaintextRedeemCode = "plain-redeem-code-value";
const rawAuditLogPayload = "raw-audit-log-payload";
const rawAiCallLogPayload = "raw-ai-call-log-payload";

function createStatusSectionInput() {
  return {
    id: 99,
    sectionStatus: "local_view_section_only",
    sectionKey: "authorization.reason.view_section.status",
    sectionSeverity: "attention",
    selectedAuthorizationPublicId: "personal_auth_public_123",
    statusItems: [
      {
        itemKey: "authorization.reason.status.window",
        reasonCode: "authorization_window_expired",
        presentationKey: "authorization.reason.authorization_window_expired",
        severity: "attention",
        sortOrder: 2,
      },
      {
        itemKey: "authorization.reason.status.source",
        reasonCode: "selected_authorization_active",
        presentationKey:
          "authorization.reason.source.selected_authorization_active",
        severity: "info",
        sortOrder: 1,
      },
    ],
    plaintextRedeemCode,
    rawAuditLogPayload,
    rawAiCallLogPayload,
  };
}

describe("authorization reason status view model service", () => {
  it("projects selected authorization and window status rows into a local_view_model_only model", () => {
    const result = buildAuthorizationReasonStatusViewModelReadModel(
      createStatusSectionInput(),
    );
    const serializedResult = JSON.stringify(result);

    expect(result).toEqual({
      code: 0,
      message: "ok",
      data: {
        viewModelStatus: "local_view_model_only",
        sourceSectionStatus: "local_view_section_only",
        modelKey: "authorization.reason.view_model.status",
        severity: "attention",
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
            presentationKey:
              "authorization.reason.authorization_window_expired",
            severity: "attention",
            sortOrder: 2,
          },
        ],
      },
    });
    expect(serializedResult).not.toMatch(/"id":/);
    expect(serializedResult).not.toContain(plaintextRedeemCode);
    expect(serializedResult).not.toContain(rawAuditLogPayload);
    expect(serializedResult).not.toContain(rawAiCallLogPayload);
  });

  it("rejects invalid status section keys", () => {
    expect(
      buildAuthorizationReasonStatusViewModelReadModel({
        ...createStatusSectionInput(),
        sectionKey: "authorization.reason.view_section.context",
      }),
    ).toEqual({
      code: 400032,
      message: "Invalid authorization reason status view model input.",
      data: null,
    });
  });
});

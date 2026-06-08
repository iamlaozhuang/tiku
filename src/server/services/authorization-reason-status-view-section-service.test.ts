import { describe, expect, it } from "vitest";

import { buildAuthorizationReasonStatusViewSectionReadModel } from "./authorization-reason-status-view-section-service";

const plaintextRedeemCode = "plain-redeem-code-value";
const rawAuditLogPayload = "raw-audit-log-payload";
const rawAiCallLogPayload = "raw-ai-call-log-payload";

describe("authorization reason status view section service", () => {
  it("groups selected authorization source and window reasons into a local_view_section_only status section", () => {
    const result = buildAuthorizationReasonStatusViewSectionReadModel({
      id: 981,
      presentationStatus: "local_presentation_only",
      authorizationPublicId: "personal_auth_public_123",
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
          reasonCode: "authorization_window_expired",
          presentationKey: "authorization.reason.authorization_window_expired",
          severity: "attention",
          sortOrder: 2,
        },
        {
          reasonCode: "context_mismatch",
          presentationKey: "authorization.reason.context_mismatch",
          severity: "attention",
          sortOrder: 3,
        },
      ],
      plaintextRedeemCode,
      rawAuditLogPayload,
      rawAiCallLogPayload,
    });
    const serializedResult = JSON.stringify(result);

    expect(result).toEqual({
      code: 0,
      message: "ok",
      data: {
        sectionStatus: "local_view_section_only",
        sectionKey: "authorization.reason.view_section.status",
        sectionSeverity: "attention",
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
          {
            itemKey: "authorization.reason.status.window",
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

  it("rejects inconsistent selected authorization references", () => {
    expect(
      buildAuthorizationReasonStatusViewSectionReadModel({
        presentationStatus: "local_presentation_only",
        authorizationPublicId: "personal_auth_public_123",
        sourcePresentation: {
          selectedAuthorizationPublicId: "org_auth_public_mismatch",
          sourceReasonCode: "selected_authorization_active",
          presentationKey:
            "authorization.reason.source.selected_authorization_active",
          severity: "info",
        },
        reasonItems: [],
      }),
    ).toEqual({
      code: 400028,
      message: "Invalid authorization reason status view section input.",
      data: null,
    });
  });
});

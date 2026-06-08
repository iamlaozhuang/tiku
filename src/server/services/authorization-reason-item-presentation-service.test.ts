import { describe, expect, it } from "vitest";

import { buildAuthorizationReasonItemPresentationReadModel } from "./authorization-reason-item-presentation-service";

const plaintextRedeemCode = "plain-redeem-code-value";
const rawAuditLogPayload = "raw-audit-log-payload";
const rawAiCallLogPayload = "raw-ai-call-log-payload";

describe("authorization reason item presentation service", () => {
  it("maps ordered reason_summary_only codes to local_presentation_only entries", () => {
    const result = buildAuthorizationReasonItemPresentationReadModel({
      id: 971,
      reasonStatus: "reason_summary_only",
      reasonCodes: [
        "selected_authorization_active",
        "authorization_window_within_window",
        "context_matches_authorization",
        "redacted_references_present",
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
        presentationStatus: "local_presentation_only",
        reasonItems: [
          {
            reasonCode: "selected_authorization_active",
            presentationKey:
              "authorization.reason.selected_authorization_active",
            severity: "info",
            sortOrder: 1,
          },
          {
            reasonCode: "authorization_window_within_window",
            presentationKey:
              "authorization.reason.authorization_window_within_window",
            severity: "info",
            sortOrder: 2,
          },
          {
            reasonCode: "context_matches_authorization",
            presentationKey:
              "authorization.reason.context_matches_authorization",
            severity: "info",
            sortOrder: 3,
          },
          {
            reasonCode: "redacted_references_present",
            presentationKey: "authorization.reason.redacted_references_present",
            severity: "info",
            sortOrder: 4,
          },
        ],
      },
    });
    expect(serializedResult).not.toMatch(/"id":/);
    expect(serializedResult).not.toContain(plaintextRedeemCode);
    expect(serializedResult).not.toContain(rawAuditLogPayload);
    expect(serializedResult).not.toContain(rawAiCallLogPayload);
  });

  it("marks inactive window and context mismatch codes as attention without enforcing authorization", () => {
    expect(
      buildAuthorizationReasonItemPresentationReadModel({
        reasonStatus: "reason_summary_only",
        reasonCodes: [
          "selected_authorization_inactive",
          "authorization_window_expired",
          "context_mismatch",
          "redacted_references_missing",
        ],
      }).data,
    ).toMatchObject({
      presentationStatus: "local_presentation_only",
      reasonItems: [
        {
          reasonCode: "selected_authorization_inactive",
          severity: "attention",
        },
        {
          reasonCode: "authorization_window_expired",
          severity: "attention",
        },
        {
          reasonCode: "context_mismatch",
          severity: "attention",
        },
        {
          reasonCode: "redacted_references_missing",
          severity: "attention",
        },
      ],
    });
  });
});

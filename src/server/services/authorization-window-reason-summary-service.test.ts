import { describe, expect, it } from "vitest";

import { buildAuthorizationWindowReasonSummaryReadModel } from "./authorization-window-reason-summary-service";

const plaintextRedeemCode = "plain-redeem-code-value";
const rawAuditLogPayload = "raw-audit-log-payload";

function createBaseInput() {
  return {
    id: 970,
    userPublicId: "user_public_123",
    authorizationPublicId: "personal_auth_public_123",
    startsAt: "2026-06-01T00:00:00.000Z",
    expiresAt: "2026-07-01T00:00:00.000Z",
    currentAt: "2026-06-08T00:00:00.000Z",
    plaintextRedeemCode,
    rawAuditLogPayload,
  };
}

describe("authorization window reason summary service", () => {
  it("builds reason_summary_only window reason metadata without sensitive fields", () => {
    const result =
      buildAuthorizationWindowReasonSummaryReadModel(createBaseInput());
    const serializedResult = JSON.stringify(result);

    expect(result).toEqual({
      code: 0,
      message: "ok",
      data: {
        userPublicId: "user_public_123",
        authorizationPublicId: "personal_auth_public_123",
        reasonStatus: "reason_summary_only",
        startsAt: "2026-06-01T00:00:00.000Z",
        expiresAt: "2026-07-01T00:00:00.000Z",
        currentAt: "2026-06-08T00:00:00.000Z",
        windowReasonCode: "authorization_window_within_window",
      },
    });
    expect(serializedResult).not.toMatch(/"id":/);
    expect(serializedResult).not.toContain(plaintextRedeemCode);
    expect(serializedResult).not.toContain(rawAuditLogPayload);
  });

  it("summarizes not_started expired and open-ended authorization windows", () => {
    expect(
      buildAuthorizationWindowReasonSummaryReadModel({
        ...createBaseInput(),
        currentAt: "2026-05-01T00:00:00.000Z",
      }).data,
    ).toMatchObject({
      windowReasonCode: "authorization_window_not_started",
    });

    expect(
      buildAuthorizationWindowReasonSummaryReadModel({
        ...createBaseInput(),
        currentAt: "2026-08-01T00:00:00.000Z",
      }).data,
    ).toMatchObject({
      windowReasonCode: "authorization_window_expired",
    });

    expect(
      buildAuthorizationWindowReasonSummaryReadModel({
        ...createBaseInput(),
        expiresAt: null,
      }).data,
    ).toMatchObject({
      expiresAt: null,
      windowReasonCode: "authorization_window_open_ended",
    });
  });

  it("rejects invalid authorization window reason input", () => {
    expect(
      buildAuthorizationWindowReasonSummaryReadModel({
        ...createBaseInput(),
        currentAt: "not-a-date",
      }),
    ).toEqual({
      code: 400020,
      message: "Invalid authorization window reason summary input.",
      data: null,
    });
  });
});

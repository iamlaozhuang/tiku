import { describe, expect, it } from "vitest";

import { buildAuthorizationWindowSummaryReadModel } from "./authorization-window-summary-service";

const plaintextRedeemCode = "plain-redeem-code-value";

function createBaseInput() {
  return {
    id: 930,
    userPublicId: "user_public_123",
    authorizationPublicId: "personal_auth_public_123",
    startsAt: "2026-06-01T00:00:00.000Z",
    expiresAt: "2026-07-01T00:00:00.000Z",
    currentAt: "2026-06-08T00:00:00.000Z",
    plaintextRedeemCode,
  };
}

describe("authorization window summary service", () => {
  it("builds display_only authorization window metadata without sensitive fields", () => {
    const result = buildAuthorizationWindowSummaryReadModel(createBaseInput());
    const serializedResult = JSON.stringify(result);

    expect(result).toEqual({
      code: 0,
      message: "ok",
      data: {
        userPublicId: "user_public_123",
        authorizationPublicId: "personal_auth_public_123",
        displayStatus: "display_only",
        startsAt: "2026-06-01T00:00:00.000Z",
        expiresAt: "2026-07-01T00:00:00.000Z",
        currentAt: "2026-06-08T00:00:00.000Z",
        windowStatus: "within_window",
      },
    });
    expect(serializedResult).not.toMatch(/"id":/);
    expect(serializedResult).not.toContain(plaintextRedeemCode);
  });

  it("supports open-ended authorization display windows", () => {
    expect(
      buildAuthorizationWindowSummaryReadModel({
        ...createBaseInput(),
        expiresAt: null,
      }).data,
    ).toMatchObject({
      displayStatus: "display_only",
      expiresAt: null,
      windowStatus: "open_ended",
    });
  });

  it("rejects invalid authorization window input", () => {
    expect(
      buildAuthorizationWindowSummaryReadModel({
        ...createBaseInput(),
        startsAt: "not-a-date",
      }),
    ).toEqual({
      code: 400016,
      message: "Invalid authorization window summary input.",
      data: null,
    });
  });
});

import { describe, expect, it } from "vitest";

import { normalizeAuthorizationWindowReasonSummaryInput } from "./authorization-window-reason-summary";

describe("authorization window reason summary validator", () => {
  it("normalizes valid authorization window reason input", () => {
    expect(
      normalizeAuthorizationWindowReasonSummaryInput({
        userPublicId: " user_public_123 ",
        authorizationPublicId: " personal_auth_public_123 ",
        startsAt: "2026-06-01T00:00:00Z",
        expiresAt: "2026-07-01T00:00:00Z",
        currentAt: "2026-06-08T00:00:00Z",
      }),
    ).toEqual({
      success: true,
      value: {
        userPublicId: "user_public_123",
        authorizationPublicId: "personal_auth_public_123",
        startsAt: "2026-06-01T00:00:00.000Z",
        expiresAt: "2026-07-01T00:00:00.000Z",
        currentAt: "2026-06-08T00:00:00.000Z",
      },
    });
  });

  it("normalizes missing expiresAt as a null local reason input", () => {
    expect(
      normalizeAuthorizationWindowReasonSummaryInput({
        userPublicId: "user_public_123",
        authorizationPublicId: "org_auth_public_123",
        startsAt: "2026-06-01T00:00:00.000Z",
        currentAt: "2026-06-08T00:00:00.000Z",
      }),
    ).toMatchObject({
      success: true,
      value: {
        expiresAt: null,
      },
    });
  });

  it("rejects invalid authorization window reason input", () => {
    expect(
      normalizeAuthorizationWindowReasonSummaryInput({
        userPublicId: "",
        authorizationPublicId: "personal_auth_public_123",
        startsAt: "2026-06-01T00:00:00.000Z",
        currentAt: "2026-06-08T00:00:00.000Z",
      }).success,
    ).toBe(false);

    expect(
      normalizeAuthorizationWindowReasonSummaryInput({
        userPublicId: "user_public_123",
        authorizationPublicId: "personal_auth_public_123",
        startsAt: "2026-07-01T00:00:00.000Z",
        expiresAt: "2026-06-01T00:00:00.000Z",
        currentAt: "2026-06-08T00:00:00.000Z",
      }).success,
    ).toBe(false);
  });
});

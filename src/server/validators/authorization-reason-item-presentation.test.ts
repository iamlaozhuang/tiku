import { describe, expect, it } from "vitest";

import { normalizeAuthorizationReasonItemPresentationInput } from "./authorization-reason-item-presentation";

describe("authorization reason item presentation validator", () => {
  it("normalizes reason_summary_only reason codes", () => {
    expect(
      normalizeAuthorizationReasonItemPresentationInput({
        reasonStatus: "reason_summary_only",
        reasonCodes: [
          " selected_authorization_active ",
          "authorization_window_within_window",
        ],
      }),
    ).toEqual({
      success: true,
      value: {
        reasonStatus: "reason_summary_only",
        reasonCodes: [
          "selected_authorization_active",
          "authorization_window_within_window",
        ],
      },
    });
  });

  it("rejects unknown authorization reason codes", () => {
    expect(
      normalizeAuthorizationReasonItemPresentationInput({
        reasonStatus: "reason_summary_only",
        reasonCodes: ["unknown_reason_code"],
      }),
    ).toEqual({
      success: false,
      message: "Invalid authorization reason item presentation input.",
    });
  });
});

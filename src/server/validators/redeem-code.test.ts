import { describe, expect, it } from "vitest";

import { normalizeRedeemCodeInput } from "./redeem-code";

describe("redeem code validator", () => {
  it("normalizes redeem code by trimming and uppercasing input", () => {
    expect(
      normalizeRedeemCodeInput({
        code: " abcd2345 ",
      }),
    ).toEqual({
      success: true,
      value: {
        code: "ABCD2345",
      },
    });
  });

  it("rejects empty or non-string redeem code input", () => {
    expect(normalizeRedeemCodeInput({ code: " " })).toEqual({
      success: false,
      message: "Invalid redeem code input.",
    });
    expect(normalizeRedeemCodeInput({ code: 12345678 })).toEqual({
      success: false,
      message: "Invalid redeem code input.",
    });
  });
});

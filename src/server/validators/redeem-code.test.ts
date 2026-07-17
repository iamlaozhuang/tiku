import { describe, expect, it } from "vitest";

import {
  normalizeRedeemCodeConfirmationInput,
  normalizeRedeemCodeInput,
} from "./redeem-code";

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

  it("requires preview version and an explicit personal authorization target", () => {
    expect(
      normalizeRedeemCodeConfirmationInput({
        code: " abcd2345 ",
        previewVersion:
          "sha256:1111111111111111111111111111111111111111111111111111111111111111",
        targetPersonalAuthPublicId: null,
      }),
    ).toEqual({
      success: true,
      value: {
        code: "ABCD2345",
        previewVersion:
          "sha256:1111111111111111111111111111111111111111111111111111111111111111",
        targetPersonalAuthPublicId: null,
      },
    });

    expect(
      normalizeRedeemCodeConfirmationInput({
        code: "ABCD2345",
        previewVersion: "invalid",
      }),
    ).toEqual({
      success: false,
      message: "Invalid redeem code input.",
    });
  });
});

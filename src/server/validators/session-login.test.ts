import { describe, expect, it } from "vitest";

import { normalizeSessionLoginInput } from "./session-login";

describe("normalizeSessionLoginInput", () => {
  it("normalizes phone and password from request body input", () => {
    expect(
      normalizeSessionLoginInput({
        phone: " 13800000000 ",
        password: " abc12345 ",
      }),
    ).toEqual({
      success: true,
      value: {
        phone: "13800000000",
        password: "abc12345",
      },
    });
  });

  it("rejects missing, malformed, or weak login input", () => {
    expect(normalizeSessionLoginInput(null)).toEqual({
      success: false,
      message: "Invalid login input.",
    });
    expect(
      normalizeSessionLoginInput({
        phone: "1380000000",
        password: "abc12345",
      }),
    ).toEqual({
      success: false,
      message: "Invalid login input.",
    });
    expect(
      normalizeSessionLoginInput({
        phone: "13800000000",
        password: "1234567",
      }),
    ).toEqual({
      success: false,
      message: "Invalid login input.",
    });
  });
});

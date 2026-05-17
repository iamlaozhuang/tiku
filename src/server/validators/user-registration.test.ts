import { describe, expect, it } from "vitest";

import { normalizeUserRegistrationInput } from "./user-registration";

describe("normalizeUserRegistrationInput", () => {
  it("normalizes phone, password, and name from request body input", () => {
    expect(
      normalizeUserRegistrationInput({
        phone: " 13800000000 ",
        password: " abc12345 ",
        name: " 张三 ",
      }),
    ).toEqual({
      success: true,
      value: {
        phone: "13800000000",
        password: "abc12345",
        name: "张三",
      },
    });
  });

  it("rejects missing, malformed, or weak registration input", () => {
    expect(normalizeUserRegistrationInput(null)).toEqual({
      success: false,
      message: "Invalid registration input.",
    });
    expect(
      normalizeUserRegistrationInput({
        phone: "1380000000",
        password: "abc12345",
        name: "张三",
      }),
    ).toEqual({
      success: false,
      message: "Invalid registration input.",
    });
    expect(
      normalizeUserRegistrationInput({
        phone: "13800000000",
        password: "12345678",
        name: "张三",
      }),
    ).toEqual({
      success: false,
      message: "Invalid registration input.",
    });
    expect(
      normalizeUserRegistrationInput({
        phone: "13800000000",
        password: "abcdefgh",
        name: "",
      }),
    ).toEqual({
      success: false,
      message: "Invalid registration input.",
    });
  });
});

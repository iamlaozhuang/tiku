import { describe, expect, it } from "vitest";

import {
  normalizeUserRegistrationIdempotencyKey,
  normalizeUserRegistrationInput,
} from "./user-registration";

const TEST_PASSWORD_FIELD = "password";

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
        [TEST_PASSWORD_FIELD]: "abc12345",
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
        [TEST_PASSWORD_FIELD]: "abc12345",
        name: "张三",
      }),
    ).toEqual({
      success: false,
      message: "Invalid registration input.",
    });
    expect(
      normalizeUserRegistrationInput({
        phone: "13800000000",
        [TEST_PASSWORD_FIELD]: "12345678",
        name: "张三",
      }),
    ).toEqual({
      success: false,
      message: "Invalid registration input.",
    });
    expect(
      normalizeUserRegistrationInput({
        phone: "13800000000",
        [TEST_PASSWORD_FIELD]: "abcdefgh",
        name: "",
      }),
    ).toEqual({
      success: false,
      message: "Invalid registration input.",
    });
  });

  it("accepts only a UUID v4 registration idempotency key", () => {
    expect(
      normalizeUserRegistrationIdempotencyKey(
        " 123e4567-e89b-42d3-a456-426614174000 ",
      ),
    ).toBe("123e4567-e89b-42d3-a456-426614174000");
    expect(normalizeUserRegistrationIdempotencyKey(null)).toBeNull();
    expect(normalizeUserRegistrationIdempotencyKey("short")).toBeNull();
    expect(
      normalizeUserRegistrationIdempotencyKey("registration-attempt-123456"),
    ).toBeNull();
    expect(
      normalizeUserRegistrationIdempotencyKey(
        "123e4567-e89b-12d3-a456-426614174000",
      ),
    ).toBeNull();
  });
});

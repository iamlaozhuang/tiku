import { describe, expect, it } from "vitest";

import { normalizeCreateEmployeeAccountInput } from "./employee-account";

describe("normalizeCreateEmployeeAccountInput", () => {
  it("normalizes employee account input from request body values", () => {
    expect(
      normalizeCreateEmployeeAccountInput({
        phone: " 13800000000 ",
        name: " 李四 ",
        initialPassword: " abc12345 ",
        organizationPublicId: " org_public_123 ",
      }),
    ).toEqual({
      success: true,
      value: {
        phone: "13800000000",
        name: "李四",
        initialPassword: "abc12345",
        organizationPublicId: "org_public_123",
      },
    });
  });

  it("rejects missing, malformed, or weak employee account input", () => {
    expect(normalizeCreateEmployeeAccountInput(null)).toEqual({
      success: false,
      message: "Invalid employee account input.",
    });
    expect(
      normalizeCreateEmployeeAccountInput({
        phone: "1380000000",
        name: "李四",
        initialPassword: "abc12345",
        organizationPublicId: "org_public_123",
      }),
    ).toEqual({
      success: false,
      message: "Invalid employee account input.",
    });
    expect(
      normalizeCreateEmployeeAccountInput({
        phone: "13800000000",
        name: "李四",
        initialPassword: "12345678",
        organizationPublicId: "org_public_123",
      }),
    ).toEqual({
      success: false,
      message: "Invalid employee account input.",
    });
    expect(
      normalizeCreateEmployeeAccountInput({
        phone: "13800000000",
        name: "",
        initialPassword: "abc12345",
        organizationPublicId: "",
      }),
    ).toEqual({
      success: false,
      message: "Invalid employee account input.",
    });
  });
});

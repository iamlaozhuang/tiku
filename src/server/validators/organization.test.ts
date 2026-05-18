import { describe, expect, it } from "vitest";

import {
  normalizeCreateOrganizationInput,
  normalizeDisableOrganizationInput,
  normalizeUpdateOrganizationInput,
} from "./organization";

describe("organization validators", () => {
  it("normalizes create organization input with nullable optional fields", () => {
    expect(
      normalizeCreateOrganizationInput({
        name: "  杭州烟草  ",
        orgTier: "city",
        parentOrganizationPublicId: " org_parent_123 ",
        contactName: "",
        contactPhone: " 13800000000 ",
        remark: undefined,
      }),
    ).toEqual({
      success: true,
      value: {
        name: "杭州烟草",
        orgTier: "city",
        parentOrganizationPublicId: "org_parent_123",
        contactName: null,
        contactPhone: "13800000000",
        remark: null,
      },
    });
  });

  it("rejects invalid organization tier and empty name", () => {
    expect(
      normalizeCreateOrganizationInput({
        name: "",
        orgTier: "county",
      }),
    ).toEqual({
      success: false,
      message: "Invalid organization input.",
    });
  });

  it("normalizes update and disable inputs", () => {
    expect(
      normalizeUpdateOrganizationInput({
        name: " 市局 ",
        orgTier: "district",
        parentOrganizationPublicId: null,
        status: "active",
      }),
    ).toEqual({
      success: true,
      value: {
        name: "市局",
        orgTier: "district",
        parentOrganizationPublicId: null,
        status: "active",
        contactName: null,
        contactPhone: null,
        remark: null,
      },
    });

    expect(
      normalizeDisableOrganizationInput({
        isCascade: true,
      }),
    ).toEqual({
      success: true,
      value: {
        isCascade: true,
      },
    });
  });
});

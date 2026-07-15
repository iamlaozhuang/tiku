import { describe, expect, it } from "vitest";

import {
  normalizeCreateOrganizationInput,
  normalizeDisableOrganizationInput,
  normalizeMoveOrganizationInput,
  normalizeUpdateOrganizationInput,
  validateOrganizationTierParent,
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
        expectedRevision: 3,
        name: " 市局 ",
      }),
    ).toEqual({
      success: true,
      value: {
        name: "市局",
        expectedRevision: 3,
        contactName: null,
        contactPhone: null,
        remark: null,
      },
    });

    expect(
      normalizeDisableOrganizationInput({
        expectedRevision: 4,
        isCascade: true,
      }),
    ).toEqual({
      success: true,
      value: {
        expectedRevision: 4,
        isCascade: true,
      },
    });
  });

  it("separates profile, move and status commands with positive revisions", () => {
    expect(
      normalizeMoveOrganizationInput({
        expectedRevision: 5,
        parentOrganizationPublicId: " org_parent_456 ",
      }),
    ).toEqual({
      success: true,
      value: {
        expectedRevision: 5,
        parentOrganizationPublicId: "org_parent_456",
      },
    });
    expect(
      normalizeUpdateOrganizationInput({
        expectedRevision: 1,
        name: "市局",
        parentOrganizationPublicId: "org_parent_456",
      }),
    ).toEqual({
      success: false,
      message: "Invalid organization input.",
    });
    expect(
      normalizeMoveOrganizationInput({
        expectedRevision: 1,
        name: "越权改名",
        parentOrganizationPublicId: null,
      }),
    ).toEqual({
      success: false,
      message: "Invalid organization input.",
    });
    expect(normalizeDisableOrganizationInput({ expectedRevision: 0 })).toEqual({
      success: false,
      message: "Invalid organization input.",
    });
    expect(normalizeMoveOrganizationInput({ expectedRevision: 5 })).toEqual({
      success: false,
      message: "Invalid organization input.",
    });
  });

  it("validates organization tier and parent tier rules", () => {
    expect(
      validateOrganizationTierParent({
        orgTier: "province",
        parentOrganization: null,
      }),
    ).toEqual({ success: true });
    expect(
      validateOrganizationTierParent({
        orgTier: "city",
        parentOrganization: { orgTier: "province" },
      }),
    ).toEqual({ success: true });
    expect(
      validateOrganizationTierParent({
        orgTier: "district",
        parentOrganization: { orgTier: "city" },
      }),
    ).toEqual({ success: true });
    expect(
      validateOrganizationTierParent({
        orgTier: "station",
        parentOrganization: { orgTier: "district" },
      }),
    ).toEqual({ success: true });

    expect(
      validateOrganizationTierParent({
        orgTier: "province",
        parentOrganization: { orgTier: "city" },
      }),
    ).toEqual({
      success: false,
      message: "Province organization cannot have a parent organization.",
    });
    expect(
      validateOrganizationTierParent({
        orgTier: "district",
        parentOrganization: { orgTier: "province" },
      }),
    ).toEqual({
      success: false,
      message: "District organization parent must be a city organization.",
    });
  });
});

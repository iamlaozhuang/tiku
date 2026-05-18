import { describe, expect, it } from "vitest";

import { normalizeCreateOrgAuthInput } from "./org-auth";

describe("org auth validators", () => {
  it("normalizes org auth input for specified organization scope", () => {
    expect(
      normalizeCreateOrgAuthInput({
        name: "  2026 杭州授权 ",
        purchaserOrganizationPublicId: " org_purchaser_123 ",
        authScopeType: "specified_nodes",
        profession: "monopoly",
        level: 3,
        accountQuota: 100,
        startsAt: "2026-05-18T04:00:00.000Z",
        expiresAt: "2027-05-18T04:00:00.000Z",
        organizationPublicIds: [" org_city_123 ", "org_district_456"],
      }),
    ).toEqual({
      success: true,
      value: {
        name: "2026 杭州授权",
        purchaserOrganizationPublicId: "org_purchaser_123",
        authScopeType: "specified_nodes",
        profession: "monopoly",
        level: 3,
        accountQuota: 100,
        startsAt: new Date("2026-05-18T04:00:00.000Z"),
        expiresAt: new Date("2027-05-18T04:00:00.000Z"),
        organizationPublicIds: ["org_city_123", "org_district_456"],
      },
    });
  });

  it("rejects invalid scope, quota, date range, and empty specified nodes", () => {
    expect(
      normalizeCreateOrgAuthInput({
        name: "授权",
        purchaserOrganizationPublicId: "org_purchaser_123",
        authScopeType: "specified_nodes",
        profession: "monopoly",
        level: 3,
        accountQuota: 0,
        startsAt: "2027-05-18T04:00:00.000Z",
        expiresAt: "2026-05-18T04:00:00.000Z",
        organizationPublicIds: [],
      }),
    ).toEqual({
      success: false,
      message: "Invalid org auth input.",
    });
  });
});

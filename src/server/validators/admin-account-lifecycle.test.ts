import { describe, expect, it } from "vitest";

import { normalizeAdminAccountUpdateInput } from "./admin-account-lifecycle";

describe("admin account lifecycle validator", () => {
  it("accepts a multi-role account with one organization and a CAS timestamp", () => {
    expect(
      normalizeAdminAccountUpdateInput({
        name: "区域内容管理员",
        adminRoles: ["content_admin", "org_advanced_admin"],
        organizationPublicId: "organization-public-001",
        expectedUpdatedAt: "2026-07-14T20:00:00.000Z",
      }),
    ).toEqual({
      success: true,
      value: {
        name: "区域内容管理员",
        adminRoles: ["content_admin", "org_advanced_admin"],
        organizationPublicId: "organization-public-001",
        expectedUpdatedAt: new Date("2026-07-14T20:00:00.000Z"),
      },
    });
  });

  it.each([
    {
      name: "empty roles",
      input: {
        name: "后台管理员",
        adminRoles: [],
        organizationPublicId: null,
        expectedUpdatedAt: "2026-07-14T20:00:00.000Z",
      },
    },
    {
      name: "duplicate roles",
      input: {
        name: "后台管理员",
        adminRoles: ["ops_admin", "ops_admin"],
        organizationPublicId: null,
        expectedUpdatedAt: "2026-07-14T20:00:00.000Z",
      },
    },
    {
      name: "organization role without organization",
      input: {
        name: "后台管理员",
        adminRoles: ["org_standard_admin"],
        organizationPublicId: null,
        expectedUpdatedAt: "2026-07-14T20:00:00.000Z",
      },
    },
    {
      name: "platform role with stale organization",
      input: {
        name: "后台管理员",
        adminRoles: ["content_admin"],
        organizationPublicId: "organization-public-001",
        expectedUpdatedAt: "2026-07-14T20:00:00.000Z",
      },
    },
    {
      name: "invalid CAS timestamp",
      input: {
        name: "后台管理员",
        adminRoles: ["content_admin"],
        organizationPublicId: null,
        expectedUpdatedAt: "not-a-timestamp",
      },
    },
  ])("rejects $name", ({ input }) => {
    expect(normalizeAdminAccountUpdateInput(input)).toEqual({
      success: false,
      message: "Invalid admin account update input.",
    });
  });
});

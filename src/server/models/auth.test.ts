import { describe, expect, it } from "vitest";

import {
  adminRoleValues,
  authScopeTypeValues,
  authStatusValues,
  orgTierValues,
  redeemCodeStatusValues,
  userStatusValues,
  userTypeValues,
  type AdminRow,
  type OrgAuthRow,
  type UserRow,
} from "./auth";

describe("auth domain models", () => {
  it("registers enum values from the approved glossary and auth contract", () => {
    expect(userTypeValues).toEqual(["personal", "employee"]);
    expect(userStatusValues).toEqual(["active", "disabled"]);
    expect(adminRoleValues).toEqual([
      "super_admin",
      "ops_admin",
      "content_admin",
    ]);
    expect(orgTierValues).toEqual(["province", "city", "district", "station"]);
    expect(authScopeTypeValues).toEqual([
      "current_and_descendants",
      "specified_nodes",
    ]);
    expect(authStatusValues).toEqual(["active", "expired", "cancelled"]);
    expect(redeemCodeStatusValues).toEqual(["unused", "used", "expired"]);
  });

  it("keeps database row fields in snake_case and API identifiers separate", () => {
    const userRow = {
      id: 1,
      public_id: "usr_public_id",
      auth_user_id: "better_auth_user_id",
      phone: "13800000000",
      name: "张三",
      user_type: "personal",
      status: "active",
      login_failed_count: 0,
      locked_until_at: null,
      disabled_at: null,
      created_at: new Date("2026-05-17T00:00:00.000Z"),
      updated_at: new Date("2026-05-17T00:00:00.000Z"),
    } satisfies UserRow;

    expect(userRow.public_id).toBe("usr_public_id");
    expect(userRow).not.toHaveProperty("publicId");
  });

  it("keeps admin accounts and enterprise auth as separate model shapes", () => {
    const adminRow = {
      id: 1,
      public_id: "admin_public_id",
      auth_user_id: "better_auth_admin_id",
      phone: "13900000000",
      name: "运营管理员",
      admin_role: "ops_admin",
      status: "active",
      created_at: new Date("2026-05-17T00:00:00.000Z"),
      updated_at: new Date("2026-05-17T00:00:00.000Z"),
    } satisfies AdminRow;

    const orgAuthRow = {
      id: 1,
      public_id: "org_auth_public_id",
      name: "省级企业授权",
      purchaser_organization_id: 1,
      auth_scope_type: "current_and_descendants",
      profession: "monopoly",
      level: 3,
      account_quota: 100,
      used_quota: 0,
      starts_at: new Date("2026-05-17T00:00:00.000Z"),
      expires_at: new Date("2027-05-17T00:00:00.000Z"),
      status: "active",
      cancelled_at: null,
      created_at: new Date("2026-05-17T00:00:00.000Z"),
      updated_at: new Date("2026-05-17T00:00:00.000Z"),
    } satisfies OrgAuthRow;

    expect(adminRow).not.toHaveProperty("user_type");
    expect(orgAuthRow).toMatchObject({
      auth_scope_type: "current_and_descendants",
      used_quota: 0,
    });
  });
});

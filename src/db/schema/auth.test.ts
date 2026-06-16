import { getTableName } from "drizzle-orm";
import { getTableConfig } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";

import {
  admin,
  adminOrganization,
  authAccount,
  authSession,
  authUser,
  authVerification,
  employee,
  orgAuth,
  orgAuthOrganization,
  organization,
  personalAuth,
  redeemCode,
  student,
  user,
} from "./auth";

function getColumnNames(table: Parameters<typeof getTableConfig>[0]): string[] {
  return getTableConfig(table).columns.map((column) => column.name);
}

function getIndexNames(table: Parameters<typeof getTableConfig>[0]): string[] {
  return getTableConfig(table).indexes.flatMap((schemaIndex) =>
    schemaIndex.config.name ? [schemaIndex.config.name] : [],
  );
}

describe("auth schema baseline", () => {
  it("keeps Better Auth adapter tables behind the auth prefix boundary", () => {
    expect([
      getTableName(authUser),
      getTableName(authSession),
      getTableName(authAccount),
      getTableName(authVerification),
    ]).toEqual([
      "auth_user",
      "auth_session",
      "auth_account",
      "auth_verification",
    ]);

    expect(getColumnNames(authSession)).toEqual(
      expect.arrayContaining([
        "id",
        "expires_at",
        "token",
        "created_at",
        "updated_at",
        "ip_address",
        "user_agent",
        "user_id",
      ]),
    );
  });

  it("defines the approved Tiku user and organization business tables", () => {
    expect([
      getTableName(user),
      getTableName(student),
      getTableName(admin),
      getTableName(organization),
      getTableName(employee),
    ]).toEqual(["user", "student", "admin", "organization", "employee"]);

    expect(getColumnNames(user)).toEqual(
      expect.arrayContaining([
        "id",
        "public_id",
        "auth_user_id",
        "phone",
        "name",
        "user_type",
        "status",
        "login_failed_count",
        "locked_until_at",
        "disabled_at",
        "created_at",
        "updated_at",
      ]),
    );
    expect(getColumnNames(organization)).toContain("parent_organization_id");
    expect(getColumnNames(employee)).toEqual(
      expect.arrayContaining(["public_id", "user_id", "organization_id"]),
    );
  });

  it("defines personal and enterprise authorization schema with named indexes", () => {
    expect([
      getTableName(redeemCode),
      getTableName(personalAuth),
      getTableName(orgAuth),
      getTableName(orgAuthOrganization),
    ]).toEqual([
      "redeem_code",
      "personal_auth",
      "org_auth",
      "org_auth_organization",
    ]);

    expect(getColumnNames(orgAuth)).toEqual(
      expect.arrayContaining([
        "purchaser_organization_id",
        "auth_scope_type",
        "account_quota",
        "used_quota",
        "cancelled_at",
      ]),
    );
    expect(getIndexNames(user)).toEqual(
      expect.arrayContaining([
        "udx_user_public_id",
        "udx_user_auth_user_id",
        "udx_user_phone",
      ]),
    );
    expect(getIndexNames(orgAuthOrganization)).toContain(
      "udx_org_auth_organization_org_auth_id_organization_id",
    );
  });

  it("defines admin organization assignments for visible organization scope", () => {
    expect(getTableName(adminOrganization)).toBe("admin_organization");

    expect(getColumnNames(adminOrganization)).toEqual(
      expect.arrayContaining([
        "id",
        "admin_id",
        "organization_id",
        "created_at",
      ]),
    );
    expect(getIndexNames(adminOrganization)).toEqual(
      expect.arrayContaining([
        "udx_admin_organization_admin_id_organization_id",
        "idx_admin_organization_admin_id",
        "idx_admin_organization_organization_id",
      ]),
    );
  });
});

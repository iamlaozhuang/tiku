import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

function readSource(path: string): string {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

function readFunction(source: string, name: string, nextName: string): string {
  const start = source.indexOf(name);
  const end = source.indexOf(nextName, start + name.length);

  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);

  return source.slice(start, end);
}

describe("P0 RC-02 organization scope, quota and employee lifecycle", () => {
  it("models revisioned organization writes and provable quota reservations", () => {
    const schemaSource = readSource("src/db/schema/auth.ts");

    expect(schemaSource).toContain('revision: integer("revision")');
    expect(schemaSource).toContain("export const employeeOrgAuth = pgTable(");
    expect(schemaSource).toContain('"employee_org_auth"');
    expect(schemaSource).toContain(
      '"udx_employee_org_auth_employee_id_org_auth_id"',
    );
  });

  it("derives current_and_descendants from the current bounded acyclic tree", () => {
    const scopeSource = readSource(
      "src/server/repositories/organization-scope-query.ts",
    );

    expect(scopeSource).toContain("with recursive organization_ancestor");
    expect(scopeSource).toContain("visited_organization_ids");
    expect(scopeSource).toContain("current_and_descendants");
    expect(scopeSource).toContain("specified_nodes");
    expect(scopeSource).toContain("org_auth_organization");
    expect(scopeSource).toContain("parent_organization_id is null");
  });

  it("fails closed when a descendant traversal exceeds four levels or repeats a node", () => {
    const repositorySource = readSource(
      "src/server/repositories/admin-organization-org-auth-runtime-repository.ts",
    );
    const traversalSource = readFunction(
      repositorySource,
      "async function listOrganizationAndDescendantIds",
      "async function countActiveEmployeesByOrganizationIds",
    );

    expect(traversalSource).toContain("MAX_ORGANIZATION_TREE_DEPTH - 1");
    expect(traversalSource).toContain("visitedOrganizationIds");
    expect(traversalSource).toContain("overflowOrganization");
    expect(traversalSource).toContain(
      "throw new OrganizationTreeConflictError",
    );
  });

  it("removes auth_scope_type from the effective overlap identity", () => {
    const repositorySource = readSource(
      "src/server/repositories/admin-organization-org-auth-runtime-repository.ts",
    );
    const overlapSource = readFunction(
      repositorySource,
      "async function hasOverlappingOrgAuthWithOrganizationIds",
      "async function listOrganizationAndDescendantIds",
    );

    expect(overlapSource).toContain("createOrgAuthCoversOrganizationCondition");
    expect(overlapSource).not.toContain(
      "eq(orgAuth.auth_scope_type, input.authScopeType)",
    );
  });

  it("uses one atomic quota command for every employee lifecycle write", () => {
    const quotaSource = readSource(
      "src/server/repositories/employee-org-auth-quota-repository.ts",
    );
    const repositorySource = readSource(
      "src/server/repositories/admin-organization-org-auth-runtime-repository.ts",
    );
    const adminFlowSource = readSource(
      "src/server/repositories/admin-flow-runtime-repository.ts",
    );
    const disableEmployeeSource = readFunction(
      repositorySource,
      "async disableEmployee(input)",
      "async transferEmployee(input)",
    );

    expect(quotaSource).toContain("reserveEmployeeOrgAuthQuota");
    expect(quotaSource).toContain("releaseEmployeeOrgAuthQuota");
    expect(quotaSource).toContain("lockOrganizationScopeMutation");
    expect(quotaSource).toContain("employeeOrgAuth");
    expect(quotaSource).toContain('row.user_type === "employee"');
    expect(repositorySource).toContain("reserveEmployeeOrgAuthQuota");
    expect(repositorySource).toContain("releaseEmployeeOrgAuthQuota");
    expect(repositorySource).toContain(
      'row.user_type === "employee" ? row.employee_public_id : null',
    );
    expect(repositorySource).toContain('eq(user.user_type, "employee")');
    expect(adminFlowSource).toContain("setEmployeeAccountStatusWithQuota");
    expect(quotaSource).toContain("hashtext(${`org-auth:${orgAuthId}`})");
    expect(quotaSource).toContain("authSession");
    expect(quotaSource).toContain('practice_status: "terminated"');
    expect(quotaSource).toContain('exam_status: "terminated"');
    expect(disableEmployeeSource).toContain(
      "setEmployeeAccountStatusWithQuota",
    );
    expect(disableEmployeeSource).not.toContain("database.transaction");
  });

  it("requires a quota reservation in employee authorization consumers", () => {
    const employeeConsumers = [
      "src/server/repositories/student-authorization-redeem-runtime-repository.ts",
      "src/server/repositories/student-flow-runtime-repository.ts",
      "src/server/repositories/mistake-book-repository.ts",
    ];

    for (const consumerPath of employeeConsumers) {
      const source = readSource(consumerPath);

      expect(source, consumerPath).toContain("employeeOrgAuth");
      expect(source, consumerPath).toContain(
        "createOrgAuthCoversOrganizationCondition",
      );
    }
  });

  it("seeds current tree authorization without a stale scope snapshot and with quota proof", () => {
    const devSeedSource = readSource("src/db/dev-seed.ts");

    expect(devSeedSource).not.toContain("insert into org_auth_organization");
    expect(devSeedSource).toContain("insert into employee_org_auth");
    expect(devSeedSource).toContain("employee_org_auth_count");
  });

  it("separates profile edit, super-only move, disable and enable commands", () => {
    const serviceSource = readSource(
      "src/server/services/admin-organization-org-auth-runtime.ts",
    );
    const repositorySource = readSource(
      "src/server/repositories/admin-organization-org-auth-runtime-repository.ts",
    );
    const updateSource = readFunction(
      repositorySource,
      "async updateOrganization(publicId, input)",
      "async moveOrganization(input)",
    );

    expect(serviceSource).toContain("canMoveOrganization");
    expect(serviceSource).toContain("organization.move");
    expect(repositorySource).toContain("expectedRevision");
    expect(repositorySource).toContain("ORGANIZATION_TREE_CONFLICT");
    expect(updateSource).toContain("lockOrganizationScopeMutation");
    expect(updateSource).not.toContain("parent_organization_id:");
    expect(updateSource).not.toContain("org_tier:");
    expect(updateSource).not.toContain("status:");
  });

  it("accepts exactly one import target and removes the per-row organization bypass", () => {
    const runtimeSource = readSource(
      "src/server/services/admin-organization-org-auth-runtime.ts",
    );
    const repositorySource = readSource(
      "src/server/repositories/admin-organization-org-auth-runtime-repository.ts",
    );
    const uiSource = readSource(
      "src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx",
    );

    expect(runtimeSource).toContain("targetOrganizationPublicId");
    expect(runtimeSource).not.toContain('kind: "existing_user_bind"');
    expect(runtimeSource).not.toContain("employees: normalizedInput.employees");
    expect(repositorySource).not.toContain("async createEmployee(input)");
    expect(uiSource).not.toContain("isLegacyPublicIdImport");
    expect(uiSource).not.toContain(
      "employees: legacyRows.map(([userPublicId, organizationPublicId])",
    );
  });
});

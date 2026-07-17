import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

function readSource(path: string): string {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

function extractBetween(
  source: string,
  startPattern: string,
  endPattern: string,
): string {
  const start = source.indexOf(startPattern);
  const end = source.indexOf(endPattern, start);

  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);

  return source.slice(start, end);
}

describe("phase 20 RA-01-12 employee transfer unbind", () => {
  it("exposes the employee transfer route with public ids", () => {
    const routePath = "src/app/api/v1/employees/[publicId]/transfer/route.ts";

    expect(existsSync(resolve(process.cwd(), routePath))).toBe(true);

    const routeSource = readSource(routePath);

    expect(routeSource).toMatch(/employees\s*\.\s*transfer\s*\.\s*POST/u);
    expect(routeSource).not.toContain("id]");
  });

  it("passes transfer target organization public id into employee repository logic", () => {
    const serviceSource = readSource(
      "src/server/services/admin-organization-org-auth-runtime.ts",
    );
    const transferSource = extractBetween(
      serviceSource,
      "transfer:",
      "unbind:",
    );

    expect(transferSource).toContain("targetOrganizationPublicId");
    expect(transferSource).toContain("repositories.transferEmployee({");
    expect(transferSource).toContain(
      'metadataSummary: "redacted employee transfer metadata"',
    );
    expect(transferSource).toContain("EmployeeTransferResultDto");
  });

  it("exposes the organization-scoped employee unbind route with public ids", () => {
    const routePath =
      "src/app/api/v1/organizations/[publicId]/employees/[employeePublicId]/unbind/route.ts";

    expect(existsSync(resolve(process.cwd(), routePath))).toBe(true);

    const routeSource = readSource(routePath);

    expect(routeSource).toMatch(
      /employees\s*\.\s*organizationUnbind\s*\.\s*POST/u,
    );
    expect(routeSource).not.toContain("id]");
  });

  it("passes both organization and employee public ids into unbind repository logic", () => {
    const serviceSource = readSource(
      "src/server/services/admin-organization-org-auth-runtime.ts",
    );
    const unbindSource = extractBetween(
      serviceSource,
      "organizationUnbind:",
      "disable:",
    );

    expect(unbindSource).toContain("organizationPublicId");
    expect(unbindSource).toContain("employeePublicId");
    expect(unbindSource).toContain("repositories.unbindEmployee({");
    expect(unbindSource).toContain(
      'metadataSummary: "redacted employee unbind metadata"',
    );
  });

  it("requires the employee to belong to the organization path before unbinding", () => {
    const repositorySource = readSource(
      "src/server/repositories/admin-organization-org-auth-runtime-repository.ts",
    );
    const unbindSource = extractBetween(
      repositorySource,
      "async unbindEmployee(input)",
      "auditLogRepository:",
    );

    expect(repositorySource).toContain("export type EmployeeUnbindInput");
    expect(unbindSource).toContain("organizationPublicId");
    expect(unbindSource).toContain(
      "eq(organization.public_id, organizationPublicId)",
    );
    expect(unbindSource).toMatch(
      /eq\(\s*organizationTrainingAnswer\.organization_training_answer_status,\s*"in_progress"/u,
    );
    expect(unbindSource).toContain(
      'organization_training_answer_status: "read_only"',
    );
  });

  it("transfers employees transactionally with quota refresh, session revocation, and old training blocking", () => {
    const repositorySource = readSource(
      "src/server/repositories/admin-organization-org-auth-runtime-repository.ts",
    );
    const transferSource = extractBetween(
      repositorySource,
      "async transferEmployee(input)",
      "async unbindEmployee(input)",
    );

    expect(repositorySource).toContain("export type EmployeeTransferInput");
    expect(transferSource).toContain("targetOrganizationPublicId");
    expect(transferSource).toContain("lockOrganizationScopeMutation");
    expect(transferSource).toContain("releaseEmployeeOrgAuthQuota");
    expect(transferSource).toContain("reserveEmployeeOrgAuthQuota");
    expect(transferSource).toContain("requireCurrentAuthorization: true");
    expect(transferSource).toContain("employee.organization_id");
    expect(transferSource).toContain("authSession");
    expect(transferSource).toContain("organizationTrainingAnswer");
    expect(transferSource).toContain("employeeRow.organization_id");
    expect(transferSource).toContain("targetOrganizationRow.id");
  });

  it("releases org_auth quota and organization employee counts after unbind", () => {
    const repositorySource = readSource(
      "src/server/repositories/admin-organization-org-auth-runtime-repository.ts",
    );
    const employeeCountSource = extractBetween(
      repositorySource,
      "async function listEmployeeCounts",
      "async function listOrganizationAuthSummaries",
    );
    const activeCountSource = extractBetween(
      repositorySource,
      "async function countActiveEmployeesByOrganizationIds",
      "async function terminateOrganizationActiveFlows",
    );

    expect(employeeCountSource).toContain(".innerJoin(user");
    expect(employeeCountSource).toContain('eq(user.user_type, "employee")');
    expect(activeCountSource).toContain('eq(user.user_type, "employee")');
  });

  it("treats retained employee rows as historical in current session and operations projections", () => {
    const sessionSource = readSource(
      "src/server/auth/local-session-runtime.ts",
    );
    const sessionMapperSource = extractBetween(
      sessionSource,
      "function mapUserAccountRow(row:",
      "function createAdminRolesSql",
    );
    const adminRepositorySource = readSource(
      "src/server/repositories/admin-flow-runtime-repository.ts",
    );
    const listUsersSource = extractBetween(
      adminRepositorySource,
      "async listUsers(query)",
      "async getUserDetail(publicId)",
    );
    const userDetailSource = extractBetween(
      adminRepositorySource,
      "async getUserDetail(publicId)",
      "async getUserPhoneForDisclosure(publicId)",
    );

    expect(sessionMapperSource).toContain('row.user_type === "employee"');
    expect(listUsersSource).toContain('row.user_type === "employee"');
    expect(userDetailSource).toContain(
      'userDetailRow.user_type === "employee"',
    );
  });

  it("serializes employee training writes with unbind and rechecks current membership", () => {
    const trainingRepositorySource = readSource(
      "src/server/repositories/organization-training-repository.ts",
    );
    const saveDraftSource = extractBetween(
      trainingRepositorySource,
      "async saveEmployeeAnswerDraftTransaction(input)",
      "async submitEmployeeAnswerTransaction(input)",
    );
    const submitSource = extractBetween(
      trainingRepositorySource,
      "async submitEmployeeAnswerTransaction(input)",
      "async insertManualDraft(input)",
    );

    for (const transactionSource of [saveDraftSource, submitSource]) {
      expect(transactionSource).toContain("lockEmployeeIdentity");
      expect(transactionSource).toContain("hasCurrentEmployeeMembership");
      expect(transactionSource.indexOf("lockEmployeeIdentity")).toBeLessThan(
        transactionSource.indexOf("hasCurrentEmployeeMembership"),
      );
      expect(
        transactionSource.indexOf("hasCurrentEmployeeMembership"),
      ).toBeLessThan(transactionSource.indexOf("hashtextextended"));
    }

    expect(trainingRepositorySource).toContain(
      "employeeOrgAuthId: lineage.employeeOrgAuthId",
    );
    expect(trainingRepositorySource).toContain(
      "eq(employeeOrgAuth.id, input.employeeOrgAuthId)",
    );
  });

  it("reuses the retained employee identity for controlled re-entry", () => {
    const repositorySource = readSource(
      "src/server/repositories/admin-organization-org-auth-runtime-repository.ts",
    );
    const bindSource = extractBetween(
      repositorySource,
      "async function bindEmployeeAccountWithDatabase",
      "function createOrganizationConditions",
    );

    expect(bindSource).toContain("existingEmployee");
    expect(bindSource).toContain(
      "lockEmployeeIdentity(database, existingEmployee.public_id)",
    );
    expect(bindSource).toContain(".update(employee)");
    expect(bindSource).toContain("releaseEmployeeOrgAuthQuota");
    expect(bindSource).toContain("reserveEmployeeOrgAuthQuota");
    expect(bindSource).toContain('reservationResult !== "reserved"');
    expect(bindSource).toContain(
      "throw new EmployeeAccountMutationError(reservationResult)",
    );
  });

  it("removes org_auth visibility from unbound users while preserving historical records", () => {
    const redeemRuntimeSource = readSource(
      "src/server/repositories/student-authorization-redeem-runtime-repository.ts",
    );
    const studentFlowSource = readSource(
      "src/server/repositories/student-flow-runtime-repository.ts",
    );
    const mistakeBookSource = readSource(
      "src/server/repositories/mistake-book-repository.ts",
    );

    expect(redeemRuntimeSource).toContain('eq(user.user_type, "employee")');
    expect(redeemRuntimeSource).toContain("employeeOrgAuth");
    expect(studentFlowSource).toContain('eq(user.user_type, "employee")');
    expect(studentFlowSource).toContain("employeeOrgAuth");
    expect(mistakeBookSource).toContain('eq(user.user_type, "employee")');
    expect(mistakeBookSource).toContain("employeeOrgAuth");
    expect(studentFlowSource).toContain("examReport.user_id");
  });
});

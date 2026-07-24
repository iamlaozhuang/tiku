import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

function readSource(path: string): string {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

function readBetween(source: string, startMarker: string, endMarker: string) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start + startMarker.length);

  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);

  return source.slice(start, end);
}

describe("F-0012 employee disable active-flow equivalence", () => {
  it("uses one shared lifecycle transaction for generic user and employee identities", () => {
    const quotaRepository = readSource(
      "src/server/repositories/employee-org-auth-quota-repository.ts",
    );
    const organizationRepository = readSource(
      "src/server/repositories/admin-organization-org-auth-runtime-repository.ts",
    );
    const sharedCommand = readBetween(
      quotaRepository,
      "export async function setEmployeeAccountStatusWithQuota",
      "export { lockEmployeeIdentity",
    );
    const employeeCommand = readBetween(
      organizationRepository,
      "async disableEmployee(input)",
      "async transferEmployee(input)",
    );

    expect(sharedCommand).toContain('input.identityKind === "employee"');
    expect(sharedCommand).toContain("employeePublicId");
    expect(sharedCommand).toContain("organizationTrainingAnswer");
    expect(sharedCommand).toContain('"employee.disable"');
    expect(sharedCommand).toContain('target_resource_type: "employee"');
    expect(employeeCommand).toContain("setEmployeeAccountStatusWithQuota");
    expect(employeeCommand).not.toContain("database.transaction");
    expect(employeeCommand).not.toContain('practice_status: "terminated"');
    expect(employeeCommand).not.toContain('exam_status: "terminated"');
  });

  it("derives the employee success audit inside the transaction and never appends it after commit", () => {
    const service = readSource(
      "src/server/services/admin-organization-org-auth-runtime.ts",
    );
    const disableRoute = readBetween(
      service,
      "const commandResult = await repositories.disableEmployee",
      "transfer: {",
    );

    expect(service).toContain("function readEmployeeManagerRole");
    expect(service).toContain(
      'actor.roles.includes("super_admin") ? "super_admin" : "ops_admin"',
    );
    expect(disableRoute).toContain("readEmployeeManagerRole(actorOrError)");
    expect(disableRoute).toContain("successAuditPersisted");
    expect(disableRoute).not.toContain('resultStatus: "success"');
    expect(disableRoute).not.toContain(
      'metadataSummary: "redacted employee disable metadata"',
    );
  });

  it("keeps success audit identity and result facts out of the employee caller contract", () => {
    const repository = readSource(
      "src/server/repositories/admin-organization-org-auth-runtime-repository.ts",
    );
    const employeeInput = readBetween(
      repository,
      "export type EmployeeDisableCommandInput",
      "export type EmployeeUnbindInput",
    );

    expect(employeeInput).toContain("employeePublicId: string");
    expect(employeeInput).toContain("operator:");
    expect(employeeInput).not.toContain("actionType");
    expect(employeeInput).not.toContain("targetResourceType");
    expect(employeeInput).not.toContain("resultStatus");
    expect(employeeInput).not.toContain("metadataSummary");
  });
});

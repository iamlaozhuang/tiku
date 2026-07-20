import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

function readSource(path: string): string {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

describe("P1 employee import command atomicity static smoke", () => {
  it("keeps claim, row outcome, audit and completion inside repository transactions", () => {
    const source = readSource(
      "src/server/repositories/postgres-employee-import-command-repository.ts",
    );

    expect(source).toContain("claimCommand");
    expect(source).toContain("database.transaction");
    expect(source).toContain("transaction.transaction");
    expect(source).toContain("employeeImportRow");
    expect(source).toContain("auditLog");
    expect(source).toContain("finalizeCommandWhenNoPendingRows");
  });

  it("forces current organization authorization in create and bind primitives", () => {
    const source = readSource(
      "src/server/repositories/admin-organization-org-auth-runtime-repository.ts",
    );
    const matches = source.match(/requireCurrentAuthorization: true/gu) ?? [];

    expect(matches).toHaveLength(3);
    expect(source).toContain(
      "export type AdminOrganizationOrgAuthRuntimeDatabase",
    );
    expect(source).toContain(
      "export async function createEmployeeAccountWithDatabase",
    );
    expect(source).toContain(
      "export async function bindEmployeeAccountWithDatabase",
    );
  });

  it("serializes org auth cancellation with employee quota reservation", () => {
    const source = readSource(
      "src/server/repositories/admin-organization-org-auth-runtime-repository.ts",
    );
    const cancelStart = source.indexOf(
      "async cancelOrgAuth(publicId, operator)",
    );
    const cancelEnd = source.indexOf(
      "async upgradeOrgAuth(input)",
      cancelStart,
    );
    const cancelSource = source.slice(cancelStart, cancelEnd);

    expect(cancelStart).toBeGreaterThan(-1);
    expect(cancelEnd).toBeGreaterThan(cancelStart);
    expect(cancelSource).toContain("database.transaction");
    expect(cancelSource).toContain("lockOrganizationScopeMutation");
    expect(cancelSource.indexOf("lockOrganizationScopeMutation")).toBeLessThan(
      cancelSource.indexOf(".update(orgAuth)"),
    );
  });

  it("does not persist raw idempotency keys, phone, names or password values", () => {
    const source = readSource(
      "src/server/repositories/postgres-employee-import-command-repository.ts",
    );
    const commandValuesStart = source.indexOf(".insert(employeeImportCommand)");
    const commandValuesEnd = source.indexOf(".returning", commandValuesStart);
    const commandValues = source.slice(commandValuesStart, commandValuesEnd);

    expect(commandValuesStart).toBeGreaterThanOrEqual(0);
    expect(commandValues).not.toMatch(
      /idempotencyKey|\.phone|\.name|initialPassword|passwordHash/u,
    );
    expect(source).not.toContain("appendEmployeeAuditLog");
  });

  it("uses set queries for command rows instead of per-row result reads", () => {
    const source = readSource(
      "src/server/repositories/postgres-employee-import-command-repository.ts",
    );

    expect(source).toContain("readEmployeeImportCommandRecord");
    expect(source).toContain("inArray(employee.id");
    expect(source).not.toMatch(
      /for\s*\([^)]*row[^)]*\)[\s\S]{0,400}\.select\(/u,
    );
  });
});

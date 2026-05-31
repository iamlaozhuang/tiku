import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

function readRepositorySource(): string {
  return readFileSync(
    resolve(
      process.cwd(),
      "src/server/repositories/admin-organization-org-auth-runtime-repository.ts",
    ),
    "utf8",
  );
}

function extractCreateOrgAuthSource(repositorySource: string): string {
  const start = repositorySource.indexOf("async createOrgAuth(input)");
  const end = repositorySource.indexOf("async cancelOrgAuth(publicId)", start);

  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);

  return repositorySource.slice(start, end);
}

describe("phase 20 RA-01-11 org_auth quota atomicity", () => {
  it("keeps org_auth quota counting and record creation inside one repository transaction", () => {
    const createOrgAuthSource = extractCreateOrgAuthSource(
      readRepositorySource(),
    );
    const transactionIndex = createOrgAuthSource.indexOf(
      "database.transaction",
    );
    const usedQuotaIndex = createOrgAuthSource.indexOf(
      "countActiveEmployeesByOrganizationIds",
    );
    const orgAuthInsertIndex = createOrgAuthSource.indexOf(".insert(orgAuth)");
    const scopeInsertIndex = createOrgAuthSource.indexOf(
      ".insert(orgAuthOrganization)",
    );

    expect(transactionIndex).toBeGreaterThanOrEqual(0);
    expect(usedQuotaIndex).toBeGreaterThan(transactionIndex);
    expect(orgAuthInsertIndex).toBeGreaterThan(usedQuotaIndex);
    expect(scopeInsertIndex).toBeGreaterThan(orgAuthInsertIndex);
  });

  it("serializes overlapping org_auth scope checks before quota counting and insertion", () => {
    const repositorySource = readRepositorySource();
    const createOrgAuthSource = extractCreateOrgAuthSource(repositorySource);
    const lockIndex = createOrgAuthSource.indexOf("lockOrgAuthQuotaScope");
    const overlapIndex = createOrgAuthSource.indexOf(
      "hasOverlappingOrgAuthWithOrganizationIds",
    );
    const usedQuotaIndex = createOrgAuthSource.indexOf(
      "countActiveEmployeesByOrganizationIds",
    );
    const orgAuthInsertIndex = createOrgAuthSource.indexOf(".insert(orgAuth)");

    expect(lockIndex).toBeGreaterThanOrEqual(0);
    expect(repositorySource).toContain("pg_advisory_xact_lock");
    expect(overlapIndex).toBeGreaterThan(lockIndex);
    expect(usedQuotaIndex).toBeGreaterThan(overlapIndex);
    expect(orgAuthInsertIndex).toBeGreaterThan(usedQuotaIndex);
  });
});

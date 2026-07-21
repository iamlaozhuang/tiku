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

function extractCreateOrgAuthAtomSource(repositorySource: string): string {
  const start = repositorySource.indexOf("async function createOrgAuthAtom");
  const end = repositorySource.indexOf(
    "async function appendTransactionalOrgAuthAuditLog",
    start,
  );

  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);

  return repositorySource.slice(start, end);
}

describe("phase 20 RA-01-11 org_auth quota atomicity", () => {
  it("keeps org_auth quota counting and record creation inside one repository transaction", () => {
    const repositorySource = readRepositorySource();
    const createOrgAuthSource = extractCreateOrgAuthSource(repositorySource);
    const createOrgAuthAtomSource =
      extractCreateOrgAuthAtomSource(repositorySource);
    const transactionIndex = createOrgAuthSource.indexOf(
      "database.transaction",
    );
    const atomCallIndex = createOrgAuthSource.indexOf("createOrgAuthAtom");
    const usedQuotaIndex = createOrgAuthAtomSource.indexOf(
      "countActiveEmployeesByOrganizationIds",
    );
    const orgAuthInsertIndex =
      createOrgAuthAtomSource.indexOf(".insert(orgAuth)");
    const scopeInsertIndex = createOrgAuthAtomSource.indexOf(
      ".insert(orgAuthOrganization)",
    );

    expect(transactionIndex).toBeGreaterThanOrEqual(0);
    expect(atomCallIndex).toBeGreaterThan(transactionIndex);
    expect(usedQuotaIndex).toBeGreaterThanOrEqual(0);
    expect(orgAuthInsertIndex).toBeGreaterThan(usedQuotaIndex);
    expect(scopeInsertIndex).toBeGreaterThan(orgAuthInsertIndex);
  });

  it("serializes overlapping org_auth scope checks before quota counting and insertion", () => {
    const repositorySource = readRepositorySource();
    const createOrgAuthAtomSource =
      extractCreateOrgAuthAtomSource(repositorySource);
    const lockIndex = createOrgAuthAtomSource.indexOf("lockOrgAuthQuotaScope");
    const overlapIndex = createOrgAuthAtomSource.indexOf(
      "hasOverlappingOrgAuthWithOrganizationIds",
    );
    const usedQuotaIndex = createOrgAuthAtomSource.indexOf(
      "countActiveEmployeesByOrganizationIds",
    );
    const orgAuthInsertIndex =
      createOrgAuthAtomSource.indexOf(".insert(orgAuth)");

    expect(lockIndex).toBeGreaterThanOrEqual(0);
    expect(repositorySource).toContain("pg_advisory_xact_lock");
    expect(overlapIndex).toBeGreaterThan(lockIndex);
    expect(usedQuotaIndex).toBeGreaterThan(overlapIndex);
    expect(orgAuthInsertIndex).toBeGreaterThan(usedQuotaIndex);
  });
});

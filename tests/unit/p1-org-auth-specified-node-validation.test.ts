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

function readBetween(source: string, startMarker: string, endMarker: string) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start + startMarker.length);

  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);

  return source.slice(start, end);
}

describe("F-0112 org_auth specified-node validation", () => {
  it("locks and requires an active purchaser inside the creation transaction", () => {
    const repositorySource = readRepositorySource();
    const createCommand = readBetween(
      repositorySource,
      "async createOrgAuth(input)",
      "async cancelOrgAuth(publicId, operator)",
    );
    const createAtom = readBetween(
      repositorySource,
      "async function createOrgAuthAtom",
      "async function appendTransactionalOrgAuthAuditLog",
    );

    expect(createCommand).toContain("createOrgAuthAtom");
    expect(createCommand.indexOf("database.transaction")).toBeLessThan(
      createCommand.indexOf("createOrgAuthAtom"),
    );
    expect(createAtom).toContain("lockActiveOrganizationByPublicId");
    expect(createAtom.indexOf("lockActiveOrganizationByPublicId")).toBeLessThan(
      createAtom.indexOf("resolveLockedOrganizationIdsForCreate"),
    );
  });

  it("resolves the complete distinct specified-node set under row locks", () => {
    const repositorySource = readRepositorySource();
    const resolver = readBetween(
      repositorySource,
      "async function resolveLockedOrganizationIdsForCreate",
      "async function lockActiveOrganizationByPublicId",
    );

    expect(resolver).toContain("new Set(input.organizationPublicIds)");
    expect(resolver).toContain('.for("update")');
    expect(resolver).toContain('row.status !== "active"');
    expect(resolver).toContain(
      "rows.length !== distinctOrganizationPublicIds.length",
    );
    expect(resolver).toContain("return null");
  });

  it("locks the purchaser row and rejects missing or disabled purchasers", () => {
    const repositorySource = readRepositorySource();
    const purchaserLock = readBetween(
      repositorySource,
      "async function lockActiveOrganizationByPublicId",
      "async function listInputOrganizationIds",
    );

    expect(purchaserLock).toContain('.for("update")');
    expect(purchaserLock).toContain('organizationRow.status !== "active"');
    expect(purchaserLock).toContain("return null");
  });

  it("fails validation before overlap, quota, authorization or binding writes", () => {
    const createAtom = readBetween(
      readRepositorySource(),
      "async function createOrgAuthAtom",
      "async function appendTransactionalOrgAuthAuditLog",
    );
    const validationIndex = createAtom.indexOf(
      "resolveLockedOrganizationIdsForCreate",
    );

    expect(validationIndex).toBeGreaterThanOrEqual(0);
    for (const mutationMarker of [
      "lockOrgAuthQuotaScope",
      "hasOverlappingOrgAuthWithOrganizationIds",
      "countActiveEmployeesByOrganizationIds",
      ".insert(orgAuth)",
      ".insert(orgAuthOrganization)",
      ".insert(employeeOrgAuth)",
    ]) {
      expect(createAtom.indexOf(mutationMarker)).toBeGreaterThan(
        validationIndex,
      );
    }
  });
});

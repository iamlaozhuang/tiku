import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

function readSource(path: string): string {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

function extractBetween(source: string, startText: string, endText: string) {
  const start = source.indexOf(startText);
  const end = source.indexOf(endText, start);

  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);

  return source.slice(start, end);
}

describe("phase 21 authorization overlap concurrency proof", () => {
  it("checks every approved org_auth overlap dimension before treating an active authorization as overlapping", () => {
    const repositorySource = readSource(
      "src/server/repositories/admin-organization-org-auth-runtime-repository.ts",
    );
    const overlapSource = extractBetween(
      repositorySource,
      "async function hasOverlappingOrgAuthWithOrganizationIds",
      "async function listOrganizationAndDescendantIds",
    );

    expect(overlapSource).toContain('eq(orgAuth.status, "active")');
    expect(overlapSource).toContain(
      "eq(orgAuth.auth_scope_type, input.authScopeType)",
    );
    expect(overlapSource).toContain("eq(orgAuth.profession, input.profession)");
    expect(overlapSource).toContain("eq(orgAuth.level, input.level)");
    expect(overlapSource).toContain("lt(orgAuth.starts_at, input.expiresAt)");
    expect(overlapSource).toContain("gt(orgAuth.expires_at, input.startsAt)");
    expect(overlapSource).toContain(
      "inArray(orgAuthOrganization.organization_id, organizationIds)",
    );
  });

  it("serializes org_auth creation and rechecks overlap inside the write transaction before insertion", () => {
    const repositorySource = readSource(
      "src/server/repositories/admin-organization-org-auth-runtime-repository.ts",
    );
    const createOrgAuthSource = extractBetween(
      repositorySource,
      "async createOrgAuth(input)",
      "async cancelOrgAuth(publicId)",
    );
    const transactionIndex = createOrgAuthSource.indexOf(
      "database.transaction",
    );
    const lockIndex = createOrgAuthSource.indexOf("lockOrgAuthQuotaScope");
    const overlapIndex = createOrgAuthSource.indexOf(
      "hasOverlappingOrgAuthWithOrganizationIds",
    );
    const insertIndex = createOrgAuthSource.indexOf(".insert(orgAuth)");

    expect(transactionIndex).toBeGreaterThanOrEqual(0);
    expect(repositorySource).toContain("pg_advisory_xact_lock");
    expect(lockIndex).toBeGreaterThan(transactionIndex);
    expect(overlapIndex).toBeGreaterThan(lockIndex);
    expect(insertIndex).toBeGreaterThan(overlapIndex);
  });

  it("maps a post-create overlap recheck to the org_auth overlap envelope for racing writes", () => {
    const serviceSource = readSource(
      "src/server/services/admin-organization-org-auth-runtime.ts",
    );
    const postSource = extractBetween(
      serviceSource,
      "const orgAuth = await repositories.createOrgAuth(orgAuthInput.value);",
      "item: {",
    );
    const postCreateOverlapIndex = postSource.indexOf(
      "await repositories.hasOverlappingOrgAuth(orgAuthInput.value)",
    );
    const overlapResponseIndex = postSource.indexOf(
      "orgAuthScopeOverlapResponse",
    );
    const quotaResponseIndex = postSource.indexOf(
      "orgAuthQuotaExceededResponse",
    );

    expect(postCreateOverlapIndex).toBeGreaterThanOrEqual(0);
    expect(overlapResponseIndex).toBeGreaterThan(postCreateOverlapIndex);
    expect(quotaResponseIndex).toBeGreaterThan(overlapResponseIndex);
  });
});

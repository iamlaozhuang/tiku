import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const repositorySource = readFileSync(
  resolve(
    process.cwd(),
    "src/server/repositories/admin-organization-org-auth-runtime-repository.ts",
  ),
  "utf8",
);

describe("F-0007 org_auth package atomicity", () => {
  it("owns every atomic write and its redacted package audit in one transaction", () => {
    const packageCommand = repositorySource.slice(
      repositorySource.indexOf("async createOrgAuthPackage("),
      repositorySource.indexOf(
        "async createOrgAuth(",
        repositorySource.indexOf("async createOrgAuthPackage("),
      ),
    );

    expect(packageCommand).toContain("database.transaction");
    expect(packageCommand).toContain(
      "for (const orgAuthInput of input.orgAuthInputs)",
    );
    expect(packageCommand).toContain("appendTransactionalOrgAuthAuditLog");
    expect(packageCommand).toContain(
      "redacted org_auth package create metadata",
    );
    expect(packageCommand).toContain("input.orgAuthInputs.length === 0");
    expect(packageCommand).toContain("if (createdOrgAuth === null)");
    expect(packageCommand).toContain(
      "throw new OrgAuthPackageCreateRejectedError",
    );
    expect(
      packageCommand.indexOf("appendTransactionalOrgAuthAuditLog"),
    ).toBeGreaterThan(packageCommand.indexOf("for (const orgAuthInput"));
    expect(packageCommand.indexOf("successAuditPersisted")).toBeGreaterThan(
      packageCommand.indexOf("appendTransactionalOrgAuthAuditLog"),
    );
    expect(packageCommand).toContain("throw error");
  });
});

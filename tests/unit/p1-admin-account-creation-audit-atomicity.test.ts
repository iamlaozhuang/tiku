import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const repositorySource = readFileSync(
  resolve(
    process.cwd(),
    "src/server/repositories/admin-flow-runtime-repository.ts",
  ),
  "utf8",
);
const runtimeSource = readFileSync(
  resolve(process.cwd(), "src/server/services/admin-flow-runtime.ts"),
  "utf8",
);

const createRepositoryMethod = repositorySource.slice(
  repositorySource.indexOf("async createAdminAccount(input"),
  repositorySource.indexOf(
    "\n    async updateAdminAccount",
    repositorySource.indexOf("async createAdminAccount(input"),
  ),
);
const createRuntimeMethod = runtimeSource.slice(
  runtimeSource.indexOf("async function createAdminAccount(request"),
  runtimeSource.indexOf(
    "\n\n  async function listAdminAccounts",
    runtimeSource.indexOf("async function createAdminAccount(request"),
  ),
);

describe("F-0031 admin-account creation audit atomicity partition", () => {
  it("commits account creation and its redacted success audit in one transaction", () => {
    expect(createRepositoryMethod).toContain("database.transaction(");
    expect(createRepositoryMethod).toContain("async (transaction) =>");
    expect(createRepositoryMethod).toContain("appendAtomicAdminAccountAudit({");
    expect(createRepositoryMethod).toContain(
      'actionType: "admin_account.create"',
    );
    expect(createRepositoryMethod).toContain(
      'metadataSummary: "redacted admin account creation metadata"',
    );
  });

  it("passes the existing actor and request context into the creation repository", () => {
    expect(createRuntimeMethod).toContain("publicId: actor.publicId");
    expect(createRuntimeMethod).toContain("roles: actor.roles");
    expect(createRuntimeMethod).toContain("requestIp: readRequestIp(request)");
  });

  it("keeps failed creation audits outside while removing the duplicate success audit", () => {
    expect(createRuntimeMethod).toContain('resultStatus: "failed"');
    expect(createRuntimeMethod).not.toMatch(
      /resultStatus: "success"[\s\S]{0,220}redacted admin account creation metadata/u,
    );
  });
});

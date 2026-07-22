import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const repositorySource = readFileSync(
  resolve(process.cwd(), "src/server/repositories/paper-asset-repository.ts"),
  "utf8",
);
const serviceSource = readFileSync(
  resolve(process.cwd(), "src/server/services/paper-asset-service.ts"),
  "utf8",
);
const runtimeSource = readFileSync(
  resolve(
    process.cwd(),
    "src/server/services/paper-composition-lifecycle-runtime.ts",
  ),
  "utf8",
);

describe("F-0031 paper_asset delete database audit atomicity partition", () => {
  it("requires mutation audit context for paper_asset delete", () => {
    const contractStart = repositorySource.indexOf(
      "export type PaperAssetRepository",
    );
    const contractSource = repositorySource.slice(
      contractStart,
      repositorySource.indexOf(
        "export function createPostgresPaperAssetRepository",
        contractStart,
      ),
    );
    const deleteStart = contractSource.indexOf("deletePaperAsset");
    const deleteContract = contractSource.slice(deleteStart, deleteStart + 220);

    expect(deleteStart).toBeGreaterThan(-1);
    expect(deleteContract).toContain("PaperAssetDeleteMutationContext");
    expect(deleteContract).not.toContain("context?:");
  });

  it("keeps delete and redacted success audit in one repository transaction", () => {
    const deleteStart = repositorySource.indexOf(
      "async function deletePaperAssetWithCleanup",
    );
    const deleteSource = repositorySource.slice(
      deleteStart,
      repositorySource.indexOf(
        "async function appendPaperAssetCreateAuditLog",
        deleteStart,
      ),
    );

    expect(deleteStart).toBeGreaterThan(-1);
    expect(deleteSource).toContain("database.transaction(async (transaction)");
    expect(deleteSource).toContain("inArray(");
    expect(deleteSource).toContain('eq(paper.paper_status, "draft")');
    expect(deleteSource).toContain("await appendPaperAssetDeleteAuditLog(");
  });

  it("does not duplicate success audit when metadata is absent and cleanup is retried", () => {
    const deleteStart = repositorySource.indexOf(
      "async function deletePaperAssetWithCleanup",
    );
    const deleteSource = repositorySource.slice(
      deleteStart,
      repositorySource.indexOf(
        "async function appendPaperAssetCreateAuditLog",
        deleteStart,
      ),
    );
    const missingAssetBranch = deleteSource.slice(
      deleteSource.indexOf("if (unlockedAsset === undefined)"),
      deleteSource.indexOf("await lockPaperAssetObjectIdentity"),
    );

    expect(missingAssetBranch).toContain("processPaperAssetCleanupJob(");
    expect(missingAssetBranch).not.toContain("appendPaperAssetDeleteAuditLog(");
  });

  it("writes only a fixed redacted paper_asset success projection", () => {
    const helperStart = repositorySource.indexOf(
      "async function appendPaperAssetDeleteAuditLog",
    );
    const helperSource = repositorySource.slice(
      helperStart,
      repositorySource.indexOf("\nfunction ", helperStart + 1),
    );

    expect(helperStart).toBeGreaterThan(-1);
    expect(helperSource).toContain('action_type: "paper_asset.delete"');
    expect(helperSource).toContain('target_resource_type: "paper_asset"');
    expect(helperSource).toContain('result_status: "success"');
    expect(helperSource).not.toContain("object_key");
    expect(helperSource).not.toContain("file_name");
  });

  it("keeps audit and cleanup enqueue ordered inside the same uncaught transaction", () => {
    const deleteStart = repositorySource.indexOf(
      "async function deletePaperAssetWithCleanup",
    );
    const deleteSource = repositorySource.slice(
      deleteStart,
      repositorySource.indexOf(
        "async function appendPaperAssetCreateAuditLog",
        deleteStart,
      ),
    );
    const auditIndex = deleteSource.indexOf(
      "await appendPaperAssetDeleteAuditLog(",
    );
    const enqueueIndex = deleteSource.indexOf(".insert(paperAssetCleanupJob)");

    expect(deleteSource).toContain("database.transaction(async (transaction)");
    expect(auditIndex).toBeGreaterThan(-1);
    expect(enqueueIndex).toBeGreaterThan(auditIndex);
    expect(deleteSource.slice(auditIndex, enqueueIndex)).not.toContain("catch");
  });

  it("passes request-derived delete context through the service", () => {
    expect(serviceSource).toMatch(
      /paperAssetRepository\.deletePaperAsset\(\s*publicId,\s*options\.deleteMutationContext,\s*\(identity\)/u,
    );
    expect(runtimeSource).toContain("createPaperAssetDeleteMutationContext(");
    expect(runtimeSource).toContain('actionType: "paper_asset.delete"');
    expect(runtimeSource).toContain(
      'metadataSummary: "redacted paper_asset mutation metadata"',
    );
  });

  it("keeps external audit only for failed create and delete responses", () => {
    const paperAssetRoutes = runtimeSource.slice(
      runtimeSource.indexOf("paperAssets: {"),
    );
    const createStart = paperAssetRoutes.indexOf("async POST");
    const deleteStart = paperAssetRoutes.indexOf("async DELETE");
    const createRoute = paperAssetRoutes.slice(createStart, deleteStart);
    const deleteRoute = paperAssetRoutes.slice(deleteStart);

    expect(createRoute).toContain("if (response.code !== 0)");
    expect(createRoute).toContain("await auditPaperMutation(");
    expect(deleteRoute).toContain("if (response.code !== 0)");
    expect(deleteRoute).toContain("await auditPaperMutation(");
  });
});

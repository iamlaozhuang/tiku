import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it, vi } from "vitest";

import { createPostgresPaperAssetRepository } from "@/server/repositories/paper-asset-repository";

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
    const deleteStart = repositorySource.indexOf("async deletePaperAsset");
    const deleteSource = repositorySource.slice(
      deleteStart,
      repositorySource.indexOf("\n  };", deleteStart),
    );

    expect(deleteStart).toBeGreaterThan(-1);
    expect(deleteSource).toContain("database.transaction(async (transaction)");
    expect(deleteSource).toContain("await appendPaperAssetDeleteAuditLog(");
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

  it("propagates audit insertion failure from the same delete transaction", async () => {
    const auditFailure = new Error("audit unavailable");
    const returning = vi.fn(async () => [
      { public_id: "paper-asset-public-1" },
    ]);
    const transactionDatabase = {
      delete: vi.fn(() => ({
        where: vi.fn(() => ({ returning })),
      })),
      insert: vi.fn(() => ({
        values: vi.fn(async () => {
          throw auditFailure;
        }),
      })),
    };
    const transaction = vi.fn(
      async (callback: (database: unknown) => Promise<unknown>) =>
        callback(transactionDatabase),
    );
    const repository = createPostgresPaperAssetRepository({
      createDatabase: () => ({ transaction }) as never,
    });

    await expect(
      repository.deletePaperAsset("paper-asset-public-1", {
        actorPublicId: "admin-public-1",
        auditLog: {
          actorRole: "content_admin",
          actionType: "paper_asset.delete",
          metadataSummary: "redacted paper_asset mutation metadata",
          requestIp: "127.0.0.1",
        },
      }),
    ).rejects.toBe(auditFailure);
    expect(transaction).toHaveBeenCalledOnce();
    expect(returning).toHaveBeenCalledOnce();
    expect(transactionDatabase.insert).toHaveBeenCalledOnce();
  });

  it("passes request-derived delete context through the service", () => {
    expect(serviceSource).toMatch(
      /paperAssetRepository\.deletePaperAsset\(\s*publicId,\s*options\.deleteMutationContext,?\s*\)/u,
    );
    expect(runtimeSource).toContain("createPaperAssetDeleteMutationContext(");
    expect(runtimeSource).toContain('actionType: "paper_asset.delete"');
    expect(runtimeSource).toContain(
      'metadataSummary: "redacted paper_asset mutation metadata"',
    );
  });

  it("keeps external audit for failed delete and all multipart create results", () => {
    const paperAssetRoutes = runtimeSource.slice(
      runtimeSource.indexOf("paperAssets: {"),
    );
    const createStart = paperAssetRoutes.indexOf("async POST");
    const deleteStart = paperAssetRoutes.indexOf("async DELETE");
    const createRoute = paperAssetRoutes.slice(createStart, deleteStart);
    const deleteRoute = paperAssetRoutes.slice(deleteStart);

    expect(createRoute).toContain("await auditPaperMutation(");
    expect(deleteRoute).toContain("if (response.code !== 0)");
    expect(deleteRoute).toContain("await auditPaperMutation(");
  });
});

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import {
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, sep } from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { createPaperAssetService } from "@/server/services/paper-asset-service";
import { deleteLocalPaperAssetFile } from "@/server/services/local-paper-asset-storage";

const repositorySource = readFileSync(
  join(process.cwd(), "src/server/repositories/paper-asset-repository.ts"),
  "utf8",
);
const schemaSource = readFileSync(
  join(process.cwd(), "src/db/schema/paper.ts"),
  "utf8",
);
const temporaryRoots: string[] = [];

async function createTemporaryRoot(prefix: string): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), prefix));
  temporaryRoots.push(root);
  return root;
}

afterEach(async () => {
  for (const root of temporaryRoots.splice(0)) {
    if (!root.startsWith(`${tmpdir()}${sep}`)) {
      throw new Error("Synthetic cleanup root escaped the system temp path.");
    }
    await rm(root, { force: true, recursive: true });
  }
});

function createIdentity(bytes: Buffer, storageRoot: string) {
  const fileHash = createHash("sha256").update(bytes).digest("hex");

  return {
    fileHash,
    fileName: "paper.pdf",
    fileSizeByte: bytes.byteLength,
    objectKey: `dev/paper-asset/marketing/202607/${fileHash}.pdf`,
    profession: "marketing" as const,
    storageRoot,
  };
}

describe("F-0096 durable paper_asset file lifecycle", () => {
  it("deletes only an exact contained identity and treats an exact missing target as idempotent", async () => {
    const storageRoot = await createTemporaryRoot("tiku-asset-cleanup-");
    const bytes = Buffer.from("controlled paper asset bytes");
    const identity = createIdentity(bytes, storageRoot);
    const targetPath = join(storageRoot, ...identity.objectKey.split("/"));

    await mkdir(join(targetPath, ".."), { recursive: true });
    await writeFile(targetPath, bytes);

    await expect(deleteLocalPaperAssetFile(identity)).resolves.toBe("deleted");
    await expect(lstat(targetPath)).rejects.toMatchObject({ code: "ENOENT" });
    await expect(deleteLocalPaperAssetFile(identity)).resolves.toBe("missing");
  });

  it("fails closed without deleting for identity, integrity, symlink, directory or root violations", async () => {
    const storageRoot = await createTemporaryRoot("tiku-asset-guard-");
    const bytes = Buffer.from("guarded paper asset bytes");
    const identity = createIdentity(bytes, storageRoot);
    const targetPath = join(storageRoot, ...identity.objectKey.split("/"));

    await mkdir(join(targetPath, ".."), { recursive: true });
    await writeFile(targetPath, bytes);

    for (const invalid of [
      { fileHash: identity.fileHash.toUpperCase() },
      { fileSizeByte: bytes.byteLength + 1 },
      { profession: "logistics" as const },
      { objectKey: `../${identity.objectKey}` },
      { objectKey: identity.objectKey.replace("/202607/", "/202613/") },
    ]) {
      await expect(
        deleteLocalPaperAssetFile({ ...identity, ...invalid }),
      ).rejects.toThrow();
      await expect(readFile(targetPath)).resolves.toEqual(bytes);
    }

    const corruptBytes = Buffer.from("tampered paper asset data");
    expect(corruptBytes.byteLength).toBe(bytes.byteLength);
    await writeFile(targetPath, corruptBytes);
    await expect(deleteLocalPaperAssetFile(identity)).rejects.toThrow();
    await expect(readFile(targetPath)).resolves.toEqual(corruptBytes);
    await writeFile(targetPath, bytes);

    const linkedRoot = await createTemporaryRoot("tiku-asset-link-");
    const linkedIdentity = createIdentity(bytes, linkedRoot);
    const linkedMonth = join(
      linkedRoot,
      "dev",
      "paper-asset",
      "marketing",
      "202607",
    );
    const outside = await createTemporaryRoot("tiku-asset-outside-");

    await mkdir(join(linkedMonth, ".."), { recursive: true });
    await writeFile(join(outside, `${linkedIdentity.fileHash}.pdf`), bytes);
    await symlink(outside, linkedMonth, "junction");
    await expect(deleteLocalPaperAssetFile(linkedIdentity)).rejects.toThrow();
    await expect(
      readFile(join(outside, `${linkedIdentity.fileHash}.pdf`)),
    ).resolves.toEqual(bytes);

    const finalLinkRoot = await createTemporaryRoot("tiku-asset-final-");
    const finalLinkIdentity = createIdentity(bytes, finalLinkRoot);
    const finalLinkTarget = join(
      finalLinkRoot,
      ...finalLinkIdentity.objectKey.split("/"),
    );
    const outsideFinalDirectory = join(outside, "outside-final");
    const outsideFile = join(outsideFinalDirectory, "sentinel.pdf");
    await mkdir(outsideFinalDirectory, { recursive: true });
    await writeFile(outsideFile, bytes);
    await mkdir(join(finalLinkTarget, ".."), { recursive: true });
    await symlink(outsideFinalDirectory, finalLinkTarget, "junction");
    await expect(
      deleteLocalPaperAssetFile(finalLinkIdentity),
    ).rejects.toThrow();
    await expect(readFile(outsideFile)).resolves.toEqual(bytes);

    const directoryRoot = await createTemporaryRoot("tiku-asset-dir-");
    const directoryIdentity = createIdentity(bytes, directoryRoot);
    await mkdir(
      join(directoryRoot, ...directoryIdentity.objectKey.split("/")),
      { recursive: true },
    );
    await expect(
      deleteLocalPaperAssetFile(directoryIdentity),
    ).rejects.toThrow();

    await expect(
      deleteLocalPaperAssetFile({
        ...identity,
        storageRoot: join(storageRoot, "missing-root"),
      }),
    ).rejects.toThrow();
  });

  it("returns a generic retry response and preserves the delete DTO on completed replay", async () => {
    const deletePaperAsset = vi
      .fn()
      .mockResolvedValueOnce({ status: "retryable" })
      .mockResolvedValueOnce({ status: "completed" })
      .mockRejectedValueOnce(new Error("internal storage path detail"));
    const service = createPaperAssetService(
      {
        deletePaperAsset,
        async findPaperAssetByPublicId() {
          return null;
        },
        async listPaperAssets() {
          return { rows: [], total: 0 };
        },
      },
      {
        deleteMutationContext: {
          actorPublicId: "admin-content-1",
          auditLog: {
            actorRole: "content_admin",
            actionType: "paper_asset.delete",
            metadataSummary: "redacted paper_asset mutation metadata",
            requestIp: null,
          },
        },
        localPaperAssetStorageRoot: "synthetic-root",
      },
    );

    await expect(service.deletePaperAsset("paper-asset-1")).resolves.toEqual({
      code: 503205,
      message: "Paper asset cleanup is pending; retry the delete command.",
      data: null,
    });
    await expect(service.deletePaperAsset("paper-asset-1")).resolves.toEqual({
      code: 0,
      message: "ok",
      data: { deletedPaperAssetPublicId: "paper-asset-1" },
    });
    await expect(service.deletePaperAsset("paper-asset-1")).resolves.toEqual({
      code: 503205,
      message: "Paper asset cleanup is pending; retry the delete command.",
      data: null,
    });
    expect(deletePaperAsset).toHaveBeenCalledTimes(3);
  });

  it("defines an additive durable cleanup job without a paper_asset foreign key", () => {
    const cleanupTableSource = schemaSource.slice(
      schemaSource.indexOf("export const paperAssetCleanupJob ="),
      schemaSource.indexOf("export const contentImage ="),
    );

    expect(schemaSource).toContain("paperAssetCleanupJobStatusValues");
    expect(schemaSource).toContain('"paper_asset_cleanup_job"');
    expect(schemaSource).toContain("source_paper_asset_public_id");
    expect(schemaSource).toContain("last_failure_message_digest");
    expect(schemaSource).toContain("attempt_count");
    expect(schemaSource).toMatch(
      /uniqueIndex\(\s*"udx_paper_asset_cleanup_job_source_paper_asset_public_id"/u,
    );
    expect(schemaSource).toContain(
      'index("idx_paper_asset_cleanup_job_object_key")',
    );
    expect(cleanupTableSource).not.toContain("references(");
  });

  it("uses one object-key advisory lock before row locks across prepare, complete, delete and cleanup", () => {
    expect(repositorySource).toContain("PAPER_ASSET_OBJECT_LOCK_NAMESPACE");
    expect(repositorySource).toContain("pg_advisory_xact_lock");
    expect(repositorySource).toContain("hashtext(${objectKey})");

    for (const functionName of [
      "preparePaperAssetUpload",
      "completePaperAssetUpload",
      "deletePaperAssetWithCleanup",
      "processPaperAssetCleanupJob",
    ]) {
      const start = repositorySource.indexOf(`function ${functionName}`);
      const next = repositorySource.indexOf("\nasync function ", start + 1);
      const source = repositorySource.slice(
        start,
        next === -1 ? undefined : next,
      );
      const advisoryLock = source.indexOf("lockPaperAssetObjectIdentity");
      const rowLock = source.indexOf('.for("update")');

      expect(start).toBeGreaterThan(-1);
      expect(advisoryLock).toBeGreaterThan(-1);
      if (rowLock !== -1) {
        expect(advisoryLock).toBeLessThan(rowLock);
      }
    }

    expect(repositorySource).toMatch(/"pending",\s*"file_stored"/u);
    expect(repositorySource).toContain("deleteLocalFile(cleanupIdentity)");
    expect(repositorySource).toContain("appendPaperAssetDeleteAuditLog(");
  });

  it("keeps reference, live-upload, local-delete and durable outcome ordering fail closed", () => {
    const processStart = repositorySource.indexOf(
      "async function processPaperAssetCleanupJob",
    );
    const deleteStart = repositorySource.indexOf(
      "async function deletePaperAssetWithCleanup",
    );
    const processSource = repositorySource.slice(processStart, deleteStart);
    const deleteSource = repositorySource.slice(
      deleteStart,
      repositorySource.indexOf(
        "async function appendPaperAssetCreateAuditLog",
        deleteStart,
      ),
    );

    expect(
      deleteSource.indexOf("appendPaperAssetDeleteAuditLog("),
    ).toBeLessThan(deleteSource.indexOf(".insert(paperAssetCleanupJob)"));
    expect(deleteSource.indexOf("remainingReferences.length > 0")).toBeLessThan(
      deleteSource.indexOf(".insert(paperAssetCleanupJob)"),
    );
    expect(processSource.indexOf("referenceRows.length > 0")).toBeLessThan(
      processSource.indexOf("liveUploadRows.length > 0"),
    );
    expect(processSource.indexOf("liveUploadRows.length > 0")).toBeLessThan(
      processSource.indexOf("deleteLocalFile(cleanupIdentity)"),
    );
    expect(
      processSource.indexOf("deleteLocalFile(cleanupIdentity)"),
    ).toBeLessThan(processSource.lastIndexOf('cleanup_status: "completed"'));
    expect(processSource).toContain("markPaperAssetCleanupFailed(");
    expect(repositorySource).toContain('cleanup_status: "failed"');
    expect(processSource).toContain('cleanup_status: "pending"');
    expect(processSource).toContain('cleanup_status: "cancelled"');
    expect(processSource).not.toContain("object_key: job.object_key");
  });
});

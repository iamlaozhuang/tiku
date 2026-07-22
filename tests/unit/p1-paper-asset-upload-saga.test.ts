import { readFileSync } from "node:fs";
import { readFile, readdir, mkdtemp, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it, vi } from "vitest";

import { createPaperCompositionLifecycleRuntimeRouteHandlers } from "@/server/services/paper-composition-lifecycle-runtime";
import { createPaperAssetService } from "@/server/services/paper-asset-service";
import { createPostgresPaperAssetRepository } from "@/server/repositories/paper-asset-repository";
import type { SessionService } from "@/server/services/session-service";

const commandPublicId =
  "paper-command-paper-asset-76aca5d6-a60b-4a4f-b8f7-7fca40b84609";
const repositorySource = readFileSync(
  join(process.cwd(), "src/server/repositories/paper-asset-repository.ts"),
  "utf8",
);
const migrationSource = readFileSync(
  join(
    process.cwd(),
    "drizzle/20260721183000_p1_rc_04_paper_asset_upload_saga.sql",
  ),
  "utf8",
);

function createSessionService(): Pick<SessionService, "getCurrentSession"> {
  return {
    async getCurrentSession() {
      return {
        code: 0,
        message: "ok",
        data: {
          session: { expiresAt: "2026-07-21T23:00:00.000Z" },
          user: {
            publicId: "user-paper-upload",
            phone: "13800000031",
            name: "Paper Upload Admin",
            userType: null,
            status: "active",
            lockedUntilAt: null,
            employeePublicId: null,
            organizationPublicId: null,
            adminPublicId: "admin-paper-upload",
            adminRoles: ["content_admin"],
          },
        },
      };
    },
  };
}

function createUploadRequest(paperAttachmentUsage = "paper_source"): Request {
  const formData = new FormData();

  formData.set("commandPublicId", commandPublicId);
  formData.set("paperPublicId", "paper-public-upload");
  formData.set("paperAttachmentUsage", paperAttachmentUsage);
  formData.set("profession", "marketing");
  formData.set("fileName", "controlled-paper.md");
  formData.set(
    "file",
    new File(["# Controlled paper upload"], "controlled-paper.md", {
      type: "text/markdown",
    }),
  );

  return new Request("http://localhost/api/v1/paper-assets", {
    method: "POST",
    headers: { authorization: "Bearer admin-session-token" },
    body: formData,
  });
}

function createPaperAssetRow() {
  return {
    id: 41,
    public_id: "paper-asset-upload-public-1",
    paper_public_id: "paper-public-upload",
    paper_attachment_usage: "paper_source" as const,
    file_name: "controlled-paper.md",
    object_key: "dev/paper-asset/marketing/202607/controlled-paper-hash.md",
    content_type: "text/markdown",
    file_size_byte: 25,
    file_hash: "controlled-paper-hash",
    created_at: new Date("2026-07-21T20:00:00.000Z"),
  };
}

function createRepositoryHarness(input?: {
  prepareResult?: unknown;
  completeResult?: unknown;
}) {
  const paperAsset = createPaperAssetRow();
  const preparePaperAssetUpload = vi.fn(async (prepareInput: unknown) =>
    input?.prepareResult === undefined
      ? {
          status: "prepared",
          operation: {
            publicId: "paper-asset-upload-operation-public-1",
            paperAssetPublicId: paperAsset.public_id,
            objectKey: (prepareInput as { objectKey: string }).objectKey,
          },
        }
      : input.prepareResult,
  );
  const markPaperAssetUploadFileStored = vi.fn(async () => true);
  const completePaperAssetUpload = vi.fn(async () =>
    input?.completeResult === undefined
      ? { status: "completed", paperAsset, replayed: false }
      : input.completeResult,
  );
  const recordPaperAssetUploadFailure = vi.fn(async () => undefined);
  const appendAuditLog = vi.fn(async () => undefined);

  return {
    calls: {
      appendAuditLog,
      completePaperAssetUpload,
      markPaperAssetUploadFileStored,
      preparePaperAssetUpload,
      recordPaperAssetUploadFailure,
    },
    repositories: {
      paperRepository: {},
      paperAssetRepository: {
        async listPaperAssets() {
          return { rows: [], total: 0 };
        },
        async findPaperAssetByPublicId() {
          return null;
        },
        async deletePaperAsset() {
          return false;
        },
        preparePaperAssetUpload,
        markPaperAssetUploadFileStored,
        completePaperAssetUpload,
        recordPaperAssetUploadFailure,
      },
      auditLogRepository: { appendAuditLog },
    },
  };
}

describe("F-0031 paper_asset durable upload saga", () => {
  it("keeps request identity stable when a retry crosses an object-path month", async () => {
    const fileBytes = Buffer.from("month boundary paper asset");
    const fileHash = createHash("sha256").update(fileBytes).digest("hex");
    const requestFingerprints: string[] = [];
    const service = createPaperAssetService(
      {
        async preparePaperAssetUpload(input: { requestFingerprint: string }) {
          requestFingerprints.push(input.requestFingerprint);
          return { status: "conflict", reason: "request_mismatch" };
        },
        async markPaperAssetUploadFileStored() {
          return true;
        },
        async completePaperAssetUpload() {
          throw new Error("Conflicted upload must not complete.");
        },
        async recordPaperAssetUploadFailure() {},
      } as never,
      {
        mutationContext: {
          actorPublicId: "admin-paper-upload",
          auditLog: {
            actorRole: "content_admin",
            actionType: "paper_asset.create",
            metadataSummary: "redacted paper_asset mutation metadata",
            requestIp: null,
          },
        },
      },
    );
    const createInput = (yearMonth: string) => ({
      commandPublicId,
      preparedFile: {
        bytes: fileBytes,
        paperPublicId: "paper-public-upload",
        paperAttachmentUsage: "paper_source" as const,
        profession: "marketing" as const,
        fileName: "controlled-paper.md",
        objectKey: `dev/paper-asset/marketing/${yearMonth}/${fileHash}.md`,
        contentType: "text/markdown",
        fileSizeByte: fileBytes.byteLength,
        fileHash,
      },
    });

    await service.createPaperAsset(createInput("202607"));
    await service.createPaperAsset(createInput("202608"));

    expect(requestFingerprints).toHaveLength(2);
    expect(requestFingerprints[0]).toBe(requestFingerprints[1]);
  });

  it("claims and completes upload operations through repository transactions", () => {
    const repository = createPostgresPaperAssetRepository({
      createDatabase: () => ({}) as never,
    });

    expect(repository.preparePaperAssetUpload).toBeTypeOf("function");
    expect(repository.markPaperAssetUploadFileStored).toBeTypeOf("function");
    expect(repository.completePaperAssetUpload).toBeTypeOf("function");
    expect(repository.recordPaperAssetUploadFailure).toBeTypeOf("function");

    const prepareStart = repositorySource.indexOf(
      "async function preparePaperAssetUpload",
    );
    const completeStart = repositorySource.indexOf(
      "async function completePaperAssetUpload",
    );
    const prepareSource = repositorySource.slice(prepareStart, completeStart);
    const completeSource = repositorySource.slice(completeStart);

    expect(prepareStart).toBeGreaterThan(-1);
    expect(completeStart).toBeGreaterThan(prepareStart);
    expect(prepareSource).toContain("database.transaction(async (transaction)");
    expect(prepareSource).toContain(".insert(paperAssetUploadOperation)");
    expect(prepareSource).toContain(
      "target: paperAssetUploadOperation.idempotency_key_hash",
    );
    expect(prepareSource).toContain('.operation_status === "failed"');
    expect(prepareSource).toContain('operation_status: "pending"');
    expect(prepareSource).toContain(
      "operationRow.actor_admin_id !== actorAdminId",
    );
    expect(prepareSource).toContain("operationRow.paper_id !== paperRow.id");
    expect(prepareSource).toContain(
      "operationRow.request_fingerprint !== input.requestFingerprint",
    );
    expect(completeSource).toContain(
      "database.transaction(async (transaction)",
    );
    expect(completeSource).toContain('.operation_status !== "file_stored"');
    expect(completeSource).toContain(".insert(paperAsset)");
    expect(completeSource).toContain("appendPaperAssetCreateAuditLog(");
    expect(completeSource).toContain(
      'metadataSummary: "redacted paper_asset mutation metadata"',
    );
    expect(completeSource).toContain('operation_status: "completed"');
    expect(completeSource.indexOf(".insert(paperAsset)")).toBeLessThan(
      completeSource.indexOf("appendPaperAssetCreateAuditLog("),
    );
    expect(
      completeSource.indexOf("appendPaperAssetCreateAuditLog("),
    ).toBeLessThan(completeSource.indexOf('operation_status: "completed"'));
  });

  it("generates only the durable upload operation migration source", () => {
    expect(migrationSource).toContain(
      'CREATE TYPE "public"."paper_asset_upload_operation_status"',
    );
    expect(migrationSource).toContain(
      'CREATE TABLE "paper_asset_upload_operation"',
    );
    expect(migrationSource).toContain(
      'FOREIGN KEY ("paper_asset_id") REFERENCES "public"."paper_asset"("id") ON DELETE set null',
    );
    expect(migrationSource).toContain(
      'CREATE UNIQUE INDEX "udx_paper_asset_upload_operation_idempotency_key_hash"',
    );
    expect(migrationSource).not.toMatch(
      /(?:^|\n)(?:DROP|TRUNCATE|UPDATE|DELETE)\s/u,
    );
  });

  it("persists the operation before writing the file and completes asset audit state together", async () => {
    const storageRoot = await mkdtemp(join(tmpdir(), "tiku-paper-saga-red-"));
    const preparePaperAssetUpload = vi.fn(async (input: unknown) => {
      await expect(readdir(storageRoot, { recursive: true })).resolves.toEqual(
        [],
      );

      return {
        status: "prepared",
        operation: {
          publicId: "paper-asset-upload-operation-public-1",
          paperAssetPublicId: "paper-asset-upload-public-1",
          objectKey: (input as { objectKey: string }).objectKey,
        },
      };
    });
    const markPaperAssetUploadFileStored = vi.fn(async () => true);
    const completePaperAssetUpload = vi.fn(async () => ({
      status: "completed",
      paperAsset: {
        id: 41,
        public_id: "paper-asset-upload-public-1",
        paper_public_id: "paper-public-upload",
        paper_attachment_usage: "paper_source",
        file_name: "controlled-paper.md",
        object_key: "dev/paper-asset/marketing/202607/controlled-paper-hash.md",
        content_type: "text/markdown",
        file_size_byte: 25,
        file_hash: "controlled-paper-hash",
        created_at: new Date("2026-07-21T20:00:00.000Z"),
      },
      replayed: false,
    }));
    const appendAuditLog = vi.fn(async () => undefined);
    const handlers = createPaperCompositionLifecycleRuntimeRouteHandlers({
      localPaperAssetStorageRoot: storageRoot,
      repositories: {
        paperRepository: {},
        paperAssetRepository: {
          async listPaperAssets() {
            return { rows: [], total: 0 };
          },
          async findPaperAssetByPublicId() {
            return null;
          },
          async deletePaperAsset() {
            return false;
          },
          preparePaperAssetUpload,
          markPaperAssetUploadFileStored,
          completePaperAssetUpload,
          async recordPaperAssetUploadFailure() {},
        },
        auditLogRepository: { appendAuditLog },
      },
      sessionService: createSessionService(),
    } as never);

    const response = await handlers.paperAssets.collection.POST(
      createUploadRequest(),
    );

    await expect(response.json()).resolves.toMatchObject({
      code: 0,
      data: {
        paperAsset: { publicId: "paper-asset-upload-public-1" },
      },
    });
    expect(preparePaperAssetUpload).toHaveBeenCalledOnce();
    expect(preparePaperAssetUpload).toHaveBeenCalledWith(
      expect.objectContaining({
        actorPublicId: "admin-paper-upload",
        idempotencyKeyHash: expect.stringMatching(/^sha256:[a-f0-9]{64}$/u),
        requestFingerprint: expect.stringMatching(/^sha256:[a-f0-9]{64}$/u),
      }),
    );
    expect(JSON.stringify(preparePaperAssetUpload.mock.calls)).not.toContain(
      commandPublicId,
    );
    expect(markPaperAssetUploadFileStored).toHaveBeenCalledWith(
      "paper-asset-upload-operation-public-1",
    );
    expect(completePaperAssetUpload).toHaveBeenCalledWith(
      expect.objectContaining({
        operationPublicId: "paper-asset-upload-operation-public-1",
        mutationContext: expect.objectContaining({
          actorPublicId: "admin-paper-upload",
          auditLog: expect.objectContaining({
            actionType: "paper_asset.create",
            metadataSummary: "redacted paper_asset mutation metadata",
          }),
        }),
      }),
    );
    expect(appendAuditLog).not.toHaveBeenCalled();
  });

  it("replays a completed operation without another file write or audit", async () => {
    const storageRoot = await mkdtemp(
      join(tmpdir(), "tiku-paper-saga-replay-"),
    );
    const paperAsset = createPaperAssetRow();
    const { calls, repositories } = createRepositoryHarness({
      prepareResult: { status: "completed", paperAsset },
    });
    const handlers = createPaperCompositionLifecycleRuntimeRouteHandlers({
      localPaperAssetStorageRoot: storageRoot,
      repositories,
      sessionService: createSessionService(),
    } as never);

    const response = await handlers.paperAssets.collection.POST(
      createUploadRequest(),
    );

    await expect(response.json()).resolves.toMatchObject({
      code: 0,
      data: { paperAsset: { publicId: paperAsset.public_id } },
    });
    expect(calls.markPaperAssetUploadFileStored).not.toHaveBeenCalled();
    expect(calls.completePaperAssetUpload).not.toHaveBeenCalled();
    expect(calls.appendAuditLog).not.toHaveBeenCalled();
    await expect(readdir(storageRoot, { recursive: true })).resolves.toEqual(
      [],
    );
  });

  it("fails a mismatched replay closed before writing a file", async () => {
    const storageRoot = await mkdtemp(
      join(tmpdir(), "tiku-paper-saga-conflict-"),
    );
    const { calls, repositories } = createRepositoryHarness({
      prepareResult: { status: "conflict", reason: "request_mismatch" },
    });
    const handlers = createPaperCompositionLifecycleRuntimeRouteHandlers({
      localPaperAssetStorageRoot: storageRoot,
      repositories,
      sessionService: createSessionService(),
    } as never);

    const response = await handlers.paperAssets.collection.POST(
      createUploadRequest(),
    );

    await expect(response.json()).resolves.toEqual({
      code: 409208,
      message: "Paper asset command conflicts with an existing request.",
      data: null,
    });
    expect(calls.markPaperAssetUploadFileStored).not.toHaveBeenCalled();
    expect(calls.completePaperAssetUpload).not.toHaveBeenCalled();
    expect(calls.appendAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        actionType: "paper_asset.create",
        resultStatus: "failed",
        metadataSummary: "redacted paper_asset mutation metadata",
      }),
    );
    await expect(readdir(storageRoot, { recursive: true })).resolves.toEqual(
      [],
    );
  });

  it("records only a digest when deterministic storage fails", async () => {
    const storageRoot = await mkdtemp(
      join(tmpdir(), "tiku-paper-saga-failure-"),
    );
    const invalidStorageRoot = join(storageRoot, "occupied");
    await writeFile(invalidStorageRoot, "not a directory", "utf8");
    const { calls, repositories } = createRepositoryHarness();
    const handlers = createPaperCompositionLifecycleRuntimeRouteHandlers({
      localPaperAssetStorageRoot: invalidStorageRoot,
      repositories,
      sessionService: createSessionService(),
    } as never);

    const response = await handlers.paperAssets.collection.POST(
      createUploadRequest(),
    );

    await expect(response.json()).resolves.toEqual({
      code: 500204,
      message: "Paper asset upload failed.",
      data: null,
    });
    expect(calls.recordPaperAssetUploadFailure).toHaveBeenCalledWith({
      operationPublicId: "paper-asset-upload-operation-public-1",
      failureMessageDigest: expect.stringMatching(/^sha256:[a-f0-9]{64}$/u),
    });
    expect(calls.completePaperAssetUpload).not.toHaveBeenCalled();
    expect(
      JSON.stringify(calls.recordPaperAssetUploadFailure.mock.calls),
    ).not.toContain("not a directory");
  });

  it("uses the operation-owned deterministic path when resuming storage", async () => {
    const storageRoot = await mkdtemp(
      join(tmpdir(), "tiku-paper-saga-owned-path-"),
    );
    const { calls, repositories } = createRepositoryHarness();
    calls.preparePaperAssetUpload.mockImplementationOnce(
      async (prepareInput: unknown) => {
        const fileHash = (prepareInput as { fileHash: string }).fileHash;

        return {
          status: "prepared",
          operation: {
            publicId: "paper-asset-upload-operation-public-1",
            paperAssetPublicId: "paper-asset-upload-public-1",
            objectKey: `dev/paper-asset/marketing/202601/${fileHash}.md`,
          },
        };
      },
    );
    const handlers = createPaperCompositionLifecycleRuntimeRouteHandlers({
      localPaperAssetStorageRoot: storageRoot,
      repositories,
      sessionService: createSessionService(),
    } as never);

    const response = await handlers.paperAssets.collection.POST(
      createUploadRequest(),
    );
    const prepareInput = calls.preparePaperAssetUpload.mock.calls[0]?.[0] as {
      fileHash: string;
    };

    await expect(response.json()).resolves.toMatchObject({ code: 0 });
    const storedBytes = await readFile(
      join(
        storageRoot,
        `dev/paper-asset/marketing/202601/${prepareInput.fileHash}.md`,
      ),
    );

    expect(createHash("sha256").update(storedBytes).digest("hex")).toBe(
      prepareInput.fileHash,
    );
  });

  it("rejects the legacy JSON metadata create path", async () => {
    const storageRoot = await mkdtemp(
      join(tmpdir(), "tiku-paper-saga-json-bypass-"),
    );
    const { calls, repositories } = createRepositoryHarness();
    const handlers = createPaperCompositionLifecycleRuntimeRouteHandlers({
      localPaperAssetStorageRoot: storageRoot,
      repositories,
      sessionService: createSessionService(),
    } as never);

    const response = await handlers.paperAssets.collection.POST(
      new Request("http://localhost/api/v1/paper-assets", {
        method: "POST",
        headers: {
          authorization: "Bearer admin-session-token",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          commandPublicId,
          paperPublicId: "paper-public-upload",
          paperAttachmentUsage: "paper_source",
          fileName: "controlled-paper.md",
          objectKey: "dev/paper-asset/marketing/202607/untrusted.md",
          contentType: "text/markdown",
          fileSizeByte: 25,
          fileHash: "untrusted",
        }),
      }),
    );

    await expect(response.json()).resolves.toEqual({
      code: 422205,
      message: "Invalid paper_asset input.",
      data: null,
    });
    expect(calls.preparePaperAssetUpload).not.toHaveBeenCalled();
  });

  it("accepts a new explicit usage and rejects legacy or malformed create usages before file writes", async () => {
    const acceptedStorageRoot = await mkdtemp(
      join(tmpdir(), "tiku-paper-saga-usage-accepted-"),
    );
    const acceptedHarness = createRepositoryHarness();
    const acceptedHandlers =
      createPaperCompositionLifecycleRuntimeRouteHandlers({
        localPaperAssetStorageRoot: acceptedStorageRoot,
        repositories: acceptedHarness.repositories,
        sessionService: createSessionService(),
      } as never);

    const acceptedResponse = await acceptedHandlers.paperAssets.collection.POST(
      createUploadRequest("source_material"),
    );

    expect(acceptedResponse.status).toBe(200);
    expect(acceptedHarness.calls.preparePaperAssetUpload).toHaveBeenCalledWith(
      expect.objectContaining({ paperAttachmentUsage: "source_material" }),
    );

    for (const usage of ["other", "", "PAPER_SOURCE", "unknown"]) {
      const storageRoot = await mkdtemp(
        join(tmpdir(), "tiku-paper-saga-usage-rejected-"),
      );
      const harness = createRepositoryHarness();
      const handlers = createPaperCompositionLifecycleRuntimeRouteHandlers({
        localPaperAssetStorageRoot: storageRoot,
        repositories: harness.repositories,
        sessionService: createSessionService(),
      } as never);
      const response = await handlers.paperAssets.collection.POST(
        createUploadRequest(usage),
      );

      await expect(response.json()).resolves.toEqual({
        code: 422205,
        message: "Invalid paper_asset input.",
        data: null,
      });
      expect(harness.calls.preparePaperAssetUpload).not.toHaveBeenCalled();
      await expect(readdir(storageRoot, { recursive: true })).resolves.toEqual(
        [],
      );
    }
  });

  it("removes the legacy repository mutation that bypassed file lifecycle state", () => {
    expect(repositorySource).not.toContain("PaperAssetCommandConflictError");
    expect(repositorySource).not.toMatch(/\n\s+async createPaperAsset\(/u);
    expect(repositorySource).not.toContain("claimPaperAssetCreateCommand(");
  });
});

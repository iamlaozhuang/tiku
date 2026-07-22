import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, symlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { describe, expect, it } from "vitest";

import {
  createPaperCompositionLifecycleRuntimeRouteHandlers,
  type PaperCompositionLifecycleRuntimeRepositories,
} from "@/server/services/paper-composition-lifecycle-runtime";
import {
  readLocalPaperAssetFile,
  storeLocalPaperAssetFile,
  storeLocalResourceFile,
} from "@/server/services/local-paper-asset-storage";
import type { SessionService } from "@/server/services/session-service";
import type { PaperAssetRepository } from "@/server/repositories/paper-asset-repository";
import type { PaperDraftRepository } from "@/server/repositories/paper-draft-repository";

const createdAt = new Date("2026-05-25T08:00:00.000Z");

function createSessionService(): Pick<SessionService, "getCurrentSession"> {
  return {
    async getCurrentSession() {
      return {
        code: 0,
        message: "ok",
        data: {
          session: { expiresAt: "2026-05-25T10:00:00.000Z" },
          user: {
            publicId: "user-content-admin",
            phone: "13800000001",
            name: "Content Admin",
            userType: null,
            status: "active",
            lockedUntilAt: null,
            employeePublicId: null,
            organizationPublicId: null,
            adminPublicId: "admin-content-public",
            adminRoles: ["content_admin"],
          },
        },
      };
    },
  };
}

function createRepositories(
  capturedPaperAssetInputs: unknown[],
): PaperCompositionLifecycleRuntimeRepositories {
  let preparedInput:
    | Parameters<
        NonNullable<PaperAssetRepository["preparePaperAssetUpload"]>
      >[0]
    | undefined;
  const paperAssetRepository: PaperAssetRepository = {
    async preparePaperAssetUpload(input) {
      preparedInput = input;
      capturedPaperAssetInputs.push(input);

      return {
        status: "prepared",
        operation: {
          publicId: "paper-asset-upload-operation-local-001",
          paperAssetPublicId: "paper-asset-local-upload-001",
          objectKey: input.objectKey,
        },
      };
    },
    async markPaperAssetUploadFileStored() {
      return true;
    },
    async completePaperAssetUpload() {
      if (preparedInput === undefined) {
        throw new Error("Paper asset upload was not prepared.");
      }

      return {
        status: "completed",
        replayed: false,
        paperAsset: {
          id: 1,
          public_id: "paper-asset-local-upload-001",
          paper_public_id: preparedInput.paperPublicId,
          profession: preparedInput.profession,
          paper_attachment_usage: preparedInput.paperAttachmentUsage,
          file_name: preparedInput.fileName,
          object_key: preparedInput.objectKey,
          content_type: preparedInput.contentType,
          file_size_byte: preparedInput.fileSizeByte,
          file_hash: preparedInput.fileHash,
          created_at: createdAt,
        },
      };
    },
    async recordPaperAssetUploadFailure() {},
    async listPaperAssets() {
      return { rows: [], total: 0 };
    },
    async findPaperAssetByPublicId() {
      return null;
    },
    async deletePaperAsset() {
      return { status: "completed" };
    },
  };

  return {
    paperRepository: {} as PaperDraftRepository,
    paperAssetRepository,
    auditLogRepository: {
      async appendAuditLog() {},
    },
  };
}

describe("phase 11 local file upload storage adapter", () => {
  it("reads only an exact content-addressed paper_asset identity and verifies bytes", async () => {
    const storageRoot = await mkdtemp(join(tmpdir(), "tiku-read-test-"));
    const bytes = Buffer.from("controlled private bytes");
    const fileHash = createHash("sha256").update(bytes).digest("hex");
    const objectKey = `dev/paper-asset/marketing/202605/${fileHash}.pdf`;
    const targetPath = join(storageRoot, ...objectKey.split("/"));

    await mkdir(join(targetPath, ".."), { recursive: true });
    await writeFile(targetPath, bytes);

    await expect(
      readLocalPaperAssetFile({
        fileHash,
        fileName: "source.pdf",
        fileSizeByte: bytes.byteLength,
        objectKey,
        profession: "marketing",
        storageRoot,
      }),
    ).resolves.toEqual(bytes);

    for (const invalid of [
      {
        objectKey: `dev/paper-asset/marketing/202605/${fileHash.toUpperCase()}.pdf`,
      },
      { objectKey: `dev/paper-asset/marketing/${fileHash}.pdf` },
      { objectKey: `dev/paper-asset/marketing/202613/${fileHash}.pdf` },
      { objectKey: `dev/paper-asset/marketing/../202605/${fileHash}.pdf` },
      { objectKey: `dev/paper-asset/logistics/202605/${fileHash}.pdf` },
      { objectKey: `dev/paper-asset/marketing/202605/${fileHash}.txt` },
      { fileHash: "0".repeat(64) },
      { fileSizeByte: bytes.byteLength + 1 },
    ]) {
      await expect(
        readLocalPaperAssetFile({
          fileHash,
          fileName: "source.pdf",
          fileSizeByte: bytes.byteLength,
          objectKey,
          profession: "marketing",
          storageRoot,
          ...invalid,
        }),
      ).rejects.toThrow();
    }
  });

  it("rejects a paper_asset real path that escapes through a directory link", async () => {
    const storageRoot = await mkdtemp(join(tmpdir(), "tiku-read-root-"));
    const outsideRoot = await mkdtemp(join(tmpdir(), "tiku-read-outside-"));
    const bytes = Buffer.from("outside private bytes");
    const fileHash = createHash("sha256").update(bytes).digest("hex");
    const outsideMonth = join(outsideRoot, "202605");
    const linkedMonth = join(
      storageRoot,
      "dev",
      "paper-asset",
      "marketing",
      "202605",
    );

    await mkdir(outsideMonth, { recursive: true });
    await writeFile(join(outsideMonth, `${fileHash}.pdf`), bytes);
    await mkdir(join(linkedMonth, ".."), { recursive: true });
    await symlink(outsideMonth, linkedMonth, "junction");

    await expect(
      readLocalPaperAssetFile({
        fileHash,
        fileName: "source.pdf",
        fileSizeByte: bytes.byteLength,
        objectKey: `dev/paper-asset/marketing/202605/${fileHash}.pdf`,
        profession: "marketing",
        storageRoot,
      }),
    ).rejects.toThrow();
  });

  it("stores uploaded paper_asset bytes under ignored runtime storage and returns metadata only", async () => {
    const storageRoot = await mkdtemp(join(tmpdir(), "tiku-upload-test-"));
    const fileBytes = new TextEncoder().encode("controlled local upload");
    const expectedHash = createHash("sha256").update(fileBytes).digest("hex");

    const metadata = await storeLocalPaperAssetFile({
      file: new File([fileBytes], "local-paper-source.txt", {
        type: "text/plain",
      }),
      paperAttachmentUsage: "paper_source",
      paperPublicId: "paper-public-001",
      profession: "marketing",
      storageRoot,
      uploadedAt: new Date("2026-05-25T08:10:00.000Z"),
    });

    expect(metadata).toMatchObject({
      contentType: "text/plain",
      fileHash: expectedHash,
      fileName: "local-paper-source.txt",
      fileSizeByte: fileBytes.byteLength,
      objectKey: `dev/paper-asset/marketing/202605/${expectedHash}.txt`,
      paperAttachmentUsage: "paper_source",
      paperPublicId: "paper-public-001",
    });
    expect(metadata).not.toHaveProperty("localFilePath");
    await expect(
      readFile(join(storageRoot, metadata.objectKey), "utf8"),
    ).resolves.toBe("controlled local upload");
  });

  it("accepts multipart paper_asset uploads through the protected runtime without exposing objectKey", async () => {
    const storageRoot = await mkdtemp(
      join(tmpdir(), "tiku-route-upload-test-"),
    );
    const capturedPaperAssetInputs: unknown[] = [];
    const handlers = createPaperCompositionLifecycleRuntimeRouteHandlers({
      localPaperAssetStorageRoot: storageRoot,
      repositories: createRepositories(capturedPaperAssetInputs),
      sessionService: createSessionService(),
    });
    const formData = new FormData();

    formData.set("commandPublicId", "paper-asset-command-local-upload-001");
    formData.set("paperPublicId", "paper-public-001");
    formData.set("paperAttachmentUsage", "paper_source");
    formData.set("profession", "marketing");
    formData.set("fileName", "local-paper-source.md");
    formData.set(
      "file",
      new File(["controlled multipart upload"], "local-paper-source.md", {
        type: "text/markdown",
      }),
    );

    const response = await handlers.paperAssets.collection.POST(
      new Request("http://localhost/api/v1/paper-assets", {
        body: formData,
        headers: { authorization: "Bearer admin-session-token" },
        method: "POST",
      }),
    );
    const payload = await response.json();
    const serializedPayload = JSON.stringify(payload);

    expect(payload).toMatchObject({
      code: 0,
      data: {
        paperAsset: {
          publicId: "paper-asset-local-upload-001",
          paperPublicId: "paper-public-001",
          paperAttachmentUsage: "paper_source",
          fileName: "local-paper-source.md",
          contentType: "text/markdown",
        },
      },
    });
    expect(capturedPaperAssetInputs).toEqual([
      expect.objectContaining({
        actorPublicId: "admin-content-public",
        idempotencyKeyHash: expect.stringMatching(/^sha256:[a-f0-9]{64}$/),
        requestFingerprint: expect.stringMatching(/^sha256:[a-f0-9]{64}$/),
        fileName: "local-paper-source.md",
        objectKey: expect.stringMatching(
          /^dev\/paper-asset\/marketing\/\d{6}\/[a-f0-9]{64}\.md$/,
        ),
      }),
    ]);
    expect(JSON.stringify(capturedPaperAssetInputs)).not.toContain(
      "paper-asset-command-local-upload-001",
    );
    expect(serializedPayload).not.toContain("objectKey");
    expect(serializedPayload).not.toContain(storageRoot);
  });

  it("stores uploaded resource bytes under ignored local resource storage", async () => {
    const storageRoot = await mkdtemp(join(tmpdir(), "tiku-resource-test-"));
    const fileBytes = new TextEncoder().encode(
      "# Local Resource\n\ncontrolled",
    );
    const expectedHash = createHash("sha256").update(fileBytes).digest("hex");

    const metadata = await storeLocalResourceFile({
      file: new File([fileBytes], "local-resource.md", {
        type: "text/markdown",
      }),
      profession: "marketing",
      resourceType: "knowledge_doc",
      storageRoot,
      uploadedAt: new Date("2026-05-25T08:10:00.000Z"),
    });

    expect(metadata).toMatchObject({
      contentType: "text/markdown",
      fileHash: expectedHash,
      fileName: "local-resource.md",
      fileSizeByte: fileBytes.byteLength,
      objectKey: `dev/resource/marketing/202605/${expectedHash}.md`,
      profession: "marketing",
      resourceType: "knowledge_doc",
    });
    expect(metadata).not.toHaveProperty("localFilePath");
    await expect(
      readFile(join(storageRoot, metadata.objectKey), "utf8"),
    ).resolves.toBe("# Local Resource\n\ncontrolled");
  });
});

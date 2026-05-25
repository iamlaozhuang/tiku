import { createHash } from "node:crypto";
import { mkdtemp, readFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { describe, expect, it } from "vitest";

import {
  createPaperCompositionLifecycleRuntimeRouteHandlers,
  type PaperCompositionLifecycleRuntimeRepositories,
} from "@/server/services/paper-composition-lifecycle-runtime";
import { storeLocalPaperAssetFile } from "@/server/services/local-paper-asset-storage";
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
  const paperAssetRepository: PaperAssetRepository = {
    async listPaperAssets() {
      return { rows: [], total: 0 };
    },
    async createPaperAsset(input) {
      capturedPaperAssetInputs.push(input);

      return {
        id: 1,
        public_id: "paper-asset-local-upload-001",
        paper_public_id: input.paperPublicId,
        paper_attachment_usage: input.paperAttachmentUsage,
        file_name: input.fileName,
        object_key: input.objectKey,
        content_type: input.contentType,
        file_size_byte: input.fileSizeByte,
        file_hash: input.fileHash,
        created_at: createdAt,
      };
    },
    async findPaperAssetByPublicId() {
      return null;
    },
    async deletePaperAsset() {
      return true;
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
        fileName: "local-paper-source.md",
        objectKey: expect.stringMatching(
          /^dev\/paper-asset\/marketing\/\d{6}\/[a-f0-9]{64}\.md$/,
        ),
      }),
    ]);
    expect(serializedPayload).not.toContain("objectKey");
    expect(serializedPayload).not.toContain(storageRoot);
  });
});

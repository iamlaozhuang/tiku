import { createHash } from "node:crypto";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { createPaperAssetService } from "./paper-asset-service";
import {
  normalizeCreatePaperAssetInput,
  normalizePaperAssetListInput,
} from "../validators/paper-asset";
import type {
  PaperAssetAccessRow,
  PaperAssetRepository,
} from "../repositories/paper-asset-repository";

const createdAt = new Date("2026-05-19T06:00:00.000Z");

function createPaperAsset(
  overrides: Partial<PaperAssetAccessRow> = {},
): PaperAssetAccessRow {
  return {
    id: 701,
    public_id: "paper_asset_public_123",
    paper_public_id: "paper_public_123",
    profession: "logistics",
    paper_attachment_usage: "paper_source",
    file_name: "2026-logistics-skill.pdf",
    object_key:
      "dev/paper-asset/logistics/202605/abc123def4567890abcdef1234567890.pdf",
    content_type: "application/pdf",
    file_size_byte: 2048,
    file_hash: "abc123def4567890abcdef1234567890",
    created_at: createdAt,
    ...overrides,
  };
}

function createRepository(
  overrides: Partial<PaperAssetRepository> = {},
): PaperAssetRepository {
  let preparedInput:
    | Parameters<
        NonNullable<PaperAssetRepository["preparePaperAssetUpload"]>
      >[0]
    | undefined;

  return {
    async preparePaperAssetUpload(input) {
      preparedInput = input;
      return {
        status: "prepared",
        operation: {
          publicId: "paper-asset-upload-operation-service-test",
          paperAssetPublicId: "paper_asset_public_123",
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
        paperAsset: createPaperAsset({
          paper_public_id: preparedInput.paperPublicId,
          paper_attachment_usage: preparedInput.paperAttachmentUsage,
          file_name: preparedInput.fileName,
          object_key: preparedInput.objectKey,
          content_type: preparedInput.contentType,
          file_size_byte: preparedInput.fileSizeByte,
          file_hash: preparedInput.fileHash,
        }),
      };
    },
    async recordPaperAssetUploadFailure() {},
    async listPaperAssets() {
      return {
        total: 1,
        rows: [createPaperAsset()],
      };
    },
    async findPaperAssetByPublicId(publicId) {
      return createPaperAsset({
        public_id: publicId,
      });
    },
    async deletePaperAsset() {
      return true;
    },
    ...overrides,
  };
}

describe("paper asset service", () => {
  it("accepts exactly the six creatable attachment usages", () => {
    const creatableUsages = [
      "paper_source",
      "material_paper",
      "answer_sheet",
      "answer_paper",
      "answer_analysis",
      "source_material",
    ];
    const createInput = (paperAttachmentUsage: string) => ({
      commandPublicId: "paper-asset-command-service-contract",
      paperPublicId: "paper_public_123",
      paperAttachmentUsage,
      fileName: "controlled.pdf",
      objectKey: `dev/paper-asset/logistics/202605/${"a".repeat(64)}.pdf`,
      contentType: "application/pdf",
      fileSizeByte: 10,
      fileHash: "a".repeat(64),
    });

    for (const usage of creatableUsages) {
      expect(normalizeCreatePaperAssetInput(createInput(usage))).toMatchObject({
        success: true,
        value: { paperAttachmentUsage: usage },
      });
    }
    for (const usage of ["other", "", "PAPER_SOURCE", "unknown"]) {
      expect(normalizeCreatePaperAssetInput(createInput(usage))).toEqual({
        success: false,
        message: "Invalid paper_asset input.",
      });
    }
    expect(
      normalizePaperAssetListInput({ paperAttachmentUsage: "other" }),
    ).toMatchObject({ paperAttachmentUsage: "other" });
  });

  it("lists paper_asset metadata without exposing object keys", async () => {
    const receivedQueries: unknown[] = [];
    const service = createPaperAssetService(
      createRepository({
        async listPaperAssets(query) {
          receivedQueries.push(query);

          return {
            total: 1,
            rows: [createPaperAsset()],
          };
        },
      }),
    );

    await expect(
      service.listPaperAssets({
        page: 1,
        pageSize: 20,
        paperPublicId: "paper_public_123",
        paperAttachmentUsage: "paper_source",
      }),
    ).resolves.toEqual({
      code: 0,
      message: "ok",
      data: [
        {
          publicId: "paper_asset_public_123",
          paperPublicId: "paper_public_123",
          paperAttachmentUsage: "paper_source",
          fileName: "2026-logistics-skill.pdf",
          contentType: "application/pdf",
          fileSizeByte: 2048,
          fileHash: "abc123def4567890abcdef1234567890",
          createdAt: "2026-05-19T06:00:00.000Z",
        },
      ],
      pagination: {
        page: 1,
        pageSize: 20,
        total: 1,
        sortBy: "createdAt",
        sortOrder: "desc",
      },
    });
    expect(receivedQueries).toEqual([
      {
        page: 1,
        pageSize: 20,
        sortBy: "createdAt",
        sortOrder: "desc",
        paperPublicId: "paper_public_123",
        paperAttachmentUsage: "paper_source",
      },
    ]);
  });

  it("creates and reads paper_attachment_usage metadata with standard DTO fields", async () => {
    const fileBytes = Buffer.from("analysis-pdf");
    const fileHash = createHash("sha256").update(fileBytes).digest("hex");
    const storageRoot = await mkdtemp(
      join(tmpdir(), "tiku-paper-service-test-"),
    );
    const service = createPaperAssetService(createRepository(), {
      mutationContext: {
        actorPublicId: "admin_public_content",
        auditLog: {
          actorRole: "content_admin",
          actionType: "paper_asset.create",
          metadataSummary: "redacted paper_asset mutation metadata",
          requestIp: null,
        },
      },
    });

    await expect(
      service.createPaperAsset({
        commandPublicId: "paper-asset-command-service-test",
        storageRoot,
        preparedFile: {
          bytes: fileBytes,
          paperPublicId: "paper_public_123",
          paperAttachmentUsage: "answer_analysis",
          profession: "logistics",
          fileName: "analysis.pdf",
          objectKey: `dev/paper-asset/logistics/202605/${fileHash}.pdf`,
          contentType: "application/pdf",
          fileSizeByte: fileBytes.byteLength,
          fileHash,
        },
      }),
    ).resolves.toEqual({
      code: 0,
      message: "ok",
      data: {
        paperAsset: {
          publicId: "paper_asset_public_123",
          paperPublicId: "paper_public_123",
          paperAttachmentUsage: "answer_analysis",
          fileName: "analysis.pdf",
          contentType: "application/pdf",
          fileSizeByte: fileBytes.byteLength,
          fileHash,
          createdAt: "2026-05-19T06:00:00.000Z",
        },
      },
    });

    await expect(
      service.getPaperAsset("paper_asset_public_123"),
    ).resolves.toEqual({
      code: 0,
      message: "ok",
      data: {
        paperAsset: {
          publicId: "paper_asset_public_123",
          paperPublicId: "paper_public_123",
          paperAttachmentUsage: "paper_source",
          fileName: "2026-logistics-skill.pdf",
          contentType: "application/pdf",
          fileSizeByte: 2048,
          fileHash: "abc123def4567890abcdef1234567890",
          createdAt: "2026-05-19T06:00:00.000Z",
        },
      },
    });
  });

  it("rejects invalid asset input, missing assets, and returns delete result by public identifier", async () => {
    const service = createPaperAssetService(
      createRepository({
        async findPaperAssetByPublicId(publicId) {
          return publicId === "missing_asset"
            ? null
            : createPaperAsset({
                public_id: publicId,
              });
        },
        async deletePaperAsset(publicId) {
          return publicId !== "missing_asset";
        },
      }),
      {
        deleteMutationContext: {
          actorPublicId: "admin_public_123",
          auditLog: {
            actorRole: "content_admin",
            actionType: "paper_asset.delete",
            metadataSummary: "redacted paper_asset mutation metadata",
            requestIp: null,
          },
        },
      },
    );

    await expect(service.createPaperAsset({ fileName: "" })).resolves.toEqual({
      code: 422205,
      message: "Invalid paper_asset input.",
      data: null,
    });
    await expect(service.getPaperAsset("missing_asset")).resolves.toEqual({
      code: 404204,
      message: "Paper asset does not exist.",
      data: null,
    });
    await expect(
      service.deletePaperAsset("paper_asset_public_123"),
    ).resolves.toEqual({
      code: 0,
      message: "ok",
      data: {
        deletedPaperAssetPublicId: "paper_asset_public_123",
      },
    });
  });
});

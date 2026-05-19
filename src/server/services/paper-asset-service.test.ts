import { describe, expect, it } from "vitest";

import { createPaperAssetService } from "./paper-asset-service";
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
  return {
    async listPaperAssets() {
      return {
        total: 1,
        rows: [createPaperAsset()],
      };
    },
    async createPaperAsset(input) {
      return createPaperAsset({
        paper_public_id: input.paperPublicId,
        paper_attachment_usage: input.paperAttachmentUsage,
        file_name: input.fileName,
        object_key: input.objectKey,
        content_type: input.contentType,
        file_size_byte: input.fileSizeByte,
        file_hash: input.fileHash,
      });
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
    const service = createPaperAssetService(createRepository());

    await expect(
      service.createPaperAsset({
        paperPublicId: "paper_public_123",
        paperAttachmentUsage: "answer_analysis",
        fileName: "analysis.pdf",
        objectKey:
          "dev/paper-asset/logistics/202605/feedfacefeedfacefeedfacefeedface.pdf",
        contentType: "application/pdf",
        fileSizeByte: 4096,
        fileHash: "feedfacefeedfacefeedfacefeedface",
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
          fileSizeByte: 4096,
          fileHash: "feedfacefeedfacefeedfacefeedface",
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

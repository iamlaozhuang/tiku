import { describe, expect, it } from "vitest";

import { createPaperAssetRouteHandlers } from "./paper-asset-route";
import type { PaperAssetService } from "./paper-asset-service";
import type { PaperAssetDto } from "../contracts/paper-asset-contract";

const paperAssetDto: PaperAssetDto = {
  publicId: "paper_asset_public_123",
  paperPublicId: "paper_public_123",
  paperAttachmentUsage: "paper_source",
  fileName: "2026-logistics-skill.pdf",
  contentType: "application/pdf",
  fileSizeByte: 2048,
  fileHash: "abc123def4567890abcdef1234567890",
  createdAt: "2026-05-19T06:00:00.000Z",
};

function createService(): PaperAssetService {
  return {
    async listPaperAssets() {
      return {
        code: 0,
        message: "ok",
        data: [paperAssetDto],
        pagination: {
          page: 1,
          pageSize: 20,
          total: 1,
          sortBy: "createdAt",
          sortOrder: "desc",
        },
      };
    },
    async createPaperAsset() {
      return {
        code: 0,
        message: "ok",
        data: {
          paperAsset: paperAssetDto,
        },
      };
    },
    async getPaperAsset(publicId) {
      return {
        code: 0,
        message: "ok",
        data: {
          paperAsset: {
            ...paperAssetDto,
            publicId,
          },
        },
      };
    },
    async deletePaperAsset(publicId) {
      return {
        code: 0,
        message: "ok",
        data: {
          deletedPaperAssetPublicId: publicId,
        },
      };
    },
  };
}

describe("paper asset route handlers", () => {
  it("returns standard paper-assets list, create, detail, and delete responses", async () => {
    const handlers = createPaperAssetRouteHandlers(createService());
    const context = {
      params: Promise.resolve({
        publicId: "paper_asset_public_123",
      }),
    };

    await expect(
      handlers.collection
        .GET(
          new Request(
            "http://localhost/api/v1/paper-assets?page=1&pageSize=20&paperAttachmentUsage=paper_source",
          ),
        )
        .then((response) => response.json()),
    ).resolves.toEqual({
      code: 0,
      message: "ok",
      data: [paperAssetDto],
      pagination: {
        page: 1,
        pageSize: 20,
        total: 1,
        sortBy: "createdAt",
        sortOrder: "desc",
      },
    });

    await expect(
      handlers.collection
        .POST(
          new Request("http://localhost/api/v1/paper-assets", {
            method: "POST",
            body: JSON.stringify({
              paperPublicId: "paper_public_123",
              paperAttachmentUsage: "paper_source",
              fileName: "2026-logistics-skill.pdf",
              objectKey:
                "dev/paper-asset/logistics/202605/abc123def4567890abcdef1234567890.pdf",
              contentType: "application/pdf",
              fileSizeByte: 2048,
              fileHash: "abc123def4567890abcdef1234567890",
            }),
          }),
        )
        .then((response) => response.json()),
    ).resolves.toEqual({
      code: 0,
      message: "ok",
      data: {
        paperAsset: paperAssetDto,
      },
    });

    await expect(
      handlers.detail
        .GET(
          new Request(
            "http://localhost/api/v1/paper-assets/paper_asset_public_123",
          ),
          context,
        )
        .then((response) => response.json()),
    ).resolves.toEqual({
      code: 0,
      message: "ok",
      data: {
        paperAsset: paperAssetDto,
      },
    });

    await expect(
      handlers.detail
        .DELETE(
          new Request(
            "http://localhost/api/v1/paper-assets/paper_asset_public_123",
            {
              method: "DELETE",
            },
          ),
          context,
        )
        .then((response) => response.json()),
    ).resolves.toEqual({
      code: 0,
      message: "ok",
      data: {
        deletedPaperAssetPublicId: "paper_asset_public_123",
      },
    });
  });
});

import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type {
  PaperAssetDeleteResultDto,
  PaperAssetDto,
  PaperAssetResultDto,
} from "../contracts/paper-asset-contract";
import {
  mapPaperAssetResultToApi,
  mapPaperAssetToApi,
} from "../mappers/paper-asset-mapper";
import type { PaperAssetRepository } from "../repositories/paper-asset-repository";
import {
  normalizeCreatePaperAssetInput,
  normalizePaperAssetListInput,
} from "../validators/paper-asset";

export type PaperAssetService = {
  listPaperAssets(
    input?: Record<string, unknown>,
  ): Promise<ApiResponse<PaperAssetDto[] | null>>;
  createPaperAsset(
    input: unknown,
  ): Promise<ApiResponse<PaperAssetResultDto | null>>;
  getPaperAsset(
    publicId: string,
  ): Promise<ApiResponse<PaperAssetResultDto | null>>;
  deletePaperAsset(
    publicId: string,
  ): Promise<ApiResponse<PaperAssetDeleteResultDto | null>>;
};

const INVALID_PAPER_ASSET_INPUT_CODE = 422205;
const PAPER_ASSET_NOT_FOUND_CODE = 404204;
const PAPER_ASSET_RUNTIME_UNAVAILABLE_CODE = 503204;
const PAPER_ASSET_CONTRACT_TERM = "paper_asset";
const PAPER_ATTACHMENT_USAGE_CONTRACT_TERM = "paper_attachment_usage";

void [PAPER_ASSET_CONTRACT_TERM, PAPER_ATTACHMENT_USAGE_CONTRACT_TERM];

function createInvalidPaperAssetInputResponse(): ApiResponse<null> {
  return createErrorResponse(
    INVALID_PAPER_ASSET_INPUT_CODE,
    "Invalid paper_asset input.",
  );
}

function createPaperAssetNotFoundResponse(): ApiResponse<null> {
  return createErrorResponse(
    PAPER_ASSET_NOT_FOUND_CODE,
    "Paper asset does not exist.",
  );
}

export function createPaperAssetService(
  paperAssetRepository: PaperAssetRepository,
): PaperAssetService {
  return {
    async listPaperAssets(input = {}) {
      const paperAssetQuery = normalizePaperAssetListInput(input);
      const paperAssetList =
        await paperAssetRepository.listPaperAssets(paperAssetQuery);

      return createPaginatedResponse(
        paperAssetList.rows.map((paperAsset) => mapPaperAssetToApi(paperAsset)),
        {
          page: paperAssetQuery.page,
          pageSize: paperAssetQuery.pageSize,
          total: paperAssetList.total,
          sortBy: paperAssetQuery.sortBy,
          sortOrder: paperAssetQuery.sortOrder,
        },
      );
    },

    async createPaperAsset(input) {
      const paperAssetInput = normalizeCreatePaperAssetInput(input);

      if (!paperAssetInput.success) {
        return createInvalidPaperAssetInputResponse();
      }

      const paperAsset = await paperAssetRepository.createPaperAsset(
        paperAssetInput.value,
      );

      return createSuccessResponse(mapPaperAssetResultToApi(paperAsset));
    },

    async getPaperAsset(publicId) {
      const paperAsset =
        await paperAssetRepository.findPaperAssetByPublicId(publicId);

      if (paperAsset === null) {
        return createPaperAssetNotFoundResponse();
      }

      return createSuccessResponse(mapPaperAssetResultToApi(paperAsset));
    },

    async deletePaperAsset(publicId) {
      const deleted = await paperAssetRepository.deletePaperAsset(publicId);

      if (!deleted) {
        return createPaperAssetNotFoundResponse();
      }

      return createSuccessResponse({
        deletedPaperAssetPublicId: publicId,
      });
    },
  };
}

export function createUnavailablePaperAssetService(): PaperAssetService {
  return {
    async listPaperAssets() {
      return createErrorResponse(
        PAPER_ASSET_RUNTIME_UNAVAILABLE_CODE,
        "Paper asset runtime is not configured.",
      );
    },
    async createPaperAsset() {
      return createErrorResponse(
        PAPER_ASSET_RUNTIME_UNAVAILABLE_CODE,
        "Paper asset runtime is not configured.",
      );
    },
    async getPaperAsset() {
      return createErrorResponse(
        PAPER_ASSET_RUNTIME_UNAVAILABLE_CODE,
        "Paper asset runtime is not configured.",
      );
    },
    async deletePaperAsset() {
      return createErrorResponse(
        PAPER_ASSET_RUNTIME_UNAVAILABLE_CODE,
        "Paper asset runtime is not configured.",
      );
    },
  };
}

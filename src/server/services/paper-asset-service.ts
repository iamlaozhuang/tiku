import { createHash, randomUUID } from "node:crypto";

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
import {
  type PaperAssetCreateMutationContext,
  type PaperAssetDeleteMutationContext,
  type PaperAssetAccessRow,
  type PaperAssetRepository,
} from "../repositories/paper-asset-repository";
import { professionValues, type Profession } from "../models/paper";
import {
  normalizeCreatePaperAssetInput,
  normalizePaperAssetListInput,
} from "../validators/paper-asset";
import {
  storePreparedLocalPaperAssetFile,
  type PreparedLocalPaperAssetFile,
} from "./local-paper-asset-storage";

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
  getPaperAssetDownload(publicId: string): Promise<PaperAssetAccessRow | null>;
  deletePaperAsset(
    publicId: string,
  ): Promise<ApiResponse<PaperAssetDeleteResultDto | null>>;
};

export type PaperAssetServiceOptions = {
  mutationContext?: PaperAssetCreateMutationContext;
  deleteMutationContext?: PaperAssetDeleteMutationContext;
};

const INVALID_PAPER_ASSET_INPUT_CODE = 422205;
const PAPER_ASSET_NOT_FOUND_CODE = 404204;
const PAPER_ASSET_COMMAND_CONFLICT_CODE = 409208;
const PAPER_ASSET_UPLOAD_FAILED_CODE = 500204;
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

function createPaperAssetCommandConflictResponse(): ApiResponse<null> {
  return createErrorResponse(
    PAPER_ASSET_COMMAND_CONFLICT_CODE,
    "Paper asset command conflicts with an existing request.",
  );
}

function createPaperAssetUploadFailedResponse(): ApiResponse<null> {
  return createErrorResponse(
    PAPER_ASSET_UPLOAD_FAILED_CODE,
    "Paper asset upload failed.",
  );
}

type PaperAssetUploadServiceInput = {
  commandPublicId: string;
  preparedFile: PreparedLocalPaperAssetFile;
  storageRoot?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isProfession(value: unknown): value is Profession {
  return (
    typeof value === "string" && professionValues.includes(value as Profession)
  );
}

function normalizePaperAssetUploadServiceInput(
  input: unknown,
): PaperAssetUploadServiceInput | null {
  if (!isRecord(input) || !isRecord(input.preparedFile)) {
    return null;
  }

  const preparedFile =
    input.preparedFile as Partial<PreparedLocalPaperAssetFile>;
  const normalizedInput = normalizeCreatePaperAssetInput({
    commandPublicId: input.commandPublicId,
    paperPublicId: preparedFile.paperPublicId,
    paperAttachmentUsage: preparedFile.paperAttachmentUsage,
    fileName: preparedFile.fileName,
    objectKey: preparedFile.objectKey,
    contentType: preparedFile.contentType,
    fileSizeByte: preparedFile.fileSizeByte,
    fileHash: preparedFile.fileHash,
  });

  if (
    !normalizedInput.success ||
    !Buffer.isBuffer(preparedFile.bytes) ||
    preparedFile.bytes.byteLength !== normalizedInput.value.fileSizeByte ||
    createHash("sha256").update(preparedFile.bytes).digest("hex") !==
      normalizedInput.value.fileHash ||
    !isProfession(preparedFile.profession) ||
    (input.storageRoot !== undefined &&
      (typeof input.storageRoot !== "string" ||
        input.storageRoot.trim().length === 0))
  ) {
    return null;
  }

  return {
    commandPublicId: normalizedInput.value.commandPublicId,
    preparedFile: {
      bytes: preparedFile.bytes,
      paperPublicId: normalizedInput.value.paperPublicId,
      paperAttachmentUsage: normalizedInput.value.paperAttachmentUsage,
      fileName: normalizedInput.value.fileName,
      objectKey: normalizedInput.value.objectKey,
      contentType: normalizedInput.value.contentType,
      fileSizeByte: normalizedInput.value.fileSizeByte,
      fileHash: normalizedInput.value.fileHash,
      profession: preparedFile.profession,
    },
    ...(input.storageRoot === undefined
      ? {}
      : { storageRoot: input.storageRoot }),
  };
}

function createSha256Digest(value: string): string {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

function createPaperAssetUploadRequestFingerprint(
  preparedFile: PreparedLocalPaperAssetFile,
): string {
  return createSha256Digest(
    JSON.stringify({
      paperPublicId: preparedFile.paperPublicId,
      paperAttachmentUsage: preparedFile.paperAttachmentUsage,
      profession: preparedFile.profession,
      fileName: preparedFile.fileName,
      contentType: preparedFile.contentType,
      fileSizeByte: preparedFile.fileSizeByte,
      fileHash: preparedFile.fileHash,
    }),
  );
}

export function createPaperAssetService(
  paperAssetRepository: PaperAssetRepository,
  options: PaperAssetServiceOptions = {},
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
      const uploadInput = normalizePaperAssetUploadServiceInput(input);

      if (uploadInput === null) {
        return createInvalidPaperAssetInputResponse();
      }

      if (options.mutationContext === undefined) {
        throw new Error("Paper asset create requires mutation audit context.");
      }

      if (
        paperAssetRepository.preparePaperAssetUpload === undefined ||
        paperAssetRepository.markPaperAssetUploadFileStored === undefined ||
        paperAssetRepository.completePaperAssetUpload === undefined ||
        paperAssetRepository.recordPaperAssetUploadFailure === undefined
      ) {
        return createErrorResponse(
          PAPER_ASSET_RUNTIME_UNAVAILABLE_CODE,
          "Durable paper asset storage is unavailable.",
        );
      }

      const requestFingerprint = createPaperAssetUploadRequestFingerprint(
        uploadInput.preparedFile,
      );
      let preparation;

      try {
        preparation = await paperAssetRepository.preparePaperAssetUpload({
          operationPublicId: `paper-asset-upload-operation-${randomUUID()}`,
          paperAssetPublicId: `paper-asset-${randomUUID()}`,
          actorPublicId: options.mutationContext.actorPublicId,
          idempotencyKeyHash: createSha256Digest(uploadInput.commandPublicId),
          requestFingerprint,
          paperPublicId: uploadInput.preparedFile.paperPublicId,
          paperAttachmentUsage: uploadInput.preparedFile.paperAttachmentUsage,
          profession: uploadInput.preparedFile.profession,
          fileName: uploadInput.preparedFile.fileName,
          objectKey: uploadInput.preparedFile.objectKey,
          contentType: uploadInput.preparedFile.contentType,
          fileSizeByte: uploadInput.preparedFile.fileSizeByte,
          fileHash: uploadInput.preparedFile.fileHash,
        });
      } catch {
        return createPaperAssetUploadFailedResponse();
      }

      if (preparation.status === "not_found") {
        return createPaperAssetNotFoundResponse();
      }

      if (preparation.status === "invalid_scope") {
        return createInvalidPaperAssetInputResponse();
      }

      if (preparation.status === "conflict") {
        return createPaperAssetCommandConflictResponse();
      }

      if (preparation.status === "completed") {
        return createSuccessResponse(
          mapPaperAssetResultToApi(preparation.paperAsset),
        );
      }

      const operation = preparation.operation;

      try {
        await storePreparedLocalPaperAssetFile({
          preparedFile: uploadInput.preparedFile,
          objectKey: operation.objectKey,
          storageRoot: uploadInput.storageRoot,
        });
        const fileStored =
          await paperAssetRepository.markPaperAssetUploadFileStored(
            operation.publicId,
          );

        if (!fileStored) {
          throw new Error("Paper asset upload operation state changed.");
        }

        const completion = await paperAssetRepository.completePaperAssetUpload({
          operationPublicId: operation.publicId,
          requestFingerprint,
          mutationContext: options.mutationContext,
        });

        if (completion.status === "conflict") {
          return createPaperAssetCommandConflictResponse();
        }

        return createSuccessResponse(
          mapPaperAssetResultToApi(completion.paperAsset),
        );
      } catch (error) {
        try {
          await paperAssetRepository.recordPaperAssetUploadFailure({
            operationPublicId: operation.publicId,
            failureMessageDigest: createSha256Digest(
              error instanceof Error ? error.name : "unknown_upload_failure",
            ),
          });
        } catch {
          // The durable pending/file_stored operation remains safely replayable.
        }

        return createPaperAssetUploadFailedResponse();
      }
    },

    async getPaperAsset(publicId) {
      const paperAsset =
        await paperAssetRepository.findPaperAssetByPublicId(publicId);

      if (paperAsset === null) {
        return createPaperAssetNotFoundResponse();
      }

      return createSuccessResponse(mapPaperAssetResultToApi(paperAsset));
    },

    async getPaperAssetDownload(publicId) {
      return paperAssetRepository.findPaperAssetByPublicId(publicId);
    },

    async deletePaperAsset(publicId) {
      if (options.deleteMutationContext === undefined) {
        throw new Error("Paper asset delete requires mutation audit context.");
      }

      const deleted = await paperAssetRepository.deletePaperAsset(
        publicId,
        options.deleteMutationContext,
      );

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
    async getPaperAssetDownload() {
      return null;
    },
    async deletePaperAsset() {
      return createErrorResponse(
        PAPER_ASSET_RUNTIME_UNAVAILABLE_CODE,
        "Paper asset runtime is not configured.",
      );
    },
  };
}

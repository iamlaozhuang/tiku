import { createHash, randomUUID } from "node:crypto";

import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type { ContentImageResultDto } from "../contracts/content-image-contract";
import type {
  ContentImageAccessRow,
  ContentImageMutationContext,
  ContentImageRepository,
} from "../repositories/content-image-repository";
import { MAX_CONTENT_IMAGE_SIZE_BYTE } from "../validators/content-image";
import {
  readLocalContentImageFile,
  hasContentImageFileSignature,
  storePreparedLocalContentImageFile,
  type PreparedLocalContentImageFile,
} from "./local-content-image-storage";

type UploadInput = {
  commandPublicId: string;
  preparedFile: PreparedLocalContentImageFile;
  storageRoot?: string;
};

export type ContentImageReadResult =
  | { status: "found"; bytes: Buffer; contentType: string }
  | { status: "not_found" }
  | { status: "unavailable" };

export type ContentImageService = {
  uploadContentImage(
    input: UploadInput,
  ): Promise<ApiResponse<ContentImageResultDto | null>>;
  readContentImage(publicId: string): Promise<ContentImageReadResult>;
};

export type ContentImageServiceOptions = {
  mutationContext?: ContentImageMutationContext;
  storageRoot?: string;
  storeFile?: typeof storePreparedLocalContentImageFile;
  readFile?: typeof readLocalContentImageFile;
};

function digest(value: string | Buffer): string {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

function mapContentImage(row: ContentImageAccessRow): ContentImageResultDto {
  return {
    contentImage: {
      publicId: row.public_id,
      contentType: row.content_type,
      fileSizeByte: row.file_size_byte,
      createdAt: row.created_at.toISOString(),
      url: `/api/v1/content-images/${row.public_id}`,
    },
  };
}

function validateUploadInput(input: UploadInput): boolean {
  return (
    typeof input.commandPublicId === "string" &&
    input.commandPublicId.trim().length > 0 &&
    input.commandPublicId.length <= 200 &&
    Buffer.isBuffer(input.preparedFile.bytes) &&
    input.preparedFile.fileSizeByte > 0 &&
    input.preparedFile.fileSizeByte <= MAX_CONTENT_IMAGE_SIZE_BYTE &&
    input.preparedFile.bytes.byteLength === input.preparedFile.fileSizeByte &&
    createHash("sha256").update(input.preparedFile.bytes).digest("hex") ===
      input.preparedFile.fileHash &&
    hasContentImageFileSignature(
      input.preparedFile.bytes,
      input.preparedFile.contentType,
    )
  );
}

export function createContentImageService(
  repository: ContentImageRepository,
  options: ContentImageServiceOptions = {},
): ContentImageService {
  const storeFile = options.storeFile ?? storePreparedLocalContentImageFile;
  const readFile = options.readFile ?? readLocalContentImageFile;

  return {
    async uploadContentImage(input) {
      if (!validateUploadInput(input)) {
        return createErrorResponse(422209, "Invalid content_image input.");
      }
      if (options.mutationContext === undefined) {
        throw new Error(
          "Content image upload requires mutation audit context.",
        );
      }

      const requestFingerprint = digest(
        JSON.stringify({
          profession: input.preparedFile.profession,
          contentType: input.preparedFile.contentType,
          fileSizeByte: input.preparedFile.fileSizeByte,
          fileHash: input.preparedFile.fileHash,
        }),
      );
      let preparation;

      try {
        preparation = await repository.prepareContentImageUpload({
          operationPublicId: `content-image-upload-operation-${randomUUID()}`,
          contentImagePublicId: `content-image-${randomUUID()}`,
          actorPublicId: options.mutationContext.actorPublicId,
          idempotencyKeyHash: digest(input.commandPublicId.trim()),
          requestFingerprint,
          profession: input.preparedFile.profession,
          objectKey: input.preparedFile.objectKey,
          contentType: input.preparedFile.contentType,
          fileSizeByte: input.preparedFile.fileSizeByte,
          fileHash: input.preparedFile.fileHash,
        });
      } catch {
        return createErrorResponse(500209, "Content image upload failed.");
      }

      if (preparation.status === "conflict") {
        return createErrorResponse(
          409209,
          "Content image command conflicts with an existing request.",
        );
      }
      if (preparation.status === "completed") {
        return createSuccessResponse(mapContentImage(preparation.contentImage));
      }

      try {
        await storeFile({
          preparedFile: input.preparedFile,
          objectKey: preparation.objectKey,
          storageRoot: input.storageRoot ?? options.storageRoot,
        });
        const stored = await repository.markContentImageUploadFileStored(
          preparation.operationPublicId,
        );
        if (!stored) {
          throw new Error("Content image upload operation state changed.");
        }
        const completion = await repository.completeContentImageUpload({
          operationPublicId: preparation.operationPublicId,
          requestFingerprint,
          mutationContext: options.mutationContext,
        });
        return completion.status === "conflict"
          ? createErrorResponse(
              409209,
              "Content image command conflicts with an existing request.",
            )
          : createSuccessResponse(mapContentImage(completion.contentImage));
      } catch (error) {
        try {
          await repository.recordContentImageUploadFailure({
            operationPublicId: preparation.operationPublicId,
            failureMessageDigest: digest(
              error instanceof Error ? error.name : "unknown_upload_failure",
            ),
          });
        } catch {
          // A durable pending/file_stored operation remains safely replayable.
        }
        return createErrorResponse(500209, "Content image upload failed.");
      }
    },

    async readContentImage(publicId) {
      const row = await repository.findContentImageByPublicId(publicId);
      if (row === null) {
        return { status: "not_found" };
      }
      try {
        return {
          status: "found",
          bytes: await readFile({
            metadata: {
              profession: row.profession,
              objectKey: row.object_key,
              contentType: row.content_type,
              fileSizeByte: row.file_size_byte,
              fileHash: row.file_hash,
            },
            storageRoot: options.storageRoot,
          }),
          contentType: row.content_type,
        };
      } catch {
        return { status: "unavailable" };
      }
    },
  };
}

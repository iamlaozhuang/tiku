import { createHash } from "node:crypto";

import { describe, expect, it, vi } from "vitest";

describe("content_image service", () => {
  it("reuses the operation object key when a retry crosses a month boundary", async () => {
    const serviceModule = await import("./content-image-service");
    const storeFile = vi.fn().mockResolvedValue(undefined);
    const bytes = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const fileHash = createHash("sha256").update(bytes).digest("hex");
    const repository = {
      prepareContentImageUpload: vi.fn().mockResolvedValue({
        status: "prepared",
        operationPublicId: "content-image-upload-operation-1",
        objectKey: `dev/content-image/marketing/202606/${fileHash}.png`,
      }),
      markContentImageUploadFileStored: vi.fn().mockResolvedValue(true),
      completeContentImageUpload: vi.fn().mockResolvedValue({
        status: "completed",
        contentImage: {
          id: 1,
          public_id: "content-image-1",
          profession: "marketing",
          object_key: `dev/content-image/marketing/202606/${fileHash}.png`,
          content_type: "image/png",
          file_size_byte: bytes.byteLength,
          file_hash: fileHash,
          created_at: new Date("2026-07-01T00:00:00.000Z"),
        },
        replayed: false,
      }),
      recordContentImageUploadFailure: vi.fn(),
      findContentImageByPublicId: vi.fn(),
      findExistingContentImagePublicIds: vi.fn(),
    };
    const service = serviceModule.createContentImageService(repository, {
      mutationContext: {
        actorPublicId: "admin-public-1",
        auditLog: {
          actorRole: "content_admin",
          actionType: "content_image.create",
          metadataSummary: "redacted content_image upload metadata",
          requestIp: null,
        },
      },
      storeFile,
    });

    await expect(
      service.uploadContentImage({
        commandPublicId: "command-1",
        preparedFile: {
          bytes,
          profession: "marketing",
          objectKey: `dev/content-image/marketing/202607/${fileHash}.png`,
          contentType: "image/png",
          fileSizeByte: bytes.byteLength,
          fileHash,
        },
      }),
    ).resolves.toMatchObject({ code: 0 });
    expect(storeFile).toHaveBeenCalledWith(
      expect.objectContaining({
        objectKey: `dev/content-image/marketing/202606/${fileHash}.png`,
      }),
    );
  });

  it("replays a completed idempotent upload and never stores a second file", async () => {
    const serviceModule = await import("./content-image-service").catch(
      () => ({}),
    );
    const createService = Reflect.get(
      serviceModule,
      "createContentImageService",
    );

    expect(typeof createService).toBe("function");
    const storeFile = vi.fn();
    const repository = {
      prepareContentImageUpload: vi.fn().mockResolvedValue({
        status: "completed",
        contentImage: {
          id: 1,
          public_id: "content-image-1",
          profession: "marketing",
          object_key: "dev/content-image/marketing/202607/hash.png",
          content_type: "image/png",
          file_size_byte: 3,
          file_hash: "hash",
          created_at: new Date("2026-07-21T00:00:00.000Z"),
        },
      }),
    };
    const bytes = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const fileHash = createHash("sha256").update(bytes).digest("hex");
    const service = createService(repository, {
      mutationContext: {
        actorPublicId: "admin-public-1",
        auditLog: {
          actorRole: "content_admin",
          actionType: "content_image.create",
          metadataSummary: "redacted content_image upload metadata",
          requestIp: null,
        },
      },
      storeFile,
    });
    const response = await service.uploadContentImage({
      commandPublicId: "command-1",
      preparedFile: {
        bytes,
        profession: "marketing",
        objectKey: "dev/content-image/marketing/202607/hash.png",
        contentType: "image/png",
        fileSizeByte: bytes.byteLength,
        fileHash,
      },
    });

    expect(response).toMatchObject({
      code: 0,
      data: { contentImage: { publicId: "content-image-1" } },
    });
    expect(storeFile).not.toHaveBeenCalled();
  });
});

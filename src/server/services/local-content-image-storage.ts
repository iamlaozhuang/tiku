import { createHash, randomUUID } from "node:crypto";
import { link, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve, sep } from "node:path";

import type { Profession } from "../models/paper";
import { defaultLocalUploadStorageRoot } from "./local-paper-asset-storage";

export type PreparedLocalContentImageFile = {
  bytes: Buffer;
  profession: Profession;
  objectKey: string;
  contentType: string;
  fileSizeByte: number;
  fileHash: string;
};

type ContentImageMetadata = Omit<PreparedLocalContentImageFile, "bytes">;

const contentTypeExtension = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/gif", "gif"],
  ["image/webp", "webp"],
]);

export function hasContentImageFileSignature(
  bytes: Uint8Array,
  contentType: string,
): boolean {
  if (contentType === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (contentType === "image/png") {
    return [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every(
      (value, index) => bytes[index] === value,
    );
  }
  if (contentType === "image/gif") {
    const signature = Buffer.from(bytes.subarray(0, 6)).toString("ascii");
    return signature === "GIF87a" || signature === "GIF89a";
  }
  if (contentType === "image/webp") {
    return (
      Buffer.from(bytes.subarray(0, 4)).toString("ascii") === "RIFF" &&
      Buffer.from(bytes.subarray(8, 12)).toString("ascii") === "WEBP"
    );
  }
  return false;
}

function formatYearMonth(date: Date): string {
  return `${date.getUTCFullYear()}${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function resolveInsideStorageRoot(
  storageRoot: string,
  objectKey: string,
): string {
  const root = resolve(storageRoot);
  const target = resolve(root, ...objectKey.split("/"));
  const prefix = root.endsWith(sep) ? root : `${root}${sep}`;

  if (!target.startsWith(prefix)) {
    throw new Error("Local content_image storage target escaped storage root.");
  }

  return target;
}

function assertMetadataIdentity(metadata: ContentImageMetadata): void {
  const extension = contentTypeExtension.get(metadata.contentType);
  const segments = metadata.objectKey.split("/");

  if (
    extension === undefined ||
    segments.length !== 5 ||
    segments[0] !== "dev" ||
    segments[1] !== "content-image" ||
    segments[2] !== metadata.profession ||
    !/^\d{6}$/u.test(segments[3] ?? "") ||
    segments[4] !== `${metadata.fileHash}.${extension}`
  ) {
    throw new Error("Prepared content_image storage identity mismatch.");
  }
}

function hasExpectedIdentity(
  bytes: Buffer,
  metadata: ContentImageMetadata,
): boolean {
  return (
    bytes.byteLength === metadata.fileSizeByte &&
    createHash("sha256").update(bytes).digest("hex") === metadata.fileHash
  );
}

export async function prepareLocalContentImageFile({
  file,
  profession,
  uploadedAt = new Date(),
}: {
  file: File;
  profession: Profession;
  uploadedAt?: Date;
}): Promise<PreparedLocalContentImageFile> {
  const bytes = Buffer.from(await file.arrayBuffer());
  const fileHash = createHash("sha256").update(bytes).digest("hex");
  const extension = contentTypeExtension.get(file.type);

  if (
    extension === undefined ||
    !hasContentImageFileSignature(bytes, file.type)
  ) {
    throw new Error("Unsupported content_image content type.");
  }

  return {
    bytes,
    profession,
    objectKey: [
      "dev",
      "content-image",
      profession,
      formatYearMonth(uploadedAt),
      `${fileHash}.${extension}`,
    ].join("/"),
    contentType: file.type,
    fileSizeByte: bytes.byteLength,
    fileHash,
  };
}

export async function storePreparedLocalContentImageFile({
  preparedFile,
  objectKey = preparedFile.objectKey,
  storageRoot = defaultLocalUploadStorageRoot,
}: {
  preparedFile: PreparedLocalContentImageFile;
  objectKey?: string;
  storageRoot?: string;
}): Promise<void> {
  assertMetadataIdentity({ ...preparedFile, objectKey });
  const target = resolveInsideStorageRoot(storageRoot, objectKey);
  await mkdir(dirname(target), { recursive: true });
  try {
    const existing = await readFile(target);
    if (!hasExpectedIdentity(existing, preparedFile)) {
      throw new Error("Existing content_image object failed integrity check.");
    }
    return;
  } catch (error) {
    if (
      !(error instanceof Error) ||
      !("code" in error) ||
      error.code !== "ENOENT"
    ) {
      throw error;
    }
  }

  const temporaryTarget = `${target}.${randomUUID()}.tmp`;
  try {
    await writeFile(temporaryTarget, preparedFile.bytes, { flag: "wx" });
    await link(temporaryTarget, target);
    await rm(temporaryTarget, { force: true });
  } catch (error) {
    await rm(temporaryTarget, { force: true });
    try {
      const concurrent = await readFile(target);
      if (hasExpectedIdentity(concurrent, preparedFile)) {
        return;
      }
    } catch {
      // Preserve the original atomic write failure below.
    }
    throw error;
  }
}

export async function readLocalContentImageFile({
  metadata,
  storageRoot = defaultLocalUploadStorageRoot,
}: {
  metadata: ContentImageMetadata;
  storageRoot?: string;
}): Promise<Buffer> {
  assertMetadataIdentity(metadata);
  const bytes = await readFile(
    resolveInsideStorageRoot(storageRoot, metadata.objectKey),
  );

  if (!hasExpectedIdentity(bytes, metadata)) {
    throw new Error("Stored content_image integrity check failed.");
  }

  return bytes;
}

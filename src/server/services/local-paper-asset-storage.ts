import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { basename, dirname, extname, join, resolve, sep } from "node:path";

import type { PaperAttachmentUsage, Profession } from "../models/paper";
import type { ResourceType } from "../models/ai-rag";
import type { NormalizedCreatePaperAssetInput } from "../validators/paper-asset";

export type StoreLocalPaperAssetFileInput = {
  file: File;
  fileName?: string;
  paperPublicId: string;
  paperAttachmentUsage: PaperAttachmentUsage;
  profession: Profession;
  storageRoot?: string;
  uploadedAt?: Date;
};

export type StoredLocalPaperAssetMetadata = NormalizedCreatePaperAssetInput;

export type StoreLocalResourceFileInput = {
  file: File;
  fileName?: string;
  profession: Profession;
  resourceType: ResourceType;
  storageRoot?: string;
  uploadedAt?: Date;
};

export type StoredLocalResourceMetadata = {
  fileName: string;
  objectKey: string;
  contentType: string;
  fileSizeByte: number;
  fileHash: string;
  profession: Profession;
  resourceType: ResourceType;
};

export type PreparedLocalResourceFile = StoredLocalResourceMetadata & {
  bytes: Buffer;
};

export type StorePreparedLocalResourceFileInput = {
  preparedFile: PreparedLocalResourceFile;
  objectKey?: string;
  storageRoot?: string;
};

export const defaultLocalUploadStorageRoot = join(
  process.cwd(),
  ".runtime",
  "uploads",
);
const safeExtensionPattern = /^[a-z0-9]+$/;

function formatYearMonth(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");

  return `${year}${month}`;
}

function normalizeFileName(fileName: string): string {
  const normalizedFileName = basename(fileName).trim();

  return normalizedFileName.length > 0 ? normalizedFileName : "paper-asset.bin";
}

function normalizeExtension(fileName: string): string {
  const extension = extname(fileName).replace(".", "").toLowerCase();

  return safeExtensionPattern.test(extension) ? extension : "bin";
}

function resolveInsideStorageRoot(storageRoot: string, objectKey: string) {
  const resolvedRoot = resolve(storageRoot);
  const targetPath = resolve(resolvedRoot, ...objectKey.split("/"));
  const rootPrefix = resolvedRoot.endsWith(sep)
    ? resolvedRoot
    : `${resolvedRoot}${sep}`;

  if (targetPath !== resolvedRoot && !targetPath.startsWith(rootPrefix)) {
    throw new Error("Local paper_asset storage target escaped storage root.");
  }

  return targetPath;
}

export async function storeLocalPaperAssetFile({
  file,
  fileName: inputFileName,
  paperAttachmentUsage,
  paperPublicId,
  profession,
  storageRoot = defaultLocalUploadStorageRoot,
  uploadedAt = new Date(),
}: StoreLocalPaperAssetFileInput): Promise<StoredLocalPaperAssetMetadata> {
  const fileName = normalizeFileName(inputFileName ?? file.name);
  const bytes = Buffer.from(await file.arrayBuffer());
  const fileHash = createHash("sha256").update(bytes).digest("hex");
  const extension = normalizeExtension(fileName);
  const objectKey = [
    "dev",
    "paper-asset",
    profession,
    formatYearMonth(uploadedAt),
    `${fileHash}.${extension}`,
  ].join("/");
  const targetPath = resolveInsideStorageRoot(storageRoot, objectKey);

  await mkdir(dirname(targetPath), { recursive: true });
  await writeFile(targetPath, bytes);

  return {
    paperPublicId,
    paperAttachmentUsage,
    fileName,
    objectKey,
    contentType: file.type || "application/octet-stream",
    fileSizeByte: bytes.byteLength,
    fileHash,
  };
}

export async function storeLocalResourceFile({
  file,
  fileName: inputFileName,
  profession,
  resourceType,
  storageRoot = defaultLocalUploadStorageRoot,
  uploadedAt = new Date(),
}: StoreLocalResourceFileInput): Promise<StoredLocalResourceMetadata> {
  const preparedFile = await prepareLocalResourceFile({
    file,
    fileName: inputFileName,
    profession,
    resourceType,
    uploadedAt,
  });

  return storePreparedLocalResourceFile({ preparedFile, storageRoot });
}

export async function prepareLocalResourceFile({
  file,
  fileName: inputFileName,
  profession,
  resourceType,
  uploadedAt = new Date(),
}: Omit<
  StoreLocalResourceFileInput,
  "storageRoot"
>): Promise<PreparedLocalResourceFile> {
  const fileName = normalizeFileName(inputFileName ?? file.name);
  const bytes = Buffer.from(await file.arrayBuffer());
  const fileHash = createHash("sha256").update(bytes).digest("hex");
  const extension = normalizeExtension(fileName);
  const objectKey = [
    "dev",
    "resource",
    profession,
    formatYearMonth(uploadedAt),
    `${fileHash}.${extension}`,
  ].join("/");

  return {
    bytes,
    fileName,
    objectKey,
    contentType: file.type || "application/octet-stream",
    fileSizeByte: bytes.byteLength,
    fileHash,
    profession,
    resourceType,
  };
}

export async function storePreparedLocalResourceFile({
  preparedFile,
  objectKey = preparedFile.objectKey,
  storageRoot = defaultLocalUploadStorageRoot,
}: StorePreparedLocalResourceFileInput): Promise<StoredLocalResourceMetadata> {
  const objectKeySegments = objectKey.split("/");
  const expectedFileName = `${preparedFile.fileHash}.${normalizeExtension(preparedFile.fileName)}`;

  if (
    objectKeySegments.length !== 5 ||
    objectKeySegments[0] !== "dev" ||
    objectKeySegments[1] !== "resource" ||
    objectKeySegments[2] !== preparedFile.profession ||
    !/^\d{6}$/u.test(objectKeySegments[3] ?? "") ||
    objectKeySegments[4] !== expectedFileName
  ) {
    throw new Error("Prepared resource storage identity mismatch.");
  }

  const targetPath = resolveInsideStorageRoot(storageRoot, objectKey);

  await mkdir(dirname(targetPath), { recursive: true });
  await writeFile(targetPath, preparedFile.bytes);

  return {
    fileName: preparedFile.fileName,
    objectKey,
    contentType: preparedFile.contentType,
    fileSizeByte: preparedFile.fileSizeByte,
    fileHash: preparedFile.fileHash,
    profession: preparedFile.profession,
    resourceType: preparedFile.resourceType,
  };
}

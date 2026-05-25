import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { basename, dirname, extname, join, resolve, sep } from "node:path";

import type { PaperAttachmentUsage, Profession } from "../models/paper";
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

const defaultStorageRoot = join(process.cwd(), ".runtime", "uploads");
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
  storageRoot = defaultStorageRoot,
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

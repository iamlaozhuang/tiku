import { createHash } from "node:crypto";
import { constants } from "node:fs";
import {
  lstat,
  mkdir,
  open,
  readFile,
  realpath,
  stat,
  unlink,
  writeFile,
} from "node:fs/promises";
import {
  basename,
  dirname,
  extname,
  isAbsolute,
  join,
  relative,
  resolve,
  sep,
} from "node:path";

import type {
  CreatablePaperAttachmentUsage,
  Profession,
} from "../models/paper";
import type { ResourceType } from "../models/ai-rag";
import type { NormalizedCreatePaperAssetInput } from "../validators/paper-asset";

export type StoreLocalPaperAssetFileInput = {
  file: File;
  fileName?: string;
  paperPublicId: string;
  paperAttachmentUsage: CreatablePaperAttachmentUsage;
  profession: Profession;
  storageRoot?: string;
  uploadedAt?: Date;
};

export type StoredLocalPaperAssetMetadata = Omit<
  NormalizedCreatePaperAssetInput,
  "commandPublicId"
>;

export type PreparedLocalPaperAssetFile = StoredLocalPaperAssetMetadata & {
  bytes: Buffer;
  profession: Profession;
};

export type StorePreparedLocalPaperAssetFileInput = {
  preparedFile: PreparedLocalPaperAssetFile;
  objectKey?: string;
  storageRoot?: string;
};

export type ReadLocalPaperAssetFileInput = {
  fileHash: string;
  fileName: string;
  fileSizeByte: number;
  objectKey: string;
  profession: Profession;
  storageRoot?: string;
};

export type DeleteLocalPaperAssetFileInput = ReadLocalPaperAssetFileInput;
export type DeleteLocalPaperAssetFileResult = "deleted" | "missing";

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

export type ReadLocalResourceFileInput = {
  contentHash: string;
  fileSizeByte: number;
  objectStoragePath: string;
  originalFileName: string;
  profession: Profession;
  storageRoot?: string;
};

export type ReadLocalResourceFileResult = {
  bytes: Buffer;
  contentType: string;
};

export const defaultLocalUploadStorageRoot = join(
  process.cwd(),
  ".runtime",
  "uploads",
);
const safeExtensionPattern = /^[a-z0-9]+$/;
const resourceFileExtensions = new Set([
  "bin",
  "csv",
  "doc",
  "docx",
  "md",
  "markdown",
  "pdf",
  "ppt",
  "pptx",
  "txt",
  "xls",
  "xlsx",
]);
const resourceContentTypes: Readonly<Record<string, string>> = {
  csv: "text/csv",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  md: "text/markdown",
  markdown: "text/markdown",
  pdf: "application/pdf",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  txt: "text/plain",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

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

function isInsideResolvedRoot(resolvedRoot: string, targetPath: string) {
  const rootPrefix = resolvedRoot.endsWith(sep)
    ? resolvedRoot
    : `${resolvedRoot}${sep}`;

  return targetPath !== resolvedRoot && targetPath.startsWith(rootPrefix);
}

function isFileNotFoundError(error: unknown): boolean {
  return (
    error instanceof Error &&
    "code" in error &&
    (error as NodeJS.ErrnoException).code === "ENOENT"
  );
}

function assertPaperAssetStorageIdentity({
  fileHash,
  fileName,
  fileSizeByte,
  objectKey,
  profession,
}: DeleteLocalPaperAssetFileInput): void {
  const objectKeySegments = objectKey.split("/");
  const expectedFileName = `${fileHash}.${normalizeExtension(fileName)}`;

  if (
    !/^[a-f0-9]{64}$/u.test(fileHash) ||
    !Number.isSafeInteger(fileSizeByte) ||
    fileSizeByte < 0 ||
    objectKeySegments.length !== 5 ||
    objectKeySegments[0] !== "dev" ||
    objectKeySegments[1] !== "paper-asset" ||
    objectKeySegments[2] !== profession ||
    !/^\d{4}(?:0[1-9]|1[0-2])$/u.test(objectKeySegments[3] ?? "") ||
    objectKeySegments[4] !== expectedFileName
  ) {
    throw new Error("Paper asset storage identity mismatch.");
  }
}

async function hashFileHandle(
  fileHandle: Awaited<ReturnType<typeof open>>,
): Promise<{ fileHash: string; fileSizeByte: number }> {
  const hash = createHash("sha256");
  let fileSizeByte = 0;
  const stream = fileHandle.createReadStream({ autoClose: false, start: 0 });

  for await (const chunk of stream) {
    const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    fileSizeByte += bytes.byteLength;
    hash.update(bytes);
  }

  return { fileHash: hash.digest("hex"), fileSizeByte };
}

export async function deleteLocalPaperAssetFile(
  input: DeleteLocalPaperAssetFileInput,
): Promise<DeleteLocalPaperAssetFileResult> {
  assertPaperAssetStorageIdentity(input);
  const storageRoot = input.storageRoot ?? defaultLocalUploadStorageRoot;
  const resolvedRoot = resolve(storageRoot);
  let canonicalRoot: string;

  try {
    canonicalRoot = await realpath(resolvedRoot);
  } catch {
    throw new Error("Paper asset storage root is unavailable.");
  }

  const targetPath = resolveInsideStorageRoot(resolvedRoot, input.objectKey);
  let currentPath = resolvedRoot;

  for (const segment of input.objectKey.split("/")) {
    currentPath = `${currentPath}${sep}${segment}`;
    try {
      const pathStats = await lstat(currentPath);
      if (pathStats.isSymbolicLink()) {
        throw new Error("Paper asset storage path contains a symbolic link.");
      }
    } catch (error) {
      if (isFileNotFoundError(error)) {
        return "missing";
      }
      throw error;
    }
  }

  const canonicalTarget = await realpath(targetPath);
  if (!isInsideResolvedRoot(canonicalRoot, canonicalTarget)) {
    throw new Error("Paper asset storage target escaped storage root.");
  }

  let fileHandle: Awaited<ReturnType<typeof open>>;
  try {
    fileHandle = await open(
      targetPath,
      constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0),
    );
  } catch (error) {
    if (isFileNotFoundError(error)) {
      return "missing";
    }
    throw new Error("Paper asset storage target is unavailable.");
  }

  try {
    const openedStats = await fileHandle.stat();
    if (!openedStats.isFile()) {
      throw new Error("Paper asset storage target is not a file.");
    }

    const actual = await hashFileHandle(fileHandle);
    const finalPathStats = await lstat(targetPath);
    const finalCanonicalTarget = await realpath(targetPath);
    if (
      !finalPathStats.isFile() ||
      finalPathStats.isSymbolicLink() ||
      finalPathStats.ino !== openedStats.ino ||
      finalCanonicalTarget !== canonicalTarget ||
      actual.fileSizeByte !== input.fileSizeByte ||
      actual.fileHash !== input.fileHash
    ) {
      throw new Error("Paper asset storage integrity mismatch.");
    }

    await unlink(targetPath);
    return "deleted";
  } finally {
    await fileHandle.close();
  }
}

export async function readLocalPaperAssetFile({
  fileHash,
  fileName,
  fileSizeByte,
  objectKey,
  profession,
  storageRoot = defaultLocalUploadStorageRoot,
}: ReadLocalPaperAssetFileInput): Promise<Buffer> {
  const objectKeySegments = objectKey.split("/");
  const expectedFileName = `${fileHash}.${normalizeExtension(fileName)}`;

  if (
    !/^[a-f0-9]{64}$/u.test(fileHash) ||
    !Number.isSafeInteger(fileSizeByte) ||
    fileSizeByte < 0 ||
    objectKeySegments.length !== 5 ||
    objectKeySegments[0] !== "dev" ||
    objectKeySegments[1] !== "paper-asset" ||
    objectKeySegments[2] !== profession ||
    !/^\d{4}(?:0[1-9]|1[0-2])$/u.test(objectKeySegments[3] ?? "") ||
    objectKeySegments[4] !== expectedFileName
  ) {
    throw new Error("Paper asset storage identity mismatch.");
  }

  const targetPath = resolveInsideStorageRoot(storageRoot, objectKey);
  const canonicalRoot = await realpath(resolve(storageRoot));
  const canonicalTarget = await realpath(targetPath);

  if (!isInsideResolvedRoot(canonicalRoot, canonicalTarget)) {
    throw new Error("Paper asset storage target escaped storage root.");
  }

  const targetStats = await stat(canonicalTarget);

  if (!targetStats.isFile()) {
    throw new Error("Paper asset storage target is not a file.");
  }

  const bytes = await readFile(canonicalTarget);
  const actualHash = createHash("sha256").update(bytes).digest("hex");

  if (bytes.byteLength !== fileSizeByte || actualHash !== fileHash) {
    throw new Error("Paper asset storage integrity mismatch.");
  }

  return bytes;
}

export async function readLocalResourceFile({
  contentHash,
  fileSizeByte,
  objectStoragePath,
  originalFileName,
  profession,
  storageRoot = defaultLocalUploadStorageRoot,
}: ReadLocalResourceFileInput): Promise<ReadLocalResourceFileResult> {
  const extension = normalizeExtension(originalFileName);
  const objectKeySegments = objectStoragePath.split("/");

  if (
    !/^[a-f0-9]{64}$/u.test(contentHash) ||
    !Number.isSafeInteger(fileSizeByte) ||
    fileSizeByte < 0 ||
    !resourceFileExtensions.has(extension) ||
    objectStoragePath.includes("\\") ||
    isAbsolute(objectStoragePath) ||
    objectKeySegments.length !== 5 ||
    objectKeySegments[0] !== "dev" ||
    objectKeySegments[1] !== "resource" ||
    objectKeySegments[2] !== profession ||
    !/^\d{4}(?:0[1-9]|1[0-2])$/u.test(objectKeySegments[3] ?? "") ||
    objectKeySegments[4] !== `${contentHash}.${extension}`
  ) {
    throw new Error("Resource storage identity mismatch.");
  }

  const resolvedRoot = resolve(storageRoot);
  let canonicalRoot: string;

  try {
    canonicalRoot = await realpath(resolvedRoot);
  } catch {
    throw new Error("Resource storage root is unavailable.");
  }

  const targetPath = resolveInsideStorageRoot(resolvedRoot, objectStoragePath);
  const targetRelativePath = relative(canonicalRoot, targetPath);
  if (
    targetRelativePath === "" ||
    targetRelativePath === ".." ||
    targetRelativePath.startsWith(`..${sep}`) ||
    isAbsolute(targetRelativePath)
  ) {
    throw new Error("Resource storage target escaped storage root.");
  }

  let currentPath = resolvedRoot;
  for (const segment of objectKeySegments) {
    currentPath = `${currentPath}${sep}${segment}`;
    const pathStats = await lstat(currentPath);
    if (pathStats.isSymbolicLink()) {
      throw new Error("Resource storage path contains a symbolic link.");
    }
  }

  const canonicalTarget = await realpath(targetPath);
  if (!isInsideResolvedRoot(canonicalRoot, canonicalTarget)) {
    throw new Error("Resource storage target escaped storage root.");
  }

  const fileHandle = await open(
    targetPath,
    constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0),
  );

  try {
    const openedStats = await fileHandle.stat();
    if (!openedStats.isFile()) {
      throw new Error("Resource storage target is not a file.");
    }

    const bytes = await fileHandle.readFile();
    const finalPathStats = await lstat(targetPath);
    const finalCanonicalTarget = await realpath(targetPath);
    const actualHash = createHash("sha256").update(bytes).digest("hex");

    if (
      !finalPathStats.isFile() ||
      finalPathStats.isSymbolicLink() ||
      finalPathStats.ino !== openedStats.ino ||
      finalCanonicalTarget !== canonicalTarget ||
      bytes.byteLength !== fileSizeByte ||
      actualHash !== contentHash
    ) {
      throw new Error("Resource storage integrity mismatch.");
    }

    return {
      bytes,
      contentType:
        resourceContentTypes[extension] ?? "application/octet-stream",
    };
  } finally {
    await fileHandle.close();
  }
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
  const preparedFile = await prepareLocalPaperAssetFile({
    file,
    fileName: inputFileName,
    paperAttachmentUsage,
    paperPublicId,
    profession,
    uploadedAt,
  });

  return storePreparedLocalPaperAssetFile({ preparedFile, storageRoot });
}

export async function prepareLocalPaperAssetFile({
  file,
  fileName: inputFileName,
  paperAttachmentUsage,
  paperPublicId,
  profession,
  uploadedAt = new Date(),
}: Omit<
  StoreLocalPaperAssetFileInput,
  "storageRoot"
>): Promise<PreparedLocalPaperAssetFile> {
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

  return {
    bytes,
    paperPublicId,
    paperAttachmentUsage,
    fileName,
    objectKey,
    contentType: file.type || "application/octet-stream",
    fileSizeByte: bytes.byteLength,
    fileHash,
    profession,
  };
}

export async function storePreparedLocalPaperAssetFile({
  preparedFile,
  objectKey = preparedFile.objectKey,
  storageRoot = defaultLocalUploadStorageRoot,
}: StorePreparedLocalPaperAssetFileInput): Promise<StoredLocalPaperAssetMetadata> {
  const objectKeySegments = objectKey.split("/");
  const expectedFileName = `${preparedFile.fileHash}.${normalizeExtension(preparedFile.fileName)}`;

  if (
    objectKeySegments.length !== 5 ||
    objectKeySegments[0] !== "dev" ||
    objectKeySegments[1] !== "paper-asset" ||
    objectKeySegments[2] !== preparedFile.profession ||
    !/^\d{6}$/u.test(objectKeySegments[3] ?? "") ||
    objectKeySegments[4] !== expectedFileName
  ) {
    throw new Error("Prepared paper_asset storage identity mismatch.");
  }

  const targetPath = resolveInsideStorageRoot(storageRoot, objectKey);

  await mkdir(dirname(targetPath), { recursive: true });
  await writeFile(targetPath, preparedFile.bytes);

  return {
    paperPublicId: preparedFile.paperPublicId,
    paperAttachmentUsage: preparedFile.paperAttachmentUsage,
    fileName: preparedFile.fileName,
    objectKey,
    contentType: preparedFile.contentType,
    fileSizeByte: preparedFile.fileSizeByte,
    fileHash: preparedFile.fileHash,
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

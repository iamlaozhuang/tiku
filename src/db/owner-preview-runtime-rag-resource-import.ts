import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { inflateRawSync } from "node:zlib";

// prettier-ignore
// @ts-expect-error Node --experimental-strip-types needs the explicit .ts extension for this local CLI module.
import { createRagChunks, summarizeRagChunksForEvidence } from "../rag/chunking.ts";

export type OwnerPreviewRuntimeRagImportMode = "dry_run" | "execute";
export type OwnerPreviewRuntimeRagImportStatus =
  | "blocked"
  | "dry_run"
  | "executed";

type OwnerPreviewRuntimeRagProfession = "logistics" | "marketing" | "monopoly";
type OwnerPreviewRuntimeRagSubject = "skill" | "theory";

export type OwnerPreviewRuntimeRagValidation = {
  importableMaterialCount: number;
  inventoryRowCount: number;
  logisticsCoverage: "missing_package_resources" | "missing_runtime_source";
  professionCoverage: Record<OwnerPreviewRuntimeRagProfession, number>;
  skippedMissingFileCount: number;
  unsupportedMaterialCount: number;
};

export type OwnerPreviewRuntimeRagExecutionSummary = {
  importedChunkCount: number;
  importedResourceCount: number;
  mergedCatalogResourceCount: number;
  runtimeCoverage: Record<string, number>;
  skippedMissingFileCount: number;
  writtenMarkdownFileCount: number;
};

export type OwnerPreviewRuntimeRagImportSummary = {
  execution?: OwnerPreviewRuntimeRagExecutionSummary;
  failureCategory?: string;
  mode: OwnerPreviewRuntimeRagImportMode;
  status: OwnerPreviewRuntimeRagImportStatus;
  validation: OwnerPreviewRuntimeRagValidation;
};

export type OwnerPreviewRuntimeRagImportResult = {
  status: OwnerPreviewRuntimeRagImportStatus;
  summary: OwnerPreviewRuntimeRagImportSummary;
};

export type RunOwnerPreviewRuntimeRagImportInput = {
  confirmOwnerPreviewRuntimeRagImport: boolean;
  mode: OwnerPreviewRuntimeRagImportMode;
  packageRoot?: string;
  storageRoot?: string;
};

type RawInventoryRow = {
  extension?: unknown;
  extractable?: unknown;
  fixtureRelativePath?: unknown;
  fixtureSha256?: unknown;
  kind?: unknown;
  level?: unknown;
  levels?: unknown;
  profession?: unknown;
  subject?: unknown;
};

type RuntimeRagImportMaterial = {
  extension: ".docx" | ".markdown" | ".md" | ".txt";
  fixtureRelativePath: string;
  hashHint: string | null;
  level: number | null;
  levels: number[];
  profession: OwnerPreviewRuntimeRagProfession;
  subject: OwnerPreviewRuntimeRagSubject | null;
};

type LocalResourceCatalog = {
  resources: LocalResourceCatalogEntry[];
};

type LocalResourceCatalogEntry = {
  publicId: string;
  title: string;
  resourceType: "knowledge_doc";
  resourceStatus: "rag_ready";
  profession: OwnerPreviewRuntimeRagProfession;
  level: number | null;
  originalFileName: string;
  objectKey: string;
  contentType: "text/markdown";
  fileSizeByte: number;
  fileHash: string;
  markdownContent: string;
  markdownContentHash: string;
  indexingErrorMessage: null;
  isVectorStale: false;
  publishedAt: string;
  uploadedAt: string;
  updatedAt: string;
  disabledFromStatus: null;
  chunkCount: number;
  textHashes: string[];
  headingPaths: string[][];
  activeMarkdownContentHash: string;
  activeChunkSnapshot: LocalResourceVectorChunkSnapshot[];
};

type LocalResourceVectorChunkSnapshot = {
  chunkPublicId: string;
  resourcePublicId: string;
  resourceTitle: string;
  profession: OwnerPreviewRuntimeRagProfession;
  level: number | null;
  headingPath: string[];
  chunkIndex: number;
  text: string;
  textHash: string;
};

const defaultPackageRoot = "D:\\tiku-local-private\\owner-facing-fixtures";
const defaultStorageRoot = join(process.cwd(), ".runtime", "uploads");
const curatedRootSegment = "2026-06-28-rawfiles-curated";
const sourceInventoryFileName = "source-inventory.json";
const maxImportedMarkdownCharLength = 60000;
const supportedMaterialExtensions = new Set([
  ".docx",
  ".markdown",
  ".md",
  ".txt",
]);
const professionValues = ["logistics", "marketing", "monopoly"] as const;
const subjectValues = ["skill", "theory"] as const;
const materialKindValues = new Set([
  "knowledge_doc",
  "lecture_note",
  "material",
  "textbook",
]);
const forbiddenEvidencePatterns = [
  /postgres(?:ql)?:\/\//i,
  /\bdatabase_url\b/i,
  /\bpassword\b/i,
  /\btoken\b/i,
  /\bcookie\b/i,
  /\bsession\b/i,
  /localstorage/i,
  /authorization/i,
  /bearer\s+[a-z0-9._-]+/i,
  /api[_-]?key/i,
  /redeem_code/i,
  /provider_payload/i,
  /raw_ai_output/i,
  /raw_prompt/i,
  /\bemail\b/i,
  /\bphone\b/i,
  /fixtureRelativePath/u,
  /sourceRelativePath/u,
  /fullContent/u,
  /rawResource/u,
  /rawMaterial/u,
];

export async function runOwnerPreviewRuntimeRagImport({
  confirmOwnerPreviewRuntimeRagImport,
  mode,
  packageRoot = defaultPackageRoot,
  storageRoot = defaultStorageRoot,
}: RunOwnerPreviewRuntimeRagImportInput): Promise<OwnerPreviewRuntimeRagImportResult> {
  const normalizedPackageRoot = resolve(packageRoot);
  const normalizedStorageRoot = resolve(storageRoot);
  const inventoryRows = loadRuntimeRagInventoryRows(normalizedPackageRoot);
  const materials = collectImportableRuntimeRagMaterials(inventoryRows);
  const validation = createRuntimeRagValidation(inventoryRows, materials);

  if (mode === "dry_run") {
    return {
      status: "dry_run",
      summary: {
        mode,
        status: "dry_run",
        validation,
      },
    };
  }

  if (!confirmOwnerPreviewRuntimeRagImport) {
    return createBlockedRuntimeRagResult({
      failureCategory: "owner_preview_runtime_rag_import_confirmation_missing",
      mode,
      validation,
    });
  }

  const execution = await executeRuntimeRagImport({
    materials,
    packageRoot: normalizedPackageRoot,
    storageRoot: normalizedStorageRoot,
  });

  return {
    status: "executed",
    summary: {
      execution,
      mode,
      status: "executed",
      validation,
    },
  };
}

export function renderOwnerPreviewRuntimeRagImportSummary(
  summary: OwnerPreviewRuntimeRagImportSummary,
): string {
  const lines = [
    "ownerPreviewRuntimeRagImport",
    `mode=${summary.mode}`,
    `status=${summary.status}`,
    `inventoryRowCount=${summary.validation.inventoryRowCount}`,
    `importableMaterialCount=${summary.validation.importableMaterialCount}`,
    `unsupportedMaterialCount=${summary.validation.unsupportedMaterialCount}`,
    `skippedMissingFileCount=${summary.validation.skippedMissingFileCount}`,
    `professionCoverage=marketing:${summary.validation.professionCoverage.marketing},monopoly:${summary.validation.professionCoverage.monopoly},logistics:${summary.validation.professionCoverage.logistics}`,
    `logisticsCoverage=${summary.validation.logisticsCoverage}`,
  ];

  if (summary.failureCategory !== undefined) {
    lines.push(`failureCategory=${summary.failureCategory}`);
  }

  if (summary.execution !== undefined) {
    lines.push(
      `importedResourceCount=${summary.execution.importedResourceCount}`,
      `importedChunkCount=${summary.execution.importedChunkCount}`,
      `executionSkippedMissingFileCount=${summary.execution.skippedMissingFileCount}`,
      `writtenMarkdownFileCount=${summary.execution.writtenMarkdownFileCount}`,
      `mergedCatalogResourceCount=${summary.execution.mergedCatalogResourceCount}`,
      `runtimeCoverage=${renderRuntimeCoverage(summary.execution.runtimeCoverage)}`,
    );
  }

  const rendered = lines.join("\n");

  if (containsForbiddenOwnerPreviewRuntimeRagEvidenceText(rendered)) {
    throw new Error("Runtime RAG import summary contains forbidden evidence.");
  }

  return rendered;
}

export function containsForbiddenOwnerPreviewRuntimeRagEvidenceText(
  text: string,
): boolean {
  return forbiddenEvidencePatterns.some((pattern) => pattern.test(text));
}

function createBlockedRuntimeRagResult(input: {
  failureCategory: string;
  mode: OwnerPreviewRuntimeRagImportMode;
  validation: OwnerPreviewRuntimeRagValidation;
}): OwnerPreviewRuntimeRagImportResult {
  return {
    status: "blocked",
    summary: {
      failureCategory: input.failureCategory,
      mode: input.mode,
      status: "blocked",
      validation: input.validation,
    },
  };
}

function loadRuntimeRagInventoryRows(packageRoot: string): RawInventoryRow[] {
  const inventoryPath = findSourceInventoryPath(packageRoot);

  if (inventoryPath === null) {
    return [];
  }

  const parsedValue = JSON.parse(
    readFileSync(inventoryPath, "utf8"),
  ) as unknown;

  return Array.isArray(parsedValue)
    ? parsedValue.filter(isRecord).map((row) => row as RawInventoryRow)
    : [];
}

function findSourceInventoryPath(packageRoot: string): string | null {
  const candidatePaths = [
    join(
      packageRoot,
      curatedRootSegment,
      "inventories",
      sourceInventoryFileName,
    ),
    join(packageRoot, "inventories", sourceInventoryFileName),
    join(packageRoot, sourceInventoryFileName),
  ];

  return (
    candidatePaths.find((candidatePath) => existsSync(candidatePath)) ?? null
  );
}

function collectImportableRuntimeRagMaterials(
  rows: readonly RawInventoryRow[],
): RuntimeRagImportMaterial[] {
  return rows.flatMap((row) => {
    const material = normalizeRuntimeRagMaterial(row);

    return material === null ? [] : [material];
  });
}

function normalizeRuntimeRagMaterial(
  row: RawInventoryRow,
): RuntimeRagImportMaterial | null {
  if (row.extractable !== true) {
    return null;
  }

  const kind = normalizeText(row.kind);

  if (kind === null || !materialKindValues.has(kind)) {
    return null;
  }

  const extension = normalizeExtension(row.extension);

  if (!isSupportedMaterialExtension(extension)) {
    return null;
  }

  const profession = normalizeProfession(row.profession);
  const fixtureRelativePath = normalizeRelativePath(row.fixtureRelativePath);

  if (profession === null || fixtureRelativePath === null) {
    return null;
  }

  const levels = normalizeLevels(row);

  return {
    extension,
    fixtureRelativePath,
    hashHint: normalizeText(row.fixtureSha256),
    level: levels.length === 1 ? levels[0] : null,
    levels,
    profession,
    subject: normalizeSubject(row.subject),
  };
}

function createRuntimeRagValidation(
  inventoryRows: readonly RawInventoryRow[],
  importableMaterials: readonly RuntimeRagImportMaterial[],
): OwnerPreviewRuntimeRagValidation {
  const professionCoverage = createEmptyProfessionCoverage();
  let unsupportedMaterialCount = 0;

  for (const row of inventoryRows) {
    const profession = normalizeProfession(row.profession);

    if (profession !== null) {
      professionCoverage[profession] += 1;
    }

    const extension = normalizeExtension(row.extension);
    const kind = normalizeText(row.kind);

    if (
      row.extractable === true &&
      kind !== null &&
      materialKindValues.has(kind) &&
      !isSupportedMaterialExtension(extension)
    ) {
      unsupportedMaterialCount += 1;
    }
  }

  return {
    importableMaterialCount: importableMaterials.length,
    inventoryRowCount: inventoryRows.length,
    logisticsCoverage:
      professionCoverage.logistics === 0
        ? "missing_package_resources"
        : "missing_runtime_source",
    professionCoverage,
    skippedMissingFileCount: 0,
    unsupportedMaterialCount,
  };
}

async function executeRuntimeRagImport(input: {
  materials: readonly RuntimeRagImportMaterial[];
  packageRoot: string;
  storageRoot: string;
}): Promise<OwnerPreviewRuntimeRagExecutionSummary> {
  const existingCatalog = readLocalResourceCatalog(input.storageRoot);
  const importedEntries: LocalResourceCatalogEntry[] = [];
  let skippedMissingFileCount = 0;
  let writtenMarkdownFileCount = 0;

  for (const [index, material] of input.materials.entries()) {
    const sourcePath = resolveRuntimeMaterialPath({
      packageRoot: input.packageRoot,
      relativePath: material.fixtureRelativePath,
    });

    if (sourcePath === null || !existsSync(sourcePath)) {
      skippedMissingFileCount += 1;
      continue;
    }

    const extractedText = extractRuntimeMaterialText({
      extension: material.extension,
      sourcePath,
    });
    const markdownContent = createRuntimeMarkdownContent({
      extractedText,
      index,
      material,
    });

    if (markdownContent.trim().length === 0) {
      continue;
    }

    const markdownContentHash = createStableHash(markdownContent);
    const publicId = createRuntimeResourcePublicId(
      material,
      markdownContentHash,
    );
    const title = createRuntimeResourceTitle(material, index + 1);
    const chunkingResult = createRagChunks({
      level: material.level,
      markdownContent,
      markdownContentHash,
      profession: material.profession,
      resourcePublicId: publicId,
      resourceStatus: "rag_ready",
      resourceTitle: title,
    });

    if (
      chunkingResult.status !== "chunked" ||
      chunkingResult.chunks.length === 0
    ) {
      continue;
    }

    const objectKey = createRuntimeObjectKey(material, markdownContentHash);
    const targetPath = resolveInsideStorageRoot(input.storageRoot, objectKey);

    mkdirSync(dirname(targetPath), { recursive: true });
    writeFileSync(targetPath, markdownContent, "utf8");
    writtenMarkdownFileCount += 1;

    const nowIso = new Date().toISOString();
    const evidenceSummary = summarizeRagChunksForEvidence(
      chunkingResult.chunks,
    );

    importedEntries.push({
      activeChunkSnapshot: chunkingResult.chunks.map((chunk) => ({
        chunkIndex: chunk.chunkIndex,
        chunkPublicId: chunk.chunkPublicId,
        headingPath: [...chunk.headingPath],
        level: chunk.level,
        profession: chunk.profession,
        resourcePublicId: chunk.resourcePublicId,
        resourceTitle: chunk.resourceTitle,
        text: chunk.text,
        textHash: chunk.textHash,
      })),
      activeMarkdownContentHash: markdownContentHash,
      chunkCount: chunkingResult.chunks.length,
      contentType: "text/markdown",
      disabledFromStatus: null,
      fileHash: markdownContentHash,
      fileSizeByte: Buffer.byteLength(markdownContent, "utf8"),
      headingPaths: evidenceSummary.headingPaths,
      indexingErrorMessage: null,
      isVectorStale: false,
      level: material.level,
      markdownContent,
      markdownContentHash,
      objectKey,
      originalFileName: "owner-preview-runtime-material.md",
      profession: material.profession,
      publicId,
      publishedAt: nowIso,
      resourceStatus: "rag_ready",
      resourceType: "knowledge_doc",
      textHashes: evidenceSummary.textHashes,
      title,
      updatedAt: nowIso,
      uploadedAt: nowIso,
    });
  }

  const mergedCatalog = mergeLocalResourceCatalog(
    existingCatalog,
    importedEntries,
  );
  const catalogPath = resolveInsideStorageRoot(
    input.storageRoot,
    "dev/resource/catalog.json",
  );

  mkdirSync(dirname(catalogPath), { recursive: true });
  writeFileSync(catalogPath, JSON.stringify(mergedCatalog, null, 2), "utf8");

  return {
    importedChunkCount: importedEntries.reduce(
      (total, resource) => total + resource.chunkCount,
      0,
    ),
    importedResourceCount: importedEntries.length,
    mergedCatalogResourceCount: mergedCatalog.resources.length,
    runtimeCoverage: createRuntimeCoverage(importedEntries),
    skippedMissingFileCount,
    writtenMarkdownFileCount,
  };
}

function readLocalResourceCatalog(storageRoot: string): LocalResourceCatalog {
  const catalogPath = resolveInsideStorageRoot(
    storageRoot,
    "dev/resource/catalog.json",
  );

  if (!existsSync(catalogPath)) {
    return { resources: [] };
  }

  const parsedValue = JSON.parse(readFileSync(catalogPath, "utf8")) as unknown;

  if (!isRecord(parsedValue) || !Array.isArray(parsedValue.resources)) {
    return { resources: [] };
  }

  return {
    resources: parsedValue.resources.filter(isLocalResourceCatalogEntry),
  };
}

function mergeLocalResourceCatalog(
  existingCatalog: LocalResourceCatalog,
  importedEntries: readonly LocalResourceCatalogEntry[],
): LocalResourceCatalog {
  const importedPublicIds = new Set(
    importedEntries.map((entry) => entry.publicId),
  );

  return {
    resources: [
      ...existingCatalog.resources.filter(
        (resource) => !importedPublicIds.has(resource.publicId),
      ),
      ...importedEntries,
    ],
  };
}

function isLocalResourceCatalogEntry(
  value: unknown,
): value is LocalResourceCatalogEntry {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.publicId === "string" &&
    typeof value.title === "string" &&
    value.resourceStatus === "rag_ready" &&
    isProfession(value.profession) &&
    Array.isArray(value.activeChunkSnapshot)
  );
}

function createRuntimeMarkdownContent(input: {
  extractedText: string;
  index: number;
  material: RuntimeRagImportMaterial;
}): string {
  const normalizedText = normalizeWhitespace(input.extractedText).slice(
    0,
    maxImportedMarkdownCharLength,
  );

  if (normalizedText.length === 0) {
    return "";
  }

  const levelLabel =
    input.material.level === null
      ? input.material.levels.join("/")
      : String(input.material.level);
  const subjectLabel = input.material.subject ?? "mixed";

  return [
    `# Owner preview ${input.material.profession} resource ${input.index + 1}`,
    "",
    [
      "AI 出题",
      "AI 组卷",
      input.material.profession,
      `level ${levelLabel}`,
      subjectLabel,
      "knowledge_node",
    ].join(" "),
    "",
    normalizedText,
  ].join("\n");
}

function extractRuntimeMaterialText(input: {
  extension: RuntimeRagImportMaterial["extension"];
  sourcePath: string;
}): string {
  if (input.extension === ".docx") {
    return extractDocxText(readFileSync(input.sourcePath));
  }

  return readFileSync(input.sourcePath, "utf8");
}

function extractDocxText(buffer: Buffer): string {
  const eocdOffset = findEndOfCentralDirectoryOffset(buffer);

  if (eocdOffset === -1) {
    return "";
  }

  const centralDirectorySize = buffer.readUInt32LE(eocdOffset + 12);
  const centralDirectoryOffset = buffer.readUInt32LE(eocdOffset + 16);
  let cursor = centralDirectoryOffset;
  const centralDirectoryEnd = centralDirectoryOffset + centralDirectorySize;

  while (cursor < centralDirectoryEnd) {
    if (buffer.readUInt32LE(cursor) !== 0x02014b50) {
      return "";
    }

    const compressionMethod = buffer.readUInt16LE(cursor + 10);
    const compressedSize = buffer.readUInt32LE(cursor + 20);
    const fileNameLength = buffer.readUInt16LE(cursor + 28);
    const extraLength = buffer.readUInt16LE(cursor + 30);
    const commentLength = buffer.readUInt16LE(cursor + 32);
    const localHeaderOffset = buffer.readUInt32LE(cursor + 42);
    const fileName = buffer
      .subarray(cursor + 46, cursor + 46 + fileNameLength)
      .toString("utf8");

    if (fileName === "word/document.xml") {
      return extractDocxDocumentXmlText(
        readZipEntryPayload({
          buffer,
          compressedSize,
          compressionMethod,
          localHeaderOffset,
        }).toString("utf8"),
      );
    }

    cursor += 46 + fileNameLength + extraLength + commentLength;
  }

  return "";
}

function findEndOfCentralDirectoryOffset(buffer: Buffer): number {
  for (let offset = buffer.length - 22; offset >= 0; offset -= 1) {
    if (buffer.readUInt32LE(offset) === 0x06054b50) {
      return offset;
    }
  }

  return -1;
}

function readZipEntryPayload(input: {
  buffer: Buffer;
  compressedSize: number;
  compressionMethod: number;
  localHeaderOffset: number;
}): Buffer {
  if (input.buffer.readUInt32LE(input.localHeaderOffset) !== 0x04034b50) {
    return Buffer.alloc(0);
  }

  const fileNameLength = input.buffer.readUInt16LE(
    input.localHeaderOffset + 26,
  );
  const extraLength = input.buffer.readUInt16LE(input.localHeaderOffset + 28);
  const payloadOffset =
    input.localHeaderOffset + 30 + fileNameLength + extraLength;
  const payload = input.buffer.subarray(
    payloadOffset,
    payloadOffset + input.compressedSize,
  );

  if (input.compressionMethod === 0) {
    return payload;
  }

  if (input.compressionMethod === 8) {
    return inflateRawSync(payload);
  }

  return Buffer.alloc(0);
}

function extractDocxDocumentXmlText(xml: string): string {
  const textParts: string[] = [];
  const textNodePattern = /<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/gu;
  let match: RegExpExecArray | null;

  while ((match = textNodePattern.exec(xml)) !== null) {
    textParts.push(decodeXmlText(match[1]));
  }

  return textParts.join(" ");
}

function decodeXmlText(text: string): string {
  return text
    .replace(/&#x([0-9a-f]+);/giu, (_, value: string) =>
      String.fromCodePoint(Number.parseInt(value, 16)),
    )
    .replace(/&#([0-9]+);/gu, (_, value: string) =>
      String.fromCodePoint(Number.parseInt(value, 10)),
    )
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'")
    .replaceAll("&amp;", "&");
}

function resolveRuntimeMaterialPath(input: {
  packageRoot: string;
  relativePath: string;
}): string | null {
  const candidatePaths = [
    resolve(input.packageRoot, input.relativePath),
    resolve(input.packageRoot, curatedRootSegment, input.relativePath),
  ];

  return (
    candidatePaths.find(
      (candidatePath) =>
        isPathInside(input.packageRoot, candidatePath) &&
        existsSync(candidatePath),
    ) ?? null
  );
}

function resolveInsideStorageRoot(storageRoot: string, objectKey: string) {
  const resolvedRoot = resolve(storageRoot);
  const targetPath = resolve(resolvedRoot, ...objectKey.split("/"));

  if (!isPathInside(resolvedRoot, targetPath)) {
    throw new Error("Owner preview runtime RAG target escaped storage root.");
  }

  return targetPath;
}

function isPathInside(rootPath: string, targetPath: string): boolean {
  const resolvedRoot = resolve(rootPath);
  const resolvedTarget = resolve(targetPath);
  const rootPrefix = resolvedRoot.endsWith(sep)
    ? resolvedRoot
    : `${resolvedRoot}${sep}`;

  return (
    resolvedTarget === resolvedRoot || resolvedTarget.startsWith(rootPrefix)
  );
}

function createRuntimeResourcePublicId(
  material: RuntimeRagImportMaterial,
  markdownContentHash: string,
): string {
  const seed = [
    material.profession,
    String(material.level ?? "all"),
    material.subject ?? "mixed",
    material.hashHint ?? markdownContentHash,
    markdownContentHash,
  ].join(":");

  return `owner-preview-runtime-rag-${createStableHash(seed).slice(0, 16)}`;
}

function createRuntimeObjectKey(
  material: RuntimeRagImportMaterial,
  markdownContentHash: string,
): string {
  return [
    "dev",
    "resource",
    material.profession,
    "202607",
    `${markdownContentHash}.md`,
  ].join("/");
}

function createRuntimeResourceTitle(
  material: RuntimeRagImportMaterial,
  ordinal: number,
): string {
  const levelLabel =
    material.level === null ? "multi-level" : `level-${material.level}`;

  return `Owner preview ${material.profession} ${levelLabel} material ${ordinal}`;
}

function createRuntimeCoverage(
  resources: readonly LocalResourceCatalogEntry[],
): Record<string, number> {
  return resources.reduce<Record<string, number>>((coverage, resource) => {
    const key = `${resource.profession}|${resource.level ?? "all"}|rag_ready`;

    return {
      ...coverage,
      [key]: (coverage[key] ?? 0) + 1,
    };
  }, {});
}

function renderRuntimeCoverage(coverage: Record<string, number>): string {
  const entries = Object.entries(coverage).sort(([left], [right]) =>
    left.localeCompare(right),
  );

  return entries.length === 0
    ? "none"
    : entries.map(([key, count]) => `${key}:${count}`).join(",");
}

function normalizeExtension(value: unknown): string | null {
  const text = normalizeText(value);

  if (text === null) {
    return null;
  }

  return text.startsWith(".") ? text.toLowerCase() : `.${text.toLowerCase()}`;
}

function isSupportedMaterialExtension(
  extension: string | null,
): extension is RuntimeRagImportMaterial["extension"] {
  return extension !== null && supportedMaterialExtensions.has(extension);
}

function normalizeProfession(
  value: unknown,
): OwnerPreviewRuntimeRagProfession | null {
  return isProfession(value) ? value : null;
}

function isProfession(
  value: unknown,
): value is OwnerPreviewRuntimeRagProfession {
  return (
    typeof value === "string" &&
    (professionValues as readonly string[]).includes(value)
  );
}

function normalizeSubject(
  value: unknown,
): OwnerPreviewRuntimeRagSubject | null {
  return typeof value === "string" &&
    (subjectValues as readonly string[]).includes(value)
    ? (value as OwnerPreviewRuntimeRagSubject)
    : null;
}

function normalizeLevels(row: RawInventoryRow): number[] {
  if (Array.isArray(row.levels)) {
    const levels = row.levels
      .map(normalizeLevel)
      .filter((level): level is number => level !== null);

    return levels.length > 0 ? [...new Set(levels)].sort() : [];
  }

  const level = normalizeLevel(row.level);

  return level === null ? [] : [level];
}

function normalizeLevel(value: unknown): number | null {
  const normalizedValue =
    typeof value === "string" && /^\d+$/.test(value.trim())
      ? Number.parseInt(value.trim(), 10)
      : value;

  return typeof normalizedValue === "number" &&
    Number.isInteger(normalizedValue) &&
    normalizedValue >= 1 &&
    normalizedValue <= 5
    ? normalizedValue
    : null;
}

function normalizeRelativePath(value: unknown): string | null {
  const text = normalizeText(value);

  if (text === null || text.includes("..") || resolve(text) === text) {
    return null;
  }

  return text.replace(/\\/g, "/");
}

function normalizeText(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function createEmptyProfessionCoverage(): Record<
  OwnerPreviewRuntimeRagProfession,
  number
> {
  return {
    logistics: 0,
    marketing: 0,
    monopoly: 0,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function createStableHash(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function parseCliArgs(argv: string[]): RunOwnerPreviewRuntimeRagImportInput {
  let mode: OwnerPreviewRuntimeRagImportMode = "dry_run";
  let packageRoot = defaultPackageRoot;
  let storageRoot = defaultStorageRoot;
  let confirmOwnerPreviewRuntimeRagImport = false;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--execute") {
      mode = "execute";
      continue;
    }

    if (arg === "--confirm-owner-preview-runtime-rag-import") {
      confirmOwnerPreviewRuntimeRagImport = true;
      continue;
    }

    if (arg === "--package-root") {
      packageRoot = argv[index + 1] ?? packageRoot;
      index += 1;
      continue;
    }

    if (arg === "--storage-root") {
      storageRoot = argv[index + 1] ?? storageRoot;
      index += 1;
    }
  }

  return {
    confirmOwnerPreviewRuntimeRagImport,
    mode,
    packageRoot,
    storageRoot,
  };
}

function isDirectCliRun() {
  return (
    process.argv[1] !== undefined &&
    fileURLToPath(import.meta.url) === resolve(process.argv[1])
  );
}

if (isDirectCliRun()) {
  const result = await runOwnerPreviewRuntimeRagImport(
    parseCliArgs(process.argv.slice(2)),
  );

  console.log(renderOwnerPreviewRuntimeRagImportSummary(result.summary));
  process.exitCode = result.status === "blocked" ? 1 : 0;
}

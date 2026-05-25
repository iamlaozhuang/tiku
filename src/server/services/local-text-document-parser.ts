import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import { basename, extname, resolve, sep } from "node:path";

type LocalTextDocumentSource = {
  objectKey: string;
  fileName: string;
  extension: string;
  contentType?: string;
};

export type LocalTextDocumentEvidenceSummary = {
  objectKey: string;
  fileName: string;
  extension: string;
  parserMode: "local_only";
  markdownContentHash: string;
  charLength: number;
  lineCount: number;
  chunkCandidateCount: number;
  headingPaths: string[][];
  redactedPreview: string;
};

export type ParsedLocalTextDocumentAsset = {
  status: "parsed";
  parserMode: "local_only";
  source: LocalTextDocumentSource;
  markdownContent: string;
  markdownContentHash: string;
  charLength: number;
  lineCount: number;
  chunkCandidateCount: number;
  headingPaths: string[][];
  evidenceSummary: LocalTextDocumentEvidenceSummary;
};

export type SkippedLocalTextDocumentAsset = {
  status: "skipped";
  parserMode: "local_only";
  skippedReason: "unsupported_extension" | "file_too_large";
  source: Omit<LocalTextDocumentSource, "contentType">;
};

export type LocalTextDocumentParseResult =
  | ParsedLocalTextDocumentAsset
  | SkippedLocalTextDocumentAsset;

export type ParseLocalTextDocumentAssetInput = {
  storageRoot: string;
  objectKey: string;
  fileName?: string;
  maxFileSizeByte?: number;
};

type HeadingCursor = {
  level: number;
  title: string;
};

const supportedExtensions = new Set(["txt", "md", "markdown"]);
const defaultMaxFileSizeByte = 2 * 1024 * 1024;

function resolveInsideStorageRoot(storageRoot: string, objectKey: string) {
  const resolvedRoot = resolve(storageRoot);
  const targetPath = resolve(resolvedRoot, ...objectKey.split("/"));
  const rootPrefix = resolvedRoot.endsWith(sep)
    ? resolvedRoot
    : `${resolvedRoot}${sep}`;

  if (targetPath !== resolvedRoot && !targetPath.startsWith(rootPrefix)) {
    throw new Error("Local text document target escaped storage root.");
  }

  return targetPath;
}

function readExtension(fileName: string): string {
  return extname(fileName).replace(".", "").toLowerCase();
}

function readFileName(objectKey: string): string {
  const fileName = basename(objectKey).trim();

  return fileName.length > 0 ? fileName : "local-document.txt";
}

function inferContentType(extension: string): string {
  if (extension === "md" || extension === "markdown") {
    return "text/markdown";
  }

  return "text/plain";
}

function normalizeTextContent(content: string): string {
  return content
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function stripMarkdownFrontMatter(content: string): string {
  const normalizedContent = normalizeTextContent(content);

  if (!normalizedContent.startsWith("---\n")) {
    return normalizedContent;
  }

  const frontMatterEndIndex = normalizedContent.indexOf("\n---", 4);

  return frontMatterEndIndex === -1
    ? normalizedContent
    : normalizeTextContent(normalizedContent.slice(frontMatterEndIndex + 4));
}

function normalizeMarkdownContent(content: string, extension: string): string {
  return extension === "txt"
    ? normalizeTextContent(content)
    : stripMarkdownFrontMatter(content);
}

function collectHeadingPaths(markdownContent: string): string[][] {
  const headingCursor: HeadingCursor[] = [];
  const headingPaths: string[][] = [];

  for (const line of markdownContent.split("\n")) {
    const headingMatch = /^(#{1,6})\s+(.+?)\s*$/.exec(line);

    if (headingMatch === null) {
      continue;
    }

    const headingLevel = headingMatch[1].length;
    const headingTitle = headingMatch[2].replace(/#+$/, "").trim();

    while (
      headingCursor.length > 0 &&
      headingCursor[headingCursor.length - 1].level >= headingLevel
    ) {
      headingCursor.pop();
    }

    headingCursor.push({ level: headingLevel, title: headingTitle });
    headingPaths.push(headingCursor.map((heading) => heading.title));
  }

  return headingPaths;
}

function countChunkCandidates(markdownContent: string): number {
  return markdownContent
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0).length;
}

function createRedactedPreview(markdownContentHash: string): string {
  return `[redacted:${markdownContentHash.slice(0, 12)}]`;
}

function createContentHash(markdownContent: string): string {
  return createHash("sha256").update(markdownContent).digest("hex");
}

export async function parseLocalTextDocumentAsset({
  fileName: inputFileName,
  maxFileSizeByte = defaultMaxFileSizeByte,
  objectKey,
  storageRoot,
}: ParseLocalTextDocumentAssetInput): Promise<LocalTextDocumentParseResult> {
  const fileName = inputFileName ?? readFileName(objectKey);
  const extension = readExtension(fileName);
  const skippedSource = { objectKey, fileName, extension };

  if (!supportedExtensions.has(extension)) {
    return {
      status: "skipped",
      parserMode: "local_only",
      skippedReason: "unsupported_extension",
      source: skippedSource,
    };
  }

  const targetPath = resolveInsideStorageRoot(storageRoot, objectKey);
  const fileStat = await stat(targetPath);

  if (fileStat.size > maxFileSizeByte) {
    return {
      status: "skipped",
      parserMode: "local_only",
      skippedReason: "file_too_large",
      source: skippedSource,
    };
  }

  const markdownContent = normalizeMarkdownContent(
    await readFile(targetPath, "utf8"),
    extension,
  );
  const markdownContentHash = createContentHash(markdownContent);
  const headingPaths = collectHeadingPaths(markdownContent);
  const lineCount =
    markdownContent.length === 0 ? 0 : markdownContent.split("\n").length;
  const chunkCandidateCount = countChunkCandidates(markdownContent);
  const source = {
    ...skippedSource,
    contentType: inferContentType(extension),
  };

  return {
    status: "parsed",
    parserMode: "local_only",
    source,
    markdownContent,
    markdownContentHash,
    charLength: markdownContent.length,
    lineCount,
    chunkCandidateCount,
    headingPaths,
    evidenceSummary: {
      ...source,
      parserMode: "local_only",
      markdownContentHash,
      charLength: markdownContent.length,
      lineCount,
      chunkCandidateCount,
      headingPaths,
      redactedPreview: createRedactedPreview(markdownContentHash),
    },
  };
}

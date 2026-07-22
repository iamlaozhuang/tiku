import { createHash } from "node:crypto";

import type {
  Profession,
  ResourceLevelList,
  ResourceStatus,
} from "@/server/models/ai-rag";

export type RagChunkingConfig = {
  targetChunkSize: number;
  chunkOverlapSize: number;
  minChunkSize: number;
};

export const defaultRagChunkingConfig = {
  targetChunkSize: 900,
  chunkOverlapSize: 120,
  minChunkSize: 240,
} satisfies RagChunkingConfig;

export type RagChunkingInput = {
  resourcePublicId: string;
  resourceTitle: string;
  resourceStatus: ResourceStatus;
  profession: Profession;
  /** Legacy singleton input; active resource consumers provide levelList. */
  level?: number | null;
  levelList?: ResourceLevelList;
  markdownContent: string | null;
  markdownContentHash: string | null;
};

export type RagChunk = {
  chunkPublicId: string;
  resourcePublicId: string;
  resourceTitle: string;
  profession: Profession;
  level?: number | null;
  levelList: ResourceLevelList;
  headingPath: string[];
  chunkIndex: number;
  text: string;
  textHash: string;
  charLength: number;
};

export type RagChunkSkippedReason =
  | "resource_status_not_chunkable"
  | "missing_markdown_content";

export type RagChunkingResult = {
  status: "chunked" | "skipped";
  skippedReason: RagChunkSkippedReason | null;
  chunks: RagChunk[];
};

export type RagChunkEvidenceSummary = {
  chunkCount: number;
  resourcePublicIds: string[];
  chunkIndexes: number[];
  textHashes: string[];
  totalCharLength: number;
  headingPaths: string[][];
};

type MarkdownBlock = {
  headingPath: string[];
  text: string;
};

type ChunkPiece = MarkdownBlock;

const chunkableResourceStatuses: readonly ResourceStatus[] = [
  "published",
  "rag_ready",
];

export function shouldChunkResource(resourceStatus: ResourceStatus): {
  canChunk: boolean;
  skippedReason: RagChunkSkippedReason | null;
} {
  return chunkableResourceStatuses.includes(resourceStatus)
    ? { canChunk: true, skippedReason: null }
    : {
        canChunk: false,
        skippedReason: "resource_status_not_chunkable",
      };
}

export function createRagChunks(
  input: RagChunkingInput,
  config: RagChunkingConfig = defaultRagChunkingConfig,
): RagChunkingResult {
  const chunkDecision = shouldChunkResource(input.resourceStatus);

  if (!chunkDecision.canChunk) {
    return {
      status: "skipped",
      skippedReason: chunkDecision.skippedReason,
      chunks: [],
    };
  }

  const markdownContent = input.markdownContent?.trim() ?? "";

  if (markdownContent.length === 0) {
    return {
      status: "skipped",
      skippedReason: "missing_markdown_content",
      chunks: [],
    };
  }

  const normalizedConfig = normalizeChunkingConfig(config);
  const markdownBlocks = parseMarkdownBlocks(markdownContent);
  const chunkPieces = mergeShortChunkPieces(
    markdownBlocks.flatMap((block) =>
      splitTextToChunkPieces(block, normalizedConfig),
    ),
    normalizedConfig,
  );

  return {
    status: "chunked",
    skippedReason: null,
    chunks: chunkPieces.map((piece, index) =>
      createRagChunk(input, piece, index + 1),
    ),
  };
}

export function summarizeRagChunksForEvidence(
  chunks: readonly RagChunk[],
): RagChunkEvidenceSummary {
  return {
    chunkCount: chunks.length,
    resourcePublicIds: [
      ...new Set(chunks.map((chunk) => chunk.resourcePublicId)),
    ],
    chunkIndexes: chunks.map((chunk) => chunk.chunkIndex),
    textHashes: chunks.map((chunk) => chunk.textHash),
    totalCharLength: chunks.reduce(
      (totalLength, chunk) => totalLength + chunk.charLength,
      0,
    ),
    headingPaths: chunks.map((chunk) => [...chunk.headingPath]),
  };
}

function normalizeChunkingConfig(config: RagChunkingConfig): RagChunkingConfig {
  const targetChunkSize = Math.max(1, Math.floor(config.targetChunkSize));
  const chunkOverlapSize = Math.max(
    0,
    Math.min(Math.floor(config.chunkOverlapSize), targetChunkSize - 1),
  );
  const minChunkSize = Math.max(
    1,
    Math.min(Math.floor(config.minChunkSize), targetChunkSize),
  );

  return {
    targetChunkSize,
    chunkOverlapSize,
    minChunkSize,
  };
}

function parseMarkdownBlocks(markdownContent: string): MarkdownBlock[] {
  const lines = markdownContent.replace(/\r\n/g, "\n").split("\n");
  let headingPath: string[] = [];
  let paragraphLines: string[] = [];
  let markdownBlocks: MarkdownBlock[] = [];

  const flushParagraph = () => {
    const paragraphText = normalizeWhitespace(paragraphLines.join(" "));

    markdownBlocks =
      paragraphText.length === 0
        ? markdownBlocks
        : [
            ...markdownBlocks,
            {
              headingPath: [...headingPath],
              text: paragraphText,
            },
          ];
    paragraphLines = [];
  };

  for (const line of lines) {
    const headingMatch = /^(#{1,6})\s+(.+)$/.exec(line.trim());

    if (headingMatch) {
      flushParagraph();
      const headingDepth = headingMatch[1].length;
      const headingText = normalizeWhitespace(headingMatch[2]);
      headingPath = [...headingPath.slice(0, headingDepth - 1), headingText];
      continue;
    }

    if (line.trim().length === 0) {
      flushParagraph();
      continue;
    }

    paragraphLines = [...paragraphLines, line.trim()];
  }

  flushParagraph();

  return markdownBlocks;
}

function splitTextToChunkPieces(
  block: MarkdownBlock,
  config: RagChunkingConfig,
): ChunkPiece[] {
  if (block.text.length <= config.targetChunkSize) {
    return [block];
  }

  return splitLongText(block.text, config).map((text) => ({
    headingPath: [...block.headingPath],
    text,
  }));
}

function splitLongText(text: string, config: RagChunkingConfig): string[] {
  let segmentStart = 0;
  const segments: string[] = [];

  while (segmentStart < text.length) {
    const maximumEnd = Math.min(
      segmentStart + config.targetChunkSize,
      text.length,
    );
    const segmentEnd =
      maximumEnd === text.length
        ? maximumEnd
        : findPreferredTextBoundary(
            text,
            segmentStart,
            maximumEnd,
            config.minChunkSize,
          );
    const segment = text.slice(segmentStart, segmentEnd).trim();

    if (segment.length > 0) {
      segments.push(segment);
    }

    if (segmentEnd >= text.length) {
      break;
    }

    const nextStart = Math.max(
      segmentStart + 1,
      segmentEnd - config.chunkOverlapSize,
    );
    segmentStart = moveBeforeLowSurrogate(text, nextStart);
  }

  return segments;
}

function findPreferredTextBoundary(
  text: string,
  segmentStart: number,
  maximumEnd: number,
  minimumChunkSize: number,
): number {
  const minimumPreferredEnd = Math.min(
    maximumEnd,
    segmentStart +
      Math.max(minimumChunkSize, Math.floor((maximumEnd - segmentStart) * 0.6)),
  );

  for (let index = maximumEnd - 1; index >= minimumPreferredEnd; index -= 1) {
    if (/[\s。！？!?；;，,]/u.test(text[index])) {
      return moveBeforeLowSurrogate(text, index + 1);
    }
  }

  return moveBeforeLowSurrogate(text, maximumEnd);
}

function moveBeforeLowSurrogate(text: string, index: number): number {
  if (index <= 0 || index >= text.length) {
    return index;
  }

  const codeUnit = text.charCodeAt(index);

  return codeUnit >= 0xdc00 && codeUnit <= 0xdfff ? index - 1 : index;
}

function mergeShortChunkPieces(
  chunkPieces: ChunkPiece[],
  config: RagChunkingConfig,
): ChunkPiece[] {
  return chunkPieces.reduce<ChunkPiece[]>((mergedPieces, currentPiece) => {
    const previousPiece = mergedPieces.at(-1);

    if (
      previousPiece &&
      haveSameHeadingPath(previousPiece.headingPath, currentPiece.headingPath)
    ) {
      const mergedText = `${previousPiece.text}\n\n${currentPiece.text}`;
      const shouldMerge = mergedText.length <= config.targetChunkSize;

      if (shouldMerge) {
        return [
          ...mergedPieces.slice(0, -1),
          {
            headingPath: [...previousPiece.headingPath],
            text: mergedText,
          },
        ];
      }
    }

    return [
      ...mergedPieces,
      {
        headingPath: [...currentPiece.headingPath],
        text: currentPiece.text,
      },
    ];
  }, []);
}

function createRagChunk(
  input: RagChunkingInput,
  piece: ChunkPiece,
  chunkIndex: number,
): RagChunk {
  const textHash = createStableHash(piece.text);
  const chunkPublicId = createStableHash(
    [
      input.resourcePublicId,
      input.markdownContentHash ?? "no_markdown_hash",
      String(chunkIndex),
      textHash,
    ].join(":"),
  );

  return {
    chunkPublicId,
    resourcePublicId: input.resourcePublicId,
    resourceTitle: input.resourceTitle,
    profession: input.profession,
    level: input.level,
    levelList:
      input.levelList !== undefined
        ? input.levelList === null
          ? null
          : [...input.levelList]
        : typeof input.level === "number"
          ? [input.level]
          : null,
    headingPath: [...piece.headingPath],
    chunkIndex,
    text: piece.text,
    textHash,
    charLength: piece.text.length,
  };
}

function haveSameHeadingPath(
  leftHeadingPath: readonly string[],
  rightHeadingPath: readonly string[],
): boolean {
  return (
    leftHeadingPath.length === rightHeadingPath.length &&
    leftHeadingPath.every(
      (headingName, index) => headingName === rightHeadingPath[index],
    )
  );
}

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function createStableHash(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

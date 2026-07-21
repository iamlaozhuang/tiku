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
  const words = text.split(/\s+/).filter((word) => word.length > 0);
  let currentSegment = "";
  let segments: string[] = [];

  for (const word of words) {
    const candidateSegment =
      currentSegment.length === 0 ? word : `${currentSegment} ${word}`;

    if (
      candidateSegment.length <= config.targetChunkSize ||
      currentSegment.length === 0
    ) {
      currentSegment = candidateSegment;
      continue;
    }

    segments = [...segments, currentSegment];
    const overlapText = takeTrailingWords(
      currentSegment,
      config.chunkOverlapSize,
    );
    currentSegment = overlapText.length === 0 ? word : `${overlapText} ${word}`;
  }

  return currentSegment.length === 0 ? segments : [...segments, currentSegment];
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
      const shouldMerge =
        previousPiece.text.length < config.minChunkSize ||
        mergedText.length <= config.targetChunkSize;

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

function takeTrailingWords(text: string, overlapSize: number): string {
  if (overlapSize === 0) {
    return "";
  }

  const trailingText = text.slice(-overlapSize);
  const leadingBoundaryIndex = trailingText.indexOf(" ");

  return normalizeWhitespace(
    leadingBoundaryIndex === -1
      ? trailingText
      : trailingText.slice(leadingBoundaryIndex + 1),
  );
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

import { createHash } from "node:crypto";

import type { EvidenceStatus } from "@/rag/retrieval";
import type {
  Profession,
  ResourceLevelList,
  ResourceStatus,
} from "@/server/models/ai-rag";
import {
  buildResourceChunks,
  type RagChunkingServiceResult,
} from "./rag-chunking-service";
import {
  buildRagRetrievalContextFromChunks,
  type RagRetrievalChunkInput,
} from "./rag-retrieval-service";
import type {
  LocalTextDocumentParseResult,
  ParsedLocalTextDocumentAsset,
} from "./local-text-document-parser";

export type LocalMockEmbeddedChunk = RagRetrievalChunkInput & {
  embedding: number[];
  embeddingDimension: number;
  embeddingModel: "local_mock_hash_v1";
};

export type LocalRagMockEmbeddingEvidenceSummary = {
  embeddingMode: "local_mock";
  status: "indexed" | "skipped";
  skippedReason: "parser_skipped" | "chunking_skipped" | null;
  chunkCount: number;
  embeddingDimension: number;
  resourcePublicIds: string[];
  chunkPublicIds: string[];
  textHashes: string[];
};

export type LocalRagMockEmbeddingPipelineInput = {
  parsedDocument: LocalTextDocumentParseResult;
  resourcePublicId: string;
  resourceTitle: string;
  resourceStatus: ResourceStatus;
  profession: Profession;
  level?: number | null;
  levelList?: ResourceLevelList;
};

export type LocalRagMockEmbeddingPipelineResult =
  | {
      status: "indexed";
      embeddingMode: "local_mock";
      chunkingResult: RagChunkingServiceResult;
      embeddedChunks: LocalMockEmbeddedChunk[];
      evidenceSummary: LocalRagMockEmbeddingEvidenceSummary;
    }
  | {
      status: "skipped";
      embeddingMode: "local_mock";
      skippedReason: "parser_skipped" | "chunking_skipped";
      embeddedChunks: [];
      evidenceSummary: LocalRagMockEmbeddingEvidenceSummary;
    };

export type LocalRagMockRetrievalInput = {
  query: string;
  profession: Profession;
  level: number | null;
  authorizedResourcePublicIds: string[];
  embeddedChunks: LocalMockEmbeddedChunk[];
};

export type LocalRagMockRetrievalResult = {
  evidenceStatus: EvidenceStatus;
  citations: ReturnType<typeof buildRagRetrievalContextFromChunks>["citations"];
  evidenceSummary: ReturnType<
    typeof buildRagRetrievalContextFromChunks
  >["evidenceSummary"];
};

const embeddingDimension = 8;
const embeddingModel = "local_mock_hash_v1";

function createSkippedEvidenceSummary(
  skippedReason: "parser_skipped" | "chunking_skipped",
): LocalRagMockEmbeddingEvidenceSummary {
  return {
    embeddingMode: "local_mock",
    status: "skipped",
    skippedReason,
    chunkCount: 0,
    embeddingDimension: 0,
    resourcePublicIds: [],
    chunkPublicIds: [],
    textHashes: [],
  };
}

function createLocalMockEmbedding(textHash: string): number[] {
  const digest = createHash("sha256").update(textHash).digest();

  return Array.from({ length: embeddingDimension }, (_, index) => {
    const signedValue = digest.readInt16BE(index * 2);

    return Number((signedValue / 32768).toFixed(6));
  });
}

function createEmbeddedChunks(
  chunkingResult: RagChunkingServiceResult,
  resourceStatus: ResourceStatus,
): LocalMockEmbeddedChunk[] {
  return chunkingResult.chunks.map((chunk) => ({
    ...chunk,
    resourceStatus,
    embedding: createLocalMockEmbedding(chunk.textHash),
    embeddingDimension,
    embeddingModel,
  }));
}

function createIndexedEvidenceSummary(
  embeddedChunks: readonly LocalMockEmbeddedChunk[],
): LocalRagMockEmbeddingEvidenceSummary {
  return {
    embeddingMode: "local_mock",
    status: "indexed",
    skippedReason: null,
    chunkCount: embeddedChunks.length,
    embeddingDimension,
    resourcePublicIds: [
      ...new Set(embeddedChunks.map((chunk) => chunk.resourcePublicId)),
    ],
    chunkPublicIds: embeddedChunks.map((chunk) => chunk.chunkPublicId),
    textHashes: embeddedChunks.map((chunk) => chunk.textHash),
  };
}

function buildChunksFromParsedDocument(
  input: LocalRagMockEmbeddingPipelineInput & {
    parsedDocument: ParsedLocalTextDocumentAsset;
  },
): RagChunkingServiceResult {
  return buildResourceChunks({
    resourcePublicId: input.resourcePublicId,
    resourceTitle: input.resourceTitle,
    resourceStatus: input.resourceStatus,
    profession: input.profession,
    level: input.level,
    levelList: input.levelList,
    markdownContent: input.parsedDocument.markdownContent,
    markdownContentHash: input.parsedDocument.markdownContentHash,
  });
}

export function buildLocalRagMockEmbeddingPipeline(
  input: LocalRagMockEmbeddingPipelineInput,
): LocalRagMockEmbeddingPipelineResult {
  if (input.parsedDocument.status !== "parsed") {
    return {
      status: "skipped",
      embeddingMode: "local_mock",
      skippedReason: "parser_skipped",
      embeddedChunks: [],
      evidenceSummary: createSkippedEvidenceSummary("parser_skipped"),
    };
  }

  const chunkingResult = buildChunksFromParsedDocument({
    ...input,
    parsedDocument: input.parsedDocument,
  });

  if (chunkingResult.status === "skipped") {
    return {
      status: "skipped",
      embeddingMode: "local_mock",
      skippedReason: "chunking_skipped",
      embeddedChunks: [],
      evidenceSummary: createSkippedEvidenceSummary("chunking_skipped"),
    };
  }

  const embeddedChunks = createEmbeddedChunks(
    chunkingResult,
    input.resourceStatus,
  );

  return {
    status: "indexed",
    embeddingMode: "local_mock",
    chunkingResult,
    embeddedChunks,
    evidenceSummary: createIndexedEvidenceSummary(embeddedChunks),
  };
}

export function buildLocalRagMockRetrievalContext({
  authorizedResourcePublicIds,
  embeddedChunks,
  level,
  profession,
  query,
}: LocalRagMockRetrievalInput): LocalRagMockRetrievalResult {
  return buildRagRetrievalContextFromChunks({
    query,
    profession,
    level,
    authorizedResourcePublicIds,
    chunks: embeddedChunks,
  });
}

import type { RagRetrievalCandidate } from "@/rag/retrieval";
import type { RagKnowledgeRetrievalRequest } from "@/server/contracts/rag-knowledge/retrieval-governance-contract";

export type RagKnowledgeChunkRecord = RagRetrievalCandidate & {
  privateFileUrl?: string;
  embeddingVector?: readonly number[];
  internalDebugSnapshot?: unknown;
};

export type RagKnowledgeRepository = {
  listRetrievalCandidates(
    request: RagKnowledgeRetrievalRequest,
  ): Promise<RagRetrievalCandidate[]>;
};

export function sanitizeRagKnowledgeChunkRecord(
  chunk: RagKnowledgeChunkRecord,
): RagRetrievalCandidate {
  return {
    chunkIndex: chunk.chunkIndex,
    chunkPublicId: chunk.chunkPublicId,
    headingPath: [...chunk.headingPath],
    isStale: chunk.isStale,
    keywordScore: chunk.keywordScore,
    levelList:
      chunk.levelList === undefined
        ? typeof chunk.level === "number"
          ? [chunk.level]
          : null
        : chunk.levelList === null
          ? null
          : [...chunk.levelList],
    profession: chunk.profession,
    resourcePublicId: chunk.resourcePublicId,
    resourceStatus: chunk.resourceStatus,
    resourceTitle: chunk.resourceTitle,
    semanticScore: chunk.semanticScore,
    text: chunk.text,
    textHash: chunk.textHash,
  };
}

import {
  createRagChunks,
  summarizeRagChunksForEvidence,
  type RagChunk,
  type RagChunkEvidenceSummary,
  type RagChunkingConfig,
  type RagChunkingInput,
  type RagChunkSkippedReason,
} from "@/rag/chunking";

export type RagChunkingServiceResult = {
  status: "chunked" | "skipped";
  skippedReason: RagChunkSkippedReason | null;
  chunks: RagChunk[];
  evidenceSummary: RagChunkEvidenceSummary;
};

export function buildResourceChunks(
  input: RagChunkingInput,
  config?: RagChunkingConfig,
): RagChunkingServiceResult {
  const chunkingResult = createRagChunks(input, config);

  return {
    status: chunkingResult.status,
    skippedReason: chunkingResult.skippedReason,
    chunks: chunkingResult.chunks,
    evidenceSummary: summarizeRagChunksForEvidence(chunkingResult.chunks),
  };
}

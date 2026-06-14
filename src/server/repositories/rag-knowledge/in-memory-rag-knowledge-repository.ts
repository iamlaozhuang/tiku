import type {
  RagKnowledgeChunkRecord,
  RagKnowledgeRepository,
} from "@/server/repositories/rag-knowledge/rag-knowledge-repository";
import { sanitizeRagKnowledgeChunkRecord } from "@/server/repositories/rag-knowledge/rag-knowledge-repository";

export type InMemoryRagKnowledgeRepositoryInput = {
  chunks: RagKnowledgeChunkRecord[];
};

export function createInMemoryRagKnowledgeRepository(
  input: InMemoryRagKnowledgeRepositoryInput,
): RagKnowledgeRepository {
  const chunks = input.chunks.map(sanitizeRagKnowledgeChunkRecord);

  return {
    async listRetrievalCandidates(): Promise<typeof chunks> {
      return chunks.map((chunk) => ({
        ...chunk,
        headingPath: [...chunk.headingPath],
      }));
    },
  };
}

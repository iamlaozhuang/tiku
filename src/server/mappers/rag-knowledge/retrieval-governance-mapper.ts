import type { RagCitation, RagRetrievalEvidenceSummary } from "@/rag/retrieval";
import type {
  RagKnowledgeCitationSourceDto,
  RagKnowledgeEvidenceSummaryDto,
} from "@/server/contracts/rag-knowledge/retrieval-governance-contract";

export function mapRagKnowledgeCitationToSourceDto(
  citation: RagCitation,
): RagKnowledgeCitationSourceDto {
  return {
    chunkIndex: citation.chunkIndex,
    chunkPublicId: citation.chunkPublicId,
    displayPath: citation.headingPath.join(" > "),
    headingPath: [...citation.headingPath],
    isStale: citation.isStale,
    resourcePublicId: citation.resourcePublicId,
    resourceTitle: citation.resourceTitle,
    score: citation.score,
    textHash: citation.textHash,
  };
}

export function mapRagKnowledgeEvidenceSummaryToDto(
  evidenceSummary: RagRetrievalEvidenceSummary,
): RagKnowledgeEvidenceSummaryDto {
  return {
    chunkIndexes: [...evidenceSummary.chunkIndexes],
    chunkPublicIds: [...evidenceSummary.chunkPublicIds],
    citationCount: evidenceSummary.citationCount,
    evidenceStatus: evidenceSummary.evidenceStatus,
    maxScore: evidenceSummary.maxScore,
    queryHash: evidenceSummary.queryHash,
    resourcePublicIds: [...evidenceSummary.resourcePublicIds],
    retrievalMode: evidenceSummary.retrievalMode,
    staleCitationCount: evidenceSummary.staleCitationCount,
    staleResourcePublicIds: [...evidenceSummary.staleResourcePublicIds],
    textHashes: [...evidenceSummary.textHashes],
  };
}

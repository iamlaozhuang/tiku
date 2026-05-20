import {
  createRagRetrievalResult,
  summarizeRagRetrievalForEvidence,
  type RagCitation,
  type RagRetrievalCandidate,
  type RagRetrievalEvidenceSummary,
} from "@/rag/retrieval";
import type { EvidenceStatus } from "@/rag/retrieval";
import type { Profession } from "@/server/models/ai-rag";

export type RagRetrievalServiceInput = {
  query: string;
  profession: Profession;
  level: number | null;
  authorizedResourcePublicIds: string[];
  candidates: RagRetrievalCandidate[];
};

export type RagRetrievalServiceResult = {
  evidenceStatus: EvidenceStatus;
  citations: RagCitation[];
  evidenceSummary: RagRetrievalEvidenceSummary;
};

export function buildRagRetrievalContextForAi(
  input: RagRetrievalServiceInput,
): RagRetrievalServiceResult {
  const retrievalResult = createRagRetrievalResult(input);

  return {
    evidenceStatus: retrievalResult.evidenceStatus,
    citations: retrievalResult.citations,
    evidenceSummary: summarizeRagRetrievalForEvidence(
      retrievalResult,
      input.query,
    ),
  };
}

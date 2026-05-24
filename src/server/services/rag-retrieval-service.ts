import {
  createRagRetrievalResult,
  summarizeRagRetrievalForEvidence,
  type RagRetrievalCandidate,
  type RagCitation,
  type RagRetrievalEvidenceSummary,
} from "@/rag/retrieval";
import type { RagCitationSourceDto } from "@/server/contracts/ai-rag-contract";
import type { EvidenceStatus } from "@/rag/retrieval";
import type { Profession, ResourceStatus } from "@/server/models/ai-rag";

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

export type RagRetrievalChunkInput = {
  chunkPublicId: string;
  resourcePublicId: string;
  resourceTitle: string;
  resourceStatus: ResourceStatus;
  profession: Profession;
  level: number | null;
  headingPath: string[];
  chunkIndex: number;
  text: string;
  textHash: string;
};

export type RagRetrievalFromChunksInput = Omit<
  RagRetrievalServiceInput,
  "candidates"
> & {
  chunks: RagRetrievalChunkInput[];
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

export function buildRagRetrievalContextFromChunks(
  input: RagRetrievalFromChunksInput,
): RagRetrievalServiceResult {
  return buildRagRetrievalContextForAi({
    query: input.query,
    profession: input.profession,
    level: input.level,
    authorizedResourcePublicIds: input.authorizedResourcePublicIds,
    candidates: input.chunks.map((chunk) =>
      createDeterministicRetrievalCandidate(input.query, chunk),
    ),
  });
}

export function createRagCitationSourceDtos(
  citations: readonly RagCitation[],
): RagCitationSourceDto[] {
  return citations.map((citation) => ({
    chunkPublicId: citation.chunkPublicId,
    resourcePublicId: citation.resourcePublicId,
    resourceTitle: citation.resourceTitle,
    headingPath: [...citation.headingPath],
    chunkIndex: citation.chunkIndex,
    score: citation.score,
  }));
}

function createDeterministicRetrievalCandidate(
  query: string,
  chunk: RagRetrievalChunkInput,
): RagRetrievalCandidate {
  const tokenScore = calculateTokenOverlapScore(query, chunk.text);

  return {
    ...chunk,
    keywordScore: tokenScore,
    semanticScore: tokenScore,
  };
}

function calculateTokenOverlapScore(query: string, text: string): number {
  const queryTokens = tokenizeForLocalRetrieval(query);

  if (queryTokens.length === 0) {
    return 0;
  }

  const textTokens = new Set(tokenizeForLocalRetrieval(text));
  const matchedTokenCount = queryTokens.filter((token) =>
    textTokens.has(token),
  ).length;

  return matchedTokenCount / queryTokens.length;
}

function tokenizeForLocalRetrieval(value: string): string[] {
  return [
    ...new Set(
      value
        .toLowerCase()
        .split(/[^\p{Letter}\p{Number}]+/u)
        .map((token) => token.trim())
        .filter((token) => token.length > 0),
    ),
  ];
}

import {
  createRagRetrievalResult,
  summarizeRagRetrievalForEvidence,
  type RagRetrievalCandidate,
  type RagCitation,
  type RagRetrievalEvidenceSummary,
  type RagRetrievalMode,
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
  generationPublicId?: string;
  resourcePublicId: string;
  resourceTitle: string;
  resourceStatus: ResourceStatus;
  profession: Profession;
  level: number | null;
  headingPath: string[];
  chunkIndex: number;
  text: string;
  textHash: string;
  isStale?: boolean;
};

export type PersistedRagRetrievalChunkInput = RagRetrievalChunkInput & {
  keywordScore: number;
  semanticScore: number | null;
  rerankScore?: number | null;
};

export type RagRetrievalFromChunksInput = Omit<
  RagRetrievalServiceInput,
  "candidates"
> & {
  chunks: RagRetrievalChunkInput[];
};

export type RagRetrievalFromPersistedChunksInput = Omit<
  RagRetrievalServiceInput,
  "candidates"
> & {
  chunks: PersistedRagRetrievalChunkInput[];
  retrievalMode?: RagRetrievalMode;
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
  const retrievalResult = createRagRetrievalResult({
    query: input.query,
    profession: input.profession,
    level: input.level,
    authorizedResourcePublicIds: input.authorizedResourcePublicIds,
    retrievalMode: "keyword_only",
    candidates: input.chunks.map((chunk) =>
      createKeywordOnlyRetrievalCandidate(input.query, chunk),
    ),
  });

  return {
    evidenceStatus: retrievalResult.evidenceStatus,
    citations: retrievalResult.citations,
    evidenceSummary: summarizeRagRetrievalForEvidence(
      retrievalResult,
      input.query,
    ),
  };
}

export function buildRagRetrievalContextFromPersistedChunks(
  input: RagRetrievalFromPersistedChunksInput,
): RagRetrievalServiceResult {
  const retrievalMode =
    input.retrievalMode === undefined &&
    input.chunks.every((chunk) => chunk.semanticScore === null)
      ? "keyword_only"
      : (input.retrievalMode ?? "fusion_sort");
  const retrievalResult = createRagRetrievalResult({
    query: input.query,
    profession: input.profession,
    level: input.level,
    authorizedResourcePublicIds: input.authorizedResourcePublicIds,
    retrievalMode,
    candidates: input.chunks,
  });

  return {
    evidenceStatus: retrievalResult.evidenceStatus,
    citations: retrievalResult.citations,
    evidenceSummary: summarizeRagRetrievalForEvidence(
      retrievalResult,
      input.query,
    ),
  };
}

export function createRagCitationSourceDtos(
  citations: readonly RagCitation[],
): RagCitationSourceDto[] {
  return citations.map((citation) => ({
    chunkPublicId: citation.chunkPublicId,
    generationPublicId: citation.generationPublicId,
    resourcePublicId: citation.resourcePublicId,
    resourceTitle: citation.resourceTitle,
    headingPath: [...citation.headingPath],
    chunkIndex: citation.chunkIndex,
    score: citation.score,
  }));
}

function createKeywordOnlyRetrievalCandidate(
  query: string,
  chunk: RagRetrievalChunkInput,
): RagRetrievalCandidate {
  const tokenScore = calculateTokenOverlapScore(query, chunk.text);

  return {
    ...chunk,
    keywordScore: tokenScore,
    semanticScore: null,
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

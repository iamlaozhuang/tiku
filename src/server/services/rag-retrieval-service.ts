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
import type {
  Profession,
  ResourceLevelList,
  ResourceStatus,
} from "@/server/models/ai-rag";

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
  /** Legacy singleton fixture; active resource consumers must provide levelList. */
  level?: number | null;
  levelList?: ResourceLevelList;
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
    candidates: input.chunks.map(resolveRetrievalChunkCoverage),
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
    ...resolveRetrievalChunkCoverage(chunk),
    keywordScore: tokenScore,
    semanticScore: null,
  };
}

function resolveRetrievalChunkCoverage<T extends RagRetrievalChunkInput>(
  chunk: T,
): T & { levelList: ResourceLevelList } {
  return {
    ...chunk,
    levelList:
      chunk.levelList !== undefined
        ? chunk.levelList
        : typeof chunk.level === "number"
          ? [chunk.level]
          : null,
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
  const tokens: string[] = [];
  let currentMode: "han" | "word" | null = null;
  let currentCharacters: string[] = [];

  const flushCurrentToken = () => {
    if (currentCharacters.length === 0 || currentMode === null) {
      return;
    }

    if (currentMode === "han") {
      if (currentCharacters.length === 1) {
        tokens.push(currentCharacters[0]);
      } else {
        for (let index = 0; index < currentCharacters.length - 1; index += 1) {
          tokens.push(
            `${currentCharacters[index]}${currentCharacters[index + 1]}`,
          );
        }
      }
    } else {
      tokens.push(currentCharacters.join(""));
    }

    currentMode = null;
    currentCharacters = [];
  };

  for (const character of value.normalize("NFKC").toLowerCase()) {
    const nextMode = /\p{Script=Han}/u.test(character)
      ? "han"
      : /[\p{Letter}\p{Number}]/u.test(character)
        ? "word"
        : null;

    if (nextMode === null) {
      flushCurrentToken();
      continue;
    }

    if (currentMode !== null && currentMode !== nextMode) {
      flushCurrentToken();
    }

    currentMode = nextMode;
    currentCharacters.push(character);
  }

  flushCurrentToken();

  return [...new Set(tokens)];
}

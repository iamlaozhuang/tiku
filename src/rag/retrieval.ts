import { createHash } from "node:crypto";

import type { Profession, ResourceStatus } from "@/server/models/ai-rag";
import { isResourceRagEligible } from "@/server/models/ai-rag";

export type EvidenceStatus = "sufficient" | "weak" | "none";
export type RagRetrievalMode = "keyword_only" | "fusion_sort" | "hybrid_rerank";

export type RagRetrievalCandidate = {
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
  keywordScore: number;
  semanticScore: number | null;
  rerankScore?: number | null;
};

export type RagRetrievalInput = {
  query: string;
  profession: Profession;
  level: number | null;
  authorizedResourcePublicIds: string[];
  candidates: RagRetrievalCandidate[];
  maxCitationCount?: number;
  retrievalMode?: RagRetrievalMode;
};

export type RagCitation = {
  chunkPublicId: string;
  generationPublicId: string | null;
  resourcePublicId: string;
  resourceTitle: string;
  headingPath: string[];
  chunkIndex: number;
  chunkText: string;
  textHash: string;
  isStale: boolean;
  score: number;
};

export type RagRetrievalResult = {
  evidenceStatus: EvidenceStatus;
  citations: RagCitation[];
  retrievalMode: RagRetrievalMode;
  fallbackReason:
    | "semantic_unavailable_keyword_only"
    | "rerank_unavailable_fusion_sort"
    | null;
};

export type RagRetrievalEvidenceSummary = {
  evidenceStatus: EvidenceStatus;
  citationCount: number;
  resourcePublicIds: string[];
  chunkPublicIds: string[];
  generationPublicIds: string[];
  chunkIndexes: number[];
  textHashes: string[];
  staleCitationCount: number;
  staleResourcePublicIds: string[];
  queryHash: string;
  maxScore: number | null;
  retrievalMode: RagRetrievalMode;
};

type RankedRetrievalCandidate = RagRetrievalCandidate & {
  score: number;
  qualityRank: number;
  levelRank: number;
};

const defaultMaxCitationCount = 3;
const sufficientCitationCount = 2;
const sufficientScoreThreshold = 0.7;

export function createRagRetrievalResult(
  input: RagRetrievalInput,
): RagRetrievalResult {
  const maxCitationCount = normalizeMaxCitationCount(input.maxCitationCount);
  const retrievalMode = input.retrievalMode ?? "fusion_sort";
  const authorizedResourcePublicIds = new Set(
    input.authorizedResourcePublicIds,
  );
  const rankedCandidates = deduplicateCandidates(
    input.candidates
      .filter((candidate) =>
        canUseCandidate(candidate, input, authorizedResourcePublicIds),
      )
      .map((candidate) => ({
        ...candidate,
        score: calculateCandidateScore(candidate, input.query, retrievalMode),
        qualityRank: calculateQualityRank(
          calculateCandidateScore(candidate, input.query, retrievalMode),
        ),
        levelRank: calculateLevelRank(candidate.level, input.level),
      })),
  ).sort(compareRankedCandidates);

  const citations = rankedCandidates
    .slice(0, maxCitationCount)
    .map(createCitation);

  return {
    evidenceStatus: calculateEvidenceStatus(citations),
    citations,
    retrievalMode,
    fallbackReason:
      retrievalMode === "keyword_only"
        ? "semantic_unavailable_keyword_only"
        : retrievalMode === "fusion_sort"
          ? "rerank_unavailable_fusion_sort"
          : null,
  };
}

export function summarizeRagRetrievalForEvidence(
  result: RagRetrievalResult,
  query = "",
): RagRetrievalEvidenceSummary {
  return {
    evidenceStatus: result.evidenceStatus,
    citationCount: result.citations.length,
    resourcePublicIds: [
      ...new Set(result.citations.map((citation) => citation.resourcePublicId)),
    ],
    chunkPublicIds: result.citations.map((citation) => citation.chunkPublicId),
    generationPublicIds: [
      ...new Set(
        result.citations.flatMap((citation) =>
          citation.generationPublicId === null
            ? []
            : [citation.generationPublicId],
        ),
      ),
    ],
    chunkIndexes: result.citations.map((citation) => citation.chunkIndex),
    textHashes: result.citations.map((citation) => citation.textHash),
    staleCitationCount: result.citations.filter((citation) => citation.isStale)
      .length,
    staleResourcePublicIds: [
      ...new Set(
        result.citations
          .filter((citation) => citation.isStale)
          .map((citation) => citation.resourcePublicId),
      ),
    ],
    queryHash: createStableHash(query),
    maxScore:
      result.citations.length === 0
        ? null
        : Math.max(...result.citations.map((citation) => citation.score)),
    retrievalMode: result.retrievalMode,
  };
}

function canUseCandidate(
  candidate: RagRetrievalCandidate,
  input: RagRetrievalInput,
  authorizedResourcePublicIds: ReadonlySet<string>,
): boolean {
  return (
    isResourceRagEligible(candidate.resourceStatus) &&
    candidate.profession === input.profession &&
    isLevelEligible(candidate.level, input.level) &&
    authorizedResourcePublicIds.has(candidate.resourcePublicId)
  );
}

function isLevelEligible(
  candidateLevel: number | null,
  requestedLevel: number | null,
): boolean {
  return (
    requestedLevel === null ||
    candidateLevel === requestedLevel ||
    candidateLevel === null
  );
}

function calculateLevelRank(
  candidateLevel: number | null,
  requestedLevel: number | null,
): number {
  if (requestedLevel !== null && candidateLevel === requestedLevel) {
    return 0;
  }

  if (candidateLevel === null) {
    return 1;
  }

  return 2;
}

function calculateFusionScore(candidate: RagRetrievalCandidate): number {
  if (candidate.semanticScore === null) {
    return clampScore(candidate.keywordScore);
  }

  return (
    (clampScore(candidate.keywordScore) + clampScore(candidate.semanticScore)) /
    2
  );
}

function calculateCandidateScore(
  candidate: RagRetrievalCandidate,
  _query: string,
  retrievalMode: RagRetrievalMode,
): number {
  if (retrievalMode === "keyword_only") {
    return clampScore(candidate.keywordScore);
  }

  const fusionScore = calculateFusionScore(candidate);

  if (retrievalMode === "fusion_sort") {
    return fusionScore;
  }

  return clampScore(candidate.rerankScore ?? fusionScore);
}

function calculateQualityRank(score: number): number {
  return score >= sufficientScoreThreshold ? 0 : 1;
}

function clampScore(score: number): number {
  if (!Number.isFinite(score)) {
    return 0;
  }

  return Math.min(1, Math.max(0, score));
}

function deduplicateCandidates(
  candidates: RankedRetrievalCandidate[],
): RankedRetrievalCandidate[] {
  return [
    ...candidates
      .reduce<Map<string, RankedRetrievalCandidate>>(
        (candidateByChunkPublicId, candidate) => {
          const currentCandidate = candidateByChunkPublicId.get(
            candidate.chunkPublicId,
          );
          const selectedCandidate =
            currentCandidate &&
            compareRankedCandidates(currentCandidate, candidate) <= 0
              ? currentCandidate
              : candidate;

          return new Map(candidateByChunkPublicId).set(
            candidate.chunkPublicId,
            selectedCandidate,
          );
        },
        new Map<string, RankedRetrievalCandidate>(),
      )
      .values(),
  ];
}

function compareRankedCandidates(
  leftCandidate: RankedRetrievalCandidate,
  rightCandidate: RankedRetrievalCandidate,
): number {
  return (
    leftCandidate.qualityRank - rightCandidate.qualityRank ||
    leftCandidate.levelRank - rightCandidate.levelRank ||
    rightCandidate.score - leftCandidate.score ||
    leftCandidate.resourcePublicId.localeCompare(
      rightCandidate.resourcePublicId,
    ) ||
    leftCandidate.chunkIndex - rightCandidate.chunkIndex ||
    leftCandidate.chunkPublicId.localeCompare(rightCandidate.chunkPublicId)
  );
}

function createCitation(candidate: RankedRetrievalCandidate): RagCitation {
  return {
    chunkPublicId: candidate.chunkPublicId,
    generationPublicId: candidate.generationPublicId ?? null,
    resourcePublicId: candidate.resourcePublicId,
    resourceTitle: candidate.resourceTitle,
    headingPath: [...candidate.headingPath],
    chunkIndex: candidate.chunkIndex,
    chunkText: candidate.text,
    textHash: candidate.textHash,
    isStale: candidate.isStale === true,
    score: candidate.score,
  };
}

function calculateEvidenceStatus(citations: RagCitation[]): EvidenceStatus {
  if (citations.length === 0) {
    return "none";
  }

  const strongCitationCount = citations.filter(
    (citation) => citation.score >= sufficientScoreThreshold,
  ).length;

  return strongCitationCount >= sufficientCitationCount ? "sufficient" : "weak";
}

function normalizeMaxCitationCount(
  maxCitationCount: number | undefined,
): number {
  return Math.max(0, Math.floor(maxCitationCount ?? defaultMaxCitationCount));
}

function createStableHash(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

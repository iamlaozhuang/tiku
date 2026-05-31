import { describe, expect, it } from "vitest";

import {
  createRagRetrievalResult,
  summarizeRagRetrievalForEvidence,
  type RagRetrievalCandidate,
} from "./retrieval";

const baseCandidate = {
  resourcePublicId: "resource_public_id",
  resourceTitle: "Marketing Handbook",
  resourceStatus: "rag_ready",
  profession: "marketing",
  level: 3,
  headingPath: ["Marketing", "Customer analysis"],
  chunkIndex: 1,
  text: "Authorized evidence text for AI context only.",
  textHash: "authorized_text_hash",
  keywordScore: 0.4,
  semanticScore: 0.4,
} satisfies Omit<RagRetrievalCandidate, "chunkPublicId">;

describe("RAG evidence retrieval", () => {
  it("filters resource status, profession, level, and authorization before top three selection", () => {
    const result = createRagRetrievalResult({
      query: "customer demand research",
      profession: "marketing",
      level: 3,
      authorizedResourcePublicIds: [
        "authorized_exact_resource_public_id",
        "authorized_general_resource_public_id",
        "authorized_second_resource_public_id",
      ],
      candidates: [
        {
          ...baseCandidate,
          chunkPublicId: "unauthorized_high_score_chunk_public_id",
          resourcePublicId: "unauthorized_resource_public_id",
          keywordScore: 1,
          semanticScore: 1,
        },
        {
          ...baseCandidate,
          chunkPublicId: "published_chunk_public_id",
          resourcePublicId: "authorized_exact_resource_public_id",
          resourceStatus: "published",
          keywordScore: 0.99,
          semanticScore: 0.99,
        },
        {
          ...baseCandidate,
          chunkPublicId: "profession_mismatch_chunk_public_id",
          resourcePublicId: "authorized_exact_resource_public_id",
          profession: "logistics",
          keywordScore: 0.98,
          semanticScore: 0.98,
        },
        {
          ...baseCandidate,
          chunkPublicId: "level_mismatch_chunk_public_id",
          resourcePublicId: "authorized_exact_resource_public_id",
          level: 4,
          keywordScore: 0.97,
          semanticScore: 0.97,
        },
        {
          ...baseCandidate,
          chunkPublicId: "authorized_general_chunk_public_id",
          resourcePublicId: "authorized_general_resource_public_id",
          level: null,
          chunkIndex: 2,
          keywordScore: 0.82,
          semanticScore: 0.8,
        },
        {
          ...baseCandidate,
          chunkPublicId: "authorized_exact_chunk_public_id",
          resourcePublicId: "authorized_exact_resource_public_id",
          chunkIndex: 3,
          keywordScore: 0.75,
          semanticScore: 0.74,
        },
        {
          ...baseCandidate,
          chunkPublicId: "authorized_second_chunk_public_id",
          resourcePublicId: "authorized_second_resource_public_id",
          chunkIndex: 4,
          keywordScore: 0.72,
          semanticScore: 0.72,
        },
        {
          ...baseCandidate,
          chunkPublicId: "authorized_fourth_chunk_public_id",
          resourcePublicId: "authorized_second_resource_public_id",
          chunkIndex: 5,
          keywordScore: 0.7,
          semanticScore: 0.69,
        },
      ],
    });

    expect(result.evidenceStatus).toBe("sufficient");
    expect(result.citations).toHaveLength(3);
    expect(result.citations.map((citation) => citation.chunkPublicId)).toEqual([
      "authorized_exact_chunk_public_id",
      "authorized_second_chunk_public_id",
      "authorized_general_chunk_public_id",
    ]);
    expect(
      result.citations.some(
        (citation) =>
          citation.resourcePublicId === "unauthorized_resource_public_id",
      ),
    ).toBe(false);
  });

  it("returns weak or none evidence status without fabricated citations", () => {
    const weakResult = createRagRetrievalResult({
      query: "weak match",
      profession: "marketing",
      level: 3,
      authorizedResourcePublicIds: ["weak_resource_public_id"],
      candidates: [
        {
          ...baseCandidate,
          chunkPublicId: "weak_chunk_public_id",
          resourcePublicId: "weak_resource_public_id",
          keywordScore: 0.15,
          semanticScore: 0.2,
        },
      ],
    });

    const noneResult = createRagRetrievalResult({
      query: "no match",
      profession: "marketing",
      level: 3,
      authorizedResourcePublicIds: ["missing_resource_public_id"],
      candidates: [
        {
          ...baseCandidate,
          chunkPublicId: "unauthorized_chunk_public_id",
          resourcePublicId: "unauthorized_resource_public_id",
          keywordScore: 1,
          semanticScore: 1,
        },
      ],
    });

    expect(weakResult.evidenceStatus).toBe("weak");
    expect(
      weakResult.citations.map((citation) => citation.chunkPublicId),
    ).toEqual(["weak_chunk_public_id"]);
    expect(noneResult.evidenceStatus).toBe("none");
    expect(noneResult.citations).toEqual([]);
  });

  it("reranks authorized hybrid candidates with local deterministic query relevance", () => {
    const result = createRagRetrievalResult({
      query: "customer permit renewal",
      profession: "marketing",
      level: 3,
      retrievalMode: "hybrid_rerank",
      authorizedResourcePublicIds: [
        "authorized_exact_resource_public_id",
        "authorized_vector_resource_public_id",
      ],
      candidates: [
        {
          ...baseCandidate,
          chunkPublicId: "authorized_vector_only_chunk_public_id",
          resourcePublicId: "authorized_vector_resource_public_id",
          text: "General market operations without the requested phrase.",
          keywordScore: 0.95,
          semanticScore: 0.95,
        },
        {
          ...baseCandidate,
          chunkPublicId: "authorized_exact_rerank_chunk_public_id",
          resourcePublicId: "authorized_exact_resource_public_id",
          text: "Customer permit renewal evidence appears in this passage.",
          keywordScore: 0.4,
          semanticScore: 0.35,
        },
        {
          ...baseCandidate,
          chunkPublicId: "unauthorized_exact_rerank_chunk_public_id",
          resourcePublicId: "unauthorized_resource_public_id",
          text: "Customer permit renewal evidence must be filtered first.",
          keywordScore: 1,
          semanticScore: 1,
        },
      ],
    });
    const summary = summarizeRagRetrievalForEvidence(
      result,
      "customer permit renewal",
    );

    expect(result.retrievalMode).toBe("hybrid_rerank");
    expect(result.citations.map((citation) => citation.chunkPublicId)).toEqual([
      "authorized_exact_rerank_chunk_public_id",
      "authorized_vector_only_chunk_public_id",
    ]);
    expect(
      result.citations.some(
        (citation) =>
          citation.chunkPublicId ===
          "unauthorized_exact_rerank_chunk_public_id",
      ),
    ).toBe(false);
    expect(summary.retrievalMode).toBe("hybrid_rerank");
    expect(JSON.stringify(summary)).not.toContain(
      "Customer permit renewal evidence",
    );
  });

  it("summarizes retrieval evidence without exposing citation or chunk text", () => {
    const result = createRagRetrievalResult({
      query: "redaction check",
      profession: "marketing",
      level: 3,
      authorizedResourcePublicIds: ["resource_public_id"],
      candidates: [
        {
          ...baseCandidate,
          chunkPublicId: "chunk_public_id",
          text: "Sensitive retrieval text must not enter evidence.",
          textHash: "sensitive_text_hash",
          keywordScore: 0.8,
          semanticScore: 0.8,
        },
      ],
    });

    const summary = summarizeRagRetrievalForEvidence(result);
    const serializedSummary = JSON.stringify(summary);

    expect(summary).toMatchObject({
      evidenceStatus: "weak",
      citationCount: 1,
      chunkPublicIds: ["chunk_public_id"],
      textHashes: ["sensitive_text_hash"],
    });
    expect(serializedSummary).not.toContain("Sensitive retrieval text");
    expect(serializedSummary).not.toContain(result.citations[0].chunkText);
  });
});

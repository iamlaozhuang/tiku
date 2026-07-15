import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import {
  canRequestResourceIndexRebuild,
  resolveResourceStatusAfterIndexFailure,
} from "@/server/models/ai-rag";
import { validateKnowledgeRecommendationCitationScope } from "@/server/repositories/knowledge-recommendation-runtime-repository";
import {
  buildRagRetrievalContextFromChunks,
  buildRagRetrievalContextFromPersistedChunks,
} from "@/server/services/rag-retrieval-service";
import {
  validateKnowledgeNodeParentScope,
  validateResourceKnowledgeNodeScope,
} from "@/server/validators/rag-resource-knowledge";

describe("P0 RC-05 knowledge scope facts", () => {
  it("rejects cross-base, cross-profession and self parent relationships", () => {
    const current = {
      id: 11,
      knowledgeBaseId: 3,
      profession: "marketing" as const,
    };

    expect(
      validateKnowledgeNodeParentScope({
        current,
        parent: { id: 12, knowledgeBaseId: 3, profession: "marketing" },
      }),
    ).toEqual({ status: "valid" });
    expect(
      validateKnowledgeNodeParentScope({
        current,
        parent: { id: 11, knowledgeBaseId: 3, profession: "marketing" },
      }),
    ).toEqual({ status: "invalid", reason: "self_parent" });
    expect(
      validateKnowledgeNodeParentScope({
        current,
        parent: { id: 12, knowledgeBaseId: 4, profession: "marketing" },
      }),
    ).toEqual({ status: "invalid", reason: "knowledge_base_mismatch" });
    expect(
      validateKnowledgeNodeParentScope({
        current,
        parent: { id: 12, knowledgeBaseId: 3, profession: "logistics" },
      }),
    ).toEqual({ status: "invalid", reason: "profession_mismatch" });
  });

  it("validates the complete resource relation set without a first-page cap", () => {
    const requestedKnowledgeNodePublicIds = Array.from(
      { length: 125 },
      (_, index) => `knowledge-node-${index + 1}`,
    );
    const knowledgeNodes = requestedKnowledgeNodePublicIds.map(
      (publicId, index) => ({
        id: index + 1,
        publicId,
        knowledgeBaseId: 9,
        profession: "marketing" as const,
        knStatus: "active" as const,
      }),
    );

    expect(
      validateResourceKnowledgeNodeScope({
        resource: { knowledgeBaseId: 9, profession: "marketing" },
        requestedKnowledgeNodePublicIds,
        knowledgeNodes,
      }),
    ).toEqual({
      status: "valid",
      knowledgeNodeIds: Array.from({ length: 125 }, (_, index) => index + 1),
    });
    expect(
      validateResourceKnowledgeNodeScope({
        resource: { knowledgeBaseId: 9, profession: "marketing" },
        requestedKnowledgeNodePublicIds,
        knowledgeNodes: knowledgeNodes.slice(0, 124),
      }),
    ).toEqual({ status: "invalid", reason: "knowledge_node_set_mismatch" });
    expect(
      validateResourceKnowledgeNodeScope({
        resource: { knowledgeBaseId: 9, profession: "marketing" },
        requestedKnowledgeNodePublicIds: ["knowledge-node-1"],
        knowledgeNodes: [
          {
            ...knowledgeNodes[0]!,
            profession: "logistics",
          },
        ],
      }),
    ).toEqual({ status: "invalid", reason: "profession_mismatch" });
  });
});

describe("P0 RC-05 index generation and retrieval facts", () => {
  it("rejects disabled rebuild and retains an old active generation on failure", () => {
    expect(canRequestResourceIndexRebuild("published")).toBe(true);
    expect(canRequestResourceIndexRebuild("index_failed")).toBe(true);
    expect(canRequestResourceIndexRebuild("rag_ready")).toBe(true);
    expect(canRequestResourceIndexRebuild("disabled")).toBe(false);
    expect(canRequestResourceIndexRebuild("indexing")).toBe(false);
    expect(resolveResourceStatusAfterIndexFailure(false)).toBe("index_failed");
    expect(resolveResourceStatusAfterIndexFailure(true)).toBe("rag_ready");
  });

  it("removes legacy indexing writes and checks current status before an idempotent replay", () => {
    const source = readFileSync(
      resolve(
        process.cwd(),
        "src/server/repositories/rag-resource-knowledge-runtime-repository.ts",
      ),
      "utf8",
    );
    const requestFunctionOffset = source.indexOf(
      "async function requestResourceIndexRebuild(",
    );
    const statusGateOffset = source.indexOf(
      "if (!canRequestResourceIndexRebuild(resourceRow.resource_status))",
      requestFunctionOffset,
    );
    const replayLookupOffset = source.indexOf(
      "const [existingRequest]",
      requestFunctionOffset,
    );

    expect(source).not.toContain("markResourceIndexingStarted");
    expect(source).not.toContain("saveResourceIndexingResult");
    expect(requestFunctionOffset).toBeGreaterThanOrEqual(0);
    expect(statusGateOffset).toBeGreaterThan(requestFunctionOffset);
    expect(replayLookupOffset).toBeGreaterThan(statusGateOffset);
  });

  it("uses keyword-only mode without fabricating a semantic score", () => {
    const result = buildRagRetrievalContextFromChunks({
      query: "sampling method",
      profession: "marketing",
      level: 3,
      authorizedResourcePublicIds: ["resource-1"],
      chunks: [
        {
          chunkPublicId: "chunk-1",
          generationPublicId: "generation-1",
          resourcePublicId: "resource-1",
          resourceTitle: "Sampling",
          resourceStatus: "rag_ready",
          profession: "marketing",
          level: 3,
          headingPath: ["Sampling"],
          chunkIndex: 0,
          text: "sampling method overview",
          textHash: "hash-1",
        },
      ],
    });

    expect(result.evidenceSummary.retrievalMode).toBe("keyword_only");
    expect(result.citations[0]).toEqual(
      expect.objectContaining({
        generationPublicId: "generation-1",
        chunkPublicId: "chunk-1",
      }),
    );
  });

  it("keeps persisted keyword and vector scores independent", () => {
    const result = buildRagRetrievalContextFromPersistedChunks({
      query: "sampling",
      profession: "marketing",
      level: null,
      authorizedResourcePublicIds: ["resource-1"],
      retrievalMode: "fusion_sort",
      chunks: [
        {
          chunkPublicId: "chunk-keyword",
          generationPublicId: "generation-1",
          resourcePublicId: "resource-1",
          resourceTitle: "Keyword",
          resourceStatus: "rag_ready",
          profession: "marketing",
          level: null,
          headingPath: [],
          chunkIndex: 0,
          text: "keyword",
          textHash: "hash-keyword",
          keywordScore: 1,
          semanticScore: 0,
        },
        {
          chunkPublicId: "chunk-semantic",
          generationPublicId: "generation-1",
          resourcePublicId: "resource-1",
          resourceTitle: "Semantic",
          resourceStatus: "rag_ready",
          profession: "marketing",
          level: null,
          headingPath: [],
          chunkIndex: 1,
          text: "semantic",
          textHash: "hash-semantic",
          keywordScore: 0,
          semanticScore: 0.8,
        },
      ],
    });

    expect(result.citations.map((citation) => citation.chunkPublicId)).toEqual([
      "chunk-keyword",
      "chunk-semantic",
    ]);
  });
});

describe("P0 RC-05 recommendation production boundary", () => {
  it("requires every candidate citation to come from a resource bound to that knowledge_node", () => {
    const knowledgeNodeIdByPublicId = new Map([
      ["knowledge-node-1", 11],
      ["knowledge-node-2", 12],
    ]);
    const validScope = new Set(["chunk-1:11", "chunk-2:12"]);

    expect(
      validateKnowledgeRecommendationCitationScope({
        candidates: [
          {
            knowledgeNodePublicId: "knowledge-node-1",
            citationChunkPublicIds: ["chunk-1"],
          },
        ],
        knowledgeNodeIdByPublicId,
        citationScopeKeys: validScope,
      }),
    ).toBe(true);
    expect(
      validateKnowledgeRecommendationCitationScope({
        candidates: [
          {
            knowledgeNodePublicId: "knowledge-node-1",
            citationChunkPublicIds: ["chunk-2"],
          },
        ],
        knowledgeNodeIdByPublicId,
        citationScopeKeys: validScope,
      }),
    ).toBe(false);
  });

  it("contains no deterministic production matcher or first-page candidate fallback", () => {
    const source = readFileSync(
      resolve(
        process.cwd(),
        "src/server/services/content-question-material-runtime.ts",
      ),
      "utf8",
    );

    expect(source).not.toContain("localKnowledgeRecommendationRunner");
    expect(source).not.toContain('providerKey: "local_deterministic"');
    expect(source).not.toContain("Local deterministic fallback candidate");
    expect(source).not.toMatch(
      /recommendKnowledgeNodes[\s\S]{0,4000}pageSize:\s*100/u,
    );
    expect(source).toContain("requestKnowledgeRecommendation");
  });
});

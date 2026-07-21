import { describe, expect, it } from "vitest";

import {
  createBlockedRagKnowledgeExecutionHandoff,
  createRagKnowledgeRetrievalHandler,
} from "@/server/services/rag-knowledge/route-handlers";
import { createInMemoryRagKnowledgeRepository } from "@/server/repositories/rag-knowledge/in-memory-rag-knowledge-repository";
import { parseRagKnowledgeRetrievalRequest } from "@/server/validators/rag-knowledge/retrieval-governance";

const rawDocumentMarker = "synthetic-raw-resource-body-marker";

describe("RAG knowledge layering and retrieval governance", () => {
  it("returns governed citation metadata without leaking raw retrieval payloads", async () => {
    const repository = createInMemoryRagKnowledgeRepository({
      chunks: [
        {
          chunkPublicId: "chunk-exact",
          resourcePublicId: "resource-exact",
          resourceTitle: "Marketing Resource",
          resourceStatus: "rag_ready",
          profession: "marketing",
          levelList: [3],
          headingPath: ["Marketing", "Topic Alpha"],
          chunkIndex: 1,
          text: `${rawDocumentMarker} topic alpha exact`,
          textHash: "hash-exact",
          keywordScore: 0.95,
          semanticScore: 0.95,
          privateFileUrl: "https://private.invalid/resource-exact",
          embeddingVector: [0.1, 0.2, 0.3],
          internalDebugSnapshot: { shadow: "internal shadow" },
        },
        {
          chunkPublicId: "chunk-general",
          resourcePublicId: "resource-general",
          resourceTitle: "General Marketing Resource",
          resourceStatus: "rag_ready",
          profession: "marketing",
          levelList: [],
          headingPath: ["Marketing", "General"],
          chunkIndex: 2,
          text: `${rawDocumentMarker} topic alpha general`,
          textHash: "hash-general",
          isStale: true,
          keywordScore: 0.9,
          semanticScore: 0.9,
        },
        {
          chunkPublicId: "chunk-unauthorized",
          resourcePublicId: "resource-unauthorized",
          resourceTitle: "Unauthorized Resource",
          resourceStatus: "rag_ready",
          profession: "marketing",
          levelList: [3],
          headingPath: ["Marketing", "Hidden"],
          chunkIndex: 3,
          text: "topic alpha hidden",
          textHash: "hash-unauthorized",
          keywordScore: 1,
          semanticScore: 1,
        },
        {
          chunkPublicId: "chunk-draft",
          resourcePublicId: "resource-draft",
          resourceTitle: "Draft Resource",
          resourceStatus: "draft",
          profession: "marketing",
          levelList: [3],
          headingPath: ["Marketing", "Draft"],
          chunkIndex: 4,
          text: "topic alpha draft",
          textHash: "hash-draft",
          keywordScore: 1,
          semanticScore: 1,
        },
        {
          chunkPublicId: "chunk-wrong-profession",
          resourcePublicId: "resource-logistics",
          resourceTitle: "Logistics Resource",
          resourceStatus: "rag_ready",
          profession: "logistics",
          levelList: [3],
          headingPath: ["Logistics", "Routing"],
          chunkIndex: 5,
          text: "topic alpha logistics",
          textHash: "hash-logistics",
          keywordScore: 1,
          semanticScore: 1,
        },
      ],
    });
    const handler = createRagKnowledgeRetrievalHandler({ repository });

    const response = await handler.retrieve({
      aiFuncType: "kn_recommendation",
      authorizedResourcePublicIds: ["resource-exact", "resource-general"],
      level: 3,
      profession: "marketing",
      query: "topic alpha",
      retrievalMode: "hybrid_rerank",
    });

    expect(response.code).toBe("OK");
    expect(response.message).toBe("success");

    if (response.code !== "OK") {
      throw new Error("expected RAG knowledge retrieval success response");
    }

    expect(response.data.evidenceStatus).toBe("sufficient");
    expect(response.data.citations).toHaveLength(2);
    expect(
      response.data.citations.map((citation) => citation.resourcePublicId),
    ).toEqual(["resource-exact", "resource-general"]);
    expect(response.data.citations[0]).toEqual({
      chunkIndex: 1,
      chunkPublicId: "chunk-exact",
      displayPath: "Marketing > Topic Alpha",
      headingPath: ["Marketing", "Topic Alpha"],
      isStale: false,
      resourcePublicId: "resource-exact",
      resourceTitle: "Marketing Resource",
      score: expect.any(Number),
      textHash: "hash-exact",
    });
    expect(response.data.evidenceSummary).toEqual({
      chunkIndexes: [1, 2],
      chunkPublicIds: ["chunk-exact", "chunk-general"],
      citationCount: 2,
      evidenceStatus: "sufficient",
      maxScore: expect.any(Number),
      queryHash: expect.stringMatching(/^[a-f0-9]{64}$/),
      resourcePublicIds: ["resource-exact", "resource-general"],
      retrievalMode: "hybrid_rerank",
      staleCitationCount: 1,
      staleResourcePublicIds: ["resource-general"],
      textHashes: ["hash-exact", "hash-general"],
    });
    expect(response.data.executionHandoff).toEqual(
      createBlockedRagKnowledgeExecutionHandoff(),
    );

    const serializedResponse = JSON.stringify(response);

    expect(serializedResponse).not.toContain(rawDocumentMarker);
    expect(serializedResponse).not.toContain("private.invalid");
    expect(serializedResponse).not.toContain("embeddingVector");
    expect(serializedResponse).not.toContain("internal shadow");
    expect(serializedResponse).not.toContain("chunkText");
  });

  it("rejects unsupported AI functions before retrieval execution", async () => {
    expect(
      parseRagKnowledgeRetrievalRequest({
        aiFuncType: "learning_suggestion",
        authorizedResourcePublicIds: ["resource-exact"],
        level: 3,
        profession: "marketing",
        query: "topic alpha",
      }),
    ).toEqual({
      errorCode: "UNSUPPORTED_RAG_KNOWLEDGE_AI_FUNCTION",
      message: "RAG knowledge retrieval is not approved for this AI function",
      success: false,
    });

    const handler = createRagKnowledgeRetrievalHandler({
      repository: createInMemoryRagKnowledgeRepository({ chunks: [] }),
    });
    const response = await handler.retrieve({
      aiFuncType: "learning_suggestion",
      authorizedResourcePublicIds: ["resource-exact"],
      level: 3,
      profession: "marketing",
      query: "topic alpha",
    });

    expect(response).toEqual({
      code: "BAD_REQUEST",
      data: {
        errorCode: "UNSUPPORTED_RAG_KNOWLEDGE_AI_FUNCTION",
      },
      message: "RAG knowledge retrieval is not approved for this AI function",
    });
  });
});

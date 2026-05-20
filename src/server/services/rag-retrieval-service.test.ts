import { describe, expect, it } from "vitest";

import { buildRagRetrievalContextForAi } from "./rag-retrieval-service";

describe("RAG retrieval service", () => {
  it("filters authorization before returning AI-ready chunk text", () => {
    const result = buildRagRetrievalContextForAi({
      query: "marketing customer demand",
      profession: "marketing",
      level: 3,
      authorizedResourcePublicIds: ["authorized_resource_public_id"],
      candidates: [
        {
          chunkPublicId: "unauthorized_chunk_public_id",
          resourcePublicId: "unauthorized_resource_public_id",
          resourceTitle: "Unauthorized Resource",
          resourceStatus: "rag_ready",
          profession: "marketing",
          level: 3,
          headingPath: ["Private"],
          chunkIndex: 1,
          text: "Unauthorized chunk text must not reach AI.",
          textHash: "unauthorized_text_hash",
          keywordScore: 1,
          semanticScore: 1,
        },
        {
          chunkPublicId: "authorized_chunk_public_id",
          resourcePublicId: "authorized_resource_public_id",
          resourceTitle: "Authorized Resource",
          resourceStatus: "rag_ready",
          profession: "marketing",
          level: 3,
          headingPath: ["Allowed"],
          chunkIndex: 2,
          text: "Authorized chunk text may be used by AI.",
          textHash: "authorized_text_hash",
          keywordScore: 0.8,
          semanticScore: 0.8,
        },
      ],
    });

    const serializedEvidenceSummary = JSON.stringify(result.evidenceSummary);

    expect(result.evidenceStatus).toBe("weak");
    expect(result.citations).toHaveLength(1);
    expect(result.citations[0]).toMatchObject({
      chunkPublicId: "authorized_chunk_public_id",
      resourcePublicId: "authorized_resource_public_id",
      chunkText: "Authorized chunk text may be used by AI.",
    });
    expect(JSON.stringify(result.citations)).not.toContain(
      "Unauthorized chunk text",
    );
    expect(serializedEvidenceSummary).not.toContain("Authorized chunk text");
    expect(serializedEvidenceSummary).not.toContain("Unauthorized chunk text");
  });
});

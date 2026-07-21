import { describe, expect, it } from "vitest";

import { buildResourceChunks } from "./rag-chunking-service";

describe("RAG chunking service", () => {
  it("chunks only published or rag_ready resources with markdown content", () => {
    const publishedResult = buildResourceChunks({
      resourcePublicId: "published_resource_public_id",
      resourceTitle: "Published Resource",
      resourceStatus: "published",
      profession: "marketing",
      levelList: [],
      markdownContent: "# Published\n\nContent ready for initial indexing.",
      markdownContentHash: "published_markdown_hash",
    });

    const readyResult = buildResourceChunks({
      resourcePublicId: "ready_resource_public_id",
      resourceTitle: "Ready Resource",
      resourceStatus: "rag_ready",
      profession: "marketing",
      levelList: [4, 5],
      markdownContent: "# Ready\n\nContent ready for rebuild.",
      markdownContentHash: "ready_markdown_hash",
    });

    const draftResult = buildResourceChunks({
      resourcePublicId: "draft_resource_public_id",
      resourceTitle: "Draft Resource",
      resourceStatus: "draft",
      profession: "marketing",
      level: 4,
      markdownContent: "# Draft\n\nContent must not be chunked.",
      markdownContentHash: "draft_markdown_hash",
    });

    expect(publishedResult.status).toBe("chunked");
    expect(readyResult.status).toBe("chunked");
    expect(draftResult).toMatchObject({
      status: "skipped",
      skippedReason: "resource_status_not_chunkable",
      chunks: [],
    });
  });

  it("returns redaction-safe evidence summaries from the service boundary", () => {
    const result = buildResourceChunks({
      resourcePublicId: "resource_public_id",
      resourceTitle: "Evidence Resource",
      resourceStatus: "published",
      profession: "marketing",
      level: 3,
      markdownContent: "# Evidence\n\nPrivate chunk text for indexing only.",
      markdownContentHash: "markdown_hash",
    });

    const serializedSummary = JSON.stringify(result.evidenceSummary);

    expect(result.evidenceSummary.chunkCount).toBe(1);
    expect(serializedSummary).not.toContain("Private chunk text");
    expect(serializedSummary).not.toContain(result.chunks[0].text);
  });
});

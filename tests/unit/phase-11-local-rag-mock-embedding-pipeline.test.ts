import { describe, expect, it } from "vitest";

import {
  buildLocalRagMockEmbeddingPipeline,
  buildLocalRagMockRetrievalContext,
} from "@/server/services/local-rag-mock-embedding-pipeline";
import type {
  LocalTextDocumentParseResult,
  ParsedLocalTextDocumentAsset,
} from "@/server/services/local-text-document-parser";

function createParsedDocument(
  markdownContent: string,
): ParsedLocalTextDocumentAsset {
  return {
    status: "parsed",
    parserMode: "local_only",
    source: {
      objectKey: "dev/paper-asset/marketing/202605/local-controlled.md",
      fileName: "local-controlled.md",
      extension: "md",
      contentType: "text/markdown",
    },
    markdownContent,
    markdownContentHash: "controlled_markdown_hash",
    charLength: markdownContent.length,
    lineCount: markdownContent.split("\n").length,
    chunkCandidateCount: 2,
    headingPaths: [["Marketing"], ["Marketing", "Retail Rules"]],
    evidenceSummary: {
      objectKey: "dev/paper-asset/marketing/202605/local-controlled.md",
      fileName: "local-controlled.md",
      extension: "md",
      contentType: "text/markdown",
      parserMode: "local_only",
      markdownContentHash: "controlled_markdown_hash",
      charLength: markdownContent.length,
      lineCount: markdownContent.split("\n").length,
      chunkCandidateCount: 2,
      headingPaths: [["Marketing"], ["Marketing", "Retail Rules"]],
      redactedPreview: "[redacted:controlled]",
    },
  };
}

describe("phase 11 local RAG mock embedding pipeline", () => {
  it("builds deterministic local embeddings from parsed markdown with redacted evidence", () => {
    const parsedDocument = createParsedDocument(
      [
        "# Marketing",
        "",
        "Controlled marketing keyword content for local rag indexing.",
        "",
        "## Retail Rules",
        "",
        "Controlled retail scenario content for citations.",
      ].join("\n"),
    );

    const firstRun = buildLocalRagMockEmbeddingPipeline({
      parsedDocument,
      resourcePublicId: "resource-local-rag-001",
      resourceTitle: "Local RAG Controlled Resource",
      resourceStatus: "published",
      profession: "marketing",
      level: 3,
    });
    const secondRun = buildLocalRagMockEmbeddingPipeline({
      parsedDocument,
      resourcePublicId: "resource-local-rag-001",
      resourceTitle: "Local RAG Controlled Resource",
      resourceStatus: "published",
      profession: "marketing",
      level: 3,
    });

    expect(firstRun.status).toBe("indexed");
    expect(firstRun.embeddingMode).toBe("local_mock");
    expect(firstRun.embeddedChunks.length).toBeGreaterThan(0);
    expect(firstRun.embeddedChunks).toEqual(secondRun.embeddedChunks);
    expect(firstRun.embeddedChunks[0]).toMatchObject({
      embeddingDimension: 8,
      embeddingModel: "local_mock_hash_v1",
      resourcePublicId: "resource-local-rag-001",
    });
    expect(JSON.stringify(firstRun.evidenceSummary)).not.toContain(
      "Controlled marketing keyword content",
    );
    expect(JSON.stringify(firstRun.evidenceSummary)).not.toContain(
      firstRun.embeddedChunks[0].embedding.join(","),
    );
  });

  it("builds citation retrieval from local embedded chunks while preserving evidence redaction", () => {
    const parsedDocument = createParsedDocument(
      [
        "# Marketing",
        "",
        "Authorized marketing citation keyword appears here.",
        "",
        "## Retail Rules",
        "",
        "Retail citation details stay internal to retrieval.",
      ].join("\n"),
    );
    const pipeline = buildLocalRagMockEmbeddingPipeline({
      parsedDocument,
      resourcePublicId: "resource-local-authorized",
      resourceTitle: "Authorized Local RAG Resource",
      resourceStatus: "rag_ready",
      profession: "marketing",
      level: 3,
    });

    if (pipeline.status !== "indexed") {
      throw new Error(`Expected indexed pipeline, got ${pipeline.status}.`);
    }

    const retrieval = buildLocalRagMockRetrievalContext({
      query: "marketing citation keyword",
      profession: "marketing",
      level: 3,
      authorizedResourcePublicIds: ["resource-local-authorized"],
      embeddedChunks: pipeline.embeddedChunks,
    });
    const serializedEvidence = JSON.stringify(retrieval.evidenceSummary);

    expect(retrieval.evidenceStatus).toBe("weak");
    expect(retrieval.citations.length).toBeGreaterThan(0);
    expect(retrieval.citations[0]).toMatchObject({
      resourcePublicId: "resource-local-authorized",
    });
    expect(serializedEvidence).not.toContain("Authorized marketing citation");
    expect(serializedEvidence).not.toContain(
      "Retail citation details stay internal",
    );
  });

  it("does not create embeddings from skipped parser results", () => {
    const skippedDocument: LocalTextDocumentParseResult = {
      status: "skipped",
      parserMode: "local_only",
      skippedReason: "unsupported_extension",
      source: {
        objectKey: "dev/paper-asset/marketing/202605/local-controlled.pdf",
        fileName: "local-controlled.pdf",
        extension: "pdf",
      },
    };

    const pipeline = buildLocalRagMockEmbeddingPipeline({
      parsedDocument: skippedDocument,
      resourcePublicId: "resource-local-skipped",
      resourceTitle: "Skipped Local RAG Resource",
      resourceStatus: "published",
      profession: "marketing",
      level: 3,
    });

    expect(pipeline).toEqual({
      status: "skipped",
      embeddingMode: "local_mock",
      skippedReason: "parser_skipped",
      embeddedChunks: [],
      evidenceSummary: {
        embeddingMode: "local_mock",
        status: "skipped",
        skippedReason: "parser_skipped",
        chunkCount: 0,
        embeddingDimension: 0,
        resourcePublicIds: [],
        chunkPublicIds: [],
        textHashes: [],
      },
    });
  });
});

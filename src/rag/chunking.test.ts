import { describe, expect, it } from "vitest";

import {
  createRagChunks,
  defaultRagChunkingConfig,
  shouldChunkResource,
  summarizeRagChunksForEvidence,
  type RagChunkingInput,
} from "./chunking";

const baseInput = {
  resourcePublicId: "resource_public_id",
  resourceTitle: "Marketing Basics",
  resourceStatus: "published",
  profession: "marketing",
  levelList: [3, 4],
  markdownContentHash: "markdown_hash",
} satisfies Omit<RagChunkingInput, "markdownContent">;

describe("RAG chunking", () => {
  it("keeps heading metadata, stable chunk order, and deterministic chunk identifiers", () => {
    const result = createRagChunks(
      {
        ...baseInput,
        markdownContent: [
          "# Marketing Basics",
          "",
          "Short overview paragraph.",
          "",
          "## Customer analysis",
          "",
          [
            "Customer demand discovery starts with interviews and purchase records.",
            "The research team compares repeated buying patterns across districts.",
            "Operators then classify demand signals by profession, level, and scenario.",
            "The same evidence should remain readable after splitting.",
          ].join(" "),
          "",
          "A short closing note.",
        ].join("\n"),
      },
      {
        ...defaultRagChunkingConfig,
        targetChunkSize: 140,
        chunkOverlapSize: 24,
        minChunkSize: 40,
      },
    );

    expect(result.status).toBe("chunked");
    expect(result.skippedReason).toBeNull();
    expect(result.chunks.length).toBeGreaterThanOrEqual(2);
    expect(result.chunks.map((chunk) => chunk.chunkIndex)).toEqual(
      result.chunks.map((_, index) => index + 1),
    );
    expect(result.chunks[0]).toMatchObject({
      resourcePublicId: "resource_public_id",
      resourceTitle: "Marketing Basics",
      profession: "marketing",
      levelList: [3, 4],
      headingPath: ["Marketing Basics"],
      chunkIndex: 1,
    });
    expect(
      result.chunks.some((chunk) =>
        chunk.headingPath.join(" / ").includes("Customer analysis"),
      ),
    ).toBe(true);
    expect(result.chunks.every((chunk) => chunk.textHash.length === 64)).toBe(
      true,
    );
    expect(
      result.chunks.every((chunk) => chunk.chunkPublicId.length === 64),
    ).toBe(true);

    const repeatedResult = createRagChunks(
      {
        ...baseInput,
        markdownContent: [
          "# Marketing Basics",
          "",
          "Short overview paragraph.",
          "",
          "## Customer analysis",
          "",
          [
            "Customer demand discovery starts with interviews and purchase records.",
            "The research team compares repeated buying patterns across districts.",
            "Operators then classify demand signals by profession, level, and scenario.",
            "The same evidence should remain readable after splitting.",
          ].join(" "),
          "",
          "A short closing note.",
        ].join("\n"),
      },
      {
        ...defaultRagChunkingConfig,
        targetChunkSize: 140,
        chunkOverlapSize: 24,
        minChunkSize: 40,
      },
    );

    expect(repeatedResult.chunks.map((chunk) => chunk.chunkPublicId)).toEqual(
      result.chunks.map((chunk) => chunk.chunkPublicId),
    );
  });

  it("merges short paragraphs and splits long text with overlap without losing metadata", () => {
    const result = createRagChunks(
      {
        ...baseInput,
        resourceStatus: "rag_ready",
        markdownContent: [
          "# Knowledge Base",
          "",
          "## Service posture",
          "",
          "Tiny note one.",
          "",
          "Tiny note two.",
          "",
          [
            "Structured service review keeps staff focused on the relevant policy.",
            "It separates confirmed evidence from weak observations before a report is written.",
            "That distinction protects students from fabricated citations.",
            "The chunker must preserve enough neighboring words for retrieval context.",
          ].join(" "),
        ].join("\n"),
      },
      {
        ...defaultRagChunkingConfig,
        targetChunkSize: 120,
        chunkOverlapSize: 20,
        minChunkSize: 45,
      },
    );

    expect(result.status).toBe("chunked");
    expect(result.chunks[0].text).toContain("Tiny note one.");
    expect(result.chunks[0].text).toContain("Tiny note two.");
    expect(result.chunks.length).toBeGreaterThan(1);
    expect(result.chunks.at(-1)?.headingPath).toEqual([
      "Knowledge Base",
      "Service posture",
    ]);
    expect(
      result.chunks
        .slice(1)
        .some((chunk) => chunk.text.includes("fabricated citations")),
    ).toBe(true);
  });

  it("skips resources that are not published or rag_ready and skips missing markdown", () => {
    expect(shouldChunkResource("published")).toEqual({
      canChunk: true,
      skippedReason: null,
    });
    expect(shouldChunkResource("rag_ready")).toEqual({
      canChunk: true,
      skippedReason: null,
    });
    expect(shouldChunkResource("disabled")).toEqual({
      canChunk: false,
      skippedReason: "resource_status_not_chunkable",
    });
    expect(shouldChunkResource("draft")).toEqual({
      canChunk: false,
      skippedReason: "resource_status_not_chunkable",
    });

    expect(
      createRagChunks({
        ...baseInput,
        resourceStatus: "disabled",
        markdownContent: "# Disabled",
      }),
    ).toMatchObject({
      status: "skipped",
      skippedReason: "resource_status_not_chunkable",
      chunks: [],
    });

    expect(
      createRagChunks({
        ...baseInput,
        markdownContent: "   ",
      }),
    ).toMatchObject({
      status: "skipped",
      skippedReason: "missing_markdown_content",
      chunks: [],
    });
  });

  it("summarizes chunks for evidence without exposing raw chunk text", () => {
    const result = createRagChunks({
      ...baseInput,
      markdownContent:
        "# Evidence\n\nSensitive source paragraph for indexing only.",
    });

    const summary = summarizeRagChunksForEvidence(result.chunks);
    const serializedSummary = JSON.stringify(summary);

    expect(summary.chunkCount).toBe(1);
    expect(summary.chunkIndexes).toEqual([1]);
    expect(summary.textHashes).toEqual([result.chunks[0].textHash]);
    expect(summary.totalCharLength).toBe(result.chunks[0].charLength);
    expect(serializedSummary).not.toContain("Sensitive source paragraph");
    expect(serializedSummary).not.toContain(result.chunks[0].text);
  });
});

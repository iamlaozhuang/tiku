import { describe, expect, it } from "vitest";

import { createRagChunks, type RagChunkingInput } from "@/rag/chunking";
import { buildRagRetrievalContextFromChunks } from "@/server/services/rag-retrieval-service";

const chunkInput = {
  resourcePublicId: "resource-public-chinese",
  resourceTitle: "许可证办理教材",
  resourceStatus: "published",
  profession: "monopoly",
  levelList: [3],
  markdownContentHash: "markdown-hash-chinese",
} satisfies Omit<RagChunkingInput, "markdownContent">;

function rebuildOverlappingText(
  chunks: readonly { text: string }[],
  overlapSize: number,
): string {
  return chunks
    .slice(1)
    .reduce(
      (rebuilt, chunk) => rebuilt + chunk.text.slice(overlapSize),
      chunks[0]?.text ?? "",
    );
}

function createRetrievalChunk(text: string) {
  return {
    chunkPublicId: "chunk-public-chinese",
    resourcePublicId: "resource-public-chinese",
    resourceTitle: "许可证办理教材",
    resourceStatus: "rag_ready" as const,
    profession: "monopoly" as const,
    levelList: [3],
    headingPath: ["证件管理", "许可证办理"],
    chunkIndex: 1,
    text,
    textHash: "text-hash-chinese",
  };
}

describe("F-0089 Chinese RAG chunking and keyword fallback", () => {
  it("bounds a continuous Chinese paragraph while preserving deterministic overlap and heading metadata", () => {
    const paragraph =
      "办理烟草专卖许可证需要核验申请主体资格经营场所证明材料完整性并记录审查依据。".repeat(
        8,
      );
    const config = {
      targetChunkSize: 64,
      chunkOverlapSize: 8,
      minChunkSize: 16,
    };
    const first = createRagChunks(
      {
        ...chunkInput,
        markdownContent: `# 证件管理\n\n${paragraph}`,
      },
      config,
    );
    const repeated = createRagChunks(
      {
        ...chunkInput,
        markdownContent: `# 证件管理\n\n${paragraph}`,
      },
      config,
    );

    expect(first.status).toBe("chunked");
    expect(first.chunks.length).toBeGreaterThan(1);
    expect(first.chunks.every((chunk) => chunk.text.length <= 64)).toBe(true);
    expect(
      first.chunks.every((chunk) => chunk.headingPath[0] === "证件管理"),
    ).toBe(true);
    expect(rebuildOverlappingText(first.chunks, 8)).toBe(paragraph);
    expect(repeated.chunks.map((chunk) => chunk.chunkPublicId)).toEqual(
      first.chunks.map((chunk) => chunk.chunkPublicId),
    );
  });

  it("never recreates an oversized chunk when a short paragraph precedes long mixed text", () => {
    const mixedText = `前言。${"许可证🙂ABC123办理要求与申请材料核验".repeat(20)}`;
    const result = createRagChunks(
      {
        ...chunkInput,
        markdownContent: `# 办理要求\n\n短说明。\n\n${mixedText}`,
      },
      {
        targetChunkSize: 48,
        chunkOverlapSize: 6,
        minChunkSize: 20,
      },
    );

    expect(result.chunks.length).toBeGreaterThan(2);
    expect(result.chunks.every((chunk) => chunk.text.length <= 48)).toBe(true);
    expect(
      result.chunks.every((chunk) =>
        Array.from(chunk.text).every(
          (character) =>
            character.length > 1 || !/[\uD800-\uDFFF]/u.test(character),
        ),
      ),
    ).toBe(true);
  });

  it("matches partial and reordered Chinese phrases without changing authorization filters", () => {
    const authorizedChunk = createRetrievalChunk(
      "办理许可证时需要核验申请主体资格与完整申请材料。",
    );
    const result = buildRagRetrievalContextFromChunks({
      query: "申请材料与许可证办理",
      profession: "monopoly",
      level: 3,
      authorizedResourcePublicIds: ["resource-public-chinese"],
      chunks: [
        authorizedChunk,
        {
          ...authorizedChunk,
          chunkPublicId: "chunk-public-unauthorized",
          resourcePublicId: "resource-public-unauthorized",
          text: "申请材料与许可证办理完全匹配但不在授权范围。",
        },
      ],
    });

    expect(result.citations).toHaveLength(1);
    expect(result.citations[0]).toMatchObject({
      chunkPublicId: "chunk-public-chinese",
      resourcePublicId: "resource-public-chinese",
    });
    expect(result.citations[0].score).toBeGreaterThan(0.4);
  });
});

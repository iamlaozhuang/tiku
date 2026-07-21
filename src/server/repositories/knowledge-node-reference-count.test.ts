import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it, vi } from "vitest";

import { listKnowledgeNodeQuestionCounts } from "./knowledge-node-reference-count";

const contentRepositorySource = readFileSync(
  resolve(
    process.cwd(),
    "src/server/repositories/content-knowledge-node-runtime-repository.ts",
  ),
  "utf8",
);
const ragRepositorySource = readFileSync(
  resolve(
    process.cwd(),
    "src/server/repositories/rag-resource-knowledge-runtime-repository.ts",
  ),
  "utf8",
);

describe("F-0070 knowledge_node question reference count", () => {
  it("loads all durable bindings for a page in one grouped query", async () => {
    const groupBy = vi.fn(async () => [
      { knowledgeNodeId: 11, value: 3 },
      { knowledgeNodeId: 12, value: 1 },
    ]);
    const where = vi.fn(() => ({ groupBy }));
    const from = vi.fn(() => ({ where }));
    const select = vi.fn(() => ({ from }));

    const counts = await listKnowledgeNodeQuestionCounts(
      { select } as never,
      [11, 12, 13],
    );

    expect(Array.from(counts.entries())).toEqual([
      [11, 3],
      [12, 1],
    ]);
    expect(select).toHaveBeenCalledOnce();
    expect(from).toHaveBeenCalledOnce();
    expect(where).toHaveBeenCalledOnce();
    expect(groupBy).toHaveBeenCalledOnce();
    expect(counts.get(13) ?? 0).toBe(0);
  });

  it("does not query when the returned page is empty", async () => {
    const select = vi.fn();

    await expect(
      listKnowledgeNodeQuestionCounts({ select } as never, []),
    ).resolves.toEqual(new Map());
    expect(select).not.toHaveBeenCalled();
  });

  it("fails closed instead of publishing a fabricated zero when the aggregate query fails", async () => {
    const aggregateFailure = new Error("aggregate unavailable");
    const database = {
      select: vi.fn(() => ({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            groupBy: vi.fn(async () => {
              throw aggregateFailure;
            }),
          })),
        })),
      })),
    };

    await expect(
      listKnowledgeNodeQuestionCounts(database as never, [11]),
    ).rejects.toBe(aggregateFailure);
  });

  it("uses the same aggregate in both production repositories and every non-create projection", () => {
    expect(contentRepositorySource).toContain(
      "listKnowledgeNodeQuestionCounts",
    );
    expect(contentRepositorySource).not.toContain("questionCount: 0");
    expect(ragRepositorySource).not.toContain("questionCount: 0");
    expect(
      ragRepositorySource.match(/listKnowledgeNodeQuestionCounts/gu)?.length ??
        0,
    ).toBeGreaterThanOrEqual(4);
  });

  it("counts association rows without filtering disabled questions out of lifecycle impact", () => {
    const helperSource = readFileSync(
      resolve(
        process.cwd(),
        "src/server/repositories/knowledge-node-reference-count.ts",
      ),
      "utf8",
    );

    expect(helperSource).toContain("questionKnowledgeNode");
    expect(helperSource).not.toContain("question.status");
  });
});

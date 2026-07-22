import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  buildKnowledgeNodeSubtreeMutationPlan,
  KnowledgeNodeMutationConflictError,
} from "@/server/repositories/rag-resource-knowledge-runtime-repository";
import { parseKnowledgeNodeUpdateInput } from "@/server/validators/rag-resource-knowledge";

const repositoryPath = join(
  process.cwd(),
  "src/server/repositories/rag-resource-knowledge-runtime-repository.ts",
);
const runtimePath = join(
  process.cwd(),
  "src/server/services/rag-resource-knowledge-runtime.ts",
);

describe("F-0069 knowledge_node subtree move and rename atomicity", () => {
  it("requires one canonical optimistic updatedAt token for every update", () => {
    expect(
      parseKnowledgeNodeUpdateInput({
        name: "新的目标名称",
      }),
    ).toBeNull();
    expect(
      parseKnowledgeNodeUpdateInput({
        expectedUpdatedAt: "2026-07-21",
        name: "新的目标名称",
      }),
    ).toBeNull();
    expect(
      parseKnowledgeNodeUpdateInput({
        expectedUpdatedAt: "2026-07-21T12:00:00.000Z",
        name: "新的目标名称",
      }),
    ).toEqual({
      expectedUpdatedAt: "2026-07-21T12:00:00.000Z",
      name: "新的目标名称",
    });
  });

  it("projects a renamed and moved root across every descendant", () => {
    expect(
      buildKnowledgeNodeSubtreeMutationPlan({
        current: {
          id: 10,
          depth: 2,
          pathName: "营销/旧目标",
        },
        nextName: "新目标",
        nextParent: {
          id: 20,
          depth: 2,
          pathName: "物流/客户服务",
        },
        subtree: [
          {
            id: 10,
            parentKnowledgeNodeId: 1,
            depth: 2,
            pathName: "营销/旧目标",
          },
          {
            id: 11,
            parentKnowledgeNodeId: 10,
            depth: 3,
            pathName: "营销/旧目标/需求",
          },
          {
            id: 12,
            parentKnowledgeNodeId: 11,
            depth: 4,
            pathName: "营销/旧目标/需求/分析",
          },
        ],
      }),
    ).toEqual({
      depthDelta: 1,
      rootDepth: 3,
      rootPathName: "物流/客户服务/新目标",
      rows: [
        {
          id: 10,
          depth: 3,
          pathName: "物流/客户服务/新目标",
        },
        {
          id: 11,
          depth: 4,
          pathName: "物流/客户服务/新目标/需求",
        },
        {
          id: 12,
          depth: 5,
          pathName: "物流/客户服务/新目标/需求/分析",
        },
      ],
    });
  });

  it("rejects cycles, corrupt subtree identities, and a final depth above five", () => {
    const baseInput = {
      current: { id: 10, depth: 2, pathName: "营销/旧目标" },
      nextName: "新目标",
      subtree: [
        {
          id: 10,
          parentKnowledgeNodeId: 1,
          depth: 2,
          pathName: "营销/旧目标",
        },
        {
          id: 11,
          parentKnowledgeNodeId: 10,
          depth: 3,
          pathName: "营销/旧目标/需求",
        },
        {
          id: 12,
          parentKnowledgeNodeId: 11,
          depth: 4,
          pathName: "营销/旧目标/需求/分析",
        },
      ],
    };

    expect(() =>
      buildKnowledgeNodeSubtreeMutationPlan({
        ...baseInput,
        nextParent: { id: 12, depth: 4, pathName: "营销/旧目标/需求/分析" },
      }),
    ).toThrowError(
      new KnowledgeNodeMutationConflictError("knowledge_node_cycle"),
    );

    expect(() =>
      buildKnowledgeNodeSubtreeMutationPlan({
        ...baseInput,
        nextParent: { id: 30, depth: 3, pathName: "营销/更深/父级" },
      }),
    ).toThrowError(
      new KnowledgeNodeMutationConflictError(
        "knowledge_node_subtree_depth_exceeded",
      ),
    );

    expect(() =>
      buildKnowledgeNodeSubtreeMutationPlan({
        ...baseInput,
        nextParent: null,
        subtree: [
          baseInput.subtree[0],
          {
            id: 11,
            parentKnowledgeNodeId: 10,
            depth: 3,
            pathName: "其他错误路径/需求",
          },
        ],
      }),
    ).toThrowError(
      new KnowledgeNodeMutationConflictError(
        "knowledge_node_subtree_identity_mismatch",
      ),
    );

    expect(() =>
      buildKnowledgeNodeSubtreeMutationPlan({
        ...baseInput,
        nextParent: null,
        subtree: [
          baseInput.subtree[0],
          baseInput.subtree[1],
          {
            id: 13,
            parentKnowledgeNodeId: 10,
            depth: 3,
            pathName: "营销/旧目标/需求",
          },
        ],
      }),
    ).toThrowError(
      new KnowledgeNodeMutationConflictError("knowledge_node_path_conflict"),
    );

    expect(() =>
      buildKnowledgeNodeSubtreeMutationPlan({
        ...baseInput,
        nextParent: null,
        subtree: [
          baseInput.subtree[0],
          {
            id: 11,
            parentKnowledgeNodeId: 999,
            depth: 3,
            pathName: "营销/旧目标/需求",
          },
        ],
      }),
    ).toThrowError(
      new KnowledgeNodeMutationConflictError(
        "knowledge_node_subtree_identity_mismatch",
      ),
    );

    expect(() =>
      buildKnowledgeNodeSubtreeMutationPlan({
        ...baseInput,
        nextParent: null,
        subtree: [
          baseInput.subtree[0],
          {
            id: 11,
            parentKnowledgeNodeId: 10,
            depth: 4,
            pathName: "营销/旧目标/需求",
          },
        ],
      }),
    ).toThrowError(
      new KnowledgeNodeMutationConflictError(
        "knowledge_node_subtree_identity_mismatch",
      ),
    );
  });

  it("keeps serialization, row locks, descendant rewrite, stale check, and audit in the repository transaction", async () => {
    const [repositorySource, runtimeSource] = await Promise.all([
      readFile(repositoryPath, "utf8"),
      readFile(runtimePath, "utf8"),
    ]);
    const updateSource = repositorySource.slice(
      repositorySource.indexOf("async updateKnowledgeNode"),
      repositorySource.indexOf("async disableKnowledgeNode"),
    );

    expect(repositorySource).toContain("pg_advisory_xact_lock");
    expect(updateSource).toContain("lockKnowledgeTreeMutation");
    expect(updateSource).toContain("listKnowledgeNodeSubtreeForUpdate");
    expect(updateSource).toContain("lockKnowledgeNodeParentChainForUpdate");
    expect(updateSource).toContain("assertKnowledgeNodeDestinationAvailable");
    expect(updateSource).toContain("currentNode.updated_at.toISOString()");
    expect(updateSource).toContain("input.expectedUpdatedAt");
    expect(updateSource).toContain("buildKnowledgeNodeSubtreeMutationPlan");
    expect(updateSource).toContain("inArray(knowledgeNode.id, subtreeIds)");
    expect(updateSource).toContain("updatedDescendantIds.size");
    expect(updateSource).toContain("appendKnowledgeNodeMutationAuditLog");
    expect(
      updateSource.indexOf("appendKnowledgeNodeMutationAuditLog"),
    ).toBeGreaterThan(
      updateSource.indexOf("inArray(knowledgeNode.id, subtreeIds)"),
    );
    expect(runtimeSource).toContain("KnowledgeNodeMutationConflictError");
    expect(runtimeSource).toContain(
      "ADMIN_CONTENT_KNOWLEDGE_ERROR_CODES.concurrentConflict",
    );
  });
});

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it, vi } from "vitest";

import { createPostgresRagResourceKnowledgeRuntimeRepositories } from "@/server/repositories/rag-resource-knowledge-runtime-repository";

const repositorySource = readFileSync(
  resolve(
    process.cwd(),
    "src/server/repositories/rag-resource-knowledge-runtime-repository.ts",
  ),
  "utf8",
);
const runtimeSource = readFileSync(
  resolve(
    process.cwd(),
    "src/server/services/rag-resource-knowledge-runtime.ts",
  ),
  "utf8",
);

function readMethodSource(methodName: string): string {
  const methodStart = repositorySource.indexOf(`async ${methodName}`);
  const nextMethodStart = repositorySource.indexOf(
    "\n    async ",
    methodStart + 1,
  );

  expect(methodStart, `${methodName} exists`).toBeGreaterThan(-1);
  return repositorySource.slice(
    methodStart,
    nextMethodStart === -1 ? undefined : nextMethodStart,
  );
}

describe("F-0031 knowledge_node audit atomicity partition", () => {
  it.each([
    "createKnowledgeNode",
    "updateKnowledgeNode",
    "disableKnowledgeNode",
  ])(
    "keeps %s and its redacted success audit inside one repository transaction",
    (methodName) => {
      const methodSource = readMethodSource(methodName);

      expect(methodSource).toContain(
        "database.transaction(async (transaction)",
      );
      expect(methodSource).toContain("appendKnowledgeNodeMutationAuditLog(");
    },
  );

  it("persists only the fixed redacted success-audit projection", () => {
    const helperStart = repositorySource.indexOf(
      "async function appendKnowledgeNodeMutationAuditLog",
    );
    const helperSource = repositorySource.slice(
      helperStart,
      repositorySource.indexOf("\nfunction ", helperStart + 1),
    );

    expect(helperStart).toBeGreaterThan(-1);
    expect(helperSource).toContain('target_resource_type: "knowledge_node"');
    expect(helperSource).toContain('result_status: "success"');
    expect(helperSource).toContain("metadata_summary:");
    expect(helperSource).not.toContain("input.name");
    expect(helperSource).not.toContain("path_name");
  });

  it("fails closed when repository callers omit mutation audit context", () => {
    const repositoryContract = repositorySource.slice(
      repositorySource.indexOf("export type RagKnowledgeNodeRuntimeRepository"),
      repositorySource.indexOf("export type ResourceKnowledgePage"),
    );

    expect(repositoryContract).not.toContain("mutationContext?:");
    expect(repositorySource).not.toContain(
      "mutationContext: KnowledgeNodeMutationContext | undefined",
    );
  });

  it("propagates audit insertion failure from the same disable transaction", async () => {
    const auditFailure = new Error("audit unavailable");
    const returning = vi.fn(async () => [
      {
        id: 11,
        public_id: "knowledge-node-public-1",
        parent_knowledge_node_id: null,
        profession: "monopoly",
        level_list: [3],
        name: "许可证办理",
        path_name: "许可证办理",
        sort_order: 10,
        kn_status: "disabled",
        is_recommendable: false,
        updated_at: new Date("2026-07-21T00:00:00.000Z"),
      },
    ]);
    const transactionDatabase = {
      select: vi.fn(() => ({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn(async () => [
              {
                id: 11,
                public_id: "knowledge-node-public-1",
                parent_knowledge_node_id: null,
                knowledge_base_id: 7,
                profession: "monopoly",
                level_list: [3],
                name: "许可证办理",
                path_name: "许可证办理",
                depth: 1,
                sort_order: 10,
                updated_at: new Date("2026-07-21T00:00:00.000Z"),
              },
            ]),
          })),
        })),
      })),
      execute: vi.fn(async () => undefined),
      update: vi.fn(() => ({
        set: vi.fn(() => ({
          where: vi.fn(() => ({ returning })),
        })),
      })),
      insert: vi.fn(() => ({
        values: vi.fn(async () => {
          throw auditFailure;
        }),
      })),
    };
    const transaction = vi.fn(
      async (callback: (database: unknown) => Promise<unknown>) =>
        callback(transactionDatabase),
    );
    const repositories = createPostgresRagResourceKnowledgeRuntimeRepositories({
      createDatabase: () => ({ transaction }) as never,
    });

    await expect(
      repositories.knowledgeNodeRepository.disableKnowledgeNode(
        "knowledge-node-public-1",
        {
          actorPublicId: "admin-public-1",
          auditLog: {
            actorRole: "content_admin",
            actionType: "knowledge_node.disable",
            metadataSummary: "redacted knowledge_node disable metadata",
            requestIp: "127.0.0.1",
          },
        },
      ),
    ).rejects.toBe(auditFailure);
    expect(transaction).toHaveBeenCalledOnce();
    expect(returning).toHaveBeenCalledOnce();
    expect(transactionDatabase.insert).toHaveBeenCalledOnce();
  });

  it("passes request-derived audit context to all repository mutations", () => {
    for (const [methodName, actionType] of [
      ["createKnowledgeNode", "knowledge_node.create"],
      ["updateKnowledgeNode", "knowledge_node.update"],
      ["disableKnowledgeNode", "knowledge_node.disable"],
    ]) {
      const callStart = runtimeSource.indexOf(
        `knowledgeNodeRepository.${methodName}`,
      );
      const callSource = runtimeSource.slice(callStart, callStart + 700);

      expect(callStart, `${methodName} call exists`).toBeGreaterThan(-1);
      expect(callSource).toContain("createKnowledgeNodeMutationContext(");
      expect(callSource).toContain(`"${actionType}"`);
      expect(callSource).toContain("redacted knowledge_node");
    }
  });

  it("keeps external audit writes for failed knowledge_node commands only", () => {
    const knowledgeNodeHandlers = runtimeSource.slice(
      runtimeSource.indexOf("knowledgeNodes: {"),
    );

    expect(knowledgeNodeHandlers).toContain("if (response.code !== 0)");
    expect(knowledgeNodeHandlers).not.toMatch(
      /resultStatus: response\.code === 0 \? "success" : "failed"/u,
    );
  });
});

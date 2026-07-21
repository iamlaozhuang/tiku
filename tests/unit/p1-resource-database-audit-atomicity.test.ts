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

function readRepositoryMethod(methodName: string): string {
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

describe("F-0031 resource database audit atomicity partition", () => {
  it.each([
    "updateResourceMarkdown",
    "publishResourceMarkdown",
    "disableResource",
    "enableResource",
  ])("keeps %s and its success audit in one transaction", (methodName) => {
    const methodSource = readRepositoryMethod(methodName);

    expect(methodSource).toContain("database.transaction(async (transaction)");
    expect(methodSource).toContain("await appendResourceMutationAuditLog(");
  });

  it("keeps the durable rebuild request and success audit in one transaction", () => {
    const methodStart = repositorySource.indexOf(
      "async function requestResourceIndexRebuild",
    );
    const methodSource = repositorySource.slice(
      methodStart,
      repositorySource.indexOf(
        "\nasync function completeResourceIndexGeneration",
        methodStart,
      ),
    );

    expect(methodStart).toBeGreaterThan(-1);
    expect(methodSource).toContain("database.transaction(async (transaction)");
    expect(methodSource).toContain("await appendResourceMutationAuditLog(");
    expect(methodSource).toContain("replayed: true");
    expect(methodSource).toContain("replayed: false");
  });

  it("requires audit context for every in-scope repository command", () => {
    const contractSource = repositorySource.slice(
      repositorySource.indexOf("export type RagResourceRuntimeRepository"),
      repositorySource.indexOf("export type RagKnowledgeNodeRuntimeRepository"),
    );

    for (const methodName of [
      "updateResourceMarkdown",
      "publishResourceMarkdown",
      "requestResourceIndexRebuild",
      "disableResource",
      "enableResource",
    ]) {
      const methodStart = contractSource.indexOf(`${methodName}`);
      const methodSource = contractSource.slice(methodStart, methodStart + 350);

      expect(methodStart, `${methodName} contract exists`).toBeGreaterThan(-1);
      expect(methodSource).toContain("ResourceMutationContext");
      expect(methodSource).not.toContain("mutationContext?:");
    }
  });

  it("writes a fixed redacted success audit projection", () => {
    const helperStart = repositorySource.indexOf(
      "async function appendResourceMutationAuditLog",
    );
    const helperSource = repositorySource.slice(
      helperStart,
      repositorySource.indexOf("\nfunction ", helperStart + 1),
    );

    expect(helperStart).toBeGreaterThan(-1);
    expect(helperSource).toContain('target_resource_type: "resource"');
    expect(helperSource).toContain('result_status: "success"');
    expect(helperSource).toContain("metadata_summary:");
    expect(helperSource).not.toContain("markdownContent");
    expect(helperSource).not.toContain("originalFileName");
  });

  it("propagates audit insertion failure from the same disable transaction", async () => {
    const auditFailure = new Error("audit unavailable");
    const resourceRow = {
      id: 11,
      public_id: "resource-public-1",
      title: "许可证办理",
      resource_type: "markdown",
      resource_status: "disabled",
      profession: "monopoly",
      level: 3,
      level_list: [3],
      disabled_at: new Date("2026-07-21T00:00:00.000Z"),
      created_at: new Date("2026-07-20T00:00:00.000Z"),
      updated_at: new Date("2026-07-21T00:00:00.000Z"),
    };
    const select = vi
      .fn()
      .mockReturnValueOnce({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn(() => ({
              for: vi.fn(async () => [{ id: resourceRow.id }]),
            })),
          })),
        })),
      })
      .mockReturnValueOnce({
        from: vi.fn(() => ({
          innerJoin: vi.fn(() => ({
            where: vi.fn(() => ({
              orderBy: vi.fn(async () => []),
            })),
          })),
        })),
      });
    const update = vi
      .fn()
      .mockReturnValueOnce({
        set: vi.fn(() => ({ where: vi.fn(async () => undefined) })),
      })
      .mockReturnValueOnce({
        set: vi.fn(() => ({
          where: vi.fn(() => ({
            returning: vi.fn(async () => [resourceRow]),
          })),
        })),
      });
    const transactionDatabase = {
      select,
      update,
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
      repositories.resourceRepository.disableResource?.("resource-public-1", {
        actorPublicId: "admin-public-1",
        auditLog: {
          actorRole: "content_admin",
          actionType: "resource.disable",
          metadataSummary: "redacted resource disable metadata",
          requestIp: "127.0.0.1",
        },
      }),
    ).rejects.toBe(auditFailure);
    expect(transaction).toHaveBeenCalledOnce();
    expect(update).toHaveBeenCalledTimes(2);
    expect(transactionDatabase.insert).toHaveBeenCalledOnce();
  });

  it("suppresses duplicate external success audit only for database mutations", () => {
    expect(runtimeSource).toContain('successAuditLocation: "database"');
    expect(runtimeSource).toContain('successAuditLocation: "external"');
    expect(runtimeSource).toMatch(
      /result\.response\.code !== 0 \|\|\s+result\.successAuditLocation === "external"/u,
    );
    expect(runtimeSource).toContain(
      'metadataSummary: "redacted local resource enable metadata"',
    );
  });
});

import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { createPostgresAdminAiAuditLogRuntimeRepositories } from "@/server/repositories/admin-ai-audit-log-runtime-repository";

type LockedModelConfigRow = {
  public_id: string;
  ai_func_type: string;
};

function createTransactionDatabase(input: {
  lockedRows: LockedModelConfigRow[];
  updatedPublicIds?: string[];
  updateError?: Error;
}) {
  let transactionCount = 0;
  let transactionExecuteCount = 0;
  let outsideTransactionExecuteCount = 0;
  let didCommit = false;
  let didRollback = false;

  const transaction = {
    async execute() {
      transactionExecuteCount += 1;

      if (transactionExecuteCount === 1) {
        return [];
      }

      if (transactionExecuteCount === 2) {
        return input.lockedRows;
      }

      if (input.updateError !== undefined) {
        throw input.updateError;
      }

      return (input.updatedPublicIds ?? []).map((publicId) => ({
        public_id: publicId,
      }));
    },
  };
  const database = {
    async execute() {
      outsideTransactionExecuteCount += 1;
      throw new Error("model_config reorder escaped its transaction");
    },
    async transaction<T>(
      callback: (executor: typeof transaction) => Promise<T>,
    ) {
      transactionCount += 1;

      try {
        const result = await callback(transaction);
        didCommit = true;
        return result;
      } catch (error) {
        didRollback = true;
        throw error;
      }
    },
  };

  return {
    database,
    getEvidence: () => ({
      transactionCount,
      transactionExecuteCount,
      outsideTransactionExecuteCount,
      didCommit,
      didRollback,
    }),
  };
}

const reorderInput = {
  items: [
    { publicId: "model-config-public-001", fallbackPriority: 10 },
    { publicId: "model-config-public-002", fallbackPriority: 20 },
  ],
};

describe("F-0105 model_config fallback aggregate", () => {
  it("locks and updates one exact homogeneous reorder set in one transaction", async () => {
    const harness = createTransactionDatabase({
      lockedRows: [
        {
          public_id: "model-config-public-001",
          ai_func_type: "ai_explanation",
        },
        {
          public_id: "model-config-public-002",
          ai_func_type: "ai_explanation",
        },
      ],
      updatedPublicIds: ["model-config-public-001", "model-config-public-002"],
    });
    const repositories = createPostgresAdminAiAuditLogRuntimeRepositories({
      createDatabase: () => harness.database as never,
    });

    await expect(
      repositories.reorderModelConfigFallback?.(reorderInput),
    ).resolves.toBe(true);
    expect(harness.getEvidence()).toEqual({
      transactionCount: 1,
      transactionExecuteCount: 3,
      outsideTransactionExecuteCount: 0,
      didCommit: true,
      didRollback: false,
    });
  });

  it("fails closed before update when any id is missing or the set mixes functions", async () => {
    for (const lockedRows of [
      [
        {
          public_id: "model-config-public-001",
          ai_func_type: "ai_explanation",
        },
      ],
      [
        {
          public_id: "model-config-public-001",
          ai_func_type: "ai_explanation",
        },
        {
          public_id: "model-config-public-002",
          ai_func_type: "ai_hint",
        },
      ],
    ]) {
      const harness = createTransactionDatabase({ lockedRows });
      const repositories = createPostgresAdminAiAuditLogRuntimeRepositories({
        createDatabase: () => harness.database as never,
      });

      await expect(
        repositories.reorderModelConfigFallback?.(reorderInput),
      ).resolves.toBe(false);
      expect(harness.getEvidence()).toEqual({
        transactionCount: 1,
        transactionExecuteCount: 2,
        outsideTransactionExecuteCount: 0,
        didCommit: true,
        didRollback: false,
      });
    }
  });

  it("lets the database transaction roll back an update failure", async () => {
    const harness = createTransactionDatabase({
      lockedRows: [
        {
          public_id: "model-config-public-001",
          ai_func_type: "ai_explanation",
        },
        {
          public_id: "model-config-public-002",
          ai_func_type: "ai_explanation",
        },
      ],
      updateError: new Error("synthetic update failure"),
    });
    const repositories = createPostgresAdminAiAuditLogRuntimeRepositories({
      createDatabase: () => harness.database as never,
    });

    await expect(
      repositories.reorderModelConfigFallback?.(reorderInput),
    ).rejects.toThrow("synthetic update failure");
    expect(harness.getEvidence()).toEqual({
      transactionCount: 1,
      transactionExecuteCount: 3,
      outsideTransactionExecuteCount: 0,
      didCommit: false,
      didRollback: true,
    });
  });

  it("rolls back and reports failure when the update count is not exact", async () => {
    const harness = createTransactionDatabase({
      lockedRows: [
        {
          public_id: "model-config-public-001",
          ai_func_type: "ai_explanation",
        },
        {
          public_id: "model-config-public-002",
          ai_func_type: "ai_explanation",
        },
      ],
      updatedPublicIds: ["model-config-public-001"],
    });
    const repositories = createPostgresAdminAiAuditLogRuntimeRepositories({
      createDatabase: () => harness.database as never,
    });

    await expect(
      repositories.reorderModelConfigFallback?.(reorderInput),
    ).resolves.toBe(false);
    expect(harness.getEvidence()).toEqual({
      transactionCount: 1,
      transactionExecuteCount: 3,
      outsideTransactionExecuteCount: 0,
      didCommit: false,
      didRollback: true,
    });
  });

  it("guards create and update fallback references at the SQL mutation boundary", () => {
    const repositorySource = readFileSync(
      "src/server/repositories/admin-ai-audit-log-runtime-repository.ts",
      "utf8",
    );

    expect(repositorySource).toContain("fallback.ai_func_type =");
    expect(repositorySource).toContain("fallback.public_id <>");
    expect(repositorySource).toContain("with recursive fallback_chain");
    expect(repositorySource).toContain("pg_advisory_xact_lock");
    expect(repositorySource).toContain("incoming_fallback");
    expect(repositorySource).toContain("existing.fallback_priority");
    expect(repositorySource).toContain("select distinct ai_func_type");
  });
});

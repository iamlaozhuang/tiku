import { readFileSync } from "node:fs";

import type { SQL } from "drizzle-orm";
import { getTableConfig } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";

import { modelConfig } from "@/db/schema/ai-rag";
import {
  calculateEstimatedCostCny,
  createModelConfigSnapshot,
} from "@/server/models/ai-rag";
import {
  createPostgresAdminAiAuditLogRuntimeRepositories,
  type AdminAiAuditLogRuntimeRepositoryOptions,
} from "@/server/repositories/admin-ai-audit-log-runtime-repository";
import { normalizeModelConfigInput } from "@/server/validators/ai-rag";

type CapturedSql = SQL & { queryChunks?: unknown[] };

function flattenSqlQuery(query: CapturedSql): string {
  return (query.queryChunks ?? [])
    .map((chunk) => {
      if (
        typeof chunk === "object" &&
        chunk !== null &&
        "queryChunks" in chunk &&
        Array.isArray((chunk as { queryChunks?: unknown }).queryChunks)
      ) {
        return flattenSqlQuery(chunk as CapturedSql);
      }

      if (
        typeof chunk === "object" &&
        chunk !== null &&
        "value" in chunk &&
        Array.isArray((chunk as { value?: unknown }).value)
      ) {
        return (chunk as { value: unknown[] }).value.join("");
      }

      if (typeof chunk === "object" && chunk !== null && "value" in chunk) {
        return String((chunk as { value: unknown }).value);
      }

      return String(chunk);
    })
    .join("");
}

function createDatabaseCapture(capturedQueries: CapturedSql[]) {
  const createDatabase: NonNullable<
    AdminAiAuditLogRuntimeRepositoryOptions["createDatabase"]
  > = () =>
    ({
      async execute(query: CapturedSql) {
        capturedQueries.push(query);
        if (flattenSqlQuery(query).includes("insert into ai_call_log")) {
          return [{ public_id: "ai-call-log-persisted" }];
        }
        return [];
      },
    }) as unknown as ReturnType<
      NonNullable<AdminAiAuditLogRuntimeRepositoryOptions["createDatabase"]>
    >;

  return createDatabase;
}

function createCompleteModelConfigInput() {
  return {
    aiFuncType: "scoring",
    configVersion: 2,
    displayName: "Scoring v2",
    fallbackModelConfigPublicId: null,
    fallbackPriority: 0,
    inputTokenPriceCnyPerMillion: "2.000000",
    isEnabled: true,
    maxRetryCount: 1,
    modelAlias: "scoring-v2",
    modelName: "scoring-v2",
    modelProviderPublicId: "model-provider-public-001",
    outputTokenPriceCnyPerMillion: "8.000000",
    pricingVersion: "2026-07-contract-v1",
    status: "enabled",
    timeoutSecond: 30,
  };
}

function createPricedSnapshot() {
  return createModelConfigSnapshot({
    aiFuncType: "scoring",
    configVersion: 2,
    displayName: "Scoring v2",
    fallbackModelConfigPublicId: null,
    inputTokenPriceCnyPerMillion: "2.000000",
    maxRetryCount: 1,
    modelConfigPublicId: "model-config-public-001",
    modelName: "scoring-v2",
    outputTokenPriceCnyPerMillion: "8.000000",
    pricingVersion: "2026-07-contract-v1",
    promptTemplateKey: "ai-scoring-v2",
    promptTemplateVersion: 2,
    providerDisplayName: "Synthetic Provider",
    providerKey: "synthetic",
    providerPublicId: "model-provider-public-001",
    timeoutSecond: 30,
  });
}

describe("F-0038 versioned AI call pricing", () => {
  it("generates an additive schema-only migration with a fail-closed tuple constraint", () => {
    const migrationSource = readFileSync(
      "drizzle/20260721233000_p1_rc_04_ai_call_log_versioned_pricing.sql",
      "utf8",
    );

    expect(migrationSource).toContain('ADD COLUMN "pricing_version" text');
    expect(migrationSource).toContain(
      'ADD COLUMN "input_token_price_cny_per_million" numeric(18, 6)',
    );
    expect(migrationSource).toContain(
      'ADD CONSTRAINT "model_config_pricing_tuple_check"',
    );
    expect(migrationSource).toContain(
      '"input_token_price_cny_per_million" is not null',
    );
    expect(migrationSource).not.toMatch(/\b(?:insert|update|delete)\b/iu);
  });

  it("persists a nullable all-or-none versioned pricing tuple on model_config", () => {
    const table = getTableConfig(modelConfig);

    expect(table.columns.map((column) => column.name)).toEqual(
      expect.arrayContaining([
        "pricing_version",
        "input_token_price_cny_per_million",
        "output_token_price_cny_per_million",
      ]),
    );
    expect(table.checks.map((check) => check.name)).toContain(
      "model_config_pricing_tuple_check",
    );
  });

  it("normalizes only complete non-negative pricing tuples", () => {
    expect(
      normalizeModelConfigInput(createCompleteModelConfigInput()),
    ).toMatchObject({
      inputTokenPriceCnyPerMillion: "2.000000",
      outputTokenPriceCnyPerMillion: "8.000000",
      pricingVersion: "2026-07-contract-v1",
    });
    expect(
      normalizeModelConfigInput({
        ...createCompleteModelConfigInput(),
        outputTokenPriceCnyPerMillion: null,
      }),
    ).toBeNull();
    expect(
      normalizeModelConfigInput({
        ...createCompleteModelConfigInput(),
        inputTokenPriceCnyPerMillion: "-1",
      }),
    ).toBeNull();
    expect(
      normalizeModelConfigInput({
        ...createCompleteModelConfigInput(),
        inputTokenPriceCnyPerMillion: "1e3",
      }),
    ).toBeNull();
  });

  it("copies the versioned tuple into the immutable execution snapshot", () => {
    const originalSnapshot = createPricedSnapshot();
    const revisedSnapshot = createModelConfigSnapshot({
      ...originalSnapshot,
      pricingVersion: "2026-08-contract-v2",
      inputTokenPriceCnyPerMillion: "4.000000",
      outputTokenPriceCnyPerMillion: "16.000000",
    });

    expect(originalSnapshot).toMatchObject({
      inputTokenPriceCnyPerMillion: "2.000000",
      outputTokenPriceCnyPerMillion: "8.000000",
      pricingVersion: "2026-07-contract-v1",
    });
    expect(revisedSnapshot).toMatchObject({
      inputTokenPriceCnyPerMillion: "4.000000",
      outputTokenPriceCnyPerMillion: "16.000000",
      pricingVersion: "2026-08-contract-v2",
    });
    expect(originalSnapshot.pricingVersion).toBe("2026-07-contract-v1");
  });

  it("calculates exact fixed-point cost and rounds half-up at six decimals", () => {
    const snapshot = createPricedSnapshot();

    expect(
      calculateEstimatedCostCny({
        completionTokenCount: 500_000,
        modelConfigSnapshot: snapshot,
        promptTokenCount: 1_000_000,
      }),
    ).toBe("6.000000");
    expect(
      calculateEstimatedCostCny({
        completionTokenCount: 0,
        modelConfigSnapshot: {
          ...snapshot,
          inputTokenPriceCnyPerMillion: "0.500000",
          outputTokenPriceCnyPerMillion: "0.000000",
        },
        promptTokenCount: 1,
      }),
    ).toBe("0.000001");
    expect(
      calculateEstimatedCostCny({
        completionTokenCount: 0,
        modelConfigSnapshot: snapshot,
        promptTokenCount: 0,
      }),
    ).toBe("0.000000");
  });

  it("fails closed when either token count or any pricing fact is absent", () => {
    const snapshot = createPricedSnapshot();

    expect(
      calculateEstimatedCostCny({
        completionTokenCount: null,
        modelConfigSnapshot: snapshot,
        promptTokenCount: 100,
      }),
    ).toBeNull();
    expect(
      calculateEstimatedCostCny({
        completionTokenCount: 100,
        modelConfigSnapshot: {
          ...snapshot,
          pricingVersion: null,
        },
        promptTokenCount: 100,
      }),
    ).toBeNull();
    expect(
      calculateEstimatedCostCny({
        completionTokenCount: 100,
        modelConfigSnapshot: {
          ...snapshot,
          pricingVersion: " ",
        },
        promptTokenCount: 100,
      }),
    ).toBeNull();
  });

  it("derives persisted and returned cost centrally for failed calls", async () => {
    const capturedQueries: CapturedSql[] = [];
    const repositories = createPostgresAdminAiAuditLogRuntimeRepositories({
      createDatabase: createDatabaseCapture(capturedQueries),
    });

    const result = await repositories.appendAiCallLog({
      aiFuncType: "ai_scoring",
      answerRecordPublicId: null,
      callStatus: "failed",
      citationRedactedSnapshot: null,
      completedAt: new Date("2026-07-21T01:00:01.000Z"),
      completionTokenCount: 500_000,
      estimatedCostCny: "0.000000",
      errorRedactedSnapshot: {},
      latencyMs: 1_000,
      level: null,
      mockExamPublicId: null,
      modelConfigSnapshot: createPricedSnapshot(),
      organizationPublicId: null,
      profession: null,
      promptTemplateKey: "ai-scoring-v2",
      promptTemplateVersion: 2,
      promptTokenCount: 1_000_000,
      questionPublicId: null,
      requestRedactedSnapshot: {},
      responseRedactedSnapshot: null,
      startedAt: new Date("2026-07-21T01:00:00.000Z"),
      totalTokenCount: 1_500_000,
      userPublicId: "user-public-001",
    });

    expect(flattenSqlQuery(capturedQueries[0])).toContain("6.000000");
    expect(result.estimatedCostCny).toBe("6.000000");
  });
});

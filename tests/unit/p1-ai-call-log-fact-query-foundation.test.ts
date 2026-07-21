import type { SQL } from "drizzle-orm";
import { getTableConfig } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";

import { aiCallLog } from "@/db/schema/ai-rag";
import { createAdminAiAuditLogListQuery } from "@/server/contracts/admin-ai-audit-log-ops-contract";
import {
  createPostgresAdminAiAuditLogRuntimeRepositories,
  type AdminAiAuditLogRuntimeRepositoryOptions,
} from "@/server/repositories/admin-ai-audit-log-runtime-repository";
import { createAiCallLogRouteHandlers } from "@/server/services/ai-call-log/route-handlers";
import type { SessionService } from "@/server/services/session-service";

type CapturedSql = SQL & {
  queryChunks?: unknown[];
};

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
        const queryText = flattenSqlQuery(query);

        if (queryText.includes("as bucket")) {
          return [
            {
              ai_func_type: "scoring",
              bucket: "2026-07-01",
              call_count: 2,
              estimated_cost_cny: "0.420000",
              failed_count: 1,
              model_alias: "qwen-plus",
              provider_display_name: "Qwen",
              success_count: 1,
              total_token_count: 2100,
            },
          ];
        }

        if (queryText.includes("count(*)")) {
          return [{ value: 1 }];
        }

        if (queryText.includes("from ai_call_log")) {
          return [
            {
              public_id: "ai-call-log-public-001",
              user_public_id: "user-public-001",
              organization_public_id: "organization-public-001",
              profession: "marketing",
              level: 3,
              answer_record_public_id: null,
              mock_exam_public_id: null,
              question_public_id: null,
              ai_func_type: "scoring",
              call_status: "success",
              model_config_snapshot: {
                providerDisplayName: "Qwen",
                modelName: "qwen-plus",
              },
              request_redacted_snapshot: {},
              response_redacted_snapshot: {},
              error_redacted_snapshot: null,
              citation_redacted_snapshot: null,
              prompt_token_count: 1200,
              completion_token_count: 900,
              total_token_count: 2100,
              estimated_cost_cny: "0.420000",
              latency_ms: 840,
              started_at: "2026-07-01T01:00:00.000Z",
              completed_at: "2026-07-01T01:00:00.840Z",
            },
          ];
        }

        return [];
      },
    }) as ReturnType<
      NonNullable<AdminAiAuditLogRuntimeRepositoryOptions["createDatabase"]>
    >;

  return createDatabase;
}

function createAdminSessionService(): Pick<
  SessionService,
  "getCurrentSession"
> {
  return {
    async getCurrentSession() {
      return {
        code: 0,
        data: {
          session: { expiresAt: "2026-07-22T00:00:00.000Z" },
          user: {
            adminPublicId: "admin-public-001",
            adminRoles: ["ops_admin" as const],
            employeePublicId: null,
            lockedUntilAt: null,
            name: "Ops Admin",
            organizationPublicId: null,
            phone: "13900000001",
            publicId: "user-public-admin-001",
            status: "active" as const,
            userType: null,
          },
        },
        message: "ok",
      };
    },
  };
}

describe("F-0038 AI call log fact and query foundation", () => {
  it("declares durable fact dimensions, captured cost, and filter indexes", () => {
    const table = getTableConfig(aiCallLog);
    const columnNames = table.columns.map((column) => column.name);
    const indexNames = table.indexes.map((index) => index.config.name);

    expect(columnNames).toEqual(
      expect.arrayContaining([
        "organization_public_id",
        "profession",
        "level",
        "estimated_cost_cny",
      ]),
    );
    expect(indexNames).toEqual(
      expect.arrayContaining([
        "idx_ai_call_log_organization_public_id",
        "idx_ai_call_log_profession_level",
      ]),
    );
  });

  it("persists captured dimensions and cost instead of returning hardcoded null and zero", async () => {
    const capturedQueries: CapturedSql[] = [];
    const repositories = createPostgresAdminAiAuditLogRuntimeRepositories({
      createDatabase: createDatabaseCapture(capturedQueries),
    });

    const result = await repositories.appendAiCallLog({
      userPublicId: "user-public-001",
      organizationPublicId: "organization-public-001",
      profession: "marketing",
      level: 3,
      estimatedCostCny: "0.420000",
      answerRecordPublicId: null,
      mockExamPublicId: null,
      questionPublicId: null,
      aiFuncType: "ai_scoring",
      callStatus: "success",
      modelConfigSnapshot: {
        modelConfigPublicId: "model-config-public-001",
        providerPublicId: "provider-public-001",
        providerDisplayName: "Qwen",
        providerKey: "qwen",
        modelName: "qwen-plus",
        configVersion: 1,
        promptTemplateKey: "ai-scoring-v1",
        promptTemplateVersion: 1,
        timeoutSecond: 30,
        maxRetryCount: 1,
      },
      promptTemplateKey: "ai-scoring-v1",
      promptTemplateVersion: 1,
      requestRedactedSnapshot: {},
      responseRedactedSnapshot: {},
      errorRedactedSnapshot: null,
      citationRedactedSnapshot: null,
      promptTokenCount: 1200,
      completionTokenCount: 900,
      totalTokenCount: 2100,
      latencyMs: 840,
      startedAt: new Date("2026-07-01T01:00:00.000Z"),
      completedAt: new Date("2026-07-01T01:00:00.840Z"),
    } as never);
    const insertSql = flattenSqlQuery(capturedQueries[0]);

    expect(insertSql).toContain("organization_public_id");
    expect(insertSql).toContain("estimated_cost_cny");
    expect(result).toMatchObject({
      organizationPublicId: "organization-public-001",
      profession: "marketing",
      level: 3,
      estimatedCostCny: "0.420000",
    });
  });

  it("pushes every fact and time filter into both page and authoritative count SQL", async () => {
    const capturedQueries: CapturedSql[] = [];
    const repositories = createPostgresAdminAiAuditLogRuntimeRepositories({
      createDatabase: createDatabaseCapture(capturedQueries),
    });

    const result = await repositories.listAiCallLogs({
      ...createAdminAiAuditLogListQuery({
        aiFuncType: "ai_scoring",
        callStatus: "success",
        profession: "marketing",
        level: 3,
      }),
      organizationPublicId: "organization-public-001",
      userPublicId: "user-public-001",
      fromStartedAt: "2026-07-01T00:00:00.000Z",
      toStartedAt: "2026-07-31T23:59:59.999Z",
    } as never);
    const listSql = flattenSqlQuery(capturedQueries[0]);
    const countSql = flattenSqlQuery(capturedQueries[1]);

    for (const expectedFragment of [
      "organization_public_id = organization-public-001",
      "user_public_id = user-public-001",
      "profession = marketing::profession",
      "level = 3",
      "started_at >= 2026-07-01T00:00:00.000Z",
      "started_at <= 2026-07-31T23:59:59.999Z",
    ]) {
      expect(listSql).toContain(expectedFragment);
      expect(countSql).toContain(expectedFragment);
    }
    expect(result).toMatchObject({
      aiCallLogs: [
        {
          organizationPublicId: "organization-public-001",
          profession: "marketing",
          level: 3,
          estimatedCostCny: "0.420000",
        },
      ],
      pagination: { total: 1 },
    });
  });

  it("aggregates the full filtered relation by day or month without a 100-row list cap", async () => {
    const capturedQueries: CapturedSql[] = [];
    const repositories = createPostgresAdminAiAuditLogRuntimeRepositories({
      createDatabase: createDatabaseCapture(capturedQueries),
    });

    const result = await repositories.summarizeAiCallLogs({
      ...createAdminAiAuditLogListQuery({ page: 1, pageSize: 20 }),
      bucketType: "month",
      organizationPublicId: "organization-public-001",
      fromStartedAt: "2026-07-01T00:00:00.000Z",
      toStartedAt: "2026-07-31T23:59:59.999Z",
    } as never);
    const summarySql = flattenSqlQuery(capturedQueries[0]);
    const countSql = flattenSqlQuery(capturedQueries[1]);

    expect(summarySql).toContain("date_trunc('month', started_at)");
    expect(summarySql).toContain("sum(estimated_cost_cny)");
    expect(summarySql).toContain(
      "organization_public_id = organization-public-001",
    );
    expect(summarySql).not.toContain("limit 100");
    expect(countSql).toContain("group by");
    expect(result).toMatchObject({
      dailySummaries: [
        {
          bucket: "2026-07-01",
          bucketType: "month",
          callCount: 2,
          estimatedCostCny: "0.420000",
        },
      ],
      pagination: { total: 1 },
    });
  });

  it("makes the canonical summary route delegate to repository aggregation", async () => {
    const capturedQueries: unknown[] = [];
    const handlers = createAiCallLogRouteHandlers({
      repository: {
        async listAiCallLogs() {
          throw new Error("summary route must not aggregate a paginated list");
        },
        async summarizeAiCallLogs(query: unknown) {
          capturedQueries.push(query);

          return {
            dailySummaries: [
              {
                bucket: "2026-07-01",
                bucketType: "month",
                aiFuncType: "ai_scoring",
                providerDisplayName: "Qwen",
                modelAlias: "qwen-plus",
                callCount: 2,
                successCount: 1,
                failedCount: 1,
                totalTokenCount: 2100,
                estimatedCostCny: "0.420000",
              },
            ],
            pagination: {
              page: 1,
              pageSize: 20,
              sortBy: "startedAt",
              sortOrder: "desc",
              total: 1,
            },
          };
        },
      } as never,
      sessionService: createAdminSessionService(),
    });

    const response = await handlers.aiCallLogSummary.GET(
      new Request(
        "http://localhost/api/v1/ai-call-logs/summary?page=1&pageSize=20&bucketType=month&organizationPublicId=organization-public-001&fromStartedAt=2026-07-01T00%3A00%3A00.000Z&toStartedAt=2026-07-31T23%3A59%3A59.999Z",
        { headers: { authorization: "Bearer synthetic-admin-session" } },
      ),
    );
    const payload = await response.json();

    expect(capturedQueries).toEqual([
      expect.objectContaining({
        bucketType: "month",
        organizationPublicId: "organization-public-001",
        fromStartedAt: "2026-07-01T00:00:00.000Z",
        toStartedAt: "2026-07-31T23:59:59.999Z",
      }),
    ]);
    expect(payload).toMatchObject({
      code: 0,
      data: {
        dailySummaries: [
          {
            bucketType: "month",
            estimatedCostCny: "0.420000",
          },
        ],
      },
      pagination: { total: 1 },
    });
  });
});

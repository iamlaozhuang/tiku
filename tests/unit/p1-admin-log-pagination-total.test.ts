import type { SQL } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import { createAdminAiAuditLogListQuery } from "@/server/contracts/admin-ai-audit-log-ops-contract";
import { createPostgresAiCallLogRepository } from "@/server/repositories/ai-call-log/postgres-ai-call-log-repository";
import { createPostgresAuditLogRepository } from "@/server/repositories/audit-log/postgres-audit-log-repository";
import type { AdminAuditLogRuntimeListQuery } from "@/server/repositories/admin-flow-runtime-repository";
import { createAdminAiAuditLogRuntimeRouteHandlers } from "@/server/services/admin-ai-audit-log-runtime";
import { createAdminFlowRuntimeRouteHandlers } from "@/server/services/admin-flow-runtime";
import type { SessionService } from "@/server/services/session-service";

type CapturedSql = SQL & { queryChunks?: unknown[] };

const now = "2026-07-20T12:00:00.000Z";

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

function createSessionService(): Pick<SessionService, "getCurrentSession"> {
  return {
    async getCurrentSession() {
      return {
        code: 0,
        message: "ok",
        data: {
          session: { expiresAt: "2026-07-20T18:00:00.000Z" },
          user: {
            publicId: "admin-user-public-001",
            phone: "13800000001",
            name: "Ops Admin",
            userType: null,
            status: "active" as const,
            lockedUntilAt: null,
            employeePublicId: null,
            organizationPublicId: null,
            adminPublicId: "admin-public-001",
            adminRoles: ["super_admin" as const, "ops_admin" as const],
          },
        },
      };
    },
  };
}

const auditLog = {
  publicId: "audit-log-public-051",
  actorPublicId: "admin-public-001",
  actorRole: "super_admin",
  actionType: "user.reset_password",
  targetResourceType: "user",
  targetPublicId: "user-public-001",
  resultStatus: "success" as const,
  metadataSummary: "redacted operation metadata",
  requestIp: null,
  createdAt: now,
};

const aiCallLog = {
  publicId: "ai-call-log-public-050",
  userPublicId: "user-public-001",
  organizationPublicId: null,
  profession: null,
  level: null,
  aiFuncType: "ai_explanation" as const,
  callStatus: "success" as const,
  providerDisplayName: "Local Mock Provider",
  modelAlias: "mock-model",
  promptSummary: "redacted prompt summary",
  outputSummary: "redacted output summary",
  promptTokenCount: 10,
  completionTokenCount: 20,
  totalTokenCount: 30,
  estimatedCostCny: "0.00",
  latencyMs: 100,
  startedAt: now,
  completedAt: now,
};

describe("F-0021 admin log pagination totals", () => {
  it("preserves the audit repository total after service filtering", async () => {
    const handlers = createAdminFlowRuntimeRouteHandlers({
      repositories: {
        auditLogRepository: {
          async appendAuditLog() {},
          async listAuditLogs(query: AdminAuditLogRuntimeListQuery) {
            return {
              auditLogs: [auditLog],
              pagination: { ...query, total: 51 },
            };
          },
        },
      } as never,
      sessionService: createSessionService(),
    });

    const response = await handlers.auditLogs.collection.GET(
      new Request(
        "http://localhost/api/v1/audit-logs?page=1&pageSize=20&actionType=user.reset_password&resultStatus=success",
        { headers: { authorization: "Bearer admin-session-token" } },
      ),
    );
    const payload = await response.json();

    expect(payload.pagination).toMatchObject({
      page: 1,
      pageSize: 20,
      total: 51,
    });
    expect(payload.data.auditLogs).toHaveLength(1);
  });

  it("preserves the AI call repository total after service filtering", async () => {
    const handlers = createAdminAiAuditLogRuntimeRouteHandlers({
      repositories: {
        listAiCallLogs: async (
          query: ReturnType<typeof createAdminAiAuditLogListQuery>,
        ) => ({
          aiCallLogs: [aiCallLog],
          pagination: { ...query, total: 50 },
        }),
      } as never,
      sessionService: createSessionService(),
    });

    const response = await handlers.aiCallLogs.GET(
      new Request(
        "http://localhost/api/v1/ai-call-logs?page=1&pageSize=20&aiFuncType=ai_explanation&callStatus=success",
        { headers: { authorization: "Bearer admin-session-token" } },
      ),
    );
    const payload = await response.json();

    expect(payload.pagination).toMatchObject({
      page: 1,
      pageSize: 20,
      total: 50,
    });
    expect(payload.data.aiCallLogs).toHaveLength(1);
  });

  it("applies canonical audit actor and time filters before page and count", async () => {
    const capturedQueries: CapturedSql[] = [];
    const repository = createPostgresAuditLogRepository({
      createDatabase: () =>
        ({
          async execute(query: CapturedSql) {
            capturedQueries.push(query);
            return flattenSqlQuery(query).includes("count(*)")
              ? [{ value: 21 }]
              : [
                  {
                    public_id: auditLog.publicId,
                    actor_public_id: auditLog.actorPublicId,
                    actor_role: auditLog.actorRole,
                    action_type: auditLog.actionType,
                    target_resource_type: auditLog.targetResourceType,
                    target_public_id: auditLog.targetPublicId,
                    result_status: auditLog.resultStatus,
                    metadata_summary: auditLog.metadataSummary,
                    request_ip: auditLog.requestIp,
                    created_at: now,
                  },
                ];
          },
        }) as never,
    });

    const result = await repository.listAuditLogs({
      actionType: "user.reset_password",
      actorPublicId: "admin-public-001",
      fromCreatedAt: "2026-07-01T00:00:00.000Z",
      keyword: null,
      page: 2,
      pageSize: 20,
      resultStatus: "success",
      sortBy: "createdAt",
      sortOrder: "desc",
      targetResourceType: "user",
      toCreatedAt: "2026-07-31T23:59:59.999Z",
    });
    const listSql = flattenSqlQuery(capturedQueries[0]);
    const countSql = flattenSqlQuery(capturedQueries[1]);

    expect(result.pagination.total).toBe(21);
    expect(listSql).toContain("actor_public_id = admin-public-001");
    expect(listSql).toContain("created_at >= 2026-07-01T00:00:00.000Z");
    expect(listSql).toContain("action_type = user.reset_password");
    expect(listSql).toContain("target_resource_type = user");
    expect(listSql).toContain("result_status = success");
    expect(listSql.indexOf("actor_public_id")).toBeLessThan(
      listSql.indexOf("limit"),
    );
    expect(countSql).toContain("actor_public_id = admin-public-001");
  });

  it("applies canonical AI user filtering before page and count", async () => {
    const capturedQueries: CapturedSql[] = [];
    const repository = createPostgresAiCallLogRepository({
      createDatabase: () =>
        ({
          async execute(query: CapturedSql) {
            capturedQueries.push(query);
            return flattenSqlQuery(query).includes("count(*)")
              ? [{ value: 51 }]
              : [
                  {
                    public_id: aiCallLog.publicId,
                    user_public_id: aiCallLog.userPublicId,
                    answer_record_public_id: null,
                    mock_exam_public_id: null,
                    question_public_id: null,
                    ai_func_type: "explanation",
                    call_status: aiCallLog.callStatus,
                    model_config_snapshot: {
                      providerDisplayName: aiCallLog.providerDisplayName,
                      modelName: aiCallLog.modelAlias,
                    },
                    request_redacted_snapshot: {},
                    response_redacted_snapshot: {},
                    error_redacted_snapshot: null,
                    citation_redacted_snapshot: null,
                    prompt_token_count: aiCallLog.promptTokenCount,
                    completion_token_count: aiCallLog.completionTokenCount,
                    total_token_count: aiCallLog.totalTokenCount,
                    latency_ms: aiCallLog.latencyMs,
                    observation_schema_version: null,
                    token_count_source: null,
                    token_estimation_method: null,
                    latency_source: null,
                    started_at: now,
                    completed_at: now,
                  },
                ];
          },
        }) as never,
    });

    const result = await repository.listAiCallLogs({
      aiFuncType: "ai_explanation",
      callStatus: "success",
      level: null,
      organizationPublicId: null,
      page: 3,
      pageSize: 20,
      profession: "all",
      sortBy: "completedAt",
      sortOrder: "desc",
      userPublicId: "user-public-001",
    });
    const listSql = flattenSqlQuery(capturedQueries[0]);
    const countSql = flattenSqlQuery(capturedQueries[1]);

    expect(result.pagination.total).toBe(51);
    expect(listSql).toContain("user_public_id = user-public-001");
    expect(listSql).toContain("order by completed_at desc");
    expect(listSql.indexOf("user_public_id")).toBeLessThan(
      listSql.indexOf("limit"),
    );
    expect(countSql).toContain("user_public_id = user-public-001");
  });
});

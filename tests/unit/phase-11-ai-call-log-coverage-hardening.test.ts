import { describe, expect, it } from "vitest";

import {
  createAdminAiAuditLogListQuery,
  type AiCallLogCostSummaryDto,
  type AiCallLogListDto,
  type ModelConfigListDto,
} from "@/server/contracts/admin-ai-audit-log-ops-contract";
import type { AdminAiAuditLogRuntimeRepositories } from "@/server/repositories/admin-ai-audit-log-runtime-repository";
import { createAdminAiAuditLogRuntimeRouteHandlers } from "@/server/services/admin-ai-audit-log-runtime";
import type { SessionService } from "@/server/services/session-service";

const now = "2026-05-24T09:30:00.000Z";

function createSessionService(): Pick<SessionService, "getCurrentSession"> {
  return {
    async getCurrentSession(input) {
      if (input.authorization !== "Bearer admin-session-token") {
        return {
          code: 401001,
          message: "Unauthorized.",
          data: null,
        };
      }

      return {
        code: 0,
        message: "ok",
        data: {
          session: { expiresAt: "2026-05-24T12:00:00.000Z" },
          user: {
            publicId: "admin-user-public-001",
            phone: "13800000001",
            name: "Ops Admin",
            userType: null,
            status: "active",
            lockedUntilAt: null,
            employeePublicId: null,
            organizationPublicId: null,
            adminPublicId: "admin-public-001",
            adminRoles: ["super_admin", "ops_admin"],
          },
        },
      };
    },
  };
}

function createRepositories(input: {
  capturedQueries: unknown[];
}): AdminAiAuditLogRuntimeRepositories {
  const aiCallLogs: AiCallLogListDto["aiCallLogs"] = [
    {
      publicId: "ai-call-log-learning-failed",
      userPublicId: "user-public-001",
      organizationPublicId: "organization-public-001",
      profession: "marketing",
      level: 3,
      aiFuncType: "learning_suggestion",
      callStatus: "failed",
      providerDisplayName: "Local Mock Provider",
      modelAlias: "mock-learning-suggestion",
      promptSummary: "redacted prompt and answer snapshot",
      outputSummary: "redacted provider error snapshot",
      promptTokenCount: 120,
      completionTokenCount: 0,
      totalTokenCount: 120,
      estimatedCostCny: "0.00",
      latencyMs: 32,
      startedAt: now,
      completedAt: now,
    },
    {
      publicId: "ai-call-log-scoring-success",
      userPublicId: "user-public-002",
      organizationPublicId: "organization-public-002",
      profession: "monopoly",
      level: 2,
      aiFuncType: "ai_scoring",
      callStatus: "success",
      providerDisplayName: "Qwen Provider",
      modelAlias: "qwen-plus",
      promptSummary: "redacted prompt and answer snapshot",
      outputSummary: "redacted scoring snapshot",
      promptTokenCount: 500,
      completionTokenCount: 100,
      totalTokenCount: 600,
      estimatedCostCny: "0.10",
      latencyMs: 88,
      startedAt: now,
      completedAt: now,
    },
  ];
  const dailySummaries: AiCallLogCostSummaryDto[] = [
    {
      bucket: "2026-05-24",
      bucketType: "day",
      aiFuncType: "learning_suggestion",
      providerDisplayName: "Local Mock Provider",
      modelAlias: "mock-learning-suggestion",
      callCount: 1,
      successCount: 0,
      failedCount: 1,
      totalTokenCount: 120,
      estimatedCostCny: "0.00",
    },
    {
      bucket: "2026-05-24",
      bucketType: "day",
      aiFuncType: "ai_scoring",
      providerDisplayName: "Qwen Provider",
      modelAlias: "qwen-plus",
      callCount: 1,
      successCount: 1,
      failedCount: 0,
      totalTokenCount: 600,
      estimatedCostCny: "0.10",
    },
  ];

  return {
    async listModelConfigs() {
      return {
        modelConfigs: [] satisfies ModelConfigListDto["modelConfigs"],
        pagination: {
          page: 1,
          pageSize: 20,
          sortBy: "updatedAt",
          sortOrder: "desc",
          total: 0,
        },
      };
    },
    async appendAiCallLog() {
      throw new Error("appendAiCallLog should not be called by list tests");
    },
    async listAiCallLogs(query) {
      input.capturedQueries.push(query);

      return {
        aiCallLogs,
        pagination: {
          page: query.page,
          pageSize: query.pageSize,
          sortBy: query.sortBy,
          sortOrder: query.sortOrder,
          total: aiCallLogs.length,
        },
      };
    },
    async summarizeAiCallLogs(query) {
      input.capturedQueries.push(query);

      return {
        dailySummaries,
        pagination: {
          page: query.page,
          pageSize: query.pageSize,
          sortBy: query.sortBy,
          sortOrder: query.sortOrder,
          total: dailySummaries.length,
        },
      };
    },
  };
}

describe("phase 11 ai_call_log coverage hardening", () => {
  it("normalizes ai_call_log filters without accepting raw fields", () => {
    const query = createAdminAiAuditLogListQuery({
      aiFuncType: " learning_suggestion ",
      callStatus: "failed",
      profession: " marketing ",
      keyword: "  mock  ",
      level: 3,
    } as Parameters<typeof createAdminAiAuditLogListQuery>[0]);

    expect(query).toMatchObject({
      aiFuncType: "learning_suggestion",
      callStatus: "failed",
      profession: "marketing",
      keyword: "mock",
      level: 3,
    });
    expect(query).not.toHaveProperty("requestBody");
    expect(query).not.toHaveProperty("authorization");
    expect(query).not.toHaveProperty("providerPayload");
  });

  it("filters ai_call_logs by function, status, profession, level, and keyword", async () => {
    const capturedQueries: unknown[] = [];
    const handlers = createAdminAiAuditLogRuntimeRouteHandlers({
      repositories: createRepositories({ capturedQueries }),
      sessionService: createSessionService(),
    });

    const response = await handlers.aiCallLogs.GET(
      new Request(
        "http://localhost/api/v1/ai-call-logs?page=1&pageSize=20&keyword=mock&aiFuncType=learning_suggestion&callStatus=failed&profession=marketing&level=3",
        { headers: { authorization: "Bearer admin-session-token" } },
      ),
    );
    const payload = await response.json();

    expect(capturedQueries[0]).toMatchObject({
      aiFuncType: "learning_suggestion",
      callStatus: "failed",
      profession: "marketing",
      level: 3,
      keyword: "mock",
    });
    expect(payload).toMatchObject({
      code: 0,
      data: {
        aiCallLogs: [
          expect.objectContaining({
            publicId: "ai-call-log-learning-failed",
            aiFuncType: "learning_suggestion",
            callStatus: "failed",
            profession: "marketing",
            level: 3,
            promptSummary: "redacted prompt and answer snapshot",
            outputSummary: "redacted provider error snapshot",
          }),
        ],
      },
      pagination: {
        total: 1,
      },
    });
    expect(payload.data.aiCallLogs).toHaveLength(1);
    expect(JSON.stringify(payload)).not.toContain('"id"');
    expect(JSON.stringify(payload)).not.toContain("admin-session-token");
    expect(JSON.stringify(payload)).not.toContain("requestBody");
    expect(JSON.stringify(payload)).not.toContain("providerPayload");
    expect(JSON.stringify(payload)).not.toContain("rawModelResponse");
  });

  it("filters ai_call_log summaries without leaking raw provider details", async () => {
    const capturedQueries: unknown[] = [];
    const handlers = createAdminAiAuditLogRuntimeRouteHandlers({
      repositories: createRepositories({ capturedQueries }),
      sessionService: createSessionService(),
    });

    const response = await handlers.aiCallLogSummary.GET(
      new Request(
        "http://localhost/api/v1/ai-call-logs/summary?page=1&pageSize=20&keyword=mock&aiFuncType=learning_suggestion",
        { headers: { authorization: "Bearer admin-session-token" } },
      ),
    );
    const payload = await response.json();

    expect(capturedQueries[0]).toMatchObject({
      aiFuncType: "learning_suggestion",
      keyword: "mock",
    });
    expect(payload).toMatchObject({
      code: 0,
      data: {
        dailySummaries: [
          expect.objectContaining({
            aiFuncType: "learning_suggestion",
            providerDisplayName: "Local Mock Provider",
            modelAlias: "mock-learning-suggestion",
            callCount: 1,
            failedCount: 1,
          }),
        ],
      },
      pagination: {
        total: 1,
      },
    });
    expect(payload.data.dailySummaries).toHaveLength(1);
    expect(JSON.stringify(payload)).not.toContain('"id"');
    expect(JSON.stringify(payload)).not.toContain("admin-session-token");
    expect(JSON.stringify(payload)).not.toContain("providerPayload");
    expect(JSON.stringify(payload)).not.toContain("rawModelResponse");
  });
});

import { describe, expect, it } from "vitest";

import { createMockAiProvider } from "@/ai/mock-provider";
import type {
  AdminAiAuditLogListQuery,
  AiCallLogCostSummaryDto,
  AiCallLogSummaryDto,
  ModelConfigSummaryDto,
} from "@/server/contracts/admin-ai-audit-log-ops-contract";
import { createModelConfigSnapshot } from "@/server/models/ai-rag";
import type {
  AdminAiAuditLogRuntimeRepositories,
  AppendAiCallLogInput,
} from "@/server/repositories/admin-ai-audit-log-runtime-repository";
import { createAdminAiAuditLogRuntimeRouteHandlers } from "@/server/services/admin-ai-audit-log-runtime";
import { createAiMockProviderRuntime } from "@/server/services/ai-mock-provider-runtime";
import type { SessionService } from "@/server/services/session-service";

type AdminRole = "super_admin" | "ops_admin" | "content_admin";

const startedAt = new Date("2026-05-21T10:00:00.000Z");
const completedAt = new Date("2026-05-21T10:00:01.000Z");
const expiresAt = new Date("2027-05-21T08:00:00.000Z");
const modelConfigSnapshot = createModelConfigSnapshot({
  providerPublicId: "model-provider-dev-mock",
  providerKey: "mock",
  providerDisplayName: "本地模拟 AI",
  modelConfigPublicId: "model-config-dev-learning-suggestion",
  aiFuncType: "learning_suggestion",
  modelName: "mock-learning-suggestion",
  displayName: "本地模拟学习建议",
  configVersion: 1,
  timeoutSecond: 5,
  maxRetryCount: 0,
  fallbackModelConfigPublicId: null,
  promptTemplateKey: "dev_learning_suggestion",
  promptTemplateVersion: 1,
});
const promptTemplate = {
  promptTemplateKey: "dev_learning_suggestion",
  version: 1,
  templateHash: "dev-learning-suggestion-template-v1",
};

function createSessionService(role: AdminRole | null): SessionService {
  return {
    async login() {
      throw new Error("login should not be called by AI log routes");
    },
    async getCurrentSession(input) {
      if (
        input.authorization !== "Bearer admin-session-token" ||
        role === null
      ) {
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
          session: {
            expiresAt: expiresAt.toISOString(),
          },
          user: {
            publicId: `admin-dev-${role}`,
            phone: "13900000001",
            name: "Dev Admin",
            userType: null,
            status: "active",
            lockedUntilAt: null,
            employeePublicId: null,
            organizationPublicId: null,
            adminPublicId: `admin-dev-${role}`,
            adminRoles: [role],
          },
        },
      };
    },
  };
}

function createRepositories(): AdminAiAuditLogRuntimeRepositories {
  const aiCallLogs: AiCallLogSummaryDto[] = [];
  const modelConfigs: ModelConfigSummaryDto[] = [
    {
      publicId: modelConfigSnapshot.modelConfigPublicId,
      providerPublicId: modelConfigSnapshot.providerPublicId,
      providerDisplayName: modelConfigSnapshot.providerDisplayName,
      providerKey: modelConfigSnapshot.providerKey,
      modelName: modelConfigSnapshot.modelName,
      modelAlias: modelConfigSnapshot.modelName,
      displayName: modelConfigSnapshot.displayName,
      aiFuncType: "learning_suggestion",
      apiKeyDisplay: null,
      fallbackModelConfigPublicId: null,
      isEnabled: true,
      configVersion: modelConfigSnapshot.configVersion,
      timeoutSecond: modelConfigSnapshot.timeoutSecond,
      maxRetryCount: modelConfigSnapshot.maxRetryCount,
      updatedAt: "2026-05-21T00:00:00.000Z",
    },
  ];

  return {
    async listModelConfigs(query: AdminAiAuditLogListQuery) {
      return {
        modelConfigs,
        pagination: {
          page: query.page,
          pageSize: query.pageSize,
          sortBy: query.sortBy,
          sortOrder: query.sortOrder,
          total: modelConfigs.length,
        },
      };
    },
    async appendAiCallLog(input: AppendAiCallLogInput) {
      const aiCallLog = {
        publicId: "ai-call-log-dev-mock-001",
        userPublicId: input.userPublicId,
        organizationPublicId: null,
        profession: null,
        level: null,
        aiFuncType: input.aiFuncType,
        callStatus: input.callStatus,
        providerDisplayName: input.modelConfigSnapshot.providerDisplayName,
        modelAlias: input.modelConfigSnapshot.modelName,
        promptSummary: "redacted prompt and answer snapshot",
        outputSummary: "redacted learning suggestion snapshot",
        promptTokenCount: input.promptTokenCount,
        completionTokenCount: input.completionTokenCount,
        totalTokenCount: input.totalTokenCount,
        estimatedCostCny: "0.00",
        latencyMs: input.latencyMs,
        startedAt: input.startedAt.toISOString(),
        completedAt: input.completedAt?.toISOString() ?? null,
      } satisfies AiCallLogSummaryDto;

      aiCallLogs.unshift(aiCallLog);

      return aiCallLog;
    },
    async listAiCallLogs(query: AdminAiAuditLogListQuery) {
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
    async summarizeAiCallLogs(query: AdminAiAuditLogListQuery) {
      const dailySummaries: AiCallLogCostSummaryDto[] =
        aiCallLogs.length === 0
          ? []
          : [
              {
                bucket: "2026-05-21",
                bucketType: "day",
                aiFuncType: "learning_suggestion",
                providerDisplayName: "本地模拟 AI",
                modelAlias: "mock-learning-suggestion",
                callCount: aiCallLogs.length,
                successCount: aiCallLogs.filter(
                  (aiCallLog) => aiCallLog.callStatus === "success",
                ).length,
                failedCount: aiCallLogs.filter(
                  (aiCallLog) => aiCallLog.callStatus === "failed",
                ).length,
                totalTokenCount: aiCallLogs.reduce(
                  (totalTokenCount, aiCallLog) =>
                    totalTokenCount + (aiCallLog.totalTokenCount ?? 0),
                  0,
                ),
                estimatedCostCny: "0.00",
              },
            ];

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

describe("phase 7 AI mock provider and log runtime smoke", () => {
  it("requires an authenticated admin session before returning AI log data", async () => {
    const handlers = createAdminAiAuditLogRuntimeRouteHandlers({
      sessionService: createSessionService(null),
      repositories: createRepositories(),
    });

    const response = await handlers.aiCallLogs.GET(
      new Request("http://localhost/api/v1/ai-call-logs"),
    );

    await expect(response.json()).resolves.toEqual({
      code: 401001,
      message: "Admin session is required.",
      data: null,
    });
  });

  it("records a mock AI call and exposes only redacted AI log summaries to admins", async () => {
    const repositories = createRepositories();
    const aiRuntime = createAiMockProviderRuntime({
      provider: createMockAiProvider(),
      aiCallLogRepository: repositories,
      now: () => completedAt,
    });

    const aiResult = await aiRuntime.generateLearningSuggestion({
      userPublicId: "user-dev-student",
      answerRecordPublicId: "answer-record-dev-001",
      mockExamPublicId: "mock-exam-dev-001",
      questionPublicId: "question-dev-single-choice",
      rawPrompt: "RAW_PROMPT: 学员错题与标准答案明文",
      rawAnswer: "RAW_ANSWER: 学员原始答案明文",
      modelConfigSnapshot,
      promptTemplate,
      startedAt,
    });
    const handlers = createAdminAiAuditLogRuntimeRouteHandlers({
      sessionService: createSessionService("super_admin"),
      repositories,
    });
    const authorizedHeaders = {
      authorization: "Bearer admin-session-token",
    };

    expect(aiResult.learningSuggestion).toContain("本地模拟学习建议");
    expect(aiResult.aiCallLog.publicId).toBe("ai-call-log-dev-mock-001");

    const modelConfigsResponse = await handlers.modelConfigs.GET(
      new Request("http://localhost/api/v1/model-configs", {
        headers: authorizedHeaders,
      }),
    );
    const aiCallLogsResponse = await handlers.aiCallLogs.GET(
      new Request("http://localhost/api/v1/ai-call-logs?page=1&pageSize=20", {
        headers: authorizedHeaders,
      }),
    );
    const summaryResponse = await handlers.aiCallLogSummary.GET(
      new Request("http://localhost/api/v1/ai-call-logs/summary", {
        headers: authorizedHeaders,
      }),
    );
    const modelConfigsPayload = await modelConfigsResponse.json();
    const aiCallLogsPayload = await aiCallLogsResponse.json();
    const summaryPayload = await summaryResponse.json();

    expect(modelConfigsPayload).toMatchObject({
      code: 0,
      data: {
        modelConfigs: [
          {
            publicId: "model-config-dev-learning-suggestion",
            providerKey: "mock",
            apiKeyDisplay: null,
            aiFuncType: "learning_suggestion",
          },
        ],
      },
    });
    expect(aiCallLogsPayload).toMatchObject({
      code: 0,
      message: "ok",
      data: {
        aiCallLogs: [
          {
            publicId: "ai-call-log-dev-mock-001",
            userPublicId: "user-dev-student",
            aiFuncType: "learning_suggestion",
            callStatus: "success",
            providerDisplayName: "本地模拟 AI",
            modelAlias: "mock-learning-suggestion",
            promptSummary: "redacted prompt and answer snapshot",
            outputSummary: "redacted learning suggestion snapshot",
          },
        ],
      },
      pagination: {
        page: 1,
        pageSize: 20,
        total: 1,
      },
    });
    expect(summaryPayload).toMatchObject({
      code: 0,
      data: {
        dailySummaries: [
          {
            bucket: "2026-05-21",
            aiFuncType: "learning_suggestion",
            callCount: 1,
            successCount: 1,
            failedCount: 0,
            estimatedCostCny: "0.00",
          },
        ],
      },
    });

    const serializedPayload = JSON.stringify({
      aiResult,
      modelConfigsPayload,
      aiCallLogsPayload,
      summaryPayload,
    });
    expect(serializedPayload).not.toContain('"id"');
    expect(serializedPayload).not.toContain("RAW_PROMPT");
    expect(serializedPayload).not.toContain("RAW_ANSWER");
    expect(serializedPayload).not.toContain("sk-real-secret");
    expect(serializedPayload).not.toContain("providerPayload");
    expect(serializedPayload).not.toContain("Bearer admin-session-token");
    expect(serializedPayload).not.toContain("session-token");
  });

  it("denies content admins from AI call log operations surfaces", async () => {
    const handlers = createAdminAiAuditLogRuntimeRouteHandlers({
      sessionService: createSessionService("content_admin"),
      repositories: createRepositories(),
    });

    const response = await handlers.aiCallLogSummary.GET(
      new Request("http://localhost/api/v1/ai-call-logs/summary", {
        headers: { authorization: "Bearer admin-session-token" },
      }),
    );

    await expect(response.json()).resolves.toEqual({
      code: 403641,
      message: "Admin permission denied.",
      data: null,
    });
  });
});

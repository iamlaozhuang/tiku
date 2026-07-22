import type { SQL } from "drizzle-orm";
import { describe, expect, it, vi } from "vitest";

import { createAdminAiAuditLogListQuery } from "@/server/contracts/admin-ai-audit-log-ops-contract";
import {
  createPostgresAdminAiAuditLogRuntimeRepositories,
  type AdminAiAuditLogRuntimeRepositories,
  type AppendAiCallLogInput,
} from "@/server/repositories/admin-ai-audit-log-runtime-repository";
import { createAdminAiAuditLogRuntimeRouteHandlers } from "@/server/services/admin-ai-audit-log-runtime";
import type { SessionService } from "@/server/services/session-service";

function createDatabase(execute: (query: SQL) => Promise<unknown[]>) {
  return () => ({ execute }) as never;
}

function createDatabaseError(code: "42P01" | "42703") {
  return Object.assign(new Error("synthetic database failure"), { code });
}

function createAppendAiCallLogInput(): AppendAiCallLogInput {
  return {
    userPublicId: "user-public-001",
    organizationPublicId: null,
    profession: "marketing",
    level: 3,
    answerRecordPublicId: null,
    mockExamPublicId: null,
    questionPublicId: null,
    aiFuncType: "ai_scoring",
    callStatus: "success",
    modelConfigSnapshot: {
      modelConfigPublicId: "model-config-public-001",
      providerPublicId: "model-provider-public-001",
      providerDisplayName: "Synthetic provider",
      providerKey: "synthetic",
      modelName: "synthetic-model",
      displayName: "Synthetic model",
      aiFuncType: "scoring",
      fallbackModelConfigPublicId: null,
      configVersion: 1,
      pricingVersion: null,
      inputTokenPriceCnyPerMillion: null,
      outputTokenPriceCnyPerMillion: null,
      promptTemplateKey: "ai-scoring-v1",
      promptTemplateVersion: 1,
      timeoutSecond: 30,
      maxRetryCount: 0,
    },
    promptTemplateKey: "ai-scoring-v1",
    promptTemplateVersion: 1,
    requestRedactedSnapshot: {},
    responseRedactedSnapshot: {},
    errorRedactedSnapshot: null,
    citationRedactedSnapshot: null,
    promptTokenCount: 10,
    completionTokenCount: 20,
    totalTokenCount: 30,
    latencyMs: 50,
    startedAt: new Date("2026-07-22T00:00:00.000Z"),
    completedAt: new Date("2026-07-22T00:00:00.050Z"),
  };
}

function createAdminSessionService(): Pick<
  SessionService,
  "getCurrentSession"
> {
  return {
    async getCurrentSession() {
      return {
        code: 0,
        message: "ok",
        data: {
          session: { expiresAt: "2026-07-22T01:00:00.000Z" },
          user: {
            publicId: "user-public-admin-001",
            phone: "13900000001",
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

function createRuntimeRepositories(
  overrides: Partial<AdminAiAuditLogRuntimeRepositories>,
): AdminAiAuditLogRuntimeRepositories {
  const query = createAdminAiAuditLogListQuery();
  return {
    async appendAiCallLog() {
      throw new Error("not used");
    },
    async listAiCallLogs() {
      return { aiCallLogs: [], pagination: { ...query, total: 0 } };
    },
    async listModelConfigs() {
      return { modelConfigs: [], pagination: { ...query, total: 0 } };
    },
    async summarizeAiCallLogs() {
      return { dailySummaries: [], pagination: { ...query, total: 0 } };
    },
    ...overrides,
  };
}

describe("F-0039/F-0104 AI governance fail-closed persistence", () => {
  it.each([
    ["model provider", "listModelProviders", "42P01"],
    ["model config", "listModelConfigs", "42703"],
    ["prompt template", "listPromptTemplates", "42P01"],
    ["AI call log", "listAiCallLogs", "42P01"],
    ["AI call summary", "summarizeAiCallLogs", "42P01"],
  ] as const)(
    "propagates %s database failures without fabricating an empty page",
    async (_label, methodName, code) => {
      const execute = vi.fn(async () => {
        throw createDatabaseError(code);
      });
      const repositories = createPostgresAdminAiAuditLogRuntimeRepositories({
        createDatabase: createDatabase(execute),
      });

      await expect(
        repositories[methodName]!(createAdminAiAuditLogListQuery() as never),
      ).rejects.toMatchObject({ code });
      expect(execute).toHaveBeenCalledOnce();
    },
  );

  it("rejects an unmatched AI call log INSERT SELECT instead of returning an unpersisted public id", async () => {
    const execute = vi.fn(async () => []);
    const repositories = createPostgresAdminAiAuditLogRuntimeRepositories({
      createDatabase: createDatabase(execute),
    });

    await expect(
      repositories.appendAiCallLog(createAppendAiCallLogInput()),
    ).rejects.toThrow(/exactly one ai_call_log/i);
  });

  it("returns the public id proven by the AI call log RETURNING row", async () => {
    const execute = vi.fn(async () => [
      { public_id: "ai-call-log-persisted-001" },
    ]);
    const repositories = createPostgresAdminAiAuditLogRuntimeRepositories({
      createDatabase: createDatabase(execute),
    });

    await expect(
      repositories.appendAiCallLog(createAppendAiCallLogInput()),
    ).resolves.toMatchObject({ publicId: "ai-call-log-persisted-001" });
  });

  it("rejects an audit append unless exactly one row is returned", async () => {
    const execute = vi.fn(async () => []);
    const repositories = createPostgresAdminAiAuditLogRuntimeRepositories({
      createDatabase: createDatabase(execute),
    });

    await expect(
      repositories.appendAuditLog?.({
        actorPublicId: "admin-public-001",
        actorRole: "super_admin",
        actionType: "model_config.enable",
        targetResourceType: "model_config",
        targetPublicId: "model-config-public-001",
        resultStatus: "success",
        metadataSummary: "redacted model_config mutation metadata",
        requestIp: null,
      }),
    ).rejects.toThrow(/exactly one audit_log/i);
  });

  it.each(["ai_call_log", "audit_log"] as const)(
    "propagates a missing %s table instead of reporting success",
    async (tableName) => {
      const databaseError = createDatabaseError("42P01");
      const repositories = createPostgresAdminAiAuditLogRuntimeRepositories({
        createDatabase: createDatabase(async () =>
          Promise.reject(databaseError),
        ),
      });
      const operation =
        tableName === "ai_call_log"
          ? repositories.appendAiCallLog(createAppendAiCallLogInput())
          : repositories.appendAuditLog!({
              actorPublicId: "admin-public-001",
              actorRole: "super_admin",
              actionType: "model_config.enable",
              targetResourceType: "model_config",
              targetPublicId: "model-config-public-001",
              resultStatus: "success",
              metadataSummary: "redacted model_config mutation metadata",
              requestIp: null,
            });

      await expect(operation).rejects.toBe(databaseError);
    },
  );

  it.each([
    ["modelProviders", "http://localhost/api/v1/model-providers"],
    ["modelConfigs", "http://localhost/api/v1/model-configs"],
    ["promptTemplates", "http://localhost/api/v1/prompt-templates"],
    ["aiCallLogs", "http://localhost/api/v1/ai-call-logs"],
    ["aiCallLogSummary", "http://localhost/api/v1/ai-call-logs/summary"],
  ] as const)(
    "returns the standard error envelope when %s persistence is unknown",
    async (routeName, url) => {
      const databaseFailure = new Error("synthetic unavailable database");
      const repositories = createRuntimeRepositories(
        routeName === "modelProviders"
          ? {
              listModelProviders: vi.fn(async () =>
                Promise.reject(databaseFailure),
              ),
            }
          : routeName === "modelConfigs"
            ? {
                listModelConfigs: vi.fn(async () =>
                  Promise.reject(databaseFailure),
                ),
              }
            : routeName === "promptTemplates"
              ? {
                  listPromptTemplates: vi.fn(async () =>
                    Promise.reject(databaseFailure),
                  ),
                }
              : routeName === "aiCallLogs"
                ? {
                    listAiCallLogs: vi.fn(async () =>
                      Promise.reject(databaseFailure),
                    ),
                  }
                : {
                    summarizeAiCallLogs: vi.fn(async () =>
                      Promise.reject(databaseFailure),
                    ),
                  },
      );
      const handlers = createAdminAiAuditLogRuntimeRouteHandlers({
        repositories,
        sessionService: createAdminSessionService(),
      });

      const response = await handlers[routeName].GET(
        new Request(url, { headers: { authorization: "Bearer test" } }),
      );

      expect(response.status).toBe(500);
      await expect(response.json()).resolves.toEqual({
        code: 500001,
        message: "Unexpected runtime error.",
        data: null,
      });
    },
  );
});

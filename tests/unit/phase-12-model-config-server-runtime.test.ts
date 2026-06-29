import { describe, expect, it } from "vitest";

import { createAdminAiAuditLogRuntimeRouteHandlers } from "@/server/services/admin-ai-audit-log-runtime";
import type { SessionService } from "@/server/services/session-service";

function createAdminSessionService(
  role: "super_admin" | "ops_admin" | "content_admin",
): Pick<SessionService, "getCurrentSession"> {
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
          session: {
            expiresAt: "2026-05-26T10:00:00.000Z",
          },
          user: {
            publicId: "admin-user-public-001",
            phone: "13800000001",
            name: "AI Admin",
            userType: null,
            status: "active",
            lockedUntilAt: null,
            employeePublicId: null,
            organizationPublicId: null,
            adminPublicId: "admin-public-001",
            adminRoles: [role],
          },
        },
      };
    },
  };
}

function createPage<TData>(data: TData) {
  return {
    ...data,
    pagination: {
      page: 1,
      pageSize: 20,
      sortBy: "updatedAt",
      sortOrder: "desc" as const,
      total: 1,
    },
  };
}

describe("phase 12 model config server runtime", () => {
  it("creates model providers with short-lived secret input and returns masked metadata only", async () => {
    const mutationCalls: unknown[] = [];
    const auditLogEntries: unknown[] = [];
    const syntheticSecret = "credential-synthetic-123456";
    const handlers = createAdminAiAuditLogRuntimeRouteHandlers({
      repositories: {
        async listModelProviders() {
          return createPage({
            modelProviders: [
              {
                publicId: "model-provider-public-001",
                providerKey: "local_mock",
                displayName: "Local Mock",
                baseUrl: null,
                isEnabled: true,
                secretStatus: "configured",
                maskedSecret: "****3456",
                providerMetadata: { runtime: "local_mock" },
                updatedAt: "2026-05-26T00:00:00.000Z",
              },
            ],
          });
        },
        async createModelProvider(input) {
          mutationCalls.push(input);

          return {
            publicId: "model-provider-public-001",
            providerKey: input.providerKey,
            displayName: input.displayName,
            baseUrl: input.baseUrl,
            isEnabled: input.isEnabled,
            secretStatus: input.secretStatus,
            maskedSecret: input.maskedSecret,
            providerMetadata: { runtime: "local_mock" },
            updatedAt: "2026-05-26T00:00:00.000Z",
          };
        },
        async updateModelProvider() {
          throw new Error("not used");
        },
        async setModelProviderEnabled() {
          throw new Error("not used");
        },
        async listModelConfigs() {
          return createPage({ modelConfigs: [] });
        },
        async createModelConfig() {
          throw new Error("not used");
        },
        async updateModelConfig() {
          throw new Error("not used");
        },
        async reorderModelConfigFallback() {
          throw new Error("not used");
        },
        async listPromptTemplates() {
          return createPage({ promptTemplates: [] });
        },
        async createPromptTemplate() {
          throw new Error("not used");
        },
        async updatePromptTemplate() {
          throw new Error("not used");
        },
        async setPromptTemplateEnabled() {
          throw new Error("not used");
        },
        async listAiCallLogs() {
          return createPage({ aiCallLogs: [] });
        },
        async summarizeAiCallLogs() {
          return createPage({ dailySummaries: [] });
        },
        async appendAiCallLog() {
          throw new Error("not used");
        },
        async appendAuditLog(input) {
          auditLogEntries.push(input);
        },
      },
      sessionService: createAdminSessionService("super_admin"),
    });

    const response = await handlers.modelProviders.POST(
      new Request("http://localhost/api/v1/model-providers", {
        method: "POST",
        headers: { authorization: "Bearer admin-session-token" },
        body: JSON.stringify({
          providerKey: " local_mock ",
          displayName: " Local Mock ",
          secretValue: syntheticSecret,
          baseUrl: "",
          isEnabled: true,
        }),
      }),
    );
    const payload = await response.json();

    expect(payload).toEqual({
      code: 0,
      message: "ok",
      data: {
        modelProvider: {
          publicId: "model-provider-public-001",
          providerKey: "local_mock",
          displayName: "Local Mock",
          baseUrl: null,
          isEnabled: true,
          secretStatus: "configured",
          maskedSecret: "****3456",
          providerMetadata: { runtime: "local_mock" },
          updatedAt: "2026-05-26T00:00:00.000Z",
        },
      },
    });
    expect(mutationCalls).toEqual([
      expect.objectContaining({
        providerKey: "local_mock",
        displayName: "Local Mock",
        apiKeyLastFour: "3456",
        secretStatus: "configured",
        maskedSecret: "****3456",
      }),
    ]);
    expect(auditLogEntries).toEqual([
      expect.objectContaining({
        actorPublicId: "admin-public-001",
        actionType: "model_provider.create",
        targetResourceType: "model_provider",
        targetPublicId: "model-provider-public-001",
        resultStatus: "success",
      }),
    ]);
    expect(JSON.stringify(payload)).not.toContain(syntheticSecret);
    expect(JSON.stringify(mutationCalls)).not.toContain(syntheticSecret);
    expect(JSON.stringify(auditLogEntries)).not.toContain(syntheticSecret);
    expect(JSON.stringify(auditLogEntries)).not.toContain(
      "admin-session-token",
    );
  });

  it("creates model configs and reorders fallback using public ids only", async () => {
    const mutationCalls: unknown[] = [];
    const auditLogEntries: unknown[] = [];
    const handlers = createAdminAiAuditLogRuntimeRouteHandlers({
      repositories: {
        async listModelProviders() {
          return createPage({ modelProviders: [] });
        },
        async createModelProvider() {
          throw new Error("not used");
        },
        async updateModelProvider() {
          throw new Error("not used");
        },
        async setModelProviderEnabled() {
          throw new Error("not used");
        },
        async listModelConfigs() {
          return createPage({ modelConfigs: [] });
        },
        async createModelConfig(input) {
          mutationCalls.push({ action: "create", input });

          return {
            publicId: "model-config-public-001",
            providerPublicId: input.modelProviderPublicId,
            providerDisplayName: "Local Mock",
            providerKey: "local_mock",
            modelName: input.modelName,
            modelAlias: input.modelAlias,
            displayName: input.displayName,
            aiFuncType: "ai_explanation",
            apiKeyDisplay: "****3456",
            secretStatus: "configured",
            maskedSecret: "****3456",
            fallbackModelConfigPublicId: input.fallbackModelConfigPublicId,
            isEnabled: input.isEnabled,
            status: input.status,
            fallbackPriority: input.fallbackPriority,
            snapshotPolicy: input.snapshotPolicy,
            configVersion: input.configVersion,
            timeoutSecond: input.timeoutSecond,
            maxRetryCount: input.maxRetryCount,
            updatedAt: "2026-05-26T00:00:00.000Z",
          };
        },
        async updateModelConfig() {
          throw new Error("not used");
        },
        async reorderModelConfigFallback(input) {
          mutationCalls.push({ action: "reorder", input });
          return true;
        },
        async enableModelConfig() {
          throw new Error("not used");
        },
        async disableModelConfig() {
          throw new Error("not used");
        },
        async listPromptTemplates() {
          return createPage({ promptTemplates: [] });
        },
        async createPromptTemplate() {
          throw new Error("not used");
        },
        async updatePromptTemplate() {
          throw new Error("not used");
        },
        async setPromptTemplateEnabled() {
          throw new Error("not used");
        },
        async listAiCallLogs() {
          return createPage({ aiCallLogs: [] });
        },
        async summarizeAiCallLogs() {
          return createPage({ dailySummaries: [] });
        },
        async appendAiCallLog() {
          throw new Error("not used");
        },
        async appendAuditLog(input) {
          auditLogEntries.push(input);
        },
      },
      sessionService: createAdminSessionService("super_admin"),
    });
    const headers = { authorization: "Bearer admin-session-token" };

    const createResponse = await handlers.modelConfigs.POST(
      new Request("http://localhost/api/v1/model-configs", {
        method: "POST",
        headers,
        body: JSON.stringify({
          modelProviderPublicId: "model-provider-public-001",
          aiFuncType: "explanation",
          modelName: "deterministic-explanation-v1",
          modelAlias: "local-explanation",
          displayName: "Local Explanation",
          configVersion: 1,
          timeoutSecond: 15,
          maxRetryCount: 1,
          fallbackModelConfigPublicId: "model-config-public-fallback",
          isEnabled: true,
          status: "enabled",
          fallbackPriority: 10,
          snapshotPolicy: "redacted_metadata",
        }),
      }),
    );
    const reorderResponse = await handlers.modelConfigs.reorderFallback.POST(
      new Request("http://localhost/api/v1/model-configs/reorder-fallback", {
        method: "POST",
        headers,
        body: JSON.stringify({
          items: [
            {
              publicId: "model-config-public-001",
              fallbackPriority: 10,
            },
            {
              publicId: "model-config-public-002",
              fallbackPriority: 20,
            },
          ],
        }),
      }),
    );

    await expect(createResponse.json()).resolves.toMatchObject({
      code: 0,
      message: "ok",
      data: {
        modelConfig: {
          publicId: "model-config-public-001",
          providerPublicId: "model-provider-public-001",
          modelAlias: "local-explanation",
          aiFuncType: "ai_explanation",
          secretStatus: "configured",
          maskedSecret: "****3456",
          fallbackPriority: 10,
          snapshotPolicy: "redacted_metadata",
        },
      },
    });
    await expect(reorderResponse.json()).resolves.toEqual({
      code: 0,
      message: "ok",
      data: null,
    });
    expect(mutationCalls).toEqual([
      expect.objectContaining({ action: "create" }),
      {
        action: "reorder",
        input: {
          items: [
            { publicId: "model-config-public-001", fallbackPriority: 10 },
            { publicId: "model-config-public-002", fallbackPriority: 20 },
          ],
        },
      },
    ]);
    expect(JSON.stringify(mutationCalls)).not.toContain('"id":');
    expect(auditLogEntries).toEqual([
      expect.objectContaining({
        actionType: "model_config.create",
        targetResourceType: "model_config",
        targetPublicId: "model-config-public-001",
        resultStatus: "success",
      }),
      expect.objectContaining({
        actionType: "model_config.reorder_fallback",
        targetResourceType: "model_config",
        targetPublicId: null,
        resultStatus: "success",
      }),
    ]);
  });

  it("rejects oversized model config fallback reorder payloads before repository mutation", async () => {
    const mutationCalls: unknown[] = [];
    const auditLogEntries: unknown[] = [];
    const handlers = createAdminAiAuditLogRuntimeRouteHandlers({
      repositories: {
        async listModelProviders() {
          return createPage({ modelProviders: [] });
        },
        async listModelConfigs() {
          return createPage({ modelConfigs: [] });
        },
        async reorderModelConfigFallback(input) {
          mutationCalls.push(input);
          return true;
        },
        async listPromptTemplates() {
          return createPage({ promptTemplates: [] });
        },
        async listAiCallLogs() {
          return createPage({ aiCallLogs: [] });
        },
        async summarizeAiCallLogs() {
          return createPage({ dailySummaries: [] });
        },
        async appendAiCallLog() {
          throw new Error("not used");
        },
        async appendAuditLog(input) {
          auditLogEntries.push(input);
        },
      },
      sessionService: createAdminSessionService("super_admin"),
    });
    const oversizedItems = Array.from({ length: 101 }, (_, index) => ({
      publicId: `model-config-public-${String(index + 1).padStart(3, "0")}`,
      fallbackPriority: index,
    }));

    const response = await handlers.modelConfigs.reorderFallback.POST(
      new Request("http://localhost/api/v1/model-configs/reorder-fallback", {
        method: "POST",
        headers: { authorization: "Bearer admin-session-token" },
        body: JSON.stringify({
          items: oversizedItems,
        }),
      }),
    );

    await expect(response.json()).resolves.toEqual({
      code: 422641,
      message: "Request validation failed.",
      data: null,
    });
    expect(mutationCalls).toEqual([]);
    expect(auditLogEntries).toEqual([]);
  });

  it("keeps prompt template metadata read-only without returning raw prompt bodies", async () => {
    const mutationCalls: unknown[] = [];
    const auditLogEntries: unknown[] = [];
    const rawPromptBody = "RAW_PROMPT_BODY_DO_NOT_RETURN";
    const handlers = createAdminAiAuditLogRuntimeRouteHandlers({
      repositories: {
        async listModelProviders() {
          return createPage({ modelProviders: [] });
        },
        async createModelProvider() {
          throw new Error("not used");
        },
        async updateModelProvider() {
          throw new Error("not used");
        },
        async setModelProviderEnabled() {
          throw new Error("not used");
        },
        async listModelConfigs() {
          return createPage({ modelConfigs: [] });
        },
        async createModelConfig() {
          throw new Error("not used");
        },
        async updateModelConfig() {
          throw new Error("not used");
        },
        async reorderModelConfigFallback() {
          throw new Error("not used");
        },
        async listPromptTemplates() {
          return createPage({ promptTemplates: [] });
        },
        async createPromptTemplate() {
          throw new Error("prompt_template create must stay unavailable");
        },
        async updatePromptTemplate() {
          throw new Error("prompt_template update must stay unavailable");
        },
        async setPromptTemplateEnabled() {
          throw new Error(
            "prompt_template enable/disable must stay unavailable",
          );
        },
        async listAiCallLogs() {
          return createPage({ aiCallLogs: [] });
        },
        async summarizeAiCallLogs() {
          return createPage({ dailySummaries: [] });
        },
        async appendAiCallLog() {
          throw new Error("not used");
        },
        async appendAuditLog(input) {
          auditLogEntries.push(input);
        },
      },
      sessionService: createAdminSessionService("super_admin"),
    });
    const headers = { authorization: "Bearer admin-session-token" };

    const createResponse = await handlers.promptTemplates.POST(
      new Request("http://localhost/api/v1/prompt-templates", {
        method: "POST",
        headers,
        body: JSON.stringify({
          promptTemplateKey: " ai_hint_v1 ",
          aiFuncType: "hint",
          version: 1,
          title: " Hint V1 ",
          description: " Redaction-safe metadata ",
          bodyDigest: "sha256:synthetic",
          bodyPreviewMasked: "Hint template preview [redacted]",
          templateContent: rawPromptBody,
          status: "active",
          isActive: true,
        }),
      }),
    );
    const disableResponse = await handlers.promptTemplates.disable.POST(
      new Request(
        "http://localhost/api/v1/prompt-templates/prompt-template-public-001/disable",
        { method: "POST", headers },
      ),
      { params: Promise.resolve({ publicId: "prompt-template-public-001" }) },
    );
    const payload = await createResponse.json();

    expect(payload).toEqual({
      code: 404641,
      message: "Requested admin AI resource does not exist.",
      data: null,
    });
    await expect(disableResponse.json()).resolves.toEqual({
      code: 404641,
      message: "Requested admin AI resource does not exist.",
      data: null,
    });
    expect(JSON.stringify(payload)).not.toContain(rawPromptBody);
    expect(mutationCalls).toEqual([]);
    expect(JSON.stringify(mutationCalls)).not.toContain(rawPromptBody);
    expect(auditLogEntries).toEqual([
      expect.objectContaining({
        actionType: "prompt_template.create",
        targetResourceType: "prompt_template",
        targetPublicId: null,
        resultStatus: "failed",
      }),
      expect.objectContaining({
        actionType: "prompt_template.disable",
        targetResourceType: "prompt_template",
        targetPublicId: "prompt-template-public-001",
        resultStatus: "failed",
      }),
    ]);
  });

  it("denies non-super admin model provider mutation with redacted audit metadata", async () => {
    const auditLogEntries: unknown[] = [];
    const handlers = createAdminAiAuditLogRuntimeRouteHandlers({
      repositories: {
        async listModelProviders() {
          return createPage({ modelProviders: [] });
        },
        async createModelProvider() {
          throw new Error("non-super admin must not mutate model_provider");
        },
        async updateModelProvider() {
          throw new Error("not used");
        },
        async setModelProviderEnabled() {
          throw new Error("not used");
        },
        async listModelConfigs() {
          return createPage({ modelConfigs: [] });
        },
        async listPromptTemplates() {
          return createPage({ promptTemplates: [] });
        },
        async listAiCallLogs() {
          return createPage({ aiCallLogs: [] });
        },
        async summarizeAiCallLogs() {
          return createPage({ dailySummaries: [] });
        },
        async appendAiCallLog() {
          throw new Error("not used");
        },
        async appendAuditLog(input) {
          auditLogEntries.push(input);
        },
      },
      sessionService: createAdminSessionService("ops_admin"),
    });

    const response = await handlers.modelProviders.POST(
      new Request("http://localhost/api/v1/model-providers", {
        method: "POST",
        headers: { authorization: "Bearer admin-session-token" },
        body: JSON.stringify({
          providerKey: "local_mock",
          displayName: "Local Mock",
          secretValue: "credential-synthetic-denied",
          isEnabled: true,
        }),
      }),
    );

    await expect(response.json()).resolves.toEqual({
      code: 403641,
      message: "Admin permission denied.",
      data: null,
    });
    expect(auditLogEntries).toEqual([
      expect.objectContaining({
        actorPublicId: "admin-public-001",
        actionType: "model_provider.create",
        targetResourceType: "model_provider",
        targetPublicId: null,
        resultStatus: "failed",
      }),
    ]);
    expect(JSON.stringify(auditLogEntries)).not.toContain("synthetic-denied");
    expect(JSON.stringify(auditLogEntries)).not.toContain(
      "admin-session-token",
    );
  });
});

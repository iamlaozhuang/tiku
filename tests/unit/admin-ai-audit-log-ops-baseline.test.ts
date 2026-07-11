import { createElement } from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  AdminAiAuditLogOpsBaseline,
  AdminAiCallLogOpsPage,
  AdminAuditLogOpsPage,
} from "@/app/(admin)/ops/ai-audit-logs/AdminAiAuditLogOpsBaseline";
import {
  ADMIN_AI_AUDIT_LOG_ERROR_CODES,
  ADMIN_AI_AUDIT_LOG_PAGE_SIZE_OPTIONS,
  ADMIN_AI_AUDIT_LOG_SORT_FIELDS,
  createAdminAiAuditLogListQuery,
} from "@/server/contracts/admin-ai-audit-log-ops-contract";
import type { ApiResponse } from "@/server/contracts/api-response";
import type { AuthContextDto } from "@/server/contracts/auth-contract";
import {
  createAdminAiAuditLogOpsService,
  createUnavailableAdminAiAuditLogOpsService,
} from "@/server/services/admin-ai-audit-log-ops-service";
import { createPostgresAdminAiAuditLogRuntimeRepositories } from "@/server/repositories/admin-ai-audit-log-runtime-repository";
import { createAdminAiAuditLogOpsRouteHandlers } from "@/server/services/admin-ai-audit-log-ops-route";
import { createAdminAiAuditLogRuntimeRouteHandlers } from "@/server/services/admin-ai-audit-log-runtime";

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("admin ai and audit log ops baseline", () => {
  it("defines model config and log query contracts with public identifiers only", () => {
    const query = createAdminAiAuditLogListQuery({
      page: 2,
      pageSize: 50,
      sortBy: "startedAt",
      sortOrder: "asc",
      keyword: "  妯″瀷閰嶇疆  ",
      aiFuncType: "ai_scoring",
      callStatus: "success",
    });

    expect(ADMIN_AI_AUDIT_LOG_PAGE_SIZE_OPTIONS).toEqual([20, 50, 100]);
    expect(ADMIN_AI_AUDIT_LOG_SORT_FIELDS).toEqual([
      "createdAt",
      "updatedAt",
      "startedAt",
      "completedAt",
    ]);
    expect(ADMIN_AI_AUDIT_LOG_ERROR_CODES).toMatchObject({
      adminPermissionDenied: 403641,
      resourceNotFound: 404641,
      concurrentConflict: 409641,
      validationFailed: 422641,
    });
    expect(query).toMatchObject({
      page: 2,
      pageSize: 50,
      sortBy: "startedAt",
      sortOrder: "asc",
      keyword: "妯″瀷閰嶇疆",
      aiFuncType: "ai_scoring",
      callStatus: "success",
    });
    expect(query).not.toHaveProperty("id");
  });

  it("returns redaction-safe model configs, audit logs, ai call logs, and summaries", async () => {
    const service = createAdminAiAuditLogOpsService({
      actor: {
        publicId: "admin-super-001",
        roles: ["super_admin", "ops_admin"],
      },
    });

    const modelConfigList = await service.listModelConfigs({
      page: 1,
      pageSize: 20,
    });
    const auditLogList = await service.listAuditLogs({});
    const aiCallLogList = await service.listAiCallLogs({});
    const aiCallLogSummary = await service.summarizeAiCallLogs({});
    const connectionTest = await service.testModelConfigConnection(
      "model-config-public-001",
    );
    const enableModelConfig = await service.enableModelConfig(
      "model-config-public-001",
    );

    expect(modelConfigList).toMatchObject({
      code: 0,
      message: "ok",
      pagination: { page: 1, pageSize: 20, total: 3 },
    });
    expect(modelConfigList.data?.modelConfigs[0]).toMatchObject({
      publicId: "model-config-public-001",
      providerPublicId: "model-provider-public-001",
      providerDisplayName: expect.any(String),
      apiKeyDisplay: "****1234",
      aiFuncType: "ai_scoring",
      fallbackModelConfigPublicId: null,
    });
    expect(modelConfigList.data?.modelConfigs[1]).toMatchObject({
      publicId: "model-config-public-002",
      aiFuncType: "ai_explanation",
      fallbackModelConfigPublicId: "model-config-public-003",
    });
    expect(modelConfigList.data?.modelConfigs[2]).toMatchObject({
      publicId: "model-config-public-003",
      providerDisplayName: "通义千问",
      displayName: "通义千问讲解备用模型",
    });
    expect(modelConfigList.data?.modelConfigs[0]).not.toHaveProperty("id");
    expect(modelConfigList.data?.modelConfigs[0]).not.toHaveProperty("apiKey");
    expect(modelConfigList.data?.modelConfigs[0]).not.toHaveProperty(
      "providerSecret",
    );
    expect(auditLogList.data?.auditLogs[0]).toMatchObject({
      publicId: "audit-log-public-001",
      actorPublicId: "admin-super-001",
      actionType: "model_config.enable",
      targetResourceType: "model_config",
      targetPublicId: "model-config-public-001",
      resultStatus: "success",
    });
    expect(auditLogList.data?.auditLogs[0]).not.toHaveProperty("id");
    expect(auditLogList.data?.auditLogs[0]).not.toHaveProperty("requestBody");
    expect(aiCallLogList.data?.aiCallLogs[0]).toMatchObject({
      publicId: "ai-call-log-public-001",
      aiFuncType: "ai_scoring",
      callStatus: "success",
      modelAlias: "qwen-plus",
      promptSummary: expect.any(String),
      outputSummary: expect.any(String),
    });
    expect(aiCallLogList.data?.aiCallLogs[0]).not.toHaveProperty("rawPrompt");
    expect(aiCallLogList.data?.aiCallLogs[0]).not.toHaveProperty(
      "rawModelOutput",
    );
    expect(aiCallLogList.data?.aiCallLogs[0]).not.toHaveProperty(
      "providerPayload",
    );
    expect(aiCallLogSummary.data?.dailySummaries[0]).toMatchObject({
      bucket: "2026-05-21",
      aiFuncType: "ai_scoring",
      providerDisplayName: expect.any(String),
      callCount: 12,
      estimatedCostCny: "3.60",
    });
    expect(connectionTest.data?.connectionTest).toMatchObject({
      modelConfigPublicId: "model-config-public-001",
      status: "succeeded",
      failureCategory: "none",
      redactionStatus: "redacted",
      actionType: "model_config_health_check",
      requestBodyStored: false,
      responseBodyStored: false,
      providerPayloadStored: false,
      rawPromptStored: false,
      rawUserDataStored: false,
      modelDisabledByTest: false,
    });
    expect(enableModelConfig).toEqual({
      code: 0,
      message: "ok",
      data: null,
    });
  });

  it("denies model config mutation for non-super admins and keeps logs read-only", async () => {
    const service = createAdminAiAuditLogOpsService({
      actor: {
        publicId: "admin-ops-001",
        roles: ["ops_admin"],
      },
    });

    await expect(
      service.enableModelConfig("model-config-public-001"),
    ).resolves.toEqual({
      code: 403641,
      message: "Admin permission denied.",
      data: null,
    });
    await expect(
      service.testModelConfigConnection("model-config-public-001"),
    ).resolves.toEqual({
      code: 403641,
      message: "Admin permission denied.",
      data: null,
    });
    expect(service).not.toHaveProperty("deleteAuditLog");
    expect(service).not.toHaveProperty("deleteAiCallLog");
  });

  it("keeps unavailable route services in the standard response envelope", async () => {
    const unavailableService = createUnavailableAdminAiAuditLogOpsService();

    await expect(unavailableService.listModelConfigs({})).resolves.toEqual({
      code: 503641,
      message: "Admin AI and audit log runtime is not configured.",
      data: null,
      pagination: null,
    });
  });

  it("allowlists provider metadata exposed by runtime repository mapping", async () => {
    const execute = vi
      .fn()
      .mockResolvedValueOnce([
        {
          public_id: "model-provider-public-redaction",
          provider_key: "local_mock",
          display_name: "Local Mock",
          api_key_last_four: "0001",
          base_url: null,
          secret_status: "configured",
          provider_metadata: {
            runtime: "unit",
            secretStorage: "external_ref_required",
            apiKey: "x",
            token: "x",
            promptDigest: "x",
            nested: {
              token: "x",
            },
          },
          is_enabled: true,
          updated_at: "2026-05-26T00:00:00.000Z",
        },
      ])
      .mockResolvedValueOnce([{ value: 1 }]);
    const repositories = createPostgresAdminAiAuditLogRuntimeRepositories({
      createDatabase: () => ({ execute }) as never,
    });

    const result = await repositories.listModelProviders?.(
      createAdminAiAuditLogListQuery(),
    );

    expect(result?.modelProviders[0]?.providerMetadata).toEqual({
      runtime: "unit",
      secretStorage: "external_ref_required",
    });
    expect(result?.modelProviders[0]?.providerMetadata).not.toHaveProperty(
      "apiKey",
    );
    expect(result?.modelProviders[0]?.providerMetadata).not.toHaveProperty(
      "token",
    );
    expect(result?.modelProviders[0]?.providerMetadata).not.toHaveProperty(
      "promptDigest",
    );
    expect(
      JSON.stringify(result?.modelProviders[0]?.providerMetadata),
    ).not.toContain("apiKey");
  });

  it("adapts ai and audit operation route requests to standard responses", async () => {
    const handlers = createAdminAiAuditLogOpsRouteHandlers(
      createAdminAiAuditLogOpsService({
        actor: {
          publicId: "admin-super-001",
          roles: ["super_admin", "ops_admin"],
        },
      }),
    );

    const modelConfigsResponse = await handlers.modelConfigs.GET(
      new Request("http://localhost/api/v1/model-configs?page=2&pageSize=50"),
    );
    const auditLogsResponse = await handlers.auditLogs.GET(
      new Request("http://localhost/api/v1/audit-logs?page=1&pageSize=20"),
    );
    const summaryResponse = await handlers.aiCallLogSummary.GET(
      new Request("http://localhost/api/v1/ai-call-logs/summary"),
    );
    const enableResponse = await handlers.enableModelConfig.POST(
      new Request(
        "http://localhost/api/v1/model-configs/model-config-public-001/enable",
        {
          method: "POST",
        },
      ),
      {
        params: Promise.resolve({
          publicId: "model-config-public-001",
        }),
      },
    );
    const testConnectionResponse =
      await handlers.testModelConfigConnection.POST(
        new Request(
          "http://localhost/api/v1/model-configs/model-config-public-001/test-connection",
          {
            method: "POST",
          },
        ),
        {
          params: Promise.resolve({
            publicId: "model-config-public-001",
          }),
        },
      );

    await expect(modelConfigsResponse.json()).resolves.toMatchObject({
      code: 0,
      message: "ok",
      pagination: {
        page: 2,
        pageSize: 50,
        total: 3,
      },
      data: {
        modelConfigs: expect.arrayContaining([
          expect.objectContaining({
            publicId: "model-config-public-001",
            apiKeyDisplay: "****1234",
          }),
        ]),
      },
    });
    await expect(auditLogsResponse.json()).resolves.toMatchObject({
      code: 0,
      data: {
        auditLogs: [
          expect.objectContaining({
            publicId: "audit-log-public-001",
            targetResourceType: "model_config",
          }),
        ],
      },
    });
    await expect(summaryResponse.json()).resolves.toMatchObject({
      code: 0,
      data: {
        dailySummaries: [
          expect.objectContaining({
            estimatedCostCny: "3.60",
          }),
        ],
      },
    });
    await expect(enableResponse.json()).resolves.toEqual({
      code: 0,
      message: "ok",
      data: null,
    });
    await expect(testConnectionResponse.json()).resolves.toMatchObject({
      code: 0,
      data: {
        connectionTest: {
          actionType: "model_config_health_check",
          modelDisabledByTest: false,
          providerPayloadStored: false,
          rawPromptStored: false,
          status: "succeeded",
        },
      },
    });
  });

  it("resolves model config runtime reads from cookie-backed admin session markers", async () => {
    const sessionCredential = "admin-session-token";
    const adminSessionResponse: ApiResponse<AuthContextDto | null> = {
      code: 0,
      message: "ok",
      data: {
        session: {
          expiresAt: "2027-05-22T10:00:00.000Z",
        },
        user: {
          publicId: "admin-user-public-001",
          phone: "13800000001",
          name: "Admin User",
          userType: null,
          status: "active",
          lockedUntilAt: null,
          employeePublicId: null,
          organizationPublicId: null,
          adminPublicId: "admin-public-001",
          adminRoles: ["super_admin"],
        },
      },
    };
    const unauthorizedSessionResponse: ApiResponse<AuthContextDto | null> = {
      code: 401001,
      message: "Unauthorized.",
      data: null,
    };
    const getCurrentSession = vi.fn(
      async (input: {
        authorization: string | null;
      }): Promise<ApiResponse<AuthContextDto | null>> =>
        input.authorization === `Bearer ${sessionCredential}`
          ? adminSessionResponse
          : unauthorizedSessionResponse,
    );
    const listModelConfigs = vi.fn(async (query) => ({
      modelConfigs: [
        {
          publicId: "model-config-public-cookie",
          providerPublicId: "model-provider-public-cookie",
          providerDisplayName: "Local Mock",
          providerKey: "mock",
          modelName: "local-model",
          modelAlias: "local-model",
          displayName: "Cookie-backed model config",
          aiFuncType: "ai_scoring",
          apiKeyDisplay: null,
          secretStatus: "not_configured",
          maskedSecret: null,
          fallbackModelConfigPublicId: null,
          isEnabled: true,
          status: "enabled",
          fallbackPriority: 1,
          snapshotPolicy: "redacted_metadata",
          configVersion: 1,
          timeoutSecond: 5,
          maxRetryCount: 1,
          updatedAt: "2026-05-26T00:00:00.000Z",
        },
      ],
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
        total: 1,
      },
    }));
    const handlers = createAdminAiAuditLogRuntimeRouteHandlers({
      repositories: {
        appendAiCallLog: vi.fn(),
        listAiCallLogs: vi.fn(),
        listModelConfigs,
        summarizeAiCallLogs: vi.fn(),
      } as never,
      sessionService: { getCurrentSession },
    });

    const response = await handlers.modelConfigs.GET(
      new Request("http://localhost/api/v1/model-configs?page=1&pageSize=20", {
        headers: {
          authorization: "Bearer __cookie_backed_session__",
          cookie: `tiku_session=${encodeURIComponent(sessionCredential)}`,
        },
      }),
    );

    await expect(response.json()).resolves.toMatchObject({
      code: 0,
      data: {
        modelConfigs: [
          expect.objectContaining({
            publicId: "model-config-public-cookie",
            providerKey: "mock",
          }),
        ],
      },
      message: "ok",
    });
    expect(getCurrentSession).toHaveBeenCalledWith({
      authorization: `Bearer ${sessionCredential}`,
    });
    expect(listModelConfigs).toHaveBeenCalled();
  });

  it("loads runtime APIs into model configuration management without raw payloads", async () => {
    localStorage.setItem("tiku.localSessionToken", "synthetic-local-session");

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const requestPath = String(input);
      const dataByPath = requestPath.startsWith("/api/v1/model-providers")
        ? {
            modelProviders: [
              {
                publicId: "runtime-model-provider-001",
                providerKey: "local_mock",
                displayName: "Local Mock",
                baseUrl: null,
                isEnabled: true,
                secretStatus: "configured",
                maskedSecret: "****0001",
                providerMetadata: { runtime: "unit" },
                updatedAt: "2026-05-26T00:00:00.000Z",
              },
            ],
          }
        : requestPath.startsWith("/api/v1/model-configs")
          ? {
              modelConfigs: [
                {
                  publicId: "runtime-model-config-001",
                  providerPublicId: "runtime-model-provider-001",
                  providerDisplayName: "Local Mock",
                  providerKey: "local_mock",
                  modelName: "local-runtime-model",
                  modelAlias: "local-runtime-model",
                  displayName: "Runtime model config",
                  aiFuncType: "ai_scoring",
                  apiKeyDisplay: "****0001",
                  secretStatus: "configured",
                  maskedSecret: "****0001",
                  fallbackModelConfigPublicId: null,
                  isEnabled: true,
                  status: "enabled",
                  fallbackPriority: 10,
                  snapshotPolicy: "redacted_metadata",
                  configVersion: 1,
                  timeoutSecond: 15,
                  maxRetryCount: 1,
                  updatedAt: "2026-05-26T00:00:00.000Z",
                },
              ],
            }
          : requestPath.startsWith("/api/v1/prompt-templates")
            ? { promptTemplates: [] }
            : requestPath.startsWith("/api/v1/audit-logs")
              ? {
                  auditLogs: [
                    {
                      publicId: "runtime-audit-log-001",
                      actorPublicId: "admin-runtime-001",
                      actorRole: "super_admin",
                      actionType: "model_config.enable",
                      targetResourceType: "model_config",
                      targetPublicId: "runtime-model-config-001",
                      resultStatus: "success",
                      metadataSummary: "redacted runtime metadata",
                      requestIp: null,
                      createdAt: "2026-05-26T00:00:00.000Z",
                    },
                  ],
                }
              : requestPath.startsWith("/api/v1/ai-call-logs/summary")
                ? {
                    dailySummaries: [
                      {
                        bucket: "2026-05-26",
                        bucketType: "day",
                        aiFuncType: "ai_scoring",
                        providerDisplayName: "Local Mock",
                        modelAlias: "local-runtime-model",
                        callCount: 1,
                        successCount: 1,
                        failedCount: 0,
                        totalTokenCount: 42,
                        estimatedCostCny: "0.01",
                      },
                    ],
                  }
                : {
                    aiCallLogs: [
                      {
                        publicId: "runtime-ai-call-log-001",
                        userPublicId: null,
                        organizationPublicId: null,
                        profession: "monopoly",
                        level: 3,
                        aiFuncType: "ai_scoring",
                        callStatus: "success",
                        providerDisplayName: "Local Mock",
                        modelAlias: "local-runtime-model",
                        promptSummary: "redacted prompt summary",
                        outputSummary: "redacted output summary",
                        promptTokenCount: 20,
                        completionTokenCount: 22,
                        totalTokenCount: 42,
                        estimatedCostCny: "0.01",
                        latencyMs: 100,
                        startedAt: "2026-05-26T00:00:00.000Z",
                        completedAt: "2026-05-26T00:00:00.100Z",
                      },
                    ],
                  };

      return {
        json: async () => ({
          code: 0,
          message: "ok",
          data: dataByPath,
        }),
      } as Response;
    });

    vi.stubGlobal("fetch", fetchMock);

    render(createElement(AdminAiAuditLogOpsBaseline, { runtimeEnabled: true }));

    await screen.findByTestId("admin-ai-audit-runtime-ready");
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(6));
    fireEvent.click(screen.getByRole("tab", { name: "模型配置" }));

    expect(
      screen.getByTestId("admin-model-config-runtime-model-config-001"),
    ).toHaveAttribute("data-public-id", "runtime-model-config-001");
    expect(
      screen.getByTestId("admin-audit-log-runtime-audit-log-001"),
    ).toHaveTextContent("redacted runtime metadata");
    expect(
      screen.getByTestId("admin-ai-call-log-runtime-ai-call-log-001"),
    ).toHaveTextContent("redacted prompt summary");
    expect(document.body).not.toHaveTextContent("RAW_PROMPT");
    expect(document.body).not.toHaveTextContent("RAW_PROVIDER_PAYLOAD");
    expect(document.body).not.toHaveTextContent("synthetic-local-session");
  });

  it("loads the split audit log page without AI call, cost, model, or prompt endpoints", async () => {
    localStorage.setItem("tiku.localSessionToken", "split-audit-session");

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const requestPath = String(input);

      if (!requestPath.startsWith("/api/v1/audit-logs")) {
        return {
          json: async () => ({
            code: 500641,
            message: "unexpected endpoint",
            data: null,
          }),
        } as Response;
      }

      return {
        json: async () => ({
          code: 0,
          message: "ok",
          data: {
            auditLogs: [
              {
                publicId: "runtime-audit-log-split-001",
                actorPublicId: "admin-runtime-001",
                actorRole: "ops_admin",
                actionType: "user.reset_password",
                targetResourceType: "user",
                targetPublicId: null,
                resultStatus: "success",
                metadataSummary: "redacted audit metadata",
                requestIp: null,
                createdAt: "2026-05-26T00:00:00.000Z",
              },
            ],
          },
          pagination: {
            page: 1,
            pageSize: 20,
            sortBy: "createdAt",
            sortOrder: "desc",
            total: 1,
          },
        }),
      } as Response;
    });

    vi.stubGlobal("fetch", fetchMock);

    render(createElement(AdminAuditLogOpsPage, { runtimeEnabled: true }));

    await screen.findByRole("heading", { level: 1, name: "审计日志" });

    expect(
      screen.getByRole("table", { name: "审计日志列表" }),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("admin-audit-log-runtime-audit-log-split-001"),
    ).toHaveTextContent("redacted audit metadata");
    expect(screen.queryByText("AI 调用日志")).toBeNull();
    expect(screen.queryByRole("tab", { name: "模型配置" })).toBeNull();
    expect(screen.queryByRole("tab", { name: "Prompt 模板" })).toBeNull();
    expect(screen.queryByText("保存配置")).toBeNull();
    expect(document.body).not.toHaveTextContent("RAW_PROMPT");
    expect(document.body).not.toHaveTextContent("RAW_PROVIDER_PAYLOAD");
    expect(document.body).not.toHaveTextContent("split-audit-session");

    const fetchedPaths = fetchMock.mock.calls.map(([input]) => String(input));
    expect(fetchedPaths).toHaveLength(1);
    expect(fetchedPaths[0]).toMatch(/^\/api\/v1\/audit-logs\b/u);
    expect(fetchedPaths).not.toContainEqual(
      expect.stringMatching(/^\/api\/v1\/ai-call-logs\b/u),
    );
    expect(fetchedPaths).not.toContainEqual(
      expect.stringMatching(/^\/api\/v1\/model-/u),
    );
    expect(fetchedPaths).not.toContainEqual(
      expect.stringMatching(/^\/api\/v1\/prompt-templates\b/u),
    );
  });

  it("uses the shared list pattern with readable audit values and a redacted detail drawer", () => {
    render(createElement(AdminAuditLogOpsPage, { currentRole: "ops_admin" }));

    const toolbar = screen.getByRole("region", { name: "审计日志筛选" });
    expect(toolbar).toHaveTextContent("共 2 条审计日志");
    expect(
      screen.getByRole("table", { name: "审计日志列表" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "列表分页" })).toHaveTextContent(
      "显示 1-2 / 共 2 条审计日志",
    );
    expect(screen.queryByTestId("ops-audit-log-summary-band")).toBeNull();
    expect(document.body).not.toHaveTextContent("summary-first");
    expect(document.body).not.toHaveTextContent("Admin Ops");

    expect(screen.getByLabelText("审计日志关键词")).toBeInTheDocument();
    expect(screen.getByLabelText("审计动作类型")).toBeInTheDocument();
    expect(screen.getByLabelText("审计目标类别")).toBeInTheDocument();
    expect(screen.getByLabelText("审计结果状态")).toBeInTheDocument();
    expect(screen.getByLabelText("开始日期")).toBeInTheDocument();
    expect(screen.getByLabelText("结束日期")).toBeInTheDocument();
    expect(screen.getByLabelText("审计日志每页条数")).toHaveValue("20");
    expect(
      screen.getByRole("button", { name: "重置筛选" }),
    ).toBeInTheDocument();

    const auditTable = screen.getByRole("table", { name: "审计日志列表" });
    expect(auditTable).toHaveTextContent("超级管理员");
    expect(auditTable).toHaveTextContent("启用模型配置");
    expect(auditTable).toHaveTextContent("模型配置");
    expect(auditTable).toHaveTextContent("成功");
    expect(auditTable).not.toHaveTextContent("super_admin");
    expect(auditTable).not.toHaveTextContent("model_config.enable");
    expect(auditTable).not.toHaveTextContent("2026-05-21T08:00:00.000Z");

    expect(screen.queryByRole("dialog", { name: "审计日志详情" })).toBeNull();
    fireEvent.click(screen.getAllByRole("button", { name: "查看详情" })[0]);

    const detailDrawer = screen.getByRole("dialog", { name: "审计日志详情" });
    expect(detailDrawer).toHaveTextContent("仅展示脱敏元数据");
    expect(detailDrawer).toHaveTextContent("已脱敏");
    expect(detailDrawer).not.toHaveTextContent(
      "audit-log-formal-review-candidate-public-001",
    );
    expect(detailDrawer).not.toHaveTextContent("admin-content-public-001");
    expect(detailDrawer).not.toHaveTextContent(
      "personal_ai_result_public_admin_901",
    );

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "审计日志详情" })).toBeNull();
  });

  it("sends complete audit filters through the existing contract and resets them", async () => {
    localStorage.setItem(
      "tiku.localSessionToken",
      "split-audit-filter-session",
    );

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      void input;

      return Response.json({
        code: 0,
        message: "ok",
        data: {
          auditLogs: [],
          governance: {
            auditLogRetentionDay: 1095,
            blockedCapabilities: [],
            exportStatus: "blocked",
            hardDeleteStatus: "blocked",
            rawViewerStatus: "blocked",
            readOnly: true,
            status: "blocked",
          },
        },
        pagination: {
          page: 1,
          pageSize: 20,
          sortBy: "createdAt",
          sortOrder: "desc",
          total: 0,
        },
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(AdminAuditLogOpsPage, { runtimeEnabled: true }));
    await screen.findByRole("heading", { level: 1, name: "审计日志" });

    fireEvent.change(screen.getByLabelText("审计日志关键词"), {
      target: { value: "异常操作" },
    });
    fireEvent.change(screen.getByLabelText("审计动作类型"), {
      target: { value: "user.reset_password" },
    });
    fireEvent.change(screen.getByLabelText("审计目标类别"), {
      target: { value: "user" },
    });
    fireEvent.change(screen.getByLabelText("审计结果状态"), {
      target: { value: "failed" },
    });
    fireEvent.change(screen.getByLabelText("开始日期"), {
      target: { value: "2026-07-01" },
    });
    fireEvent.change(screen.getByLabelText("结束日期"), {
      target: { value: "2026-07-11" },
    });
    fireEvent.change(screen.getByLabelText("审计日志每页条数"), {
      target: { value: "50" },
    });

    await waitFor(() => {
      const lastRequestUrl = String(fetchMock.mock.calls.at(-1)?.[0]);
      expect(lastRequestUrl).toContain("page=1&pageSize=50");
      expect(lastRequestUrl).toContain(
        "keyword=%E5%BC%82%E5%B8%B8%E6%93%8D%E4%BD%9C",
      );
      expect(lastRequestUrl).toContain("actionType=user.reset_password");
      expect(lastRequestUrl).toContain("targetResourceType=user");
      expect(lastRequestUrl).toContain("resultStatus=failed");
      expect(lastRequestUrl).toContain(
        "fromCreatedAt=2026-07-01T00%3A00%3A00.000Z",
      );
      expect(lastRequestUrl).toContain(
        "toCreatedAt=2026-07-11T23%3A59%3A59.999Z",
      );
    });

    fireEvent.click(screen.getByRole("button", { name: "重置筛选" }));

    await waitFor(() => {
      expect(String(fetchMock.mock.calls.at(-1)?.[0])).toBe(
        "/api/v1/audit-logs?page=1&pageSize=20&sortBy=createdAt&sortOrder=desc",
      );
    });
    expect(screen.getByLabelText("审计日志关键词")).toHaveValue("");
    expect(screen.getByLabelText("审计动作类型")).toHaveValue("all");
    expect(screen.getByLabelText("审计目标类别")).toHaveValue("all");
    expect(screen.getByLabelText("审计结果状态")).toHaveValue("all");
    expect(screen.getByLabelText("开始日期")).toHaveValue("");
    expect(screen.getByLabelText("结束日期")).toHaveValue("");
    expect(screen.getByLabelText("审计日志每页条数")).toHaveValue("20");
    expect(document.body).not.toHaveTextContent("split-audit-filter-session");
  });

  it("loads the split AI call log page without audit, model, or prompt endpoints", async () => {
    localStorage.setItem("tiku.localSessionToken", "split-ai-call-session");

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const requestPath = String(input);

      if (requestPath.startsWith("/api/v1/ai-call-logs/summary")) {
        return {
          json: async () => ({
            code: 0,
            message: "ok",
            data: {
              dailySummaries: [
                {
                  bucket: "2026-05-26",
                  bucketType: "day",
                  aiFuncType: "ai_scoring",
                  providerDisplayName: "Local Mock",
                  modelAlias: "local-runtime-model",
                  callCount: 1,
                  successCount: 0,
                  failedCount: 1,
                  totalTokenCount: 42,
                  estimatedCostCny: "0.01",
                },
              ],
            },
          }),
        } as Response;
      }

      if (requestPath.startsWith("/api/v1/ai-call-logs")) {
        return {
          json: async () => ({
            code: 0,
            message: "ok",
            data: {
              aiCallLogs: [
                {
                  publicId: "runtime-ai-call-log-split-001",
                  userPublicId: null,
                  organizationPublicId: null,
                  profession: "monopoly",
                  level: 3,
                  aiFuncType: "ai_scoring",
                  callStatus: "failed",
                  providerDisplayName: "Local Mock",
                  modelAlias: "local-runtime-model",
                  promptSummary: "redacted prompt summary",
                  outputSummary: "redacted output summary",
                  promptTokenCount: 20,
                  completionTokenCount: 22,
                  totalTokenCount: 42,
                  estimatedCostCny: "0.01",
                  latencyMs: 100,
                  startedAt: "2026-05-26T00:00:00.000Z",
                  completedAt: "2026-05-26T00:00:00.100Z",
                },
              ],
            },
            pagination: {
              page: 1,
              pageSize: 20,
              sortBy: "startedAt",
              sortOrder: "desc",
              total: 1,
            },
          }),
        } as Response;
      }

      return {
        json: async () => ({
          code: 500641,
          message: "unexpected endpoint",
          data: null,
        }),
      } as Response;
    });

    vi.stubGlobal("fetch", fetchMock);

    render(createElement(AdminAiCallLogOpsPage, { runtimeEnabled: true }));

    await screen.findByRole("heading", { level: 1, name: "AI 调用日志" });
    expect(document.body).not.toHaveTextContent("summary-first");
    expect(document.body).not.toHaveTextContent("Admin Ops");

    const aiCallToolbar = screen.getByRole("region", {
      name: "AI 调用日志筛选",
    });
    expect(aiCallToolbar).toHaveTextContent("共 1 条 AI 调用日志");
    expect(
      within(aiCallToolbar).getByRole("button", { name: "重置筛选" }),
    ).toBeInTheDocument();
    expect(
      within(aiCallToolbar).getByLabelText("AI 调用关键词"),
    ).toBeInTheDocument();
    expect(
      within(aiCallToolbar).getByLabelText("AI 调用状态"),
    ).toBeInTheDocument();
    expect(
      within(aiCallToolbar).getByLabelText("AI 调用日志每页条数"),
    ).toHaveValue("20");

    expect(
      screen.getByRole("table", { name: "AI 调用日志列表" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "列表分页" })).toHaveTextContent(
      "显示 1-1 / 共 1 条 AI 调用日志",
    );
    expect(
      screen.getByTestId("admin-ai-call-log-runtime-ai-call-log-split-001"),
    ).toHaveTextContent("redacted prompt summary");
    expect(screen.getByText("失败调用")).toBeInTheDocument();
    expect(screen.queryByText("审计日志只读")).toBeNull();
    expect(screen.queryByText("模型配置")).toBeNull();
    expect(screen.queryByText("Prompt 模板")).toBeNull();
    expect(document.body).not.toHaveTextContent("RAW_PROMPT");
    expect(document.body).not.toHaveTextContent("RAW_PROVIDER_PAYLOAD");
    expect(document.body).not.toHaveTextContent("split-ai-call-session");

    const fetchedPaths = fetchMock.mock.calls.map(([input]) => String(input));
    expect(fetchedPaths).toHaveLength(2);
    expect(fetchedPaths).toContainEqual(
      expect.stringMatching(/^\/api\/v1\/ai-call-logs\b/u),
    );
    expect(fetchedPaths).toContainEqual(
      expect.stringMatching(/^\/api\/v1\/ai-call-logs\/summary\b/u),
    );
    expect(fetchedPaths).not.toContainEqual(
      expect.stringMatching(/^\/api\/v1\/audit-logs\b/u),
    );
    expect(fetchedPaths).not.toContainEqual(
      expect.stringMatching(/^\/api\/v1\/model-/u),
    );
    expect(fetchedPaths).not.toContainEqual(
      expect.stringMatching(/^\/api\/v1\/prompt-templates\b/u),
    );
  });

  it("renders ai and audit operation states with redacted runtime metadata", () => {
    render(createElement(AdminAiAuditLogOpsBaseline, { state: "loading" }));
    expect(screen.getByRole("heading")).toHaveTextContent("AI");

    cleanup();
    render(createElement(AdminAiAuditLogOpsBaseline, { state: "empty" }));
    expect(screen.getByRole("heading")).toHaveTextContent("AI");

    cleanup();
    render(createElement(AdminAiAuditLogOpsBaseline, { state: "error" }));
    expect(screen.getByRole("heading")).toHaveTextContent("AI");

    cleanup();
    render(createElement(AdminAiAuditLogOpsBaseline));

    expect(
      screen.getByRole("heading", { level: 1, name: /AI/ }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "模型配置" }));
    expect(
      screen.getByTestId("admin-model-config-model-config-public-001"),
    ).toHaveAttribute("data-public-id", "model-config-public-001");
    expect(
      screen.getByTestId("admin-model-config-model-config-public-001"),
    ).not.toHaveAttribute("data-id");
    expect(
      screen.getByTestId("admin-model-config-model-config-public-001"),
    ).toHaveTextContent("脱敏元数据");
    expect(screen.queryByText("sk-real-secret-1234")).toBeNull();
    const modelConfigRow = screen.getByTestId(
      "admin-model-config-model-config-public-001",
    );
    fireEvent.click(screen.getByRole("button", { name: "禁用配置" }));
    expect(modelConfigRow).toHaveTextContent("已停用");
  });
});

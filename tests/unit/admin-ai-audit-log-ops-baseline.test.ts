import { createElement } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { AdminAiAuditLogOpsBaseline } from "@/app/(admin)/ops/ai-audit-logs/AdminAiAuditLogOpsBaseline";
import {
  ADMIN_AI_AUDIT_LOG_ERROR_CODES,
  ADMIN_AI_AUDIT_LOG_PAGE_SIZE_OPTIONS,
  ADMIN_AI_AUDIT_LOG_SORT_FIELDS,
  createAdminAiAuditLogListQuery,
} from "@/server/contracts/admin-ai-audit-log-ops-contract";
import {
  createAdminAiAuditLogOpsService,
  createUnavailableAdminAiAuditLogOpsService,
} from "@/server/services/admin-ai-audit-log-ops-service";
import { createAdminAiAuditLogOpsRouteHandlers } from "@/server/services/admin-ai-audit-log-ops-route";

afterEach(() => {
  cleanup();
});

describe("admin ai and audit log ops baseline", () => {
  it("defines model config and log query contracts with public identifiers only", () => {
    const query = createAdminAiAuditLogListQuery({
      page: 2,
      pageSize: 50,
      sortBy: "startedAt",
      sortOrder: "asc",
      keyword: "  模型配置  ",
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
      keyword: "模型配置",
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
      providerDisplayName: "通义千问",
      apiKeyDisplay: "****1234",
      aiFuncType: "ai_scoring",
      fallbackModelConfigPublicId: null,
    });
    expect(modelConfigList.data?.modelConfigs[1]).toMatchObject({
      publicId: "model-config-public-002",
      aiFuncType: "ai_explanation",
      fallbackModelConfigPublicId: "model-config-public-003",
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
      promptSummary: "已按策略脱敏",
      outputSummary: "已按策略脱敏",
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
      providerDisplayName: "通义千问",
      callCount: 12,
      estimatedCostCny: "3.60",
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
  });

  it("renders ai and audit operation states, redacted secrets, confirmations, and toast feedback", () => {
    render(createElement(AdminAiAuditLogOpsBaseline, { state: "loading" }));
    expect(screen.getByText("正在加载 AI 与日志运营数据")).toBeInTheDocument();

    cleanup();
    render(createElement(AdminAiAuditLogOpsBaseline, { state: "empty" }));
    expect(screen.getByText("暂无 AI 与日志运营数据")).toBeInTheDocument();

    cleanup();
    render(createElement(AdminAiAuditLogOpsBaseline, { state: "error" }));
    expect(screen.getByText("AI 与日志运营数据加载失败")).toBeInTheDocument();

    cleanup();
    render(createElement(AdminAiAuditLogOpsBaseline));

    expect(
      screen.getByRole("heading", { name: "AI 配置与日志运营" }),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("admin-model-config-model-config-public-001"),
    ).toHaveAttribute("data-public-id", "model-config-public-001");
    expect(
      screen.getByTestId("admin-model-config-model-config-public-001"),
    ).not.toHaveAttribute("data-id");
    expect(screen.getByText("****1234")).toBeInTheDocument();
    expect(screen.queryByText("sk-real-secret-1234")).toBeNull();
    expect(screen.queryByText("原始提示词内容")).toBeNull();
    expect(screen.getByText("审计日志只读")).toBeInTheDocument();
    expect(screen.getByText("AI 调用日志只读")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "启用模型配置" }));
    expect(screen.getByRole("alertdialog")).toHaveTextContent(
      "确认启用模型配置？",
    );
    fireEvent.click(screen.getByRole("button", { name: "确认启用" }));
    expect(screen.getByRole("status")).toHaveTextContent("模型配置已启用");

    fireEvent.click(screen.getByRole("button", { name: "停用模型配置" }));
    expect(screen.getByRole("alertdialog")).toHaveTextContent(
      "模型配置停用需要二次确认",
    );
    fireEvent.click(screen.getByRole("button", { name: "确认停用" }));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "数据已被其他操作更新，请刷新后重试",
    );
  });
});

import { createElement } from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { AdminModelConfigManagement } from "@/features/admin/model-config-management/AdminModelConfigManagement";

afterEach(() => {
  cleanup();
});

describe("admin model config management UI", () => {
  it("never fabricates provider success when the runtime callback is absent", async () => {
    render(
      createElement(AdminModelConfigManagement, {
        canManageModelConfig: true,
      }),
    );

    fireEvent.change(screen.getByLabelText("供应商标识"), {
      target: { value: "qwen" },
    });
    fireEvent.change(screen.getByLabelText("供应商显示名称"), {
      target: { value: "Qwen" },
    });
    fireEvent.change(screen.getByLabelText("密钥值"), {
      target: { value: "synthetic-credential" },
    });
    fireEvent.click(screen.getByRole("button", { name: "保存供应商" }));

    expect(await screen.findByText("模型供应商保存失败。")).toBeInTheDocument();
    expect(
      screen.queryByTestId("admin-model-provider-qwen"),
    ).not.toBeInTheDocument();
  });

  it("renders loading, empty, and error states", () => {
    render(createElement(AdminModelConfigManagement, { state: "loading" }));
    expect(screen.getByText("正在加载模型配置")).toBeInTheDocument();

    cleanup();
    render(createElement(AdminModelConfigManagement, { state: "empty" }));
    expect(screen.getByText("暂无模型配置")).toBeInTheDocument();

    cleanup();
    render(createElement(AdminModelConfigManagement, { state: "error" }));
    expect(screen.getByText("模型配置加载失败")).toBeInTheDocument();
  });

  it("creates model providers through an injected runtime and only renders masked state", async () => {
    const syntheticSecret = ["sk-test", "synthetic", "123456"].join("-");

    render(
      createElement(AdminModelConfigManagement, {
        canManageModelConfig: true,
        onSaveProvider: async (form) => ({
          publicId: `model-provider-${form.providerKey}`,
          providerKey: form.providerKey,
          displayName: form.displayName,
          baseUrl: null,
          isEnabled: true,
          secretStatus: "configured",
          maskedSecret: "****3456",
          providerMetadata: { source: "test_adapter" },
          updatedAt: "2026-05-26T00:00:00.000Z",
        }),
      }),
    );

    fireEvent.change(screen.getByLabelText("供应商标识"), {
      target: { value: "local_mock" },
    });
    fireEvent.change(screen.getByLabelText("供应商显示名称"), {
      target: { value: "Local Mock" },
    });
    fireEvent.change(screen.getByLabelText("密钥值"), {
      target: { value: syntheticSecret },
    });
    fireEvent.click(screen.getByRole("button", { name: "保存供应商" }));

    const providerRow = await screen.findByTestId(
      "admin-model-provider-local_mock",
    );
    expect(providerRow).toHaveTextContent("Local Mock");
    expect(providerRow).toHaveTextContent("已配置");
    expect(providerRow).toHaveTextContent("****3456");
    expect(screen.getByLabelText("密钥值")).toHaveValue("");
    expect(document.body.textContent).not.toContain(syntheticSecret);

    fireEvent.click(
      within(providerRow).getByRole("button", {
        name: "禁用供应商 Local Mock",
      }),
    );
    expect(providerRow).toHaveTextContent("已停用");
  });

  it("shows model config fallback controls and prompt template metadata without raw prompt bodies", async () => {
    const rawPromptBody = "RAW_PROMPT_BODY_DO_NOT_RENDER";

    render(
      createElement(AdminModelConfigManagement, {
        canManageModelConfig: true,
        initialModelProviders: [
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
        initialModelConfigs: [
          {
            publicId: "model-config-public-001",
            providerPublicId: "model-provider-public-001",
            providerDisplayName: "Local Mock",
            providerKey: "local_mock",
            modelName: "deterministic-explanation-v1",
            modelAlias: "local-explanation",
            displayName: "Local Explanation",
            aiFuncType: "ai_explanation",
            apiKeyDisplay: "****3456",
            secretStatus: "configured",
            maskedSecret: "****3456",
            fallbackModelConfigPublicId: "model-config-public-fallback",
            isEnabled: true,
            status: "enabled",
            fallbackPriority: 10,
            snapshotPolicy: "redacted_metadata",
            configVersion: 1,
            pricingVersion: null,
            inputTokenPriceCnyPerMillion: null,
            outputTokenPriceCnyPerMillion: null,
            timeoutSecond: 15,
            maxRetryCount: 1,
            updatedAt: "2026-05-26T00:00:00.000Z",
          },
        ],
        initialPromptTemplates: [
          {
            publicId: "prompt-template-public-001",
            promptTemplateKey: "ai_hint_v1",
            aiFuncType: "ai_hint",
            version: 1,
            title: "Hint V1",
            description: "Metadata only",
            bodyDigest: "sha256:synthetic",
            bodyPreviewMasked: "Hint template preview [redacted]",
            bodyFullText: rawPromptBody,
            canViewFullText: true,
            requiredVariables: ["question", "studentAnswer"],
            registrationSource: "runtime_registry",
            catalogGapStatus: "registered",
            status: "active",
            isActive: true,
            updatedAt: "2026-05-26T00:00:00.000Z",
          },
        ],
        canViewPromptFullText: false,
        onTestConnection: async (publicId) => ({
          modelConfigPublicId: publicId,
          status: "succeeded",
          testedAt: "2026-05-26T00:00:00.000Z",
          testedByPublicId: "admin-public-001",
          durationMs: 12,
          failureCategory: "none",
          redactionStatus: "redacted",
          actionType: "model_config_health_check",
          requestBodyStored: false,
          responseBodyStored: false,
          providerPayloadStored: false,
          rawPromptStored: false,
          rawUserDataStored: false,
          modelDisabledByTest: false,
        }),
      }),
    );

    expect(screen.getByRole("tab", { name: "模型供应商" })).toHaveClass(
      "active:scale-[0.98]",
    );
    fireEvent.click(screen.getByRole("tab", { name: "模型配置" }));
    expect(screen.getByRole("tab", { name: "模型配置" })).toHaveClass(
      "active:scale-[0.98]",
    );
    expect(screen.getByLabelText("模型供应商")).toHaveValue("");
    expect(screen.getByRole("option", { name: "Local Mock" })).toHaveValue(
      "model-provider-public-001",
    );
    expect(screen.getByLabelText("备用模型配置")).toBeInTheDocument();
    expect(screen.getByLabelText("价格版本")).toBeInTheDocument();
    expect(
      screen.getByLabelText("输入 Token 单价（元/百万 Token）"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("输出 Token 单价（元/百万 Token）"),
    ).toBeInTheDocument();
    expect(screen.queryByText("供应商业务标识")).toBeNull();
    expect(screen.queryByText("备用模型配置业务标识")).toBeNull();
    const configRow = screen.getByTestId(
      "admin-model-config-model-config-public-001",
    );
    expect(configRow).toHaveTextContent("备用：配置不可用");
    expect(configRow).not.toHaveTextContent("model-config-public-fallback");
    expect(configRow).toHaveTextContent("优先级： 10");
    expect(configRow).toHaveTextContent("脱敏元数据");
    expect(configRow).toHaveTextContent("本地成本估算：未配置");
    fireEvent.click(
      within(configRow).getByRole("button", {
        name: "测试 Local Explanation 的连接",
      }),
    );
    expect(await screen.findByText(/连接测试：已通过/)).toBeInTheDocument();

    fireEvent.click(
      within(configRow).getByRole("button", {
        name: "禁用配置 Local Explanation",
      }),
    );
    expect(configRow).toHaveTextContent("已停用");

    fireEvent.click(screen.getByRole("tab", { name: "Prompt 模板" }));
    const templateRow = screen.getByTestId(
      "admin-prompt-template-prompt-template-public-001",
    );
    expect(templateRow).toHaveTextContent("sha256:synthetic");
    expect(templateRow).toHaveTextContent("Hint template preview [redacted]");
    expect(templateRow).toHaveTextContent("变量：question、studentAnswer");
    expect(templateRow).toHaveTextContent("只读");
    expect(document.body.textContent).not.toContain(rawPromptBody);
    expect(screen.queryByText("保存模板")).not.toBeInTheDocument();
    expect(screen.queryByText("禁用模板")).not.toBeInTheDocument();
    fireEvent.click(
      within(templateRow).getByRole("button", { name: "查看元数据" }),
    );
    expect(
      screen.getByText(
        "当前角色仅可查看 Prompt 元数据，全文不在此角色范围内展示。",
      ),
    ).toBeInTheDocument();
    expect(document.body.textContent).not.toContain(rawPromptBody);
  });

  it("submits a complete versioned pricing tuple without claiming calibration", async () => {
    const submittedForms: unknown[] = [];

    render(
      createElement(AdminModelConfigManagement, {
        canManageModelConfig: true,
        initialModelProviders: [
          {
            publicId: "model-provider-public-synthetic",
            providerKey: "synthetic",
            displayName: "Synthetic Provider",
            baseUrl: null,
            isEnabled: true,
            secretStatus: "not_configured",
            maskedSecret: null,
            providerMetadata: { runtime: "unit" },
            updatedAt: "2026-07-21T00:00:00.000Z",
          },
        ],
        onSaveConfig: async (form) => {
          submittedForms.push(form);
          return {
            publicId: "model-config-public-synthetic",
            providerPublicId: form.modelProviderPublicId,
            providerDisplayName: "Synthetic Provider",
            providerKey: "synthetic",
            modelName: form.modelName,
            modelAlias: form.modelAlias,
            displayName: form.displayName,
            aiFuncType: form.aiFuncType,
            apiKeyDisplay: null,
            secretStatus: "not_configured",
            maskedSecret: null,
            fallbackModelConfigPublicId: null,
            isEnabled: true,
            status: "enabled",
            fallbackPriority: 0,
            snapshotPolicy: "redacted_metadata",
            configVersion: 1,
            pricingVersion: form.pricingVersion,
            inputTokenPriceCnyPerMillion: form.inputTokenPriceCnyPerMillion,
            outputTokenPriceCnyPerMillion: form.outputTokenPriceCnyPerMillion,
            timeoutSecond: 15,
            maxRetryCount: 1,
            updatedAt: "2026-07-21T00:00:00.000Z",
          };
        },
      }),
    );

    fireEvent.click(screen.getByRole("tab", { name: "模型配置" }));
    fireEvent.change(screen.getByLabelText("模型供应商"), {
      target: { value: "model-provider-public-synthetic" },
    });
    fireEvent.change(screen.getByLabelText("模型名称"), {
      target: { value: "synthetic-model" },
    });
    fireEvent.change(screen.getByLabelText("模型别名"), {
      target: { value: "synthetic-model" },
    });
    fireEvent.change(screen.getByLabelText("配置显示名称"), {
      target: { value: "Synthetic model" },
    });
    fireEvent.change(screen.getByLabelText("价格版本"), {
      target: { value: "synthetic-v1" },
    });
    fireEvent.change(
      screen.getByLabelText("输入 Token 单价（元/百万 Token）"),
      {
        target: { value: "2.000000" },
      },
    );
    fireEvent.change(
      screen.getByLabelText("输出 Token 单价（元/百万 Token）"),
      {
        target: { value: "8.000000" },
      },
    );
    fireEvent.click(screen.getByRole("button", { name: "保存配置" }));

    expect(await screen.findByText("模型配置已保存。")).toBeInTheDocument();
    expect(submittedForms).toContainEqual(
      expect.objectContaining({
        pricingVersion: "synthetic-v1",
        inputTokenPriceCnyPerMillion: "2.000000",
        outputTokenPriceCnyPerMillion: "8.000000",
      }),
    );
    expect(document.body).toHaveTextContent(
      "不代表 Provider 实际账单或成本校准",
    );
  });

  it("shows Prompt full text only when the prompt DTO and role both allow it", () => {
    const promptFullText = "READ_ONLY_PROMPT_FULL_TEXT";

    render(
      createElement(AdminModelConfigManagement, {
        canViewPromptFullText: true,
        initialPromptTemplates: [
          {
            publicId: "prompt-template-public-full-text",
            promptTemplateKey: "ai_scoring_v1",
            aiFuncType: "ai_scoring",
            version: 1,
            title: "Scoring V1",
            description: "Metadata only",
            bodyDigest: "sha256:scoring",
            bodyPreviewMasked: "[redacted]",
            bodyFullText: promptFullText,
            canViewFullText: true,
            requiredVariables: ["question"],
            registrationSource: "project_prompt_catalog",
            catalogGapStatus: "catalog_gap",
            status: "active",
            isActive: true,
            updatedAt: "2026-05-26T00:00:00.000Z",
          },
        ],
      }),
    );

    fireEvent.click(screen.getByRole("tab", { name: "Prompt 模板" }));
    fireEvent.click(screen.getByRole("button", { name: "查看全文" }));

    expect(screen.getByText(promptFullText)).toBeInTheDocument();
    expect(screen.queryByText("保存模板")).not.toBeInTheDocument();
    expect(screen.queryByText("导出")).not.toBeInTheDocument();
  });

  it("defaults to read-only when role capabilities are omitted", () => {
    render(
      createElement(AdminModelConfigManagement, {
        initialModelProviders: [
          {
            publicId: "model-provider-public-readonly",
            providerKey: "readonly_mock",
            displayName: "Readonly Mock",
            baseUrl: null,
            isEnabled: true,
            secretStatus: "configured",
            maskedSecret: "****0000",
            providerMetadata: { runtime: "local_mock" },
            updatedAt: "2026-05-26T00:00:00.000Z",
          },
        ],
        initialModelConfigs: [
          {
            publicId: "model-config-public-readonly",
            providerPublicId: "model-provider-public-readonly",
            providerDisplayName: "Readonly Mock",
            providerKey: "readonly_mock",
            modelName: "readonly-model",
            modelAlias: "readonly-model",
            displayName: "Readonly Model",
            aiFuncType: "ai_scoring",
            apiKeyDisplay: "****0000",
            secretStatus: "configured",
            maskedSecret: "****0000",
            fallbackModelConfigPublicId: null,
            isEnabled: true,
            status: "enabled",
            fallbackPriority: 1,
            snapshotPolicy: "redacted_metadata",
            configVersion: 1,
            pricingVersion: "synthetic-v1",
            inputTokenPriceCnyPerMillion: "2.000000",
            outputTokenPriceCnyPerMillion: "8.000000",
            timeoutSecond: 15,
            maxRetryCount: 1,
            updatedAt: "2026-05-26T00:00:00.000Z",
          },
        ],
      }),
    );

    expect(screen.queryByText("保存供应商")).not.toBeInTheDocument();
    expect(screen.queryByText("禁用供应商")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "模型配置" }));
    expect(screen.queryByText("保存配置")).not.toBeInTheDocument();
    expect(screen.queryByText("测试连接")).not.toBeInTheDocument();
    expect(screen.queryByText("禁用配置")).not.toBeInTheDocument();
  });
});

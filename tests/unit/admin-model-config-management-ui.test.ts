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

  it("creates model providers with short-lived secret input and only renders masked state", () => {
    const syntheticSecret = ["sk-test", "synthetic", "123456"].join("-");

    render(createElement(AdminModelConfigManagement));

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

    const providerRow = screen.getByTestId("admin-model-provider-local_mock");
    expect(providerRow).toHaveTextContent("Local Mock");
    expect(providerRow).toHaveTextContent("已配置");
    expect(providerRow).toHaveTextContent("****3456");
    expect(screen.getByLabelText("密钥值")).toHaveValue("");
    expect(document.body.textContent).not.toContain(syntheticSecret);

    fireEvent.click(
      within(providerRow).getByRole("button", { name: "禁用供应商" }),
    );
    expect(providerRow).toHaveTextContent("已停用");
  });

  it("shows model config fallback controls and prompt template metadata without raw prompt bodies", () => {
    const rawPromptBody = "RAW_PROMPT_BODY_DO_NOT_RENDER";

    render(
      createElement(AdminModelConfigManagement, {
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
      }),
    );

    expect(screen.getByRole("tab", { name: "模型供应商" })).toHaveClass(
      "active:scale-[0.98]",
    );
    fireEvent.click(screen.getByRole("tab", { name: "模型配置" }));
    expect(screen.getByRole("tab", { name: "模型配置" })).toHaveClass(
      "active:scale-[0.98]",
    );
    const configRow = screen.getByTestId(
      "admin-model-config-model-config-public-001",
    );
    expect(configRow).toHaveTextContent("备用：标识符已隐藏");
    expect(configRow).not.toHaveTextContent("model-config-public-fallback");
    expect(configRow).toHaveTextContent("优先级： 10");
    expect(configRow).toHaveTextContent("脱敏元数据");
    fireEvent.click(
      within(configRow).getByRole("button", { name: "测试连接" }),
    );
    expect(configRow).toHaveTextContent("连接测试：已通过");

    fireEvent.click(
      within(configRow).getByRole("button", { name: "禁用配置" }),
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

  it("shows Prompt full text only when the prompt DTO and role both allow it", () => {
    const promptFullText = "READ_ONLY_PROMPT_FULL_TEXT";

    render(
      createElement(AdminModelConfigManagement, {
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

  it("hides provider and model config mutation actions in read-only role mode", () => {
    render(
      createElement(AdminModelConfigManagement, {
        canManageModelConfig: false,
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

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
            status: "active",
            isActive: true,
            updatedAt: "2026-05-26T00:00:00.000Z",
          },
        ],
      }),
    );

    fireEvent.click(screen.getByRole("tab", { name: "模型配置" }));
    const configRow = screen.getByTestId(
      "admin-model-config-model-config-public-001",
    );
    expect(configRow).toHaveTextContent("备用：标识符已隐藏");
    expect(configRow).not.toHaveTextContent("model-config-public-fallback");
    expect(configRow).toHaveTextContent("优先级： 10");
    expect(configRow).toHaveTextContent("脱敏元数据");

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
    expect(document.body.textContent).not.toContain(rawPromptBody);

    fireEvent.change(screen.getByLabelText("模板标识"), {
      target: { value: "ai_explanation_v1" },
    });
    fireEvent.change(screen.getByLabelText("模板标题"), {
      target: { value: "Explanation V1" },
    });
    fireEvent.change(screen.getByLabelText("正文摘要"), {
      target: { value: "sha256:explanation" },
    });
    fireEvent.change(screen.getByLabelText("脱敏正文预览"), {
      target: { value: "Explanation preview [redacted]" },
    });
    fireEvent.click(screen.getByRole("button", { name: "保存模板" }));

    expect(screen.getByText("Explanation V1")).toBeInTheDocument();
    expect(document.body.textContent).not.toContain(rawPromptBody);
  });
});

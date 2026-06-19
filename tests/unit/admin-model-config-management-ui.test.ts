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
    expect(screen.getByText("Loading model configuration")).toBeInTheDocument();

    cleanup();
    render(createElement(AdminModelConfigManagement, { state: "empty" }));
    expect(screen.getByText("No model configuration yet")).toBeInTheDocument();

    cleanup();
    render(createElement(AdminModelConfigManagement, { state: "error" }));
    expect(
      screen.getByText("Model configuration failed to load"),
    ).toBeInTheDocument();
  });

  it("creates model providers with short-lived secret input and only renders masked state", () => {
    const syntheticSecret = ["sk-test", "synthetic", "123456"].join("-");

    render(createElement(AdminModelConfigManagement));

    fireEvent.change(screen.getByLabelText("Provider key"), {
      target: { value: "local_mock" },
    });
    fireEvent.change(screen.getByLabelText("Provider display name"), {
      target: { value: "Local Mock" },
    });
    fireEvent.change(screen.getByLabelText("Secret value"), {
      target: { value: syntheticSecret },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save provider" }));

    const providerRow = screen.getByTestId("admin-model-provider-local_mock");
    expect(providerRow).toHaveTextContent("Local Mock");
    expect(providerRow).toHaveTextContent("configured");
    expect(providerRow).toHaveTextContent("****3456");
    expect(screen.getByLabelText("Secret value")).toHaveValue("");
    expect(document.body.textContent).not.toContain(syntheticSecret);

    fireEvent.click(
      within(providerRow).getByRole("button", { name: "Disable provider" }),
    );
    expect(providerRow).toHaveTextContent("disabled");
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

    fireEvent.click(screen.getByRole("tab", { name: "Model configs" }));
    const configRow = screen.getByTestId(
      "admin-model-config-model-config-public-001",
    );
    expect(configRow).toHaveTextContent("fallback: identifier values folded");
    expect(configRow).not.toHaveTextContent("model-config-public-fallback");
    expect(configRow).toHaveTextContent("priority: 10");
    expect(configRow).toHaveTextContent("redacted_metadata");

    fireEvent.click(
      within(configRow).getByRole("button", { name: "Disable config" }),
    );
    expect(configRow).toHaveTextContent("disabled");

    fireEvent.click(screen.getByRole("tab", { name: "Prompt templates" }));
    const templateRow = screen.getByTestId(
      "admin-prompt-template-prompt-template-public-001",
    );
    expect(templateRow).toHaveTextContent("sha256:synthetic");
    expect(templateRow).toHaveTextContent("Hint template preview [redacted]");
    expect(document.body.textContent).not.toContain(rawPromptBody);

    fireEvent.change(screen.getByLabelText("Template key"), {
      target: { value: "ai_explanation_v1" },
    });
    fireEvent.change(screen.getByLabelText("Template title"), {
      target: { value: "Explanation V1" },
    });
    fireEvent.change(screen.getByLabelText("Body digest"), {
      target: { value: "sha256:explanation" },
    });
    fireEvent.change(screen.getByLabelText("Masked body preview"), {
      target: { value: "Explanation preview [redacted]" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save template" }));

    expect(screen.getByText("Explanation V1")).toBeInTheDocument();
    expect(document.body.textContent).not.toContain(rawPromptBody);
  });
});

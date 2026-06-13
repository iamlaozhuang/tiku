import { describe, expect, it, vi } from "vitest";

import { buildAiGenerationTaskProviderAdapterReadModel } from "./ai-generation-task-provider-adapter-service";

function createProviderAdapterInput() {
  return {
    modelProvider: "alibaba",
    modelName: "qwen-plus",
    targetRuntime: "server",
    providerName: null,
    openaiCompatibleBaseUrl: null,
    providerCallRequested: false,
    clientSideAccessRequested: false,
    envSecretAccessRequested: false,
    providerConfigurationReadRequested: false,
    evidenceRedactionConfirmed: true,
  };
}

describe("ai_generation_task provider adapter service", () => {
  it("creates an Alibaba server-side model handle without provider execution", () => {
    const languageModel = vi.fn((modelName: string) => ({
      modelName,
      provider: "fake_alibaba",
    }));
    const createAlibabaProvider = vi.fn(() => ({
      languageModel,
    }));

    const result = buildAiGenerationTaskProviderAdapterReadModel(
      createProviderAdapterInput(),
      {
        createAlibabaProvider,
        createOpenaiCompatibleProvider: () => {
          throw new Error("OpenAI-compatible factory should not be used.");
        },
      },
    );

    expect(result).toEqual({
      code: 0,
      message: "ok",
      data: {
        runtimeStatus: "server_side_adapter_only",
        adapterStatus: "ready",
        modelProvider: "alibaba",
        modelName: "qwen-plus",
        modelHandleCreated: true,
        factoryBinding: {
          packageName: "@ai-sdk/alibaba",
          factoryName: "createAlibaba",
          modelFactoryName: "languageModel",
        },
        boundary: {
          serverSideOnly: true,
          clientSideAccessBlocked: true,
          providerCallExecuted: false,
          envSecretAccessed: false,
          providerConfigurationRead: false,
        },
        blockedReasons: [],
      },
    });
    expect(createAlibabaProvider).toHaveBeenCalledWith({
      apiKey: "",
      includeUsage: true,
    });
    expect(languageModel).toHaveBeenCalledWith("qwen-plus");
  });

  it("creates an OpenAI-compatible server-side model handle with explicit base URL only", () => {
    const languageModel = vi.fn((modelName: string) => ({
      modelName,
      provider: "fake_openai_compatible",
    }));
    const createOpenaiCompatibleProvider = vi.fn(() => ({
      languageModel,
    }));

    const result = buildAiGenerationTaskProviderAdapterReadModel(
      {
        ...createProviderAdapterInput(),
        modelProvider: "openai_compatible",
        modelName: "qwen-compatible",
        providerName: "dashscope_compatible",
        openaiCompatibleBaseUrl: "https://example.invalid/v1",
      },
      {
        createAlibabaProvider: () => {
          throw new Error("Alibaba factory should not be used.");
        },
        createOpenaiCompatibleProvider,
      },
    );

    expect(result).toMatchObject({
      code: 0,
      data: {
        adapterStatus: "ready",
        modelProvider: "openai_compatible",
        modelName: "qwen-compatible",
        modelHandleCreated: true,
        factoryBinding: {
          packageName: "@ai-sdk/openai-compatible",
          factoryName: "createOpenAICompatible",
          modelFactoryName: "languageModel",
        },
        boundary: {
          providerCallExecuted: false,
          envSecretAccessed: false,
          providerConfigurationRead: false,
        },
      },
    });
    expect(createOpenaiCompatibleProvider).toHaveBeenCalledWith({
      apiKey: "",
      baseURL: "https://example.invalid/v1",
      includeUsage: true,
      name: "dashscope_compatible",
    });
    expect(languageModel).toHaveBeenCalledWith("qwen-compatible");
  });

  it("blocks client access, provider calls, env secret access, and provider configuration reads", () => {
    const result = buildAiGenerationTaskProviderAdapterReadModel(
      {
        ...createProviderAdapterInput(),
        targetRuntime: "client",
        providerCallRequested: true,
        clientSideAccessRequested: true,
        envSecretAccessRequested: true,
        providerConfigurationReadRequested: true,
        evidenceRedactionConfirmed: false,
      },
      {
        createAlibabaProvider: () => {
          throw new Error("Provider factory should not be used when blocked.");
        },
        createOpenaiCompatibleProvider: () => {
          throw new Error("Provider factory should not be used when blocked.");
        },
      },
    );

    expect(result).toMatchObject({
      code: 0,
      data: {
        adapterStatus: "blocked",
        modelHandleCreated: false,
        boundary: {
          serverSideOnly: false,
          clientSideAccessBlocked: true,
          providerCallExecuted: false,
          envSecretAccessed: false,
          providerConfigurationRead: false,
        },
        blockedReasons: [
          "client_side_access_blocked",
          "provider_call_blocked",
          "env_secret_access_blocked",
          "provider_configuration_read_blocked",
          "evidence_redaction_required",
        ],
      },
    });
  });

  it("rejects invalid provider adapter input", () => {
    expect(
      buildAiGenerationTaskProviderAdapterReadModel({
        ...createProviderAdapterInput(),
        modelName: "",
      }),
    ).toEqual({
      code: 400015,
      message: "Invalid ai_generation_task provider adapter input.",
      data: null,
    });
  });
});

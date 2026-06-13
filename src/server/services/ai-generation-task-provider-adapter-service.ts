import { createAlibaba } from "@ai-sdk/alibaba";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type {
  AiGenerationTaskProviderAdapterBlockedReason,
  AiGenerationTaskProviderAdapterDto,
  AiGenerationTaskProviderAdapterFactoryBindingDto,
} from "../contracts/ai-generation-task-provider-adapter-contract";
import {
  normalizeAiGenerationTaskProviderAdapterInput,
  type AiGenerationTaskProviderAdapterInput,
} from "../validators/ai-generation-task-provider-adapter";

const INVALID_AI_GENERATION_TASK_PROVIDER_ADAPTER_INPUT_CODE = 400015;

export type AiGenerationTaskProviderAlibabaFactorySettings = {
  apiKey: "";
  includeUsage: true;
};

export type AiGenerationTaskProviderOpenaiCompatibleFactorySettings = {
  apiKey: "";
  baseURL: string;
  includeUsage: true;
  name: string;
};

export type AiGenerationTaskProviderLanguageModelFactory = {
  languageModel: (modelName: string) => unknown;
};

export type AiGenerationTaskProviderAdapterFactories = {
  createAlibabaProvider: (
    settings: AiGenerationTaskProviderAlibabaFactorySettings,
  ) => AiGenerationTaskProviderLanguageModelFactory;
  createOpenaiCompatibleProvider: (
    settings: AiGenerationTaskProviderOpenaiCompatibleFactorySettings,
  ) => AiGenerationTaskProviderLanguageModelFactory;
};

const defaultAiGenerationTaskProviderAdapterFactories: AiGenerationTaskProviderAdapterFactories =
  {
    createAlibabaProvider: (settings) => createAlibaba(settings),
    createOpenaiCompatibleProvider: (settings) =>
      createOpenAICompatible(settings),
  };

function resolveAdapterBlockedReasons(
  input: AiGenerationTaskProviderAdapterInput,
): AiGenerationTaskProviderAdapterBlockedReason[] {
  return [
    input.targetRuntime !== "server" || input.clientSideAccessRequested
      ? "client_side_access_blocked"
      : null,
    input.providerCallRequested ? "provider_call_blocked" : null,
    input.envSecretAccessRequested ? "env_secret_access_blocked" : null,
    input.providerConfigurationReadRequested
      ? "provider_configuration_read_blocked"
      : null,
    !input.evidenceRedactionConfirmed ? "evidence_redaction_required" : null,
    input.modelProvider === "openai_compatible" &&
    input.openaiCompatibleBaseUrl === null
      ? "openai_compatible_base_url_required"
      : null,
  ].filter(
    (reason): reason is AiGenerationTaskProviderAdapterBlockedReason =>
      reason !== null,
  );
}

function resolveFactoryBinding(
  input: AiGenerationTaskProviderAdapterInput,
): AiGenerationTaskProviderAdapterFactoryBindingDto {
  if (input.modelProvider === "alibaba") {
    return {
      packageName: "@ai-sdk/alibaba",
      factoryName: "createAlibaba",
      modelFactoryName: "languageModel",
    };
  }

  return {
    packageName: "@ai-sdk/openai-compatible",
    factoryName: "createOpenAICompatible",
    modelFactoryName: "languageModel",
  };
}

function createProviderLanguageModelHandle(
  input: AiGenerationTaskProviderAdapterInput,
  factories: AiGenerationTaskProviderAdapterFactories,
): void {
  if (input.modelProvider === "alibaba") {
    const providerFactory = factories.createAlibabaProvider({
      apiKey: "",
      includeUsage: true,
    });

    void providerFactory.languageModel(input.modelName);
    return;
  }

  const providerFactory = factories.createOpenaiCompatibleProvider({
    apiKey: "",
    baseURL: input.openaiCompatibleBaseUrl ?? "",
    includeUsage: true,
    name: input.providerName ?? "openai_compatible",
  });

  void providerFactory.languageModel(input.modelName);
}

function mapAiGenerationTaskProviderAdapterToDto(
  input: AiGenerationTaskProviderAdapterInput,
  factories: AiGenerationTaskProviderAdapterFactories,
): AiGenerationTaskProviderAdapterDto {
  const blockedReasons = resolveAdapterBlockedReasons(input);
  const modelHandleCreated = blockedReasons.length === 0;

  if (modelHandleCreated) {
    createProviderLanguageModelHandle(input, factories);
  }

  return {
    runtimeStatus: "server_side_adapter_only",
    adapterStatus: modelHandleCreated ? "ready" : "blocked",
    modelProvider: input.modelProvider,
    modelName: input.modelName,
    modelHandleCreated,
    factoryBinding: resolveFactoryBinding(input),
    boundary: {
      serverSideOnly:
        input.targetRuntime === "server" && !input.clientSideAccessRequested,
      clientSideAccessBlocked: true,
      providerCallExecuted: false,
      envSecretAccessed: false,
      providerConfigurationRead: false,
    },
    blockedReasons,
  };
}

export function buildAiGenerationTaskProviderAdapterReadModel(
  input: unknown,
  factories: AiGenerationTaskProviderAdapterFactories = defaultAiGenerationTaskProviderAdapterFactories,
): ApiResponse<AiGenerationTaskProviderAdapterDto | null> {
  const aiGenerationTaskProviderAdapterInput =
    normalizeAiGenerationTaskProviderAdapterInput(input);

  if (!aiGenerationTaskProviderAdapterInput.success) {
    return createErrorResponse(
      INVALID_AI_GENERATION_TASK_PROVIDER_ADAPTER_INPUT_CODE,
      aiGenerationTaskProviderAdapterInput.message,
    );
  }

  return createSuccessResponse(
    mapAiGenerationTaskProviderAdapterToDto(
      aiGenerationTaskProviderAdapterInput.value,
      factories,
    ),
  );
}

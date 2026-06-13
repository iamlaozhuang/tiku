export const aiGenerationTaskProviderAdapterModelProviderValues = [
  "alibaba",
  "openai_compatible",
] as const;

export type AiGenerationTaskProviderAdapterModelProvider =
  (typeof aiGenerationTaskProviderAdapterModelProviderValues)[number];

export const aiGenerationTaskProviderAdapterTargetRuntimeValues = [
  "server",
  "client",
] as const;

export type AiGenerationTaskProviderAdapterTargetRuntime =
  (typeof aiGenerationTaskProviderAdapterTargetRuntimeValues)[number];

export type AiGenerationTaskProviderAdapterStatus = "ready" | "blocked";

export type AiGenerationTaskProviderAdapterRuntimeStatus =
  "server_side_adapter_only";

export type AiGenerationTaskProviderAdapterBlockedReason =
  | "client_side_access_blocked"
  | "provider_call_blocked"
  | "env_secret_access_blocked"
  | "provider_configuration_read_blocked"
  | "evidence_redaction_required"
  | "openai_compatible_base_url_required";

export type AiGenerationTaskProviderAdapterFactoryBindingDto = {
  packageName: "@ai-sdk/alibaba" | "@ai-sdk/openai-compatible";
  factoryName: "createAlibaba" | "createOpenAICompatible";
  modelFactoryName: "languageModel";
};

export type AiGenerationTaskProviderAdapterBoundaryDto = {
  serverSideOnly: boolean;
  clientSideAccessBlocked: true;
  providerCallExecuted: false;
  envSecretAccessed: false;
  providerConfigurationRead: false;
};

export type AiGenerationTaskProviderAdapterDto = {
  runtimeStatus: AiGenerationTaskProviderAdapterRuntimeStatus;
  adapterStatus: AiGenerationTaskProviderAdapterStatus;
  modelProvider: AiGenerationTaskProviderAdapterModelProvider;
  modelName: string;
  modelHandleCreated: boolean;
  factoryBinding: AiGenerationTaskProviderAdapterFactoryBindingDto;
  boundary: AiGenerationTaskProviderAdapterBoundaryDto;
  blockedReasons: AiGenerationTaskProviderAdapterBlockedReason[];
};

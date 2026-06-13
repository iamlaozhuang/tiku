import {
  aiGenerationTaskProviderAdapterModelProviderValues,
  aiGenerationTaskProviderAdapterTargetRuntimeValues,
  type AiGenerationTaskProviderAdapterModelProvider,
  type AiGenerationTaskProviderAdapterTargetRuntime,
} from "../contracts/ai-generation-task-provider-adapter-contract";

export type AiGenerationTaskProviderAdapterInput = {
  modelProvider: AiGenerationTaskProviderAdapterModelProvider;
  modelName: string;
  targetRuntime: AiGenerationTaskProviderAdapterTargetRuntime;
  providerName: string | null;
  openaiCompatibleBaseUrl: string | null;
  providerCallRequested: boolean;
  clientSideAccessRequested: boolean;
  envSecretAccessRequested: boolean;
  providerConfigurationReadRequested: boolean;
  evidenceRedactionConfirmed: boolean;
};

export type AiGenerationTaskProviderAdapterValidationResult =
  | {
      success: true;
      value: AiGenerationTaskProviderAdapterInput;
    }
  | {
      success: false;
      message: string;
    };

const INVALID_AI_GENERATION_TASK_PROVIDER_ADAPTER_INPUT_MESSAGE =
  "Invalid ai_generation_task provider adapter input.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeRequiredText(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const text = value.trim();

  return text.length === 0 ? null : text;
}

function normalizeOptionalText(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  return normalizeRequiredText(value);
}

function normalizeBoolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function normalizeModelProvider(
  value: unknown,
): AiGenerationTaskProviderAdapterModelProvider | null {
  const text = normalizeRequiredText(value);

  return text !== null &&
    aiGenerationTaskProviderAdapterModelProviderValues.includes(
      text as AiGenerationTaskProviderAdapterModelProvider,
    )
    ? (text as AiGenerationTaskProviderAdapterModelProvider)
    : null;
}

function normalizeTargetRuntime(
  value: unknown,
): AiGenerationTaskProviderAdapterTargetRuntime | null {
  const text = normalizeRequiredText(value);

  return text !== null &&
    aiGenerationTaskProviderAdapterTargetRuntimeValues.includes(
      text as AiGenerationTaskProviderAdapterTargetRuntime,
    )
    ? (text as AiGenerationTaskProviderAdapterTargetRuntime)
    : null;
}

export function normalizeAiGenerationTaskProviderAdapterInput(
  input: unknown,
): AiGenerationTaskProviderAdapterValidationResult {
  if (!isRecord(input)) {
    return {
      success: false,
      message: INVALID_AI_GENERATION_TASK_PROVIDER_ADAPTER_INPUT_MESSAGE,
    };
  }

  const modelProvider = normalizeModelProvider(input.modelProvider);
  const modelName = normalizeRequiredText(input.modelName);
  const targetRuntime = normalizeTargetRuntime(input.targetRuntime);
  const providerName = normalizeOptionalText(input.providerName);
  const openaiCompatibleBaseUrl = normalizeOptionalText(
    input.openaiCompatibleBaseUrl,
  );
  const providerCallRequested = normalizeBoolean(input.providerCallRequested);
  const clientSideAccessRequested = normalizeBoolean(
    input.clientSideAccessRequested,
  );
  const envSecretAccessRequested = normalizeBoolean(
    input.envSecretAccessRequested,
  );
  const providerConfigurationReadRequested = normalizeBoolean(
    input.providerConfigurationReadRequested,
  );
  const evidenceRedactionConfirmed = normalizeBoolean(
    input.evidenceRedactionConfirmed,
  );

  if (
    modelProvider === null ||
    modelName === null ||
    targetRuntime === null ||
    providerCallRequested === null ||
    clientSideAccessRequested === null ||
    envSecretAccessRequested === null ||
    providerConfigurationReadRequested === null ||
    evidenceRedactionConfirmed === null
  ) {
    return {
      success: false,
      message: INVALID_AI_GENERATION_TASK_PROVIDER_ADAPTER_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      modelProvider,
      modelName,
      targetRuntime,
      providerName,
      openaiCompatibleBaseUrl,
      providerCallRequested,
      clientSideAccessRequested,
      envSecretAccessRequested,
      providerConfigurationReadRequested,
      evidenceRedactionConfirmed,
    },
  };
}

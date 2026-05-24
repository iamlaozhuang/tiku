import {
  createModelConfigSnapshot,
  type AiFuncType,
  type ModelConfigSnapshot,
} from "../models/ai-rag";

export type ModelConfigRuntimePromptTemplate = {
  promptTemplateKey: string;
  version: number;
  templateHash: string;
};

export type ModelConfigRuntimeRecord = {
  modelConfigSnapshot: ModelConfigSnapshot;
  promptTemplate: ModelConfigRuntimePromptTemplate;
  isEnabled: boolean;
  priority: number;
};

export type ModelConfigRuntimeCatalog = {
  records: ModelConfigRuntimeRecord[];
};

export type ModelConfigRuntimeCatalogOverrides = Record<
  string,
  Partial<
    Pick<ModelConfigRuntimeRecord, "isEnabled" | "priority"> & {
      fallbackModelConfigPublicId: string | null;
    }
  >
>;

export type ModelConfigRuntimeSelection =
  | {
      status: "selected";
      selectionReason: "primary" | "fallback";
      fallbackFromModelConfigPublicId: string | null;
      modelConfigSnapshot: ModelConfigSnapshot;
      promptTemplate: ModelConfigRuntimePromptTemplate;
    }
  | {
      status: "unavailable";
      reason:
        | "model_config_not_found"
        | "primary_model_config_disabled"
        | "fallback_not_allowed_for_ai_func_type"
        | "fallback_model_config_not_found"
        | "fallback_model_config_disabled"
        | "fallback_ai_func_type_mismatch";
      primaryModelConfigPublicId: string | null;
      fallbackModelConfigPublicId?: string;
    };

export type ResolveModelConfigRuntimeInput = {
  aiFuncType: AiFuncType;
  preferredModelConfigPublicId?: string;
  allowFallback: boolean;
};

const fallbackAllowedAiFuncTypes = new Set<AiFuncType>([
  "explanation",
  "hint",
  "kn_recommendation",
  "learning_suggestion",
]);

function createLocalRecord(input: {
  providerPublicId?: string;
  providerKey?: string;
  providerDisplayName?: string;
  modelConfigPublicId: string;
  aiFuncType: AiFuncType;
  modelName: string;
  displayName: string;
  configVersion?: number;
  timeoutSecond?: number;
  maxRetryCount?: number;
  fallbackModelConfigPublicId: string | null;
  promptTemplateKey: string;
  promptTemplateVersion?: number;
  promptTemplateHash: string;
  isEnabled: boolean;
  priority: number;
}): ModelConfigRuntimeRecord {
  return {
    modelConfigSnapshot: createModelConfigSnapshot({
      providerPublicId: input.providerPublicId ?? "model-provider-dev-mock",
      providerKey: input.providerKey ?? "mock",
      providerDisplayName: input.providerDisplayName ?? "Local Mock AI",
      modelConfigPublicId: input.modelConfigPublicId,
      aiFuncType: input.aiFuncType,
      modelName: input.modelName,
      displayName: input.displayName,
      configVersion: input.configVersion ?? 1,
      timeoutSecond: input.timeoutSecond ?? 5,
      maxRetryCount: input.maxRetryCount ?? 1,
      fallbackModelConfigPublicId: input.fallbackModelConfigPublicId,
      promptTemplateKey: input.promptTemplateKey,
      promptTemplateVersion: input.promptTemplateVersion ?? 1,
    }),
    promptTemplate: {
      promptTemplateKey: input.promptTemplateKey,
      version: input.promptTemplateVersion ?? 1,
      templateHash: input.promptTemplateHash,
    },
    isEnabled: input.isEnabled,
    priority: input.priority,
  };
}

function applyRecordOverride(
  record: ModelConfigRuntimeRecord,
  overrides: ModelConfigRuntimeCatalogOverrides,
): ModelConfigRuntimeRecord {
  const override =
    overrides[record.modelConfigSnapshot.modelConfigPublicId] ?? {};

  return {
    ...record,
    isEnabled: override.isEnabled ?? record.isEnabled,
    priority: override.priority ?? record.priority,
    modelConfigSnapshot:
      override.fallbackModelConfigPublicId === undefined
        ? record.modelConfigSnapshot
        : {
            ...record.modelConfigSnapshot,
            fallbackModelConfigPublicId: override.fallbackModelConfigPublicId,
          },
  };
}

export function createLocalModelConfigRuntimeCatalog(
  input: { overrides?: ModelConfigRuntimeCatalogOverrides } = {},
): ModelConfigRuntimeCatalog {
  const records: ModelConfigRuntimeRecord[] = [
    createLocalRecord({
      modelConfigPublicId: "model-config-dev-ai-scoring",
      aiFuncType: "scoring",
      modelName: "mock-ai-scoring",
      displayName: "Local mock scoring",
      maxRetryCount: 3,
      fallbackModelConfigPublicId: null,
      promptTemplateKey: "dev_ai_scoring_v1",
      promptTemplateHash: "dev-ai-scoring-template-v1",
      isEnabled: true,
      priority: 10,
    }),
    createLocalRecord({
      modelConfigPublicId: "model-config-dev-ai-scoring-fallback",
      aiFuncType: "scoring",
      modelName: "mock-ai-scoring-fallback",
      displayName: "Local mock scoring fallback",
      maxRetryCount: 3,
      fallbackModelConfigPublicId: null,
      promptTemplateKey: "dev_ai_scoring_v1",
      promptTemplateHash: "dev-ai-scoring-template-v1",
      isEnabled: false,
      priority: 20,
    }),
    createLocalRecord({
      modelConfigPublicId: "model-config-dev-ai-explanation",
      aiFuncType: "explanation",
      modelName: "mock-ai-explanation",
      displayName: "Local mock explanation",
      fallbackModelConfigPublicId: "model-config-dev-ai-explanation-fallback",
      promptTemplateKey: "dev_ai_explanation_v1",
      promptTemplateHash: "dev-ai-explanation-template-v1",
      isEnabled: true,
      priority: 10,
    }),
    createLocalRecord({
      modelConfigPublicId: "model-config-dev-ai-explanation-fallback",
      aiFuncType: "explanation",
      modelName: "mock-ai-explanation-fallback",
      displayName: "Local mock explanation fallback",
      fallbackModelConfigPublicId: null,
      promptTemplateKey: "dev_ai_explanation_v1",
      promptTemplateHash: "dev-ai-explanation-template-v1",
      isEnabled: true,
      priority: 20,
    }),
    createLocalRecord({
      modelConfigPublicId: "model-config-dev-ai-hint",
      aiFuncType: "hint",
      modelName: "mock-ai-hint",
      displayName: "Local mock hint",
      fallbackModelConfigPublicId: null,
      promptTemplateKey: "dev_ai_hint_v1",
      promptTemplateHash: "dev-ai-hint-template-v1",
      isEnabled: true,
      priority: 10,
    }),
    createLocalRecord({
      providerPublicId: "model-provider-dev-local",
      providerKey: "local_deterministic",
      providerDisplayName: "Local deterministic provider",
      modelConfigPublicId: "model-config-dev-kn-recommendation",
      aiFuncType: "kn_recommendation",
      modelName: "local-kn-recommendation-v1",
      displayName: "Local knowledge recommendation model",
      timeoutSecond: 10,
      maxRetryCount: 0,
      fallbackModelConfigPublicId: null,
      promptTemplateKey: "dev_kn_recommendation_v1",
      promptTemplateHash: "dev_kn_recommendation_v1_local_deterministic",
      isEnabled: true,
      priority: 10,
    }),
    createLocalRecord({
      modelConfigPublicId: "model-config-dev-learning-suggestion",
      aiFuncType: "learning_suggestion",
      modelName: "mock-learning-suggestion",
      displayName: "Local mock learning suggestion",
      maxRetryCount: 0,
      fallbackModelConfigPublicId:
        "model-config-dev-learning-suggestion-fallback",
      promptTemplateKey: "dev_learning_suggestion",
      promptTemplateHash: "dev-learning-suggestion-template-v1",
      isEnabled: true,
      priority: 10,
    }),
    createLocalRecord({
      modelConfigPublicId: "model-config-dev-learning-suggestion-fallback",
      aiFuncType: "learning_suggestion",
      modelName: "mock-learning-suggestion-fallback",
      displayName: "Local mock learning suggestion fallback",
      maxRetryCount: 0,
      fallbackModelConfigPublicId: null,
      promptTemplateKey: "dev_learning_suggestion",
      promptTemplateHash: "dev-learning-suggestion-template-v1",
      isEnabled: true,
      priority: 20,
    }),
  ];

  return {
    records: records.map((record) =>
      applyRecordOverride(record, input.overrides ?? {}),
    ),
  };
}

function findPrimaryRecord(
  catalog: ModelConfigRuntimeCatalog,
  input: ResolveModelConfigRuntimeInput,
): ModelConfigRuntimeRecord | null {
  if (input.preferredModelConfigPublicId !== undefined) {
    return (
      catalog.records.find(
        (record) =>
          record.modelConfigSnapshot.modelConfigPublicId ===
          input.preferredModelConfigPublicId,
      ) ?? null
    );
  }

  return (
    catalog.records
      .filter(
        (record) => record.modelConfigSnapshot.aiFuncType === input.aiFuncType,
      )
      .sort((left, right) => left.priority - right.priority)[0] ?? null
  );
}

function selectRecord(
  record: ModelConfigRuntimeRecord,
  input: {
    selectionReason: "primary" | "fallback";
    fallbackFromModelConfigPublicId: string | null;
  },
): ModelConfigRuntimeSelection {
  return {
    status: "selected",
    selectionReason: input.selectionReason,
    fallbackFromModelConfigPublicId: input.fallbackFromModelConfigPublicId,
    modelConfigSnapshot: record.modelConfigSnapshot,
    promptTemplate: record.promptTemplate,
  };
}

export function createModelConfigRuntimeResolver(
  catalog: ModelConfigRuntimeCatalog,
) {
  return {
    resolve(
      input: ResolveModelConfigRuntimeInput,
    ): ModelConfigRuntimeSelection {
      const primaryRecord = findPrimaryRecord(catalog, input);

      if (primaryRecord === null) {
        return {
          status: "unavailable",
          reason: "model_config_not_found",
          primaryModelConfigPublicId:
            input.preferredModelConfigPublicId ?? null,
        };
      }

      const primaryModelConfigPublicId =
        primaryRecord.modelConfigSnapshot.modelConfigPublicId;

      if (primaryRecord.modelConfigSnapshot.aiFuncType !== input.aiFuncType) {
        return {
          status: "unavailable",
          reason: "model_config_not_found",
          primaryModelConfigPublicId,
        };
      }

      if (primaryRecord.isEnabled) {
        return selectRecord(primaryRecord, {
          selectionReason: "primary",
          fallbackFromModelConfigPublicId: null,
        });
      }

      const fallbackModelConfigPublicId =
        primaryRecord.modelConfigSnapshot.fallbackModelConfigPublicId;

      if (
        !input.allowFallback ||
        !fallbackAllowedAiFuncTypes.has(input.aiFuncType)
      ) {
        return {
          status: "unavailable",
          reason: input.allowFallback
            ? "fallback_not_allowed_for_ai_func_type"
            : "primary_model_config_disabled",
          primaryModelConfigPublicId,
        };
      }

      if (fallbackModelConfigPublicId === null) {
        return {
          status: "unavailable",
          reason: "fallback_model_config_not_found",
          primaryModelConfigPublicId,
        };
      }

      const fallbackRecord =
        catalog.records.find(
          (record) =>
            record.modelConfigSnapshot.modelConfigPublicId ===
            fallbackModelConfigPublicId,
        ) ?? null;

      if (fallbackRecord === null) {
        return {
          status: "unavailable",
          reason: "fallback_model_config_not_found",
          primaryModelConfigPublicId,
          fallbackModelConfigPublicId,
        };
      }

      if (fallbackRecord.modelConfigSnapshot.aiFuncType !== input.aiFuncType) {
        return {
          status: "unavailable",
          reason: "fallback_ai_func_type_mismatch",
          primaryModelConfigPublicId,
          fallbackModelConfigPublicId,
        };
      }

      if (!fallbackRecord.isEnabled) {
        return {
          status: "unavailable",
          reason: "fallback_model_config_disabled",
          primaryModelConfigPublicId,
          fallbackModelConfigPublicId,
        };
      }

      return selectRecord(fallbackRecord, {
        selectionReason: "fallback",
        fallbackFromModelConfigPublicId: primaryModelConfigPublicId,
      });
    },
  };
}

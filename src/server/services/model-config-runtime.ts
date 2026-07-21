import {
  createModelConfigSnapshot,
  type AiFuncType,
  type ModelConfigSnapshot,
} from "../models/ai-rag";
import type {
  AdminAiFunctionType,
  ModelConfigRuntimeAlignmentDto,
  ModelConfigSummaryDto,
  PromptTemplateSummaryDto,
} from "../contracts/admin-ai-audit-log-ops-contract";

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
  executionMode: "governed_provider" | "local_fixture";
};

export type RedactedModelConfigRuntimeSnapshot = {
  providerPublicId: string;
  providerKey: string;
  providerDisplayName: string;
  modelConfigPublicId: string;
  aiFuncType: AiFuncType;
  modelName: string;
  displayName: string;
  configVersion: number;
  pricingVersion: string | null;
  inputTokenPriceCnyPerMillion: string | null;
  outputTokenPriceCnyPerMillion: string | null;
  timeoutSecond: number;
  maxRetryCount: number;
  fallbackModelConfigPublicId: string | null;
  promptTemplateKey: string;
  promptTemplateVersion: number;
  snapshotPolicy: "redacted_metadata";
  providerMode: "governed_provider" | "local_fixture" | "local_mock";
};

export type ModelConfigRuntimeCatalog = {
  records: ModelConfigRuntimeRecord[];
};

export type PersistedModelConfigRuntimeCatalogInput = {
  modelConfigs: ModelConfigSummaryDto[];
  promptTemplates: PromptTemplateSummaryDto[];
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
      redactedModelConfigMetadata: RedactedModelConfigRuntimeSnapshot;
      promptTemplate: ModelConfigRuntimePromptTemplate;
      executionMode: "governed_provider" | "local_fixture";
    }
  | {
      status: "unavailable";
      reason:
        | "model_config_not_found"
        | "primary_model_config_disabled"
        | "fallback_not_allowed_for_ai_func_type"
        | "fallback_model_config_not_found"
        | "fallback_model_config_disabled"
        | "fallback_ai_func_type_mismatch"
        | "fixture_not_allowed";
      primaryModelConfigPublicId: string | null;
      fallbackModelConfigPublicId?: string;
    };

export type ResolveModelConfigRuntimeInput = {
  aiFuncType: AiFuncType;
  preferredModelConfigPublicId?: string;
  allowFallback: boolean;
  allowFixture?: boolean;
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
    executionMode: "local_fixture",
  };
}

export function createRedactedModelConfigRuntimeSnapshot(
  snapshot: ModelConfigSnapshot,
  providerMode: RedactedModelConfigRuntimeSnapshot["providerMode"] = "governed_provider",
): RedactedModelConfigRuntimeSnapshot {
  return {
    providerPublicId: snapshot.providerPublicId,
    providerKey: snapshot.providerKey,
    providerDisplayName: snapshot.providerDisplayName,
    modelConfigPublicId: snapshot.modelConfigPublicId,
    aiFuncType: snapshot.aiFuncType,
    modelName: snapshot.modelName,
    displayName: snapshot.displayName,
    configVersion: snapshot.configVersion,
    pricingVersion: snapshot.pricingVersion,
    inputTokenPriceCnyPerMillion: snapshot.inputTokenPriceCnyPerMillion,
    outputTokenPriceCnyPerMillion: snapshot.outputTokenPriceCnyPerMillion,
    timeoutSecond: snapshot.timeoutSecond,
    maxRetryCount: snapshot.maxRetryCount,
    fallbackModelConfigPublicId: snapshot.fallbackModelConfigPublicId,
    promptTemplateKey: snapshot.promptTemplateKey,
    promptTemplateVersion: snapshot.promptTemplateVersion,
    snapshotPolicy: "redacted_metadata",
    providerMode,
  };
}

function toRuntimeAiFuncType(value: AdminAiFunctionType): AiFuncType {
  if (value === "ai_scoring") {
    return "scoring";
  }

  if (value === "ai_explanation") {
    return "explanation";
  }

  if (value === "ai_hint") {
    return "hint";
  }

  return value;
}

function toDefaultPromptTemplateKey(aiFuncType: AiFuncType): string {
  if (aiFuncType === "scoring") {
    return "ai_scoring_v1";
  }

  if (aiFuncType === "explanation") {
    return "ai_explanation_v1";
  }

  if (aiFuncType === "hint") {
    return "ai_hint_v1";
  }

  return `${aiFuncType}_v1`;
}

function findPromptTemplate(
  modelConfig: ModelConfigSummaryDto,
  promptTemplates: PromptTemplateSummaryDto[],
): PromptTemplateSummaryDto | null {
  return (
    promptTemplates
      .filter(
        (promptTemplate) =>
          promptTemplate.aiFuncType === modelConfig.aiFuncType &&
          promptTemplate.isActive &&
          promptTemplate.status === "active",
      )
      .sort((left, right) => right.version - left.version)[0] ?? null
  );
}

export function createPersistedModelConfigRuntimeCatalog(
  input: PersistedModelConfigRuntimeCatalogInput,
): ModelConfigRuntimeCatalog {
  return {
    records: input.modelConfigs.map((modelConfig) => {
      const aiFuncType = toRuntimeAiFuncType(modelConfig.aiFuncType);
      const promptTemplate = findPromptTemplate(
        modelConfig,
        input.promptTemplates,
      );
      const promptTemplateKey =
        promptTemplate?.promptTemplateKey ??
        toDefaultPromptTemplateKey(aiFuncType);
      const promptTemplateVersion = promptTemplate?.version ?? 1;

      return {
        modelConfigSnapshot: createModelConfigSnapshot({
          providerPublicId: modelConfig.providerPublicId,
          providerKey: modelConfig.providerKey,
          providerDisplayName: modelConfig.providerDisplayName,
          modelConfigPublicId: modelConfig.publicId,
          aiFuncType,
          modelName: modelConfig.modelName,
          displayName: modelConfig.displayName,
          configVersion: modelConfig.configVersion,
          pricingVersion: modelConfig.pricingVersion,
          inputTokenPriceCnyPerMillion:
            modelConfig.inputTokenPriceCnyPerMillion,
          outputTokenPriceCnyPerMillion:
            modelConfig.outputTokenPriceCnyPerMillion,
          timeoutSecond: modelConfig.timeoutSecond,
          maxRetryCount: modelConfig.maxRetryCount,
          fallbackModelConfigPublicId: modelConfig.fallbackModelConfigPublicId,
          promptTemplateKey,
          promptTemplateVersion,
        }),
        promptTemplate: {
          promptTemplateKey,
          version: promptTemplateVersion,
          templateHash:
            promptTemplate?.bodyDigest ?? `${promptTemplateKey}_baseline`,
        },
        isEnabled: modelConfig.isEnabled && modelConfig.status === "enabled",
        priority: modelConfig.fallbackPriority,
        executionMode: "governed_provider",
      };
    }),
  };
}

export function attachModelConfigRuntimeAlignment(
  input: PersistedModelConfigRuntimeCatalogInput,
): ModelConfigSummaryDto[] {
  const catalog = createPersistedModelConfigRuntimeCatalog(input);
  const resolver = createModelConfigRuntimeResolver(catalog);
  const alignmentByAiFuncType = new Map<
    AdminAiFunctionType,
    ModelConfigRuntimeAlignmentDto
  >();

  for (const modelConfig of input.modelConfigs) {
    if (alignmentByAiFuncType.has(modelConfig.aiFuncType)) {
      continue;
    }

    const selection = resolver.resolve({
      aiFuncType: toRuntimeAiFuncType(modelConfig.aiFuncType),
      allowFallback: true,
    });

    alignmentByAiFuncType.set(
      modelConfig.aiFuncType,
      selection.status === "selected"
        ? {
            isRuntimeSelected: false,
            selectionReason: selection.selectionReason,
            selectedModelConfigPublicId:
              selection.modelConfigSnapshot.modelConfigPublicId,
            fallbackFromModelConfigPublicId:
              selection.fallbackFromModelConfigPublicId,
            unavailableReason: null,
            promptTemplateKey: selection.promptTemplate.promptTemplateKey,
            promptTemplateVersion: selection.promptTemplate.version,
            providerMode: selection.executionMode,
          }
        : {
            isRuntimeSelected: false,
            selectionReason: null,
            selectedModelConfigPublicId: null,
            fallbackFromModelConfigPublicId: null,
            unavailableReason: selection.reason,
            promptTemplateKey: null,
            promptTemplateVersion: null,
            providerMode: "governed_provider",
          },
    );
  }

  return input.modelConfigs.map((modelConfig) => {
    const runtimeAlignment = alignmentByAiFuncType.get(modelConfig.aiFuncType);

    if (runtimeAlignment === undefined) {
      return {
        ...modelConfig,
        runtimeAlignment: null,
      };
    }

    return {
      ...modelConfig,
      runtimeAlignment: {
        ...runtimeAlignment,
        isRuntimeSelected:
          runtimeAlignment.selectedModelConfigPublicId === modelConfig.publicId,
      },
    };
  });
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
      promptTemplateKey: "ai_scoring_v1",
      promptTemplateHash: "ai_scoring_v1_baseline",
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
      promptTemplateKey: "ai_scoring_v1",
      promptTemplateHash: "ai_scoring_v1_baseline",
      isEnabled: false,
      priority: 20,
    }),
    createLocalRecord({
      modelConfigPublicId: "model-config-dev-ai-explanation",
      aiFuncType: "explanation",
      modelName: "mock-ai-explanation",
      displayName: "Local mock explanation",
      fallbackModelConfigPublicId: "model-config-dev-ai-explanation-fallback",
      promptTemplateKey: "ai_explanation_v1",
      promptTemplateHash: "ai_explanation_v1_baseline",
      isEnabled: true,
      priority: 10,
    }),
    createLocalRecord({
      modelConfigPublicId: "model-config-dev-ai-explanation-fallback",
      aiFuncType: "explanation",
      modelName: "mock-ai-explanation-fallback",
      displayName: "Local mock explanation fallback",
      fallbackModelConfigPublicId: null,
      promptTemplateKey: "ai_explanation_v1",
      promptTemplateHash: "ai_explanation_v1_baseline",
      isEnabled: true,
      priority: 20,
    }),
    createLocalRecord({
      modelConfigPublicId: "model-config-dev-ai-hint",
      aiFuncType: "hint",
      modelName: "mock-ai-hint",
      displayName: "Local mock hint",
      fallbackModelConfigPublicId: null,
      promptTemplateKey: "ai_hint_v1",
      promptTemplateHash: "ai_hint_v1_baseline",
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
      promptTemplateKey: "kn_recommendation_v1",
      promptTemplateHash: "kn_recommendation_v1_baseline",
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
      promptTemplateKey: "learning_suggestion_v1",
      promptTemplateHash: "learning_suggestion_v1_baseline",
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
      promptTemplateKey: "learning_suggestion_v1",
      promptTemplateHash: "learning_suggestion_v1_baseline",
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
    redactedModelConfigMetadata: createRedactedModelConfigRuntimeSnapshot(
      record.modelConfigSnapshot,
      record.executionMode,
    ),
    promptTemplate: record.promptTemplate,
    executionMode: record.executionMode,
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

      if (
        primaryRecord.executionMode === "local_fixture" &&
        input.allowFixture !== true
      ) {
        return {
          status: "unavailable",
          reason: "fixture_not_allowed",
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

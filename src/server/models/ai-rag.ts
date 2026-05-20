import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import {
  aiFuncTypeValues,
  modelConfig,
  modelProvider,
  promptTemplate,
} from "@/db/schema/ai-rag";

export { aiFuncTypeValues };

export type AiFuncType = (typeof aiFuncTypeValues)[number];

export type ModelProviderRow = InferSelectModel<typeof modelProvider>;
export type NewModelProviderRow = InferInsertModel<typeof modelProvider>;

export type ModelConfigRow = InferSelectModel<typeof modelConfig>;
export type NewModelConfigRow = InferInsertModel<typeof modelConfig>;

export type PromptTemplateRow = InferSelectModel<typeof promptTemplate>;
export type NewPromptTemplateRow = InferInsertModel<typeof promptTemplate>;

export type ModelConfigSnapshotInput = {
  providerPublicId: string;
  providerKey: string;
  providerDisplayName: string;
  modelConfigPublicId: string;
  aiFuncType: AiFuncType;
  modelName: string;
  displayName: string;
  configVersion: number;
  timeoutSecond: number;
  maxRetryCount: number;
  fallbackModelConfigPublicId: string | null;
  promptTemplateKey: string;
  promptTemplateVersion: number;
};

export type ModelConfigSnapshot = ModelConfigSnapshotInput;

export function createModelConfigSnapshot(
  input: ModelConfigSnapshotInput,
): ModelConfigSnapshot {
  return {
    providerPublicId: input.providerPublicId,
    providerKey: input.providerKey,
    providerDisplayName: input.providerDisplayName,
    modelConfigPublicId: input.modelConfigPublicId,
    aiFuncType: input.aiFuncType,
    modelName: input.modelName,
    displayName: input.displayName,
    configVersion: input.configVersion,
    timeoutSecond: input.timeoutSecond,
    maxRetryCount: input.maxRetryCount,
    fallbackModelConfigPublicId: input.fallbackModelConfigPublicId,
    promptTemplateKey: input.promptTemplateKey,
    promptTemplateVersion: input.promptTemplateVersion,
  };
}

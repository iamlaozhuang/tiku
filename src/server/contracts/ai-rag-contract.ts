import type { AiFuncType, ModelConfigSnapshot } from "../models/ai-rag";

export type ModelProviderDto = {
  publicId: string;
  providerKey: string;
  displayName: string;
  apiKeyLastFour: string | null;
  baseUrl: string | null;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ModelConfigDto = {
  publicId: string;
  modelProviderPublicId: string;
  aiFuncType: AiFuncType;
  modelName: string;
  displayName: string;
  configVersion: number;
  isEnabled: boolean;
  timeoutSecond: number;
  maxRetryCount: number;
  fallbackModelConfigPublicId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PromptTemplateDto = {
  publicId: string;
  promptTemplateKey: string;
  aiFuncType: AiFuncType;
  version: number;
  templateContent: string;
  templateHash: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ModelConfigResultDto = {
  modelConfig: ModelConfigDto;
};

export type ModelProviderResultDto = {
  modelProvider: ModelProviderDto;
};

export type PromptTemplateResultDto = {
  promptTemplate: PromptTemplateDto;
};

export type ModelConfigSnapshotDto = ModelConfigSnapshot;

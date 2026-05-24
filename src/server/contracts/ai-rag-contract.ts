import type {
  AiCallStatus,
  AiFuncType,
  EvidenceStatus,
  KnStatus,
  ModelConfigSnapshot,
  Profession,
  RedactedJsonObject,
  ResourceStatus,
  ResourceType,
} from "../models/ai-rag";

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

export type AiCallLogDto = {
  publicId: string;
  userPublicId: string | null;
  answerRecordPublicId: string | null;
  mockExamPublicId: string | null;
  questionPublicId: string | null;
  aiFuncType: AiFuncType;
  callStatus: AiCallStatus;
  modelConfigSnapshot: ModelConfigSnapshotDto;
  promptTemplateKey: string;
  promptTemplateVersion: number;
  requestRedactedSnapshot: RedactedJsonObject;
  responseRedactedSnapshot: RedactedJsonObject | null;
  errorRedactedSnapshot: RedactedJsonObject | null;
  citationRedactedSnapshot: RedactedJsonObject | null;
  promptTokenCount: number | null;
  completionTokenCount: number | null;
  totalTokenCount: number | null;
  latencyMs: number | null;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
};

export type AiCallLogResultDto = {
  aiCallLog: AiCallLogDto;
};

export type KnowledgeBaseDto = {
  publicId: string;
  profession: Profession;
  displayName: string;
  description: string | null;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ResourceDto = {
  publicId: string;
  knowledgeBasePublicId: string;
  resourceType: ResourceType;
  resourceStatus: ResourceStatus;
  title: string;
  originalFileName: string | null;
  objectStoragePath: string | null;
  contentHash: string | null;
  fileSizeByte: number | null;
  profession: Profession;
  level: number | null;
  markdownContentHash: string | null;
  conversionErrorMessage: string | null;
  indexingErrorMessage: string | null;
  isVectorStale: boolean;
  publishedAt: string | null;
  disabledAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type KnowledgeNodeDto = {
  publicId: string;
  knowledgeBasePublicId: string;
  parentKnowledgeNodePublicId: string | null;
  profession: Profession;
  levelList: number[];
  name: string;
  pathName: string;
  depth: number;
  sortOrder: number;
  knStatus: KnStatus;
  isRecommendable: boolean;
  createdAt: string;
  updatedAt: string;
  disabledAt: string | null;
};

export type KnowledgeBaseResultDto = {
  knowledgeBase: KnowledgeBaseDto;
};

export type ResourceResultDto = {
  resource: ResourceDto;
};

export type KnowledgeNodeResultDto = {
  knowledgeNode: KnowledgeNodeDto;
};

export type RagCitationDto = {
  chunkPublicId: string;
  resourcePublicId: string;
  resourceTitle: string;
  headingPath: string[];
  chunkIndex: number;
  chunkText: string;
  textHash: string;
  score: number;
};

export type RagCitationSourceDto = {
  chunkPublicId: string;
  resourcePublicId: string;
  resourceTitle: string;
  headingPath: string[];
  chunkIndex: number;
  score: number;
};

export type RagRetrievalEvidenceSummaryDto = {
  evidenceStatus: EvidenceStatus;
  citationCount: number;
  resourcePublicIds: string[];
  chunkPublicIds: string[];
  chunkIndexes: number[];
  textHashes: string[];
  queryHash: string;
  maxScore: number | null;
  retrievalMode: "fusion_sort";
};

export type RagRetrievalResultDto = {
  evidenceStatus: EvidenceStatus;
  citations: RagCitationDto[];
  evidenceSummary: RagRetrievalEvidenceSummaryDto;
};

export type ResourceVectorRebuildDto = {
  resourcePublicId: string;
  resourceStatus: ResourceStatus;
  chunkCount: number;
  evidenceSummary: {
    chunkCount: number;
    resourcePublicIds: string[];
    chunkIndexes: number[];
    textHashes: string[];
    totalCharLength: number;
    headingPaths: string[][];
  };
};

export type ResourceVectorRebuildResultDto = {
  resourceVector: ResourceVectorRebuildDto;
};

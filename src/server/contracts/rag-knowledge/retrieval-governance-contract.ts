import type { RagRetrievalMode } from "@/rag/retrieval";
import type { EvidenceStatus, Profession } from "@/server/models/ai-rag";

export const ragKnowledgeAiFunctionValues = [
  "ai_scoring",
  "ai_explanation",
  "ai_hint",
  "kn_recommendation",
] as const;

export type RagKnowledgeAiFunction =
  (typeof ragKnowledgeAiFunctionValues)[number];

export type RagKnowledgeRetrievalRequest = {
  aiFuncType: RagKnowledgeAiFunction;
  authorizedResourcePublicIds: string[];
  level: number | null;
  profession: Profession;
  query: string;
  retrievalMode?: RagRetrievalMode;
};

export type RagKnowledgeCitationSourceDto = {
  chunkPublicId: string;
  resourcePublicId: string;
  resourceTitle: string;
  headingPath: string[];
  displayPath: string;
  chunkIndex: number;
  textHash: string;
  isStale: boolean;
  score: number;
};

export type RagKnowledgeEvidenceSummaryDto = {
  evidenceStatus: EvidenceStatus;
  citationCount: number;
  resourcePublicIds: string[];
  chunkPublicIds: string[];
  chunkIndexes: number[];
  textHashes: string[];
  staleCitationCount: number;
  staleResourcePublicIds: string[];
  queryHash: string;
  maxScore: number | null;
  retrievalMode: RagRetrievalMode;
};

export type RagKnowledgeExecutionHandoff = {
  gate: "provider_vector_storage_execution";
  status: "blocked";
  reason: "fresh_approval_required";
  blockedCapabilities: [
    "vector_provider",
    "storage_file_access",
    "provider_model_request",
    "schema_migration",
    "quota_use",
  ];
};

export type RagKnowledgeRetrievalResultDto = {
  aiFuncType: RagKnowledgeAiFunction;
  evidenceStatus: EvidenceStatus;
  citations: RagKnowledgeCitationSourceDto[];
  evidenceSummary: RagKnowledgeEvidenceSummaryDto;
  executionHandoff: RagKnowledgeExecutionHandoff;
};

export type RagKnowledgeSuccessResponse<TData> = {
  code: "OK";
  message: "success";
  data: TData;
};

export type RagKnowledgeBadRequestResponse = {
  code: "BAD_REQUEST";
  message: string;
  data: {
    errorCode: string;
  };
};

export type RagKnowledgeApiResponse<TData> =
  | RagKnowledgeSuccessResponse<TData>
  | RagKnowledgeBadRequestResponse;
